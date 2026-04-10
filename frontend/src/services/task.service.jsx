import axios from 'axios';
import { apiUrl } from '../utils/constants';
import authService from './auth.service';

const apiTasksUrl = `${apiUrl}/api/tasks`;

class TaskService {
  async getAllTasks() {
    return await axios.get(apiTasksUrl, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTaskById(id) {
    return await axios.get(`${apiTasksUrl}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async createTask(taskData) {
    return await axios.post(apiTasksUrl, taskData, {
      headers: authService.getAuthHeader()
    });
  }
  
  async updateTask(id, taskData) {
    const response = await axios.put(`${apiTasksUrl}/${id}`, taskData, {
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
    return await axios.delete(`${apiTasksUrl}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByCategory(categoryId) {
    return await axios.get(`${apiTasksUrl}/category/${categoryId}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByStatus(status) {
    return await axios.get(`${apiTasksUrl}/status/${status}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByPriority(priority) {
    return await axios.get(`${apiTasksUrl}/priority/${priority}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksByDueDate(date) {
    return await axios.get(`${apiTasksUrl}/due-date/${date}`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForToday() {
    const timezoneOffset = new Date().getTimezoneOffset();
    return await axios.get(`${apiTasksUrl}/today`, {
      params: { timezoneOffset },
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForWeek() {
    return await axios.get(`${apiTasksUrl}/week`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getTasksForMonth() {
    return await axios.get(`${apiTasksUrl}/month`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async getCompletedTasks() {
    return await axios.get(`${apiTasksUrl}/completed`, {
      headers: authService.getAuthHeader()
    });
  }
  
  async markTaskAsCompleted(id) {
    const response = await axios.patch(`${apiTasksUrl}/${id}/complete`, {}, {
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
    const response = await axios.patch(`${apiTasksUrl}/${id}/incomplete`, {}, {
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
