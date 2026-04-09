import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore as useAuth } from '../stores/auth.store';
import { FiSun, FiMoon, FiCheckSquare, FiGrid, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <FiGrid size={18} />, label: 'Overview' },
    { path: '/tasks', icon: <FiCheckSquare size={18} />, label: 'Tasks' }
  ];

  const navActive =
    'flex items-center rounded-lg border border-white/8 bg-white/5 px-4 py-3 font-medium text-white transition-colors';
  const navInactive =
    'flex items-center rounded-lg px-4 py-3 text-gray-500 transition-colors hover:bg-white/4 hover:text-gray-300';

  return (
    <div className="flex h-screen bg-[#0d0f14]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-white/5 bg-[#0a0b0f] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden flex-col lg:flex`}
      >
        <div className="flex h-16 items-center justify-center border-b border-white/5">
          <Link to="/tasks" className="text-lg font-semibold text-white">
            TaskFlow
          </Link>
        </div>
        <div className="flex flex-grow flex-col overflow-y-auto p-4">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? navActive : navInactive}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-gray-500 transition-colors hover:bg-white/4 hover:text-gray-300"
            >
              <FiLogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-white/5 bg-[#0a0b0f] transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          <Link to="/tasks" className="text-lg font-semibold text-white">
            TaskFlow
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="text-gray-500 transition-colors hover:text-gray-300 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex flex-grow flex-col overflow-y-auto p-4">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? navActive : navInactive}
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-gray-500 transition-colors hover:bg-white/4 hover:text-gray-300"
            >
              <FiLogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={toggleMobileSidebar}></div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="z-10 border-b border-white/5 bg-[#0a0b0f]">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <button
                onClick={toggleMobileSidebar}
                className="text-gray-500 transition-colors hover:text-gray-300 focus:outline-none lg:hidden"
              >
                <FiMenu size={24} />
              </button>
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="ml-4 hidden text-gray-500 transition-colors hover:text-gray-300 focus:outline-none lg:block"
              >
                <FiMenu size={24} />
              </button>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="mr-3 rounded-xl border border-white/8 bg-[#111420] px-3 py-2 text-gray-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
              </button>
              <div className="relative ml-4">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-400">
                    {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span className="ml-2 hidden text-sm font-medium text-gray-500 md:block">
                    {currentUser?.username || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0d0f14] px-6 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
