import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { BookingPayload, Room, toRoom } from '../types/supabase';
import { useAuth } from '../context/AuthContext';
import { ensureRoomAvailability } from '../lib/booking';
import './payment.css';

interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  city: string;
  zipCode: string;
}

const Payment: React.FC = () => {
  const { roomId, checkIn, checkOut } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
  });

  const nights = React.useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (roomId) {
        try {
          const { data, error: fetchError } = await supabase.from('rooms').select('*').eq('id', roomId).single();
          if (fetchError) {
            throw new Error(fetchError.message || 'Failed to load room details');
          }
          setRoom(toRoom(data));
        } catch (error) {
          console.error('Error fetching room:', error);
          setError('Failed to load room details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    if (!room || nights <= 0) return 0;
    return room.price * nights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    if (!user) {
      setError('Please log in to complete your booking');
      setProcessing(false);
      return;
    }

    if (!room || !checkIn || !checkOut) {
      setError('Missing booking information');
      setProcessing(false);
      return;
    }

    try {
      const bookingData: BookingPayload = {
        roomId: room.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        totalPrice: calculateTotal(),
      };

      await ensureRoomAvailability(bookingData.roomId, bookingData.checkIn, bookingData.checkOut);

      const { data: booking, error: bookingError } = await supabase
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

      if (bookingError) {
        throw new Error(bookingError.message || 'Failed to create booking');
      }

      setTimeout(() => {
        setProcessing(false);
        navigate('/booking-confirmation', {
          state: {
            booking,
            room,
            checkIn,
            checkOut,
            total: calculateTotal(),
          },
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="payment-error">
        <h2>Room not found</h2>
        <button onClick={() => navigate('/rooms')}>Back to Rooms</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="payment-error">
        <h2>Authentication Required</h2>
        <p>Please log in to complete your booking.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="payment-container"
      >
        <div className="payment-header">
          <h1>Complete Your Booking</h1>
          <p>Please provide your payment information to confirm your reservation</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="payment-content">
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <p className="summary-subtitle">Your selected stay details and charges.</p>
            <div className="summary-item">
              <span>Room:</span>
              <span>{room.name}</span>
            </div>
            <div className="summary-item">
              <span>Check-in:</span>
              <span>{new Date(checkIn!).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span>Check-out:</span>
              <span>{new Date(checkOut!).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span>Price per night:</span>
              <span>${room.price.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span>Nights:</span>
              <span>{nights}</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
            <ul className="payment-trust-list">
              <li>Secure and encrypted checkout session</li>
              <li>No hidden processing charges</li>
              <li>Instant confirmation after successful payment</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-section">
              <h3>Payment Information</h3>
              
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength={19}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardHolder">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardHolder"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Billing Address</h3>
              
              <div className="form-group">
                <label htmlFor="billingAddress">Address</label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="payment-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={processing}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay $${calculateTotal().toLocaleString()}`}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment; 
