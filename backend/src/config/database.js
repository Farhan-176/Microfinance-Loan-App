const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options - they have no effect since MongoDB Driver v4.0.0
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MONGODB_URI environment variable');
    console.error('Make sure your MongoDB Atlas cluster is accessible and the connection string is correct');
    process.exit(1);
  }
};

module.exports = connectDB;
