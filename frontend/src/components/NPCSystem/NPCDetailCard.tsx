'use client';

import React, { useState } from 'react';
import { NPCDetailCardProps } from '@/types/npc.types';

/**
 * NPCDetailCard Component
 * Shows detailed information about an NPC with progressive disclosure
 * Displays known information and hints about unknown attributes
 */
const NPCDetailCard: React.FC<NPCDetailCardProps> = ({
  data,
  visible,
  position,
  onClose,
  onInteract,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'relationship' | 'history' | 'secrets'
  >('overview');

  if (!visible || !data) {
    return null;
  }

  const { npc, knownInformation, timeline } = data;

  // Get position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'modal':
        return 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50';
      case 'sidebar':
        return 'fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 z-40 transform transition-transform duration-300';
      case 'beside-lore':
      default:
        return 'absolute right-0 top-0 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-40';
    }
  };

  const getContainerClasses = () => {
    if (position === 'modal') {
      return 'bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden';
    }
    return 'h-full flex flex-col';
  };

  const getRelationshipColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-blue-400';
    if (score >= 20) return 'text-yellow-400';
    if (score >= -20) return 'text-gray-400';
    if (score >= -50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRelationshipBar = (score: number) => {
    const normalizedScore = ((score + 100) / 200) * 100; // Convert -100 to 100 range to 0 to 100
    const color = score >= 0 ? 'bg-green-500' : 'bg-red-500';

    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    );
  };

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  return (
    <div className={getPositionClasses()}>
      <div className={getContainerClasses()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {knownInformation.basic.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {knownInformation.basic.role || 'Không rõ vai trò'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Relationship Status */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Mối quan hệ</span>
              <span
                className={`text-sm font-medium ${getRelationshipColor(knownInformation.relationship.score)}`}
              >
                {knownInformation.relationship.status} (
                {knownInformation.relationship.score})
              </span>
            </div>
            {getRelationshipBar(knownInformation.relationship.score)}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 flex-shrink-0">
          {[
            { id: 'overview', label: 'Tổng quan', icon: '📋' },
            { id: 'relationship', label: 'Quan hệ', icon: '💭' },
            { id: 'history', label: 'Lịch sử', icon: '📜' },
            { id: 'secrets', label: 'Bí mật', icon: '🔍' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-900/50 text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Thông tin cơ bản
                </h4>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Mô tả:</strong> {knownInformation.basic.description}
                  </p>
                  {knownInformation.basic.faction && (
                    <p className="text-sm text-gray-300">
                      <strong>Phe phái:</strong>{' '}
                      {knownInformation.basic.faction}
                    </p>
                  )}
                </div>
              </div>

              {/* Discovered Attributes */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Đã khám phá
                </h4>
                <div className="space-y-2">
                  {knownInformation.discovered.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="bg-green-900/20 border border-green-700/50 rounded-lg p-2"
                    >
                      <p className="text-sm text-green-300">{attr}</p>
                    </div>
                  ))}
                  {knownInformation.discovered.attributes.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Chưa khám phá thêm thông tin gì...
                    </p>
                  )}
                </div>
              </div>

              {/* Unknown Hints */}
              {knownInformation.unknown.hiddenCount > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-2">
                    Chưa biết ({knownInformation.unknown.hiddenCount})
                  </h4>
                  <div className="space-y-2">
                    {knownInformation.unknown.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-2"
                      >
                        <p className="text-sm text-gray-400">{hint}</p>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 italic">
                      Tương tác thêm để khám phá...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'relationship' && (
            <div className="space-y-4">
              {/* Relationship History */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Lịch sử tương tác
                </h4>
                <div className="space-y-2">
                  {knownInformation.relationship.history
                    .slice(0, 5)
                    .map((event, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-2"
                      >
                        <p className="text-sm text-gray-300">{event}</p>
                      </div>
                    ))}
                  {knownInformation.relationship.history.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có tương tác đáng chú ý...
                    </p>
                  )}
                </div>
              </div>

              {/* Relationship Tips */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Gợi ý
                </h4>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    {knownInformation.relationship.score >= 50
                      ? `${npc.name} có vẻ tin tưởng bạn. Hãy duy trì mối quan hệ tốt này.`
                      : knownInformation.relationship.score <= -20
                        ? `${npc.name} có vẻ không thích bạn. Cần thận trọng khi tương tác.`
                        : `${npc.name} vẫn chưa có ấn tượng rõ ràng về bạn. Hãy tương tác thêm.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Dòng thời gian
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong>Lần đầu gặp:</strong> {timeline.firstMet}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong>Tổng tương tác:</strong>{' '}
                        {timeline.totalInteractions}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong>Gặp lần cuối:</strong> {timeline.lastSeen}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Events */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Sự kiện quan trọng
                </h4>
                <div className="space-y-2">
                  {timeline.keyEvents.map((event, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-sm text-gray-300">{event}</p>
                    </div>
                  ))}
                  {timeline.keyEvents.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có sự kiện đáng chú ý...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'secrets' && (
            <div className="space-y-4">
              {/* Known Secrets */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Bí mật đã biết
                </h4>
                <div className="space-y-2">
                  {knownInformation.discovered.secrets.map((secret, index) => (
                    <div
                      key={index}
                      className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3"
                    >
                      <p className="text-sm text-purple-300">{secret}</p>
                    </div>
                  ))}
                  {knownInformation.discovered.secrets.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Chưa khám phá được bí mật nào...
                    </p>
                  )}
                </div>
              </div>

              {/* Mystery Level */}
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-2">
                  Mức độ bí ẩn
                </h4>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Đã khám phá</span>
                    <span className="text-sm text-gray-400">
                      {knownInformation.discovered.attributes.length} /{' '}
                      {knownInformation.discovered.attributes.length +
                        knownInformation.unknown.hiddenCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(knownInformation.discovered.attributes.length / (knownInformation.discovered.attributes.length + knownInformation.unknown.hiddenCount)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {onInteract && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex space-x-2">
              <button
                onClick={() => onInteract(npc.id, 'talk')}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Trò chuyện
              </button>
              <button
                onClick={() => onInteract(npc.id, 'investigate')}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Điều tra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCDetailCard;
