import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brewbuddy';

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB initial connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Handle reconnection — openUri on the existing connection object
mongoose.connection.on('disconnected', async () => {
  console.log('MongoDB disconnected — attempting reconnect...');
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brewbuddy';
    // Small delay before reconnecting
    await new Promise(resolve => setTimeout(resolve, 3000));
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 5000,
    });
    console.log('MongoDB reconnected successfully');
  } catch (error) {
    console.error('MongoDB reconnect failed — will retry on next heartbeat:', error);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

export default connectDB;
