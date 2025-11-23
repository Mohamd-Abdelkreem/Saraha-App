// Core
import { Router } from 'express';

// User management handlers
import {
  deleteAccount,
  freezeAccount,
  listAllUsers,
  logOut,
  profileCoverImagesUpload,
  profileImageUpload,
  restoreAccount,
  shareProfile,
  updateAccount,
  updateUserPassword,
  userProfile,
} from './user.service.js';

import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../Middlewares/auth.middleware.js';
import {
  deleteAccountSchema,
  freezeAccountSchema,
  logoutSchema,
  profileCoverImagesSchema,
  restoreAccountSchema,
  sharedUserSchema,
  updateAccountSchema,
  updatePasswordSchema,
} from './user.validation.js';
import { validationMiddleware } from '../../Middlewares/validation.middleware.js';
import { endPoint } from './user.authorization.js';
import { fileValidation, uploadFile } from '../../Utils/Multer/local.multer.js';
import { cloudFileUpload } from '../../Utils/Multer/cloud.multer.js';

// Router instance
const userRouter = Router({ caseSensitive: true, strict: true });

userRouter.post(
  '/logout',
  validationMiddleware(logoutSchema),
  authenticationMiddleware({}),
  logOut
);

// User management routes

// GET /api/auth/profile - Get profile of the currently authenticated user
userRouter.get(
  '/profile',
  authenticationMiddleware({}),
  authorizationMiddleware({ accessRoles: endPoint.profile }),
  userProfile
);

// GET /api/user/profile/:userId - Share a user's profile by ID
userRouter.get(
  '/profile/:userId',
  validationMiddleware(sharedUserSchema),
  shareProfile
);

// Patch /api/user/:userId - Update an existing user by ID
userRouter.patch(
  '/update',
  authenticationMiddleware({}),
  validationMiddleware(updateAccountSchema),
  updateAccount
);

// Patch /api/user/freeze-account - Freeze the account of the currently authenticated user
userRouter.delete(
  '{/:userId}/freeze-account',
  authenticationMiddleware({}),
  validationMiddleware(freezeAccountSchema),
  freezeAccount
);

// Patch /api/user/restore-account - Restore the account of the currently authenticated user
userRouter.patch(
  '/:userId/restore-account',
  authenticationMiddleware({}),
  authorizationMiddleware({ accessRoles: endPoint.restoreAccount }),
  validationMiddleware(restoreAccountSchema),
  restoreAccount
);

// DELETE /api/user/:userId - Delete an existing user by ID
userRouter.delete(
  '/:userId',
  authenticationMiddleware({}),
  authorizationMiddleware({ accessRoles: endPoint.deleteAccount }),
  validationMiddleware(deleteAccountSchema),
  deleteAccount
);

// Patch /api/user/update-password - Update password of the currently authenticated user
userRouter.patch(
  '/update-password',
  authenticationMiddleware({}),
  validationMiddleware(updatePasswordSchema),
  updateUserPassword
);

// GET /api/users - List all users
userRouter.get('/list-users', authenticationMiddleware({}), listAllUsers);

// userRouter.patch(
//   '/profile-image',
//   authenticationMiddleware({}),
//   uploadFile({
//     customPath: 'users',
//     fileValidation: fileValidation.image,
//   }).single('image'),
//   profileImageUpload
// );

userRouter.patch(
  '/profile-image',
  authenticationMiddleware({}),
  cloudFileUpload({
    fileValidation: fileValidation.image,
  }).single('image'),
  profileImageUpload
);

userRouter.patch(
  '/profile-cover-images',
  authenticationMiddleware({}),
  cloudFileUpload({
    fileValidation: fileValidation.image,
  }).array('images'),
  validationMiddleware(profileCoverImagesSchema),
  profileCoverImagesUpload
);

export default userRouter;
