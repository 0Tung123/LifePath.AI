// Game Mechanics Module - Handles complex game logic and calculations
// Based on GameStats, InventoryItem, Skill interfaces and Game entity fields
import {
  GameStats,
  InventoryItem,
  Skill,
} from '../../interfaces/game-content.interface';

export const buildCombatSystemPrompt = (
  playerStats: GameStats,
  enemyStats: any,
  environment: string,
): string => {
  return `
## HỆ THỐNG CHIẾN ĐẤU - COMBAT SYSTEM v1.0

### THÔNG TIN CHIẾN ĐẤU
**Stats người chơi**: ${JSON.stringify(playerStats, null, 2)}
**Stats kẻ thù**: ${JSON.stringify(enemyStats, null, 2)}
**Môi trường**: ${environment}

### QUY TẮC CHIẾN ĐẤU
1. **Tính toán sát thương**: Dựa trên Sức Mạnh, vũ khí, và kỹ năng
2. **Tính toán phòng thủ**: Dựa trên Thể Lực, giáp, và kỹ năng
3. **Tốc độ**: Quyết định ai tấn công trước
4. **Chính xác**: Khả năng trúng đích
5. **Tỷ lệ chí mạng**: Cơ hội gây sát thương gấp đôi

### CÔNG THỨC TÍNH TOÁN
- **Sát thương cơ bản**: Sức Mạnh + Vũ khí + Random(1-6)
- **Phòng thủ**: Thể Lực + Giáp + Kỹ năng phòng thủ
- **Sát thương thực tế**: Max(1, Sát thương cơ bản - Phòng thủ)
- **Chí mạng**: Nếu Random(1-100) <= Khéo Léo, sát thương x2

### YÊU CẦU PHẢN HỒI
- Mô tả chi tiết từng đòn tấn công
- Tính toán sát thương chính xác
- Cập nhật Sinh Lực của cả hai bên
- Kiểm tra điều kiện kết thúc chiến đấu
`;
};

export const buildSkillSystemPrompt = (
  currentSkills: Skill[],
  availableSkillPoints: number,
  worldType: string,
): string => {
  return `
## HỆ THỐNG KỸ NĂNG - SKILL SYSTEM v1.0

### THÔNG TIN KỸ NĂNG
**Kỹ năng hiện tại**: ${JSON.stringify(currentSkills, null, 2)}
**Điểm kỹ năng có sẵn**: ${availableSkillPoints}
**Thể loại thế giới**: ${worldType}

### QUY TẮC KỸ NĂNG
1. **Học kỹ năng mới**: Cần điểm kỹ năng hoặc thầy dạy
2. **Nâng cấp kỹ năng**: Cần luyện tập và kinh nghiệm
3. **Kỹ năng thụ động**: Luôn có hiệu lực
4. **Kỹ năng chủ động**: Cần kích hoạt và có thể tốn năng lượng

### CẤP ĐỘ THÀNH THẠO
- **Mới học** (0-25%): Hiệu quả thấp, có thể thất bại
- **Cơ bản** (26-50%): Hiệu quả trung bình
- **Thành thạo** (51-75%): Hiệu quả tốt
- **Chuyên gia** (76-90%): Hiệu quả cao
- **Đại sư** (91-100%): Hiệu quả tối đa, có thể có hiệu ứng đặc biệt

### LOẠI KỸ NĂNG THEO THỂ LOẠI
**Fantasy**: Phép thuật, Võ thuật, Luyện đan, Rèn đúc
**Modern**: Lập trình, Lái xe, Bắn súng, Y học
**Sci-fi**: Điều khiển robot, Hacking, Nghiên cứu, Chiến đấu không gian
`;
};

export const buildEconomySystemPrompt = (
  currentMoney: number,
  inventory: InventoryItem[],
  location: string,
): string => {
  return `
## HỆ THỐNG KINH TẾ - ECONOMY SYSTEM v1.0

### THÔNG TIN KINH TẾ
**Tiền hiện có**: ${currentMoney}
**Túi đồ**: ${JSON.stringify(inventory, null, 2)}
**Địa điểm**: ${location}

### QUY TẮC KINH TẾ
1. **Giá cả**: Thay đổi theo địa điểm và cung cầu
2. **Chất lượng**: Ảnh hưởng đến giá và hiệu quả
3. **Độ hiếm**: Vật phẩm hiếm có giá cao hơn
4. **Danh tiếng**: Ảnh hưởng đến giá mua/bán

### LOẠI GIAO DỊCH
- **Mua bán**: Trao đổi tiền và vật phẩm
- **Trao đổi**: Đổi vật phẩm lấy vật phẩm
- **Thuê**: Sử dụng tạm thời với phí
- **Đấu giá**: Cạnh tranh để có được vật phẩm

### TÍNH TOÁN GIÁ CẢ
- **Giá cơ bản**: Dựa trên loại và chất lượng vật phẩm
- **Hệ số địa điểm**: Thành phố x1.2, vùng sâu x0.8
- **Hệ số danh tiếng**: Danh tiếng cao được giảm giá
- **Hệ số cung cầu**: Vật phẩm khan hiếm tăng giá
`;
};

export const buildProgressionSystemPrompt = (
  currentLevel: number,
  experience: number,
  nextLevelExp: number,
): string => {
  return `
## HỆ THỐNG TIẾN BỘ - PROGRESSION SYSTEM v1.0

### THÔNG TIN TIẾN BỘ
**Cấp độ hiện tại**: ${currentLevel}
**Kinh nghiệm hiện tại**: ${experience}
**Kinh nghiệm cần cho cấp tiếp theo**: ${nextLevelExp}

### QUY TẮC TIẾN BỘ
1. **Lên cấp**: Tăng stats và mở khóa kỹ năng mới
2. **Kinh nghiệm**: Nhận từ chiến đấu, hoàn thành nhiệm vụ, khám phá
3. **Điểm thuộc tính**: Mỗi cấp nhận được điểm để phân bổ
4. **Kỹ năng mới**: Một số kỹ năng chỉ mở khóa ở cấp độ nhất định

### CÔNG THỨC KINH NGHIỆM
- **Chiến đấu**: Exp = Enemy Level × 10 × Difficulty Modifier
- **Nhiệm vụ**: Exp = Quest Difficulty × 50
- **Khám phá**: Exp = Location Danger × 25
- **Tương tác xã hội**: Exp = Relationship Change × 5

### PHẦN THƯỞNG LÊN CẤP
- **+2 điểm thuộc tính** để phân bổ tự do
- **+1 điểm kỹ năng** để học hoặc nâng cấp kỹ năng
- **Mở khóa kỹ năng mới** (nếu đủ điều kiện)
- **Tăng Sinh Lực tối đa** (+10 mỗi cấp)
`;
};
