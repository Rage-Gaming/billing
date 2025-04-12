const User = require('../models/User.cjs');
const jwt = require('jsonwebtoken');

// Helper function to create JWT token
const createToken = (userId, isAdmin) => {
  return jwt.sign(
    { id: userId, isAdmin }, 
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user (non-admin by default)
    const user = new User({ username, email, password });
    await user.save();

    // Create token
    const token = createToken(user._id, user.isAdmin);

    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken(user._id, user.isAdmin);

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};