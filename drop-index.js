const mongoose = require('mongoose');
require('dotenv').config();

async function dropUsernameIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Successfully dropped username_1 index');

    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropUsernameIndex(); 