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
  content: string;
  location?: string;
  sceneDescription?: string;
  choices?: Choice[];
  isCombatScene?: boolean;
  combatData?: CombatData;
  isEnding?: boolean;
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
  character: Character;
  currentStoryNode: StoryNode;
  gameState?: GameState;
}

export default function GamePlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [makingChoice, setMakingChoice] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showCharacterInfo, setShowCharacterInfo] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showQuestLog, setShowQuestLog] = useState<boolean>(false);
  const [animateText, setAnimateText] = useState<boolean>(true);
  const [textComplete, setTextComplete] = useState<boolean>(false);
  const [showChoices, setShowChoices] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/game/sessions/${id}`);
        setGameSession(response.data);
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

  // Hiệu ứng hiển thị văn bản từng chữ một
  useEffect(() => {
    if (!gameSession || !animateText || textComplete) return;

    const content = gameSession.currentStoryNode?.content || "";
    const contentElement = contentRef.current;

    if (!contentElement) return;

    contentElement.innerHTML = "";
    let index = 0;

    const interval = setInterval(() => {
      if (index < content.length) {
        contentElement.innerHTML += content.charAt(index);
        index++;

        // Tự động cuộn xuống khi văn bản dài
        contentElement.scrollTop = contentElement.scrollHeight;
      } else {
        clearInterval(interval);
        setTextComplete(true);
        setShowChoices(true);
      }
    }, 30); // Tốc độ hiển thị chữ

    return () => clearInterval(interval);
  }, [gameSession, animateText, textComplete]);

  // Cuộn xuống khi hiển thị lựa chọn
  useEffect(() => {
    if (showChoices && choicesRef.current) {
      const element = choicesRef.current;
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [showChoices]);

  const makeChoice = async (choiceId: string) => {
    try {
      setMakingChoice(true);
      setSelectedChoiceId(choiceId);

      const response = await axios.post(
        `/api/game/sessions/${id}/choices/${choiceId}`
      );

      // Reset các trạng thái
      setGameSession(response.data);
      setTextComplete(false);
      setShowChoices(false);
      setMakingChoice(false);
      setSelectedChoiceId(null);

      // Cuộn lên đầu khi chuyển sang nút truyện mới
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const saveGame = async () => {
    try {
      await axios.put(`/api/game/sessions/${id}/save`);
      alert("Đã lưu phiên game thành công!");
    } catch (err) {
      console.error("Error saving game:", err);
      setError("Không thể lưu phiên game. Vui lòng thử lại.");
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

  // Xác định màu nền dựa trên thể loại
  const getGenreGradient = (genre: string | undefined): string => {
    const gradients: Record<string, string> = {
      fantasy: "from-blue-900/70 to-purple-900/70",
      modern: "from-gray-900/70 to-blue-900/70",
      scifi: "from-cyan-900/70 to-blue-900/70",
      xianxia: "from-yellow-900/70 to-orange-900/70",
      wuxia: "from-red-900/70 to-pink-900/70",
      horror: "from-gray-900/70 to-red-900/70",
      cyberpunk: "from-purple-900/70 to-pink-900/70",
      steampunk: "from-amber-900/70 to-yellow-900/70",
      postapocalyptic: "from-green-900/70 to-yellow-900/70",
      historical: "from-amber-900/70 to-yellow-900/70",
    };

    return gradients[genre || ""] || "from-gray-900/70 to-blue-900/70";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Game Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/game")}
              className="mr-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            <div>
              <h1 className="text-xl font-bold">
                {gameSession.character?.name || "Nhân vật không xác định"}
              </h1>
              <div className="flex text-sm text-gray-400">
                <span>{gameSession.character?.characterClass || ""}</span>
                {gameSession.character?.level && (
                  <>
                    <span className="mx-1">•</span>
                    <span>Cấp {gameSession.character.level}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCharacterInfo(!showCharacterInfo)}
              className={`p-2 rounded-md transition-colors ${
                showCharacterInfo
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Thông tin nhân vật"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowInventory(!showInventory)}
              className={`p-2 rounded-md transition-colors ${
                showInventory ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Hành trang"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowQuestLog(!showQuestLog)}
              className={`p-2 rounded-md transition-colors ${
                showQuestLog ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title="Nhật ký nhiệm vụ"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={saveGame}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              title="Lưu game"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
            </button>

            <button
              onClick={endGame}
              className="p-2 bg-red-700 hover:bg-red-600 rounded-md transition-colors"
              title="Kết thúc phiên game"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Location Info */}
          {gameSession.currentStoryNode?.location && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <div className="container mx-auto">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    {gameSession.currentStoryNode.location}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scene Description */}
          {gameSession.currentStoryNode?.sceneDescription && (
            <div
              className={`bg-gradient-to-b ${getGenreGradient(
                gameSession.character?.primaryGenre
              )} p-6 border-b border-gray-700`}
            >
              <div className="container mx-auto">
                <p className="italic text-gray-300">
                  {gameSession.currentStoryNode.sceneDescription}
                </p>
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <div ref={contentRef} className="prose prose-invert max-w-none">
                {!animateText && gameSession.currentStoryNode?.content}
              </div>

              {animateText && !textComplete && (
                <button
                  onClick={() => {
                    setAnimateText(false);
                    setTextComplete(true);
                    setShowChoices(true);
                  }}
                  className="mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Bấm để hiển thị toàn bộ
                </button>
              )}
            </div>

            {/* Combat Scene */}
            {gameSession.currentStoryNode?.isCombatScene &&
              gameSession.currentStoryNode?.combatData && (
                <div className="mb-8 bg-red-900/30 border border-red-800/50 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-4 text-red-400">
                    Trận chiến!
                  </h3>

                  <div className="space-y-4">
                    {gameSession.currentStoryNode.combatData.enemies.map(
                      (enemy, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg"
                        >
                          <div>
                            <div className="font-bold">{enemy.name}</div>
                            <div className="text-sm text-gray-400">
                              Cấp {enemy.level}
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className="mr-3">
                              <div className="text-xs text-gray-400">HP</div>
                              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500"
                                  style={{
                                    width: `${(enemy.health / 100) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="text-lg font-bold">
                              {enemy.health}/100
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Choices */}
            {showChoices &&
              gameSession.currentStoryNode?.choices &&
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

        {/* Sidebars */}
        {showCharacterInfo && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Thông tin nhân vật</h3>
                <button
                  onClick={() => setShowCharacterInfo(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <span className="text-xl font-bold">
                      {gameSession.character?.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{gameSession.character?.name}</h4>
                    <div className="text-sm text-gray-400">
                      {gameSession.character?.characterClass} • Cấp{" "}
                      {gameSession.character?.level}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Kinh nghiệm</span>
                  <span>{gameSession.character?.experience || 0}</span>
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        (gameSession.character?.experience || 0) % 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3 text-blue-400">Thuộc tính</h4>
                <div className="space-y-2">
                  {gameSession.character?.attributes &&
                    Object.entries(gameSession.character.attributes).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">
                            {key === "strength"
                              ? "Sức mạnh"
                              : key === "intelligence"
                              ? "Trí tuệ"
                              : key === "dexterity"
                              ? "Nhanh nhẹn"
                              : key === "charisma"
                              ? "Quyến rũ"
                              : key === "health"
                              ? "Sinh lực"
                              : key === "mana"
                              ? "Năng lượng"
                              : key}
                          </span>
                          <span>{value}</span>
                        </div>
                      )
                    )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3 text-green-400">Kỹ năng</h4>
                {gameSession.character?.skills &&
                gameSession.character.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gameSession.character.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có kỹ năng nào</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showInventory && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Hành trang</h3>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {gameSession.character?.inventory ? (
                <>
                  {/* Currency */}
                  {gameSession.character.inventory.currency &&
                    Object.keys(gameSession.character.inventory.currency)
                      .length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold mb-3 text-yellow-400">
                          Tiền tệ
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(
                            gameSession.character.inventory.currency
                          ).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center">
                              <span className="text-yellow-300 mr-2">
                                {currency === "gold"
                                  ? "💰"
                                  : currency === "credits"
                                  ? "💳"
                                  : currency === "yuan"
                                  ? "💴"
                                  : currency === "spirit_stones"
                                  ? "💎"
                                  : "🪙"}
                              </span>
                              <span>
                                {amount}{" "}
                                {currency === "gold"
                                  ? "Vàng"
                                  : currency === "credits"
                                  ? "Credits"
                                  : currency === "yuan"
                                  ? "Yuan"
                                  : currency === "spirit_stones"
                                  ? "Linh thạch"
                                  : currency.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Items */}
                  <div>
                    <h4 className="font-bold mb-3 text-blue-400">Vật phẩm</h4>
                    {gameSession.character.inventory.items &&
                    gameSession.character.inventory.items.length > 0 ? (
                      <div className="space-y-3">
                        {gameSession.character.inventory.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-700 p-3 rounded-lg"
                          >
                            <div className="flex justify-between">
                              <h5 className="font-medium">
                                {item.name}
                                {item.quantity > 1 && (
                                  <span className="text-gray-400 text-sm ml-1">
                                    x{item.quantity}
                                  </span>
                                )}
                              </h5>
                              {item.rarity && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    item.rarity === "common"
                                      ? "bg-gray-600 text-gray-300"
                                      : item.rarity === "uncommon"
                                      ? "bg-green-800 text-green-300"
                                      : item.rarity === "rare"
                                      ? "bg-blue-800 text-blue-300"
                                      : item.rarity === "epic"
                                      ? "bg-purple-800 text-purple-300"
                                      : item.rarity === "legendary"
                                      ? "bg-orange-800 text-orange-300"
                                      : "bg-gray-600 text-gray-300"
                                  }`}
                                >
                                  {item.rarity === "common"
                                    ? "Thường"
                                    : item.rarity === "uncommon"
                                    ? "Không phổ biến"
                                    : item.rarity === "rare"
                                    ? "Hiếm"
                                    : item.rarity === "epic"
                                    ? "Sử thi"
                                    : item.rarity === "legendary"
                                    ? "Huyền thoại"
                                    : item.rarity}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-400 text-sm mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              {item.type && <span>{item.type}</span>}
                              {item.value && <span>{item.value} vàng</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Hành trang trống</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-400">Không có thông tin hành trang</p>
              )}
            </div>
          </div>
        )}

        {showQuestLog && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Nhật ký nhiệm vụ</h3>
                <button
                  onClick={() => setShowQuestLog(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {gameSession.gameState?.questLog &&
              gameSession.gameState.questLog.length > 0 ? (
                <div className="space-y-4">
                  {gameSession.gameState.questLog.map((quest, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                      <p>{quest}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-400">Chưa có nhiệm vụ nào</p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-bold mb-3 text-green-400">
                  Nhiệm vụ đã hoàn thành
                </h4>
                {gameSession.gameState?.completedQuests &&
                gameSession.gameState.completedQuests.length > 0 ? (
                  <div className="space-y-2">
                    {gameSession.gameState.completedQuests.map(
                      (quest, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-2 rounded-lg flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-green-500 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm">{quest}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Chưa có nhiệm vụ nào được hoàn thành
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
