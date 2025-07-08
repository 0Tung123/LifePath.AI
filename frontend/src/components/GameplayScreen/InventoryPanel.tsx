'use client';

import React, { useState } from 'react';
import { LegacyInventoryItem } from '@/types/shared';

interface InventoryPanelProps {
  inventoryItems: LegacyInventoryItem[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventoryItems }) => {
  const [selectedItem, setSelectedItem] = useState<LegacyInventoryItem | null>(
    null,
  );

  const handleItemClick = (item: LegacyInventoryItem) => {
    setSelectedItem(selectedItem?.name === item.name ? null : item);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        Kho Đồ ({inventoryItems?.length || 0})
      </h3>

      {!inventoryItems || inventoryItems.length === 0 ? (
        <div className="text-center text-gray-400 py-6">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p>Kho đồ trống</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {inventoryItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedItem?.name === item.name
                    ? 'bg-amber-900/50 border-amber-500/50 text-amber-200'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs">
                      x{item.quantity}
                    </span>
                  )}
                </div>
              </button>

              {/* Item Description */}
              {selectedItem?.name === item.name && item.description && (
                <div className="ml-4 p-3 bg-gray-700/50 rounded-lg border-l-4 border-amber-500">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
