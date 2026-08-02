const mongoose = require('mongoose');

// In-memory store fallback when MongoDB is unavailable
const memoryDB = {
  users: [],
  buyerProfiles: [],
  supplierProfiles: [],
  products: [],
  carts: [],
  orders: [],
  chatLogs: []
};

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fabricmart';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully to:', mongoURI);
  } catch (err) {
    isMongoConnected = false;
    console.log('⚠️ MongoDB connection omitted. Operating seamlessly with In-Memory DB Store for Instant Prototype Execution.');
  }
};

const generateId = () => 'mem_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  memoryDB,
  generateId
};
