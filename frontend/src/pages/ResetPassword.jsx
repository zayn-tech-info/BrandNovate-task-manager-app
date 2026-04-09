import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore as useAuth } from '../stores/auth.store';
import { Lock, Eye, EyeOff, ArrowLeft, CircleCheck, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};

    if (!token) {
      newErrors.token = 'Reset token is missing';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await resetPassword(token, newPassword);
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({
        form: error.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isSuccess) {
    return (
      <div className="p-6 text-center md:p-8">
        <div className="mb-4 flex justify-center">
          <CircleCheck className="h-14 w-14 text-emerald-400" strokeWidth={1.75} />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white">
          Password Reset Successful!
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          Your password has been reset successfully. You will be redirected to the login page in a few
          seconds.
        </p>
        <Link to="/login" className="btn btn-primary inline-block px-6">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-white">
        Reset Password
      </h2>
      <p className="mb-6 text-center text-sm text-gray-400">Enter your new password below.</p>

      {errors.form && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-200">
          {errors.form}
        </div>
      )}

      {errors.token && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-200">
          {errors.token}. Please check your reset link or request a new one.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="newPassword">
            New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              className={`input pl-10 ${errors.newPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-600 hover:text-gray-400" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4 text-gray-600 hover:text-gray-400" strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.newPassword && <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-600 hover:text-gray-400" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4 text-gray-600 hover:text-gray-400" strokeWidth={2} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full py-2.5" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" strokeWidth={2} />
              Resetting...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
