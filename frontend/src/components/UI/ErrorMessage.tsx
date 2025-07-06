import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  actionLabel = 'Retry',
  type = 'error',
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`error-message error-message--${type} ${className}`}>
      <div className="error-message__content">
        <div className="error-message__icon">{getIcon()}</div>
        <div className="error-message__text">
          <p className="error-message__message">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="error-message__actions">
          <button className="error-message__action-button" onClick={onRetry}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
