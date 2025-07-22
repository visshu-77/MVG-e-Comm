import axiosInstance from './axiosConfig';

const authAPI = {
  // Register new user
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },

  // Update user profile
  updateProfile: (userData) => {
    return axiosInstance.put('/users/profile', userData);
  },

  // Forgot password
  forgotPassword: (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, password) => {
    return axiosInstance.put(`/auth/reset-password/${token}`, { password });
  },

  // Verify email
  verifyEmail: (token) => {
    return axiosInstance.get(`/auth/verify-email/${token}`);
  },
};

export default authAPI; 