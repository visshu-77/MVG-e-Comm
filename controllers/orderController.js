const Order = require('../models/Order');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Create Order: Splits cart by seller, creates separate orders for each seller
exports.createOrder = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'User not authenticated', route: req.originalUrl || req.url });
  }
  const { shippingAddress, items, paymentMethod, cardData, coupon, discount, total } = req.body;
  const userId = req.user._id;

  // Group items by seller
  const itemsBySeller = {};
  for (const item of items) {
    if (!item.product || !item.seller) {
      return res.status(400).json({ message: 'Product or seller missing in order item.', route: req.originalUrl || req.url });
    }
    if (!itemsBySeller[item.seller]) itemsBySeller[item.seller] = [];
    itemsBySeller[item.seller].push(item);
  }

  const createdOrders = [];
  for (const sellerId of Object.keys(itemsBySeller)) {
    const sellerItems = itemsBySeller[sellerId];
    const orderItems = await Promise.all(sellerItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (!product.seller || product.seller.toString() !== sellerId) throw new Error(`Product seller mismatch for product ${product._id}`);

      product.totalSold = (product.totalSold || 0) + item.quantity;
      await product.save();

      return {
        product: product._id,
        name: product.name,
        image: product.images && product.images[0] ? product.images[0].url : '',
        price: product.price,
        quantity: item.quantity,
        sku: product.sku || '',
      };
    }));

    const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = 0;
    const taxPrice = 0;
    const platformFee = Math.round(itemsPrice * 0.2 * 100) / 100;
    const sellerEarnings = itemsPrice - platformFee;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = new Order({
      user: userId,
      seller: sellerId,
      orderItems,
      shippingAddress: {
        type: shippingAddress.type || 'home',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '',
      },
      paymentMethod: paymentMethod === 'cod' ? 'cod' : paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      commission: platformFee,
      sellerEarnings,
      orderStatus: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      shippingStatus: 'pending',
      coupon: coupon || undefined,
      discount: discount || 0,
    });
    await order.save();
    createdOrders.push(order);
  }

  res.status(201).json({ orders: createdOrders });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isSeller = req.query.seller === 'true' || req.user.role === 'seller';
  let orders;

  if (isSeller) {
    const sellerDoc = await Seller.findOne({ userId: userId });
    if (!sellerDoc) return res.json({ orders: [] });

    orders = await Order.find({ seller: sellerDoc._id })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name');
  } else {
    orders = await Order.find({ user: userId })
      .populate('seller', 'shopName')
      .populate('orderItems.product', 'name');
  }

  res.json({ orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('seller', 'shopName')
    .populate('orderItems.product', 'name');

  if (!order) return res.status(404).json({ message: 'Order not found', route: req.originalUrl || req.url });

  res.json(order);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found', route: req.originalUrl || req.url });

  order.orderStatus = status;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json(order);
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found', route: req.originalUrl || req.url });

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || '';
  order.cancelledBy = req.user._id;

  await order.save();
  res.json(order);
});
