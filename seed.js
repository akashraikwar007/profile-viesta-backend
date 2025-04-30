const mongoose = require('mongoose');
const User = require('./models/user');

const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    jobTitle: 'Developer',
    gender: 'Male'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    jobTitle: 'Designer',
    gender: 'Female'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/node-app-1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert sample users
    await User.insertMany(sampleUsers);
    console.log('Added sample users');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase(); 