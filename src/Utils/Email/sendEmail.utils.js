import nodemailer from 'nodemailer';
import colors from 'colors';
export const sendEmail = async ({
  to = '',
  subject = '',
  html = '',
  text = '',
  attachments = [],
  cc = '',
  bcc = '',
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    cc,
    html,
    attachments,
    text,
    bcc,
  });
  console.log(colors.cyan('Message sent: %s'), info);
  return info;
};
export default sendEmail;
