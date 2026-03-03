import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './BookingForm.css';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch booking and room details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // For now, we'll need to implement getBookingById in the API
        // This is a placeholder - you'll need to add this API endpoint
        // const bookingData = await getBookingById(bookingId);
        // setBooking(bookingData);
        // setFormData({
        //   checkIn: new Date(bookingData.checkIn),
        //   checkOut: new Date(bookingData.checkOut),
        //   specialRequests: bookingData.specialRequests || ''
        // });
        
        // For now, we'll show a message that editing is not yet implemented
        setError('Edit booking functionality is not yet implemented. Please contact support to modify your booking.');
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
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
    
    try {
      // For now, we'll show a message that editing is not yet implemented
      setError('Edit booking functionality is not yet implemented. Please contact support to modify your booking.');
      
      // TODO: Implement updateBooking API call
      // const response = await updateBooking(bookingId, formData);
      // navigate('/dashboard');
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

  if (error && error.includes('not yet implemented')) {
    return (
      <div className="booking-form-container">
        <div className="error-message">
          {error}
        </div>
        <div className="button-group">
          <button onClick={handleCancel} className="prev-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
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
