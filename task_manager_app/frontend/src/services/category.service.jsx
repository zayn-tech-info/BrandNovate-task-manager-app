import axios from 'axios';
import { API_URL } from '../utils/constants';
import authService from './auth.service';

const API_CATEGORIES_URL = `${API_URL}/api/categories`;

class CategoryService {
  async getAllCategories() {
    return await axios.get(API_CATEGORIES_URL, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getCategoryById(id) {
    return await axios.get(`${API_CATEGORIES_URL}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async createCategory(categoryData) {
    return await axios.post(API_CATEGORIES_URL, categoryData, {
      headers: authService.getAuthHeader()
    });
  }
  
  async updateCategory(id, categoryData) {
    return await axios.put(`${API_CATEGORIES_URL}/${id}`, categoryData, {
      headers: authService.getAuthHeader()
    });
  }
  
  async deleteCategory(id) {
    return await axios.delete(`${API_CATEGORIES_URL}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getCategoryWithTasks(id) {
    return await axios.get(`${API_CATEGORIES_URL}/${id}/tasks`, {
      headers: authService.getAuthHeader()
    });
  }
}

export default new CategoryService();
