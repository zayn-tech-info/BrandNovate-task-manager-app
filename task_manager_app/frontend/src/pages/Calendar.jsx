import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import taskService from '../services/task.service';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month'); // 'month', 'week', 'day'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await taskService.getAllTasks();
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setSelectedTasks([]);
  };
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get days from previous month to fill the first week
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const prevMonthDays = [];
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      prevMonthDays.push({
        day: i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Get days from next month to fill the last week
    const totalDaysDisplayed = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalDaysDisplayed - (daysFromPrevMonth + daysInMonth);
    
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    const nextMonthDays = [];
    for (let i = 1; i <= daysFromNextMonth; i++) {
      nextMonthDays.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Get tasks for a specific date
  const getTasksForDate = (day, month, year) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === date.getTime();
    });
  };
  
  // Handle date selection
  const handleDateClick = (day, month, year) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    
    const tasksForDate = getTasksForDate(day, month, year);
    setSelectedTasks(tasksForDate);
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Check if a date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };
  
  // Check if a date is selected
  const isSelected = (day, month, year) => {
    if (!selectedDate) return false;
    
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };
  
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-600">View and manage your tasks by date</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/tasks/new"
            className="btn btn-primary inline-flex items-center"
          >
            <FiPlus className="mr-2" />
            New Task
          </Link>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Calendar controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToPreviousMonth}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={goToNextMonth}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="btn bg-white border border-gray-300 hover:bg-gray-50"
              onClick={goToToday}
            >
              Today
            </button>
            <div className="border-r border-gray-300 h-6 mx-2"></div>
            <div className="flex rounded-md shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-l-md`}
                onClick={() => setCurrentView('month')}
              >
                Month
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-r border-gray-300`}
                onClick={() => setCurrentView('week')}
              >
                Week
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === 'day'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-r border-gray-300 rounded-r-md`}
                onClick={() => setCurrentView('day')}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {currentView === 'month' && (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {weekDays.map((day) => (
                <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {calendarDays.map((day, index) => {
                const tasksForDay = getTasksForDate(day.day, day.month, day.year);
                const isCurrentDay = isToday(day.day, day.month, day.year);
                const isSelectedDay = isSelected(day.day, day.month, day.year);
                
                return (
                  <div
                    key={index}
                    className={`bg-white min-h-[100px] p-2 ${
                      !day.isCurrentMonth ? 'text-gray-400' : ''
                    } ${isCurrentDay ? 'bg-blue-50' : ''} ${
                      isSelectedDay ? 'ring-2 ring-primary ring-inset' : ''
                    }`}
                    onClick={() => handleDateClick(day.day, day.month, day.year)}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium ${
                        isCurrentDay ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                      }`}>
                        {day.day}
                      </span>
                      {tasksForDay.length > 0 && (
                        <span className="text-xs bg-primary text-white rounded-full px-1.5 py-0.5">
                          {tasksForDay.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                      {tasksForDay.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.priority === TASK_PRIORITIES.HIGH
                              ? 'bg-red-100 text-red-800'
                              : task.priority === TASK_PRIORITIES.MEDIUM
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{tasksForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Week view placeholder */}
        {currentView === 'week' && (
          <div className="p-8 text-center text-gray-500">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Week View</h3>
            <p className="mt-1 text-sm text-gray-500">
              Week view is coming soon. Please use Month view for now.
            </p>
          </div>
        )}
        
        {/* Day view placeholder */}
        {currentView === 'day' && (
          <div className="p-8 text-center text-gray-500">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Day View</h3>
            <p className="mt-1 text-sm text-gray-500">
              Day view is coming soon. Please use Month view for now.
            </p>
          </div>
        )}
      </div>
      
      {/* Selected day tasks */}
      {selectedDate && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Tasks for {formatDate(selectedDate)}
          </h3>
          
          {selectedTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedTasks.map((task) => (
                <div key={task.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {task.dueTime ? `Due at ${task.dueTime}` : 'No due time'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === TASK_PRIORITIES.HIGH 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === TASK_PRIORITIES.MEDIUM 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                      
                      <span className={`mt-2 px-2 py-1 text-xs rounded-full ${
                        task.status === TASK_STATUSES.COMPLETED
                          ? 'bg-green-100 text-green-800'
                          : task.status === TASK_STATUSES.IN_PROGRESS
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === TASK_STATUSES.REVIEW
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No tasks scheduled for this day</p>
              <Link
                to="/tasks/new"
                className="mt-2 inline-flex items-center text-primary hover:text-primary-dark"
              >
                <FiPlus className="mr-1" />
                Add a task
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
