import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const spinnerClass = `loading-spinner ${size}`;
  
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={spinnerClass}></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={spinnerClass}></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 