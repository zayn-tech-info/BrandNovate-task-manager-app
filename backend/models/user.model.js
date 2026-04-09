const mongoose = require('mongoose');

const usernameRegex = /^[a-zA-Z0-9._-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters.'],
      maxlength: [30, 'Username must be less than 30 characters.'],
      validate: {
        validator: (value) => usernameRegex.test(String(value || '')),
        message: 'Username can only contain letters, numbers, dot, underscore, and hyphen.'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => emailRegex.test(String(value || '').toLowerCase()),
        message: 'Please provide a valid email address.'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      maxlength: [30, 'Password must be less than 30 characters.'],
      validate: {
        validator: (value) => /\d/.test(String(value || '')) && /[A-Za-z]/.test(String(value || '')),
        message: 'Password must include at least one letter and one number.'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
