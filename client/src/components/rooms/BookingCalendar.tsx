import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingCalendar.css';
import { api } from '../../lib/api';

interface BookingCalendarProps {
  roomId: string;
  onDateSelect?: (date: Date) => void;
}

interface Booking {
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ roomId, onDateSelect }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await api.get(`/rooms/${roomId}/bookings`);

        const mappedBookings: Booking[] = (data || []).map((booking: any) => ({
          checkIn: new Date(booking.check_in),
          checkOut: new Date(booking.check_out),
          status: 'confirmed',
        }));

        setBookings(mappedBookings);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };


    loadBookings();
  }, [roomId]);

  const tileClassName = ({ date }: { date: Date }) => {
    const isBooked = bookings.some((booking) => date >= booking.checkIn && date <= booking.checkOut);
    return isBooked ? 'booked' : '';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const booking = bookings.find((item) => date >= item.checkIn && date <= item.checkOut);

    if (!booking) {
      return null;
    }

    return <div className="booking-status" title={booking.status}>OK</div>;
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="booking-calendar-container">
      <h3>Room Availability</h3>
      <Calendar
        onChange={onDateSelect}
        tileClassName={tileClassName}
        tileContent={tileContent}
        minDate={new Date()}
        className="booking-calendar"
      />
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-color pending"></span>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
