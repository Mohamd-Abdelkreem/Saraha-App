import { v2 as cloudinary } from 'cloudinary';
export const cloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

export const uploadFileInCloudinary = async ({
  file = {},
  path = 'general',
} = {}) => {
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APPLICATION_NAME}/${path}`,
  });
};
export const uploadArrayOfFilesInCloudinary = async ({
  files = [],
  path = 'general',
} = {}) => {
  let attachedFiles = [];
  for (let file of files) {
    const { secure_url, public_id } = await uploadFileInCloudinary({
      file,
      path,
    });
    attachedFiles.push({ secure_url, public_id });
  }
  return attachedFiles;
};
export const destroyFileInCloudinary = async ({ publicId = '' } = {}) => {
  return await cloud().uploader.destroy(publicId);
};

export const destroyArrayOfFilesInCloudinary = async ({
  publicIds = [],
  options = { type: 'upload', resource_type: 'image' },
} = {}) => {
  return await cloud().api.delete_resources(publicIds, options);
};

export const deleteFolderInCloudinary = async ({ folderPath = '' } = {}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APPLICATION_NAME}/${folderPath}`
  );
};
