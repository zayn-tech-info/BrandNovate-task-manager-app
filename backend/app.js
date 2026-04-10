const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const insightsRoutes = require('./routes/insights.routes');

const app = express();

const devBrowserOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const allowedCorsOrigins = () => {
  const fromEnv = String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const base = fromEnv.length ? fromEnv : ['http://localhost:5173'];
  return [...new Set([...base, ...devBrowserOrigins])];
};

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = allowedCorsOrigins();
      if (!origin) {
        return callback(null, true);
      }
      if (allowed.includes(origin)) {
        return callback(null, origin);
      }
      callback(null, false);
    }
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'The backend server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/insights', insightsRoutes);

module.exports = app;
