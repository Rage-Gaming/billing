const express = require('express');
const cors = require('cors');
const path = require('path')
const connectDB = require('./config/db.cjs');
const errorHandler = require('./utils/errorHandler.cjs');
const bodyParser = require('body-parser');

// Route imports
const authRoutes = require('./routes/auth.cjs');
const itemRoutes = require('./routes/items.cjs');
const invoiceRoutes = require('./routes/invoices.cjs');
const clientRoutes = require('./routes/clients.cjs');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './build')));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);

app.get(`/:path`, function (req, res) {
  console.log('Serving index.html for path:', req.params.path);
  res.sendFile(path.join(__dirname, './build/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;