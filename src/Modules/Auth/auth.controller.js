// Core
import { Router } from 'express';

// Auth handlers (sign up/in, profile, token refresh, email confirmation, social login)
import {
  confirmEmail,
  confirmOTPForgotPassword,
  getNewCredentials,
  requestOTPForgotPassword,
  resetPassword,
  signUpWithGmail,
  userSignIn,
  userSignInWithGmail,
  userSignUp,
} from './auth.service.js';

import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../Middlewares/auth.middleware.js';
import { tokenTypeEnum } from '../../Utils/Security/token.security.js';
import { validationMiddleware } from '../../Middlewares/validation.middleware.js';
import {
  confirmEmailSchema,
  confirmForgotPasswordOTPSchema,
  forgotPasswordSchema,
  gmailAuthSchema,
  resetPasswordSchema,
  userSignInSchema,
  userSignUpSchema,
} from './auth.validation.js';
import rateLimitConfig from '../../Utils/Rate Limit/rateLimit.js';

// Router instance
const authRouter = Router({ caseSensitive: true, strict: true });

// Auth routes

// POST /api/auth/signup - Register a new user
authRouter.post('/signup', validationMiddleware(userSignUpSchema), userSignUp);

// PATCH /api/auth/confirm - Confirm email address via OTP
authRouter.patch(
  '/confirm',
  validationMiddleware(confirmEmailSchema),
  rateLimitConfig({
    message: 'Too many OTP attempts. Please try again later.',
    limit: 5,
  }),
  confirmEmail
);

// POST /api/auth/signin - Login and get access/refresh tokens
authRouter.post('/signin', validationMiddleware(userSignInSchema), userSignIn);

// GET /api/auth/refresh-token - Issue new access/refresh tokens using refresh token
authRouter.get(
  '/refresh-token',
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  getNewCredentials
);

// POST /api/auth/forget-password - Initiate password reset process
authRouter.patch(
  '/forgot-password/request-otp',
  validationMiddleware(forgotPasswordSchema),
  requestOTPForgotPassword
);

// POST /api/auth/forgot-password - Initiate password reset process
authRouter.patch(
  '/forgot-password/confirm-otp',
  validationMiddleware(confirmForgotPasswordOTPSchema),
  rateLimitConfig({
    message: 'Too many OTP attempts. Please try again later.',
    limit: 5,
  }),
  confirmOTPForgotPassword
);

// POST /api/auth/reset-password - Reset password
authRouter.patch(
  '/forgot-password/reset-password',
  validationMiddleware(resetPasswordSchema),
  resetPassword
);

// POST /api/auth/signup/gmail - Sign up with Google OAuth
authRouter.post(
  '/signup/gmail',
  validationMiddleware(gmailAuthSchema),
  signUpWithGmail
);

// POST /api/auth/signin/gmail - Sign in with Google OAuth
authRouter.post(
  '/signin/gmail',
  validationMiddleware(gmailAuthSchema),
  userSignInWithGmail
);

export default authRouter;
