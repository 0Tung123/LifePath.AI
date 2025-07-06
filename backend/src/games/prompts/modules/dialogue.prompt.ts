// Dialogue System Module - Handles character interactions and speech patterns
// Based on GameSettingsDto.characterName and NPC entity interactions
export const buildDialoguePrompt = (characterName: string): string => {
  return `
## ĐỊNH DẠNG ĐỐI THOẠI BẮT BUỘC
Để tăng tính tương tác và sống động, ngươi PHẢI tuân thủ định dạng đối thoại sau:

### ĐỊNH DẠNG CHUẨN CHO LỜI THOẠI
- **Tên nhân vật nói**: "Nội dung lời nói"
- **Ví dụ**: Lôi Đình: "Ta lang bạt giang hồ, mục đích duy nhất là truy tìm dấu vết của Thiết Huyết Bang."
- **${characterName}**: "Lôi Đình huynh... tại sao huynh lại ở đây?"

### YÊU CẦU VỀ ĐỐI THOẠI
1. **Tỷ lệ đối thoại**: Mỗi đoạn văn PHẢI có ít nhất 40% là đối thoại giữa các nhân vật
2. **Tính tự nhiên**: Đối thoại phải tự nhiên, phù hợp với tính cách và hoàn cảnh
3. **Tránh mô tả dài**: Tránh mô tả hành động quá dài mà thiếu tương tác
4. **Ưu tiên tương tác**: Ưu tiên tạo ra cuộc trò chuyện có ý nghĩa thay vì chỉ mô tả cảnh vật
5. **Cá tính riêng**: Mỗi NPC phải có cách nói riêng biệt, phản ánh tính cách và xuất thân

### NGUYÊN TẮC PHÁT TRIỂN NHÂN VẬT QUA ĐỐI THOẠI
- **Tiết lộ thông tin**: Sử dụng đối thoại để tiết lộ thông tin về thế giới và nhân vật
- **Xây dựng mối quan hệ**: Thể hiện mối quan hệ giữa các nhân vật qua cách nói chuyện
- **Tạo xung đột**: Sử dụng đối thoại để tạo ra tension và xung đột
- **Phát triển cốt truyện**: Đẩy cốt truyện tiến triển thông qua cuộc hội thoại

### CÁC LOẠI ĐỐI THOẠI CHÍNH
1. **Đối thoại thông tin**: Cung cấp thông tin về thế giới, nhiệm vụ, lore
2. **Đối thoại cảm xúc**: Thể hiện cảm xúc, mối quan hệ giữa các nhân vật
3. **Đối thoại hành động**: Dẫn dắt đến các hành động, quyết định quan trọng
4. **Đối thoại xung đột**: Tạo ra căng thẳng, tranh cãi, đối đầu
5. **Đối thoại hài hước**: Giảm căng thẳng, tạo không khí thoải mái`;
};
