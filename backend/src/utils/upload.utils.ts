import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import type { Request } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png',
    'image/gif', 'image/webp', 'application/octet-stream',
  ];
  const extOk = allowedExtensions.test(file.originalname);
  const mimeOk = allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/');

  if (extOk && mimeOk) cb(null, true);
  else cb(new Error(`Only image files are allowed. Got: ${file.mimetype}`));
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter,
});

export const uploadToCloudinary = (
  buffer: Buffer,
  originalname: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'lucidframe', resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};