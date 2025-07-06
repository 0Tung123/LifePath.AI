// Style and Genre Specialization Module
// Based on GameSettingsDto.additionalSettings.style field
import { GameSettingsDto } from '../../dto/create-game.dto';

export const buildStylePrompt = (gameSettings: GameSettingsDto): string => {
  // Safely get the style value and ensure it's a string
  const styleValue = gameSettings.additionalSettings?.style;
  const style = typeof styleValue === 'string' ? styleValue.toLowerCase() : '';
  const isKoreanStyle =
    style.includes('hàn') ||
    style.includes('han') ||
    style.includes('hunter') ||
    style.includes('murim') ||
    style.includes('hồi quy') ||
    style.includes('học đường');

  return `
## CHUYÊN MÔN THỂ LOẠI: PHONG CÁCH TRUNG & HÀN
${
  isKoreanStyle
    ? `
### PHONG CÁCH HÀN QUỐC (Hầm Ngục, Hồi Quy, Võ Lâm, Học Đường...)
**Văn Phong**: Thẳng thắn, trực diện, hiện đại, nhịp độ nhanh. Tập trung mạnh vào hành động, hệ thống (cửa sổ trạng thái, kỹ năng), và diễn biến nội tâm phức tạp của nhân vật chính.

**Cách Xưng Hô** (Cực kỳ quan trọng):
- **Bối cảnh Võ Lâm (Murim)**: "Tại hạ", "tiểu nhân", "tiền bối", "hậu bối", "đại nhân", "tiểu thư", "thiếu chủ"
- **Bối cảnh Hiện Đại (Hunter, Hồi quy, Học đường)**: Cách xưng hô rất gần gũi và đời thường. "Tôi", "cậu", "anh", "cô ấy", "gã đó", "tên khốn đó", "con nhỏ đó". Ít dùng "ngươi", "hắn", "nàng" hơn so với phong cách Trung Quốc
- **Thể loại Tổng tài**: "Anh - em", "tôi - cô", "giám đốc", "thư ký Kim"

**Tư Duy Nhân Vật**: Thường thực dụng, toan tính, bị ám ảnh bởi quá khứ (đối với thể loại hồi quy/tái sinh), khao khát báo thù hoặc thay đổi một sai lầm định mệnh. Luôn tìm cách khai thác hệ thống để trở nên mạnh nhất.

**Đặc Trưng Thể Loại**:
- **Hunter/Dungeon**: Hệ thống cấp độ, kỹ năng, guild, raid boss
- **Hồi Quy/Regression**: Kiến thức tương lai, thay đổi số phận, báo thù
- **Murim**: Võ công, nội lực, môn phái, giang hồ
- **Học Đường**: Bullying, hierarchy, romance, coming of age`
    : `
### PHONG CÁCH TRUNG QUỐC (Tiên Hiệp, Huyền Huyễn, Đô Thị, Tổng Tài...)
**Văn Phong**: Hào hùng, hoa mỹ, có phần cổ kính. Thường sử dụng các từ ngữ và thành ngữ Hán Việt. Mô tả chi tiết về cảnh giới tu luyện, pháp bảo, linh khí, đan dược, và các trận pháp phức tạp.

**Cách Xưng Hô** (Cực kỳ quan trọng):
- **Nhân vật quyền cao/lớn tuổi/cổ xưa**: "Bản tọa", "lão phu", "bổn cô nương", "bổn thiếu gia"
- **Giao tiếp trang trọng**: "Đạo hữu", "tiểu hữu", "các hạ", "tiền bối"
- **Xưng hô thông thường**: "Ngươi", "hắn", "nàng", "tiểu tử", "nha đầu", "cô nương", "công tử"
- **Thể loại Tổng tài/Đô thị**: "Tôi - em", "anh - em", "chủ tịch", "phu nhân"

**Tư Duy Nhân Vật**: Thường trọng nhân quả, cơ duyên, khí phách ngút trời, không chịu khuất phục, sát phạt quyết đoán, có thù tất báo.

**Đặc Trưng Thể Loại**:
- **Tiên Hiệp**: Tu luyện, đan dược, pháp bảo, thiên kiếp, thăng tiên
- **Huyền Huyễn**: Dị năng, hệ thống, không gian, trọng sinh
- **Đô Thị**: Tổng tài, hào môn, âm mưu, tình yêu
- **Võ Hiệp**: Giang hồ, võ công, chính tà, nghĩa khí`
}`;
};
