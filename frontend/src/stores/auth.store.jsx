import { create } from 'zustand';
import { toast } from 'react-toastify';
import authService from '../services/auth.service';

export const useAuthStore = create((set) => ({
  currentUser: null,
  loading: true,
  isAuthenticated: false,

  initializeAuth: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({
          currentUser: user,
          isAuthenticated: true
        });
      } else {
        set({
          currentUser: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      authService.logout();
      set({
        currentUser: null,
        isAuthenticated: false
      });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const data = await authService.login(email, password);
      set({
        currentUser: data.user || data,
        isAuthenticated: true
      });
      toast.success('Login successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  register: async (username, email, password) => {
    try {
      set({ loading: true });
      const data = await authService.register(username, email, password);
      if (data.accessToken) {
        set({
          currentUser: data,
          isAuthenticated: true
        });
        toast.success('Welcome! Your account is ready.');
      } else {
        toast.success('Registration successful! Please login.');
      }
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({
      currentUser: null,
      isAuthenticated: false
    });
    toast.info('You have been logged out');
  }
}));
