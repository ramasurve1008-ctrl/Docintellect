import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docintellect';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn('⚡ Using robust resilient local storage fallback for documents & auth.');
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;
