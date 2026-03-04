import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Room, toRoom } from '../types/supabase';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';
import './home.css';

const heroImages = [hero1, hero2, hero3, hero4, hero5];
const heroCaptions = [
  {
    headline: 'Find Your Peace by the Sea',
    subheadline: 'Unwind in luxury with stunning city views and premium amenities.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Timeless Heritage, Modern Comfort',
    subheadline: 'Experience the best of both worlds in our beautifully restored hotel.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Where Elegance Meets Comfort',
    subheadline: 'Experience ultimate relaxation and wellness treatments.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Dine Above the Horizon',
    subheadline: 'Enjoy breathtaking sunsets and curated local cuisine',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'A Spiritual Touch to Your Stay',
    subheadline: 'Reconnect with nature and heritage in every step.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
];

// Star rating component
const StarRating: React.FC<{ rating: number; size?: 'small' | 'medium' | 'large' }> = ({ rating, size = 'medium' }) => {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-2">({rating}.0)</span>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [showError, setShowError] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase.from('rooms').select('*');
        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to load rooms');
        }
        setRooms((data || []).map((row: any) => toRoom(row)));
      } catch (err: any) {
        setError(err?.message || 'Failed to load rooms');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Auto slide
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, autoPlay]);

  // Filter rooms on search/type
  useEffect(() => {
    if (!rooms) return;
    
    setFilteredRooms(
      rooms.filter((room) => {
        const searchMatch =
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          room.description.toLowerCase().includes(search.toLowerCase());
        const typeMatch = selectedType === 'all' || room.type.toLowerCase() === selectedType;
        return searchMatch && typeMatch;
      })
    );
  }, [rooms, search, selectedType]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setAutoPlay(false);
  };
  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setAutoPlay(false);
  };
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroImages.length);
    setAutoPlay(false);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('q', search.trim());
    }

    if (selectedType !== 'all') {
      params.set('type', selectedType);
    }

    const query = params.toString();
    navigate(query ? `/rooms?${query}` : '/rooms');
  };

  if (loading) {
    return (
      <div className="home">
        <LoadingSpinner size="large" message="Loading rooms..." />
      </div>
    );
  }

  return (
    <div className="home">
      {showError && error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)}
          type="error"
        />
      )}
      
      <section className="hero-section">
        <AnimatePresence initial={false}>
          <motion.img
            key={current}
            src={heroImages[current]}
            alt={`Hotel hero ${current + 1}`}
            className="hero-image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.7 }}
          />
        </AnimatePresence>
          <div className="hero-overlay" />
          <div className="hero-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7 }}
            >
                <h1 className="hero-headline">
                {heroCaptions[current].headline}
              </h1>
                <p className="hero-subheadline">
                {heroCaptions[current].subheadline}
              </p>
              <Link
                to={heroCaptions[current].ctaLink}
                className="btn-primary hero-cta"
              >
                {heroCaptions[current].cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={prevSlide}
            className="hero-nav-button hero-nav-prev"
          aria-label="Previous Slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={nextSlide}
            className="hero-nav-button hero-nav-next"
          aria-label="Next Slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
          <div className="hero-dots">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
                className={`hero-dot ${current === idx ? 'active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="search-section">
        <form className="search-form" onSubmit={handleQuickSearchSubmit}>
            <div className="search-intent">
              <h3>Plan Your Stay</h3>
              <p>Start with a quick search, then fine-tune filters on the rooms page.</p>
            </div>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="search-select"
              >
                <option value="all">All Types</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="standard">Standard</option>
                <option value="family">Family</option>
                <option value="presidential">Presidential</option>
                <option value="garden">Garden</option>
              </select>
            </div>
            <div className="search-actions">
              <button type="submit" className="search-button">Find Rooms</button>
              <p className="search-meta">{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} match your quick search</p>
            </div>
        </form>
        <div className="search-trust-row">
          <div className="trust-item">
            <strong>4.8/5</strong>
            <span>Guest Rating</span>
          </div>
          <div className="trust-item">
            <strong>24/7</strong>
            <span>Concierge Support</span>
          </div>
          <div className="trust-item">
            <strong>Best Rate</strong>
            <span>Direct Booking Promise</span>
          </div>
        </div>
      </section>

        {/* Featured Rooms Section */}
      <section className="featured-rooms-section">
          <div className="section-header">
            <h2 className="section-title">Featured Rooms</h2>
            <p className="section-subtitle">Discover our most popular accommodations</p>
          </div>
          
          <div className="rooms-grid">
            {filteredRooms.slice(0, 3).map((room, index) => (
              <motion.div
                key={room.id}
                className="room-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="room-image">
                  <img 
                    src={room.images[0] 
                      ? (room.images[0].startsWith('http') 
                          ? room.images[0] 
                          : room.images[0])
                      : '/room1.jpg'} 
                    alt={room.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="room-info">
                  <h3 className="room-title">{room.name}</h3>
                  <p className="room-type">{room.type}</p>
                  <div className="room-rating">
                    <StarRating rating={4.5} size="small" />
                  </div>
                  <p className="room-description">{room.description}</p>
                  <div className="room-amenities">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                  <div className="room-price">
                    <span className="price-amount">${room.price}</span>
                    <span className="price-unit">per night</span>
                  </div>
                  <Link to={`/rooms/${room.id}`} className="btn-primary">
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredRooms.length > 3 && (
            <div className="view-all-container">
              <Link to="/rooms" className="btn-secondary">
                View All Rooms
              </Link>
            </div>
          )}
      </section>
    </div>
  );
};

export default Home; 
