import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.NODE_ENV === 'production'
  ? '/usr/src/app/uploads'
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log('[Upload] mimetype:', file.mimetype, '| originalname:', file.originalname);

  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/octet-stream'];

  const extOk = allowedExtensions.test(file.originalname);
  const mimeOk = allowedMimes.includes(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    console.log('[Upload] Rejected — extOk:', extOk, '| mimeOk:', mimeOk);
    cb(new Error(`Only image files are allowed. Got mimetype: ${file.mimetype}, filename: ${file.originalname}`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});