'use client';

import React from 'react';
import KarmaReputationPanel from '@/components/GameplayScreen/KarmaReputationPanel';

export default function KarmaDemoPage() {
  // Sample data for testing
  const sampleKarmaData: Array<{
    karmaScore: number;
    reputation: { [key: string]: number };
  }> = [
    {
      karmaScore: 75,
      reputation: {
        royalGuard: 80,
        merchantsGuild: 45,
        thieves: -30,
        nobles: 60,
        commoners: 90,
      },
    },
    {
      karmaScore: -45,
      reputation: {
        darkCult: 70,
        cityWatch: -60,
        underground: 40,
        assassins: 85,
      },
    },
    {
      karmaScore: 0,
      reputation: {},
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-8">
          Karma & Reputation Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleKarmaData.map((data, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Sample {index + 1}
              </h2>
              <KarmaReputationPanel
                karmaScore={data.karmaScore}
                reputation={data.reputation}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">
            Karma Levels Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-400 mb-2">
                Positive Karma
              </h3>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <span className="text-yellow-400">100+:</span> Saint
                </li>
                <li>
                  <span className="text-green-400">50-99:</span> Good
                </li>
                <li>
                  <span className="text-blue-400">10-49:</span> Neutral+
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-400 mb-2">Negative Karma</h3>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <span className="text-gray-400">-10 to 9:</span> Neutral
                </li>
                <li>
                  <span className="text-orange-400">-50 to -11:</span> Neutral-
                </li>
                <li>
                  <span className="text-red-400">-100 to -51:</span> Evil
                </li>
                <li>
                  <span className="text-purple-400">-100-:</span> Demon
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">
            Reputation Levels Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-400 mb-2">
                Positive Reputation
              </h3>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <span className="text-yellow-400">80+:</span> Revered
                </li>
                <li>
                  <span className="text-green-400">60-79:</span> Honored
                </li>
                <li>
                  <span className="text-blue-400">40-59:</span> Friendly
                </li>
                <li>
                  <span className="text-gray-400">20-39:</span> Neutral
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-400 mb-2">
                Negative Reputation
              </h3>
              <ul className="space-y-1 text-gray-300">
                <li>
                  <span className="text-orange-400">0-19:</span> Unfriendly
                </li>
                <li>
                  <span className="text-red-400">-20 to -1:</span> Hostile
                </li>
                <li>
                  <span className="text-purple-400">-20-:</span> Hated
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
