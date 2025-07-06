import React from 'react';
import { GameStats, Skill } from '../../types/game.types';
import './CharacterSheet.css';

export interface CharacterSheetProps {
  character: {
    name: string;
    backstory: string;
    stats: GameStats;
    skills: Skill[];
    karma: number;
    reputation?: { [key: string]: number };
  };
  onClose: () => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onClose,
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

  return (
    <div className="character-sheet">
      <div className="character-sheet__header">
        <h2 className="character-sheet__title">Character Sheet</h2>
        <button
          className="character-sheet__close"
          onClick={onClose}
          aria-label="Close character sheet"
        >
          ×
        </button>
      </div>

      <div className="character-sheet__content">
        {/* Basic Info */}
        <section className="character-sheet__section">
          <h3 className="character-sheet__section-title">Basic Information</h3>
          <div className="character-sheet__info">
            <div className="character-sheet__info-item">
              <span className="label">Name:</span>
              <span className="value">{character.name}</span>
            </div>
            <div className="character-sheet__info-item">
              <span className="label">Karma:</span>
              <span
                className={`value karma karma--${getKarmaColor(character.karma)}`}
              >
                {character.karma}
              </span>
            </div>
          </div>
        </section>

        {/* Backstory */}
        <section className="character-sheet__section">
          <h3 className="character-sheet__section-title">Backstory</h3>
          <div className="character-sheet__backstory">
            <p>{character.backstory}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="character-sheet__section">
          <h3 className="character-sheet__section-title">Character Stats</h3>
          <div className="character-sheet__stats">
            {Object.entries(character.stats).map(([key, value]) => (
              <div key={key} className="character-sheet__stat">
                <span className="stat-name">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="stat-value">{formatStatValue(value)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        {character.skills.length > 0 && (
          <section className="character-sheet__section">
            <h3 className="character-sheet__section-title">Skills</h3>
            <div className="character-sheet__skills">
              {character.skills.map((skill, index) => (
                <div key={index} className="character-sheet__skill">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    {skill.level && (
                      <span className="skill-level">Level {skill.level}</span>
                    )}
                  </div>
                  {skill.description && (
                    <p className="skill-description">{skill.description}</p>
                  )}
                  {skill.mastery && (
                    <span className="skill-mastery">
                      Mastery: {skill.mastery}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reputation */}
        {character.reputation &&
          Object.keys(character.reputation).length > 0 && (
            <section className="character-sheet__section">
              <h3 className="character-sheet__section-title">Reputation</h3>
              <div className="character-sheet__reputation">
                {Object.entries(character.reputation).map(
                  ([faction, value]) => (
                    <div
                      key={faction}
                      className="character-sheet__reputation-item"
                    >
                      <span className="reputation-faction">{faction}</span>
                      <span
                        className={`reputation-value ${value >= 0 ? 'positive' : 'negative'}`}
                      >
                        {value >= 0 ? '+' : ''}
                        {value}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}
      </div>
    </div>
  );
};

export default CharacterSheet;
