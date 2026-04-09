const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

matchSchema.index({ users: 1 });

module.exports = mongoose.model('Match', matchSchema);