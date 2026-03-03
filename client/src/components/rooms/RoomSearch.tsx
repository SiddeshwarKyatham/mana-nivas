import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './RoomSearch.css';

interface RoomSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  priceRange: [number, number];
  roomType: string;
  amenities: string[];
  checkIn: Date | null;
  checkOut: Date | null;
}

const RoomSearch: React.FC<RoomSearchProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 50000],
    roomType: '',
    amenities: [],
    checkIn: null,
    checkOut: null
  });

  // Enhanced room types with better categorization
  const roomTypes = [
    'Deluxe',
    'Executive',
    'Suite',
    'Standard',
    'Family',
    'Presidential',
    'Garden',
    'Ocean View',
    'Mountain View'
  ];

  // Curated amenities with icons and better organization
  const availableAmenities = [
    'WiFi',
    'Air Conditioning',
    'Mini Bar',
    'Room Service',
    'Balcony',
    'King Bed',
    'Jacuzzi',
    'Ocean View',
    'Mountain View',
    'Garden Access',
    'Kitchen',
    'Living Room'
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      priceRange: name === 'minPrice' 
        ? [Number(value || 0), prev.priceRange[1]]
        : [prev.priceRange[0], Number(value || 0)]
    }));
  };

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      roomType: e.target.value
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters(prev => ({
      ...prev,
      checkIn: start,
      checkOut: end
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const reset = {
      priceRange: [0, 50000] as [number, number],
      roomType: '',
      amenities: [],
      checkIn: null,
      checkOut: null,
    };
    setFilters(reset);
    onSearch(reset);
  };

  const activeFiltersCount = [
    filters.roomType,
    filters.amenities.length,
    filters.checkIn,
    filters.checkOut
  ].filter(Boolean).length;

  return (
    <div className="room-search-container">
      <div className="search-header">
        <h2>Find Your Perfect Room</h2>
        <p>Use the filters below to narrow down your search</p>
        {activeFiltersCount > 0 && (
          <div className="active-filters">
            <span className="filter-count">{activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="search-content">
        <div className="search-row">
          <div className="search-section price-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <div className="price-input-group">
                <label>Min</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.priceRange[0]}
                  onChange={handlePriceChange}
                  placeholder="0"
                  min={0}
                  className="price-input"
                />
              </div>
              <div className="price-separator">
                <span>—</span>
              </div>
              <div className="price-input-group">
                <label>Max</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.priceRange[1]}
                  onChange={handlePriceChange}
                  placeholder="50000"
                  min={0}
                  className="price-input"
                />
              </div>
            </div>
          </div>

          <div className="search-section date-section">
            <h3>Check-in & Check-out</h3>
            <DatePicker
              selected={filters.checkIn}
              onChange={handleDateChange}
              startDate={filters.checkIn}
              endDate={filters.checkOut}
              selectsRange
              minDate={new Date()}
              placeholderText="Select your stay dates"
              className="date-picker"
              dateFormat="MMM dd, yyyy"
            />
          </div>

          <div className="search-section type-section">
            <h3>Room Type</h3>
            <select 
              value={filters.roomType} 
              onChange={handleRoomTypeChange}
              className="room-type-select"
            >
              <option value="">All Room Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-section amenities-section">
          <h3>Desired Amenities</h3>
          <p className="section-subtitle">Select the amenities that matter most to you</p>
          <div className="amenities-grid">
            {availableAmenities.map(amenity => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <span className="checkbox-custom"></span>
                <span className="amenity-label">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="search-actions">
          <button onClick={handleSearch} className="search-btn">
            <span className="btn-icon">🔍</span>
            Search Rooms
          </button>
          <button onClick={handleReset} className="reset-btn">
            <span className="btn-icon">↺</span>
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSearch; 