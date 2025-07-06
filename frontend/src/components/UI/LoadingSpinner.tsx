import React from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  return (
    <div className={`loading-spinner ${className}`}>
      <div className={`spinner spinner--${size}`}>
        <div className="spinner__circle"></div>
        <div className="spinner__circle"></div>
        <div className="spinner__circle"></div>
        <div className="spinner__circle"></div>
      </div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
