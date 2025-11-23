import EventEmitter from 'node:events';
import sendEmail from '../Email/sendEmail.utils.js';

const emailEmitter = new EventEmitter();

emailEmitter.on(
  'emailSent',
  async ({
    to = '',
    subject = '',
    html = '',
    text = '',
    cc = '',
    bcc = '',
    attachments = [],
  }) => {
    await sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
      cc,
      bcc,
    }).catch((error) => {
      console.error('Error sending email:', error);
      throw error;
    });
  }
);

emailEmitter.on(
  'sendForgetPassword',
  async ({ to = '', subject = '', html = '', text = '' }) => {
    await sendEmail({
      to,
      subject,
      html,
      text,
    }).catch((error) => {
      console.error('Error sending email:', error);
      throw error;
    });
  }
);

export default emailEmitter;
