const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// Protect all routes
router.use(protect);

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders (admin/seller)
router.get('/', authorize('admin', 'seller'), orderController.getOrders);

// Get orders of logged-in user
router.get('/my/orders', orderController.getOrders);

// Get a single order by ID
router.get('/:id', orderController.getOrder);

// Update order status (admin or seller only)
router.put('/:id/status', authorize('admin', 'seller'), orderController.updateOrderStatus);

// Cancel order (user or seller only)
router.put('/:id/cancel', authorize('user', 'seller'), orderController.cancelOrder);

module.exports = router;
