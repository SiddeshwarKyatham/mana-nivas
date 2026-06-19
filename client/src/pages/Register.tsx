import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LogoLoader from '../components/shared/LogoLoader';
import ErrorAlert from '../components/shared/ErrorAlert';
import { api } from '../lib/api';
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

      await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      navigate('/login', { state: { registered: true } });
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
              <LogoLoader message="Creating Account..." />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="auth-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2>Create Account</h2>
              <p className="auth-subtitle">Join us for an amazing experience</p>
          {showError && errorMessage && (
            <div className="auth-error-wrap">
              <ErrorAlert message={errorMessage} onClose={() => setShowError(false)} type="error" />
            </div>
          )}

          <div className="auth-form-row">
            <div className="form-group floating">
              <input
                className="floating-input"
                type="text"
                id="name"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label htmlFor="name" className="floating-label">Full Name</label>
            </div>
            
            <div className="form-group floating">
              <input
                className="floating-input"
                type="tel"
                id="phone"
                name="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <label htmlFor="phone" className="floating-label">Phone Number</label>
            </div>
          </div>

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

          <div className="auth-form-row">
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

            <div className="form-group floating">
              <div className="password-input-container">
                <input
                  className="floating-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder=" "
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label htmlFor="confirmPassword" className="floating-label">Confirm Password</label>
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
          </div>

          {passwordError && <div className="auth-inline-error">{passwordError}</div>}

          <button className="auth-button btn-primary" type="submit" disabled={loading}>
            Create Account
          </button>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
