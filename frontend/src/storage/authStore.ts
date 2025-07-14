// frontend/storage/authStore.ts
import { create } from 'zustand';
import api from '../constants/axiosInstance';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  email: string | null;
  setAuthStatus: (status: boolean, userData?: { username: string; email: string }) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  username: null,
  email: null,

  setAuthStatus: (status, userData) => {
    console.log('🔐 Setting auth status...');
    console.log('✅ Status:', status);
    console.log('👤 Username:', userData?.username);
    console.log('📧 Email:', userData?.email);

    set({
      isAuthenticated: status,
      username: userData?.username || null,
      email: userData?.email || null,
      isLoading: false,
    });
  },

checkAuth: async () => {
  console.log('📡 Checking authentication via cookie...');
  try {
    const res = await api.get('/auth/check', { withCredentials: true });
    console.log('🟢 Auth check response:', res.data);

    if (res.data.authenticated) {
      console.log('✅ User is authenticated via cookie!');
      set({
        isAuthenticated: true,
        username: res.data.username || null,
        email: res.data.email || null,
        isLoading: false,
      });
    } else {
      console.log('🔴 User is NOT authenticated (token missing or invalid)');
      set({ isAuthenticated: false, username: null, email: null, isLoading: false });
    }
  } catch (err: any) {
    // 👇 Suppress log for expected 401s (unauthenticated state)
    if (err?.response?.status !== 401) {
      console.error('❌ Error during auth check:', err);
    } else {
      console.log('⚠️ Not authenticated (401) - skipping error log');
    }

    set({ isAuthenticated: false, username: null, email: null, isLoading: false });
  }
},

logout: async () => {
  console.log('🚪 Logging out...');

  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
    console.log('✅ Logout request sent and cookie cleared');
  } catch (err) {
    console.error('❌ Logout error:', err);
  }

  // Clear Zustand state (and localStorage if needed)
  set({
    isAuthenticated: false,
    username: null,
    email: null,
  });

  // (Optional) Clear any manually stored items
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
}
}));
