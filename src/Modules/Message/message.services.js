import { Message } from '../../DB/Models/message.model.js';
import User from '../../DB/Models/user.model.js';
import { uploadArrayOfFilesInCloudinary } from '../../Utils/Multer/cloudinary.js';
import { asyncErrorHandler, successResponse } from '../../Utils/Response/response.js';

export const sendMessage = asyncErrorHandler(async (req, res, next) => {
  if (!req.body || (!req.body.content && !req.files)) {
    return next(
      new Error('Message content or attachments are required', { cause: 400 })
    );
  }
  const { receiverId } = req.params;

  const user = await User.findOne({
    _id: receiverId,
    deletedAt: { $exists: false },
    isEmailConfirmed: true,
  });
  if (!user) {
    return next(new Error('Invalid Sender'), { cause: 404 });
  }

  const { content } = req.body;
  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = await uploadArrayOfFilesInCloudinary({
      files: req.files,
      path: `messages/${receiverId}`,
    });
  }
  const message = await Message.create({
    receiverId,
    content,
    attachments,
    senderId: req.user?._id,
  });

  return successResponse({
    res,
    data: { message },
    message: 'Message sent successfully',
  });
});
