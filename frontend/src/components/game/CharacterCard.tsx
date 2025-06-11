import React from 'react';
import { Character, GameGenre } from '../../api/apiClient';
import Card from './Card';
import Button from './Button';

interface CharacterCardProps {
  character: Character;
  onSelect?: () => void;
  onStartGame?: () => void;
  isSelected?: boolean;
}

const genreColors: Record<GameGenre, string> = {
  [GameGenre.FANTASY]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [GameGenre.MODERN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [GameGenre.SCIFI]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  [GameGenre.XIANXIA]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [GameGenre.WUXIA]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [GameGenre.HORROR]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  [GameGenre.CYBERPUNK]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  [GameGenre.STEAMPUNK]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  [GameGenre.POSTAPOCALYPTIC]: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  [GameGenre.HISTORICAL]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onStartGame,
  isSelected = false,
}) => {
  const getGenreBadge = (genre: GameGenre) => {
    const colorClass = genreColors[genre] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    return (
      <span 
        key={genre} 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} mr-2 mb-2`}
      >
        {genre}
      </span>
    );
  };

  return (
    <Card 
      className={`h-full transition-all ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Lv. {character.level} • XP: {character.experience}
          </div>
          <div className="flex space-x-2">
            {onSelect && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onSelect}
              >
                {isSelected ? 'Đã chọn' : 'Chọn'}
              </Button>
            )}
            {onStartGame && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onStartGame}
              >
                Bắt đầu
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{character.name}</h4>
        
        <div className="mb-4">
          {getGenreBadge(character.primaryGenre)}
          {character.secondaryGenres?.map(genre => getGenreBadge(genre))}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">{character.description}</p>
        
        {character.traits && character.traits.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Đặc điểm:</h5>
            <div className="flex flex-wrap">
              {character.traits.map((trait, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mr-2 mb-1"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {character.abilities && character.abilities.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kỹ năng:</h5>
            <div className="flex flex-wrap">
              {character.abilities.map((ability, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs mr-2 mb-1"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CharacterCard;