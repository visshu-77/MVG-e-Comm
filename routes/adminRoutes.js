const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/approve', adminController.approveSeller);
router.put('/sellers/:id/reject', adminController.rejectSeller);
router.get('/products', adminController.getProducts);
router.put('/products/:id/approve', adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);
router.get('/orders', adminController.getOrders);
router.get('/analytics', adminController.getAnalytics);

module.exports = router; 
 