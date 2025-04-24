const User = require('../models/User.cjs');
const jwt = require('jsonwebtoken');

// Helper function to create JWT token
// const createToken = (userId, isAdmin) => {
//   return jwt.sign(
//     { id: userId, isAdmin }, 
//     process.env.JWT_SECRET,
//     { expiresIn: '1h' }
//   );
// };

exports.register = async (req, res) => {
  try {

    const { admin, username, email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user (non-admin by default)
    const user = new User({ admin, username, email, password });
    await user.save();

    res.status(201).json({ 
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
    console.log('Login attempt:', req.body); // Debugging line
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    console.log(isMatch)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.status(200).json({ 
      user: {
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    const users = await User.find({ username: { $regex: username, $options: 'i' } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
}