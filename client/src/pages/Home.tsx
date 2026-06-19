import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Room, toRoom } from '../types/hotel';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorAlert from '../components/shared/ErrorAlert';
import { useAuth } from '../context/AuthContext';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';
import HeroSlider from '../components/home/HeroSlider';
import QuickSearch from '../components/home/QuickSearch';
import RoomCard from '../components/rooms/RoomCard';
import './home.css';

import { api } from '../lib/api';

const Home: React.FC = () => {
  // Leverage dynamic SEO metadata setup
  useDocumentMetadata(
    'Home - Luxury Accommodations & Heritage Suites',
    'Experience the finest premium luxury stays and custom heritage suites at Mana Nivas hotel.'
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return; // Wait for AuthContext to finish its session checks

    let isMounted = true;
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get('/rooms');
        if (isMounted) {
          setRooms((data || []).map((row: any) => toRoom(row)));
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load rooms');
          setShowError(true);
          setLoading(false);
        }
      }
    };

    fetchRooms();

    
    return () => {
      isMounted = false;
    };
  }, [authLoading]);


  return (
    <div className="home page-container">
      {showError && error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)}
          type="error"
        />
      )}
      
      <HeroSlider />
      
      <QuickSearch totalRooms={rooms.length} />

      {/* Featured Rooms Section */}
      <section className="featured-rooms-section">
        <div className="section-header">
          <h2 className="section-title">Featured Rooms</h2>
          <p className="section-subtitle">Discover our most popular accommodations, tailored for ultimate comfort.</p>
        </div>
        
        <div className="rooms-grid">
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="medium" message="Loading featured rooms..." />
            </div>
          ) : (
            rooms.slice(0, 3).map((room, index) => (
              <RoomCard key={room.id} room={room} index={index} />
            ))
          )}
        </div>
        
        {rooms.length > 3 && (
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
