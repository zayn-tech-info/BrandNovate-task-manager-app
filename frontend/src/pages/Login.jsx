import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore as useAuth } from '../stores/auth.store';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/tasks');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: error.response?.data?.message || 'Failed to login. Please check your credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-white">
        Login to Your Account
      </h2>

      {errors.form && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-200">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiMail className="h-4 w-4 text-gray-600" />
            </div>
            <input
              id="email"
              type="email"
              className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-400" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiLock className="h-4 w-4 text-gray-600" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <FiEyeOff className="h-4 w-4 text-gray-600 hover:text-gray-400" />
              ) : (
                <FiEye className="h-4 w-4 text-gray-600 hover:text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
        </div>

        <button type="submit" className="btn btn-primary w-full py-2.5" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <ImSpinner2 className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" />
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
