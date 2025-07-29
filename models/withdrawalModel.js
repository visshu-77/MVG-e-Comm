const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming seller is a user with role: 'seller'
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal'],
    required: true
  },
  accountDetails: {
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    paypalEmail: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  adminNote: String
}, {
  timestamps: true
});

withdrawalSchema.index({ seller: 1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);