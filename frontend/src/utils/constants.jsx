export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const taskPriorities = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

export const taskStatuses = {
  todo: 'todo',
  inProgress: 'in-progress',
  review: 'review',
  completed: 'completed'
};

export const defaultAvatar = 'https://via.placeholder.com/150';

export const priorityColors = {
  [taskPriorities.low]: 'bg-blue-500',
  [taskPriorities.medium]: 'bg-yellow-500',
  [taskPriorities.high]: 'bg-red-500'
};

export const statusColors = {
  [taskStatuses.todo]: 'bg-gray-500',
  [taskStatuses.inProgress]: 'bg-blue-500',
  [taskStatuses.review]: 'bg-yellow-500',
  [taskStatuses.completed]: 'bg-green-500'
};

export const dateFormats = {
  display: 'MMM DD, YYYY',
  input: 'YYYY-MM-DD',
  displayWithTime: 'MMM DD, YYYY hh:mm A'
};

export const itemsPerPage = 10;

export const storageKeys = {
  user: 'user',
  theme: 'theme',
  language: 'language'
};

export const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

export const languages = {
  english: 'en',
  spanish: 'es',
  french: 'fr'
};
