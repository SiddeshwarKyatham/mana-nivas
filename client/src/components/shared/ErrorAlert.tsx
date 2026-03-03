import React from 'react';
import './ErrorAlert.css';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onClose, 
  type = 'error' 
}) => {
  return (
    <div className={`error-alert ${type}`}>
      <div className="error-content">
        <div className="error-icon">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <p className="error-message">{message}</p>
        {onClose && (
          <button className="error-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert; 