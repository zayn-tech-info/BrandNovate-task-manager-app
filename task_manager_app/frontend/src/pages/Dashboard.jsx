import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiCheckCircle, FiPlus, FiUser } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import taskService from '../services/task.service';
import userService from '../services/user.service';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    upcoming: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [completedTasksData, setCompletedTasksData] = useState({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to track if we're using backend data or mock data
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Create mock data for development/demo purposes
        const mockTasks = [
          {
            id: 1,
            title: 'Web Dashboard Design',
            description: 'Create a modern dashboard design with charts and widgets',
            status: TASK_STATUSES.IN_PROGRESS,
            priority: TASK_PRIORITIES.HIGH,
            dueDate: new Date().toISOString(),
            progress: 90,
            assignees: [
              { id: 1, username: 'John Doe', avatar: 'https://via.placeholder.com/150' }
            ]
          },
          {
            id: 2,
            title: 'Mobile App Development',
            description: 'Develop a mobile app for iOS and Android platforms',
            status: TASK_STATUSES.TODO,
            priority: TASK_PRIORITIES.MEDIUM,
            dueDate: new Date().toISOString(),
            progress: 30,
            assignees: [
              { id: 2, username: 'Jane Smith', avatar: 'https://via.placeholder.com/150' }
            ]
          },
          {
            id: 3,
            title: 'Animate Illustration',
            description: 'Create animated illustrations for the landing page',
            status: TASK_STATUSES.REVIEW,
            priority: TASK_PRIORITIES.LOW,
            dueDate: new Date().toISOString(),
            progress: 75,
            assignees: [
              { id: 3, username: 'Alex Johnson', avatar: 'https://via.placeholder.com/150' }
            ]
          }
        ];
        
        const mockTeamMembers = [
          { id: 1, username: 'John Doe', role: 'UI Designer', avatar: 'https://via.placeholder.com/150' },
          { id: 2, username: 'Jane Smith', role: 'Frontend Developer', avatar: 'https://via.placeholder.com/150' },
          { id: 3, username: 'Alex Johnson', role: 'Backend Developer', avatar: 'https://via.placeholder.com/150' }
        ];
        
        let backendConnected = false;
        
        try {
          // Try to fetch real data from backend
          const todayTasksResponse = await taskService.getTasksForToday();
          setTodayTasks(todayTasksResponse.data);
          
          const allTasksResponse = await taskService.getAllTasks();
          const allTasks = allTasksResponse.data;
          
          // Calculate task statistics
          const completed = allTasks.filter(task => task.status === TASK_STATUSES.COMPLETED).length;
          const inProgress = allTasks.filter(task => task.status === TASK_STATUSES.IN_PROGRESS).length;
          const upcoming = allTasks.filter(task => 
            task.status === TASK_STATUSES.TODO && new Date(task.dueDate) > new Date()
          ).length;
          
          setTaskStats({
            total: allTasks.length,
            completed,
            inProgress,
            upcoming
          });
          
          const teamMembersResponse = await userService.getTeamMembers();
          setTeamMembers(teamMembersResponse.data);
          
          // If we get here, backend is connected
          backendConnected = true;
          setIsUsingBackend(true);
          
          // Get completed tasks data for chart
          try {
            const completedTasksResponse = await taskService.getCompletedTasks();
            const completedTasks = completedTasksResponse.data;
            
            // Group completed tasks by date
            const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return date.toISOString().split('T')[0];
            });
            
            const completedByDay = lastSevenDays.map(day => {
              return completedTasks.filter(task => {
                const taskDate = new Date(task.completedAt || task.updatedAt || task.createdAt);
                return taskDate.toISOString().split('T')[0] === day;
              }).length;
            });
            
            const labels = lastSevenDays.map(day => {
              const date = new Date(day);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            setCompletedTasksData({
              labels,
              datasets: [
                {
                  label: 'Completed Tasks',
                  data: completedByDay,
                  fill: true,
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  borderColor: 'rgba(168, 85, 247, 1)',
                  tension: 0.4
                }
              ]
            });
          } catch (chartErr) {
            console.log('Error fetching chart data, using mock chart data', chartErr);
            // Use mock chart data
            const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            
            setCompletedTasksData({
              labels: lastSevenDays,
              datasets: [
                {
                  label: 'Completed Tasks',
                  data: [4, 3, 5, 7, 6, 8, 9],
                  fill: true,
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  borderColor: 'rgba(168, 85, 247, 1)',
                  tension: 0.4
                }
              ]
            });
          }
        } catch (err) {
          console.log('Using mock data instead of backend data:', err);
          // If backend fetch fails, use mock data
          setTodayTasks(mockTasks);
          setTaskStats({
            total: 12,
            completed: 5,
            inProgress: 4,
            upcoming: 3
          });
          setTeamMembers(mockTeamMembers);
          
          // Prepare data for completed tasks chart
          const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          
          setCompletedTasksData({
            labels: lastSevenDays,
            datasets: [
              {
                label: 'Completed Tasks',
                data: [4, 3, 5, 7, 6, 8, 9],
                fill: true,
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: 'rgba(168, 85, 247, 1)',
                tension: 0.4
              }
            ]
          });
        }
        
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error setting up dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `Completed: ${context.parsed.y} tasks`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm my-8 mx-auto max-w-2xl">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
        </div>
        <p className="ml-8">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="ml-8 mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-1">
      {/* Removed the data source indicator as requested */}
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 text-lg">Here's an overview of your tasks</p>
        </div>
        <div>
          <Link
            to="/tasks/new"
            className="btn btn-primary inline-flex items-center px-5 py-2.5 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <FiPlus className="mr-2" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 p-5">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-500 mr-5">
              <FiCalendar size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-800">{taskStats.total}</h3>
            </div>
          </div>
        </div>
        
        <div className="card bg-green-50 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300 p-5">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-green-100 text-green-500 mr-5">
              <FiCheckCircle size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-gray-800">{taskStats.completed}</h3>
            </div>
          </div>
        </div>
        
        <div className="card bg-purple-50 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300 p-5">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-purple-100 text-purple-500 mr-5">
              <FiClock size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <h3 className="text-2xl font-bold text-gray-800">{taskStats.inProgress}</h3>
            </div>
          </div>
        </div>
        
        <div className="card bg-yellow-50 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow duration-300 p-5">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-yellow-100 text-yellow-500 mr-5">
              <FiCalendar size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Upcoming</p>
              <h3 className="text-2xl font-bold text-gray-800">{taskStats.upcoming}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Today's Tasks</h2>
              <Link 
                to="/tasks" 
                className="text-primary hover:text-primary-dark text-sm font-medium hover:underline transition-colors duration-200"
              >
                View All
              </Link>
            </div>
            
            {todayTasks.length > 0 ? (
              <div className="space-y-5">
                {todayTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium text-gray-800 text-lg mb-2">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center mt-3">
                          <div className="flex -space-x-2 mr-3">
                            {task.assignees && task.assignees.map((assignee, index) => (
                              <img 
                                key={index}
                                className="w-7 h-7 rounded-full border-2 border-white"
                                src={assignee.avatar || 'https://via.placeholder.com/150'}
                                alt={assignee.username}
                                title={assignee.username}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {task.dueTime ? `Due at ${task.dueTime}` : 'No due time'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                          task.priority === TASK_PRIORITIES.HIGH 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === TASK_PRIORITIES.MEDIUM 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                        
                        <div className="mt-3 w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full animate-progress" 
                              style={{ width: `${task.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block text-right">
                            {task.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No tasks scheduled for today</p>
                <Link
                  to="/tasks/new"
                  className="mt-2 inline-flex items-center text-primary hover:text-primary-dark font-medium"
                >
                  <FiPlus className="mr-2" />
                  Add a task
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Team Members */}
        <div className="lg:col-span-1">
          <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
              <Link 
                to="/team" 
                className="text-primary hover:text-primary-dark text-sm font-medium hover:underline transition-colors duration-200"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-12 h-12 rounded-full mr-4 border-2 border-primary-light bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                  JD
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">John Doe</h3>
                  <p className="text-xs text-gray-500">UI Designer</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-12 h-12 rounded-full mr-4 border-2 border-primary-light bg-pink-100 flex items-center justify-center text-pink-500 font-bold">
                  JS
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Jane Smith</h3>
                  <p className="text-xs text-gray-500">Frontend Developer</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-12 h-12 rounded-full mr-4 border-2 border-primary-light bg-green-100 flex items-center justify-center text-green-500 font-bold">
                  AJ
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Alex Johnson</h3>
                  <p className="text-xs text-gray-500">Backend Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Tasks Chart */}
      <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tasks Completed</h2>
          <div className="flex space-x-3">
            <button className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-full shadow-sm">
              Weekly
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
              Monthly
            </button>
          </div>
        </div>
        
        <div className="h-72 mt-4">
          <Line data={completedTasksData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
