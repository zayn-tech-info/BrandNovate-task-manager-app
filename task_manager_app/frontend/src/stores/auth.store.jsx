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
      toast.success('Registration successful! Please login.');
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
  },

  forgotPassword: async (email) => {
    try {
      set({ loading: true });
      await authService.forgotPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      set({ loading: true });
      await authService.resetPassword(token, newPassword);
      toast.success('Password has been reset successfully. Please login with your new password.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (userData) => {
    try {
      set({ loading: true });
      const updatedUser = await authService.updateProfile(userData);
      set({ currentUser: updatedUser });
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
