import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachments?.length === 0;
      },
      trim: true,
      minLength: 1,
      maxlength: 200000,
    },
    attachments: [{ secure_url: String, public_id: String }],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

messageSchema.virtual('messages', {
  localField: '_id',
  foreignField: 'receiverId',
  ref: 'Message',
});
export const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);
