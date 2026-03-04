import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { BookingPayload, Room, toRoom } from '../../types/supabase';
import { useAuth } from '../../context/AuthContext';
import { ensureRoomAvailability } from '../../lib/booking';
import './RoomDetails.css';

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const nightlyRate = room?.price ?? 0;
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const bookingError = error && room ? error : '';

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase.from('rooms').select('*').eq('id', id).single();
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to load room details');
      }
      setRoom(toRoom(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (!room) {
      setError('Room information not available');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const bookingData: BookingPayload = {
        roomId: room.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        totalPrice: calculateTotal(),
      };

      await ensureRoomAvailability(bookingData.roomId, bookingData.checkIn, bookingData.checkOut);

      const { data: createdBooking, error: createError } = await supabase
        .from('bookings')
        .insert({
          user_id: user._id,
          room_id: bookingData.roomId,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          total_price: bookingData.totalPrice,
        })
        .select('*')
        .single();

      if (createError) {
        throw new Error(createError.message || 'Failed to create booking');
      }

      navigate('/booking-confirmation', {
        state: {
          booking: createdBooking,
          room,
          checkIn,
          checkOut,
          total: calculateTotal(),
        },
      });

    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!room || nights <= 0) return 0;
    return room.price * nights;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Room not found'}</p>
        <button onClick={() => navigate('/rooms')} className="back-button">
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="room-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="room-details-header">
        <h1>{room.name}</h1>
        <p className="room-type">{room.type}</p>
      </div>

      <div className="room-gallery">
        <div className="main-image">
          <img 
            src={room.images[selectedImage] 
              ? (room.images[selectedImage].startsWith('http') 
                  ? room.images[selectedImage] 
                  : room.images[selectedImage])
              : '/placeholder-room.jpg'} 
            alt={room.name} 
          />
        </div>
        {room.images.length > 1 && (
          <div className="thumbnail-grid">
            {room.images.map((image, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={image.startsWith('http') 
                    ? image 
                    : image} 
                  alt={`${room.name} ${index + 1}`} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="room-info-grid">
        <section className="room-main-content">
          <div className="room-description">
            <h2>Description</h2>
            <p>{room.description}</p>
          </div>

          <div className="room-amenities">
            <h2>Included Amenities</h2>
            <ul className="amenities-list">
              {room.amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="room-booking">
          <h3>Reserve This Suite</h3>
          <p className="booking-note">Best available rate for your selected stay dates.</p>

          <div className="booking-dates">
            <div className="date-inputs">
              <div className="date-input">
                <label htmlFor="checkIn">Check-in Date</label>
                <input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-input">
                <label htmlFor="checkOut">Check-out Date</label>
                <input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {bookingError && (
            <div className="booking-inline-error" role="alert">
              {bookingError}
            </div>
          )}

          <div className="price-tag">
            <div className="rate-row">
              <span className="rate-label">Nightly Rate</span>
              <span className="amount">${nightlyRate.toLocaleString()}</span>
            </div>
            <div className="rate-row subtle">
              <span>Stay length</span>
              <span>{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '-'}</span>
            </div>
            <div className="rate-row total">
              <span>Total</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <ul className="booking-trust-list">
            <li>Secure checkout with encrypted payment flow</li>
            <li>No cancellation penalty within allowed policy window</li>
          </ul>

          <button
            className="book-now-btn"
            onClick={handleBookNow}
            disabled={!checkIn || !checkOut || nights <= 0 || bookingLoading}
          >
            {bookingLoading ? 'Creating Booking...' : 'Book Now'}
          </button>
        </aside>
      </div>
    </motion.div>
  );
};

export default RoomDetails; 
