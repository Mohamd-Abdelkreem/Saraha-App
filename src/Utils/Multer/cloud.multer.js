import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { text } from 'stream/consumers';

export const fileValidation = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/x-m4v', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav'],
  text: ['text/plain'],
};

const defaultFileValidation = [
  ...fileValidation.image,
  ...fileValidation.pdf,
  ...fileValidation.video,
  ...fileValidation.audio,
  ...fileValidation.text,
];

export const cloudFileUpload = ({
  fileValidation: customFileValidation = defaultFileValidation,
} = {}) => {
  const fileValidationToUse = customFileValidation;

  const storage = multer.diskStorage({});

  const fileFilter = function (req, file, cb) {
    if (fileValidationToUse.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb('Invalid file type', false);
  };
  return multer({ dest: '/temp', fileFilter, storage });
};
