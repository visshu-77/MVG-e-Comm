const Seller = require('../models/Seller');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all sellers (with approval status)
exports.getSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find().populate('userId', 'name email');
  res.json(sellers);
});

// Approve a seller
exports.approveSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: 'Seller not found', route: req.originalUrl || req.url });
  seller.isApproved = true;
  seller.approvalDate = new Date();
  seller.approvedBy = req.user._id;
  seller.rejectionReason = undefined;
  await seller.save();
  // Also update the corresponding user
  await User.findByIdAndUpdate(seller.userId, { role: 'seller', isActive: true });
  res.json({ message: 'Seller approved', seller });
});

// Reject a seller
exports.rejectSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: 'Seller not found', route: req.originalUrl || req.url });
  seller.isApproved = false;
  seller.rejectionReason = req.body.reason || 'Rejected by admin';
  seller.approvalDate = undefined;
  seller.approvedBy = req.user._id;
  await seller.save();
  res.json({ message: 'Seller rejected', seller });
});

// Placeholder: Get admin dashboard
exports.getDashboard = (req, res) => {
  res.json({ message: 'Get admin dashboard' });
};

// Get all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Update a user
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found', route: req.originalUrl || req.url });
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();
  res.json(user);
});

// Delete a user
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found', route: req.originalUrl || req.url });
  res.json({ message: 'User deleted', user });
});

// Get all products
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await require('../models/Product').find().populate('seller', 'shopName');
  res.json(products);
});

// Approve a product
exports.approveProduct = asyncHandler(async (req, res) => {
  const product = await require('../models/Product').findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  product.isApproved = true;
  product.approvalDate = new Date();
  product.approvedBy = req.user._id;
  product.rejectionReason = undefined;
  await product.save();
  res.json(product);
});

// Reject a product
exports.rejectProduct = asyncHandler(async (req, res) => {
  const product = await require('../models/Product').findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found', route: req.originalUrl || req.url });
  product.isApproved = false;
  product.rejectionReason = req.body.reason || 'Rejected by admin';
  product.approvalDate = undefined;
  product.approvedBy = req.user._id;
  await product.save();
  res.json(product);
});

// Get all orders
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await require('../models/Order').find()
    .populate('user', 'name email')
    .populate('seller', 'shopName')
    .populate('orderItems.product', 'name images');
  res.json(orders);
});

// Get analytics/stats
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalVendors, pendingVendors, totalSales] = await Promise.all([
    User.countDocuments(),
    require('../models/Product').countDocuments(),
    require('../models/Order').countDocuments(),
    require('../models/Seller').countDocuments(),
    require('../models/Seller').countDocuments({ isApproved: false }),
    require('../models/Order').aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]).then(res => res[0]?.total || 0)
  ]);
  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalVendors,
    pendingVendors,
    totalSales
  });
}); 