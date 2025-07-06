'use client';

import React from 'react';
import {
  BackstoryAnalysis,
  CharacterTemplate,
} from '@/types/character-creation.types';

interface BackstoryEditorProps {
  initialBackstory: string;
  onBackstoryChange: (backstory: string) => void;
  onAnalyzeBackstory: () => void;
  aiAnalysis?: BackstoryAnalysis;
  isAnalyzing?: boolean;
  useCustomBackstory: boolean;
  onToggleCustomBackstory: (useCustom: boolean) => void;
  selectedTemplate?: CharacterTemplate;
}

const BackstoryEditor: React.FC<BackstoryEditorProps> = ({
  initialBackstory,
  onBackstoryChange,
  onAnalyzeBackstory,
  aiAnalysis,
  isAnalyzing,
  useCustomBackstory,
  onToggleCustomBackstory,
  selectedTemplate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tùy Chỉnh Tiểu Sử
        </h2>
        <p className="text-gray-600">
          Mô tả quá khứ và động lực của nhân vật. AI sẽ phân tích để đề xuất chỉ
          số phù hợp.
        </p>
      </div>

      {/* Template/Custom Toggle */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="backstory-source"
            checked={!useCustomBackstory}
            onChange={() => onToggleCustomBackstory(false)}
            className="form-radio text-blue-600"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Sử dụng tiểu sử từ mẫu
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="backstory-source"
            checked={useCustomBackstory}
            onChange={() => onToggleCustomBackstory(true)}
            className="form-radio text-blue-600"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Viết tiểu sử tùy chỉnh
          </span>
        </label>
      </div>

      {/* Backstory Editor */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiểu sử nhân vật
          </label>
          <textarea
            value={initialBackstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Mô tả quá khứ, động lực và tính cách của nhân vật..."
            className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!useCustomBackstory && !!selectedTemplate}
          />
        </div>

        {/* AI Analysis Button */}
        <div className="flex justify-center">
          <button
            onClick={onAnalyzeBackstory}
            disabled={isAnalyzing || !initialBackstory.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Đang phân tích...' : '🤖 Phân tích bằng AI'}
          </button>
        </div>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">
            Kết quả phân tích AI
          </h3>
          <div className="space-y-3">
            <div>
              <strong className="text-green-800">Loại nhân vật:</strong>{' '}
              {aiAnalysis.characterArchetype}
            </div>
            <div>
              <strong className="text-green-800">Lý do:</strong>{' '}
              {aiAnalysis.reasoning}
            </div>
            <div>
              <strong className="text-green-800">Từ khóa phát hiện:</strong>{' '}
              {aiAnalysis.detectedKeywords.join(', ')}
            </div>
            <div>
              <strong className="text-green-800">Độ tin cậy:</strong>{' '}
              {Math.round(aiAnalysis.confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Mẹo viết tiểu sử hay:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Mô tả xuất thân và gia đình</li>
          <li>Kể về những sự kiện quan trọng đã định hình nhân vật</li>
          <li>Đề cập đến kỹ năng, sở thích và đặc điểm cá nhân</li>
          <li>Giải thích động lực và mục tiêu hiện tại</li>
        </ul>
      </div>
    </div>
  );
};

export default BackstoryEditor;
