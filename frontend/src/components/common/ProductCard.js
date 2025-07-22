import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({
  product,
  isInWishlist,
  handleWishlist,
  handleAddToCart,
  showWishlist = true,
  showAddToCart = true,
  showRating = true,
  showPrice = true,
  className = '',
}) => {
  const navigate = useNavigate();
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col relative transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 max-w-xs w-full mx-auto min-h-[320px] h-full ${className}`}
      style={{ aspectRatio: '4/5', minHeight: '260px', maxWidth: '240px' }}
    >
      {showWishlist && (
        <div className="absolute top-1 right-1 z-10">
          <button
            className={`bg-white/50 border border-grey-300 rounded-full p-1 shadow-md flex items-center justify-center transition-all duration-200
              ${isInWishlist?.(product._id)
                ? 'text-pink-500 bg-pink-100 border-pink-300'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'}
            `}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)' }}
            onClick={() => handleWishlist?.(product)}
            aria-label={isInWishlist?.(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FaHeart
              className={`text-xl sm:text-2xl transition-all duration-200 ${isInWishlist?.(product._id) ? 'fill-current' : ''} stroke-black stroke-[6]`}
              fill={isInWishlist?.(product._id) ? 'currentColor' : 'none'}
              style={{ strokeWidth: 3 }}
            />
          </button>
        </div>
      )}
      {/* Image section: 40% height on mobile, default on desktop */}
      <Link to={`/products/${product._id}`} className="block flex-[2] sm:flex-none h-[32%] sm:h-32 overflow-hidden rounded-t-2xl">
        <img
          src={product.images && product.images[0] ? product.images[0].url : '/product-images/default.webp'}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          style={{ minHeight: '90px', maxHeight: '120px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80`;
          }}
        />
      </Link>
      <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 h-full">
        <div>
          <Link to={`/products/${product._id}`}> 
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-0.5 sm:mb-1 hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {showRating && (
            <div className="flex items-center mb-0.5 sm:mb-1">
              <div className="flex text-yellow-400 text-xs sm:text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xs sm:text-sm">
                    {i < Math.floor(product.rating || product.ratings || 0) ? '\u2605' : '\u2606'}
                  </span>
                ))}
              </div>
              <span className="text-[11px] sm:text-xs text-gray-500 ml-1 sm:ml-2">
                ({Array.isArray(product.reviews) ? product.reviews.length : product.numReviews || 0} reviews)
              </span>
            </div>
          )}
          {product.description && (
            <div className="text-gray-500 text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">
              {product.description}
            </div>
          )}
          {typeof product.soldCount === 'number' && product.soldCount > 0 && (
            <div className="text-xs sm:text-xs font-semibold text-green-700 mb-1 flex items-center">
              <span className="font-bold">{product.soldCount}+</span> bought till now
            </div>
          )}
        </div>
        <div className="flex flex-row items-center justify-between gap-2 pt-2 mt-auto w-full">
          {showPrice && (
            <span className="text-sm sm:text-lg font-bold text-blue-600">
              {product.price ? (product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })) : ''}
            </span>
          )}
          {showAddToCart && (
            <button
              className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1 shadow-md w-auto justify-center text-xs sm:text-sm"
              style={{ minHeight: '28px' }}
              onClick={() => handleAddToCart?.(product)}
            >
              <FaShoppingCart />
              <span className="hidden xs:inline">Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;