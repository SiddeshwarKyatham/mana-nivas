import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { api } from '../../lib/api';
import '../AdminDashboard.css';

interface AnalyticsBooking {
  id: string;
  status: string;
  total_price: number;
  check_in: string;
  check_out: string;
}

const AdminAnalytics: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<AnalyticsBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/bookings');
      setBookings((data as AnalyticsBooking[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') return;
    load();
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-container admin-subpage">
        <LoadingSpinner size="large" message="Loading analytics..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="admin-dashboard-container admin-subpage">
        <div className="admin-table-wrapper">
          <p className="admin-inline-error">{error}</p>
        </div>
      </div>
    );
  }

  const totals = bookings.reduce(
    (acc, booking) => {
      acc.totalBookings += 1;
      if (booking.status === 'booked') acc.activeBookings += 1;
      if (booking.status !== 'cancelled') acc.totalRevenue += Number(booking.total_price || 0);
      return acc;
    },
    { totalRevenue: 0, totalBookings: 0, activeBookings: 0 }
  );

  const occupancyRate = totals.totalBookings > 0 ? ((totals.activeBookings / totals.totalBookings) * 100).toFixed(1) : '0.0';

  return (
    <div className="admin-dashboard-container admin-subpage">
      <div className="admin-analytics-header">
        <h1>Analytics</h1>
        <p>Live booking and revenue insights from Neon Postgres.</p>
      </div>
      <div className="admin-stats">
        <div className="stat-card"><h3>Total Revenue</h3><p className="stat-number">₹{totals.totalRevenue.toLocaleString()}</p></div>
        <div className="stat-card"><h3>Total Bookings</h3><p className="stat-number">{totals.totalBookings}</p></div>
        <div className="stat-card"><h3>Active Bookings</h3><p className="stat-number">{totals.activeBookings}</p></div>
        <div className="stat-card"><h3>Occupancy Rate</h3><p className="stat-number">{occupancyRate}%</p></div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
