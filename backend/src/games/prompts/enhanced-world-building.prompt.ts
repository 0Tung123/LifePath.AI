/**
 * ENHANCED WORLD BUILDING PROMPT - PRODUCTION VERSION
 * Tạo ra chỉ số nhân vật đầy đủ theo cấu trúc CharacterAttributes
 */

import { GameSettingsDto } from '../dto/create-game.dto';
import { Game } from '../entities/game.entity';

export function buildEnhancedWorldPrompt(
  gameSettings: GameSettingsDto,
): string {
  return `
# LIFEPATH.AI - ENHANCED WORLD BUILDING SYSTEM

## THÔNG TIN NHÂN VẬT
- **Tên**: ${gameSettings.characterName}
- **Lý lịch**: ${gameSettings.characterBackstory}
- **Thế giới**: ${gameSettings.setting}
- **Chủ đề**: ${gameSettings.theme}

## NHIỆM VỤ CHÍNH
Tạo ra một câu chuyện mở đầu hấp dẫn và **ĐẶC BIỆT QUAN TRỌNG** - tạo ra chỉ số nhân vật đầy đủ theo cấu trúc chuẩn.

## ⚠️ CẤU TRÚC CHỈ SỐ BỮT BUỘC
Bạn PHẢI tạo ra chỉ số nhân vật với cấu trúc JSON chính xác sau:

\`\`\`json
{
  "storyText": "Câu chuyện mở đầu...",
  "choices": [
    {
      "number": 1,
      "text": "Lựa chọn 1",
      "consequences": ["Hậu quả 1", "Hậu quả 2"]
    },
    {
      "number": 2,
      "text": "Lựa chọn 2",
      "consequences": ["Hậu quả 1", "Hậu quả 2"]
    }
  ],
  "stats": {
    "attributes": {
      "strength": [giá trị 8-18],
      "agility": [giá trị 8-18],
      "intelligence": [giá trị 8-18],
      "wisdom": [giá trị 8-18],
      "charisma": [giá trị 8-18],
      "constitution": [giá trị 8-18],
      "luck": [giá trị 8-18],
      "health": {
        "current": [strength + constitution] * 10,
        "max": [strength + constitution] * 10
      },
      "mana": {
        "current": [intelligence + wisdom] * 5,
        "max": [intelligence + wisdom] * 5
      },
      "stamina": {
        "current": [agility + constitution] * 5,
        "max": [agility + constitution] * 5
      },
      "experience": 0,
      "level": 1,
      "nextLevelExp": 100
    }
  },
  "inventory": [
    {
      "name": "Vật phẩm ban đầu",
      "description": "Mô tả vật phẩm",
      "quantity": 1,
      "type": "weapon/armor/consumable/misc"
    }
  ],
  "skills": [
    {
      "name": "Kỹ năng ban đầu",
      "description": "Mô tả kỹ năng",
      "level": 1,
      "mastery": "Novice"
    }
  ],
  "lore": [
    {
      "id": "lore_001",
      "title": "Tiêu đề thông tin",
      "content": "Nội dung thông tin về thế giới",
      "type": "general",
      "category": "world",
      "importance": "medium",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

## NGUYÊN TẮC TẠO CHỈ SỐ
1. **7 Chỉ số cơ bản**: Tạo dựa trên background và theme
2. **Cân bằng**: Tổng 7 chỉ số khoảng 70-90
3. **Phù hợp**: Chỉ số phản ánh background nhân vật
4. **Thực tế**: Nhân vật mới bắt đầu nên có chỉ số 8-18

## HƯỚNG DẪN CHỈ SỐ THEO THEME
- **Fantasy**: Strength, Constitution cao cho chiến binh
- **Cultivation**: Intelligence, Wisdom cao cho tu tiên
- **Modern**: Charisma, Intelligence cao cho xã hội hiện đại
- **Sci-fi**: Intelligence, Agility cao cho công nghệ

## YÊU CẦU TUYỆT ĐỐI
- ✅ **PHẢI có đầy đủ 7 chỉ số cơ bản**
- ✅ **PHẢI có health, mana, stamina với current/max**
- ✅ **PHẢI có experience, level, nextLevelExp**
- ✅ **PHẢI sử dụng tiếng Việt 100%**
- ✅ **PHẢI có ít nhất 3 lựa chọn có ý nghĩa**

Hãy tạo ra câu chuyện và chỉ số nhân vật hoàn chỉnh ngay bây giờ!
`;
}

export function buildEnhancedActionPrompt(
  game: Game,
  choiceNumber: number,
  action: string,
  think: string,
  communication: string,
): string {
  return `
# LIFEPATH.AI - ENHANCED ACTION PROCESSING

## THÔNG TIN GAME HIỆN TẠI
- **Nhân vật**: ${game.settings.characterName}
- **Level**: ${game.characterStats.level || 1}
- **Chỉ số hiện tại**: ${JSON.stringify(game.characterStats, null, 2)}
- **Câu chuyện hiện tại**: ${game.currentPrompt}

## HÀNH ĐỘNG NGƯỜI CHƠI
- **Lựa chọn số**: ${choiceNumber}
- **Hành động**: ${action}
- **Suy nghĩ**: ${think}
- **Giao tiếp**: ${communication}

## THÔNG TIN GAME NÂNG CAO
${JSON.stringify((game as any).enhancedActionInfo || {}, null, 2)}

## NHIỆM VỤ
Tiếp tục câu chuyện và cập nhật chỉ số nhân vật. **QUAN TRỌNG**: Giữ nguyên cấu trúc chỉ số chuẩn!

## CẤU TRÚC OUTPUT BẮT BUỘC
\`\`\`json
{
  "storyText": "Tiếp tục câu chuyện...",
  "choices": [
    {
      "number": 1,
      "text": "Lựa chọn 1",
      "consequences": ["Hậu quả 1"]
    }
  ],
  "stats": {
    "attributes": {
      "strength": [giá trị hiện tại + thay đổi],
      "agility": [giá trị hiện tại + thay đổi],
      "intelligence": [giá trị hiện tại + thay đổi],
      "wisdom": [giá trị hiện tại + thay đổi],
      "charisma": [giá trị hiện tại + thay đổi],
      "constitution": [giá trị hiện tại + thay đổi],
      "luck": [giá trị hiện tại + thay đổi],
      "health": {
        "current": [cập nhật],
        "max": [cập nhật]
      },
      "mana": {
        "current": [cập nhật],
        "max": [cập nhật]
      },
      "stamina": {
        "current": [cập nhật],
        "max": [cập nhật]
      },
      "experience": [cập nhật],
      "level": [cập nhật],
      "nextLevelExp": [cập nhật]
    }
  },
  "inventory": [...],
  "skills": [...],
  "lore": [...]
}
\`\`\`

## NGUYÊN TẮC CẬP NHẬT
1. **Giữ nguyên cấu trúc**: Không thay đổi format chỉ số
2. **Cập nhật hợp lý**: Thay đổi chỉ số phù hợp với hành động
3. **Cân bằng**: Không tăng quá nhiều cùng lúc
4. **Thực tế**: Phản ánh kết quả hành động

Hãy tiếp tục câu chuyện và cập nhật chỉ số ngay bây giờ!
`;
}
