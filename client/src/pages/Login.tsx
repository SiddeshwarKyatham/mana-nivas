import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { supabase } from '../supabaseClient';
import './auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed. Please try again.');
      }

      navigate('/');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please try again.');
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
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
          {showError && errorMessage && (
            <div className="auth-error-wrap">
              <ErrorAlert message={errorMessage} onClose={() => setShowError(false)} type="error" />
            </div>
          )}

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
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                className="auth-input input-primary"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
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

          <button className="auth-button btn-primary" type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="small" message="" /> : 'Sign In'}
          </button>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register" className="auth-link">Create Account</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
