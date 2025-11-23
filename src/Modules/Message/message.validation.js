import joi from 'joi';

export const sendMessageSchema = {
  params: joi.object().keys({
    receiverId: joi.string().required(),
  }),
  body: joi.object().keys({
    content: joi.string().min(1),
    attachments: joi.any(),
  }),
};
