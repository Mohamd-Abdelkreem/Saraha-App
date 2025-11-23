import mongoose from 'mongoose';
import User, { roleEnum } from '../../DB/Models/user.model.js';
import {
  asymmetricDecrypt,
  decrypt,
  encrypt,
} from '../../Utils/Security/encryption.security.js';
import {
  asyncErrorHandler,
  successResponse,
} from '../../Utils/Response/response.js';
import {
  compareHash,
  hashPassword,
} from '../../Utils/Security/hash.security.js';
import { TokenModel } from '../../DB/Models/token.model.js';
import { logoutEnum } from '../../Utils/Security/token.security.js';
import {
  cloud,
  deleteFolderInCloudinary,
  destroyArrayOfFilesInCloudinary,
  destroyFileInCloudinary,
  uploadArrayOfFilesInCloudinary,
  uploadFileInCloudinary,
} from '../../Utils/Multer/cloudinary.js';
import { uploadFile } from '../../Utils/Multer/local.multer.js';
import { populate } from 'dotenv';

export const logOut = asyncErrorHandler(async (req, res, next) => {
  const { flag } = req.body;
  let status = 200;
  if (flag == logoutEnum.signoutFromAll) {
    await User.updateOne(
      { _id: req.decoded.userId },
      {
        changeCredentialsAt: new Date(),
      }
    );
  } else if (flag == logoutEnum.signout) {
    await TokenModel.create({
      jti: req.decoded.jti,
      expiresAt: req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
      userId: req.decoded.userId,
    });
    status = 201;
  }
  successResponse({
    res,
    message: 'Logged out successfully',
    statusCode: status,
  });
});

export const userProfile = asyncErrorHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  if (!mongoose.isValidObjectId(userId)) {
    return next(new Error('Invalid user ID format', { cause: 400 }));
  }

  const user = await User.findById({
    _id: userId,
    populateL: [{ path: 'messages' }],
  });

  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }
  console.log(req.user);
  // Decrypt phone if needed
  const userProfile = {
    firtName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    age: user.age,
    gender: user.gender,
    phone: decrypt(user.phone),
    photo: user.photo,
    coverImages: user.coverImages,
  };

  successResponse({
    res,
    data: { user: userProfile },
    message: 'User profile retrieved successfully',
  });
});

export const shareProfile = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({
    _id: userId,
    role: roleEnum.user,
    isEmailConfirmed: true,
  });
  console.log(user);
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  successResponse({
    res,
    data: { user },
    message: 'User profile shared successfully',
  });
});

export const updateAccount = asyncErrorHandler(async (req, res, next) => {
  const { phone } = req.body;
  if (phone) {
    req.body.phone = await encrypt(phone);
  }
  const updatedUser = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $set: req.body },
    { new: true }
  );

  successResponse({
    res,
    data: { user: updatedUser },
    message: 'User account updated successfully',
  });
});

export const freezeAccount = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum.admin) {
    return next(
      new Error('Unauthorized to freeze this account', { cause: 403 })
    );
  }
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId || req.user._id,
      deletedAt: { $exists: false },
    },
    {
      deletedAt: new Date(),
      deletedBy: req.user._id,
      $unset: { restoredAt: 1, restoredBy: 1 },
      changeCredentialsAt: new Date(),
    },
    { new: true }
  );
  if (!updatedUser) {
    return next(new Error('User not found', { cause: 404 }));
  }

  successResponse({
    res,
    data: { user: updatedUser },
    message: 'User account frozen successfully',
  });
});

export const restoreAccount = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    {
      $unset: { deletedAt: 1, deletedBy: 1 },
      restoredAt: new Date(),
      restoredBy: req.user._id,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }

  successResponse({
    res,
    data: { user },
    message: 'User account restored successfully',
  });
});

export const deleteAccount = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.deleteOne({
    _id: userId,
    deletedAt: { $exists: true },
  });
  if (user.deletedCount === 0) {
    return next(new Error('User not found or not frozen', { cause: 404 }));
  }
  if (user?.photo?.public_id) {
    await deleteFolderInCloudinary({ folderPath: `users/${userId}` });
  }
  if (user?.coverImages?.length > 0) {
    const publicIds = user.coverImages.map((img) => img.public_id);
    await destroyArrayOfFilesInCloudinary({ publicIds });
  }

  successResponse({
    res,
    data: { user },
    message: 'User account deleted successfully',
  });
});

export const updateUserPassword = asyncErrorHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword, flag } = req.body;
  if (
    !(await compareHash({
      plainText: currentPassword,
      hashedText: req.user.password,
    }))
  ) {
    return next(new Error('Current password is incorrect', { cause: 400 }));
  }
  if (newPassword !== confirmPassword) {
    return next(
      new Error('New password and confirm password do not match', {
        cause: 400,
      })
    );
  }
  let updatedData = {},
    status = 200;
  if (flag == logoutEnum.signoutFromAll) {
    updatedData.changeCredentialsAt = new Date();
  } else if (flag == logoutEnum.signout) {
    const revokeToken = await TokenModel.create({
      jti: req.decoded.jti,
      expiresAt: req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
      userId: req.decoded.userId,
    });
    status = 201;
  }

  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      password: await hashPassword({ plainText: newPassword }),
      ...updatedData,
    },
    { new: true }
  );
  successResponse({
    res,
    data: { user },
    message: 'User password updated successfully',
  });
});

export const listAllUsers = asyncErrorHandler(async (req, res, next) => {
  let users = await User.find({ deletedAt: { $exists: false } });
  users = users.map((user) => {
    return {
      ...user._doc,
      phone: asymmetricDecrypt(user.phone),
    };
  });
  successResponse({
    res,
    data: { users },
    message: 'List of all users retrieved successfully',
  });
});

export const profileImageUpload = asyncErrorHandler(async (req, res, next) => {
  // if (!req.file) {
  //   return next(new Error('No file uploaded', { cause: 400 }));
  // }
  const { secure_url, public_id } = await uploadFileInCloudinary({
    file: req.file,
    path: `users/${req.user._id}`,
  });
  console.log(secure_url, public_id);

  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { photo: { secure_url, public_id } },
    { new: false }
  );
  if (user?.photo?.public_id) {
    await destroyFileInCloudinary({ publicId: user.photo.public_id });
  }

  successResponse({
    res,
    message: 'Profile image uploaded successfully',
    statusCode: 200,
    data: { user },
  });
});

export const profileCoverImagesUpload = asyncErrorHandler(
  async (req, res, next) => {
    const attachedFiles = await uploadArrayOfFilesInCloudinary({
      files: req.files,
      path: `users/${req.user._id}`,
    });
    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        coverImages: attachedFiles,
      },
      { new: false }
    );
    if (user?.coverImages?.length > 0) {
      const publicIds = user.coverImages.map((img) => img.public_id);
      console.log(publicIds);
      await destroyArrayOfFilesInCloudinary({ publicIds });
    }
    successResponse({
      res,
      message: 'Profile cover images uploaded successfully',
      statusCode: 200,
      data: { user },
    });
  }
);
