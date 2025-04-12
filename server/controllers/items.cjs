const Item = require('../models/Item.cjs');

exports.createItem = async (req, res) => {
  try {
    const { name, rate } = req.body;
    
    if (!name || !rate) {
      return res.status(400).json({ error: 'Name and rate are required' });
    }

    const newItem = new Item({ name, rate });
    await newItem.save();

    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search term must be at least 2 characters' 
      });
    }

    const items = await Item.find({
      name: { $regex: q, $options: 'i' }
    }).limit(10);

    res.json(items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Server error during search',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};