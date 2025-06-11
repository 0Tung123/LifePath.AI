import React from 'react';
import { Quest } from '../../api/apiClient';
import Card from './Card';

interface QuestListProps {
  quests: Quest[];
}

const QuestList: React.FC<QuestListProps> = ({ quests }) => {
  if (!quests || quests.length === 0) {
    return null;
  }

  const activeQuests = quests.filter(quest => !quest.isCompleted);
  const completedQuests = quests.filter(quest => quest.isCompleted);

  return (
    <Card title="Nhiệm vụ">
      <div className="space-y-6">
        {activeQuests.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Đang theo dõi</h4>
            <div className="space-y-2">
              {activeQuests.map(quest => (
                <div key={quest.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">{quest.title}</h5>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{quest.description}</p>
                      {quest.reward && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Phần thưởng: {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedQuests.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Đã hoàn thành</h4>
            <div className="space-y-2">
              {completedQuests.map(quest => (
                <div key={quest.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md opacity-75">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white line-through">{quest.title}</h5>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{quest.description}</p>
                      {quest.reward && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Đã nhận: {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuestList;