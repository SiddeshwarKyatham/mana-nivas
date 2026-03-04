import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import RoomSearch, { SearchFilters } from '../components/rooms/RoomSearch';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { supabase } from '../supabaseClient';
import './rooms.css';

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  priceRange: [0, 50000],
  roomType: '',
  amenities: [],
  checkIn: null,
  checkOut: null,
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickType, setQuickType] = useState('');
  const [roomSearchKey, setRoomSearchKey] = useState(0);
  const [filterAnimationTick, setFilterAnimationTick] = useState(0);
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
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch rooms');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const query = (searchParams.get('q') || '').trim();
    const type = (searchParams.get('type') || '').trim();
    setQuickQuery(query);
    setQuickType(type);
  }, [searchParams]);

  useEffect(() => {
    setFilterAnimationTick((prev) => prev + 1);
  }, [quickQuery, quickType, advancedFilters]);

  const handleSearch = (filters: SearchFilters) => {
    setAdvancedFilters(filters);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setShowError(false);
    fetchRooms();
  };

  const clearQueryParam = (key: 'q' | 'type') => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams({});
    setQuickQuery('');
    setQuickType('');
    setAdvancedFilters(DEFAULT_SEARCH_FILTERS);
    setRoomSearchKey((prev) => prev + 1);
  };

  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    filtered = filtered.filter((room) =>
      room.price >= advancedFilters.priceRange[0] && room.price <= advancedFilters.priceRange[1]
    );

    if (advancedFilters.roomType) {
      filtered = filtered.filter((room) => room.type === advancedFilters.roomType);
    }

    if (advancedFilters.amenities.length > 0) {
      filtered = filtered.filter((room) =>
        advancedFilters.amenities.every((amenity) => room.amenities.includes(amenity))
      );
    }

    if (quickQuery) {
      const normalized = quickQuery.toLowerCase();
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(normalized) || room.description.toLowerCase().includes(normalized)
      );
    }

    if (quickType) {
      filtered = filtered.filter((room) => room.type.toLowerCase() === quickType.toLowerCase());
    }

    return filtered;
  }, [rooms, advancedFilters, quickQuery, quickType]);

  const hasInventory = rooms.length > 0;
  const resultsSummary = hasInventory
    ? `Showing ${filteredRooms.length} of ${rooms.length} rooms`
    : 'No rooms currently available';

  if (loading && retryCount === 0) {
    return (
      <div className="rooms-page">
        <div className="rooms-header">
          <h1 className="rooms-title">Our Rooms</h1>
          <p className="rooms-subtitle">Discover our luxurious accommodations designed for your comfort</p>
        </div>
        <LoadingSpinner size="large" message="Loading rooms..." />
      </div>
    );
  }

  if (error && showError) {
    return (
      <div className="rooms-page">
        <div className="rooms-header">
          <h1 className="rooms-title">Our Rooms</h1>
          <p className="rooms-subtitle">Discover our luxurious accommodations designed for your comfort</p>
        </div>
        <div className="rooms-container">
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
        <h1 className="rooms-title">Our Rooms</h1>
        <p className="rooms-subtitle">Discover our luxurious accommodations designed for your comfort</p>
      </motion.div>

      <div className="rooms-container">
        <motion.div
          className="rooms-search-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RoomSearch key={roomSearchKey} onSearch={handleSearch} />
        </motion.div>

        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner size="medium" message="Refreshing rooms..." />
          </div>
        )}

        <div className="rooms-meta">
          <p>{resultsSummary}</p>
        </div>

        {(quickQuery || quickType) && (
          <div className="rooms-active-filters">
            {quickQuery && (
              <button type="button" className="rooms-filter-chip" onClick={() => clearQueryParam('q')}>
                Search: "{quickQuery}" x
              </button>
            )}
            {quickType && (
              <button type="button" className="rooms-filter-chip" onClick={() => clearQueryParam('type')}>
                Type: {quickType} x
              </button>
            )}
            <button type="button" className="rooms-filter-clear" onClick={handleClearAllFilters}>
              Clear All
            </button>
          </div>
        )}

        <div className="rooms-grid">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <motion.div
                key={`${room._id}-${filterAnimationTick}`}
                className="room-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
                  <div className="room-meta-line">
                    <span>{room.type}</span>
                    <span>{room.amenities.length} amenities</span>
                  </div>
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
                    <span className="price-label">Starting from</span>
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
                <p>No rooms match your current search criteria. Try one of these quick actions.</p>
                <div className="no-rooms-actions">
                  {quickQuery && (
                    <button type="button" onClick={() => clearQueryParam('q')} className="btn-secondary">
                      Remove Search Text
                    </button>
                  )}
                  {quickType && (
                    <button type="button" onClick={() => clearQueryParam('type')} className="btn-secondary">
                      Remove Room Type
                    </button>
                  )}
                  <button 
                    onClick={handleClearAllFilters} 
                    className="btn-primary"
                  >
                    Show All Rooms
                  </button>
                </div>
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
      </div>
    </div>
  );
};

export default Rooms; 
