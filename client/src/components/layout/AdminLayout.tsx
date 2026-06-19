import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers, FaBed, FaCalendarAlt, FaChartBar,
  FaTachometerAlt, FaSignOutAlt, FaBell, FaCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../pages/AdminDashboard.css';

const NAV_ITEMS = [
  { icon: FaTachometerAlt, label: 'Dashboard', to: '/admin' },
  { icon: FaBed,           label: 'Rooms',     to: '/admin/rooms' },
  { icon: FaCalendarAlt,  label: 'Bookings',   to: '/admin/bookings' },
  { icon: FaUsers,         label: 'Users',      to: '/admin/users' },
  { icon: FaChartBar,      label: 'Analytics',  to: '/admin/analytics' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/admin':
        return {
          title: 'Control Panel',
          sub: `Live overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
        };
      case '/admin/rooms':
        return {
          title: 'Room Management',
          sub: 'Manage luxury suites, pricing, live status and image portfolios'
        };
      case '/admin/bookings':
        return {
          title: 'Bookings Control',
          sub: 'Live guest reservation lists, checkout states and audit controls'
        };
      case '/admin/users':
        return {
          title: 'User Management',
          sub: 'View registered profiles, contact details and administrative status'
        };
      case '/admin/analytics':
        return {
          title: 'Business Analytics',
          sub: 'Realtime intelligence, occupancy metrics and cumulative revenue charts'
        };
      default:
        return {
          title: 'Admin Command Center',
          sub: 'MANA NIVAS Operations Control'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="cmd-shell">
      {/* ── Sidebar ── */}
      <aside className="cmd-sidebar">
        <div className="cmd-brand">
          <span className="cmd-brand-dot" />
          <span>MANA NIVAS</span>
        </div>

        <nav className="cmd-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`cmd-nav-link${isActive ? ' active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    className="cmd-nav-indicator"
                    layoutId="adminNavIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="cmd-sidebar-footer">
          <div className="cmd-user-chip">
            <div className="cmd-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="cmd-user-info">
              <span className="cmd-user-name">{user?.name || 'Admin'}</span>
              <span className="cmd-user-role">Administrator</span>
            </div>
          </div>
          <button className="cmd-logout" onClick={logout} title="Sign out">
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cmd-main">
        {/* Topbar */}
        <div className="cmd-topbar">
          <div className="cmd-page-title">
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>
          <div className="cmd-topbar-actions">
            <div className="cmd-live-badge">
              <FaCircle className="live-dot" />
              Live
            </div>
            <button className="cmd-icon-btn"><FaBell /></button>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="admin-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
