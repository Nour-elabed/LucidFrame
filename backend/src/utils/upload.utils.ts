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
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
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