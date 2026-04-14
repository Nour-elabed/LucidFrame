import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { PostModel } from '../modules/posts/post.model';

// ── Config ────────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MONGO_URI = process.env.MONGODB_URI!;
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract filename from either:
 *  - http://localhost:5000/uploads/abc.jpg  (absolute)
 *  - /uploads/abc.jpg                       (relative)
 */
const extractFilename = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    // Handle relative paths like /uploads/filename.jpg
    const match = imageUrl.match(/\/uploads\/(.+)$/);
    return match ? match[1] : null;
  }
};

const isCloudinaryUrl = (url: string) =>
  url.includes('cloudinary.com') || url.includes('res.cloudinary');

// ── Main Migration ────────────────────────────────────────────────────────────
const migrate = async () => {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const posts = await PostModel.find({});
  console.log(`📦 Found ${posts.length} posts to process\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    const { imageUrl, _id } = post;

    // Skip already migrated
    if (isCloudinaryUrl(imageUrl)) {
      console.log(`⏭️  [${_id}] Already on Cloudinary, skipping`);
      skipped++;
      continue;
    }

    const filename = extractFilename(imageUrl);
    if (!filename) {
      console.log(`⚠️  [${_id}] Could not extract filename from: ${imageUrl}`);
      failed++;
      continue;
    }

    const localPath = path.join(LOCAL_UPLOADS_DIR, filename);
    if (!fs.existsSync(localPath)) {
      console.log(`❌ [${_id}] File not found locally: ${localPath}`);
      failed++;
      continue;
    }

    try {
      console.log(`⬆️  [${_id}] Uploading ${filename}...`);
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'lucidframe',
        public_id: path.parse(filename).name,
        overwrite: false,
        resource_type: 'image',
      });

      post.imageUrl = result.secure_url;
      await post.save();

      console.log(`✅ [${_id}] Saved: ${result.secure_url}`);
      migrated++;
    } catch (err: any) {
      console.error(`❌ [${_id}] Upload failed: ${err.message}`);
      failed++;
    }
  }

  console.log('\n── Migration Complete ──────────────────────────────');
  console.log(`✅ Migrated : ${migrated}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  console.log(`❌ Failed   : ${failed}`);

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration crashed:', err);
  process.exit(1);
});