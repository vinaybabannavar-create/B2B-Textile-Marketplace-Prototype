const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'memory_db.json');

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

// Load memory DB from file if it exists
if (fs.existsSync(dbPath)) {
  try {
    const savedData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    Object.assign(memoryDB, savedData);
    console.log('📦 Loaded existing database state from memory_db.json');
  } catch (err) {
    console.warn('⚠️ Could not load memory_db.json, starting fresh');
  }
}

const saveMemoryDB = () => {
  if (isMongoConnected) return;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(memoryDB, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist database state to file:', err.message);
  }
};

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
  saveMemoryDB,
  generateId
};
