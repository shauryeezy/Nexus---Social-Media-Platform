const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialmedia';
    console.log(`[Database] Attempting connection to ${mongoUri}...`);
    
    // Set 4 second timeout for local/specified mongo connection
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed: ${err.message}`);
    console.log('[Database] Starting in-memory fallback MongoDB (MongoMemoryServer)...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] In-memory MongoDB connected successfully at ${uri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start fallback MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

