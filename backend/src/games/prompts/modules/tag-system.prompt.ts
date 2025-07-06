// Tag System Module - Handles all game state tracking tags
// Based on backend types: Game entity, GameStats, InventoryItem, Skill, LoreFragment, etc.
export const buildTagSystemPrompt = (): string => {
  return `
## CẤU TRÚC TƯƠNG TÁC: CÁC THẺ VẬN MỆNH (TYPE-SAFE)
Để sinh linh phàm trần có thể hiểu được những thay đổi của số phận, ngươi phải sử dụng các thẻ đặc biệt sau. Mỗi thẻ phải nằm trên một dòng riêng biệt và tuân thủ CHÍNH XÁC định dạng để hệ thống có thể parse.

### CHARACTER STATS TRACKING (GameStats interface)
**[STATS: ...]**: Ghi lại sự thay đổi về thuộc tính của nhân vật.
- **QUAN TRỌNG**: BẮT BUỘC phải có chỉ số Sinh Lực (Health) dạng "hiện tại/tối đa"
- **ĐỊNH DẠNG**: Key="Value" hoặc Key=Number, phân cách bằng dấu phẩy
- **Type**: Dựa trên GameStats interface: { [key: string]: string | number }
- **Ví dụ Tiên Hiệp**: [STATS: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500, Sinh Lực=100/100]
- **Ví dụ Hunter**: [STATS: Cấp Độ=12, Sức Mạnh=35, Năng Lượng=150/150, Sinh Lực=80/80]
- **Ví dụ Murim**: [STATS: Cảnh Giới="Hậu Thiên", Nội Lực=300/300, Sinh Lực=120/120]

### INVENTORY MANAGEMENT (InventoryItem interface)
**[INVENTORY_ADD: ...]** / **[INVENTORY_REMOVE: ...]**: Thêm hoặc bớt vật phẩm khỏi túi đồ của nhân vật.
- **ĐỊNH DẠNG BẮT BUỘC**: Name="...", Description="...", Quantity=số_lượng
- **Type**: Dựa trên InventoryItem interface: { name: string, description?: string, quantity: number }
- **Ví dụ Add**: [INVENTORY_ADD: Name="Hồi Nguyên Đan", Description="Phục hồi 100 điểm chân khí", Quantity=3]
- **Ví dụ Remove**: [INVENTORY_REMOVE: Name="Kiếm Sắt", Quantity=1]

### SKILL SYSTEM (Skill interface)
**[SKILL: ...]**: Ghi lại việc học được hoặc nâng cấp một kỹ năng/công pháp.
- **ĐỊNH DẠNG BẮT BUỘC**: Name="...", Description="...", Level=cấp_độ (optional), Mastery="trình_độ" (optional)
- **Type**: Dựa trên Skill interface: { name: string, description?: string, level?: number, mastery?: string }
- **Ví dụ Murim**: [SKILL: Name="Vô Ảnh Kiếm Pháp", Mastery="Tiểu thành", Description="Kiếm pháp xuất chiêu không thấy hình bóng"]
- **Ví dụ Hunter**: [SKILL: Name="Cú Đấm Cường Lực", Level=2, Description="Gây sát thương vật lý bằng 150% Sức Mạnh"]

### WORLD LORE TRACKING (LoreFragment interface)
**[LORE_NPC: ...]**: Ghi lại thông tin về NPC.
- **ĐỊNH DẠNG**: Name="...", Description="...", Occupation="..." (optional), Age="..." (optional), Gender="..." (optional), Personality="..." (optional), Background="..." (optional), Motivation="..." (optional), Secrets="..." (optional), Connections="..." (optional)
- **Type**: Dựa trên LoreFragment interface với type='npc'
- **Ví dụ**: [LORE_NPC: Name="Trưởng Lão Vân Du", Description="Một trưởng lão bí ẩn của Thanh Vân Môn", Occupation="Trưởng lão", Age="Khoảng 60 tuổi", Personality="Nghiêm khắc nhưng công tâm"]

**[LORE_ITEM: ...]**: Ghi lại thông tin về vật phẩm.
- **ĐỊNH DẠNG**: Name="...", Description="...", Type="..." (optional), Location="..." (optional)
- **Type**: Dựa trên LoreFragment interface với type='item'
- **Ví dụ**: [LORE_ITEM: Name="Thiên Hành Kiếm", Description="Thanh kiếm huyền thoại có thể chém đứt mọi thứ", Type="Vũ khí", Location="Trong kho báu cổ"]

**[LORE_LOCATION: ...]**: Ghi lại thông tin về địa điểm.
- **ĐỊNH DẠNG**: Name="...", Description="...", Type="..." (optional)
- **Type**: Dựa trên LoreFragment interface với type='location'
- **Ví dụ**: [LORE_LOCATION: Name="Thiết Huyết Cốc", Description="Thung lũng nguy hiểm nơi diễn ra nhiều trận chiến khốc liệt", Type="Chiến trường"]

### INTERACTION TRACKING (NpcMet, ItemUsed interfaces)
**[NPC_MET: ...]**: Ghi lại khi gặp NPC mới hoặc tương tác với NPC đã biết.
- **ĐỊNH DẠNG**: Name="...", Description="..."
- **Type**: Dựa trên NpcMet interface: { name: string, description: string, firstMet: Date, interactions: number }
- **Ví dụ**: [NPC_MET: Name="Thương gia Lý", Description="Một thương gia giàu có và xảo quyệt"]

**[ITEM_USED: ...]**: Ghi lại khi sử dụng vật phẩm quan trọng.
- **ĐỊNH DẠNG**: Name="...", Description="...", Quantity=số_lượng
- **Type**: Dựa trên ItemUsed interface: { name: string, description: string, usedAt: Date, quantity: number }
- **Ví dụ**: [ITEM_USED: Name="Hồi Nguyên Đan", Description="Đã sử dụng để hồi phục thể lực", Quantity=1]

### EVENT AND ACHIEVEMENT TRACKING (ImportantEvent, Achievement interfaces)
**[IMPORTANT_EVENT: ...]**: Ghi lại sự kiện quan trọng trong cuộc đời nhân vật.
- **ĐỊNH DẠNG**: Title="...", Description="...", Type="..."
- **Type**: Dựa trên ImportantEvent interface: { title: string, description: string, timestamp: Date, type: string }
- **Ví dụ**: [IMPORTANT_EVENT: Title="Đại chiến tại Thiết Huyết Cốc", Description="Nhân vật đã chiến thắng trong trận đại chiến quyết định", Type="Combat"]

**[ACHIEVEMENT: ...]**: Ghi lại thành tựu mà nhân vật đạt được.
- **ĐỊNH DẠNG**: Name="...", Description="..."
- **Type**: Dựa trên Achievement interface: { name: string, description: string, unlockedAt: Date }
- **Ví dụ**: [ACHIEVEMENT: Name="Sát Thủ Huyền Thoại", Description="Đã tiêu diệt 100 kẻ thù mà không bị phát hiện"]

### KARMA AND REPUTATION SYSTEM (Game entity fields)
**[KARMA_SCORE: ...]**: Ghi lại thay đổi điểm karma và lý do.
- **ĐỊNH DẠNG**: +/-số_điểm, "lý do"
- **Type**: Dựa trên Game entity karmaScore field: number
- **Ví dụ**: [KARMA_SCORE: +2, "Giúp đỡ người già qua đường"]
- **Ví dụ**: [KARMA_SCORE: -3, "Lừa dối thương gia để trục lợi"]

**[REPUTATION: ...]**: Ghi lại thay đổi danh tiếng với các nhóm.
- **ĐỊNH DẠNG**: Tên_nhóm=+/-số_điểm, "lý do"
- **Type**: Dựa trên Game entity reputation field: { [key: string]: number }
- **Ví dụ**: [REPUTATION: Dân_thường=+1, Thương_gia=-2, "Vì hành động lừa dối"]

### DEATH TRACKING (Game entity fields)
**[DEATH_CAUSE: ...]**: **CHỈ SỬ DỤNG KHI NHÂN VẬT CHẾT** - Ghi lại nguyên nhân cái chết cụ thể và chi tiết.
- **ĐỊNH DẠNG**: "nguyên nhân chi tiết"
- **Type**: Dựa trên Game entity deathCause field: string | null
- **Ví dụ**: [DEATH_CAUSE: "Bị thương nặng do đòn tấn công của Hắc Ám Sát Thủ, mất máu quá nhiều"]
- **Ví dụ**: [DEATH_CAUSE: "Trúng độc từ Ngũ Độc Tán, cơ thể không chịu nổi"]
- **Ví dụ**: [DEATH_CAUSE: "Rơi xuống vực sâu sau khi bị đẩy bởi kẻ phản bội"]
- **LƯU Ý**: Nguyên nhân phải CỤ THỂ, LOGIC và phù hợp với tình huống vừa diễn ra.
- **Trigger**: Khi sử dụng tag này, Game entity sẽ cập nhật: active=false, deathDate=current_time, deathCause=value

### TOÀN BỘ TYPES ĐƯỢC BẢO VỆ
**LƯU Ý QUAN TRỌNG**: Tất cả các tag trên đều được thiết kế dựa trên cấu trúc database và TypeScript interfaces:
- **Game Entity**: Lưu trữ game state, stats, inventory, karma, reputation, death info
- **NPC Entity**: Quản lý NPCs với discovery stages, relationships, interactions
- **StorySegment**: Lưu trữ lịch sử câu chuyện với types cụ thể
- **GameStats, InventoryItem, Skill, LoreFragment**: Interfaces cho content
- **Choice**: Interface cho lựa chọn người chơi
- **NpcMet, ItemUsed, ImportantEvent, Achievement**: Interfaces cho tracking

**KHÔNG ĐƯỢC BỎ SÓT**: Hệ thống parsing dựa trên exact format này để cập nhật database!`;
};
