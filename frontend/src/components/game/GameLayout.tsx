import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import CharacterInfo from './CharacterInfo';
import StoryNode from './StoryNode';
import ChoicesList from './ChoicesList';
import CustomInputs from './CustomInputs';

interface GameLayoutProps {
  gameSessionId: string;
}

interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  experience: number;
  attributes: Record<string, number>;
  skills: string[];
  inventory: {
    items: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      type?: string;
      effects?: Record<string, any>;
      value?: number;
      rarity?: string;
    }[];
    currency: Record<string, number>;
  };
  backstory?: string;
  primaryGenre: string;
  // Custom fields từ metadata
  title?: string;
  gender?: 'male' | 'female';
  background?: string;
  introduction?: string;
}

interface StoryNodeType {
  id: string;
  content: string;
  location?: string;
  choices: {
    id: string;
    text: string;
    order: number;
    metadata?: {
      isCustomAction?: boolean;
    };
  }[];
  metadata?: {
    inputType?: string;
    userInput?: string;
  };
}

interface GameSession {
  id: string;
  character: Character;
  currentStoryNode: StoryNodeType;
  isActive: boolean;
}

const GameLayout: React.FC<GameLayoutProps> = ({ gameSessionId }) => {
  const router = useRouter();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [npcPopup, setNpcPopup] = useState<{ name: string; info: any } | null>(null);

  useEffect(() => {
    fetchGameSession();
  }, [gameSessionId]);

  const fetchGameSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/game/sessions/${gameSessionId}`);
      setGameSession(response.data);
    } catch (err) {
      console.error('Error fetching game session:', err);
      setError('Không thể tải phiên chơi game. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChoice = async (choiceId: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/game/sessions/${gameSessionId}/choices/${choiceId}`);
      setGameSession(response.data);
    } catch (err) {
      console.error('Error making choice:', err);
      setError('Không thể thực hiện lựa chọn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomInput = async (type: string, content: string, target?: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/game/sessions/${gameSessionId}/input`, {
        type,
        content,
        target
      });
      setGameSession(response.data);
    } catch (err) {
      console.error('Error submitting custom input:', err);
      setError('Không thể gửi hành động. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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

  if (loading && !gameSession) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-2xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Phiên chơi game không tồn tại hoặc đã kết thúc</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header với tiêu đề */}
        <header className="bg-gray-800 p-4 rounded-t-lg text-center">
          <h1 className="text-2xl font-bold">
            {gameSession.character.title || 'Cuộc phiêu lưu mới'}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Thông tin nhân vật - 1/3 chiều rộng trên màn hình lớn */}
          <div className="md:col-span-1">
            <CharacterInfo character={gameSession.character} />
          </div>

          {/* Nội dung story node và tương tác - 2/3 chiều rộng trên màn hình lớn */}
          <div className="md:col-span-2 space-y-4">
            {/* Nội dung story node */}
            <StoryNode 
              content={gameSession.currentStoryNode.content} 
              onNpcClick={handleNpcClick}
            />

            {/* Danh sách lựa chọn */}
            <ChoicesList 
              choices={gameSession.currentStoryNode.choices} 
              onChoiceSelected={handleMakeChoice}
            />

            {/* Các hành động tùy chỉnh */}
            <CustomInputs onSubmit={handleCustomInput} />
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