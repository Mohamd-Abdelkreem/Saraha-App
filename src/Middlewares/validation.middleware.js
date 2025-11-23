import joi from 'joi';
import { asyncErrorHandler } from '../Utils/Response/response.js';
import mongoose from 'mongoose';
import { logoutEnum } from '../Utils/Security/token.security.js';

export const generalFields = {
  firstName: joi.string().required(),
  lastName: joi.string().min(2).max(30).required(),
  fullName: joi
    .string()
    .pattern(new RegExp(/^[A-Z][a-z]{1,19}\s{1}[A-Z][a-z]{1,19}$/))
    .required(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .lowercase()
    .required(),
  password: joi.string().min(6),
  confirmPassword: joi
    .string()
    .valid(joi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' }),
  age: joi.number().integer().positive().min(13).max(120),
  phone: joi.string(),
  gender: joi.string().valid('male', 'female'),
  role: joi.string().valid('user', 'admin'),
  confirmEmailOtp: joi.string(),
  isEmailConfirmed: joi.boolean(),
  emailConfirmedAt: joi.date(),
  photo: joi.string(),
  provider: joi.string().valid('system', 'google'),
  lang: joi.string().valid('en', 'es', 'ar'),
  otp: joi.string().length(5).required(),
  idToken: joi.string().required(),
  id: joi.custom((value, helpers) => {
    return mongoose.isValidObjectId(value) || helpers.error('any.invalid');
  }),
  flag: joi
    .string()
    .valid(...Object.values(logoutEnum))
    .default(logoutEnum.stayLoggedIn),
};

export const validationMiddleware = (schema) => {
  return asyncErrorHandler(async (req, res, next) => {
    // Schema is an object with keys for different request parts (body, query, params, headers)
    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key]);
      if (error) {
        const errorMessages = error.details
          .map((detail) => detail.message)
          .join(', ');
        return next(
          new Error(`Validation error in ${key}: ${errorMessages}`, {
            cause: 400,
          })
        );
      }
    }

    next();
  });
};
