import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`toast toast--${type} toast--${position} ${isLeaving ? 'toast--leaving' : ''} ${className}`}
    >
      <div className="toast__content">
        <div className="toast__icon">{getIcon()}</div>
        <div className="toast__message">{message}</div>
        <button
          className="toast__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      {duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{
              animation: `progress-bar ${duration}ms linear`,
              animationPlayState: isLeaving ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
