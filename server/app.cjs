const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.cjs');
const errorHandler = require('./utils/errorHandler.cjs');

// Route imports
const authRoutes = require('./routes/auth.cjs');
const itemRoutes = require('./routes/items.cjs');
const invoiceRoutes = require('./routes/invoices.cjs');
const clientRoutes = require('./routes/clients.cjs');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;