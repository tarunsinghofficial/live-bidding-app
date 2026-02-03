const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Determine role - make first admin user
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = new User({
      username,
      email,
      password,
      role,
      profile: { firstName, lastName }
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({
    message: 'User profile retrieved',
    user: req.user
  });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    req.user.profile = {
      ...req.user.profile,
      firstName,
      lastName,
      phone
    };
    
    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Profile update failed',
      error: error.message
    });
  }
});

module.exports = router;
