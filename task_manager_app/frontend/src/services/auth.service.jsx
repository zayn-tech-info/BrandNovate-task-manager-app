
import axios from 'axios';
import { API_URL } from '../utils/constants';

const API_AUTH_URL = `${API_URL}/api/auth`;

class AuthService {
  async login(email, password) {
    const response = await axios.post(`${API_AUTH_URL}/signin`, {
      email,
      password
    });
    
    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }
  
  logout() {
    localStorage.removeItem('user');
  }
  
  async register(username, email, password) {
    return axios.post(`${API_AUTH_URL}/signup`, {
      username,
      email,
      password
    });
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // Check if token is expired
      try {
        const tokenData = JSON.parse(atob(user.accessToken.split('.')[1]));
        const isExpired = Date.now() >= tokenData.exp * 1000;
        
        if (isExpired) {
          // If token is expired, log the user out
          this.logout();
          return null;
        }
      } catch (tokenError) {
        // If token can't be parsed, log the user out
        this.logout();
        return null;
      }
      
      return user;
    } catch (error) {
      // If there's an error parsing the user data, log the user out
      this.logout();
      return null;
    }
  }
  
  getAuthHeader() {
    const user = this.getCurrentUser();
    return user ? { 'x-access-token': user.accessToken } : {};
  }
  
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }
  
  async forgotPassword(email) {
    return axios.post(`${API_AUTH_URL}/forgot-password`, { email });
  }
  
  async resetPassword(token, newPassword) {
    return axios.post(`${API_AUTH_URL}/reset-password`, {
      token,
      newPassword
    });
  }
  
  async updateProfile(userData) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const response = await axios.put(
      `${API_URL}/api/users/${user.id}`,
      userData,
      { headers: this.getAuthHeader() }
    );
    
    // Update stored user data
    const updatedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  }
}

export default new AuthService();
