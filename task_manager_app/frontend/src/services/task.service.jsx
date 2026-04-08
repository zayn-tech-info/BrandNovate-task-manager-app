import axios from 'axios';
import { API_URL } from '../utils/constants';
import authService from './auth.service';

const API_TASKS_URL = `${API_URL}/api/tasks`;

class TaskService {
  async getAllTasks() {
    return await axios.get(API_TASKS_URL, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTaskById(id) {
    return await axios.get(`${API_TASKS_URL}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async createTask(taskData) {
    return await axios.post(API_TASKS_URL, taskData, {
      headers: authService.getAuthHeader()
    });
  }
  
  async updateTask(id, taskData) {
    const response = await axios.put(`${API_TASKS_URL}/${id}`, taskData, {
      headers: authService.getAuthHeader()
    });
    
    // Handle the backend response structure which has data nested inside
    if (response.data && response.data.data) {
      // Backend returns { message: "Task was updated successfully.", data: updatedTask }
      // But frontend expects the task directly, so we transform the response
      return { data: response.data.data };
    }
    
    return response;
  }
  
  async deleteTask(id) {
    return await axios.delete(`${API_TASKS_URL}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByCategory(categoryId) {
    return await axios.get(`${API_TASKS_URL}/category/${categoryId}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByStatus(status) {
    return await axios.get(`${API_TASKS_URL}/status/${status}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByPriority(priority) {
    return await axios.get(`${API_TASKS_URL}/priority/${priority}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByDueDate(date) {
    return await axios.get(`${API_TASKS_URL}/due-date/${date}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForToday() {
    return await axios.get(`${API_TASKS_URL}/today`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForWeek() {
    return await axios.get(`${API_TASKS_URL}/week`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForMonth() {
    return await axios.get(`${API_TASKS_URL}/month`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getCompletedTasks() {
    return await axios.get(`${API_TASKS_URL}/completed`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async markTaskAsCompleted(id) {
    const response = await axios.patch(`${API_TASKS_URL}/${id}/complete`, {}, {
      headers: authService.getAuthHeader()
    });
    
    // Handle the backend response structure which has data nested inside
    if (response.data && response.data.data) {
      // Backend returns { message: "Task was marked as completed successfully.", data: updatedTask }
      // But frontend expects the task directly, so we transform the response
      return { data: response.data.data };
    }
    
    return response;
  }
  
  async markTaskAsIncomplete(id) {
    const response = await axios.patch(`${API_TASKS_URL}/${id}/incomplete`, {}, {
      headers: authService.getAuthHeader()
    });
    
    // Handle the backend response structure which has data nested inside
    if (response.data && response.data.data) {
      // Backend returns { message: "Task was marked as incomplete successfully.", data: updatedTask }
      // But frontend expects the task directly, so we transform the response
      return { data: response.data.data };
    }
    
    return response;
  }
}

export default new TaskService();
