import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../assets/logo.jpg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Logo" className="navbar-logo-image" />
          MANA NIVAS
        </Link>

        <button
          className="navbar-menu-button"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>

        <div id="main-navigation" className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Rooms</NavLink>
          <NavLink to="/dining" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Dining</NavLink>
          <NavLink to="/spa" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Spa</NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
        </div>

        <div className={`navbar-actions ${isMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-button login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="navbar-button signup" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'admin' ? (
                <Link to="/admin" className="navbar-button dashboard" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              ) : (
                <Link to="/dashboard" className="navbar-button dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              )}
              <button onClick={handleLogout} className="navbar-button logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
