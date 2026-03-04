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
  type = 'error',
}) => {
  const icon = type === 'info' ? 'i' : '!';

  return (
    <div className={`error-alert ${type}`} role="alert" aria-live="polite">
      <div className="error-alert-content">
        <div className="error-alert-icon" aria-hidden="true">
          {icon}
        </div>
        <p className="error-alert-message">{message}</p>
        {onClose && (
          <button className="error-alert-close" onClick={onClose} aria-label="Dismiss alert">
            x
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
