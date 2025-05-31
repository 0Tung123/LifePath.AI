"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChineseNovel {
  id: string;
  title: string;
  theme: string;
  characterName: string;
  characterGender: string;
  status: string;
  totalWords: number;
  currentChapterIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface PublicNovel extends ChineseNovel {
  views: number;
  likes: number;
  user?: {
    username: string;
  };
}

const ChineseNovelPage: React.FC = () => {
  const [myNovels, setMyNovels] = useState<ChineseNovel[]>([]);
  const [publicNovels, setPublicNovels] = useState<PublicNovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "public">("my");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const router = useRouter();

  const themes = [
    {
      id: "tu-tien",
      name: "Tu Tiên",
      description: "Thế giới tu luyện, đột phá cảnh giới",
    },
    {
      id: "vo-hiep",
      name: "Võ Hiệp",
      description: "Thế giới võ thuật, giang hồ nghĩa khí",
    },
    {
      id: "hien-dai",
      name: "Hiện Đại",
      description: "Bối cảnh thành phố hiện đại",
    },
    {
      id: "trinh-tham",
      name: "Trinh Thám",
      description: "Điều tra, suy luận, tìm manh mối",
    },
    { id: "kinh-di", name: "Kinh Dị", description: "Không khí u ám, đáng sợ" },
    {
      id: "gia-tuong",
      name: "Giả Tưởng",
      description: "Thế giới tưởng tượng tự do",
    },
    {
      id: "fantasy",
      name: "Fantasy",
      description: "Thế giới phép thuật và chủng tộc",
    },
    {
      id: "huyen-huyen",
      name: "Huyền Huyễn",
      description: "Kết hợp nhiều yếu tố huyền bí",
    },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedTheme]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (activeTab === "my") {
        const response = await fetch("/api/chinese-novel", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMyNovels(data);
        }
      } else {
        const url = selectedTheme
          ? `/api/chinese-novel/public?theme=${selectedTheme}`
          : "/api/chinese-novel/public";
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPublicNovels(data.novels);
        }
      }
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  };

  const getThemeName = (themeId: string) => {
    return themes.find((t) => t.id === themeId)?.name || themeId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang viết";
      case "completed":
        return "Hoàn thành";
      case "paused":
        return "Tạm dừng";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏮 Tiểu Thuyết Mạng Trung Quốc 🏮
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Tạo và đọc những câu chuyện tương tác đầy màu sắc
          </p>

          <Link
            href="/game/chinese-novel/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            ✨ Tạo Tiểu Thuyết Mới
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab("my")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === "my"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              📚 Tiểu Thuyết Của Tôi
            </button>
            <button
              onClick={() => setActiveTab("public")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === "public"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              🌟 Tiểu Thuyết Công Khai
            </button>
          </div>
        </div>

        {/* Theme Filter for Public Novels */}
        {activeTab === "public" && (
          <div className="mb-6 text-center">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tất cả thể loại</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* My Novels */}
        {activeTab === "my" && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNovels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chưa có tiểu thuyết nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Hãy tạo tiểu thuyết đầu tiên của bạn!
                </p>
                <Link
                  href="/game/chinese-novel/create"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Tạo ngay
                </Link>
              </div>
            ) : (
              myNovels.map((novel) => (
                <div
                  key={novel.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {novel.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          novel.status
                        )}`}
                      >
                        {getStatusText(novel.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-medium">Thể loại:</span>
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {getThemeName(novel.theme)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Nhân vật:</span>
                        <span className="ml-2">{novel.characterName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Chương:</span>
                        <span className="ml-2">
                          {novel.currentChapterIndex + 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Từ:</span>
                        <span className="ml-2">
                          {novel.totalWords.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDate(novel.updatedAt)}
                      </span>
                      <Link
                        href={`/game/chinese-novel/${novel.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Đọc tiếp
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Public Novels */}
        {activeTab === "public" && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicNovels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Không tìm thấy tiểu thuyết
                </h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc thể loại</p>
              </div>
            ) : (
              publicNovels.map((novel) => (
                <div
                  key={novel.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                      {novel.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-medium">Thể loại:</span>
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {getThemeName(novel.theme)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Tác giả:</span>
                        <span className="ml-2">
                          {novel.user?.username || "Ẩn danh"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Nhân vật:</span>
                        <span className="ml-2">{novel.characterName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          <span className="font-medium">Chương:</span>
                          <span className="ml-2">
                            {novel.currentChapterIndex + 1}
                          </span>
                        </span>
                        <span>
                          <span className="font-medium">Từ:</span>
                          <span className="ml-2">
                            {novel.totalWords.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>👁️ {novel.views}</span>
                        <span>❤️ {novel.likes}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(novel.updatedAt)}
                      </span>
                    </div>

                    <Link
                      href={`/game/chinese-novel/${novel.id}`}
                      className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChineseNovelPage;
