import React from 'react';
import { GameStats as GameStatsType } from '../../types/game.types';
import './GameStats.css';

export interface GameStatsProps {
  stats: GameStatsType;
  karma: number;
  reputation?: { [key: string]: number };
  isDead?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({
  stats,
  karma,
  reputation,
  isDead = false,
}) => {
  const formatStatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  };

  const getKarmaColor = (karma: number): string => {
    if (karma >= 50) return 'positive';
    if (karma <= -50) return 'negative';
    return 'neutral';
  };

  const getStatColor = (key: string, value: string | number): string => {
    const numValue =
      typeof value === 'number' ? value : parseInt(value.toString());

    if (isNaN(numValue)) return 'neutral';

    // Health-related stats
    if (
      key.toLowerCase().includes('health') ||
      key.toLowerCase().includes('hp')
    ) {
      if (numValue <= 20) return 'critical';
      if (numValue <= 50) return 'warning';
      return 'good';
    }

    // General stats
    if (numValue >= 80) return 'excellent';
    if (numValue >= 60) return 'good';
    if (numValue >= 40) return 'average';
    if (numValue >= 20) return 'poor';
    return 'critical';
  };

  return (
    <div className={`game-stats ${isDead ? 'game-stats--dead' : ''}`}>
      <div className="game-stats__header">
        <h3 className="game-stats__title">Character Stats</h3>
        {isDead && <span className="game-stats__death-indicator">💀</span>}
      </div>

      <div className="game-stats__content">
        {/* Primary Stats */}
        <div className="game-stats__section">
          <div className="game-stats__grid">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="game-stats__stat">
                <span className="stat-name">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span
                  className={`stat-value stat-value--${getStatColor(key, value)}`}
                >
                  {formatStatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Karma */}
        <div className="game-stats__section">
          <div className="game-stats__karma">
            <span className="karma-label">Karma</span>
            <span
              className={`karma-value karma-value--${getKarmaColor(karma)}`}
            >
              {karma >= 0 ? '+' : ''}
              {karma}
            </span>
          </div>
        </div>

        {/* Reputation */}
        {reputation && Object.keys(reputation).length > 0 && (
          <div className="game-stats__section">
            <h4 className="game-stats__section-title">Reputation</h4>
            <div className="game-stats__reputation">
              {Object.entries(reputation).map(([faction, value]) => (
                <div key={faction} className="reputation-item">
                  <span className="reputation-faction">{faction}</span>
                  <span
                    className={`reputation-value ${value >= 0 ? 'positive' : 'negative'}`}
                  >
                    {value >= 0 ? '+' : ''}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;
