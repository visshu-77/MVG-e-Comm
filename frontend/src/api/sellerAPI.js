import axiosInstance from './axiosConfig';

const sellerAPI = {
  // Get all sellers (with approval status)
  getAllSellers: () => axiosInstance.get('/admin/sellers'),

  // Approve a seller
  approveSeller: (sellerId) => axiosInstance.put(`/admin/sellers/${sellerId}/approve`),

  // Reject a seller (with optional reason)
  rejectSeller: (sellerId, reason) => axiosInstance.put(`/admin/sellers/${sellerId}/reject`, { reason }),

  // Register a new vendor (seller)
  registerVendor: (vendorData) => axiosInstance.post('/sellers/register', vendorData),

  // Seller product CRUD
  getProducts: () => axiosInstance.get('/sellers/products'),
  createProduct: (productData, config) => axiosInstance.post('/sellers/products', productData, config),
  updateProduct: (id, productData) => axiosInstance.put(`/sellers/products/${id}`, productData),
  deleteProduct: (id) => axiosInstance.delete(`/sellers/products/${id}`),
  updateSoldCount: (id, soldCount) => axiosInstance.put(`/sellers/products/${id}/sold-count`, { soldCount }),

  // Coupon management
  getCoupons: () => axiosInstance.get('/coupons'),
  createCoupon: (couponData) => axiosInstance.post('/coupons', couponData),
  deactivateCoupon: (couponId) => axiosInstance.put(`/coupons/${couponId}/deactivate`),

  // Seller stats
  getStats: () => axiosInstance.get('/sellers/stats'),
};

export default sellerAPI; 