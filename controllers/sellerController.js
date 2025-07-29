const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// const getLatLngFromPincode = async (pincode) => {
//   const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);

//     if (
//       response.data.status === 'OK' &&
//       response.data.results &&
//       response.data.results.length > 0
//     ) {
//       const location = response.data.results[0].geometry.location;
//       return { lat: location.lat, lng: location.lng };
//     } else {
//       throw new Error('No location found for given pincode.');
//     }
//   } catch (error) {
//     console.error('Geocoding Error:', error.message);
//     return null;
//   }
// };

// Register a new seller (vendor request)
exports.register = async (req, res) => {
  try {
    const { email, phone, password, name, pincode } = req.body;

    if (!(email && phone && password && name )) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Get lat/lng from pincode
    // const location = await getLatLngFromPincode(pincode);
    // if (!location) {
    //   return res.status(400).json({ message: 'Invalid pincode. Unable to fetch location.' });
    // }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: 'seller',
      phone
    });

    // Create seller
    const seller = new Seller({
      userId: user._id,
      email,
      name,
      phone,
      pincode,
      location: {
        lat: location.lat,
        lng: location.lng
      },
      isApproved: false
    });

    await seller.save();
    res.status(201).json({ message: 'Vendor registration submitted. Awaiting admin approval.' });

  } catch (error) {
    console.error('Seller registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Placeholder: Get seller dashboard
exports.getDashboard = (req, res) => {
  res.json({ message: 'Get seller dashboard' });
};

// Get all products for the current seller
exports.getProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const products = await Product.find({ seller: seller._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product for the current seller
exports.createProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const { name, price, category, subCategory } = req.body;

    if (!name || !price || !category || !subCategory) {
      return res.status(400).json({ message: 'Name, price, category, and subCategory are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({ message: 'Invalid subCategory ID' });
    }

    // Image optional
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(file.buffer);
        });
        imageUrls.push({ url: uploadResult.secure_url });
      }
    }

    // Add fallback image
    if (imageUrls.length === 0) {
      imageUrls = [{ url: 'https://res.cloudinary.com/demo/image/upload/v1690000000/products/default-product.png' }];
    }

    const product = new Product({
      name,
      price: Number(price),
      images: imageUrls,
      category,
      subCategory,
      seller: seller._id,
      isActive: true,
      isApproved: false,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating simple product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const product = await Product.findOne({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let imageUrl = product.images && product.images[0] ? product.images[0].url : '';
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          if (!req.file.buffer) return reject(new Error('No file buffer found in req.file'));
          stream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    }

    // Parse fields from req.body
    const {
      name, description, shortDescription, price, comparePrice, category, subCategory, brand, sku, stock, lowStockThreshold, weight, dimensions, variants, tags, shippingInfo, seo, features, specifications
    } = req.body;

    // Parse features and specifications
    let featuresArr = [];
    if (features) {
      featuresArr = typeof features === 'string' ? features.split(',').map(f => f.trim()).filter(Boolean) : features;
    }
    let specificationsArr = [];
    if (specifications) {
      try {
        specificationsArr = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        specificationsArr = [];
      }
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.shortDescription = shortDescription;
    product.price = price;
    product.comparePrice = comparePrice;
    product.images = imageUrl ? [{ url: imageUrl }] : product.images;
    product.category = category;
    product.subCategory = subCategory;
    product.brand = brand;
    product.sku = sku;
    product.stock = stock;
    product.lowStockThreshold = lowStockThreshold;
    product.weight = weight;
    product.dimensions = dimensions;
    product.variants = variants;
    product.specifications = specificationsArr;
    product.features = featuresArr;
    product.tags = tags;
    product.shippingInfo = shippingInfo;
    product.seo = seo;

    await product.save();
    res.json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a product for the current seller
exports.deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update sold count for a product (seller only)
exports.updateSoldCount = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const product = await Product.findOne({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { soldCount } = req.body;
    if (typeof soldCount !== 'number' || soldCount < 0) {
      return res.status(400).json({ message: 'Invalid soldCount value' });
    }
    product.soldCount = soldCount;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Placeholder: Get seller orders
exports.getOrders = (req, res) => {
  res.json({ message: 'Get seller orders' });
};

// Placeholder: Update order status
exports.updateOrderStatus = (req, res) => {
  res.json({ message: 'Update order status' });
};

// Get seller stats (dashboard)
exports.getStats = async (req, res) => {
  try {
    // Find seller by user
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    // Get all products for this seller
    const products = await Product.find({ seller: seller._id });
    const productIds = products.map(p => p._id);

    // Get all orders for this seller
    const Order = require('../models/Order');
    const orders = await Order.find({ seller: seller._id });

    // Total sales (sum of totalPrice for delivered orders)
    const totalSales = orders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Total orders (all orders for this seller)
    const totalOrders = orders.length;

    // Total products
    const totalProducts = products.length;

    // Total unique customers
    const uniqueCustomerIds = new Set(orders.map(o => String(o.user)));
    const totalCustomers = uniqueCustomerIds.size;

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 