import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { supabase } from '../supabaseClient';
import './auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage('');
    setPasswordError('');

    const validationError = validatePassword(formData.password, formData.confirmPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      setLoading(true);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || 'Signup failed. Please try again.');
      }

      const user = signUpData.user;
      if (!user) {
        throw new Error('Signup completed but no user was returned. Please try logging in.');
      }

      navigate('/login');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <motion.div
          className="auth-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="logo-sparkle"></div>
          <img src="/logo.jpg" alt="Logo" />
        </motion.div>
        <motion.h1
          className="auth-brand"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          MANA NIVAS
        </motion.h1>
        <motion.p
          className="auth-desc"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Your home away from home
        </motion.p>
      </div>

      <div className="auth-right">
        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us for an amazing experience</p>
          {showError && errorMessage && (
            <div className="auth-error-wrap">
              <ErrorAlert message={errorMessage} onClose={() => setShowError(false)} type="error" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              className="auth-input input-primary"
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              className="auth-input input-primary"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              className="auth-input input-primary"
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                className="auth-input input-primary"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                className="auth-input input-primary"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {passwordError && <div className="auth-inline-error">{passwordError}</div>}

          <button className="auth-button btn-primary" type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" message="" /> : 'Create Account'}
          </button>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;
