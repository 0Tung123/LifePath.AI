"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// TypeScript interfaces
interface Choice {
  id: string;
  text: string;
  requiredAttribute?: string;
  requiredAttributeValue?: number;
  requiredSkill?: string;
  requiredItem?: string;
}

interface Enemy {
  name: string;
  level: number;
  health: number;
}

interface CombatData {
  enemies: Enemy[];
}

interface StoryNode {
  id?: string;
  content: string;
  location?: string;
  sceneDescription?: string;
  choices?: Choice[];
  isCombatScene?: boolean;
  combatData?: CombatData;
  isEnding?: boolean;
  selectedChoiceId?: string;
  selectedChoiceText?: string;
  parentNodeId?: string;
  choiceIdFromParent?: string;
  depth?: number;
  isVisited?: boolean;
  childNodes?: StoryNode[];
  parentNode?: StoryNode;
}

interface StoryPath {
  id: string;
  nodeId: string;
  choiceId: string;
  choiceText: string;
  stepOrder: number;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rarity?: string;
  type?: string;
  value?: number;
}

interface Inventory {
  items?: InventoryItem[];
  currency?: Record<string, number>;
}

interface Character {
  name: string;
  characterClass: string;
  level: number;
  experience?: number;
  attributes: Record<string, number>;
  skills: string[];
  inventory?: Inventory;
  primaryGenre?: string;
}

interface GameState {
  questLog?: string[];
  completedQuests?: string[];
}

interface GameSession {
  id: string;
  character: Character;
  currentStoryNode: StoryNode;
  gameState?: GameState;
  storyNodes?: StoryNode[];
  storyPaths?: StoryPath[];
  isActive?: boolean;
  startedAt?: string;
  lastSavedAt?: string;
  endedAt?: string;
}

export default function GamePlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [makingChoice, setMakingChoice] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        setLoading(true);
        const [sessionResponse, historyResponse] = await Promise.all([
          axios.get(`/api/game/sessions/${id}`),
          axios.get(`/api/game/sessions/${id}/history`),
        ]);

        setGameSession(sessionResponse.data);
        setStoryHistory(historyResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching game session:", err);
        setError("Không thể tải phiên game. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (id) {
      fetchGameSession();
    }
  }, [id]);

  // Go back to previous node - Quay lại lựa chọn trước đó
  const goBackToNode = async (nodeId: string) => {
    try {
      setLoading(true);
      const [sessionResponse, historyResponse] = await Promise.all([
        axios.post(`/api/game/sessions/${id}/go-back/${nodeId}`),
        axios.get(`/api/game/sessions/${id}/history`),
      ]);

      setGameSession(sessionResponse.data);
      setStoryHistory(historyResponse.data);

      // Reset UI states
      setMakingChoice(false);
      setSelectedChoiceId(null);
    } catch (error) {
      console.error("Failed to go back to node:", error);
      setError("Không thể quay lại lựa chọn trước");
    } finally {
      setLoading(false);
    }
  };

  // Thực hiện lựa chọn
  const makeChoice = async (choiceId: string) => {
    try {
      setMakingChoice(true);
      setSelectedChoiceId(choiceId);

      const [sessionResponse, historyResponse] = await Promise.all([
        axios.post(`/api/game/sessions/${id}/choices/${choiceId}`),
        axios.get(`/api/game/sessions/${id}/history`),
      ]);

      // Cập nhật game session và lịch sử
      setGameSession(sessionResponse.data);
      setStoryHistory(historyResponse.data);

      // Reset trạng thái UI
      setMakingChoice(false);
      setSelectedChoiceId(null);

      // Cuộn xuống diễn biến mới
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTo({
            top: contentRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (err) {
      console.error("Error making choice:", err);
      setError("Không thể thực hiện lựa chọn. Vui lòng thử lại.");
      setMakingChoice(false);
      setSelectedChoiceId(null);
    }
  };

  const endGame = async () => {
    try {
      await axios.put(`/api/game/sessions/${id}/end`);
      router.push("/game");
    } catch (err) {
      console.error("Error ending game:", err);
      setError("Không thể kết thúc phiên game. Vui lòng thử lại.");
    }
  };

  // Kiểm tra xem nhân vật có đáp ứng yêu cầu của lựa chọn không
  const canMakeChoice = (choice: Choice): boolean => {
    if (!gameSession || !gameSession.character) return false;

    const character = gameSession.character;

    // Kiểm tra thuộc tính yêu cầu
    if (choice.requiredAttribute && choice.requiredAttributeValue) {
      const attributeValue = character.attributes[choice.requiredAttribute];
      if (!attributeValue || attributeValue < choice.requiredAttributeValue) {
        return false;
      }
    }

    // Kiểm tra kỹ năng yêu cầu
    if (choice.requiredSkill) {
      if (!character.skills.includes(choice.requiredSkill)) {
        return false;
      }
    }

    // Kiểm tra vật phẩm yêu cầu
    if (choice.requiredItem) {
      const hasItem = character.inventory?.items?.some(
        (item) =>
          item.name === choice.requiredItem || item.id === choice.requiredItem
      );
      if (!hasItem) {
        return false;
      }
    }

    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải phiên game...
          </div>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Lỗi</div>
          <p>{error}</p>
          <Link
            href="/game"
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-block"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            Không tìm thấy phiên game
          </div>
          <Link
            href="/game"
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-block"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Game Header */}
      <div className="bg-gray-800 shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            {/* Game Title and Character */}
            <div>
              <h1 className="text-2xl font-bold">
                {gameSession.character.name}{" "}
                <span className="text-gray-400">
                  Lvl. {gameSession.character.level}
                </span>
              </h1>
              <div className="text-sm text-gray-400">
                {gameSession.character.characterClass}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn có chắc muốn kết thúc phiên game này không?"
                    )
                  ) {
                    endGame();
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Kết thúc
              </button>
              <Link
                href="/game"
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="container mx-auto p-6">
        {/* Story Content */}
        <div
          ref={contentRef}
          className="max-h-[60vh] overflow-y-auto bg-gray-800/30 rounded-lg p-4 space-y-6 border border-gray-700"
        >
          {storyHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-pulse">
                Đang tải lịch sử câu chuyện...
              </div>
            </div>
          ) : (
            storyHistory.map((storyNode, index) => {
              const isLatest = index === storyHistory.length - 1;
              const nodeId = storyNode.id || `node-${index}`;

              return (
                <div
                  key={nodeId}
                  id={`story-node-${nodeId}`}
                  className="relative rounded-lg p-4 bg-gray-800/20 border border-gray-700/30"
                >
                  {/* Diễn biến */}
                  <div className="prose prose-invert max-w-none text-white">
                    {/* Hiển thị lựa chọn đã chọn từ node trước đó (nếu có) */}
                    {index > 0 &&
                      storyHistory[index - 1]?.selectedChoiceText && (
                        <div className="mb-4 text-green-400 font-semibold border-l-4 border-green-500 pl-3 py-1">
                          <span className="opacity-75">Bạn đã chọn:</span>{" "}
                          {storyHistory[index - 1].selectedChoiceText}
                        </div>
                      )}

                    {/* Nội dung chính của node */}
                    <div>{storyNode.content}</div>
                  </div>

                  {/* Nút quay lại - chỉ hiển thị nút quay lại khi đây không phải là node cuối cùng */}
                  {!isLatest && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => goBackToNode(nodeId)}
                        className="text-sm px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded transition-colors flex items-center space-x-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Quay lại chọn lại
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Choices - Hiển thị lựa chọn cho node hiện tại */}
        {gameSession.currentStoryNode?.choices &&
          gameSession.currentStoryNode.choices.length > 0 && (
            <div ref={choicesRef} className="space-y-4 mt-8">
              <h3 className="text-xl font-bold mb-4">Lựa chọn của bạn</h3>

              {gameSession.currentStoryNode.choices.map((choice) => {
                const canChoose = canMakeChoice(choice);

                return (
                  <button
                    key={choice.id}
                    onClick={() => canChoose && makeChoice(choice.id)}
                    disabled={!canChoose || makingChoice}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedChoiceId === choice.id
                        ? "bg-blue-600 text-white"
                        : canChoose
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p>{choice.text}</p>

                        {/* Hiển thị yêu cầu nếu không đáp ứng */}
                        {!canChoose && (
                          <div className="mt-2 text-sm text-red-400">
                            {choice.requiredAttribute &&
                              choice.requiredAttributeValue && (
                                <p>
                                  Yêu cầu: {choice.requiredAttribute} ≥{" "}
                                  {choice.requiredAttributeValue}
                                </p>
                              )}

                            {choice.requiredSkill && (
                              <p>Yêu cầu kỹ năng: {choice.requiredSkill}</p>
                            )}

                            {choice.requiredItem && (
                              <p>Yêu cầu vật phẩm: {choice.requiredItem}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {makingChoice && selectedChoiceId === choice.id && (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        {/* Ending */}
        {gameSession.currentStoryNode?.isEnding && (
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Kết thúc</h3>
            <p className="text-gray-400 mb-6">
              Cuộc phiêu lưu của bạn đã kết thúc.
            </p>
            <button
              onClick={endGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Trở về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
