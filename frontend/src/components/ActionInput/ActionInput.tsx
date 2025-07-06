import React, { useState, useRef, useEffect } from 'react';
import './ActionInput.css';

export interface ActionInputProps {
  mode: 'choice' | 'custom' | 'think' | 'communicate';
  actionInput: string;
  thinkingInput: string;
  communicationInput: string;
  onActionInputChange: (value: string) => void;
  onThinkingInputChange: (value: string) => void;
  onCommunicationInputChange: (value: string) => void;
  onModeChange: (mode: 'choice' | 'custom' | 'think' | 'communicate') => void;
  onCustomAction: () => void;
  onThinkingAction: () => void;
  onCommunicationAction: () => void;
  canPerformAction: boolean;
  isLoading: boolean;
}

export const ActionInput: React.FC<ActionInputProps> = ({
  mode,
  actionInput,
  thinkingInput,
  communicationInput,
  onActionInputChange,
  onThinkingInputChange,
  onCommunicationInputChange,
  onModeChange,
  onCustomAction,
  onThinkingAction,
  onCommunicationAction,
  canPerformAction,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modes = [
    {
      key: 'choice',
      label: 'Choices',
      icon: '🎯',
      description: 'Select from available options',
    },
    {
      key: 'custom',
      label: 'Action',
      icon: '⚡',
      description: 'Perform a custom action',
    },
    {
      key: 'think',
      label: 'Think',
      icon: '💭',
      description: 'Internal thoughts and planning',
    },
    {
      key: 'communicate',
      label: 'Communicate',
      icon: '💬',
      description: 'Speak or communicate with others',
    },
  ] as const;

  const getCurrentInput = () => {
    switch (mode) {
      case 'custom':
        return actionInput;
      case 'think':
        return thinkingInput;
      case 'communicate':
        return communicationInput;
      default:
        return '';
    }
  };

  const getCurrentPlaceholder = () => {
    switch (mode) {
      case 'custom':
        return 'Describe what you want to do...';
      case 'think':
        return 'What are you thinking about...';
      case 'communicate':
        return 'What do you want to say...';
      default:
        return '';
    }
  };

  const handleInputChange = (value: string) => {
    switch (mode) {
      case 'custom':
        onActionInputChange(value);
        break;
      case 'think':
        onThinkingInputChange(value);
        break;
      case 'communicate':
        onCommunicationInputChange(value);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPerformAction || isLoading) return;

    const currentInput = getCurrentInput().trim();
    if (!currentInput) return;

    switch (mode) {
      case 'custom':
        onCustomAction();
        break;
      case 'think':
        onThinkingAction();
        break;
      case 'communicate':
        onCommunicationAction();
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [getCurrentInput()]);

  const currentInput = getCurrentInput();
  const isInputMode = mode !== 'choice';
  const hasInput = currentInput.trim().length > 0;

  return (
    <div
      className={`action-input ${isExpanded ? 'action-input--expanded' : ''}`}
    >
      {/* Mode Selection */}
      <div className="action-input__modes">
        {modes.map((modeOption) => (
          <button
            key={modeOption.key}
            className={`action-input__mode ${mode === modeOption.key ? 'active' : ''}`}
            onClick={() => onModeChange(modeOption.key)}
            title={modeOption.description}
            disabled={isLoading}
          >
            <span className="mode-icon">{modeOption.icon}</span>
            <span className="mode-label">{modeOption.label}</span>
          </button>
        ))}
      </div>

      {/* Input Section */}
      {isInputMode && (
        <div className="action-input__input-section">
          <form onSubmit={handleSubmit} className="action-input__form">
            <div className="action-input__input-container">
              <textarea
                ref={textareaRef}
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getCurrentPlaceholder()}
                className="action-input__textarea"
                disabled={isLoading}
                rows={1}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => setIsExpanded(false)}
              />
              <button
                type="submit"
                className={`action-input__submit ${hasInput && canPerformAction ? 'active' : ''}`}
                disabled={!hasInput || !canPerformAction || isLoading}
                title="Submit action"
              >
                {isLoading ? (
                  <span className="loading-spinner">⏳</span>
                ) : (
                  <span className="submit-icon">▶️</span>
                )}
              </button>
            </div>
          </form>

          {/* Character Counter */}
          {hasInput && (
            <div className="action-input__counter">
              <span
                className={`counter ${currentInput.length > 500 ? 'warning' : ''}`}
              >
                {currentInput.length}/500
              </span>
            </div>
          )}

          {/* Help Text */}
          {isExpanded && (
            <div className="action-input__help">
              <p className="help-text">
                {mode === 'custom' &&
                  'Describe any action you want to take. Be creative!'}
                {mode === 'think' &&
                  "Share your character's thoughts and internal monologue."}
                {mode === 'communicate' &&
                  'What would you like to say or how do you want to communicate?'}
              </p>
              <p className="help-shortcut">
                Press Enter to submit, Shift+Enter for new line
              </p>
            </div>
          )}
        </div>
      )}

      {/* Choice Mode Info */}
      {mode === 'choice' && (
        <div className="action-input__choice-info">
          <p className="choice-info-text">
            📋 Choose from the available options above, or switch to a different
            mode for custom actions.
          </p>
        </div>
      )}

      {/* Status Indicators */}
      {!canPerformAction && (
        <div className="action-input__status">
          <p className="status-text status-text--disabled">
            ⏸️ Actions are currently disabled. Please wait for the game to be
            ready.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionInput;
