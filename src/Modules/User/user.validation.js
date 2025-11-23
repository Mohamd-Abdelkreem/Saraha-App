import joi from 'joi';
import { generalFields } from '../../Middlewares/validation.middleware.js';
import { fileValidation } from '../../Utils/Multer/local.multer.js';
export const sharedUserSchema = {
  params: joi.object().keys({
    userId: generalFields.id.required(),
  }),
};

export const updateAccountSchema = {
  body: joi.object().keys({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    email: generalFields.email,
    age: generalFields.age,
    gender: generalFields.gender,
    phone: generalFields.phone,
  }),
};

export const freezeAccountSchema = {
  params: joi.object().keys({
    userId: generalFields.id,
  }),
};

export const restoreAccountSchema = {
  params: joi.object().keys({
    userId: generalFields.id.required(),
  }),
};

export const deleteAccountSchema = {
  params: joi.object().keys({
    userId: generalFields.id.required(),
  }),
};

export const updatePasswordSchema = {
  body: joi.object().keys({
    currentPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: generalFields.password
      .valid(joi.ref('newPassword'))
      .required(),
    flag: generalFields.flag,
  }),
};

export const logoutSchema = {
  body: joi.object().keys({
    flag: generalFields.flag,
  }),
};

export const profileCoverImagesSchema = {
  // multer's `.array('images')` sets `req.files` to an array of file objects
  files: joi
    .array()
    .items(
      joi.object().keys({
        fieldname: joi.string().valid('images').required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
          .string()
          .valid(...fileValidation.image)
          .required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().positive().required(),
        // finalPath: joi.string(),
      })
    )
    // limit number of uploaded files in the array
    .min(1)
    .max(2),
};
