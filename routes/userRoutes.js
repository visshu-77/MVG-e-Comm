const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// 🔐 Protect all user routes
router.use(protect);

// 👤 User Profile
router.put('/profile', userController.updateProfile);

// 🛒 Cart Routes
router.get('/cart', userController.getCart);                        // Get cart items
router.post('/cart', userController.addToCart);                    // Add to cart
router.put('/cart/:productId', userController.updateCartQuantity); // Update quantity
router.delete('/cart/:productId', userController.removeFromCart);  // Remove item

// 💖 Wishlist Routes
router.get('/wishlist', userController.getWishlist);                      // Get wishlist
router.post('/wishlist/:productId', userController.addToWishlist);       // Add to wishlist
router.delete('/wishlist/:productId', userController.removeFromWishlist); // Remove from wishlist

module.exports = router;
