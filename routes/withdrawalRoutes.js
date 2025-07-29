const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const withdrawalController = require('../controllers/withdrawalController');

// 🔐 All withdrawal routes are protected
router.use(protect);

// ✅ Seller-only routes
router.post('/', authorize('seller'), withdrawalController.requestWithdrawal);
router.get('/', authorize('admin'), withdrawalController.getAllWithdrawals);
router.put('/:id/status', authorize('admin'), withdrawalController.updateWithdrawalStatus);

module.exports = router;
