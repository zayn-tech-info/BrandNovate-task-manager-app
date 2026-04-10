
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
    const response = await axios.post(`${API_AUTH_URL}/signup`, {
      username,
      email,
      password
    });

    const data = response.data;
    if (data.accessToken) {
      localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      try {
        const tokenData = JSON.parse(atob(user.accessToken.split('.')[1]));
        const isExpired = Date.now() >= tokenData.exp * 1000;
        
        if (isExpired) {
          this.logout();
          return null;
        }
      } catch (tokenError) {
        this.logout();
        return null;
      }
      
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }
  
  getAuthHeader() {
    const user = this.getCurrentUser();
    if (!user?.accessToken) return {};
    return {
      Authorization: `Bearer ${user.accessToken}`,
      'x-access-token': user.accessToken
    };
  }
  
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }
}

export default new AuthService();
