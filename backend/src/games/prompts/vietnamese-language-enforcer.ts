/**
 * VIETNAMESE LANGUAGE ENFORCER
 * Utility để đảm bảo AI luôn trả lời bằng tiếng Việt
 */

export const VIETNAMESE_LANGUAGE_REQUIREMENT = `
## ⚠️ YÊU CẦU BẮT BUỘC VỀ NGÔN NGỮ - VIETNAMESE ONLY
**QUAN TRỌNG NHẤT**: Bạn PHẢI viết toàn bộ nội dung bằng TIẾNG VIỆT.

### 🇻🇳 Quy tắc ngôn ngữ BẮNG BUỘC:
- ✅ **100% tiếng Việt**: Tất cả narration, đối thoại, mô tả, giải thích
- ✅ **Từ vựng phong phú**: Sử dụng từ ngữ đa dạng, sinh động của tiếng Việt
- ✅ **Ngữ pháp chính xác**: Câu văn đúng ngữ pháp tiếng Việt
- ✅ **Phù hợp văn hóa**: Cách diễn đạt tự nhiên của người Việt
- ✅ **Dấu câu chuẩn**: Sử dụng dấu câu tiếng Việt chính xác

### ❌ TUYỆT ĐỐI CẤM:
- ❌ **KHÔNG được sử dụng tiếng Anh** trong bất kỳ phần nào
- ❌ **KHÔNG được sử dụng tiếng Trung, tiếng Hàn** hay ngôn ngữ khác
- ❌ **KHÔNG được trộn lẫn ngôn ngữ** trong cùng một câu
- ❌ **KHÔNG được để nguyên thuật ngữ nước ngoài** không dịch
- ❌ **KHÔNG được viết tắt bằng tiếng Anh** (như "OK", "vs", "etc")

### 📝 Xử lý thuật ngữ:
- **Game terms**: "level up" → "nâng cấp", "skill" → "kỹ năng", "quest" → "nhiệm vụ"
- **Fantasy terms**: "mana" → "ma lực", "HP" → "sinh lực", "MP" → "ma lực"
- **System terms**: "status" → "trạng thái", "buff" → "tăng cường", "debuff" → "suy yếu"
- **Cultivation terms**: Có thể dùng "tu luyện", "linh khí", "đan dược" (đã Việt hóa)

### 🎯 Ví dụ ĐÚNG và SAI:
**✅ ĐÚNG:**
- "Anh ta nâng cấp kỹ năng kiếm thuật lên cấp độ cao hơn."
- "Sinh lực của nhân vật đã cạn kiệt sau trận chiến."
- "Hệ thống thông báo: Bạn đã hoàn thành nhiệm vụ!"

**❌ SAI:**
- "Anh ta level up skill kiếm thuật lên level cao hơn." (trộn ngôn ngữ)
- "HP của character đã hết sau battle." (dùng thuật ngữ tiếng Anh)
- "System notification: Quest completed!" (toàn bộ tiếng Anh)

---
**LƯU Ý**: Đây là yêu cầu BẮT BUỘC, không phải gợi ý. Mọi vi phạm sẽ được coi là lỗi nghiêm trọng.
`;

/**
 * Thêm yêu cầu tiếng Việt vào prompt
 */
export function enforceVietnameseLanguage(prompt: string): string {
  return `${prompt}

${VIETNAMESE_LANGUAGE_REQUIREMENT}`;
}

/**
 * Kiểm tra xem prompt đã có yêu cầu tiếng Việt chưa
 */
export function hasVietnameseRequirement(prompt: string): boolean {
  return (
    prompt.includes('YÊU CẦU BẮT BUỘC VỀ NGÔN NGỮ') ||
    prompt.includes('VIETNAMESE ONLY') ||
    prompt.includes('100% tiếng Việt')
  );
}

/**
 * Validate response có tuân thủ tiếng Việt không
 */
export function validateVietnameseResponse(response: string): {
  isValid: boolean;
  violations: string[];
  score: number;
} {
  const violations: string[] = [];
  let score = 100;

  // Check for English words (basic check)
  const englishWords = response.match(/\b[a-zA-Z]{3,}\b/g) || [];
  const commonEnglishWords = [
    'the',
    'and',
    'or',
    'but',
    'if',
    'then',
    'when',
    'where',
    'how',
    'what',
    'who',
    'level',
    'skill',
    'quest',
    'system',
    'status',
    'buff',
    'debuff',
    'HP',
    'MP',
    'character',
    'player',
    'game',
    'battle',
    'fight',
    'magic',
    'power',
    'ability',
  ];

  const foundEnglishWords = englishWords.filter((word) =>
    commonEnglishWords.includes(word.toLowerCase()),
  );

  if (foundEnglishWords.length > 0) {
    violations.push(`Phát hiện từ tiếng Anh: ${foundEnglishWords.join(', ')}`);
    score -= foundEnglishWords.length * 10;
  }

  // Check for mixed language sentences
  const sentences = response.split(/[.!?]/);
  sentences.forEach((sentence, index) => {
    const hasVietnamese =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        sentence,
      );
    const hasEnglish = /[a-zA-Z]{3,}/.test(sentence);

    if (hasVietnamese && hasEnglish) {
      violations.push(
        `Câu ${index + 1} trộn lẫn ngôn ngữ: "${sentence.trim()}"`,
      );
      score -= 15;
    }
  });

  return {
    isValid: violations.length === 0,
    violations,
    score: Math.max(0, score),
  };
}

/**
 * Suggest Vietnamese alternatives for common English terms
 */
export const VIETNAMESE_ALTERNATIVES = {
  // Game terms
  level: 'cấp độ',
  'level up': 'nâng cấp',
  skill: 'kỹ năng',
  quest: 'nhiệm vụ',
  mission: 'sứ mệnh',
  system: 'hệ thống',
  status: 'trạng thái',
  buff: 'tăng cường',
  debuff: 'suy yếu',
  character: 'nhân vật',
  player: 'người chơi',
  game: 'trò chơi',
  battle: 'trận chiến',
  fight: 'chiến đấu',
  magic: 'phép thuật',
  power: 'sức mạnh',
  ability: 'khả năng',

  // Stats
  HP: 'sinh lực',
  MP: 'ma lực',
  ATK: 'sát thương',
  DEF: 'phòng thủ',
  SPD: 'tốc độ',
  STR: 'sức mạnh',
  AGI: 'nhanh nhẹn',
  INT: 'trí tuệ',
  LUK: 'may mắn',

  // Common phrases
  OK: 'được rồi',
  vs: 'đối đầu với',
  etc: 'vân vân',
  boss: 'trùm cuối',
  item: 'vật phẩm',
  equipment: 'trang bị',
  weapon: 'vũ khí',
  armor: 'giáp',
  potion: 'thuốc',
  spell: 'phép thuật',
} as const;

/**
 * Auto-replace English terms with Vietnamese alternatives
 */
export function replaceEnglishTerms(text: string): string {
  let result = text;

  Object.entries(VIETNAMESE_ALTERNATIVES).forEach(([english, vietnamese]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, vietnamese);
  });

  return result;
}

export default {
  VIETNAMESE_LANGUAGE_REQUIREMENT,
  enforceVietnameseLanguage,
  hasVietnameseRequirement,
  validateVietnameseResponse,
  VIETNAMESE_ALTERNATIVES,
  replaceEnglishTerms,
};
