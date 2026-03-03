import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { supabase } from '../../supabaseClient';

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
      const { data, error: fetchError } = await supabase.from('bookings').select('*');
      if (fetchError) throw new Error(fetchError.message || 'Failed to load analytics');
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
    return <LoadingSpinner size="large" message="Loading analytics..." />;
  }
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
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
    <div>
      <h1>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        <div className="stat-card"><h3>Total Revenue</h3><p className="stat-number">${totals.totalRevenue.toLocaleString()}</p></div>
        <div className="stat-card"><h3>Total Bookings</h3><p className="stat-number">{totals.totalBookings}</p></div>
        <div className="stat-card"><h3>Active Bookings</h3><p className="stat-number">{totals.activeBookings}</p></div>
        <div className="stat-card"><h3>Occupancy Rate</h3><p className="stat-number">{occupancyRate}%</p></div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
