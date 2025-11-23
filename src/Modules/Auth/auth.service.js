import mongoose from 'mongoose';
import User, { authSourceEnum, roleEnum } from '../../DB/Models/user.model.js';
import color from 'colors';
import {
  asymmetricEncrypt,
  decrypt,
  encrypt,
} from '../../Utils/Security/encryption.security.js';
import { compareSync, hashSync } from 'bcrypt';
import { customAlphabet } from 'nanoid';
import {
  asyncErrorHandler,
  successResponse,
} from '../../Utils/Response/response.js';
import {
  compareHash,
  hashPassword,
} from '../../Utils/Security/hash.security.js';
import {
  createAuthenticationTokenPair,
  createToken,
  getJwtSecretsBySignatureLevel,
  signatureLevelEnum,
} from '../../Utils/Security/token.security.js';
import { OAuth2Client } from 'google-auth-library';
import emailEmitter from '../../Utils/Events/email.event.js';
import { verifyEmailTemplate } from '../../Utils/Email/Templates/verifyEmailTemplate.js';
import { userSignInSchema, userSignUpSchema } from './auth.validation.js';
import { forgotPasswordTemplate } from '../../Utils/Email/Templates/forgotPasswordTemplate.js';
import { cookieConfig } from '../../Utils/Cookie/cookie.js';

const uniqueString = customAlphabet('1234567890', 5);

export const userSignUp = asyncErrorHandler(async (req, res, next) => {
  const { firstName, lastName, password, email, age, gender, phone } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { firstName, lastName }, { phone }],
  });

  if (user) {
    return next(new Error('User already exists', { cause: 409 }));
  }

  const hashedPassword = await hashPassword({
    plainText: password,
    saltRounds: process.env.SALT_ROUNDS,
  });

  const otp = uniqueString();

  const confirmEmailOtp = await hashPassword({
    plainText: otp,
    saltRounds: process.env.SALT_ROUNDS,
  });

  // OTP expires in 15 minutes
  const confirmEmailOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const newUser = await User.create(
    new User({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      age,
      gender,
      phone: await encrypt(phone),
      confirmEmailOtp,
      confirmEmailOtpExpiresAt,
    })
  );

  emailEmitter.emit('emailSent', {
    to: email,
    subject: 'Confirmation Email',
    html: verifyEmailTemplate({ firstName, otp }),
  });

  successResponse({
    res,
    data: { user: newUser },
    message: 'User registered successfully ',
    statusCode: 201,
  });
});

export const confirmEmail = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    isEmailConfirmed: { $eq: false },
    confirmEmailOtp: { $exists: true },
  });
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  // Check if OTP has expired
  if (
    user.confirmEmailOtpExpiresAt &&
    new Date() > user.confirmEmailOtpExpiresAt
  ) {
    return next(
      new Error('OTP has expired. Please request a new one.', { cause: 400 })
    );
  }

  const isOtpMatching = await compareHash({
    plainText: otp,
    hashedText: user.confirmEmailOtp,
  });
  if (!isOtpMatching) {
    return next(new Error('Invalid OTP', { cause: 400 }));
  }
  await User.updateOne(
    { _id: user._id },
    {
      isEmailConfirmed: true,
      emailConfirmedAt: new Date(),
      $unset: { confirmEmailOtp: true, confirmEmailOtpExpiresAt: true },
    }
  );
  successResponse({
    res,
    data: { user },
    message: 'Email confirmed successfully',
  });
});

export const userSignIn = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }
  const isPasswordMatching = await compareHash({
    plainText: password,
    hashedText: user.password,
  });
  if (!isPasswordMatching) {
    return next(new Error('Login failed', { cause: 401 }));
  }

  if (!user.isEmailConfirmed) {
    return next(new Error('Email not confirmed', { cause: 401 }));
  }

  if (user.deletedAt) {
    return next(new Error('User is deleted', { cause: 401 }));
  }

  const { accessToken, refreshToken } = await createAuthenticationTokenPair(
    user
  );

  cookieConfig({
    res,
    cookieName: 'refreshToken',
    cookieValue: refreshToken,
  });

  successResponse({
    res,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    },
    message: 'User signed in successfully',
  });
});

export const getNewCredentials = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  const { accessToken, refreshToken } = await createAuthenticationTokenPair(
    user
  );

  cookieConfig({
    res,
    cookieName: 'refreshToken',
    cookieValue: refreshToken,
  });

  return successResponse({
    res,
    data: {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    message: 'New credentials generated successfully',
  });
});

export const requestOTPForgotPassword = asyncErrorHandler(
  async (req, res, next) => {
    const { email } = req.body;
    console.log(color.green(email));
    const user = await User.findOne({
      email,
      provider: authSourceEnum.system,
      deletedAt: { $exists: false },
    });

    if (!user) {
      return next(new Error('User not found ', { cause: 404 }));
    }

    const otp = uniqueString();
    const hashedOtp = await hashPassword({
      plainText: otp,
      saltRounds: process.env.SALT_ROUNDS,
    });

    // OTP expires in 15 minutes
    user.forgotPasswordOtp = hashedOtp;
    user.forgotPasswordOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    emailEmitter.emit('emailSent', {
      to: email,
      subject: 'Password Reset',
      html: forgotPasswordTemplate({ firstName: user.firstName, otp }),
    });

    successResponse({
      res,
      message: 'OTP sent to your email',
      statusCode: 200,
    });
  }
);

export const confirmOTPForgotPassword = asyncErrorHandler(
  async (req, res, next) => {
    const { email } = req.body;
    const { otp } = req.body;
    const user = await User.findOne({
      email,
      forgotPasswordOtp: { $exists: true },
    });
    if (!user) {
      return next(new Error('User not found', { cause: 404 }));
    }
    if (
      user.forgotPasswordOtpExpiresAt &&
      new Date() > user.forgotPasswordOtpExpiresAt
    ) {
      return next(
        new Error('OTP has expired. Please request a new one.', { cause: 400 })
      );
    }
    const isOtpMatching = await compareHash({
      plainText: otp,
      hashedText: user.forgotPasswordOtp,
    });
    if (!isOtpMatching) {
      return next(new Error('Invalid OTP', { cause: 400 }));
    }

    user.isForgotPasswordOtpConfirmed = true;
    user.forgotPasswordOtp = null;
    user.forgotPasswordOtpExpiresAt = null;
    await user.save();

    successResponse({
      res,
      message: 'OTP confirmed successfully',
    });
  }
);

export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return next(new Error('Passwords do not match', { cause: 400 }));
  }
  console.log(email);
  const user = await User.findOne({
    email,
    isForgotPasswordOtpConfirmed: true,
  });
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  let isSameAsOldPassword = false;
  for (const oldHashedPassword of user.oldPasswords) {
    isSameAsOldPassword ||= await compareHash({
      plainText: password,
      hashedText: oldHashedPassword,
    });
  }
  isSameAsOldPassword ||= await compareHash({
    plainText: password,
    hashedText: user.password,
  });
  if (isSameAsOldPassword) {
    return next(
      new Error('New password cannot be the same as any of the old passwords', {
        cause: 400,
      })
    );
  }
  const hashedText = await hashPassword({
    plainText: password,
    saltRounds: process.env.SALT_ROUNDS,
  });

  user.password = hashedText;
  user.isForgotPasswordOtpConfirmed = false;
  user.forgotPasswordOtp = null;
  user.forgotPasswordOtpExpiresAt = null;
  user.changeCredentialsAt = new Date();
  user.oldPasswords.push(hashedText);
  await user.save();

  successResponse({
    res,
    message:
      'Password reset successfully. Please login with your new password.',
    statusCode: 200,
  });
});

async function verifyGoogleAccount({ idToken } = {}) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.WEB_CLIENT_ID.split(','),
  });
  const payload = ticket.getPayload();
  console.log(payload);
  return payload;
}

export const signUpWithGmail = asyncErrorHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { picture, name, email, email_verified } = await verifyGoogleAccount({
    idToken,
  });
  console.log(email_verified);
  if (!email_verified) {
    return next(new Error('Email not verified by Google', { cause: 400 }));
  }
  const user = await User.findOne({ email });
  if (user) {
    if (user.provider === authSourceEnum.google) {
      return userSignInWithGmail(req, res, next);
    }

    return next(new Error('User already exists', { cause: 409 }));
  }

  const newUser = await User.create({
    firstName: name,
    lastName: '',
    email,
    photo: {
      secure_url: picture,
      public_id: '',
    },
    provider: authSourceEnum.google,
    isEmailConfirmed: true,
    emailConfirmedAt: new Date(),
  });
  
  const { accessToken, refreshToken } = await createAuthenticationTokenPair(
    newUser
  );

  cookieConfig({
    res,
    cookieName: 'refreshToken',
    cookieValue: refreshToken,
  });

  successResponse({
    res,
    data: { user: newUser, accessToken, refreshToken },
    message: 'User registered successfully with Google',
    statusCode: 201,
  });
});

export const userSignInWithGmail = asyncErrorHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified } = await verifyGoogleAccount({
    idToken,
  });

  if (!email_verified) {
    return next(new Error('Email not verified by Google', { cause: 400 }));
  }
  const user = await User.findOne({ email, provider: authSourceEnum.google });
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  const { accessToken, refreshToken } = await createAuthenticationTokenPair(
    user
  );

  cookieConfig({
    res,
    cookieName: 'refreshToken',
    cookieValue: refreshToken,
  });

  successResponse({
    res,
    data: {
      user,
      accessToken,
      refreshToken,
    },
    message: 'User signed in successfully with Google',
  });
});
