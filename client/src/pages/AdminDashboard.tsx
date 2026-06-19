import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FaUsers, FaBed, FaCalendarAlt, FaChartBar,
  FaTachometerAlt, FaSignOutAlt, FaBell, FaCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import './AdminDashboard.css';

interface DashboardBooking {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price?: number;
  profiles: { full_name: string | null; phone: string | null } | null;
  rooms: { name: string; type: string } | null;
}

interface DashboardUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string | null;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const NAV_ITEMS = [
  { icon: FaTachometerAlt, label: 'Dashboard', to: '/admin' },
  { icon: FaBed,           label: 'Rooms',     to: '/admin/rooms' },
  { icon: FaCalendarAlt,  label: 'Bookings',   to: '/admin/bookings' },
  { icon: FaUsers,         label: 'Users',      to: '/admin/users' },
  { icon: FaChartBar,      label: 'Analytics',  to: '/admin/analytics' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchBookings();
    fetchUsers();
  }, [authLoading, isAuthenticated, user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/bookings');
      setBookings((data as unknown as DashboardBooking[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api.get('/users');
      setUsers((data as DashboardUser[]) || []);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      await fetchBookings();
    } finally {
      setUpdatingId(null);
      setPendingCancelId(null);
    }
  };

  const countBooked    = bookings.filter(b => b.status === 'booked').length;
  const countCancelled = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue   = bookings.filter(b => b.status === 'booked').reduce((s, b) => s + (b.total_price || 0), 0);

  if (authLoading) {
    return <div className="cmd-loading"><LoadingSpinner size="large" message="Authenticating..." /></div>;
  }

  return (
    <div className="admin-dashboard-container">
      {/* KPI Grid */}
      <motion.div className="cmd-kpi-grid" variants={containerVariants} initial="hidden" animate="show">
          {[
            { label: 'Total Bookings',      value: bookings.length, sub: `${countBooked} active`,  color: '#D4AF37', glow: 'rgba(212,175,55,0.3)'  },
            { label: 'Active Reservations', value: countBooked,     sub: 'Currently booked',       color: '#5C946E', glow: 'rgba(92,148,110,0.3)'  },
            { label: 'Cancellations',       value: countCancelled,  sub: 'All time',                color: '#D45C5C', glow: 'rgba(212,92,92,0.28)'  },
            { label: 'Registered Users',    value: users.length,    sub: 'Accounts total',          color: '#E5C77B', glow: 'rgba(229,199,123,0.28)'},
          ].map((kpi, i) => (
            <motion.div
              key={i}
              className="cmd-kpi-card"
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: `0 20px 50px ${kpi.glow}` }}
              style={{ '--kpi-color': kpi.color, '--kpi-glow': kpi.glow } as React.CSSProperties}
            >
              <div className="cmd-kpi-glow-ring" />
              <span className="cmd-kpi-label">{kpi.label}</span>
              <span className="cmd-kpi-value">{kpi.value}</span>
              <span className="cmd-kpi-sub">{kpi.sub}</span>
              <div className="cmd-kpi-bar">
                <motion.div
                  className="cmd-kpi-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (kpi.value / Math.max(bookings.length || 1, users.length || 1)) * 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue Banner */}
        <motion.div
          className="cmd-revenue-banner"
          initial={{ opacity: 0, scaleX: 0.95 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="cmd-revenue-label">Total Revenue (Active Bookings)</div>
          <div className="cmd-revenue-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="cmd-revenue-shimmer" />
        </motion.div>

        {/* Activity + Users Split */}
        <motion.div className="cmd-panels" variants={containerVariants} initial="hidden" animate="show">
          {/* Recent Bookings feed */}
          <motion.div className="cmd-panel" variants={itemVariants}>
            <div className="cmd-panel-header">
              <span>Recent Bookings</span>
              <Link to="/admin/bookings" className="cmd-view-all">View All →</Link>
            </div>
            <div className="cmd-feed">
              {loading ? (
                <div className="cmd-panel-loader"><LoadingSpinner size="medium" /></div>
              ) : bookings.slice(0, 6).map((b, i) => (
                <motion.div
                  key={b.id}
                  className="cmd-feed-row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ backgroundColor: 'rgba(212,175,55,0.04)' }}
                >
                  <div className="cmd-feed-avatar">
                    {b.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="cmd-feed-info">
                    <strong>{b.profiles?.full_name || 'Unknown'}</strong>
                    <span>{b.rooms?.name || 'Unknown Room'} · {new Date(b.check_in).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="cmd-feed-right">
                    <span className={`cmd-pill ${b.status}`}>{b.status}</span>
                    {b.status === 'booked' && (
                      <button
                        className="cmd-cancel-btn"
                        disabled={updatingId === b.id}
                        onClick={() => setPendingCancelId(b.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Users panel */}
          <motion.div className="cmd-panel" variants={itemVariants}>
            <div className="cmd-panel-header">
              <span>Recent Users</span>
              <Link to="/admin/users" className="cmd-view-all">View All →</Link>
            </div>
            <div className="cmd-feed">
              {usersLoading ? (
                <div className="cmd-panel-loader"><LoadingSpinner size="medium" /></div>
              ) : users.slice(0, 6).map((u, i) => (
                <motion.div
                  key={u.id}
                  className="cmd-feed-row"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ backgroundColor: 'rgba(212,175,55,0.04)' }}
                >
                  <div className="cmd-feed-avatar alt">
                    {u.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="cmd-feed-info">
                    <strong>{u.full_name || 'Unnamed'}</strong>
                    <span>{u.phone || 'No phone · '}{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <div className="cmd-feed-right">
                    <span className={`cmd-role-badge ${u.role}`}>{u.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {error && <p className="cmd-error">{error}</p>}

      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel booking?"
        message="This will mark the booking as cancelled. The record is kept for audit purposes."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep"
        danger
        busy={Boolean(updatingId)}
        onCancel={() => setPendingCancelId(null)}
        onConfirm={() => { if (pendingCancelId) handleCancel(pendingCancelId); }}
      />
    </div>
  );
};

export default AdminDashboard;
