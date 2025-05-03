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
      {
        $or: [
          { clientName: { $regex: searchQuery, $options: 'i' } },
          { address: { $regex: searchQuery, $options: 'i' } }
        ]
      },
      {
        id: 1,
        clientName: 1,
        address: 1,
        number: 1
      }
    ).limit(10);

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
    const { clientName, number, address } = req.body;

    // Name validation
    const nameTrimmed = clientName?.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    // Phone validation (strict 10 digits only)
    if (number) {
      const phoneTrimmed = number.trim();
      
      if (!/^\d{10}$/.test(phoneTrimmed)) {
        return res.status(400).json({
          success: false,
          message: 'Phone must be exactly 10 digits with no spaces or symbols'
        });
      }
    }

    // Check for existing client (both name AND number) in a single query
    const existingClient = await Client.findOne({
      $or: [
        { clientName: nameTrimmed },
        ...(number ? [{ number: number.trim() }] : [])
      ]
    }).select('clientName number').lean();

    if (existingClient) {
      if (existingClient.clientName === nameTrimmed) {
        return res.status(409).json({
          success: false,
          message: 'Client with this name already exists'
        });
      }
      if (number && existingClient.number === number.trim()) {
        return res.status(409).json({
          success: false,
          message: 'Client with this number already exists'
        });
      }
    }

    // Auto-increment ID logic
    const lastClient = await Client.findOne()
      .sort({ id: -1 })
      .select('id')
      .lean();

    const nextId = lastClient ? lastClient.id + 1 : 1;

    // Client data preparation
    const clientData = {
      id: nextId,
      clientName: nameTrimmed,
      ...(number && { number: number.trim() }),
      ...(address && { address: address.trim() }),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedClient = await Client.create(clientData);

    // Response
    return res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: {
        id: savedClient.id,
        clientName: savedClient.clientName,
        ...(savedClient.number && { number: savedClient.number, address: savedClient.address })
      }
    });

  } catch (error) {
    console.error('Client registration error:', error);
    
    if (error.code === 11000) {
      const field = error.message.includes('number') ? 'number' : 'name';
      return res.status(409).json({
        success: false,
        message: `Client with this ${field} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during client registration',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};