import React from 'react';
import RoomDetailsComponent from '../components/rooms/RoomDetails';
import { useParams } from 'react-router-dom';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();

  return (
    <div className="page-container">
      <RoomDetailsComponent />
    </div>
  );
};

export default RoomDetails; 