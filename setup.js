const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully');
} else {
    console.log('Uploads directory already exists');
}

// Create a test file to check write permissions
const testFile = path.join(uploadsDir, 'test.txt');
try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Write permissions are working correctly');
} catch (error) {
    console.error('Error checking write permissions:', error);
    console.error('Please make sure the uploads directory has write permissions');
}

console.log('Setup completed'); 