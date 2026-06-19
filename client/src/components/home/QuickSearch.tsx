import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickSearch.css';

interface QuickSearchProps {
  totalRooms: number;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ totalRooms }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

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

  return (
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
          <p className="search-meta">{totalRooms} room{totalRooms !== 1 ? 's' : ''} available</p>
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
  );
};

export default QuickSearch;
