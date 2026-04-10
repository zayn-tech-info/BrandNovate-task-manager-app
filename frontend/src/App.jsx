import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { useAuthStore as useAuth } from './stores/auth.store';

import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppShellSkeleton } from './components/skeletons';

const AuthBootstrapSpinner = () => (
  <div className="flex min-h-[220px] items-center justify-center p-10" role="status" aria-live="polite">
    <ImSpinner2 className="h-8 w-8 animate-spin text-blue-400" aria-hidden />
    <span className="sr-only">Checking session…</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <AppShellSkeleton />;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <AuthBootstrapSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const CatchAllRedirect = () => {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
      </Route>

      <Route path="/" element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}

export default App;
