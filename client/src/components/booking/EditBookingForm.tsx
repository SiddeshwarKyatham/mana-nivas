import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './BookingForm.css';
import { api } from '../../lib/api';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Booking {
  id: string;
}

interface EditBookingFormData {
  checkIn: Date | null;
  checkOut: Date | null;
  specialRequests: string;
}

const EditBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<EditBookingFormData>({
    checkIn: null,
    checkOut: null,
    specialRequests: ''
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch booking and room details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setError('');
        const bookingData = await api.get(`/bookings/${bookingId}`);

        if (bookingData) {
          setBooking({ id: bookingData.id });
          setRoom(bookingData.room);
          setFormData({
            checkIn: bookingData.check_in ? new Date(bookingData.check_in) : null,
            checkOut: bookingData.check_out ? new Date(bookingData.check_out) : null,
            specialRequests: bookingData.special_requests || ''
          });
        }
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      checkIn: start,
      checkOut: end
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.checkIn || !formData.checkOut) {
      setError('Please select check-in and check-out dates');
      setIsSubmitting(false);
      return;
    }

    if (!room) {
      setError('Room details not loaded');
      setIsSubmitting(false);
      return;
    }

    try {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const newTotal = room.price * (nights > 0 ? nights : 1);

      await api.put(`/bookings/${bookingId}`, {
        check_in: formData.checkIn.toISOString(),
        check_out: formData.checkOut.toISOString(),
        total_price: newTotal
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Update failed:', error);
      setError(error.message || 'Update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="booking-form-container">
        <div className="loading">Loading booking details...</div>
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

      <h2>Edit Booking</h2>

      {room && (
        <div className="room-summary">
          <h3>{room.name}</h3>
          <p>{room.description}</p>
          <p>Price: ${room.price}/night</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-step">
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
            <label>Special Requests</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Any special requests or preferences?"
              rows={4}
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={handleCancel} className="prev-btn">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBookingForm;
