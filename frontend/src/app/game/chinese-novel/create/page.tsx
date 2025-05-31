"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CreateNovelForm {
  title: string;
  theme: string;
  setting: string;
  characterName: string;
  characterGender: string;
  characterDescription: string;
  isPublic: boolean;
  tags: string[];
}

const CreateChineseNovelPage: React.FC = () => {
  const [form, setForm] = useState<CreateNovelForm>({
    title: "",
    theme: "tu-tien",
    setting: "",
    characterName: "",
    characterGender: "nam",
    characterDescription: "",
    isPublic: false,
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();

  const themes = [
    {
      id: "tu-tien",
      name: "Tu Tiên",
      description:
        "Thế giới tu luyện, đột phá cảnh giới, thu thập linh thạch và linh dược",
    },
    {
      id: "vo-hiep",
      name: "Võ Hiệp",
      description: "Thế giới võ thuật, giang hồ nghĩa khí, ân oán tình thù",
    },
    {
      id: "hien-dai",
      name: "Hiện Đại",
      description:
        "Bối cảnh thành phố hiện đại với công nghệ, xã hội đương đại",
    },
    {
      id: "trinh-tham",
      name: "Trinh Thám",
      description: "Tập trung vào việc điều tra, suy luận, tìm kiếm manh mối",
    },
    {
      id: "kinh-di",
      name: "Kinh Dị",
      description:
        "Tạo không khí u ám, bí ẩn, đáng sợ với các yếu tố siêu nhiên",
    },
    {
      id: "gia-tuong",
      name: "Giả Tưởng",
      description: "Thế giới tưởng tượng với các luật lệ riêng, tự do sáng tạo",
    },
    {
      id: "fantasy",
      name: "Fantasy",
      description:
        "Thế giới phép thuật với các chủng tộc khác nhau, hệ thống level rõ ràng",
    },
    {
      id: "huyen-huyen",
      name: "Huyền Huyễn",
      description:
        "Kết hợp nhiều yếu tố huyền bí, phép thuật và thế giới song song",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chinese-novel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const novel = await response.json();
        router.push(`/game/chinese-novel/${novel.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra khi tạo tiểu thuyết");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi tạo tiểu thuyết");
      console.error("Error creating novel:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTheme = themes.find((t) => t.id === form.theme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ✨ Tạo Tiểu Thuyết Mới ✨
          </h1>
          <p className="text-lg text-gray-600">
            Hãy tạo ra một câu chuyện tương tác đầy màu sắc
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                📚 Tiêu đề tiểu thuyết *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nhập tiêu đề hấp dẫn cho tiểu thuyết của bạn..."
              />
            </div>

            {/* Theme */}
            <div>
              <label
                htmlFor="theme"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                🎭 Thể loại *
              </label>
              <select
                id="theme"
                name="theme"
                value={form.theme}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
              {selectedTheme && (
                <p className="mt-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                  💡 {selectedTheme.description}
                </p>
              )}
            </div>

            {/* Setting */}
            <div>
              <label
                htmlFor="setting"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                🌍 Bối cảnh câu chuyện *
              </label>
              <textarea
                id="setting"
                name="setting"
                value={form.setting}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mô tả bối cảnh, thế giới, thời đại mà câu chuyện diễn ra..."
              />
            </div>

            {/* Character Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="characterName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  👤 Tên nhân vật chính *
                </label>
                <input
                  type="text"
                  id="characterName"
                  name="characterName"
                  value={form.characterName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tên nhân vật chính..."
                />
              </div>

              <div>
                <label
                  htmlFor="characterGender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ⚧ Giới tính *
                </label>
                <select
                  id="characterGender"
                  name="characterGender"
                  value={form.characterGender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                </select>
              </div>
            </div>

            {/* Character Description */}
            <div>
              <label
                htmlFor="characterDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                📝 Mô tả nhân vật chính *
              </label>
              <textarea
                id="characterDescription"
                name="characterDescription"
                value={form.characterDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mô tả sơ lược về nhân vật chính: xuất thân, tính cách, mục tiêu..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Tags (tùy chọn)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tag và nhấn Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Thêm
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Public Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublic"
                className="ml-2 block text-sm text-gray-700"
              >
                🌟 Công khai tiểu thuyết (cho phép người khác đọc)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/game/chinese-novel"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </div>
                ) : (
                  "✨ Tạo Tiểu Thuyết"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChineseNovelPage;
