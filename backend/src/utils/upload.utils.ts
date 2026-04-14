import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

/** Multer file shape (avoids Express.Multer merge issues in some TS setups) */
type MulterIncomingFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
};

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: MulterIncomingFile, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: MulterIncomingFile, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: MulterIncomingFile,
  cb: multer.FileFilterCallback
) => {
  console.log('[Upload] File received:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // More permissive file checking - check both mimetype and extension
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'application/octet-stream' // Some browsers send this
  ];

  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|avif)$/i;
  const extOk = allowedExtensions.test(file.originalname);
  const mimeOk = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');

  if (extOk && mimeOk) {
    console.log('[Upload] File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('[Upload] File rejected:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extOk,
      mimeOk
    });
    cb(new Error(`Only image files are allowed (jpeg, jpg, png, gif, webp, avif). Got: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1
  },
  fileFilter,
});