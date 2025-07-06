// Action Context Module - Handles player action interpretation
// Based on GameActionDto fields: choiceNumber, action, think, communication
export const buildActionContextPrompt = (
  choiceNumber?: number,
  action?: string,
  think?: string,
  communication?: string,
): string => {
  let actionContext = '';

  if (choiceNumber) {
    actionContext = `
## HÀNH ĐỘNG CỦA NGƯỜI CHƠI
**Loại**: Lựa chọn từ menu
**Lựa chọn số**: ${choiceNumber}
**Hướng dẫn**: Người chơi đã chọn lựa chọn số ${choiceNumber} từ danh sách các lựa chọn có sẵn. Hãy thực hiện hành động tương ứng và mô tả kết quả một cách sinh động.`;
  } else if (action) {
    actionContext = `
## HÀNH ĐỘNG CỦA NGƯỜI CHƠI
**Loại**: Hành động tự do
**Nội dung**: "${action}"
**Hướng dẫn**: Người chơi đã nhập một hành động tự do. Hãy phân tích tính khả thi của hành động này dựa trên:
- Khả năng hiện tại của nhân vật (stats, skills)
- Bối cảnh tình huống hiện tại
- Logic của thế giới game
- Mức độ nguy hiểm và hậu quả có thể xảy ra`;
  } else if (think) {
    actionContext = `
## SUY NGHĨ CỦA NHÂN VẬT
**Loại**: Nội tâm/Suy nghĩ
**Nội dung**: "${think}"
**Hướng dẫn**: Người chơi đã chia sẻ suy nghĩ nội tâm của nhân vật. Hãy:
- Phản ánh suy nghĩ này trong mô tả nội tâm nhân vật
- Có thể ảnh hưởng đến cách nhân vật hành động tiếp theo
- Tạo ra những tình huống phù hợp với tâm trạng này
- Không thay đổi trực tiếp game state, chỉ ảnh hưởng đến narrative`;
  } else if (communication) {
    actionContext = `
## GIAO TIẾP CỦA NHÂN VẬT
**Loại**: Đối thoại/Giao tiếp
**Nội dung**: "${communication}"
**Hướng dẫn**: Người chơi muốn nhân vật nói hoặc giao tiếp điều gì đó. Hãy:
- Đưa lời nói này vào đối thoại của nhân vật
- Tạo phản ứng phù hợp từ các NPC xung quanh
- Có thể ảnh hưởng đến reputation hoặc mối quan hệ
- Đảm bảo phong cách nói phù hợp với setting và character`;
  }

  return actionContext;
};
