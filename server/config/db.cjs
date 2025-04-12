require('dotenv').config();
require('colors');
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('✅ MongoDB connected successfully'.green);
  } catch (err) {
    console.error('❌ MongoDB connection error:'.red, err);
    process.exit(1);
  }
};

module.exports = connectDB;