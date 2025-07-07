import { GameSettingsDto } from '../dto/create-game.dto';

export function generateChineseStyleNarrativePrompt(
  gameSettings: GameSettingsDto,
): string {
  return `
# PHONG CÁCH VIẾT TRUYỆN TRUNG QUỐC - LIFEPATH.AI

## THÔNG TIN NHÂN VẬT
- **Tên**: ${gameSettings.characterName}
- **Xuất thân**: ${gameSettings.characterBackstory}
- **Thế giới**: ${gameSettings.setting}
- **Chủ đề**: ${gameSettings.theme}

## HƯỚNG DẪN VIẾT THEO PHONG CÁCH TRUNG QUỐC

### 1. CẤU TRÚC TRUYỆN
- **Mở đầu**: Giới thiệu nhân vật với hoàn cảnh khó khăn, thường có yếu tố "nghịch cảnh"
- **Phát triển**: Nhân vật gặp cơ duyên, học được kỹ năng/sức mạnh mới
- **Cao trào**: Đối mặt với thử thách lớn, thể hiện sự trưởng thành
- **Kết thúc**: Đạt được mục tiêu nhưng mở ra chương mới

### 2. ĐỀ TÀI KINH ĐIỂN
- **Tu tiên/Tu luyện**: Nhân vật tu luyện để đạt đến cảnh giới cao hơn
- **Trọng sinh/Xuyên việt**: Nhân vật được sinh lại hoặc xuyên qua thế giới khác
- **Hệ thống**: Có hệ thống hỗ trợ giúp nhân vật trở nên mạnh mẽ
- **Đô thị tu tiên**: Kết hợp yếu tố hiện đại với tu luyện cổ điển
- **Dị năng**: Nhân vật có khả năng đặc biệt trong thế giới hiện đại

### 3. PHONG CÁCH NGÔN NGỮ
- Sử dụng từ ngữ trang trọng, có tính chất cổ điển
- Mô tả chi tiết về cảnh quan, khí thế
- Nhấn mạnh vào "khí chất", "thiên tài", "định mệnh"
- Sử dụng các thuật ngữ như: "tiền bối", "hậu sinh", "đạo hữu"

### 4. YẾU TỐ ĐẶC TRƯNG
- **Phân cấp rõ ràng**: Có hệ thống cấp bậc, tu vi
- **Tôn sư trọng đạo**: Quan hệ thầy trò được coi trọng
- **Nhân quả báo ứng**: Hành động tốt/xấu đều có hậu quả
- **Gia tộc/tông môn**: Yếu tố gia đình, dòng họ quan trọng

### 5. CÁCH TRIỂN KHAI CỐT TRUYỆN
- Bắt đầu từ nhân vật yếu đuối, bị khinh thường
- Gặp được cơ duyên (bảo vật, cao nhân, hệ thống)
- Từng bước trở nên mạnh mẽ, đánh bại kẻ thù
- Khám phá bí mật về thân thế, sứ mệnh
- Đối mặt với thử thách lớn nhất, cứu thế giới/gia tộc

## YêU CẦU VIẾT TRUYỆN
Hãy tạo ra một câu chuyện mở đầu theo phong cách Trung Quốc cho nhân vật ${gameSettings.characterName}. 

Câu chuyện cần:
1. **Khởi đầu khó khăn**: Nhân vật gặp nghịch cảnh, bị khinh thường
2. **Yếu tố bí ẩn**: Có dấu hiệu về tiềm năng ẩn giấu
3. **Cơ duyên đầu tiên**: Gặp được điều gì đó thay đổi vận mệnh
4. **Mục tiêu rõ ràng**: Đặt ra mục tiêu tu luyện/trả thù/cứu người
5. **Kết thúc mở**: Để lại tò mò cho chương tiếp theo

**Độ dài**: 800-1200 từ
**Giọng điệu**: Trang trọng, có chút cổ điển
**Ngôi kể**: Ngôi thứ ba, tập trung vào nhân vật chính
`;
}
