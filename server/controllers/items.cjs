
const Item = require('../models/Item.cjs');

exports.searchItems = async (req, res) => {
  try {
    const { searchQuery } = req.body;

    // Immediate response for short queries
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const results = await Item.find(
      {
        itemName: { $regex: new RegExp(searchQuery.trim(), 'i') },
      },
      {
        itemName: 1,
        amount: 1,
        _id: 1
      }
    ).limit(10);

    // Simulate delay for demo purposes (remove in production)
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      success: true,
      data: results.map(item => ({
        id: item._id,
        itemName: item.itemName,
        amount: item.amount
      }))
    });

  } catch (error) {
    console.error('Item search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during item search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { itemName, amount } = req.body;
    
    const newItem = new Item({
      itemName,
      amount: parseFloat(amount)
    });

    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      data: {
        _id: savedItem._id,
        itemName: savedItem.itemName,
        amount: savedItem.amount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};