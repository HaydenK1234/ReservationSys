const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'admin@restaurant.com' });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');
  } else {
    console.log('Admin already exists');
  }

  mongoose.disconnect();
};

seed();