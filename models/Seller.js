const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email']
  },
  pincode:{
    type:String,
    required : [false, "please provide the pincode"]
  },
  location : {
    lat:{
      type: Number,
      required: false
    },
    lng:{
      type: Number,
      required: false
    },
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalDate: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  payoutDetails: {
    accountType: {
      type: String,
      enum: ['bank', 'paypal', 'stripe'],
      default: 'bank'
    },
    accountNumber: String,
    routingNumber: String,
    accountHolderName: String,
    paypalEmail: String,
    stripeAccountId: String
  },
  commissionRate: {
    type: Number,
    default: 10, // 10% commission by default
    min: 0,
    max: 100
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
sellerSchema.index({ userId: 1 });
sellerSchema.index({ isApproved: 1 });
sellerSchema.index({ shopName: 'text' });

// Virtual for average rating
sellerSchema.virtual('averageRating').get(function() {
  return this.numReviews > 0 ? this.rating / this.numReviews : 0;
});

// Ensure virtual fields are serialized
sellerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Seller', sellerSchema); 