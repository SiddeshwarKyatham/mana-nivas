import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RoomSearch, { SearchFilters } from '../components/rooms/RoomSearch';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { supabase } from '../supabaseClient';
import './rooms.css';

interface Room {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  amenities: string[];
  images: string[];
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [showError, setShowError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('rooms')
        .select('*');

      if (supabaseError) {
        throw new Error(supabaseError.message || 'Failed to fetch rooms');
      }

      const normalizedRooms: Room[] = (data || []).map((room: any) => ({
        _id: String(room.id ?? room._id),
        name: room.name || '',
        type: room.type || '',
        description: room.description || '',
        price: Number(room.price ?? 0),
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
        images: Array.isArray(room.images) ? room.images : [],
      }));

      setRooms(normalizedRooms);
      setFilteredRooms(normalizedRooms);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    if (!rooms) return;
    
    let filtered = [...rooms];

    // Filter by price range
    filtered = filtered.filter(room => 
      room.price >= filters.priceRange[0] && 
      room.price <= filters.priceRange[1]
    );

    // Filter by room type
    if (filters.roomType) {
      filtered = filtered.filter(room => room.type === filters.roomType);
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(room =>
        filters.amenities.every(amenity => room.amenities.includes(amenity))
      );
    }

    setFilteredRooms(filtered);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setShowError(false);
    fetchRooms();
  };

  if (loading && retryCount === 0) {
    return (
      <div className="rooms-page">
        <div className="rooms-header">
          <h1 className="section-title">Our Rooms</h1>
          <p>Discover our luxurious accommodations designed for your comfort</p>
        </div>
        <LoadingSpinner size="large" message="Loading rooms..." />
      </div>
    );
  }

  if (error && showError) {
    return (
      <div className="rooms-page">
        <div className="rooms-header">
          <h1 className="section-title">Our Rooms</h1>
          <p>Discover our luxurious accommodations designed for your comfort</p>
        </div>
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)}
          type="error"
        />
        <div className="error-container">
          <div className="error-content">
            <h3>Unable to load rooms</h3>
            <p>We're having trouble connecting to our servers. Please check your internet connection and try again.</p>
            <button onClick={handleRetry} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rooms-header"
      >
        <h1 className="section-title">Our Rooms</h1>
        <p>Discover our luxurious accommodations designed for your comfort</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <RoomSearch onSearch={handleSearch} />
      </motion.div>

      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner size="medium" message="Refreshing rooms..." />
        </div>
      )}

      <div className="rooms-grid">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <motion.div
              key={room._id}
              className="room-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="room-image">
                <img 
                  src={room.images && room.images.length > 0 ? room.images[0] : '/placeholder-room.jpg'}
                  alt={room.name} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-room.jpg';
                  }}
                />
                <div className="room-overlay">
                  <span className="room-type-badge">{room.type}</span>
                </div>
              </div>
              <div className="room-info">
                <h2 className="room-name">{room.name}</h2>
                <p className="room-description">{room.description}</p>
                <div className="room-amenities">
                  {room.amenities && room.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="amenity">{amenity}</span>
                  ))}
                  {room.amenities && room.amenities.length > 3 && (
                    <span className="amenity more">+{room.amenities.length - 3} more</span>
                  )}
                </div>
                <div className="room-price">
                  <span className="amount">${room.price.toLocaleString()}</span>
                  <span className="per-night">per night</span>
                </div>
                <Link to={`/rooms/${room._id}`} className="btn-primary view-details">View Details</Link>
              </div>
            </motion.div>
          ))
        ) : rooms && rooms.length > 0 ? (
          <div className="no-rooms">
            <div className="no-rooms-content">
              <h3>No rooms found</h3>
              <p>No rooms match your current search criteria. Try adjusting your filters.</p>
              <button 
                onClick={() => setFilteredRooms(rooms)} 
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="no-rooms">
            <div className="no-rooms-content">
              <h3>No rooms available</h3>
              <p>We're currently setting up our room inventory. Please check back soon!</p>
            </div>
          </div>
        )}
      </div>

      {error && !showError && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(true)}
          type="error"
        />
      )}
    </div>
  );
};

export default Rooms; 
