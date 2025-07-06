'use client';

import React, { useState, useEffect } from 'react';
import { CharacterTemplate } from '@/types/character-creation.types';
import characterCreationService from '@/services/character-creation.service';

interface TemplateSelectionProps {
  worldType: string;
  selectedTemplate?: CharacterTemplate;
  onTemplateSelect: (template: CharacterTemplate) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  worldType,
  selectedTemplate,
  onTemplateSelect,
}) => {
  const [templates, setTemplates] = useState<CharacterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'global' | 'setting_specific' | 'custom'
  >('global');

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const allTemplates = await characterCreationService.getTemplates({
          worldType,
          includeCustom: true,
        });
        setTemplates(allTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load character templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [worldType]);

  const getTemplatesByCategory = (
    category: 'global' | 'setting_specific' | 'custom',
  ) => {
    return templates.filter((template) => template.category === category);
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

  const renderTemplateCard = (template: CharacterTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <div
        key={template.id}
        className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => onTemplateSelect(template)}
      >
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getTemplateIcon(template.id)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{template.name}</h3>
              {isSelected && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>

            {/* Template Stats Preview */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {Object.entries(template.attributes)
                  .slice(0, 3)
                  .map(([stat, value]) => (
                    <span
                      key={stat}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {stat}: {value}
                    </span>
                  ))}
                {Object.keys(template.attributes).length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{Object.keys(template.attributes).length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Template Skills */}
            {template.skills.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Kỹ năng:</p>
                <div className="flex flex-wrap gap-1">
                  {template.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {template.skills.length > 3 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      +{template.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    const categoryTemplates = getTemplatesByCategory(activeTab);

    if (categoryTemplates.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">
            {activeTab === 'custom'
              ? 'Bạn chưa có mẫu tùy chỉnh nào'
              : 'Không có mẫu nào cho danh mục này'}
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryTemplates.map(renderTemplateCard)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải mẫu nhân vật...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chọn Mẫu Nhân Vật
        </h2>
        <p className="text-gray-600">
          Chọn một mẫu nhân vật làm điểm khởi đầu cho cuộc phiêu lưu của bạn
          trong thế giới {worldType}.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('global')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'global'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mẫu Cổ Điển
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {getTemplatesByCategory('global').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('setting_specific')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'setting_specific'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mẫu {worldType}
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {getTemplatesByCategory('setting_specific').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mẫu Tùy Chỉnh
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
              {getTemplatesByCategory('custom').length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            Mẫu được chọn: {selectedTemplate.name}
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            {selectedTemplate.description}
          </p>
          <div className="text-sm text-blue-700">
            <strong>Tiểu sử:</strong> {selectedTemplate.backstory.slice(0, 150)}
            ...
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
