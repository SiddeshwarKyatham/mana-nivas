import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LogoLoader from '../components/shared/LogoLoader';
import ErrorAlert from '../components/shared/ErrorAlert';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  // Where to go after login — default /dashboard
  const from = (location.state as any)?.from || '/dashboard';
  // Flag set by Register page
  const justRegistered = (location.state as any)?.registered === true;

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
      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login(response.token, response.user);
      navigate(from, { replace: true });
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
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="auth-form loading-state"
            >
              <LogoLoader message="Authenticating..." />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="auth-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your account</p>

          {justRegistered && (
            <div className="auth-success-wrap">
              <div className="auth-success-alert">✓ Account created successfully! Please sign in.</div>
            </div>
          )}

          {showError && errorMessage && (
            <div className="auth-error-wrap">
              <ErrorAlert message={errorMessage} onClose={() => setShowError(false)} type="error" />
            </div>
          )}

          <div className="form-group floating">
            <input
              className="floating-input"
              type="email"
              id="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <label htmlFor="email" className="floating-label">Email Address</label>
          </div>

          <div className="form-group floating">
            <div className="password-input-container">
              <input
                className="floating-input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label htmlFor="password" className="floating-label">Password</label>
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
            Sign In
          </button>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register" className="auth-link">Create Account</Link>
          </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
