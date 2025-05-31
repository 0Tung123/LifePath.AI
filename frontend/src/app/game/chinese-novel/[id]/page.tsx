"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface GameStats {
  [key: string]: string | number;
}

interface InventoryItem {
  name: string;
  description: string;
  thuocTinh: string;
}

interface Skill {
  name: string;
  description: string;
  thanhThuc: string;
  hieuQua: string;
  tienHoa?: string;
}

interface LoreEntry {
  type: "NPC" | "ITEM" | "LOCATION";
  name: string;
  description: string;
}

interface StoryChoice {
  id: number;
  text: string;
}

interface StoryChapter {
  id: string;
  title: string;
  content: string;
  stats?: GameStats;
  inventory?: InventoryItem[];
  skills?: Skill[];
  lore?: LoreEntry[];
  choices: StoryChoice[];
  selectedChoice?: number;
  createdAt: string;
}

interface ChineseNovel {
  id: string;
  title: string;
  theme: string;
  setting: string;
  characterName: string;
  characterGender: string;
  characterDescription: string;
  chapters: StoryChapter[];
  currentStats: GameStats;
  currentInventory: InventoryItem[];
  currentSkills: Skill[];
  loreEntries: LoreEntry[];
  currentChapterIndex: number;
  status: string;
  totalWords: number;
  isPublic: boolean;
  likes: number;
  views: number;
  tags: string[];
  user?: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ChineseNovelDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [novel, setNovel] = useState<ChineseNovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [continuing, setContinuing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "story" | "stats" | "inventory" | "skills" | "lore"
  >("story");

  useEffect(() => {
    fetchNovel();
  }, [params.id]);

  const fetchNovel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/chinese-novel/${params.id}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setNovel(data);
      } else {
        setError("Không thể tải tiểu thuyết");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tải tiểu thuyết");
      console.error("Error fetching novel:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueStory = async () => {
    if (!novel || selectedChoice === null) return;

    setContinuing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/chinese-novel/${novel.id}/continue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          novelId: novel.id,
          choiceIndex: selectedChoice,
        }),
      });

      if (response.ok) {
        const updatedNovel = await response.json();
        setNovel(updatedNovel);
        setSelectedChoice(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra khi tiếp tục câu chuyện");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tiếp tục câu chuyện");
      console.error("Error continuing story:", error);
    } finally {
      setContinuing(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const getThemeName = (themeId: string) => {
    const themes: { [key: string]: string } = {
      "tu-tien": "Tu Tiên",
      "vo-hiep": "Võ Hiệp",
      "hien-dai": "Hiện Đại",
      "trinh-tham": "Trinh Thám",
      "kinh-di": "Kinh Dị",
      "gia-tuong": "Giả Tưởng",
      fantasy: "Fantasy",
      "huyen-huyen": "Huyền Huyễn",
    };
    return themes[themeId] || themeId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Đang tải tiểu thuyết...</p>
        </div>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/game/chinese-novel"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const currentChapter = novel.chapters[novel.currentChapterIndex];
  const isOwner = true; // You might want to check this based on user authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/game/chinese-novel"
                className="text-purple-600 hover:text-purple-700 text-sm mb-2 inline-block"
              >
                ← Quay lại danh sách
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                {novel.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {getThemeName(novel.theme)}
                </span>
                <span>
                  Chương {novel.currentChapterIndex + 1}/{novel.chapters.length}
                </span>
                <span>{novel.totalWords.toLocaleString()} từ</span>
                {novel.isPublic && (
                  <>
                    <span>👁️ {novel.views}</span>
                    <span>❤️ {novel.likes}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b">
                {[
                  { id: "story", label: "📖 Câu chuyện", icon: "📖" },
                  { id: "stats", label: "📊 Chỉ số", icon: "📊" },
                  { id: "inventory", label: "🎒 Vật phẩm", icon: "🎒" },
                  { id: "skills", label: "⚔️ Kỹ năng", icon: "⚔️" },
                  { id: "lore", label: "📚 Lore", icon: "📚" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Story Tab */}
                {activeTab === "story" && currentChapter && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {currentChapter.title}
                    </h2>
                    <div className="prose max-w-none text-gray-700 mb-6">
                      {formatContent(currentChapter.content)}
                    </div>

                    {/* Choices */}
                    {currentChapter.choices &&
                      currentChapter.choices.length > 0 &&
                      !currentChapter.selectedChoice &&
                      isOwner && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            🤔 Bạn sẽ chọn gì?
                          </h3>
                          <div className="space-y-3">
                            {currentChapter.choices.map((choice) => (
                              <button
                                key={choice.id}
                                onClick={() => setSelectedChoice(choice.id)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                  selectedChoice === choice.id
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-25"
                                }`}
                              >
                                <span className="font-medium text-purple-600">
                                  {choice.id}.
                                </span>{" "}
                                {choice.text}
                              </button>
                            ))}
                          </div>

                          {selectedChoice && (
                            <div className="mt-4 text-center">
                              <button
                                onClick={handleContinueStory}
                                disabled={continuing}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {continuing ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang tiếp tục...
                                  </div>
                                ) : (
                                  "✨ Tiếp tục câu chuyện"
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Selected Choice Display */}
                    {currentChapter.selectedChoice && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          ✅ Lựa chọn đã chọn:
                        </h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <span className="font-medium text-green-600">
                            {currentChapter.selectedChoice}.
                          </span>{" "}
                          {
                            currentChapter.choices.find(
                              (c) => c.id === currentChapter.selectedChoice
                            )?.text
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Tab */}
                {activeTab === "stats" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      📊 Chỉ số nhân vật
                    </h3>
                    {novel.currentStats &&
                    Object.keys(novel.currentStats).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(novel.currentStats).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="text-sm text-gray-600">{key}</div>
                              <div className="text-lg font-semibold text-gray-800">
                                {typeof value === "string"
                                  ? value
                                  : value.toLocaleString()}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có chỉ số nào</p>
                    )}
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === "inventory" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      🎒 Vật phẩm
                    </h3>
                    {novel.currentInventory &&
                    novel.currentInventory.length > 0 ? (
                      <div className="space-y-3">
                        {novel.currentInventory.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <h4 className="font-semibold text-gray-800">
                              {item.name}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {item.description}
                            </p>
                            <p className="text-purple-600 text-sm">
                              {item.thuocTinh}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có vật phẩm nào</p>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === "skills" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      ⚔️ Kỹ năng
                    </h3>
                    {novel.currentSkills && novel.currentSkills.length > 0 ? (
                      <div className="space-y-4">
                        {novel.currentSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">
                                {skill.name}
                              </h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {skill.thanhThuc}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {skill.description}
                            </p>
                            <p className="text-green-600 text-sm mb-1">
                              <strong>Hiệu quả:</strong> {skill.hieuQua}
                            </p>
                            {skill.tienHoa && (
                              <p className="text-purple-600 text-sm">
                                <strong>Tiến hóa:</strong> {skill.tienHoa}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có kỹ năng nào</p>
                    )}
                  </div>
                )}

                {/* Lore Tab */}
                {activeTab === "lore" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      📚 Lore
                    </h3>
                    {novel.loreEntries && novel.loreEntries.length > 0 ? (
                      <div className="space-y-3">
                        {novel.loreEntries.map((lore, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex items-center mb-2">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs mr-2">
                                {lore.type}
                              </span>
                              <h4 className="font-semibold text-gray-800">
                                {lore.name}
                              </h4>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {lore.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Chưa có thông tin lore nào
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Novel Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📋 Thông tin
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Nhân vật:</span>
                  <div className="font-medium">{novel.characterName}</div>
                </div>
                <div>
                  <span className="text-gray-600">Giới tính:</span>
                  <div className="font-medium">
                    {novel.characterGender === "nam" ? "Nam" : "Nữ"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Bối cảnh:</span>
                  <div className="font-medium text-gray-700">
                    {novel.setting}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Mô tả nhân vật:</span>
                  <div className="font-medium text-gray-700">
                    {novel.characterDescription}
                  </div>
                </div>
                {novel.tags && novel.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {novel.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Navigation */}
            {novel.chapters.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📑 Các chương
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {novel.chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        // You might want to implement chapter navigation here
                      }}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        index === novel.currentChapterIndex
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseNovelDetailPage;
