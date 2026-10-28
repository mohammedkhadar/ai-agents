import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set — running without MongoDB connection (in-memory fallback)');
    return false;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message} — falling back to in-memory mode`);
    return false;
  }
};

export const isDBConnected = () => isConnected && mongoose.connection.readyState === 1;

export default connectDB;
