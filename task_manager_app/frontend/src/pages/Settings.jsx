import React, { useState, useEffect } from 'react';
import { FiSave, FiMoon, FiSun, FiGlobe, FiBell, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { THEMES, LANGUAGES } from '../utils/constants';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: THEMES.LIGHT,
    language: LANGUAGES.ENGLISH,
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      taskAssignments: true,
      taskComments: true
    },
    privacy: {
      showOnlineStatus: true,
      showEmail: false,
      showActivity: true
    }
  });
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Error parsing settings:', err);
      }
    }
  }, []);
  
  // Handle settings changes
  const handleThemeChange = (theme) => {
    setSettings({
      ...settings,
      theme
    });
  };
  
  const handleLanguageChange = (e) => {
    setSettings({
      ...settings,
      language: e.target.value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked
      }
    });
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [name]: checked
      }
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      localStorage.setItem('settings', JSON.stringify(settings));
      
      // Apply theme
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(`theme-${settings.theme}`);
      
      setSuccess('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real application, you would call an API to delete the account
      alert('Account deletion would be implemented in a real application.');
      logout();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Customize your application preferences</p>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appearance */}
        <div className="md:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary-light text-primary mr-3">
                {settings.theme === THEMES.DARK ? <FiMoon size={20} /> : <FiSun size={20} />}
              </div>
              <h2 className="text-xl font-bold text-gray-800">Appearance</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`p-3 rounded-lg border ${
                    settings.theme === THEMES.LIGHT
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-300 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleThemeChange(THEMES.LIGHT)}
                >
                  <FiSun size={20} className="mb-1" />
                  <span className="text-sm">Light</span>
                </button>
                
                <button
                  type="button"
                  className={`p-3 rounded-lg border ${
                    settings.theme === THEMES.DARK
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-300 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleThemeChange(THEMES.DARK)}
                >
                  <FiMoon size={20} className="mb-1" />
                  <span className="text-sm">Dark</span>
                </button>
                
                <button
                  type="button"
                  className={`p-3 rounded-lg border ${
                    settings.theme === THEMES.SYSTEM
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-300 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleThemeChange(THEMES.SYSTEM)}
                >
                  <div className="flex mb-1">
                    <FiSun size={16} className="mr-1" />
                    <FiMoon size={16} />
                  </div>
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="language">
                Language
              </label>
              <select
                id="language"
                className="input"
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value={LANGUAGES.ENGLISH}>English</option>
                <option value={LANGUAGES.SPANISH}>Spanish</option>
                <option value={LANGUAGES.FRENCH}>French</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="md:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary-light text-primary mr-3">
                <FiBell size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="email"
                    id="email"
                    checked={settings.notifications.email}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="email"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="push" className="text-sm font-medium text-gray-700">
                  Push Notifications
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="push"
                    id="push"
                    checked={settings.notifications.push}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="push"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="taskReminders" className="text-sm font-medium text-gray-700">
                  Task Reminders
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="taskReminders"
                    id="taskReminders"
                    checked={settings.notifications.taskReminders}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="taskReminders"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="taskAssignments" className="text-sm font-medium text-gray-700">
                  Task Assignments
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="taskAssignments"
                    id="taskAssignments"
                    checked={settings.notifications.taskAssignments}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="taskAssignments"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="taskComments" className="text-sm font-medium text-gray-700">
                  Task Comments
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="taskComments"
                    id="taskComments"
                    checked={settings.notifications.taskComments}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="taskComments"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy */}
        <div className="md:col-span-1">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary-light text-primary mr-3">
                <FiShield size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="showOnlineStatus" className="text-sm font-medium text-gray-700">
                  Show Online Status
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="showOnlineStatus"
                    id="showOnlineStatus"
                    checked={settings.privacy.showOnlineStatus}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="showOnlineStatus"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="showEmail" className="text-sm font-medium text-gray-700">
                  Show Email to Team Members
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="showEmail"
                    id="showEmail"
                    checked={settings.privacy.showEmail}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="showEmail"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="showActivity" className="text-sm font-medium text-gray-700">
                  Show Activity Status
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="showActivity"
                    id="showActivity"
                    checked={settings.privacy.showActivity}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="showActivity"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="md:col-span-3">
          <div className="flex justify-between">
            <button
              type="button"
              className="btn btn-primary inline-flex items-center"
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn bg-red-500 text-white hover:bg-red-600 inline-flex items-center"
              onClick={handleDeleteAccount}
            >
              <FiTrash2 className="mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Additional CSS for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #a855f7;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #a855f7;
        }
      `}</style>
    </div>
  );
};

export default Settings;
