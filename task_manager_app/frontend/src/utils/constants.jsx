// API URL - Change this to match your backend server URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Task Priorities
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Task Statuses
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed'
};

// Default avatar placeholder
export const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

// Color mapping for priorities
export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: 'bg-blue-500',
  [TASK_PRIORITIES.MEDIUM]: 'bg-yellow-500',
  [TASK_PRIORITIES.HIGH]: 'bg-red-500'
};

// Color mapping for statuses
export const STATUS_COLORS = {
  [TASK_STATUSES.TODO]: 'bg-gray-500',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-blue-500',
  [TASK_STATUSES.REVIEW]: 'bg-yellow-500',
  [TASK_STATUSES.COMPLETED]: 'bg-green-500'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A'
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Language options
export const LANGUAGES = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr'
};
