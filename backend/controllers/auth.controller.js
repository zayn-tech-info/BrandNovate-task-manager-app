const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signAccessToken } = require('../utils/sendToken');

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const authResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  accessToken: signAccessToken(user._id)
});

const extractMongooseErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (error.code === 11000 && error.keyPattern?.email) {
    return 'Email already exists.';
  }
  if (error.name === 'ValidationError' && error.errors) {
    const first = Object.values(error.errors)[0];
    return first?.message || fallbackMessage;
  }
  return fallbackMessage;
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required.' });
    }

    if (String(username).trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }

    const pwd = String(password);
    if (pwd.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (pwd.length > 30) {
      return res.status(400).json({ message: 'Password must be at most 30 characters.' });
    }
    if (!/\d/.test(pwd) || !/[A-Za-z]/.test(pwd)) {
      return res.status(400).json({ message: 'Password must include at least one letter and one number.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: String(username).trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    return res.status(201).json(authResponse(user));
  } catch (error) {
    if (error.code === 11000 || error.name === 'ValidationError') {
      return res.status(400).json({ message: extractMongooseErrorMessage(error, 'Invalid registration data.') });
    }
    return res.status(500).json({ message: 'Failed to register user.' });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.status(200).json(authResponse(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sign in.' });
  }
};

module.exports = {
  signup,
  signin
};
