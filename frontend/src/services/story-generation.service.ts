import { StoryPromptType } from "@/lib/story-prompts";
import { backendApi } from "./api.service";

/**
 * Interface cho kết quả phản hồi từ API tạo nội dung
 */
interface StoryGenerationResponse {
  content: string;
  choices?: string[];
  error?: string;
}

/**
 * Class cung cấp các phương thức để tạo nội dung câu chuyện sử dụng AI
 */
export class StoryGenerationService {
  private static BACKEND_API_URL = "/story-prompt/generate"; // Endpoint của API backend

  /**
   * Tạo nội dung câu chuyện sử dụng prompt phong cách Trung Hoa
   */
  static async generateChineseStyleStory(
    currentContent: string,
    characterInfo: any,
    previousChoices?: string[]
  ): Promise<StoryGenerationResponse> {
    return this.generateStory(
      StoryPromptType.CHINESE,
      currentContent,
      characterInfo,
      previousChoices
    );
  }

  /**
   * Tạo nội dung câu chuyện sử dụng prompt phong cách Hàn Quốc
   */
  static async generateKoreanStyleStory(
    currentContent: string,
    characterInfo: any,
    previousChoices?: string[]
  ): Promise<StoryGenerationResponse> {
    return this.generateStory(
      StoryPromptType.KOREAN,
      currentContent,
      characterInfo,
      previousChoices
    );
  }

  /**
   * Phương thức chung để tạo nội dung câu chuyện
   */
  private static async generateStory(
    promptType: StoryPromptType,
    currentContent: string,
    characterInfo: any,
    previousChoices?: string[]
  ): Promise<StoryGenerationResponse> {
    try {
      // Gọi API backend để tạo nội dung truyện (sử dụng Gemini)
      const response = await backendApi.post(this.BACKEND_API_URL, {
        promptType,
        characterInfo,
        currentContent,
        previousChoices,
      });

      // Backend đã xử lý và trả về content và choices
      if (response.status === 200 && response.data) {
        return {
          content: response.data.content,
          choices: response.data.choices,
        };
      } else {
        throw new Error("Phản hồi không hợp lệ từ API");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nội dung câu chuyện:", error);
      return {
        content: "",
        error:
          "Đã xảy ra lỗi khi tạo nội dung câu chuyện. Vui lòng thử lại sau.",
      };
    }
  }
}
