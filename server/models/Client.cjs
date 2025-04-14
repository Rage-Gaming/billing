const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  clientName: { type: String, required: [true, 'Client name is required'], trim: true, minlength: [2, 'Name must be at least 2 characters'], text: true },
  address: { type: String, trim: true, text: true },
  number: { type: String, required: [true, 'Client phone number is required'], trim: true, text: true, validate: { validator: (v) => /^\d{10}$/.test(v), message: (props) => `${props.value} must be a 10-digit number with no spaces or symbols!` } },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'production' });

ClientSchema.index({ name: 'text', address: 'text', contactNumber: 'text' }, { weights: { name: 3, address: 2, contactNumber: 1 }, name: 'client_text_search' });

ClientSchema.pre('save', async function(next) { if (!this.isNew) return next(); try { const lastClient = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } }); this.id = lastClient ? lastClient.id + 1 : 1; next(); } catch (err) { next(err); } });

ClientSchema.statics.search = async function(query) { return this.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(10); };

module.exports = mongoose.model('Client', ClientSchema);