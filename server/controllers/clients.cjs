const Client = require('../models/Client.cjs');

exports.searchClients = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = query.trim();
    
    const results = await Client.find(
      { $text: { $search: searchQuery } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Client search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during client search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.registerClient = async (req, res) => {
  try {
    console.log('Client registration request:', req.body);
    const { clientName, phone, address } = req.body;

    // Optimized validation
    const nameTrimmed = clientName?.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    // Early return if phone exists (optimized query)
    if (phone) {
      const existingClient = await Client.findOne({ phone }).select('_id').lean();
      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: 'Client with this phone already exists'
        });
      }
    }

    // Get the last client's ID to increment
    const lastClient = await Client.findOne()
      .sort({ id: -1 }) // Sort by id descending
      .select('id')
      .lean();

    const nextId = lastClient ? lastClient.id + 1 : 1;

    // Optimized client creation with auto-increment ID
    const clientData = {
      id: nextId, // Auto-incremented ID
      clientName: nameTrimmed,
      ...(phone && { phone: phone.trim() }),
      ...(address && { address: address.trim() }),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedClient = await Client.create(clientData);

    // Optimized response
    const responseData = {
      id: savedClient.id, // Return the auto-incremented ID
      clientName: savedClient.clientName,
      ...(savedClient.phone && { phone: savedClient.phone })
    };

    return res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Client registration error:', error);
    
    // Handle duplicate key error separately
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: error.message.includes('phone') 
          ? 'Client with this phone already exists'
          : 'Duplicate entry detected'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during client registration',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};