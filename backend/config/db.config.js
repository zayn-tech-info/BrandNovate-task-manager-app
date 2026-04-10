const mongoose = require('mongoose');
const databaseUri = process.env.DATABASE_URI;

const connectToDatabase = async () => {
  if (!databaseUri) {
    throw new Error('DATABASE_URI is not set');
  }

  try {
    await mongoose.connect(databaseUri);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    if (error?.stack) console.error(error.stack);
    if (error?.code != null) console.error('Mongo error code:', error.code);
    process.exit(1);
  }

};

module.exports = connectToDatabase;