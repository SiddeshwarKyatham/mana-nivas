import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../assets/logo.jpg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logo} alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
          MANA NIVAS
        </Link>

        <button 
          className="navbar-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/rooms" className="navbar-link">Rooms</Link>
          <Link to="/Dining" className="navbar-link">Dining</Link>
          <Link to="/Spa" className="navbar-link">Spa</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
        </div>

        <div className={`navbar-actions ${isMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-button login">Login</Link>
              <Link to="/register" className="navbar-button signup">Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'admin' ? (
                <Link to="/admin" className="navbar-button dashboard">Admin</Link>
              ) : (
                <Link to="/dashboard" className="navbar-button dashboard">Dashboard</Link>
              )}
              <button onClick={handleLogout} className="navbar-button logout" style={{background: 'var(--charcoal)', color: 'var(--ivory)'}}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

 