import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
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
    if (window.confirm('Are you sure you want to cancel this booking?')) {
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
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
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
      </div>

      <div className="dashboard-content">
        {/* My Bookings Section */}
        <section className="bookings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Bookings</h2>
            <button 
              onClick={() => fetchBookings()} 
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
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
                    <span className={`status ${getStatusColor(booking.status)}`}>
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
                      <span className="value">${booking.room.price}/night</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'booked' && (
                      <>
                        <button
                          onClick={() => navigate(`/edit-booking/${booking._id}`)}
                          className="btn-primary"
                          style={{ marginRight: '10px' }}
                        >
                          Edit Booking
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
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
              <a href="/rooms" className="btn-primary">Browse Rooms</a>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <a href="/rooms" className="action-card">
              <h3>Book a Room</h3>
              <p>Find and book your perfect accommodation</p>
            </a>
            <a href="/contact" className="action-card">
              <h3>Contact Support</h3>
              <p>Get help with your bookings</p>
            </a>
            <a href="/about" className="action-card">
              <h3>Hotel Information</h3>
              <p>Learn more about our amenities</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboard; 
