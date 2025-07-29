const mongoose = require('mongoose');

// Review schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters']
  },
  images: [String],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Variant option schema
const variantOptionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  sku: {
    type: String,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    key: String,
    value: String
  }],
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Variant schema
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  options: [variantOptionSchema]
});

// Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },

  // ✅ New fields for fee logic
  platformFee: {
    type: Number,
    default: 0,
    min: [0, 'Platform fee cannot be negative']
  },
  displayPrice: {
    type: Number,
    default: 0,
    min: [0, 'Display price cannot be negative']
  },

  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Please provide a seller']
  },
  sku: {
    type: String
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  variants: [variantSchema],
  features: [String],
  specifications: [{
    key: String,
    value: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDiscover: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  isEventProduct: {
    type: Boolean,
    default: false
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
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  totalSold: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  shippingInfo: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isApproved: 1 });
productSchema.index({ sku: 1 });

// Virtuals
productSchema.virtual('averageRating').get(function () {
  return this.numReviews > 0 ? this.ratings / this.numReviews : 0;
});

productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.set('toJSON', { virtuals: true });

// Pre-save for approval date
productSchema.pre('save', function (next) {
  if (this.isModified('isApproved') && this.isApproved && !this.approvalDate) {
    this.approvalDate = new Date();
  }
  next();
});

// Custom methods
productSchema.methods.getVariantByCombination = function (variantCombination) {
  if (!this.variants || this.variants.length === 0) {
    return null;
  }

  for (const variant of this.variants) {
    for (const option of variant.options) {
      if (option.value === variantCombination[variant.name]) {
        return option;
      }
    }
  }
  return null;
};

productSchema.methods.getAvailableVariants = function () {
  if (!this.variants || this.variants.length === 0) return [];

  const combinations = [];
  const generateCombinations = (variants, current = {}, index = 0) => {
    if (index === variants.length) {
      combinations.push({ ...current });
      return;
    }
    const variant = variants[index];
    for (const option of variant.options) {
      if (option.isActive && option.stock > 0) {
        current[variant.name] = option.value;
        generateCombinations(variants, current, index + 1);
      }
    }
  };
  generateCombinations(this.variants);
  return combinations;
};

productSchema.methods.getTotalStock = function () {
  if (!this.variants || this.variants.length === 0) return this.stock;

  let totalStock = 0;
  for (const variant of this.variants) {
    for (const option of variant.options) {
      if (option.isActive) totalStock += option.stock;
    }
  }
  return totalStock;
};

productSchema.methods.getPriceRange = function () {
  if (!this.variants || this.variants.length === 0) {
    return { min: this.price, max: this.price };
  }

  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const variant of this.variants) {
    for (const option of variant.options) {
      if (option.isActive) {
        minPrice = Math.min(minPrice, option.price);
        maxPrice = Math.max(maxPrice, option.price);
      }
    }
  }

  return {
    min: minPrice === Infinity ? this.price : minPrice,
    max: maxPrice === -Infinity ? this.price : maxPrice
  };
};

module.exports = mongoose.model('Product', productSchema);
