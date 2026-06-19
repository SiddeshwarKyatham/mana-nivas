import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { BookingPayload, Room, toRoom } from '../../types/supabase';
import { useAuth } from '../../context/AuthContext';
import { ensureRoomAvailability } from '../../lib/booking';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import './RoomDetails.css';

import { api } from '../../lib/api';

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);

  // Set high-prestige SEO details dynamically based on room
  useDocumentMetadata(
    room ? `${room.name} Suite` : 'Room Details',
    room ? room.description : 'Explore premium hotel rooms and luxury suites at Mana Nivas.'
  );
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
      const data = await api.get('/rooms/' + id);
      setRoom(toRoom(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };


  const handleBookNow = () => {
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

    // Redirect the user to the Payment component to complete billing details and create the booking
    navigate(`/payment/${room.id}/${checkIn}/${checkOut}`);
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

      <div className="room-gallery-asymmetric">
        <div className="gallery-main">
          <img 
            src={room.images[0] ? (room.images[0].startsWith('http') ? room.images[0] : room.images[0]) : '/placeholder-room.jpg'} 
            alt={`${room.name} Main`} 
          />
        </div>
        {room.images.length > 1 && (
          <div className="gallery-side">
            <div className="gallery-sub">
              <img 
                src={room.images[1] ? (room.images[1].startsWith('http') ? room.images[1] : room.images[1]) : (room.images[0] || '/placeholder-room.jpg')} 
                alt={`${room.name} View 2`} 
              />
            </div>
            <div className="gallery-sub">
              <img 
                src={room.images[2] ? (room.images[2].startsWith('http') ? room.images[2] : room.images[2]) : (room.images[0] || '/placeholder-room.jpg')} 
                alt={`${room.name} View 3`} 
              />
            </div>
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
              <span className="amount">₹{nightlyRate.toLocaleString()}</span>
            </div>
            <div className="rate-row subtle">
              <span>Stay length</span>
              <span>{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '-'}</span>
            </div>
            <div className="rate-row total">
              <span>Total</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
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
