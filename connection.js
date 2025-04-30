const mongoose = require('mongoose');


async function connectMongoDB(url) {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}


module.exports = connectMongoDB;

