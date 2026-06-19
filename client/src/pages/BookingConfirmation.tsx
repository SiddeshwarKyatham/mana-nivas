import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Room } from '../types/hotel';
import './BookingConfirmation.css';

interface BookingConfirmationData {
  booking?: any; // The actual booking from database
  room: Room;
  checkIn: string;
  checkOut: string;
  total: number;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const bookingData = location.state as BookingConfirmationData;

  const calculateNights = () => {
    if (!bookingData?.checkIn || !bookingData?.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const bookingReference = bookingData?.booking?.id
    ? String(bookingData.booking.id).slice(0, 8).toUpperCase()
    : 'PENDING';

  if (!bookingData) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card">
          <h1>Booking Not Found</h1>
          <p>No booking information available.</p>
          <Link to="/" className="home-button">
            <FaHome /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Booking Confirmed!</h1>
        <p className="confirmation-message">
          Thank you for choosing MANA NIVAS. Your booking has been successfully confirmed.
        </p>

        <div className="booking-details">
          <h2>Booking Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Booking Reference:</span>
              <span className="value">MN-{bookingReference}</span>
            </div>
            <div className="detail-item">
              <span className="label">Room:</span>
              <span className="value">{bookingData.room.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Room Type:</span>
              <span className="value">{bookingData.room.type}</span>
            </div>
            <div className="detail-item">
              <span className="label">Check-in:</span>
              <span className="value">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Check-out:</span>
              <span className="value">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Nights:</span>
              <span className="value">{calculateNights()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Price per Night:</span>
              <span className="value">₹{bookingData.room.price.toLocaleString()}</span>
            </div>
            <div className="detail-item total-item">
              <span className="label">Total Amount:</span>
              <span className="value">₹{bookingData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="booking-info">
          <h3><FaCheckCircle /> Booking Information</h3>
          <p>Your booking has been confirmed. A confirmation email has been sent to your email address.</p>
        </div>

        <div className="confirmation-actions">
          <Link to="/dashboard" className="dashboard-button">
            <FaHome /> View My Bookings
          </Link>
          <button className="email-button" onClick={() => window.print()} type="button">
            <FaEnvelope /> Print Confirmation
          </button>
        </div>

        <div className="additional-info">
          <h3>What's Next?</h3>
          <ul>
            <li>A confirmation email has been sent to your registered email address</li>
            <li>Please arrive at the hotel with a valid ID and the credit card used for booking</li>
            <li>Check-in time is from 2:00 PM onwards</li>
            <li>Check-out time is until 11:00 AM</li>
            <li>For any modifications to your booking, please contact our reservations team</li>
            <li>Free cancellation up to 24 hours before check-in</li>
          </ul>
        </div>

        <div className="contact-info">
          <h3>Need Help?</h3>
          <p>Contact our reservations team:</p>
          <p><FaPhone /> +1 (555) 123-4567</p>
          <p><FaEnvelope /> reservations@mananivas.com</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 

