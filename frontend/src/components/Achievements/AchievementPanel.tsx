import React, { useState } from 'react';
import { Achievement } from '../../types/game.types';
import './AchievementPanel.css';

export interface AchievementPanelProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  achievements,
  onClose,
}) => {
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAchievementRarity = (
    achievement: Achievement,
  ): 'common' | 'rare' | 'epic' | 'legendary' => {
    // This could be enhanced with actual rarity data from backend
    if (
      achievement.name.includes('First') ||
      achievement.name.includes('Welcome')
    ) {
      return 'common';
    }
    if (
      achievement.name.includes('Master') ||
      achievement.name.includes('Expert')
    ) {
      return 'epic';
    }
    if (
      achievement.name.includes('Legendary') ||
      achievement.name.includes('Ultimate')
    ) {
      return 'legendary';
    }
    return 'rare';
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getRarityLabel = (rarity: string): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
  });

  return (
    <div className="achievement-panel">
      <div className="achievement-panel__header">
        <h2 className="achievement-panel__title">🏆 Achievements</h2>
        <div className="achievement-panel__stats">
          <span className="achievement-count">
            {achievements.length}{' '}
            {achievements.length === 1 ? 'achievement' : 'achievements'}
          </span>
        </div>
        <button
          className="achievement-panel__close"
          onClick={onClose}
          aria-label="Close achievements panel"
        >
          ×
        </button>
      </div>

      <div className="achievement-panel__content">
        {achievements.length === 0 ? (
          <div className="achievement-panel__empty">
            <div className="empty-icon">🏆</div>
            <p className="empty-text">No achievements yet!</p>
            <p className="empty-subtext">
              Keep playing to unlock your first achievement.
            </p>
          </div>
        ) : (
          <div className="achievement-panel__grid">
            {sortedAchievements.map((achievement, index) => {
              const rarity = getAchievementRarity(achievement);
              return (
                <div
                  key={index}
                  className={`achievement-card achievement-card--${rarity}`}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="achievement-card__header">
                    <div className="achievement-card__icon">🏆</div>
                    <div className="achievement-card__rarity">
                      <span
                        className="rarity-badge"
                        style={{ backgroundColor: getRarityColor(rarity) }}
                      >
                        {getRarityLabel(rarity)}
                      </span>
                    </div>
                  </div>

                  <div className="achievement-card__content">
                    <h3 className="achievement-card__name">
                      {achievement.name}
                    </h3>
                    <p className="achievement-card__description">
                      {achievement.description}
                    </p>
                    <div className="achievement-card__date">
                      Unlocked: {formatDate(achievement.unlockedAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAchievement && (
        <div
          className="achievement-panel__modal-overlay"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="achievement-panel__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="achievement-panel__modal-header">
              <div className="achievement-panel__modal-title">
                <span className="achievement-panel__modal-icon">🏆</span>
                <h3>{selectedAchievement.name}</h3>
              </div>
              <button
                className="achievement-panel__modal-close"
                onClick={() => setSelectedAchievement(null)}
              >
                ×
              </button>
            </div>

            <div className="achievement-panel__modal-content">
              <div className="achievement-modal__rarity">
                <span
                  className="rarity-badge rarity-badge--large"
                  style={{
                    backgroundColor: getRarityColor(
                      getAchievementRarity(selectedAchievement),
                    ),
                  }}
                >
                  {getRarityLabel(getAchievementRarity(selectedAchievement))}{' '}
                  Achievement
                </span>
              </div>

              <div className="achievement-modal__description">
                <p>{selectedAchievement.description}</p>
              </div>

              <div className="achievement-modal__details">
                <div className="detail-item">
                  <strong>Unlocked:</strong>{' '}
                  {formatDate(selectedAchievement.unlockedAt)}
                </div>
                <div className="detail-item">
                  <strong>Type:</strong>{' '}
                  {getRarityLabel(getAchievementRarity(selectedAchievement))}
                </div>
              </div>

              <div className="achievement-modal__celebration">
                <div className="celebration-text">🎉 Congratulations! 🎉</div>
                <div className="celebration-subtext">
                  You've earned this achievement through your actions and
                  choices!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementPanel;
