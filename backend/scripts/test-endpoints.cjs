const fs = require('fs');
const path = require('path');

// Test if uploads directory exists and is writable
const testUploads = () => {
  const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/usr/src/app/uploads'  // Render's mount path
    : path.join(process.cwd(), 'uploads');
  
  console.log('Testing uploads directory:', uploadDir);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✓ Created uploads directory');
    } else {
      console.log('✓ Uploads directory exists');
    }
    
    // Test write permissions
    const testFile = path.join(uploadDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✓ Uploads directory is writable');
    
    return true;
  } catch (error) {
    console.error('✗ Uploads directory error:', error.message);
    return false;
  }
};

// Test environment variables
const testEnvVars = () => {
  console.log('Testing environment variables:');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
};

// Run tests
console.log('=== Backend Diagnostic Tests ===');
testUploads();
console.log('');
testEnvVars();
console.log('');
console.log('=== Test Complete ===');
