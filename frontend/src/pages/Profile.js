import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaEye } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import orderAPI from '../api/orderAPI';

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
];

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: 'India',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrdersError('Failed to fetch orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save profile data logic here
    console.log('Profile updated:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Shipped':
        return 'text-blue-600 bg-blue-100';
      case 'Processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Handler to open order modal
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    setCancelError('');
  };

  // Handler to close order modal
  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
    setCancelError('');
  };

  // Handler to cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      await orderAPI.cancelOrder(selectedOrder._id);
      setSelectedOrder({ ...selectedOrder, orderStatus: 'cancelled' });
      setCancelLoading(false);
      setShowOrderModal(false);
      // Optionally, refetch orders or update local state
      const res = await orderAPI.getOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order');
      setCancelLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and view order history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FaSave />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  name="state"
                  value={profileData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'].map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowOrderDrawer(true)}
              >
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600" />
                  <span>View Order History</span>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600" />
                  <span>Contact Support</span>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>Shipping Addresses</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Side Drawer */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowOrderDrawer(false)}></div>
          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-lg p-6 overflow-y-auto animate-slide-in-right-slow">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowOrderDrawer(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Order History</h2>
            {ordersLoading ? (
              <div>Loading...</div>
            ) : ordersError ? (
              <div className="text-red-600">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div>No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">{order.orderNumber || order._id}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{order.orderStatus}</span>
                        </td>
                        <td className="py-3 px-4">{formatINR(order.totalPrice)}</td>
                        <td className="py-3 px-4">{order.orderItems?.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewOrder(order)}><FaEye /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Order Details Modal (inside drawer) */}
            {showOrderModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-2 relative overflow-y-auto max-h-[90vh]">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseOrderModal}>&times;</button>
                  <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                  <div className="mb-2 text-sm text-gray-600">Order ID: <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id}</span></div>
                  <div className="mb-2 text-sm text-gray-600">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  <div className="mb-2 text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : selectedOrder.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' : selectedOrder.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{selectedOrder.orderStatus}</span></div>
                  <div className="mb-2 text-sm text-gray-600">Payment: {selectedOrder.paymentMethod}</div>
                  <div className="mb-4 text-sm text-gray-600">Shipping: {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}, {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.pincode || selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}</div>
                  <h3 className="text-lg font-semibold mb-2">Products</h3>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="py-2 px-2 text-left">Image</th>
                          <th className="py-2 px-2 text-left">Name</th>
                          <th className="py-2 px-2 text-left">Price</th>
                          <th className="py-2 px-2 text-left">Qty</th>
                          <th className="py-2 px-2 text-left">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderItems?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2">
                              <img src={item.product?.images?.[0]?.url || item.image || '/product-images/default.webp'} alt={item.product?.name || item.name} className="w-12 h-12 object-cover rounded" />
                            </td>
                            <td className="py-2 px-2">{item.product?.name || item.name}</td>
                            <td className="py-2 px-2">{formatINR(item.price)}</td>
                            <td className="py-2 px-2">{item.quantity}</td>
                            <td className="py-2 px-2">{formatINR(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-right font-bold text-lg mb-4">Total: {formatINR(selectedOrder.total || selectedOrder.totalPrice)}</div>
                  {/* Cancel Order Button */}
                  {['pending', 'confirmed', 'processing'].includes(selectedOrder.orderStatus) && (
                    <div className="mb-2">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        onClick={handleCancelOrder}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                      {cancelError && <div className="text-red-600 text-xs mt-1">{cancelError}</div>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 