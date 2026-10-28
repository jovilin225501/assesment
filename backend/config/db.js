/**
 * MongoDB Atlas Connection Configuration
 */
const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;
