import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Room } from '../../types/hotel';
import StarRating from '../shared/StarRating';
import './RoomCard.css';

interface RoomCardProps {
  room: Room;
  index?: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, index = 0 }) => {
  return (
    <motion.div
      className="room-card-horizontal"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="room-card-image-wrap">
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
        <div className="room-type-tag">{room.type}</div>
      </div>
      
      <div className="room-card-content">
        <div className="room-card-header">
          <h3 className="room-card-title">{room.name}</h3>
          <div className="room-card-rating">
            <StarRating rating={4.5} size="small" />
          </div>
        </div>
        
        <p className="room-card-description">{room.description}</p>
        
        <div className="room-card-amenities">
          {room.amenities.slice(0, 4).map((amenity, idx) => (
            <span key={idx} className="room-card-amenity-tag">{amenity}</span>
          ))}
          {room.amenities.length > 4 && (
            <span className="room-card-amenity-tag more">+{room.amenities.length - 4}</span>
          )}
        </div>
        
        <div className="room-card-footer">
          <div className="room-card-price">
            <span className="price-label">From</span>
            <span className="price-amount">₹{room.price}</span>
            <span className="price-unit">/ night</span>
          </div>
          
          <Link to={`/rooms/${room.id}`} className="room-card-link">
            <span>Discover Suite</span>
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
