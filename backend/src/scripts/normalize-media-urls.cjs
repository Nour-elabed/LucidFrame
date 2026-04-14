/**
 * Rewrites imageUrl / avatar fields to local paths /uploads/<filename>
 * when they contain an old absolute URL (e.g. GitHub raw, old deployment).
 * Run from backend folder: node scripts/normalize-media-urls.cjs
 */
require('dotenv').config();
const mongoose = require('mongoose');

function toRelativeUploadUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/uploads/';
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i);
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  let updated = 0;

  async function fixCollection(collName, fields) {
    const coll = db.collection(collName);
    const docs = await coll.find({}).toArray();
    for (const doc of docs) {
      for (const field of fields) {
        const val = doc[field];
        if (!val || typeof val !== 'string') continue;
        if (val.startsWith('/uploads/')) continue;
        const rel = toRelativeUploadUrl(val);
        if (!rel) continue;
        await coll.updateOne({ _id: doc._id }, { $set: { [field]: rel } });
        console.log(`[${collName}] ${doc._id} ${field}:\n  was: ${val}\n  now: ${rel}`);
        updated++;
      }
    }
  }

  await fixCollection('posts', ['imageUrl']);
  await fixCollection('generatedimages', ['imageUrl']);
  await fixCollection('users', ['avatar']);

  await mongoose.disconnect();
  console.log(`\nDone. Updated ${updated} field(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
