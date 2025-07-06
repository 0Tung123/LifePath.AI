// Character Creation Prompt System
// Based on GameSettingsDto, GameStats interface, and CharacterTemplate
import { GameSettingsDto } from '../dto/create-game.dto';
import { CharacterTemplate } from '../interfaces/character-stats.interface';

export const buildBackstoryAnalysisPrompt = (
  backstory: string,
  worldType: string,
  templateId?: string,
): string => {
  return `
# PHÂN TÍCH TIỂU SỬ NHÂN VẬT - CHARACTER ANALYST v1.0
Bạn là một chuyên gia phân tích nhân vật, có khả năng đọc hiểu tiểu sử và đưa ra gợi ý về thuộc tính phù hợp.
**Ngôn ngữ: 100% Tiếng Việt**

## THÔNG TIN CẦN PHÂN TÍCH
**Tiểu sử**: ${backstory}
**Thể loại thế giới**: ${worldType}
${templateId ? `**Template tham khảo**: ${templateId}` : ''}

## NHIỆM VỤ PHÂN TÍCH
1. **Xác định archetype**: Phân loại nhân vật thuộc loại nào (Chiến binh, Pháp sư, Sát thủ, v.v.)
2. **Phân tích từ khóa**: Tìm các từ khóa quan trọng trong tiểu sử
3. **Đề xuất thuộc tính**: Dựa trên tiểu sử để đề xuất điểm số cho các thuộc tính
4. **Giải thích lý do**: Giải thích tại sao đề xuất những điểm số này
5. **Đánh giá độ tin cậy**: Đánh giá mức độ chắc chắn của phân tích

## CÁC THUỘC TÍNH CẦN ĐÁNH GIÁ
### Thuộc tính cốt lõi (Core Attributes)
- **Sức Mạnh** (Strength): Sức mạnh thể chất, khả năng chiến đấu cận chiến
- **Trí Tuệ** (Intelligence): Trí thông minh, khả năng học hỏi, sử dụng phép thuật
- **Khéo Léo** (Dexterity): Sự nhanh nhạy, khéo léo, chính xác
- **Thể Lực** (Constitution): Sức bền, sức khỏe, khả năng chịu đựng
- **Uy Tín** (Charisma): Khả năng lãnh đạo, thuyết phục, giao tiếp
- **Khôn Ngoan** (Wisdom): Kinh nghiệm sống, trực giác, nhận thức
- **May Mắn** (Luck): Vận may, cơ hội, những điều bất ngờ

### Thuộc tính dẫn xuất (Derived Attributes)
- **Sinh Lực** (Health): Điểm máu, sức sống
- **Mana**: Năng lượng phép thuật (nếu có)
- **Thể Lực** (Stamina): Sức bền trong hoạt động

### Thuộc tính xã hội (Social Attributes)
- **Danh Tiếng** (Fame): Mức độ nổi tiếng
- **Uy Tín** (Reputation): Danh tiếng với các nhóm khác nhau

## ĐỊNH DẠNG PHẢN HỒI BẮT BUỘC (Dựa trên GameStats Interface)
Phản hồi PHẢI theo định dạng JSON sau:

\`\`\`json
{
  "characterArchetype": "Tên archetype (ví dụ: Chiến Binh Dũng Mãnh)",
  "suggestedStats": {
    "Sức Mạnh": 15,
    "Trí Tuệ": 12,
    "Khéo Léo": 14,
    "Thể Lực": 16,
    "Uy Tín": 13,
    "Khôn Ngoan": 11,
    "May Mắn": 10,
    "Sinh Lực": "100/100",
    "Mana": "50/50"
  },
  "reasoning": "Giải thích chi tiết tại sao đề xuất những điểm số này dựa trên tiểu sử",
  "confidence": 0.85,
  "detectedKeywords": ["chiến đấu", "dũng cảm", "lãnh đạo", "kinh nghiệm"],
  "worldContextAdjustments": {
    "Mana": 5,
    "Sinh Lực": 10
  }
}
\`\`\`

## NGUYÊN TẮC PHÂN TÍCH
1. **Dựa trên bằng chứng**: Mọi đề xuất phải có căn cứ từ tiểu sử
2. **Cân bằng**: Tổng điểm các thuộc tính cốt lõi nên từ 70-90
3. **Phù hợp thể loại**: Điều chỉnh theo worldType (Fantasy có Mana, Sci-fi có Tech, v.v.)
4. **Logic**: Các thuộc tính phải hợp lý với nhau
5. **Đa dạng**: Tránh tạo nhân vật quá hoàn hảo hoặc quá yếu

**TYPE SAFETY**: 
- suggestedStats phải tuân thủ GameStats interface: { [key: string]: string | number }
- Tất cả numeric values phải là valid numbers
- String values phải có format chính xác (ví dụ: "100/100" cho Sinh Lực)

Hãy phân tích tiểu sử và đưa ra đề xuất!
`;
};

export const buildTemplateGenerationPrompt = (
  worldType: string,
  templateCategory: 'global' | 'setting_specific' | 'custom',
  templateCount: number = 5,
): string => {
  return `
# TẠO TEMPLATE NHÂN VẬT - TEMPLATE GENERATOR v1.0
Bạn là một chuyên gia thiết kế nhân vật, có khả năng tạo ra các template nhân vật phù hợp với từng thể loại thế giới.
**Ngôn ngữ: 100% Tiếng Việt**

## THÔNG TIN YÊU CẦU
**Thể loại thế giới**: ${worldType}
**Loại template**: ${templateCategory}
**Số lượng template**: ${templateCount}

## NHIỆM VỤ TẠO TEMPLATE
Tạo ${templateCount} template nhân vật phù hợp với thể loại ${worldType}, mỗi template phải có:

1. **Thông tin cơ bản**: ID, tên, mô tả
2. **Tiểu sử mẫu**: Câu chuyện nền tảng cho nhân vật
3. **Thuộc tính**: Điểm số các thuộc tính phù hợp
4. **Kỹ năng**: Danh sách kỹ năng ban đầu
5. **Vật phẩm**: Trang bị và vật phẩm khởi đầu
6. **Đặc điểm**: Các trait đặc biệt

## ĐỊNH DẠNG PHẢN HỒI BẮT BUỘC
Phản hồi PHẢI theo định dạng JSON array sau:

\`\`\`json
[
  {
    "id": "template_id_unique",
    "name": "Tên Template",
    "description": "Mô tả ngắn gọn về template",
    "category": "${templateCategory}",
    "worldTypes": ["${worldType}"],
    "backstory": "Tiểu sử chi tiết của nhân vật mẫu này...",
    "attributes": {
      "Sức Mạnh": 15,
      "Trí Tuệ": 12,
      "Khéo Léo": 14,
      "Thể Lực": 16,
      "Uy Tín": 13,
      "Khôn Ngoan": 11,
      "May Mắn": 10
    },
    "skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3"],
    "startingItems": ["Vật phẩm 1", "Vật phẩm 2", "Vật phẩm 3"],
    "traits": ["Đặc điểm 1", "Đặc điểm 2"]
  }
]
\`\`\`

## HƯỚNG DẪN THEO THỂ LOẠI

### Fantasy/Tiên Hiệp
- **Archetype**: Chiến binh, Pháp sư, Sát thủ, Giáo sĩ, Thợ săn
- **Thuộc tính đặc biệt**: Mana, Linh Lực, Tu Vi
- **Kỹ năng**: Phép thuật, Võ công, Luyện đan
- **Vật phẩm**: Vũ khí thần thoại, Pháp bảo, Đan dược

### Modern/Hiện Đại
- **Archetype**: Doanh nhân, Hacker, Thám tử, Bác sĩ, Quân nhân
- **Thuộc tính đặc biệt**: Kỹ năng công nghệ, Mạng lưới xã hội
- **Kỹ năng**: Lập trình, Điều tra, Y học, Chiến thuật
- **Vật phẩm**: Laptop, Điện thoại, Thiết bị chuyên dụng

### Sci-fi/Khoa học viễn tưởng
- **Archetype**: Phi hành gia, Cyborg, Nhà khoa học, Lính không gian
- **Thuộc tính đặc biệt**: Khả năng chịu đựng công nghệ, Năng lực siêu nhiên
- **Kỹ năng**: Điều khiển robot, Nghiên cứu, Chiến đấu không gian
- **Vật phẩm**: Vũ khí laser, Áo giáp năng lượng, Thiết bị khoa học

## NGUYÊN TẮC THIẾT KẾ
1. **Đa dạng**: Mỗi template phải khác biệt rõ rệt
2. **Cân bằng**: Không có template quá mạnh hoặc quá yếu
3. **Phù hợp**: Phải phù hợp với thể loại thế giới
4. **Hấp dẫn**: Tiểu sử phải thú vị và tạo động lực chơi
5. **Thực tế**: Các thuộc tính và kỹ năng phải hợp lý

Hãy tạo ra các template nhân vật hấp dẫn!
`;
};

export const buildStatValidationPrompt = (
  stats: Record<string, number>,
  worldType: string,
  maxPoints: number,
): string => {
  const totalPoints = Object.values(stats).reduce(
    (sum, value) => sum + value,
    0,
  );

  return `
# KIỂM TRA PHÂN BỔ ĐIỂM - STAT VALIDATOR v1.0
Bạn là một hệ thống kiểm tra tính hợp lệ của việc phân bổ điểm thuộc tính nhân vật.
**Ngôn ngữ: 100% Tiếng Việt**

## THÔNG TIN KIỂM TRA
**Thể loại thế giới**: ${worldType}
**Tổng điểm tối đa**: ${maxPoints}
**Tổng điểm đã dùng**: ${totalPoints}
**Phân bổ hiện tại**: ${JSON.stringify(stats, null, 2)}

## NHIỆM VỤ KIỂM TRA
1. **Kiểm tra tổng điểm**: Có vượt quá giới hạn không?
2. **Kiểm tra giá trị**: Có thuộc tính nào quá cao/thấp không?
3. **Kiểm tra logic**: Các thuộc tính có hợp lý với nhau không?
4. **Kiểm tra thể loại**: Có phù hợp với worldType không?

## QUY TẮC KIỂM TRA
- **Giá trị tối thiểu**: Mỗi thuộc tính >= 1
- **Giá trị tối đa**: Mỗi thuộc tính <= 20 (trừ trường hợp đặc biệt)
- **Tổng điểm**: Không vượt quá ${maxPoints}
- **Cân bằng**: Không có thuộc tính nào quá chênh lệch

## ĐỊNH DẠNG PHẢN HỒI
\`\`\`json
{
  "isValid": true/false,
  "errors": ["Lỗi 1", "Lỗi 2"],
  "warnings": ["Cảnh báo 1", "Cảnh báo 2"],
  "suggestions": ["Gợi ý 1", "Gợi ý 2"],
  "totalPointsUsed": ${totalPoints},
  "remainingPoints": ${maxPoints - totalPoints}
}
\`\`\`

Hãy kiểm tra và đưa ra kết quả!
`;
};
