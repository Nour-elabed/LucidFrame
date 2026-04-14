/**
 * Compares Post / GeneratedImage / User.avatar URLs in MongoDB with files in ./uploads.
 * Run from backend folder: node scripts/verify-media.cjs
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function uploadBasename(url) {
  if (!url || typeof url !== 'string') return null;
  const i = url.indexOf('/uploads/');
  if (i === -1) return null;
  const rest = url.slice(i + '/uploads/'.length);
  return rest.split('?')[0] || null;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in backend/.env');
    process.exit(1);
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.error('uploads/ folder missing — create backend/uploads');
    process.exit(1);
  }

  const onDisk = new Set(fs.readdirSync(uploadsDir).filter((f) => f !== '.gitkeep'));

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const posts = await db.collection('posts').find({}).project({ imageUrl: 1 }).toArray();
  const gens = await db.collection('generatedimages').find({}).project({ imageUrl: 1 }).toArray();
  const users = await db.collection('users').find({}).project({ avatar: 1 }).toArray();

  const missing = [];
  const checked = new Set();

  function check(label, id, url) {
    const base = uploadBasename(url);
    if (!base) {
      if (url) missing.push({ label, id: String(id), url, reason: 'no /uploads/ path' });
      return;
    }
    checked.add(base);
    const full = path.join(uploadsDir, base);
    if (!fs.existsSync(full)) {
      missing.push({ label, id: String(id), url, reason: `file missing: ${base}` });
    }
  }

  for (const p of posts) check('Post', p._id, p.imageUrl);
  for (const g of gens) check('GeneratedImage', g._id, g.imageUrl);
  for (const u of users) check('User.avatar', u._id, u.avatar);

  const orphans = [...onDisk].filter((f) => !checked.has(f));

  console.log('\n── LucidFrame media check ──\n');
  console.log(`Uploads folder: ${uploadsDir}`);
  console.log(`Files on disk (excl. .gitkeep): ${onDisk.size}`);
  console.log(`Posts: ${posts.length}, GeneratedImages: ${gens.length}, Users with avatar ref: ${users.filter((u) => u.avatar).length}`);

  if (missing.length) {
    console.log(`\n❌ Missing on disk (${missing.length}):`);
    for (const m of missing) console.log(`  - [${m.label}] ${m.reason}\n    url: ${m.url}`);
  } else {
    console.log('\n✅ Every /uploads/ reference has a matching file on disk.');
  }

  if (orphans.length) {
    console.log(`\n⚠ Orphan files on disk (not referenced in DB, ${orphans.length}):`);
    orphans.slice(0, 50).forEach((f) => console.log(`  - ${f}`));
    if (orphans.length > 50) console.log(`  ... and ${orphans.length - 50} more`);
  }

  await mongoose.disconnect();
  process.exit(missing.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
