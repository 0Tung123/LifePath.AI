import { GameSettingsDto } from '../dto/create-game.dto';

export function generateKoreanStyleNarrativePrompt(
  gameSettings: GameSettingsDto,
): string {
  return `
# PHONG CÁCH VIẾT TRUYỆN HÀN QUỐC - LIFEPATH.AI

## THÔNG TIN NHÂN VẬT
- **Tên**: ${gameSettings.characterName}
- **Xuất thân**: ${gameSettings.characterBackstory}
- **Thế giới**: ${gameSettings.setting}
- **Chủ đề**: ${gameSettings.theme}

## HƯỚNG DẪN VIẾT THEO PHONG CÁCH HÀN QUỐC

### 1. ĐỀ TÀI PHỔ BIẾN
- **Regression/Hồi quy**: Nhân vật quay về quá khứ với kiến thức tương lai
- **Dungeon/Hunter**: Thế giới có cổng quái vật, thợ săn với năng lực đặc biệt
- **System/Hệ thống**: Nhân vật nhận được hệ thống game trong thực tế
- **Murim/Võ lâm**: Thế giới võ thuật với các tông phái, cao thủ
- **Chaebol/Tài phiệt**: Câu chuyện về gia tộc giàu có, quyền lực

### 2. CẤU TRÚC TRUYỆN KINH ĐIỂN
- **Mở đầu shock**: Bắt đầu với tình huống căng thẳng, bất ngờ
- **Flashback**: Kể lại quá khứ để giải thích hiện tại
- **Power scaling**: Nhân vật từng bước trở nên mạnh mẽ
- **Face slapping**: Đánh bại kẻ khinh thường mình
- **Cliffhanger**: Kết thúc chương với tình huống hồi hộp

### 3. PHONG CÁCH NGÔN NGỮ
- **Ngắn gọn, súc tích**: Câu văn không quá dài, đi thẳng vào vấn đề
- **Tâm lý nội tâm**: Mô tả suy nghĩ, cảm xúc nhân vật chi tiết
- **Đối thoại sống động**: Hội thoại tự nhiên, có tính cách riêng
- **Mô tả hành động**: Chi tiết về các pha hành động, chiến đấu

### 4. YẾU TỐ ĐẶC TRƯNG
- **Hierarchy/Phân cấp**: Hệ thống cấp bậc rõ ràng (E, D, C, B, A, S)
- **Guild/Bang hội**: Tổ chức, nhóm với mục tiêu chung
- **Status window**: Bảng thông số như game (HP, MP, STR, AGI...)
- **Skill/Kỹ năng**: Hệ thống kỹ năng đa dạng, có thể nâng cấp
- **Revenge/Báo thù**: Động lực mạnh mẽ từ quá khứ đau thương

### 5. NHÂN VẬT ĐIỂN HÌNH
- **Protagonist**: Thường bắt đầu yếu, bị khinh thường
- **System**: Hệ thống hỗ trợ với tính cách riêng
- **Mentor**: Người thầy bí ẩn, mạnh mẽ
- **Rival**: Đối thủ cùng trang lứa, thúc đẩy phát triển
- **Villain**: Kẻ thù với quá khứ phức tạp

### 6. CÁCH XÂY DỰNG TENSION
- **Time pressure**: Áp lực thời gian (deadline, đếm ngược)
- **Life or death**: Tình huống sống còn
- **Betrayal**: Sự phản bội từ người tin tưởng
- **Hidden truth**: Sự thật được che giấu dần được hé lộ
- **Power gap**: Chênh lệch sức mạnh tạo căng thẳng

### 7. ELEMENTS GAME-LIKE
- **Level up**: Nâng cấp với hiệu ứng đặc biệt
- **Rare items**: Vật phẩm hiếm với thuộc tính mạnh
- **Boss fights**: Trận chiến với kẻ thù mạnh
- **Party system**: Đồng đội với vai trò khác nhau
- **Achievement**: Thành tựu mở khóa phần thưởng

## YÊU CẦU VIẾT TRUYỆN
Hãy tạo ra một câu chuyện mở đầu theo phong cách Hàn Quốc cho nhân vật ${gameSettings.characterName}.

Câu chuyện cần:
1. **Hook mạnh**: Mở đầu với tình huống hấp dẫn ngay từ câu đầu
2. **System introduction**: Giới thiệu hệ thống/năng lực đặc biệt
3. **Character motivation**: Động lực rõ ràng (báo thù, bảo vệ, trở nên mạnh)
4. **World building**: Xây dựng thế giới qua hành động, không giải thích dài
5. **Cliffhanger ending**: Kết thúc với tình huống hồi hộp

**Độ dài**: 600-1000 từ
**Giọng điệu**: Hiện đại, năng động, có chút căng thẳng
**Ngôi kể**: Ngôi thứ ba, tập trung vào hành động và tâm lý
**Format**: Chia thành các đoạn ngắn, dễ đọc
`;
}
