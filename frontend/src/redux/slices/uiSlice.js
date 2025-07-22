import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  searchModalOpen: false,
  cartModalOpen: false,
  notifications: [],
  theme: 'light',
  loading: false,
  chatUnreadCounts: {}, // { [conversationId]: count }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen;
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = action.payload;
    },
    toggleCartModal: (state) => {
      state.cartModalOpen = !state.cartModalOpen;
    },
    setCartModalOpen: (state, action) => {
      state.cartModalOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setChatUnreadCounts: (state, action) => {
      state.chatUnreadCounts = action.payload;
    },
    incrementUnreadForConversation: (state, action) => {
      const convId = action.payload;
      if (!state.chatUnreadCounts[convId]) state.chatUnreadCounts[convId] = 0;
      state.chatUnreadCounts[convId] += 1;
    },
    clearUnreadForConversation: (state, action) => {
      const convId = action.payload;
      state.chatUnreadCounts[convId] = 0;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSearchModal,
  setSearchModalOpen,
  toggleCartModal,
  setCartModalOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setLoading,
  setChatUnreadCounts,
  incrementUnreadForConversation,
  clearUnreadForConversation,
} = uiSlice.actions;

export default uiSlice.reducer; 