import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const fileValidation = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  pdf: ['application/pdf'],
};
export const uploadFile = ({
  customPath = 'general',
  fileValidation = [],
} = {}) => {
  let basePath = `Uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = path.join(__dirname, '../../', basePath);
      const isCustomPathExists = fs.existsSync(fullPath);
      if (!isCustomPathExists) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      // avoid using `this` here and do not assign req.file manually
      const fileName =
        Date.now() + '__' + Math.random() + '__' + file.originalname;
      file.finalPath = basePath + '/' + fileName;

      cb(null, fileName);
    },
  });
  const fileFilter = function (req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb('Invalid file type', false);
  };
  return multer({ dest: '/temp', fileFilter, storage });
};
