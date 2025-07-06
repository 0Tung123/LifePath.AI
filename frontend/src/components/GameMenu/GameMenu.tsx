import React, { useState } from 'react';
import './GameMenu.css';

export interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExitGame?: () => void;
  onSaveGame?: () => void;
  onLoadGame?: () => void;
  onSettings?: () => void;
  onExportGame?: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  onExitGame,
  onSaveGame,
  onLoadGame,
  onSettings,
  onExportGame,
}) => {
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const handleExitGame = () => {
    setShowConfirmExit(true);
  };

  const confirmExit = () => {
    setShowConfirmExit(false);
    onExitGame?.();
  };

  const cancelExit = () => {
    setShowConfirmExit(false);
  };

  if (!isOpen) return null;

  return (
    <div className="game-menu-overlay" onClick={onClose}>
      <div className="game-menu" onClick={(e) => e.stopPropagation()}>
        <div className="game-menu__header">
          <h2 className="game-menu__title">⚙️ Game Menu</h2>
          <button
            className="game-menu__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="game-menu__content">
          {!showConfirmExit ? (
            <div className="game-menu__options">
              <button className="game-menu__option" onClick={onClose}>
                <span className="option-icon">↩️</span>
                <span className="option-text">Return to Game</span>
              </button>

              {onSaveGame && (
                <button
                  className="game-menu__option"
                  onClick={() => {
                    onSaveGame();
                    onClose();
                  }}
                >
                  <span className="option-icon">💾</span>
                  <span className="option-text">Save Game</span>
                </button>
              )}

              {onLoadGame && (
                <button
                  className="game-menu__option"
                  onClick={() => {
                    onLoadGame();
                    onClose();
                  }}
                >
                  <span className="option-icon">📁</span>
                  <span className="option-text">Load Game</span>
                </button>
              )}

              {onExportGame && (
                <button
                  className="game-menu__option"
                  onClick={() => {
                    onExportGame();
                    onClose();
                  }}
                >
                  <span className="option-icon">📤</span>
                  <span className="option-text">Export Game</span>
                </button>
              )}

              {onSettings && (
                <button
                  className="game-menu__option"
                  onClick={() => {
                    onSettings();
                    onClose();
                  }}
                >
                  <span className="option-icon">⚙️</span>
                  <span className="option-text">Settings</span>
                </button>
              )}

              <div className="game-menu__divider"></div>

              <button
                className="game-menu__option game-menu__option--danger"
                onClick={handleExitGame}
              >
                <span className="option-icon">🚪</span>
                <span className="option-text">Exit Game</span>
              </button>
            </div>
          ) : (
            <div className="game-menu__confirm">
              <div className="confirm-header">
                <span className="confirm-icon">⚠️</span>
                <h3 className="confirm-title">Exit Game?</h3>
              </div>

              <p className="confirm-message">
                Are you sure you want to exit the game? Any unsaved progress may
                be lost.
              </p>

              <div className="confirm-actions">
                <button
                  className="confirm-button confirm-button--cancel"
                  onClick={cancelExit}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button confirm-button--danger"
                  onClick={confirmExit}
                >
                  Exit Game
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="game-menu__footer">
          <div className="game-menu__info">
            <span className="info-item">LifePath.AI</span>
            <span className="info-separator">•</span>
            <span className="info-item">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
