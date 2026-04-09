require('dotenv').config();

const app = require('./app');
const connectToDatabase = require('./config/db.config');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Add it to backend/.env');
  process.exit(1);
}

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Yay! Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Opps! Failed to start server, please try again:', error.message);
    process.exit(1);
  });
