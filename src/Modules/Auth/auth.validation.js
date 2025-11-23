import joi from 'joi';
import { generalFields } from '../../Middlewares/validation.middleware.js';

export const userSignInSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const userSignUpSchema = {
  body: userSignInSchema.body.append({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
    age: generalFields.age.required(),
    phone: generalFields.phone.required(),
    gender: generalFields.gender.required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};
export const gmailAuthSchema = {
  body: joi.object({
    idToken: generalFields.idToken.required(),
  }),
};

export const forgotPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const confirmForgotPasswordOTPSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
  }),
};
