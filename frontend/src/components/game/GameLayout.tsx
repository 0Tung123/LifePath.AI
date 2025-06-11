import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/store/GameContext';
import LoadingSpinner from './LoadingSpinner';
import GameHeader from './GameHeader';
import StoryNodeComponent from './StoryNodeComponent';
import UserInputForm from './UserInputForm';
import QuestList from './QuestList';
import { UserInputData } from '@/api/apiClient';

interface GameLayoutProps {
  gameSessionId: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({ gameSessionId }) => {
  const router = useRouter();
  const { 
    currentSession,
    currentNode,
    loadingSession,
    error,
    fetchGameSession,
    makeChoice,
    processUserInput,
    saveGame,
    endGame
  } = useGame();
  
  const [isSaving, setIsSaving] = useState(false);
  const [npcPopup, setNpcPopup] = useState<{ name: string; info: any } | null>(null);

  useEffect(() => {
    // Load game session data
    fetchGameSession(gameSessionId);
  }, [gameSessionId, fetchGameSession]);

  const handleMakeChoice = async (choiceId: string) => {
    await makeChoice(choiceId);
  };

  const handleCustomInput = async (type: string, content: string, target?: string) => {
    const inputData: UserInputData = {
      type,
      content,
      target
    };
    
    await processUserInput(inputData);
  };

  const handleSaveGame = async () => {
    try {
      setIsSaving(true);
      await saveGame(gameSessionId);
      alert('Game đã được lưu thành công!');
    } catch (error) {
      console.error('Failed to save game:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndGame = async () => {
    if (window.confirm('Bạn có chắc chắn muốn kết thúc phiên chơi này? Bạn sẽ không thể tiếp tục phiên này nữa.')) {
      try {
        await endGame(gameSessionId);
        router.push('/game');
      } catch (error) {
        console.error('Failed to end game:', error);
      }
    }
  };

  // Xử lý khi người chơi nhấp vào tên NPC trong nội dung
  const handleNpcClick = (npcName: string) => {
    // Trong thực tế, bạn có thể cần gọi API để lấy thông tin chi tiết về NPC
    // Ở đây tôi sẽ giả lập thông tin
    setNpcPopup({
      name: npcName,
      info: {
        age: Math.floor(Math.random() * 50) + 18,
        level: Math.floor(Math.random() * 10) + 1,
        relationship: 'Người lạ',
        relationshipValue: Math.floor(Math.random() * 100),
        description: `${npcName} là một nhân vật bí ẩn trong thế giới này. Bạn không biết nhiều về họ.`
      }
    });
  };

  if (loadingSession && !currentSession) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <LoadingSpinner size="large" message="Đang tải phiên game..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl text-red-500 max-w-md text-center p-6">
          <div className="mb-4">Đã xảy ra lỗi:</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!currentSession || !currentNode) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl max-w-md text-center p-6">
          Phiên chơi game không tồn tại hoặc đã kết thúc
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header with Controls */}
        <GameHeader 
          character={currentSession.character}
          session={currentSession}
          onSaveGame={handleSaveGame}
          onEndGame={handleEndGame}
          isSaving={isSaving}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
          {/* Main game content - 3/4 width on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Story Node with choices */}
            <StoryNodeComponent 
              node={currentNode} 
              onMakeChoice={handleMakeChoice}
              isLoading={loadingSession}
            />

            {/* Custom input form */}
            <UserInputForm 
              onSubmit={handleCustomInput}
              isLoading={loadingSession}
            />
          </div>

          {/* Side panel - 1/4 width on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Character info panel */}
            <div className="bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium mb-3">Nhân vật</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Tên:</span> {currentSession.character?.name}
                </p>
                <p>
                  <span className="text-gray-400">Cấp độ:</span> {currentSession.character?.level}
                </p>
                <p>
                  <span className="text-gray-400">Kinh nghiệm:</span> {currentSession.character?.experience} XP
                </p>
                {currentSession.character?.traits && (
                  <div>
                    <span className="text-gray-400">Đặc điểm:</span>
                    <div className="flex flex-wrap mt-1">
                      {currentSession.character.traits.map((trait, index) => (
                        <span key={index} className="bg-gray-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quests list */}
            {currentSession.quests && (
              <QuestList quests={currentSession.quests} />
            )}
          </div>
        </div>
      </div>

      {/* Popup thông tin NPC */}
      {npcPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{npcPopup.name}</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Tuổi:</span> {npcPopup.info.age}</p>
              <p><span className="font-semibold">Cấp độ:</span> {npcPopup.info.level}</p>
              <p><span className="font-semibold">Mối quan hệ:</span> {npcPopup.info.relationship}</p>
              <p><span className="font-semibold">Mức độ thân thiết:</span> {npcPopup.info.relationshipValue}/100</p>
              <p><span className="font-semibold">Mô tả:</span> {npcPopup.info.description}</p>
            </div>
            <button 
              className="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              onClick={() => setNpcPopup(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLayout;