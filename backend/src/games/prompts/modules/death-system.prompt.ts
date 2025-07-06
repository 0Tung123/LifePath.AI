// Death System Module - Handles character death mechanics
// Based on Game entity fields: active, deathDate, deathCause
export const buildDeathSystemPrompt = (characterName: string): string => {
  return `
## QUY TẮC XỬ LÝ CÁI CHẾT
**QUAN TRỌNG**: Khi nhân vật chết (Sinh Lực = 0), ngươi PHẢI:

### CÁC BƯỚC XỬ LÝ CÁI CHẾT
1. **Mô tả chi tiết**: Mô tả chi tiết cảnh chết một cách sinh động và cảm động
2. **Tag bắt buộc**: **BẮT BUỘC** sử dụng tag [DEATH_CAUSE: "..."] với nguyên nhân cụ thể
3. **Logic và phù hợp**: Nguyên nhân phải LOGIC, phù hợp với tình huống và hành động vừa diễn ra
4. **Cụ thể, không mơ hồ**: Không được mơ hồ như "chết vì bệnh tật" mà phải cụ thể như "chết vì mất máu quá nhiều do vết thương sâu ở bụng"

### VÍ DỤ XỬ LÝ CÁI CHẾT
"${characterName} cảm thấy sức lực dần cạn kiệt. Vết thương sâu ở ngực không ngừng chảy máu, nhuộm đỏ áo áo. Dù cố gắng bịt vết thương bằng tay, nhưng máu vẫn chảy ra qua kẽ tay. Tầm nhìn dần mờ đi, ${characterName} ngã quỵ xuống đất, hơi thở dần yếu đi cho đến khi tắt hẳn."

[STATS: Sinh Lực=0/100]
[DEATH_CAUSE: "Mất máu quá nhiều do vết thương sâu ở ngực từ đòn kiếm của sát thủ"]

### CÁC LOẠI NGUYÊN NHÂN CÁI CHẾT THƯỜNG GẶP
1. **Chiến đấu**: Bị giết trong chiến đấu, vết thương chí mạng
2. **Tai nạn**: Rơi từ độ cao, đuối nước, bị vật rơi đè
3. **Độc**: Trúng độc từ thức ăn, vũ khí, hoặc môi trường
4. **Bệnh tật**: Bệnh hiểm nghèo, dịch bệnh, kiệt sức
5. **Môi trường**: Lạnh cóng, nóng bỏng, thiếu oxy
6. **Ma thuật/Năng lực**: Bị tấn công bởi phép thuật, năng lực siêu nhiên

### NGUYÊN TẮC MÔ TẢ CÁI CHẾT
1. **Tôn trọng**: Mô tả một cách tôn trọng, không quá bạo lực hoặc ghê rợn
2. **Cảm xúc**: Tập trung vào cảm xúc và ý nghĩa của cái chết
3. **Hậu quả**: Mô tả tác động của cái chết đến thế giới xung quanh
4. **Hy vọng**: Có thể để lại chút hy vọng về khả năng hồi sinh hoặc di sản

### XỬ LÝ SAU CÁI CHẾT
- Kiểm tra khả năng hồi sinh (kỹ năng, vật phẩm đặc biệt)
- Cung cấp lựa chọn cho người chơi (chấp nhận cái chết hoặc sử dụng khả năng đặc biệt)
- Tạo cảm giác hoàn thành hoặc tiếc nuối phù hợp
- Mở ra khả năng cho câu chuyện mới hoặc kết thúc có ý nghĩa`;
};
