const mongoose = require('mongoose');
const dns = require('dns');

// Force Google Public DNS to bypass institutional/college DNS blocks on MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB Runtime Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB Reconnected Successfully');
    });

  } catch (error) {
    console.error(`❌ MongoDB Initial Connection Error: ${error.message}`);
    // Don't exit immediately in development so the developer sees the error and can adjust .env
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
