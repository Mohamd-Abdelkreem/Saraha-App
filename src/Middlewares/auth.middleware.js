import { asyncErrorHandler } from '../Utils/Response/response.js';
import {
  extractAndVerifyToken,
  tokenTypeEnum,
} from '../Utils/Security/token.security.js';

export const authenticationMiddleware = ({
  tokenType = tokenTypeEnum.access,
}) => {
  return asyncErrorHandler(async (req, res, next) => {
    const { user, decoded: decodedPayload } = await extractAndVerifyToken({
      next,
      authorization: req.headers.authorization,
      tokenType,
    });

    req.user = user;
    req.decoded = decodedPayload;
    return next();
  });
};

export const authorizationMiddleware = ({ accessRoles = [] }) => {
  return asyncErrorHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error('Access denied', { cause: 403 }));
    } else {
      console.log('Access granted');
      return next();
    }
  });
};
