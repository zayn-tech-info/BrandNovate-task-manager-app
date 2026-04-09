import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import TaskForm from '../components/TaskForm';
import taskService from '../services/task.service';

const NewTask = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await taskService.createTask(taskData);
      
      // Add a small delay to ensure the backend has processed the creation
      setTimeout(() => {
        // Redirect to tasks list after successful creation
        navigate('/tasks');
      }, 500);
    } catch (err) {
      console.error('Error creating task:', err);
      
      // Provide a more specific error message based on the error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to create tasks.');
        } else if (err.response.status === 400) {
          setError(err.response.data?.message || 'Invalid task data. Please check your inputs.');
        } else {
          setError(err.response.data?.message || 'Failed to create task. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again later.');
      }
      
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Create New Task</h1>
        <p className="text-gray-600">Add a new task to your list</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Task form */}
      <div className="card">
        <TaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default NewTask;
