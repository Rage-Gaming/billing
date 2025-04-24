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
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
        // Add other searchable fields as needed
      ];
    }

    // Get users with pagination and field exclusion
    const users = await User.find(query)
      .select('-__v -createdAt -updatedAt -password') // Exclude sensitive/uneeded fields
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });

  } catch (error) {
    console.error('Search Users Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to search users'
    });
  }
};