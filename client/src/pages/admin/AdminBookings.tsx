import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { supabase } from '../../supabaseClient';

interface AdminBooking {
  id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  profiles: { id: string; full_name: string | null; phone: string | null } | null;
  rooms: { id: string; name: string; type: string } | null;
}

const AdminBookings: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          total_price,
          status,
          profiles (
            id,
            full_name,
            phone
          ),
          rooms (
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch bookings');
      }

      setBookings((data as any[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') return;
    fetchBookings();
  }, [authLoading, isAuthenticated, user]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Cancel this booking?')) return;
    setUpdatingId(bookingId);
    try {
      const { error: cancelError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      if (cancelError) throw new Error(cancelError.message || 'Error cancelling booking');
      await fetchBookings();
    } catch (err: any) {
      alert(err?.message || 'Error cancelling booking');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner size="large" message="Loading bookings..." />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  const countBooked = bookings.filter((b) => b.status === 'booked').length;
  const countCancelled = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="admin-table-wrapper">
      <h1>Bookings</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div>All: {bookings.length}</div>
        <div>Booked: {countBooked}</div>
        <div>Cancelled: {countCancelled}</div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Room</th>
            <th>Dates</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>
                <div>{b.profiles?.full_name || 'Unknown user'}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{b.profiles?.phone || '-'}</div>
              </td>
              <td>
                <strong>{b.rooms?.name || 'Unknown room'}</strong> {b.rooms?.type ? `(${b.rooms.type})` : ''}
              </td>
              <td>
                {new Date(b.check_in).toLocaleDateString()} - {new Date(b.check_out).toLocaleDateString()}
              </td>
              <td>${Number(b.total_price || 0).toLocaleString()}</td>
              <td>{b.status}</td>
              <td>
                {b.status === 'booked' && (
                  <button disabled={updatingId === b.id} onClick={() => handleCancel(b.id)}>
                    {updatingId === b.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
