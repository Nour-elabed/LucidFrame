const mongoose = require('mongoose');
require('dotenv').config();

async function clearDashboardData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucidframe');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Clear all generated images
    const generatedResult = await db.collection('generatedimages').deleteMany({});
    console.log(`Deleted ${generatedResult.deletedCount} generated images`);
    
    // Clear all posts (already done, but ensuring complete cleanup)
    const postsResult = await db.collection('posts').deleteMany({});
    console.log(`Deleted ${postsResult.deletedCount} posts`);
    
    // Clear all comments
    const commentsResult = await db.collection('comments').deleteMany({});
    console.log(`Deleted ${commentsResult.deletedCount} comments`);
    
    console.log('All dashboard data cleared');
    await mongoose.connection.close();
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error clearing dashboard data:', error);
    process.exit(1);
  }
}

clearDashboardData();
