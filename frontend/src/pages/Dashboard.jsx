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
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderColor: 'rgba(37, 99, 235, 1)',
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
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderColor: 'rgba(37, 99, 235, 1)',
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
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
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
        backgroundColor: 'rgba(17, 20, 32, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#1f2937',
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 my-8 mx-auto max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
        <div className="flex items-center mb-3">
          <svg className="mr-2 h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
        </div>
        <p className="ml-8">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="ml-8 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-400 transition-colors hover:text-red-300"
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400 text-lg">Here's an overview of your tasks</p>
        </div>
        <div>
          <Link
            to="/tasks/new"
            className="btn btn-primary inline-flex items-center px-5 py-2.5 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-blue-500 p-5 transition-colors duration-200">
          <div className="flex items-center">
            <div className="mr-5 rounded-full bg-blue-500/10 p-4 text-blue-400">
              <FiCalendar size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Tasks</p>
              <h3 className="text-2xl font-bold text-white">{taskStats.total}</h3>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-green-500 p-5 transition-colors duration-200">
          <div className="flex items-center">
            <div className="mr-5 rounded-full bg-green-500/10 p-4 text-green-400">
              <FiCheckCircle size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-white">{taskStats.completed}</h3>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-purple-500 p-5 transition-colors duration-200">
          <div className="flex items-center">
            <div className="mr-5 rounded-full bg-purple-500/10 p-4 text-purple-400">
              <FiClock size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">In Progress</p>
              <h3 className="text-2xl font-bold text-white">{taskStats.inProgress}</h3>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-amber-500 p-5 transition-colors duration-200">
          <div className="flex items-center">
            <div className="mr-5 rounded-full bg-amber-500/10 p-4 text-amber-400">
              <FiCalendar size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Upcoming</p>
              <h3 className="text-2xl font-bold text-white">{taskStats.upcoming}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="card p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Today's Tasks</h2>
              <Link 
                to="/tasks" 
                className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline"
              >
                View All
              </Link>
            </div>
            
            {todayTasks.length > 0 ? (
              <div className="space-y-5">
                {todayTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className="rounded-lg border border-gray-800 border-white/5 bg-[#161926] p-5 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium text-white text-lg mb-2">{task.title}</h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center mt-3">
                          <div className="flex -space-x-2 mr-3">
                            {task.assignees && task.assignees.map((assignee, index) => (
                              <img 
                                key={index}
                                className="h-7 w-7 rounded-full border-2 border-gray-800"
                                src={assignee.avatar || 'https://via.placeholder.com/150'}
                                alt={assignee.username}
                                title={assignee.username}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {task.dueTime ? `Due at ${task.dueTime}` : 'No due time'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          task.priority === TASK_PRIORITIES.HIGH 
                            ? 'border border-red-500/20 bg-red-500/10 text-red-400' 
                            : task.priority === TASK_PRIORITIES.MEDIUM 
                            ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400' 
                            : 'border border-green-500/20 bg-green-500/10 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                        
                        <div className="mt-3 w-24">
                          <div className="h-2.5 w-full rounded-full bg-[#161926]">
                            <div 
                              className="h-2.5 animate-progress rounded-full bg-blue-600" 
                              style={{ width: `${task.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="mt-1 block text-right text-xs text-gray-600">
                            {task.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/5 bg-[#0d0f14] py-10 text-center">
                <p className="mb-4 text-gray-400">No tasks scheduled for today</p>
                <Link
                  to="/tasks/new"
                  className="mt-2 inline-flex items-center font-medium text-blue-400 hover:text-blue-300"
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
          <div className="card p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Team Members</h2>
              <Link 
                to="/team" 
                className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center rounded-lg p-3 transition-colors hover:bg-[#161926]">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500/30 bg-blue-500/10 text-sm font-bold text-blue-400">
                  JD
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-white">John Doe</h3>
                  <p className="text-xs text-gray-600">UI Designer</p>
                </div>
              </div>
              
              <div className="flex items-center rounded-lg p-3 transition-colors hover:bg-[#161926]">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-pink-500/30 bg-pink-500/10 text-sm font-bold text-pink-400">
                  JS
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-white">Jane Smith</h3>
                  <p className="text-xs text-gray-600">Frontend Developer</p>
                </div>
              </div>
              
              <div className="flex items-center rounded-lg p-3 transition-colors hover:bg-[#161926]">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500/30 bg-green-500/10 text-sm font-bold text-green-400">
                  AJ
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Alex Johnson</h3>
                  <p className="text-xs text-gray-600">Backend Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Tasks Chart */}
      <div className="card p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Tasks Completed</h2>
          <div className="flex space-x-3">
            <button className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
              Weekly
            </button>
            <button className="rounded-full border border-white/5 bg-[#161926] px-4 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:border-gray-800 hover:text-white">
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
