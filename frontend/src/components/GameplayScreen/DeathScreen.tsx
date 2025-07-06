'use client';

import React from 'react';
import { CharacterLifeSummary } from '@/types/shared';

interface DeathScreenProps {
  lifeSummary: CharacterLifeSummary;
  hasResurrectionAbility: boolean;
  onResurrect: () => void;
  onAcceptDeath: () => void;
  isLoading: boolean;
}

const DeathScreen: React.FC<DeathScreenProps> = ({
  lifeSummary,
  hasResurrectionAbility,
  onResurrect,
  onAcceptDeath,
  isLoading,
}) => {
  // const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border-2 border-red-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-red-500/50 text-center">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-3xl font-bold text-red-400 mb-2">GAME OVER</h1>
          <h2 className="text-xl text-gray-300">
            {lifeSummary.characterName} đã qua đời
          </h2>
          <p className="text-gray-400 mt-2">{lifeSummary.deathCause}</p>
        </div>

        {/* Life Summary */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-400 mb-3">
                Thông Tin Cơ Bản
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tên:</span>
                  <span className="text-white">
                    {lifeSummary.characterName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thể loại:</span>
                  <span className="text-white">{lifeSummary.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bối cảnh:</span>
                  <span className="text-white">{lifeSummary.setting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời gian chơi:</span>
                  <span className="text-white">{lifeSummary.playTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tổng chương:</span>
                  <span className="text-white">
                    {lifeSummary.totalChapters || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-400 mb-3">
                Chỉ Số Cuối Cùng
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(lifeSummary.finalStats).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-white">
                      {typeof value === 'string' || typeof value === 'number'
                        ? value
                        : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Karma & Reputation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Karma */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                Karma Cuối Cùng
              </h3>
              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    lifeSummary.karmaScore >= 50
                      ? 'text-green-400'
                      : lifeSummary.karmaScore >= 0
                        ? 'text-blue-400'
                        : lifeSummary.karmaScore >= -50
                          ? 'text-orange-400'
                          : 'text-red-400'
                  }`}
                >
                  {lifeSummary.karmaScore}
                </div>
                <div
                  className={`text-sm ${
                    lifeSummary.karmaScore >= 100
                      ? 'text-yellow-400'
                      : lifeSummary.karmaScore >= 50
                        ? 'text-green-400'
                        : lifeSummary.karmaScore >= 0
                          ? 'text-blue-400'
                          : lifeSummary.karmaScore >= -50
                            ? 'text-orange-400'
                            : 'text-red-400'
                  }`}
                >
                  {lifeSummary.karmaScore >= 100
                    ? 'Thánh Nhân'
                    : lifeSummary.karmaScore >= 50
                      ? 'Thiện Lương'
                      : lifeSummary.karmaScore >= 0
                        ? 'Trung Lập+'
                        : lifeSummary.karmaScore >= -50
                          ? 'Trung Lập-'
                          : 'Tà Ác'}
                </div>
              </div>
            </div>

            {/* Reputation */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                Danh Tiếng
              </h3>
              {lifeSummary.reputation &&
              Object.keys(lifeSummary.reputation).length > 0 ? (
                <div className="space-y-2 text-sm">
                  {Object.entries(lifeSummary.reputation).map(
                    ([faction, score]) => (
                      <div key={faction} className="flex justify-between">
                        <span className="text-gray-400 capitalize">
                          {faction.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span
                          className={`font-medium ${
                            score >= 60
                              ? 'text-green-400'
                              : score >= 20
                                ? 'text-blue-400'
                                : score >= 0
                                  ? 'text-gray-400'
                                  : score >= -20
                                    ? 'text-orange-400'
                                    : 'text-red-400'
                          }`}
                        >
                          {score >= 80
                            ? 'Tôn Kính'
                            : score >= 60
                              ? 'Danh Dự'
                              : score >= 40
                                ? 'Thân Thiện'
                                : score >= 20
                                  ? 'Trung Lập'
                                  : score >= 0
                                    ? 'Không Thân'
                                    : score >= -20
                                      ? 'Thù Địch'
                                      : 'Căm Ghét'}{' '}
                          ({score})
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic text-center">
                  Chưa thiết lập mối quan hệ với phe phái nào
                </div>
              )}
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            {/* NPCs Met */}
            {lifeSummary.npcsMet && lifeSummary.npcsMet.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">
                  Nhân Vật Đã Gặp ({lifeSummary.npcsMet?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {lifeSummary.npcsMet.slice(0, 6).map((npc, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2">
                      <div className="font-medium text-blue-300">
                        {npc.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {npc.description}
                      </div>
                    </div>
                  ))}
                  {lifeSummary.npcsMet && lifeSummary.npcsMet.length > 6 && (
                    <div className="text-gray-400 text-sm">
                      +{lifeSummary.npcsMet.length - 6} nhân vật khác...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory */}
            {lifeSummary.inventory && lifeSummary.inventory.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-3">
                  Vật Phẩm Sở Hữu ({lifeSummary.inventory?.length || 0})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {lifeSummary.inventory.map((item, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2">
                      <div className="font-medium text-green-300">
                        {item.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {lifeSummary.skills && lifeSummary.skills.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">
                  Kỹ Năng Đã Học ({lifeSummary.skills?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {lifeSummary.skills.map((skill, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2">
                      <div className="font-medium text-purple-300">
                        {skill.name}
                      </div>
                      {skill.description && (
                        <div className="text-gray-400 text-xs">
                          {skill.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Events */}
            {lifeSummary.importantEvents &&
              lifeSummary.importantEvents.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                    Sự Kiện Quan Trọng
                  </h3>
                  <div className="space-y-2 text-sm">
                    {lifeSummary.importantEvents
                      .slice(0, 5)
                      .map((event, index) => (
                        <div key={index} className="bg-gray-700 rounded p-2">
                          <div className="text-yellow-300">
                            {event.description}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Achievements */}
            {lifeSummary.achievements &&
              lifeSummary.achievements.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">
                    Thành Tựu ({lifeSummary.achievements?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {lifeSummary.achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <div className="font-medium text-orange-300">
                          🏆 {achievement.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {achievement.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-700 flex justify-center space-x-4">
          {hasResurrectionAbility && (
            <button
              onClick={onResurrect}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang hồi sinh...' : '🔄 Hồi Sinh (Có hình phạt)'}
            </button>
          )}
          <button
            onClick={onAcceptDeath}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💀 Chấp Nhận Cái Chết
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeathScreen;
