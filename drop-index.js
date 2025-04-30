const mongoose = require('mongoose');
require('dotenv').config();

async function dropUsernameIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Drop the username index from the users collection
    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Successfully dropped username_1 index');

    // Also check and drop any other problematic indexes
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropUsernameIndex(); 