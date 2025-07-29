const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const sellerController = require('../controllers/sellerController');

// Configure multer for in-memory image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Public route — Seller registration
router.post('/register', sellerController.register);

// 🔐 Protect all following routes
router.use(protect);
router.use(authorize('seller')); // Allow only sellers

// 📊 Seller Dashboard
router.get('/dashboard', sellerController.getDashboard);

// 📦 Seller Product Routes
router.get('/products', sellerController.getProducts);                          // Get all seller products
router.post('/products', upload.array('images', 5), sellerController.createProduct); // Add new product
router.put('/products/:id', sellerController.updateProduct);                   // Update product
router.delete('/products/:id', sellerController.deleteProduct);                // Delete product
router.put('/products/:id/sold-count', sellerController.updateSoldCount);     // Update sold count

// 📦 Seller Orders
router.get('/orders', sellerController.getOrders);                             // Get seller orders
router.put('/orders/:id/status', sellerController.updateOrderStatus);         // Update order status

// 📈 Seller Stats
router.get('/stats', sellerController.getStats);                               // Get analytics/stats

module.exports = router;
