"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthContext } from "@/providers/auth-provider";

enum StoryType {
  CHINESE = "chinese",
  KOREAN = "korean",
}

interface StoryTypeOption {
  id: StoryType;
  name: string;
}

interface Story {
  id: string;
  type: StoryType;
  content: string;
  metadata: {
    currentChoices: string[];
    lastChoice?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const StoryPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [storyTypes, setStoryTypes] = useState<StoryTypeOption[]>([]);
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [userChoice, setUserChoice] = useState("");
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Lấy danh sách loại truyện
  useEffect(() => {
    const fetchStoryTypes = async () => {
      try {
        const response = await axios.get("/api/story/types");
        setStoryTypes(response.data.types);
      } catch (error) {
        console.error("Error fetching story types:", error);
      }
    };

    fetchStoryTypes();
  }, []);

  // Lấy danh sách truyện của người dùng
  useEffect(() => {
    if (user) {
      const fetchMyStories = async () => {
        try {
          const response = await axios.get("/api/story/my-stories");
          setMyStories(response.data);
        } catch (error) {
          console.error("Error fetching my stories:", error);
        }
      };

      fetchMyStories();
    }
  }, [user]);

  // Tạo truyện mới
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !userChoice) return;

    setIsLoading(true);
    try {
      const response = await axios.post("/api/story/create", {
        type: selectedType,
        userChoice,
      });

      // Cập nhật danh sách truyện và hiển thị truyện mới
      setMyStories([response.data, ...myStories]);
      setCurrentStory(response.data);
      setUserChoice("");
    } catch (error) {
      console.error("Error creating story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tiếp tục truyện
  const handleContinueStory = async () => {
    if (!currentStory || !selectedChoice) return;

    setIsLoading(true);
    try {
      const response = await axios.post("/api/story/continue", {
        storyId: currentStory.id,
        userChoice: selectedChoice,
      });

      // Cập nhật truyện hiện tại và danh sách truyện
      setCurrentStory(response.data);
      setMyStories(
        myStories.map((story) =>
          story.id === response.data.id ? response.data : story
        )
      );
      setSelectedChoice("");
    } catch (error) {
      console.error("Error continuing story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chọn truyện để đọc/tiếp tục
  const handleSelectStory = async (storyId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/story/${storyId}`);
      setCurrentStory(response.data);
    } catch (error) {
      console.error("Error loading story:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format nội dung truyện để hiển thị
  const formatStoryContent = (content: string) => {
    if (!content) return null;

    // Tách các phần của nội dung truyện
    const sections = content.split(/\[(.*?)\]:/g).filter(Boolean);

    return sections.map((section, index) => {
      if (index % 2 === 0) return null;

      const sectionName = section;
      const sectionContent = sections[index + 1]?.trim();

      if (!sectionContent) return null;

      return (
        <div key={index} className="mb-4">
          <h3 className="font-bold text-indigo-600">[{sectionName}]</h3>
          <div className="whitespace-pre-wrap ml-4">{sectionContent}</div>
        </div>
      );
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trình Tạo Truyện AI</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phần tạo truyện mới */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tạo Truyện Mới</h2>

          <form onSubmit={handleCreateStory}>
            <div className="mb-4">
              <label className="block mb-2">Chọn loại truyện:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value as StoryType)}
                required
              >
                <option value="">-- Chọn loại truyện --</option>
                {storyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Khởi đầu câu chuyện:</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                value={userChoice}
                onChange={(e) => setUserChoice(e.target.value)}
                placeholder="Nhập một ý tưởng, nhân vật, hoặc tình huống..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo..." : "Tạo Truyện"}
            </button>
          </form>
        </div>

        {/* Danh sách truyện đã tạo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Truyện Của Tôi</h2>

          {myStories.length === 0 ? (
            <p className="text-gray-500">Bạn chưa tạo truyện nào.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myStories.map((story) => (
                <div
                  key={story.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    currentStory?.id === story.id
                      ? "border-indigo-500 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => handleSelectStory(story.id)}
                >
                  <div className="font-medium">
                    {story.type === StoryType.CHINESE
                      ? "Truyện Trung Quốc"
                      : "Truyện Hàn Quốc"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Cập nhật: {new Date(story.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nội dung truyện và lựa chọn */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Nội Dung Truyện</h2>

          {currentStory ? (
            <>
              <div className="mb-6 bg-gray-50 p-4 rounded max-h-screen overflow-y-auto">
                {formatStoryContent(currentStory.content)}
              </div>

              {currentStory.metadata?.currentChoices?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Lựa chọn tiếp theo:</h3>
                  <div className="space-y-2 mb-4">
                    {currentStory.metadata.currentChoices.map(
                      (choice, index) => (
                        <div key={index} className="flex items-start">
                          <input
                            type="radio"
                            id={`choice-${index}`}
                            name="story-choice"
                            className="mt-1 mr-2"
                            checked={selectedChoice === choice}
                            onChange={() => setSelectedChoice(choice)}
                          />
                          <label
                            htmlFor={`choice-${index}`}
                            className="cursor-pointer"
                          >
                            {choice}
                          </label>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    onClick={handleContinueStory}
                    className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    disabled={!selectedChoice || isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Tiếp tục câu chuyện"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">
              Chọn một truyện để đọc hoặc tạo truyện mới.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
