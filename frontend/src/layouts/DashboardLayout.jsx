import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore as useAuth } from '../stores/auth.store';
import { setDocumentTheme } from '../utils/themeBootstrap';
import { FiSun, FiMoon, FiCheckSquare, FiGrid, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const TaskFlowLogoMark = ({ className = 'h-7 w-7 shrink-0 text-slate-900 dark:text-white' }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="3.5" y="3.5" width="25" height="25" rx="7.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.25" />
    <path
      d="M10 15.5l3.2 3.2 7.8-7.8"
      stroke="#60a5fa"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 21.5h11.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M10 25h9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    setDocumentTheme(theme);
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
    'flex items-center rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-900 transition-colors [&_svg]:shrink-0 [&_svg]:text-current dark:border-white/15 dark:bg-slate-800 dark:text-white dark:[&_svg]:text-white';
  const navInactive =
    'flex items-center rounded-lg px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 [&_svg]:shrink-0 [&_svg]:text-current dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white dark:[&_svg]:text-gray-400 dark:hover:[&_svg]:text-white';

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#0d0f14]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden h-full w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-white/5 dark:bg-[#0a0b0f] lg:static lg:inset-0 lg:flex lg:h-screen ${
          isSidebarOpen
            ? 'translate-x-0 lg:w-64 lg:shrink-0'
            : '-translate-x-full lg:pointer-events-none lg:w-0 lg:min-w-0 lg:translate-x-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-200 px-3 dark:border-white/5">
          <Link to="/tasks" className="flex items-center gap-2.5 text-lg font-semibold text-slate-900 dark:text-white">
            <TaskFlowLogoMark />
            Taskify
          </Link>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
          <div className="mt-auto shrink-0 border-t border-slate-200 pt-4 dark:border-white/5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-500 dark:hover:bg-white/4 dark:hover:text-gray-300"
            >
              <FiLogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-white/5 dark:bg-[#0a0b0f] lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/5">
          <Link to="/tasks" className="flex items-center gap-2.5 text-lg font-semibold text-slate-900 dark:text-white">
            <TaskFlowLogoMark />
            Taskify
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="text-slate-600 transition-colors hover:text-slate-900 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
          <div className="mt-auto shrink-0 border-t border-slate-200 pt-4 dark:border-white/5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-500 dark:hover:bg-white/4 dark:hover:text-gray-300"
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
        <header className="z-10 border-b border-slate-200 bg-white dark:border-white/5 dark:bg-[#0a0b0f]">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <button
                onClick={toggleMobileSidebar}
                className="text-slate-600 transition-colors hover:text-slate-900 focus:outline-none lg:hidden dark:text-gray-500 dark:hover:text-gray-300"
              >
                <FiMenu size={24} />
              </button>
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="ml-4 hidden text-slate-600 transition-colors hover:text-slate-900 focus:outline-none lg:block dark:text-gray-500 dark:hover:text-gray-300"
              >
                <FiMenu size={24} />
              </button>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="mr-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/8 dark:bg-[#111420] dark:text-gray-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiMoon size={16} /> : <FiSun size={16} />}
              </button>
              <div className="relative ml-4">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/15 text-sm font-semibold text-blue-700 dark:bg-blue-600/20 dark:text-blue-400">
                    {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span className="ml-2 hidden text-sm font-medium text-slate-600 md:block dark:text-gray-500">
                    {currentUser?.username || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-6 dark:bg-[#0d0f14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
