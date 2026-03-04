import React, { useState } from 'react';
import { FaChevronDown, FaSearch, FaUndo } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 50000],
    roomType: '',
    amenities: [],
    checkIn: null,
    checkOut: null,
  });

  const roomTypes = ['Deluxe', 'Executive', 'Suite', 'Standard', 'Family', 'Presidential', 'Garden', 'Ocean View', 'Mountain View'];

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
    'Living Room',
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value || 0);
    setFilters((prev) => ({
      ...prev,
      priceRange: [0, value],
    }));
  };

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      roomType: e.target.value,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
    }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      checkIn: start,
      checkOut: end,
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

  const activeFiltersCount = [filters.roomType, filters.amenities.length, filters.checkIn, filters.checkOut].filter(Boolean).length;

  return (
    <div className="room-search-container">
      <div className="rs-header">
        <h2>Find Your Perfect Room</h2>
        <p>Refine by stay dates, room type, and budget.</p>
        {activeFiltersCount > 0 && (
          <div className="rs-active-filters">
            <span className="rs-filter-count">{activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="rs-content">
        <div className="rs-core-grid">
          <div className="rs-section rs-date-section">
            <label className="rs-field-label">Stay Dates</label>
            <DatePicker
              selected={filters.checkIn}
              onChange={handleDateChange}
              startDate={filters.checkIn}
              endDate={filters.checkOut}
              selectsRange
              minDate={new Date()}
              placeholderText="Select your stay dates"
              className="rs-date-picker"
              dateFormat="MMM dd, yyyy"
            />
          </div>

          <div className="rs-section rs-type-section">
            <label className="rs-field-label">Room Type</label>
            <select value={filters.roomType} onChange={handleRoomTypeChange} className="rs-room-type-select">
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="rs-section rs-price-section">
            <label className="rs-field-label">Max Budget / Night</label>
            <div className="rs-price-range-compact">
              <input
                type="range"
                name="maxPrice"
                min={1000}
                max={50000}
                step={500}
                value={filters.priceRange[1]}
                onChange={handlePriceChange}
                className="rs-price-slider"
              />
              <div className="rs-price-value">₹ {filters.priceRange[1].toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="rs-actions">
          <button onClick={() => setShowAdvanced((prev) => !prev)} className="rs-advanced-btn" type="button">
            More Filters
            <span className="rs-btn-icon" aria-hidden="true">
              <FaChevronDown className={showAdvanced ? 'rs-chevron-open' : ''} />
            </span>
          </button>

          <button onClick={handleReset} className="rs-reset-btn">
            <span className="rs-btn-icon" aria-hidden="true">
              <FaUndo />
            </span>
            Clear All Filters
          </button>

          <button onClick={handleSearch} className="rs-search-btn">
            <span className="rs-btn-icon" aria-hidden="true">
              <FaSearch />
            </span>
            Search Rooms
          </button>
        </div>

        {showAdvanced && (
          <div className="rs-section rs-amenities-section">
            <h3>Preferred Amenities</h3>
            <div className="rs-amenities-grid">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={`rs-amenity-pill ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                  onClick={() => handleAmenityToggle(amenity)}
                  aria-pressed={filters.amenities.includes(amenity)}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSearch;
