const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Clear uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
  fs.readdirSync(uploadsDir).forEach(file => {
    const filePath = path.join(uploadsDir, file);
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${file}`);
  });
  console.log('Uploads directory cleared');
}

// Clear posts from database
async function clearPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucidframe');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    await db.collection('posts').deleteMany({});
    console.log('All posts deleted from database');
    
    await mongoose.connection.close();
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error clearing posts:', error);
    process.exit(1);
  }
}

clearPosts();
