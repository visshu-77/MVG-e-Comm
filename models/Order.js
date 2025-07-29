const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedVariants: {
    size: String,
    color: String
  },
  sku: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  orderItems: [orderItemSchema],

  shippingAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: { type: String, required: true },
    city:   { type: String, required: true },
    state:  { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'United States' },
    phone: String
  },

  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'cod']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },

  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  // ✅ Platform fee that admin earns from this order
  platformFee: {
    type: Number,
    required: true,
    default: 0.0
  },

  // ✅ Seller's earning (credited after customer confirms)
  sellerEarnings: {
    type: Number,
    required: true,
    default: 0.0
  },

  // ✅ Whether customer has confirmed receiving the product
  isConfirmedByCustomer: {
    type: Boolean,
    default: false
  },

  // ✅ Whether earnings already credited to seller’s wallet
  isSellerPaid: {
    type: Boolean,
    default: false
  },

  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingStatus: {
    type: String,
    required: true,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  },

  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  deliveredAt: Date,

  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  notes: String,

  commission: {
    type: Number,
    default: 0 // optional if platformFee is already set
  }

}, { timestamps: true });

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: today }
    });

    this.orderNumber = `ORD${year}${month}${day}${(orderCount + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for summary
orderSchema.virtual('orderSummary').get(function () {
  return {
    totalItems: this.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: this.totalPrice,
    status: this.orderStatus
  };
});

// Serialize virtuals
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
