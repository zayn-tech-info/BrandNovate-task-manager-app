const mongoose = require('mongoose');
const DATABASE_URI = process.env.DATABASE_URI;

const connectToDatabase = async () => {
  if (!DATABASE_URI) {
    throw new Error('DATABASE_URI is not set');
  }

  try {
    await mongoose.connect(DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database :', error.message);
    process.exit(1);
  }

};

module.exports = connectToDatabase;