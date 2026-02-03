const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live-bidding';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    // In production, we want to exit if we can't connect to the database
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to MongoDB in production. Exiting...');
      process.exit(1);
    } else {
      console.log('Continuing without MongoDB in development mode...');
    }
  }
};

module.exports = connectDB;
