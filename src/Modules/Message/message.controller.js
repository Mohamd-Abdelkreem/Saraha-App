import { Router } from 'express';
import { cloudFileUpload } from '../../Utils/Multer/cloud.multer.js';
import { sendMessage } from './message.services.js';
import { validationMiddleware } from '../../Middlewares/validation.middleware.js';
import { sendMessageSchema } from './message.validation.js';
import { fileValidation } from '../../Utils/Multer/cloud.multer.js';
import { authenticationMiddleware } from '../../Middlewares/auth.middleware.js';

const messageRouter = Router({caseSensitive: true , strict: true});

messageRouter.post(
  '/:receiverId',
  cloudFileUpload({
    fileValidation: fileValidation.image,
  }).array('attachments'),
  validationMiddleware(sendMessageSchema),
  sendMessage
);

messageRouter.post(
  '/:receiverId/sender',
  authenticationMiddleware({}),
  cloudFileUpload({
    fileValidation: fileValidation.image,
  }).array('attachments'),
  validationMiddleware(sendMessageSchema),
  sendMessage
);

export default messageRouter