import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlist, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync({ product, quantity: 1 }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaHeart className="text-6xl text-pink-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your Wishlist</h2>
        <p className="mb-4 text-gray-600">Your wishlist is waiting for you. Sign in to see and manage your saved items.</p>
        <button
          className="btn-primary px-6 py-2 text-lg"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaHeart className="text-pink-500" /> Wishlist
      </h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <FaHeart className="mx-auto text-6xl text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500">Browse products and add your favorites to your wishlist.</p>
          <Link to="/products" className="btn-primary mt-6 inline-block px-6 py-2 text-lg">Shop Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product._id || product.id} className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative">
              <Link to={`/products/${product._id || product.id}`} className="block overflow-hidden">
                <img
                  src={product.image || '/product-images/default.webp'}
                  alt={product.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80`; }}
                />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <Link to={`/products/${product._id || product.id}`}> 
                  <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center mb-2">
                  <span className="text-xl font-bold text-blue-600">{formatINR(product.price)}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md w-full justify-center"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button
                    className="bg-gray-100 text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-100 transition-colors flex items-center gap-2 shadow-md w-full justify-center"
                    onClick={() => handleRemove(product._id || product.id)}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 