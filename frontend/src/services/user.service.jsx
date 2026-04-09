import axios from 'axios';
import { API_URL } from '../utils/constants';
import authService from './auth.service';

const API_USERS_URL = `${API_URL}/api/users`;

class UserService {
  async getUserProfile() {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await axios.get(`${API_USERS_URL}/${user.id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async updateUserProfile(userData) {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await axios.put(`${API_USERS_URL}/${user.id}`, userData, {
      headers: authService.getAuthHeader()
    });
  }
  
  async changePassword(currentPassword, newPassword) {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await axios.post(`${API_USERS_URL}/${user.id}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getUserTasks() {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await axios.get(`${API_USERS_URL}/${user.id}/tasks`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getUserCategories() {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    return await axios.get(`${API_USERS_URL}/${user.id}/categories`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTeamMembers() {
    return await axios.get(`${API_USERS_URL}/team`, {
      headers: authService.getAuthHeader()
    });
  }
}

export default new UserService();
