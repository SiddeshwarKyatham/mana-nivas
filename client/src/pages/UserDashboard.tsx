import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { supabase } from '../supabaseClient';
import './UserDashboard.css';

interface DashboardRoom {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  amenities: string[];
  images: string[];
}

interface DashboardBooking {
  _id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  room: DashboardRoom;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user?._id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          room_id,
          check_in,
          check_out,
          total_price,
          status,
          created_at,
          room:rooms (
            id,
            name,
            type,
            price,
            description,
            amenities,
            images
          )
        `)
        .eq('user_id', user._id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        throw new Error(bookingsError.message || 'Failed to fetch bookings');
      }

      const normalizedBookings: DashboardBooking[] = (data || [])
        .filter((row: any) => row.room)
        .map((row: any) => ({
          _id: String(row.id),
          checkIn: String(row.check_in),
          checkOut: String(row.check_out),
          status: String(row.status || 'booked'),
          room: {
            id: String(row.room.id),
            name: String(row.room.name || 'Room'),
            type: String(row.room.type || ''),
            price: Number(row.room.price || 0),
            description: String(row.room.description || ''),
            amenities: Array.isArray(row.room.amenities) ? row.room.amenities : [],
            images: Array.isArray(row.room.images) ? row.room.images : [],
          },
        }));

      setBookings(normalizedBookings);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch bookings');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId);
    try {
      const { error: cancelError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?._id);

      if (cancelError) {
        throw new Error(cancelError.message || 'Failed to cancel booking');
      }

      await fetchBookings();
    } catch (err: any) {
      setError(err?.message || 'Error cancelling booking');
      setShowError(true);
      console.error('Error cancelling booking:', err);
    } finally {
      setCancellingBooking(null);
      setPendingCancelId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'booked':
        return 'booked';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'booked':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const activeBookings = bookings.filter((booking) => booking.status === 'booked').length;
  const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length;

  if (loading) {
    return (
      <div className="user-dashboard">
        <LoadingSpinner size="large" message="Loading your bookings..." />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {showError && error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)}
          type="error"
        />
      )}

      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Manage your bookings and profile</p>
        <div className="dashboard-stats">
          <div className="stat-chip">
            <span className="stat-label">Total</span>
            <span className="stat-value">{bookings.length}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeBookings}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value">{cancelledBookings}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* My Bookings Section */}
        <section className="bookings-section">
          <div className="bookings-header">
            <h2 className="bookings-title">My Bookings</h2>
            <button 
              onClick={() => fetchBookings()} 
              className="refresh-button"
            >
              Refresh Bookings
            </button>
          </div>
          {bookings && bookings.length > 0 ? (
            <div className="bookings-grid">
              {bookings.map((booking: DashboardBooking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.room.name}</h3>
                    <span className={`booking-status ${getStatusClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="label">Check-in:</span>
                      <span className="value">{formatDate(booking.checkIn)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Check-out:</span>
                      <span className="value">{formatDate(booking.checkOut)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Room Type:</span>
                      <span className="value">{booking.room.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span className="value">${booking.room.price.toLocaleString()}/night</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'booked' && (
                      <>
                        <button
                          onClick={() => navigate(`/edit-booking/${booking._id}`)}
                          className="btn-primary"
                        >
                          Edit Booking
                        </button>
                        <button
                          onClick={() => setPendingCancelId(booking._id)}
                          disabled={cancellingBooking === booking._id}
                          className="btn-danger"
                        >
                          {cancellingBooking === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-bookings">
              <p>You don't have any bookings yet.</p>
              <Link to="/rooms" className="btn-primary">Browse Rooms</Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/rooms" className="action-card">
              <h3>Book a Room</h3>
              <p>Find and book your perfect accommodation</p>
            </Link>
            <Link to="/contact" className="action-card">
              <h3>Contact Support</h3>
              <p>Get help with your bookings</p>
            </Link>
            <Link to="/about" className="action-card">
              <h3>Hotel Information</h3>
              <p>Learn more about our amenities</p>
            </Link>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel booking?"
        message="This updates booking status to cancelled and keeps your history."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        danger
        busy={Boolean(cancellingBooking)}
        onCancel={() => setPendingCancelId(null)}
        onConfirm={() => {
          if (pendingCancelId) {
            handleCancelBooking(pendingCancelId);
          }
        }}
      />
    </div>
  );
};

export default UserDashboard; 
