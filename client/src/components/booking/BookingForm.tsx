import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './BookingForm.css';
import { supabase } from '../../supabaseClient';
import { BookingPayload, Room, toRoom } from '../../types/supabase';
import { useAuth } from '../../context/AuthContext';

interface BookingFormData {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  specialRequests: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0,
    specialRequests: '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: ''
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch room details if roomId is provided
  useEffect(() => {
    if (roomId) {
      const fetchRoom = async () => {
        try {
          const { data, error: fetchError } = await supabase.from('rooms').select('*').eq('id', roomId).single();
          if (fetchError) {
            throw new Error(fetchError.message || 'Failed to load room details');
          }
          setRoom(toRoom(data));
        } catch (err) {
          console.error('Error fetching room:', err);
          setError('Failed to load room details');
        }
      };
      fetchRoom();
    }
  }, [roomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      checkIn: start,
      checkOut: end
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!room) {
      setError('No room selected');
      setIsSubmitting(false);
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      setError('Please select check-in and check-out dates');
      setIsSubmitting(false);
      return;
    }

    if (!user?._id) {
      setError('Please log in to create a booking');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const nights = Math.ceil(
        (formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const bookingData: BookingPayload = {
        roomId: room.id,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        totalPrice: room.price * nights,
      };

      const { data: response, error: createError } = await supabase
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
        throw new Error(createError.message || 'Booking failed. Please try again.');
      }
      
      // Navigate to confirmation page with booking data
      navigate('/booking-confirmation', { 
        state: { 
          bookingData: response 
        } 
      });
    } catch (error: any) {
      console.error('Booking failed:', error);
      setError(error.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  if (!room && roomId) {
    return (
      <div className="booking-form-container">
        <div className="loading">Loading room details...</div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {room && (
        <div className="room-summary">
          <h3>{room.name}</h3>
          <p>{room.description}</p>
          <p>Price: ${room.price}/night</p>
        </div>
      )}

      <div className="booking-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Dates & Guests</span>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Guest Information</span>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {step === 1 && (
          <div className="form-step">
            <h2>Select Dates & Guests</h2>
            <div className="form-group">
              <label>Check-in & Check-out Dates</label>
              <DatePicker
                selected={formData.checkIn}
                onChange={handleDateChange}
                startDate={formData.checkIn}
                endDate={formData.checkOut}
                selectsRange
                minDate={new Date()}
                className="date-picker"
                placeholderText="Select dates"
              />
            </div>
            <div className="form-group">
              <label>Number of Guests</label>
              <div className="guest-selector">
                <div className="guest-type">
                  <label>Adults</label>
                  <input
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                  />
                </div>
                <div className="guest-type">
                  <label>Children</label>
                  <input
                    type="number"
                    name="children"
                    value={formData.children}
                    onChange={handleInputChange}
                    min="0"
                    max="4"
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requests or preferences?"
                rows={4}
              />
            </div>
            <button type="button" onClick={nextStep} className="next-btn">
              Next: Guest Information
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Guest Information</h2>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={prevStep} className="prev-btn">
                Back
              </button>
              <button type="button" onClick={nextStep} className="next-btn">
                Next: Review & Confirm
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Review & Confirm Booking</h2>
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              {room && (
                <div className="summary-item">
                  <span>Room:</span>
                  <span>{room.name}</span>
                </div>
              )}
              <div className="summary-item">
                <span>Check-in:</span>
                <span>{formData.checkIn?.toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <span>Check-out:</span>
                <span>{formData.checkOut?.toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <span>Guests:</span>
                <span>{formData.adults} Adults, {formData.children} Children</span>
              </div>
              <div className="summary-item">
                <span>Guest Name:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="summary-item">
                <span>Contact:</span>
                <span>{formData.email} | {formData.phone}</span>
              </div>
              {formData.specialRequests && (
                <div className="summary-item">
                  <span>Special Requests:</span>
                  <span>{formData.specialRequests}</span>
                </div>
              )}
            </div>
            <div className="button-group">
              <button type="button" onClick={prevStep} className="prev-btn">
                Back
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm; 
