import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTrash } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';
import './ImageUpload.css';

interface ImageUploadProps {
  roomId: string;
  currentImages: string[];
  onImagesUpdated: (images: string[]) => void;
}

const getFilePathFromPublicUrl = (url: string): string | null => {
  const marker = '/storage/v1/object/public/rooms/';
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.substring(index + marker.length));
};

const ImageUpload: React.FC<ImageUploadProps> = ({ roomId, currentImages, onImagesUpdated }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateRoomImages = async (images: string[]) => {
    const { error } = await supabase.from('rooms').update({ images }).eq('id', roomId);
    if (error) {
      throw new Error(error.message || 'Failed to update room images');
    }
    onImagesUpdated(images);
  };

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
        const uniqueName = `${roomId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storagePath = `${roomId}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage.from('rooms').upload(storagePath, file, {
          upsert: false,
        });

        if (uploadError) {
          throw new Error(uploadError.message || 'Failed to upload image');
        }

        const { data } = supabase.storage.from('rooms').getPublicUrl(storagePath);
        uploadedUrls.push(data.publicUrl);
      }

      await updateRoomImages([...(currentImages || []), ...uploadedUrls]);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      try {
        await uploadFiles(Array.from(e.dataTransfer.files));
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [roomId, currentImages]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await uploadFiles(Array.from(e.target.files || []));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const imageUrl = currentImages[imageIndex];
      const path = getFilePathFromPublicUrl(imageUrl);
      if (path) {
        await supabase.storage.from('rooms').remove([path]);
      }

      const updated = currentImages.filter((_, index) => index !== imageIndex);
      await updateRoomImages(updated);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="image-upload-container">
      <h4>Room Images</h4>
      <div className="current-images">
        {currentImages.map((image, index) => (
          <motion.div
            key={index}
            className="image-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <img src={image} alt={`Room image ${index + 1}`} />
            <button
              type="button"
              className="delete-image-btn"
              onClick={() => handleDeleteImage(index)}
              title="Delete image"
            >
              <FaTrash />
            </button>
          </motion.div>
        ))}
      </div>

      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          <FaUpload className="upload-icon" />
          <p>Drag and drop images here or click to select</p>
          <p className="upload-hint">Supports JPG, PNG, GIF, WebP (max 5MB each)</p>
        </div>

        {uploading && (
          <div className="upload-overlay">
            <div className="upload-spinner"></div>
            <p>Uploading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
