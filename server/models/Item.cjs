const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);