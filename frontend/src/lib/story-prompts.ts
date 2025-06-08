/**
 * Enum định nghĩa các loại prompt truyện
 *
 * Lưu ý: Toàn bộ logic tạo prompt đã được chuyển sang backend để sử dụng với Gemini AI
 */

// Enum để quản lý các loại prompt
export enum StoryPromptType {
  CHINESE = "chinese", // Phong cách truyện Trung Hoa (Tiên hiệp/Võ hiệp)
  KOREAN = "korean", // Phong cách truyện Hàn Quốc (Hunter/Gate/Regression)
}
