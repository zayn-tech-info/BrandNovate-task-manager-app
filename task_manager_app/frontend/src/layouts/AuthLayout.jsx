import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary to-secondary-light">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-white">Task Manager</h1>
              <p className="text-white text-opacity-80 mt-2">Organize your tasks efficiently</p>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <Outlet />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-white text-opacity-80 text-sm">
              &copy; {new Date().getFullYear()} Task Manager. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
