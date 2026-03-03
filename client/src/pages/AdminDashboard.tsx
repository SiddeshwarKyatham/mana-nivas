import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaBed, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import './AdminDashboard.css';

interface DashboardBooking {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          status,
          profiles ( full_name, phone ),
          rooms ( name, type )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch bookings');
      }

      setBookings((data as DashboardBooking[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const { data, error: fetchError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (fetchError) throw new Error(fetchError.message || 'Failed to fetch users');
      setUsers((data as DashboardUser[]) || []);
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

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

  const countBooked = bookings.filter((b) => b.status === 'booked').length;
  const countCancelled = bookings.filter((b) => b.status === 'cancelled').length;

  if (authLoading) {
    return (
      <div className="admin-dashboard-container">
        <LoadingSpinner size="large" message="Checking admin access..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <Link to="/admin/rooms" className="admin-nav-item"><FaBed /><span>Room Management</span></Link>
          <Link to="/admin/bookings" className="admin-nav-item"><FaCalendarAlt /><span>Bookings</span></Link>
          <Link to="/admin/users" className="admin-nav-item"><FaUsers /><span>User Management</span></Link>
          <Link to="/admin/analytics" className="admin-nav-item"><FaChartBar /><span>Analytics</span></Link>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card"><h3>Total Bookings</h3><p className="stat-number">{bookings.length}</p></div>
        <div className="stat-card"><h3>Booked</h3><p className="stat-number">{countBooked}</p></div>
        <div className="stat-card"><h3>Cancelled</h3><p className="stat-number">{countCancelled}</p></div>
        <div className="stat-card"><h3>Total Users</h3><p className="stat-number">{users.length}</p></div>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div className="admin-table-wrapper">
          <h2>Recent Bookings</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Room</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 20).map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>
                    <div>{b.profiles?.full_name || 'Unknown user'}</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>{b.profiles?.phone || '-'}</div>
                  </td>
                  <td>
                    <strong>{b.rooms?.name || 'Unknown room'}</strong> {b.rooms?.type ? `(${b.rooms.type})` : ''}
                  </td>
                  <td>{new Date(b.check_in).toLocaleDateString()} to {new Date(b.check_out).toLocaleDateString()}</td>
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
      )}

      {usersLoading ? (
        <p>Loading users...</p>
      ) : usersError ? (
        <p style={{ color: 'red' }}>{usersError}</p>
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: '2rem' }}>
          <h2>Recent Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 20).map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || 'Unknown'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
