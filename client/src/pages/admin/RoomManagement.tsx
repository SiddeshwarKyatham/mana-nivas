import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
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
  const [pendingDeleteRoomId, setPendingDeleteRoomId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/rooms');
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
        await api.put(`/rooms/${selectedRoom.id}`, {
          ...formData,
          status: 'active',
        });
      } else {
        await api.post('/rooms', {
          ...formData,
          images: [],
          status: 'active',
        });
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
    setDeletingId(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      // Animate out then remove
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err: any) {
      setError(err?.message || 'Error deleting room');
      setShowError(true);
    } finally {
      setDeletingId(null);
      setPendingDeleteRoomId(null);
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add New Room
          </button>
        )}
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
        <AnimatePresence>
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            className="room-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
          >
            <div className="room-images">
              {room.images.length > 0 ? <img src={room.images[0]} alt={room.name} /> : <div className="no-image">No Image</div>}
            </div>

            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="room-type">{room.type}</p>
              <p className="room-price">₹{room.price}/night</p>
              <p className="room-capacity">Capacity: {room.capacity || 1}</p>

              <div className="room-amenities">
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
                {room.amenities.length > 3 && <span className="amenity-tag">+{room.amenities.length - 3} more</span>}
              </div>

              {/* Inline Delete Confirmation */}
              <AnimatePresence mode="wait">
                {pendingDeleteRoomId === room.id ? (
                  <motion.div
                    key="confirm"
                    className="inline-delete-confirm"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p>⚠️ Delete <strong>{room.name}</strong>? This cannot be undone.</p>
                    <div className="inline-delete-actions">
                      <button
                        className="btn btn-danger"
                        disabled={deletingId === room.id}
                        onClick={() => handleDelete(room.id)}
                      >
                        {deletingId === room.id ? 'Deleting…' : 'Yes, Delete'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setPendingDeleteRoomId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="actions" className="room-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button onClick={() => handleEdit(room)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => setPendingDeleteRoomId(room.id)} className="btn btn-danger">Delete</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <ImageUpload
                roomId={room.id}
                currentImages={room.images}
                onImagesUpdated={(images) => handleRoomImagesUpdated(room.id, images)}
              />
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default RoomManagement;
