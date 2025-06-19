"use client";

import React, { useState, useEffect } from "react";
import { CharacterLifeSummary } from "@/services/game.service";

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
  const [showFullSummary, setShowFullSummary] = useState(false);

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
                    {lifeSummary.totalChapters}
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
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-4">
            {/* NPCs Met */}
            {lifeSummary.npcsMet.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">
                  Nhân Vật Đã Gặp ({lifeSummary.npcsMet.length})
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
                  {lifeSummary.npcsMet.length > 6 && (
                    <div className="text-gray-400 text-sm">
                      +{lifeSummary.npcsMet.length - 6} nhân vật khác...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory */}
            {lifeSummary.inventory.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-3">
                  Vật Phẩm Sở Hữu ({lifeSummary.inventory.length})
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
            {lifeSummary.skills.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">
                  Kỹ Năng Đã Học ({lifeSummary.skills.length})
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
            {lifeSummary.importantEvents.length > 0 && (
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
            {lifeSummary.achievements.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">
                  Thành Tựu ({lifeSummary.achievements.length})
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
              {isLoading ? "Đang hồi sinh..." : "🔄 Hồi Sinh (Có hình phạt)"}
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
