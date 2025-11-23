import jwt from 'jsonwebtoken';
import User, { roleEnum } from '../../DB/Models/user.model.js';
import { nanoid } from 'nanoid';
import { TokenModel } from '../../DB/Models/token.model.js';
import color from 'colors';
export const signatureLevelEnum = { Bearer: 'Bearer', System: 'System' };
export const tokenTypeEnum = { access: 'access', refresh: 'refresh' };
export const logoutEnum = {
  signoutFromAll: 'signoutFromAll',
  signout: 'signout',
  stayLoggedIn: 'stayLoggedIn',
};

export const createToken = ({
  payload,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE,
  expiresIn = '1h',
  signatureLevel = signatureLevelEnum.Bearer,
}) => {
  // Include signature level in the payload for verification
  const tokenPayload = { ...payload, signatureLevel };
  return jwt.sign(tokenPayload, secret, { expiresIn });
};

export const validateToken = ({
  token,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE,
}) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getJwtSecretsBySignatureLevel = ({
  signatureLevel = signatureLevelEnum.Bearer,
}) => {
  let secrets = { accessSignature: undefined, refreshSignature: undefined };
  if (signatureLevel === signatureLevelEnum.System) {
    secrets = {
      accessSignature: process.env.ACCESS_ADMIN_TOKEN_SIGNATURE,
      refreshSignature: process.env.REFRESH_ADMIN_TOKEN_SIGNATURE,
    };
  } else {
    secrets = {
      accessSignature: process.env.ACCESS_USER_TOKEN_SIGNATURE,
      refreshSignature: process.env.REFRESH_USER_TOKEN_SIGNATURE,
    };
  }
  return secrets;
};

export const extractAndVerifyToken = async ({
  next,
  tokenType = tokenTypeEnum.access,
  authorization = '',
} = {}) => {
  if (!authorization) {
    return next(new Error('No authorization header', { cause: 401 }));
  }

  const [bearerScheme, tokenValue] = authorization.split(' ') || [];

  if (!bearerScheme || !tokenValue) {
    return next(new Error('Invalid authorization scheme.', { cause: 401 }));
  }

  let decodedPayload;
  try {
    decodedPayload = jwt.decode(tokenValue);
  } catch (error) {
    return next(new Error('Invalid token format', { cause: 401 }));
  }

  if (!decodedPayload?.userId) {
    return next(new Error('Invalid token payload', { cause: 401 }));
  }

  const user = await User.findById(decodedPayload.userId);

  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  // ADD: Check user status
  if (user.deletedAt) {
    return next(new Error('User account is inactive', { cause: 401 }));
  }

  const expectedSignatureLevel =
    user.role === roleEnum.admin
      ? signatureLevelEnum.System
      : signatureLevelEnum.Bearer;

  if (bearerScheme !== expectedSignatureLevel) {
    return next(
      new Error('Invalid authorization scheme for user role.', { cause: 401 })
    );
  }

  const secrets = getJwtSecretsBySignatureLevel({
    signatureLevel: expectedSignatureLevel,
  });

  const verifiedPayload = validateToken({
    token: tokenValue,
    secret:
      tokenType === tokenTypeEnum.access
        ? secrets.accessSignature
        : secrets.refreshSignature,
  });

  if (!verifiedPayload) {
    return next(new Error('Invalid token signature', { cause: 401 }));
  }

  if (
    verifiedPayload.jti &&
    (await TokenModel.findOne({ jti: verifiedPayload.jti }))
  ) {
    return next(new Error('Token revoked', { cause: 401 }));
  }

  if (user.changeCredentialsAt?.getTime() > verifiedPayload.iat * 1000) {
    return next(
      new Error('Token invalidated by credential change', { cause: 401 })
    );
  }

  return { user, decoded: verifiedPayload };
};

export const createAuthenticationTokenPair = async (user) => {
  const authSignatureLevel =
    user.role === roleEnum.admin
      ? signatureLevelEnum.System
      : signatureLevelEnum.Bearer;

  const secrets = getJwtSecretsBySignatureLevel({
    signatureLevel: authSignatureLevel,
  });

  const tokenId = nanoid();

  const accessToken = createToken({
    payload: { userId: user._id, jti: tokenId },
    secret: secrets.accessSignature,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    signatureLevel: authSignatureLevel,
  });

  const refreshToken = createToken({
    payload: { userId: user._id, jti: tokenId },
    secret: secrets.refreshSignature,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    signatureLevel: authSignatureLevel,
  });
  return { accessToken, refreshToken };
};
/*

Token Existence: Verify refresh token is present in request (usually in cookies or body)
Token Format: Ensure token follows JWT format (header.payload.signature)
Token Signature: Verify signature matches your secret key (hasn't been tampered with)
Token Expiration: Check if refresh token hasn't expired
Token Type: Confirm token type is refresh (not access token)


User Exists: Verify the user from decoded token still exists in database
User Status: Check user is not deleted, banned, or deactivated
Token Stored: Verify refresh token matches the one stored in database (prevents token reuse attacks)
Device/IP Tracking (Optional): Match refresh token with stored device fingerprint/IP for extra security
*/
