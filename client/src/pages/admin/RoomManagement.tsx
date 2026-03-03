import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { Room, toRoom } from '../../types/supabase';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorAlert from '../../components/shared/ErrorAlert';
import ImageUpload from '../../components/admin/ImageUpload';
import './RoomManagement.css';

interface RoomFormData {
  name: string;
  type: string;
  description: string;
  price: number;
  amenities: string[];
  capacity: number;
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    type: '',
    description: '',
    price: 0,
    amenities: [],
    capacity: 1,
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [showError, setShowError] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch rooms');
      }
      setRooms((data || []).map((row: any) => toRoom(row)));
    } catch (err: any) {
      const message = err?.message || 'Failed to load rooms';
      setError(message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'capacity' ? Number(value) : value,
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      price: 0,
      amenities: [],
      capacity: 1,
    });
    setSelectedRoom(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing && selectedRoom) {
        const { error: updateError } = await supabase
          .from('rooms')
          .update({
            ...formData,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedRoom.id);

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update room');
        }
      } else {
        const { error: insertError } = await supabase.from('rooms').insert([
          {
            ...formData,
            images: [],
            status: 'active',
          },
        ]);

        if (insertError) {
          throw new Error(insertError.message || 'Failed to create room');
        }
      }

      await fetchRooms();
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Error saving room');
      setShowError(true);
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      description: room.description,
      price: room.price,
      amenities: room.amenities,
      capacity: room.capacity || 1,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error: deleteError } = await supabase.from('rooms').delete().eq('id', roomId);
      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete room');
      }
      await fetchRooms();
    } catch (err: any) {
      setError(err?.message || 'Error deleting room');
      setShowError(true);
    }
  };

  const handleRoomImagesUpdated = (roomId: string, images: string[]) => {
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, images } : room)));
  };

  if (loading) {
    return (
      <div className="room-management">
        <LoadingSpinner size="large" message="Loading rooms..." />
      </div>
    );
  }

  return (
    <div className="room-management">
      {showError && error && <ErrorAlert message={error} onClose={() => setShowError(false)} type="error" />}

      <div className="room-management-header">
        <h1>Room Management</h1>
        <p>Manage your hotel rooms and their details</p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Room
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="room-form-container">
          <form onSubmit={handleSubmit} className="room-form">
            <h2>{isEditing ? 'Edit Room' : 'Add New Room'}</h2>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Room Name</label>
              <input type="text" id="name" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">Room Type</label>
              <select id="type" name="type" className="form-input" value={formData.type} onChange={handleInputChange} required>
                <option value="">Select Type</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Standard">Standard</option>
                <option value="Family">Family</option>
                <option value="Presidential">Presidential</option>
                <option value="Garden">Garden</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" name="description" className="form-input" value={formData.description} onChange={handleInputChange} rows={4} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price per Night</label>
                <input type="number" id="price" name="price" className="form-input" value={formData.price} onChange={handleInputChange} min="0" step="0.01" required />
              </div>

              <div className="form-group">
                <label htmlFor="capacity" className="form-label">Capacity</label>
                <input type="number" id="capacity" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} min="1" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="amenities-input">
                <input
                  type="text"
                  className="form-input"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <button type="button" onClick={handleAddAmenity} className="btn btn-secondary">Add</button>
              </div>
              <div className="amenities-list">
                {formData.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="remove-amenity">x</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{isEditing ? 'Update Room' : 'Create Room'}</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <motion.div key={room.id} className="room-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="room-images">
              {room.images.length > 0 ? <img src={room.images[0]} alt={room.name} /> : <div className="no-image">No Image</div>}
            </div>

            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="room-type">{room.type}</p>
              <p className="room-price">${room.price}/night</p>
              <p className="room-capacity">Capacity: {room.capacity || 1}</p>

              <div className="room-amenities">
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
                {room.amenities.length > 3 && <span className="amenity-tag">+{room.amenities.length - 3} more</span>}
              </div>

              <div className="room-actions">
                <button onClick={() => handleEdit(room)} className="btn btn-secondary">Edit</button>
                <button onClick={() => handleDelete(room.id)} className="btn btn-danger">Delete</button>
              </div>

              <ImageUpload
                roomId={room.id}
                currentImages={room.images}
                onImagesUpdated={(images) => handleRoomImagesUpdated(room.id, images)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;
