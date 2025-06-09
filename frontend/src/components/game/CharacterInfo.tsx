import React, { useState } from 'react';

interface CharacterProps {
  character: {
    name: string;
    characterClass: string;
    level: number;
    experience: number;
    attributes: Record<string, number>;
    skills: string[];
    inventory: {
      items: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        type?: string;
        effects?: Record<string, any>;
        value?: number;
        rarity?: string;
      }[];
      currency: Record<string, number>;
    };
    primaryGenre: string;
    gender?: 'male' | 'female';
    background?: string;
    introduction?: string;
  };
}

const CharacterInfo: React.FC<CharacterProps> = ({ character }) => {
  const [activeTab, setActiveTab] = useState<'attributes' | 'skills' | 'inventory' | 'background'>('attributes');

  // Map rarity to colors
  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-gray-300';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      default: return 'text-gray-300';
    }
  };

  // Hiển thị các thuộc tính phù hợp với thể loại game
  const renderAttributes = () => {
    return (
      <div className="space-y-2">
        {Object.entries(character.attributes).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key.replace('_', ' ')}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị danh sách kỹ năng
  const renderSkills = () => {
    return (
      <div className="space-y-2">
        {character.skills.map((skill, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded-md">
            {skill}
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị túi đồ
  const renderInventory = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Tiền tệ:</h4>
          {Object.entries(character.inventory.currency).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace('_', ' ')}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Vật phẩm:</h4>
          {character.inventory.items.map((item) => (
            <div key={item.id} className="bg-gray-700 p-2 rounded-md">
              <div className="flex justify-between">
                <span className={getRarityColor(item.rarity)}>{item.name}</span>
                <span>x{item.quantity}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Hiển thị thông tin bối cảnh
  const renderBackground = () => {
    return (
      <div className="space-y-4">
        {character.background && (
          <div>
            <h4 className="font-semibold">Bối cảnh:</h4>
            <p className="text-sm mt-1">{character.background}</p>
          </div>
        )}
        
        {character.introduction && (
          <div>
            <h4 className="font-semibold">Giới thiệu:</h4>
            <p className="text-sm mt-1">{character.introduction}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{character.name}</h2>
        <p className="text-gray-400">
          {character.gender === 'male' ? 'Nam' : 'Nữ'} {character.characterClass} - Cấp {character.level}
        </p>
        <div className="mt-2 bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full" 
            style={{ width: `${(character.experience % 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Kinh nghiệm: {character.experience} XP</p>
      </div>

      <div className="flex border-b border-gray-700 mb-4">
        <button 
          className={`flex-1 py-2 ${activeTab === 'attributes' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('attributes')}
        >
          Thuộc tính
        </button>
        <button 
          className={`flex-1 py-2 ${activeTab === 'skills' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Kỹ năng
        </button>
        <button 
          className={`flex-1 py-2 ${activeTab === 'inventory' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Vật phẩm
        </button>
        <button 
          className={`flex-1 py-2 ${activeTab === 'background' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('background')}
        >
          Thông tin
        </button>
      </div>

      <div className="overflow-y-auto max-h-[400px] pr-2">
        {activeTab === 'attributes' && renderAttributes()}
        {activeTab === 'skills' && renderSkills()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'background' && renderBackground()}
      </div>
    </div>
  );
};

export default CharacterInfo;