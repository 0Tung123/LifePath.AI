'use client';

import React from 'react';
import {
  CharacterTemplate,
  BackstoryAnalysis,
} from '@/types/character-creation.types';
import characterCreationService from '@/services/character-creation.service';

interface CharacterPreviewProps {
  characterName: string;
  stats: Record<string, number>;
  backstory: string;
  selectedTemplate?: CharacterTemplate;
  aiAnalysis?: BackstoryAnalysis;
  worldType?: string;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  characterName,
  stats,
  backstory,
  selectedTemplate,
  aiAnalysis,
  worldType,
}) => {
  const preview = characterCreationService.generateCharacterPreview(
    stats,
    selectedTemplate,
    backstory,
  );

  // TODO: Use worldType for world-specific character preview features
  console.log('World type:', worldType);

  const getStatColor = (value: number) => {
    if (value >= 16) return 'text-green-600 bg-green-100';
    if (value >= 13) return 'text-blue-600 bg-blue-100';
    if (value >= 10) return 'text-gray-600 bg-gray-100';
    return 'text-red-600 bg-red-100';
  };

  const getTemplateIcon = (templateId: string) => {
    const iconMap: Record<string, string> = {
      warrior: '⚔️',
      mage: '🔮',
      rogue: '🗡️',
      cleric: '✨',
      ranger: '🏹',
      sword_cultivator: '⚔️',
      alchemy_master: '🧪',
      space_marine: '🚀',
      cyberpunk_hacker: '💻',
    };
    return iconMap[templateId] || '👤';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Xem Lại Nhân Vật
        </h2>
        <p className="text-gray-600">
          Kiểm tra lại tất cả thông tin trước khi hoàn thành tạo nhân vật.
        </p>
      </div>

      {/* Character Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">
            {selectedTemplate ? getTemplateIcon(selectedTemplate.id) : '👤'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{characterName}</h3>
          <p className="text-lg text-gray-600">{preview.archetype}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Stats Summary */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Chỉ Số Chính</h4>
            <div className="space-y-2">
              {Object.entries(preview.primaryStats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{stat}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${getStatColor(value)}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Play Style */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Phong Cách Chơi</h4>
            <p className="text-sm text-gray-600">
              {preview.suggestedPlayStyle}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Tất Cả Chỉ Số</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([stat, value]) => (
            <div key={stat} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-600">{stat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-900 mb-3">✅ Điểm Mạnh</h4>
          <ul className="space-y-2">
            {preview.strengths.map((strength, index) => (
              <li
                key={index}
                className="text-sm text-green-800 flex items-start"
              >
                <span className="text-green-600 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-medium text-red-900 mb-3">⚠️ Điểm Yếu</h4>
          <ul className="space-y-2">
            {preview.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm text-red-800 flex items-start">
                <span className="text-red-600 mr-2">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Template Info */}
      {selectedTemplate && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Mẫu Được Chọn: {selectedTemplate.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {selectedTemplate.description}
          </p>

          {selectedTemplate.skills.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">
                Kỹ năng đề xuất:{' '}
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedTemplate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">🤖 Phân Tích AI</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong className="text-purple-800">Loại nhân vật:</strong>{' '}
              {aiAnalysis.characterArchetype}
            </div>
            <div>
              <strong className="text-purple-800">Độ tin cậy:</strong>{' '}
              {Math.round(aiAnalysis.confidence * 100)}%
            </div>
            <div>
              <strong className="text-purple-800">Từ khóa:</strong>{' '}
              {aiAnalysis.detectedKeywords.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Backstory */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Tiểu Sử</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{backstory}</p>
      </div>

      {/* Final Confirmation */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-3">⚠️</div>
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">
              Xác nhận tạo nhân vật
            </h4>
            <p className="text-sm text-yellow-800">
              Sau khi hoàn thành, nhân vật sẽ được tạo với các chỉ số hiện tại.
              Bạn có thể thay đổi chỉ số trong game nhưng sẽ khó khăn hơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPreview;
