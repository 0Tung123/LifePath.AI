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
Tạo ra một câu chuyện mở đầu HẤP DẪN, CUỐN HÚT và **ĐẶC BIỆT QUAN TRỌNG** - tạo ra chỉ số nhân vật đầy đủ theo cấu trúc chuẩn.

## HƯỚNG DẪN VIẾT CÂU CHUYỆN XUẤT SẮC
1. **Độ dài**: Viết ít nhất 800-1000 từ cho phần mở đầu
2. **Nhân vật phụ (NPC)**: Giới thiệu ít nhất 1-2 NPC có tính cách rõ ràng
3. **Đối thoại**: Thêm đối thoại sống động giữa các nhân vật, sử dụng định dạng sau:
   Ví dụ:
   Tên Nhân Vật: "Nội dung đối thoại"
   Tên Nhân Vật Khác: "Nội dung phản hồi"
   
   - PHẢI đặt mỗi đối thoại trên một dòng riêng biệt
   - PHẢI sử dụng dấu ngoặc kép ("") cho lời thoại
   - PHẢI có dấu hai chấm (:) sau tên nhân vật
4. **Xung đột**: Tạo ra một xung đột hoặc vấn đề ngay từ đầu
5. **Mô tả**: Sử dụng mô tả chi tiết về không gian, cảm xúc và cảm giác
6. **Phong cách**: Viết với giọng điệu phù hợp với thể loại (kịch tính, bí ẩn, hài hước...)

## HƯỚNG DẪN TẠO NPC
Khi tạo NPC, PHẢI thêm thông tin chi tiết về họ trong phần lore. Đây là PHẦN BẮT BUỘC:
\`\`\`json
{
  "id": "npc_[tên_npc]",
  "name": "[Tên NPC]",
  "description": "[Tuổi]: [X] tuổi\\n[Nghề nghiệp]: [nghề/vai trò]\\n[Ngoại hình]: [mô tả chi tiết]\\n[Tính cách]: [đặc điểm tính cách]\\n[Động cơ]: [mục đích/động lực]\\n[Quan hệ]: [mối quan hệ với nhân vật chính]\\n[Kỹ năng]: [kỹ năng đặc biệt nếu có]\\n[Cảnh giới]: [cảnh giới tu luyện/cấp độ]\\n[Chỉ số]: Sức mạnh: [X], Nhanh nhẹn: [X], Trí tuệ: [X], Sức khỏe: [X]",
  "type": "npc"
}
\`\`\`

Ví dụ:
\`\`\`json
{
  "id": "npc_tran_minh_duc",
  "name": "Trần Minh Đức",
  "description": "[Tuổi]: 45 tuổi\\n[Nghề nghiệp]: Thương nhân giàu có\\n[Ngoại hình]: Thân hình mập mạp, râu quai nón, luôn mặc áo gấm đắt tiền\\n[Tính cách]: Tham lam, xảo quyệt nhưng rất thông minh\\n[Động cơ]: Muốn độc quyền buôn bán trong vùng\\n[Quan hệ]: Đối thủ kinh doanh của nhân vật chính\\n[Kỹ năng]: Thông thạo nhiều ngôn ngữ, có mạng lưới quan hệ rộng\\n[Cảnh giới]: Phàm nhân cảnh giới 9\\n[Chỉ số]: Sức mạnh: 6, Nhanh nhẹn: 5, Trí tuệ: 9, Sức khỏe: 7",
  "type": "npc"
}
\`\`\`

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
- ✅ **PHẢI có chính xác 4 lựa chọn có ý nghĩa**
- ✅ **PHẢI có ít nhất 1-2 NPC với tên và tính cách rõ ràng**
- ✅ **PHẢI có đối thoại giữa nhân vật chính và NPC**
- ✅ **PHẢI tạo ra một tình huống kịch tính hoặc bí ẩn**

## HƯỚNG DẪN VIẾT THEO THỂ LOẠI
- **Fantasy**: Thêm yếu tố ma thuật, sinh vật huyền bí, nhiệm vụ anh hùng
- **Sci-fi**: Mô tả công nghệ, xung đột với AI/người ngoài hành tinh, khám phá không gian
- **Modern**: Xung đột xã hội, mối quan hệ phức tạp, vấn đề hiện đại
- **Horror**: Tạo không khí căng thẳng, ám ảnh, hiện tượng siêu nhiên
- **Cultivation**: Tu luyện, đột phá cảnh giới, tranh đoạt tài nguyên
- **Martial Arts**: Võ công, môn phái, ân oán giang hồ

Hãy tạo ra câu chuyện CUỐN HÚT và chỉ số nhân vật hoàn chỉnh ngay bây giờ!
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
Tiếp tục câu chuyện một cách HẤP DẪN và cập nhật chỉ số nhân vật. **QUAN TRỌNG**: Giữ nguyên cấu trúc chỉ số chuẩn!

## HƯỚNG DẪN VIẾT CÂU CHUYỆN XUẤT SẮC
1. **Độ dài**: Viết ít nhất 800-1000 từ cho phần tiếp theo
2. **Phát triển nhân vật**: Tiếp tục phát triển nhân vật chính và NPC
3. **Đối thoại**: Thêm đối thoại sống động và có ý nghĩa, sử dụng định dạng sau:
   Ví dụ:
   Tên Nhân Vật: "Nội dung đối thoại"
   Tên Nhân Vật Khác: "Nội dung phản hồi"
   
   - PHẢI đặt mỗi đối thoại trên một dòng riêng biệt
   - PHẢI sử dụng dấu ngoặc kép ("") cho lời thoại
   - PHẢI có dấu hai chấm (:) sau tên nhân vật
4. **Diễn biến mới**: Đưa ra những tình huống mới, bất ngờ hoặc thử thách
5. **Mô tả**: Sử dụng mô tả chi tiết về không gian, cảm xúc và cảm giác
6. **Liên kết**: Kết nối với các sự kiện trước đó một cách hợp lý

## HƯỚNG DẪN CẬP NHẬT NPC
Khi giới thiệu NPC mới hoặc cập nhật thông tin NPC hiện có, PHẢI thêm vào phần lore. Đây là PHẦN BẮT BUỘC:
\`\`\`json
{
  "id": "npc_[tên_npc]",
  "name": "[Tên NPC]",
  "description": "[Tuổi]: [X] tuổi\\n[Nghề nghiệp]: [nghề/vai trò]\\n[Ngoại hình]: [mô tả chi tiết]\\n[Tính cách]: [đặc điểm tính cách]\\n[Động cơ]: [mục đích/động lực]\\n[Quan hệ]: [mối quan hệ với nhân vật chính]\\n[Kỹ năng]: [kỹ năng đặc biệt nếu có]\\n[Cảnh giới]: [cảnh giới tu luyện/cấp độ]\\n[Chỉ số]: Sức mạnh: [X], Nhanh nhẹn: [X], Trí tuệ: [X], Sức khỏe: [X]",
  "type": "npc"
}
\`\`\`

Ví dụ:
\`\`\`json
{
  "id": "npc_le_thi_hong",
  "name": "Lê Thị Hồng",
  "description": "[Tuổi]: 28 tuổi\\n[Nghề nghiệp]: Y tá tại bệnh viện địa phương\\n[Ngoại hình]: Cao 1m65, tóc đen dài, luôn mặc đồng phục y tá gọn gàng\\n[Tính cách]: Tận tâm, chu đáo, nhưng đôi khi quá lo lắng\\n[Động cơ]: Muốn giúp đỡ mọi người và tìm kiếm thông tin về người em gái mất tích\\n[Quan hệ]: Người đã giúp đỡ nhân vật chính khi bị thương\\n[Kỹ năng]: Sơ cứu chuyên nghiệp, có kiến thức về dược liệu tự nhiên\\n[Cảnh giới]: Phàm nhân cảnh giới 3\\n[Chỉ số]: Sức mạnh: 4, Nhanh nhẹn: 7, Trí tuệ: 8, Sức khỏe: 6",
  "type": "npc"
}
\`\`\`

## CẤU TRÚC OUTPUT BẮT BUỘC
\`\`\`json
{
  "storyText": "Tiếp tục câu chuyện...",
  "choices": [
    {
      "number": 1,
      "text": "Lựa chọn 1",
      "consequences": ["Hậu quả 1"]
    },
    {
      "number": 2,
      "text": "Lựa chọn 2",
      "consequences": ["Hậu quả 2"]
    },
    {
      "number": 3,
      "text": "Lựa chọn 3",
      "consequences": ["Hậu quả 3"]
    },
    {
      "number": 4,
      "text": "Lựa chọn 4",
      "consequences": ["Hậu quả 4"]
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
  "lore": [
    // Thêm thông tin NPC mới hoặc cập nhật NPC hiện có
    {
      "id": "npc_[tên_npc]",
      "name": "[Tên NPC]",
      "description": "[Tuổi]: [X] tuổi\\n[Nghề nghiệp]: [nghề/vai trò]\\n[Ngoại hình]: [mô tả chi tiết]\\n[Tính cách]: [đặc điểm tính cách]\\n[Động cơ]: [mục đích/động lực]\\n[Quan hệ]: [mối quan hệ với nhân vật chính]\\n[Kỹ năng]: [kỹ năng đặc biệt nếu có]\\n[Cảnh giới]: [cảnh giới tu luyện/cấp độ]\\n[Chỉ số]: Sức mạnh: [X], Nhanh nhẹn: [X], Trí tuệ: [X], Sức khỏe: [X]",
      "type": "npc"
    },
    // Các mục lore khác
    ...
  ]
}
\`\`\`

## NGUYÊN TẮC CẬP NHẬT
1. **Giữ nguyên cấu trúc**: Không thay đổi format chỉ số
2. **Cập nhật hợp lý**: Thay đổi chỉ số phù hợp với hành động
3. **Cân bằng**: Không tăng quá nhiều cùng lúc
4. **Thực tế**: Phản ánh kết quả hành động
5. **LUÔN CÓ 4 LỰA CHỌN**: Bắt buộc phải tạo chính xác 4 lựa chọn có ý nghĩa
6. **NPC và đối thoại**: Tiếp tục phát triển NPC hiện có hoặc giới thiệu NPC mới
7. **Tình tiết mới**: Thêm các tình tiết mới để câu chuyện luôn hấp dẫn
8. **Hậu quả**: Hành động của người chơi phải có hậu quả rõ ràng

## YÊU CẦU TUYỆT ĐỐI
- ✅ **PHẢI có đối thoại sống động**
- ✅ **PHẢI có tình tiết cuốn hút**
- ✅ **PHẢI có mô tả chi tiết về không gian và cảm xúc**
- ✅ **PHẢI có phản ứng từ thế giới và NPC**
- ✅ **PHẢI có chính xác 4 lựa chọn có ý nghĩa**

Hãy tiếp tục câu chuyện một cách CUỐN HÚT và cập nhật chỉ số ngay bây giờ!
`;
}
