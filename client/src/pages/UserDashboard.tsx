import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { api } from '../lib/api';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';
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
  // Integrate high-prestige SEO titles and meta tags dynamically
  useDocumentMetadata(
    'My Bookings Dashboard',
    'View and manage your current reservations, timeline schedules, and account profiles at Mana Nivas.'
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, logout } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const showProfile = searchParams.get('profile') === 'true' || searchParams.get('tab') === 'profile';

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  // Profile states
  const [isProfileOpen, setIsProfileOpen] = useState(showProfile);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Synchronize modal state when location search query changes (e.g. from navbar clicks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const show = params.get('profile') === 'true' || params.get('tab') === 'profile';
    setIsProfileOpen(show);
  }, [location.search]);

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    navigate('/dashboard', { replace: true });
  };

  const fetchProfile = async () => {
    if (!user?._id) return;
    setFetchingProfile(true);
    setProfileError(null);
    try {
      const data = await api.get('/users/profile');
      if (data) {
        setProfileName(data.full_name || '');
        setProfilePhone(data.phone || '');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setProfileError(err?.message || 'Failed to fetch profile details.');
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setSavingProfile(true);
    setProfileSuccessMessage(null);
    setProfileError(null);

    try {
      const data = await api.put('/users/profile', {
        full_name: profileName,
        phone: profilePhone
      });

      if (data) {
        updateUser({
          ...user,
          name: data.full_name || profileName
        });
        setProfileSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          setProfileSuccessMessage(null);
        }, 4000);
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileError(err?.message || 'Failed to update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const resetProfileForm = () => {
    setProfileName(user?.name || '');
    fetchProfile();
    setProfileSuccessMessage(null);
    setProfileError(null);
  };

  const fetchBookings = async () => {
    if (!user?._id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/bookings');

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
      fetchProfile();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId);
    try {
      await api.put(`/bookings/${bookingId}`, { status: 'cancelled' });

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
                      <span className="label">Room Type:</span>
                      <span className="value">{booking.room.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span className="value">₹{booking.room.price.toLocaleString()} / night</span>
                    </div>
                    
                    {/* Modern Graphic timeline visual representation */}
                    <div className="booking-timeline">
                      <div className="timeline-point checkin">
                        <span className="timeline-date">{formatDate(booking.checkIn)}</span>
                        <span className="timeline-label">Check-in</span>
                      </div>
                      <div className="timeline-line"></div>
                      <div className="timeline-point checkout">
                        <span className="timeline-date">{formatDate(booking.checkOut)}</span>
                        <span className="timeline-label">Check-out</span>
                      </div>
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

      {/* Profile Settings Modal Overlay */}
      {isProfileOpen && (
        <div className="profile-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={handleCloseProfile} aria-label="Close profile">
              ✕
            </button>
            
            <div className="profile-card-header">
              <div className="profile-avatar">
                {profileName ? profileName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="profile-meta">
                <h2>Account Details</h2>
                <p>View and update your personal information</p>
              </div>
            </div>

            {profileError && <div className="profile-error-alert">{profileError}</div>}
            {profileSuccessMessage && (
              <div className="profile-success-alert">
                <span className="success-icon">✓</span> {profileSuccessMessage}
              </div>
            )}

            {fetchingProfile ? (
              <div className="profile-loading-container">
                <LoadingSpinner size="medium" message="Fetching profile details..." />
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <div className="input-container">
                      <span className="input-field-icon">👤</span>
                      <input
                        type="text"
                        id="fullName"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container disabled">
                      <span className="input-field-icon">✉️</span>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="luxury-input disabled-input"
                        title="Email address cannot be changed."
                      />
                    </div>
                    <small className="form-hint-text">Your email address is used for authentication and bookings.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-container">
                      <span className="input-field-icon">📞</span>
                      <input
                        type="tel"
                        id="phone"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="luxury-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="btn-primary profile-submit-btn"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary profile-cancel-btn"
                    onClick={resetProfileForm}
                    disabled={savingProfile}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn-danger profile-logout-btn"
                    onClick={logout}
                    disabled={savingProfile}
                  >
                    Logout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
