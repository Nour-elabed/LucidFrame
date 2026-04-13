const mongoose = require('mongoose');
require('dotenv').config();

async function clearDuplicatePosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucidframe');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Clear all posts to remove duplicates
    const postsResult = await db.collection('posts').deleteMany({});
    console.log(`Deleted ${postsResult.deletedCount} posts from feed`);
    
    // Also clear generated images to start fresh
    const generatedResult = await db.collection('generatedimages').deleteMany({});
    console.log(`Deleted ${generatedResult.deletedCount} generated images`);
    
    // Clear comments as well
    const commentsResult = await db.collection('comments').deleteMany({});
    console.log(`Deleted ${commentsResult.deletedCount} comments`);
    
    await mongoose.connection.close();
    console.log('All duplicate posts cleared successfully');
  } catch (error) {
    console.error('Error clearing posts:', error);
    process.exit(1);
  }
}

clearDuplicatePosts();
