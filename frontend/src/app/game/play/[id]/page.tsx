"use client";

import React, { useState, useEffect, useRef, use } from "react";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useGameStats } from "@/hooks/useFirebase";
import { FirebaseAuthButtons } from "@/components/firebase/FirebaseAuthButtons";
import { GameBackup } from "@/components/firebase/GameBackup";
import { StoryTimeline } from "@/components/game/StoryTimeline";
import { AdvancedTimeline } from "@/components/game/AdvancedTimeline";
import { BranchTreeVisualization } from "@/components/game/BranchTreeVisualization";

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

  // Firebase hooks
  const { firebaseUser } = useFirebaseAuth();
  const { incrementChoicesMade, updatePlayTime } = useGameStats();

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryNode[]>([]);
  const [storyTree, setStoryTree] = useState<any>(null);
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [timelineKey, setTimelineKey] = useState(0); // Force timeline reload
  const [showFullStoryView, setShowFullStoryView] = useState<boolean>(true); // Hiển thị toàn bộ diễn biến câu chuyện

  const contentRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

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
        await loadStoryTree();
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

  // Hiệu ứng hiển thị văn bản từng chữ một cho story node mới nhất
  useEffect(() => {
    if (
      !gameSession ||
      !animateText ||
      textComplete ||
      storyHistory.length === 0
    )
      return;

    const latestStoryNode = storyHistory[storyHistory.length - 1];
    const content = latestStoryNode?.content || "";
    const contentElement = contentRef.current;

    if (!contentElement) return;

    // Chỉ animate nội dung của story node mới nhất
    const latestContentElement = contentElement.querySelector(
      ".latest-story-content"
    );
    if (!latestContentElement) return;

    // Trước tiên, phân tích nội dung để xác định các phần màu khác nhau
    // Các regex để nhận diện các phần khác nhau của câu chuyện
    const characterSpeechRegex =
      /([A-Za-z\u00C0-\u1EF9\s]+)\s*\(\s*màu\s+([a-zA-Z]+)\s*\)\s*:(.*?)(?=\n[A-Za-z\u00C0-\u1EF9\s]+\s*\(|\n\n|$)/g;
    const skillRegex = /\[([\w\s\u00C0-\u1EF9]+)\]/g;
    const itemRegex = /<([\w\s\u00C0-\u1EF9]+)>/g;

    // Màu sắc tương ứng với từng loại
    const colorMap: Record<string, string> = {
      xanh: "color: #60A5FA;", // text-blue-400
      đỏ: "color: #F87171;", // text-red-400
      lục: "color: #4ADE80;", // text-green-400
      tím: "color: #C084FC;", // text-purple-400
      vàng: "color: #FBBF24;", // text-yellow-400
      cam: "color: #FB923C;", // text-orange-400
      hồng: "color: #F472B6;", // text-pink-400
      lam: "color: #818CF8;", // text-indigo-400
      ngọc: "color: #2DD4BF;", // text-teal-400
      xám: "color: #9CA3AF;", // text-gray-400
      default: "color: #60A5FA;", // Màu mặc định
    };

    // Chia nội dung thành các đoạn để hiển thị từng phần với màu sắc tương ứng
    const segments: { text: string; style?: string }[] = [];
    let lastIndex = 0;

    // Xử lý lời thoại nhân vật
    content.replace(
      characterSpeechRegex,
      (match, name, color, speech, index) => {
        // Thêm văn bản thường trước đoạn thoại
        if (index > lastIndex) {
          segments.push({
            text: content.substring(lastIndex, index),
          });
        }

        // Thêm tên nhân vật với màu
        const colorStyle = colorMap[color.toLowerCase()] || colorMap.default;
        segments.push({
          text: `${name}: `,
          style: `font-weight: bold; ${colorStyle}`,
        });

        // Thêm lời thoại
        segments.push({
          text: speech,
        });

        lastIndex = index + match.length;
        return match;
      }
    );

    // Thêm phần văn bản còn lại sau đoạn thoại cuối
    if (lastIndex < content.length) {
      segments.push({
        text: content.substring(lastIndex),
      });
    }

    // Nếu không có đoạn thoại nào, hiển thị toàn bộ nội dung như văn bản thường
    if (segments.length === 0) {
      segments.push({
        text: content,
      });
    }

    // Xử lý kỹ năng và vật phẩm trong mỗi đoạn
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      // Xử lý kỹ năng
      let processedText = segment.text.replace(skillRegex, (match, skill) => {
        return `<span style="color: #C084FC; font-weight: bold;">[${skill}]</span>`;
      });

      // Xử lý vật phẩm
      processedText = processedText.replace(itemRegex, (match, item) => {
        return `<span style="color: #FBBF24; font-style: italic;">&lt;${item}&gt;</span>`;
      });

      // Cập nhật đoạn
      segment.text = processedText;
    }

    // Bắt đầu hiển thị từng ký tự
    latestContentElement.innerHTML = "";
    let segmentIndex = 0;
    let charIndex = 0;
    let currentHTML = "";

    const interval = setInterval(() => {
      if (segmentIndex < segments.length) {
        const segment = segments[segmentIndex];

        // Nếu đoạn hiện tại chứa HTML tags (kỹ năng/vật phẩm đã xử lý)
        if (segment.text.includes("<span")) {
          // Hiển thị toàn bộ đoạn cùng lúc khi gặp HTML
          if (segment.style) {
            currentHTML += `<span style="${segment.style}">${segment.text}</span>`;
          } else {
            currentHTML += segment.text;
          }
          segmentIndex++;
          charIndex = 0;
        } else {
          // Hiển thị từng ký tự cho văn bản thường
          if (charIndex < segment.text.length) {
            const char = segment.text.charAt(charIndex);
            if (segment.style) {
              // Ký tự đầu tiên của đoạn có style
              if (charIndex === 0) {
                currentHTML += `<span style="${segment.style}">`;
              }
              currentHTML += char;
              // Ký tự cuối cùng của đoạn có style
              if (charIndex === segment.text.length - 1) {
                currentHTML += "</span>";
              }
            } else {
              currentHTML += char;
            }
            charIndex++;
          } else {
            segmentIndex++;
            charIndex = 0;
          }
        }

        latestContentElement.innerHTML = currentHTML;

        // Tự động cuộn xuống khi văn bản dài
        contentElement.scrollTop = contentElement.scrollHeight;
      } else {
        clearInterval(interval);
        setTextComplete(true);
        setShowChoices(true);
      }
    }, 30); // Tốc độ hiển thị chữ

    return () => clearInterval(interval);
  }, [gameSession, animateText, textComplete, storyHistory]);

  // Cuộn xuống khi hiển thị lựa chọn
  useEffect(() => {
    if (showChoices && choicesRef.current) {
      const element = choicesRef.current;
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [showChoices]);

  // Load story tree
  const loadStoryTree = async () => {
    try {
      const response = await axios.get(`/api/game/sessions/${id}/tree`);
      setStoryTree(response.data);
    } catch (error) {
      console.error("Failed to load story tree:", error);
    }
  };

  // Go back to previous node
  const goBackToNode = async (nodeId: string) => {
    try {
      setLoading(true);
      const [sessionResponse, historyResponse] = await Promise.all([
        axios.post(`/api/game/sessions/${id}/go-back/${nodeId}`),
        axios.get(`/api/game/sessions/${id}/history`),
      ]);

      setGameSession(sessionResponse.data);
      setStoryHistory(historyResponse.data);
      await loadStoryTree();

      // Force timeline reload
      setTimelineKey((prev) => prev + 1);

      // Reset UI states
      setMakingChoice(false);
      setSelectedChoiceId(null);
      setAnimateText(true);
      setTextComplete(false);
      setShowChoices(false);
    } catch (error) {
      console.error("Failed to go back to node:", error);
      setError("Không thể quay lại node này");
    } finally {
      setLoading(false);
    }
  };

  // Restore branch
  const restoreBranch = async (branchId: string) => {
    try {
      setLoading(true);
      const [sessionResponse, historyResponse] = await Promise.all([
        axios.post(`/api/game/sessions/${id}/restore-branch/${branchId}`),
        axios.get(`/api/game/sessions/${id}/history`),
      ]);

      setGameSession(sessionResponse.data);
      setStoryHistory(historyResponse.data);
      await loadStoryTree();

      // Force timeline reload
      setTimelineKey((prev) => prev + 1);

      // Reset UI states
      setMakingChoice(false);
      setSelectedChoiceId(null);
      setAnimateText(true);
      setTextComplete(false);
      setShowChoices(false);
    } catch (error) {
      console.error("Failed to restore branch:", error);
      setError("Không thể khôi phục nhánh này");
    } finally {
      setLoading(false);
    }
  };

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
      await loadStoryTree();

      // Force timeline reload
      setTimelineKey((prev) => prev + 1);

      // Reset các trạng thái cho story node mới
      setTextComplete(false);
      setShowChoices(false);
      setMakingChoice(false);
      setSelectedChoiceId(null);
      setAnimateText(true);

      // Cuộn xuống story node mới với hiệu ứng mượt
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

  // Xử lý nội dung câu chuyện và thêm màu sắc
  const processStoryContent = (content: string) => {
    if (!content) return null;

    // Các regex để nhận diện các phần khác nhau của câu chuyện
    const characterNameRegex =
      /([A-Za-z\u00C0-\u1EF9\s]+)\s*\(\s*màu\s+([a-zA-Z]+)\s*\)\s*:/g;
    const skillRegex = /\[([\w\s\u00C0-\u1EF9]+)\]/g;
    const itemRegex = /<([\w\s\u00C0-\u1EF9]+)>/g;

    // Màu sắc tương ứng với từng loại
    const colorMap: Record<string, string> = {
      xanh: "text-blue-400",
      đỏ: "text-red-400",
      lục: "text-green-400",
      tím: "text-purple-400",
      vàng: "text-yellow-400",
      cam: "text-orange-400",
      hồng: "text-pink-400",
      lam: "text-indigo-400",
      ngọc: "text-teal-400",
      xám: "text-gray-400",
      trắng: "text-white",
      default: "text-blue-400", // Màu mặc định nếu không xác định
    };

    // Tạo các phần HTML
    const processedContent = content
      // Xử lý tên nhân vật và lời nói
      .replace(characterNameRegex, (match, name, color) => {
        const colorClass = colorMap[color.toLowerCase()] || colorMap.default;
        return `<span class="${colorClass} font-semibold">${name}:</span>`;
      })
      // Xử lý kỹ năng
      .replace(skillRegex, (match, skill) => {
        return `<span class="text-purple-400 font-bold">[${skill}]</span>`;
      })
      // Xử lý vật phẩm
      .replace(itemRegex, (match, item) => {
        return `<span class="text-yellow-400 italic">&lt;${item}&gt;</span>`;
      });

    // Chia đoạn văn thành các phần để xử lý
    const parts = processedContent.split(/(<span.*?<\/span>)/g);

    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith("<span")) {
            // Đây là phần đã được xử lý (tên nhân vật, kỹ năng, vật phẩm)
            return (
              <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />
            );
          } else {
            // Đây là phần diễn biến câu chuyện bình thường
            return <span key={idx}>{part}</span>;
          }
        })}
      </>
    );
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

          {/* Story Content - Hiển thị diễn biến câu chuyện tuyến tính */}
          <div className="container mx-auto p-6">
            <div className="mb-8">
              {/* Header cho lịch sử câu chuyện */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Diễn biến câu chuyện
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    {storyHistory.length} đoạn truyện
                  </div>
                  <button
                    onClick={() => {
                      if (contentRef.current) {
                        contentRef.current.scrollTo({
                          top: contentRef.current.scrollHeight,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center space-x-1"
                    title="Cuộn xuống mới nhất"
                  >
                    <span>↓</span>
                    <span>Mới nhất</span>
                  </button>
                </div>
              </div>

              {/* Container có thanh trượt cho lịch sử câu chuyện - Hiển thị tuyến tính */}
              <div
                ref={contentRef}
                className="max-h-[60vh] overflow-y-auto bg-gray-800/30 rounded-lg p-4 space-y-6 border border-gray-700 scrollbar-thin"
                style={{ scrollBehavior: "smooth" }}
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
                    const isCurrentNode =
                      storyNode.id === gameSession.currentStoryNode?.id;
                    const nodeId = storyNode.id || `node-${index}`;

                    return (
                      <div
                        key={nodeId}
                        className={`story-segment relative ${
                          isLatest
                            ? "latest-story bg-gray-700/20"
                            : "past-story bg-gray-800/20"
                        } ${
                          isCurrentNode
                            ? "border-l-4 border-blue-500 pl-4"
                            : "border-l-4 border-gray-600 pl-4"
                        } rounded-lg p-4 ${
                          isLatest ? "ring-2 ring-blue-500/30" : ""
                        }`}
                      >
                        {/* Header với số thứ tự và nút quay lại */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded flex items-center">
                            <span className="mr-2">Diễn biến #{index + 1}</span>
                            {storyNode.location && (
                              <span className="flex items-center text-xs text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {storyNode.location}
                              </span>
                            )}
                          </div>

                          {/* Nút quay lại (hiển thị cho tất cả các node ngoại trừ node đầu tiên) */}
                          {!isLatest && index > 0 && (
                            <button
                              onClick={() => goBackToNode(nodeId)}
                              className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded transition-colors flex items-center"
                              title="Quay lại điểm này và chọn lại"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
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
                          )}
                        </div>

                        {/* Nội dung câu chuyện */}
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
                          {isLatest && animateText && !textComplete ? (
                            <div className="latest-story-content"></div>
                          ) : (
                            <div className="story-content">
                              {processStoryContent(storyNode.content)}
                            </div>
                          )}
                        </div>

                        {/* Combat scene cho story node này */}
                        {storyNode.isCombatScene && storyNode.combatData && (
                          <div className="mt-4 bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                            <h4 className="text-lg font-bold mb-2 text-red-400">
                              Trận chiến!
                            </h4>
                            <div className="space-y-2">
                              {storyNode.combatData.enemies.map(
                                (enemy, enemyIndex) => (
                                  <div
                                    key={enemyIndex}
                                    className="flex justify-between items-center bg-gray-800/30 p-2 rounded"
                                  >
                                    <div>
                                      <div className="font-bold text-sm">
                                        {enemy.name}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        Cấp {enemy.level}
                                      </div>
                                    </div>
                                    <div className="text-sm font-bold">
                                      {enemy.health}/100 HP
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Hiển thị lựa chọn đã được chọn nếu không phải là node cuối cùng */}
                        {!isLatest && storyNode.selectedChoiceText && (
                          <div className="mt-4 p-2 bg-green-900/20 border border-green-800/30 rounded-lg">
                            <div className="text-sm text-green-400 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Lựa chọn đã chọn:{" "}
                              <span className="font-semibold ml-1">
                                {storyNode.selectedChoiceText}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Nút hiển thị toàn bộ cho story node mới nhất */}
              {animateText && !textComplete && storyHistory.length > 0 && (
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

        {/* Firebase Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-white">🔥 Firebase</h3>

            {/* Advanced Timeline */}
            <div className="mb-6">
              <AdvancedTimeline
                key={timelineKey}
                sessionId={id}
                onNodeSelect={goBackToNode}
                onBranchRestore={restoreBranch}
                currentNodeId={gameSession?.currentStoryNode?.id}
              />
            </div>

            {/* Branch Tree Visualization */}
            <div className="mb-6">
              <BranchTreeVisualization
                key={timelineKey}
                sessionId={id}
                onNodeClick={goBackToNode}
                currentNodeId={gameSession?.currentStoryNode?.id}
              />
            </div>

            {/* Firebase Auth */}
            <div className="mb-6">
              <FirebaseAuthButtons
                onSuccess={() => console.log("Firebase auth success")}
                onError={(error) =>
                  console.error("Firebase auth error:", error)
                }
              />
            </div>

            {/* Game Backup */}
            {firebaseUser && (
              <div className="mb-6">
                <GameBackup
                  gameSession={gameSession}
                  character={gameSession?.character}
                  onBackupSuccess={() => console.log("Backup success")}
                  onBackupError={(error) =>
                    console.error("Backup error:", error)
                  }
                />
              </div>
            )}

            {/* Story Tree Navigation */}
            {storyTree && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3 text-white">
                  🌳 Cây câu chuyện
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {storyTree.currentPath &&
                    storyTree.currentPath.map(
                      (nodeId: string, index: number) => (
                        <button
                          key={nodeId}
                          onClick={() => goBackToNode(nodeId)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            nodeId === storyTree.currentNodeId
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          {index + 1}. Node {nodeId.substring(0, 8)}...
                          {nodeId === storyTree.currentNodeId && " (Hiện tại)"}
                        </button>
                      )
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
