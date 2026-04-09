import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore as useAuth } from '../stores/auth.store';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({
        form: error.response?.data?.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-white">
        Forgot Password
      </h2>
      <p className="mb-6 text-center text-sm text-gray-400">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {isSubmitted ? (
        <div className="text-center">
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            Password reset email sent! Please check your inbox.
          </div>
          <p className="mb-4 text-sm text-gray-400">
            If you don&apos;t receive an email within a few minutes, please check your spam folder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2} />
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          {errors.form && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-200">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-600" strokeWidth={2} />
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

            <button type="submit" className="btn btn-primary w-full py-2.5" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" strokeWidth={2} />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
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
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
