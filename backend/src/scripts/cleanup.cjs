const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucidframe')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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
