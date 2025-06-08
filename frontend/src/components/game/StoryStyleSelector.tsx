"use client";

import { useState } from "react";
import { StoryPromptType } from "@/lib/story-prompts";
import { StoryGenerationService } from "@/services/story-generation.service";

interface StoryStyleSelectorProps {
  currentContent: string;
  characterInfo: any;
  previousChoices?: string[];
  onContentGenerated: (content: string, choices: string[]) => void;
  onError?: (error: string) => void;
}

/**
 * Component cho phép người dùng chọn phong cách viết truyện và tạo nội dung
 */
export const StoryStyleSelector: React.FC<StoryStyleSelectorProps> = ({
  currentContent,
  characterInfo,
  previousChoices,
  onContentGenerated,
  onError,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<StoryPromptType>(
    StoryPromptType.CHINESE
  );
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Xử lý việc tạo nội dung dựa trên phong cách đã chọn
   */
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      let response;

      if (selectedStyle === StoryPromptType.CHINESE) {
        response = await StoryGenerationService.generateChineseStyleStory(
          currentContent,
          characterInfo,
          previousChoices
        );
      } else {
        response = await StoryGenerationService.generateKoreanStyleStory(
          currentContent,
          characterInfo,
          previousChoices
        );
      }

      if (response.error) {
        if (onError) onError(response.error);
      } else if (response.content) {
        onContentGenerated(
          response.content,
          response.choices || ["Tiếp tục hành trình"]
        );
      }
    } catch (error) {
      console.error("Error generating content:", error);
      if (onError)
        onError("Đã xảy ra lỗi khi tạo nội dung. Vui lòng thử lại sau.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-center text-white">
        Chọn Prompt Phong Cách Truyện
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Phong cách Trung Hoa */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
            selectedStyle === StoryPromptType.CHINESE
              ? "border-red-500 bg-red-900/20"
              : "border-gray-600 hover:border-red-500/50"
          }`}
          onClick={() => setSelectedStyle(StoryPromptType.CHINESE)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-red-500 text-2xl mr-2">❂</span>
              <h4 className="text-lg font-medium text-red-400">
                Thiên Cổ Văn Thần
              </h4>
            </div>
            <input
              type="radio"
              id="chinese-style"
              name="story-style"
              className="w-5 h-5 text-red-600 accent-red-600"
              checked={selectedStyle === StoryPromptType.CHINESE}
              onChange={() => setSelectedStyle(StoryPromptType.CHINESE)}
            />
          </div>

          <div className="border-t border-gray-700 pt-3">
            <p className="text-gray-300 mb-3">
              <span className="text-red-400 font-medium">
                Phong cách Trung Hoa
              </span>{" "}
              - Kể truyện với hồn cốt tiểu thuyết võng du xứ Trung, nơi có:
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300 list-disc pl-5">
              <li>Tu tiên, ngộ đạo, đột phá cảnh giới</li>
              <li>Giang hồ, môn phái, ân oán tình thù</li>
              <li>Thần thông, pháp bảo, công pháp</li>
              <li>Cơ duyên, tạo hóa, tiên tích</li>
            </ul>

            <div className="mt-4 bg-red-900/10 border border-red-800/30 p-2 rounded-md">
              <p className="text-xs text-gray-300 italic">
                "Thiên Cổ Văn Thần sẽ dệt nên vận mệnh của ngươi với văn phong
                đậm chất tiên hiệp, võ hiệp. Nội lực thâm hậu, kiếm khí ngút
                trời..."
              </p>
            </div>
          </div>
        </div>

        {/* Phong cách Hàn Quốc */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
            selectedStyle === StoryPromptType.KOREAN
              ? "border-blue-500 bg-blue-900/20"
              : "border-gray-600 hover:border-blue-500/50"
          }`}
          onClick={() => setSelectedStyle(StoryPromptType.KOREAN)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-blue-500 text-2xl mr-2">☯</span>
              <h4 className="text-lg font-medium text-blue-400">이야기의 신</h4>
            </div>
            <input
              type="radio"
              id="korean-style"
              name="story-style"
              className="w-5 h-5 text-blue-600 accent-blue-600"
              checked={selectedStyle === StoryPromptType.KOREAN}
              onChange={() => setSelectedStyle(StoryPromptType.KOREAN)}
            />
          </div>

          <div className="border-t border-gray-700 pt-3">
            <p className="text-gray-300 mb-3">
              <span className="text-blue-400 font-medium">
                Phong cách Hàn Quốc
              </span>{" "}
              - Trải nghiệm câu chuyện theo kiểu manhwa Hàn, với:
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300 list-disc pl-5">
              <li>Săn quái, khám phá cổng & hầm ngục</li>
              <li>Hệ thống cấp bậc, thức tỉnh kỹ năng</li>
              <li>Hồi quy, trọng sinh, biết trước tương lai</li>
              <li>Drama gia đình, học đường, tình cảm</li>
            </ul>

            <div className="mt-4 bg-blue-900/10 border border-blue-800/30 p-2 rounded-md">
              <p className="text-xs text-gray-300 italic">
                "이야기의 신 sẽ dẫn dắt bạn qua những cánh cổng, thức tỉnh tiềm
                năng, và có thể trở về quá khứ để thay đổi vận mệnh..."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết về prompt đã chọn */}
      <div className="mb-5">
        <h4 className="font-semibold mb-2 text-center text-white">
          Chi Tiết Prompt
        </h4>

        {selectedStyle === StoryPromptType.CHINESE && (
          <div className="bg-gradient-to-r from-red-900/30 to-amber-900/30 p-4 rounded-md text-gray-300 border border-red-800/50">
            <h5 className="text-amber-400 font-semibold mb-2">
              Thiên Cổ Văn Thần - Prompt Phong Cách Trung Hoa:
            </h5>
            <p className="mb-3">
              Prompt này hướng dẫn AI viết truyện theo phong cách tiểu thuyết
              võng du Trung Quốc, với các đặc trưng:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>
                Sử dụng từ ngữ và cách xưng hô đặc trưng: "bần đạo", "lão phu",
                "tiểu đệ", "đại ca"...
              </li>
              <li>
                Có các yếu tố tu tiên: Luyện khí, trúc cơ, kim đan, nguyên anh,
                hóa thần...
              </li>
              <li>Chú trọng vào công pháp, nội công, kiếm thuật, pháp bảo</li>
              <li>Mâu thuẫn ân oán tình thù, cơ duyên kỳ ngộ</li>
              <li>Văn phong hoa mỹ, giàu hình ảnh ẩn dụ</li>
            </ul>
            <p className="text-xs italic text-amber-300/80">
              "Thiên hạ võ học, vạn biến không rời kỳ môn; nhân gian đạo pháp,
              thiên biến không ly âm dương..."
            </p>
          </div>
        )}

        {selectedStyle === StoryPromptType.KOREAN && (
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-md text-gray-300 border border-blue-800/50">
            <h5 className="text-blue-400 font-semibold mb-2">
              이야기의 신 (Thần Kể Chuyện) - Prompt Phong Cách Hàn Quốc:
            </h5>
            <p className="mb-3">
              Prompt này định hướng AI viết truyện theo phong cách manhwa Hàn
              Quốc hiện đại, với các đặc trưng:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>
                Hệ thống thứ bậc xã hội rõ ràng: Sunbae-Hoobae (선배-후배), kính
                ngữ, Nunchi (눈치)
              </li>
              <li>
                Yếu tố game hóa: Cổng, hầm ngục, săn quái vật, thức tỉnh kỹ năng
              </li>
              <li>
                Khả năng đặc biệt: Hồi quy, trọng sinh, biết trước tương lai
              </li>
              <li>Kịch tính cao: Drama, mâu thuẫn dữ dội nhưng có hòa giải</li>
              <li>
                Cân bằng giữa truyền thống và hiện đại, tập thể và cá nhân
              </li>
            </ul>
            <p className="text-xs italic text-blue-300/80">
              "정 (Jeong) - tình cảm sâu đậm không thể diễn tả bằng lời, 한
              (Han) - nỗi đau hóa thành sức mạnh..."
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={isGenerating}
        className={`w-full py-3 rounded-md font-medium transition-colors text-lg ${
          isGenerating
            ? "bg-gray-600 cursor-not-allowed"
            : selectedStyle === StoryPromptType.CHINESE
            ? "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
            Đang dệt nên câu chuyện...
          </div>
        ) : (
          `Tạo câu chuyện với ${
            selectedStyle === StoryPromptType.CHINESE
              ? "Thiên Cổ Văn Thần"
              : "이야기의 신"
          }`
        )}
      </button>

      <p className="text-center text-gray-400 text-xs mt-3">
        AI sẽ viết bằng tiếng Việt Nam nhưng vẫn giữ nguyên phong cách của thể
        loại đã chọn
      </p>
    </div>
  );
};
