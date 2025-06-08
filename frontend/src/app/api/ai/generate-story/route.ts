import { NextRequest, NextResponse } from 'next/server';

/**
 * API route xử lý yêu cầu tạo nội dung câu chuyện (chuyển tiếp đến backend)
 * 
 * Lưu ý: Route này chỉ để giữ tương thích với các mã nguồn hiện có.
 * Chúng tôi khuyến khích sử dụng StoryGenerationService trực tiếp.
 * Tính năng tạo prompt và nội dung truyện đã được chuyển sang backend (Gemini AI).
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      content: "Tính năng này đã được chuyển sang backend sử dụng Gemini AI. Vui lòng sử dụng StoryGenerationService.", 
      choices: ["Đã hiểu"] 
    },
    { status: 200 }
  );
}