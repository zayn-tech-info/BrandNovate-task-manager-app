import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit } from 'react-icons/fi';
import TaskForm from '../components/TaskForm';
import taskService from '../services/task.service';

const EditTask = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        const response = await taskService.getTaskById(taskId);
        setTask(response.data);
      } catch (err) {
        console.error('Error fetching task:', err);
        
        // Provide a more specific error message based on the error type
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (err.response.status === 403) {
            setError('You do not have permission to view this task.');
          } else if (err.response.status === 404) {
            setError('Task not found. It may have been deleted or the ID is invalid.');
          } else {
            setError(err.response.data?.message || 'Failed to load task. Please try again later.');
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response from server. Please check your internet connection and try again.');
        } else if (err.message === 'Task not found') {
          // This is the error thrown by our mock service when a task is not found
          setError('Task not found. It may have been deleted or the ID is invalid.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId]);
  
  // Handle task update
  const handleUpdateTask = async (taskData) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Update the task
      await taskService.updateTask(taskId, taskData);
      
      // Add a small delay to ensure the backend has processed the update
      setTimeout(() => {
        // Redirect to tasks list after successful update
        navigate('/tasks');
      }, 500);
    } catch (err) {
      console.error('Error updating task:', err);
      
      // Provide a more specific error message based on the error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to update this task.');
        } else if (err.response.status === 404) {
          setError('Task not found. It may have been deleted.');
        } else if (err.response.status === 400) {
          setError(err.response.data?.message || 'Invalid task data. Please check your inputs.');
        } else {
          setError(err.response.data?.message || 'Failed to update task. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again later.');
      }
      
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Loading task data...</p>
      </div>
    );
  }
  
  if (error && !task) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm my-8 mx-auto max-w-2xl">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Task</h3>
        </div>
        <p className="ml-8">{error}</p>
        <div className="flex mt-4 ml-8">
          <button 
            onClick={() => navigate('/tasks')} 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 mr-3"
          >
            Back to Tasks
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Task</h1>
        <p className="text-gray-600">Update task details</p>
      </div>
      
      {/* Error message */}
      {error && task && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4 flex items-start">
          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="font-medium">Error updating task</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* Task form */}
      <div className="card">
        {task && (
          <TaskForm 
            task={task} 
            onSubmit={handleUpdateTask} 
            isLoading={isSaving} 
          />
        )}
      </div>
    </div>
  );
};

export default EditTask;
