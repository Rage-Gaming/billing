require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Item = require('./models/Item.cjs'); // Adjust the path as necessary

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {});

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Register User (For testing)
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// List Schema
const ItemSchema = new mongoose.Schema({
  name: String,
  rate: Number
});

app.post("/api/save/items", async (req, res) => {
  try {
    const { name, rate } = req.body;
    
    const newItem = new Item({ name, rate });
    await newItem.save();

    res.status(200).json({ message: "Item created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Search items
app.get('/api/items/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search term must be at least 2 characters' 
      });
    }

    const items = await Item.find({
      name: { $regex: q, $options: 'i' } // Case-insensitive regex search
    }).limit(10);

    res.json(items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Server error during search',
      details: error.message 
    });
  }
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));
