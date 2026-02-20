import mongoose from 'mongoose';

let connectionPromise = null;
let hasConnectionListeners = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf';

  if (!uri) {
    throw new Error('MONGO_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  if (!hasConnectionListeners) {
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (error) => {
      console.error(`MongoDB Error: ${error.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    hasConnectionListeners = true;
  }

  try {
    connectionPromise = mongoose.connect(uri, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000)
    });
    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
