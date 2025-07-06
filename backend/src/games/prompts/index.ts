// Central Prompt System Index - Exports all prompt functions
// This file serves as the main entry point for all AI prompts in the system

// Core World Building Prompts
export {
  buildEnhancedWorldPrompt,
  buildEnhancedActionPrompt,
} from './enhanced-world-building-v2.prompt';

// Character Creation Prompts
export {
  buildBackstoryAnalysisPrompt,
  buildTemplateGenerationPrompt,
  buildStatValidationPrompt,
} from './character-creation.prompt';

// NPC System Prompts
export {
  buildNPCCreationPrompt,
  buildNPCInteractionPrompt,
  buildNPCRelationshipPrompt,
} from './npc-system.prompt';

// Modular Components
export { buildStylePrompt } from './modules/style.prompt';
export { buildTagSystemPrompt } from './modules/tag-system.prompt';
export { buildDialoguePrompt } from './modules/dialogue.prompt';
export { buildChoiceSystemPrompt } from './modules/choice-system.prompt';
export { buildDeathSystemPrompt } from './modules/death-system.prompt';
export { buildActionContextPrompt } from './modules/action-context.prompt';
export { buildGameStatePrompt } from './modules/game-state.prompt';

// Game Mechanics
export {
  buildCombatSystemPrompt,
  buildSkillSystemPrompt,
  buildEconomySystemPrompt,
  buildProgressionSystemPrompt,
} from './modules/game-mechanics.prompt';

// Specialized Prompts for Advanced Features
export const buildLifeSummaryPrompt = (
  characterName: string,
  gameHistory: any[],
  finalStats: any,
  achievements: any[],
): string => {
  return `
# TẠO TÓM TẮT CUỘC ĐỜI - LIFE SUMMARY GENERATOR v1.0
Bạn là một nhà sử học chuyên viết tiểu sử và tóm tắt cuộc đời của các nhân vật.
**Ngôn ngữ: 100% Tiếng Việt**

## THÔNG TIN NHÂN VẬT
**Tên**: ${characterName}
**Lịch sử game**: ${JSON.stringify(gameHistory.slice(-10), null, 2)}
**Stats cuối**: ${JSON.stringify(finalStats, null, 2)}
**Thành tựu**: ${JSON.stringify(achievements, null, 2)}

## NHIỆM VỤ TẠO TÓM TẮT
Tạo một bản tóm tắt cuộc đời đầy đủ và cảm động cho nhân vật, bao gồm:

1. **Khởi đầu**: Xuất thân và những ngày đầu
2. **Hành trình**: Các sự kiện quan trọng trong cuộc đời
3. **Thành tựu**: Những gì nhân vật đã đạt được
4. **Mối quan hệ**: Những người quan trọng trong cuộc đời
5. **Di sản**: Những gì nhân vật để lại cho thế giới
6. **Kết thúc**: Cách cuộc đời kết thúc (nếu đã chết)

## ĐỊNH DẠNG PHẢN HỒI
\`\`\`json
{
  "lifeSummary": {
    "characterName": "${characterName}",
    "totalYears": "Số năm sống (ước tính)",
    "majorEvents": [
      "Sự kiện quan trọng 1",
      "Sự kiện quan trọng 2"
    ],
    "finalStats": "Tóm tắt stats cuối cùng",
    "achievements": [
      "Thành tựu 1",
      "Thành tựu 2"
    ],
    "relationships": {
      "allies": ["Đồng minh 1", "Đồng minh 2"],
      "enemies": ["Kẻ thù 1", "Kẻ thù 2"],
      "loved_ones": ["Người yêu thương 1"]
    },
    "legacy": "Di sản để lại cho thế giới",
    "epitaph": "Câu khắc trên bia mộ hoặc lời tưởng nhớ"
  },
  "narrative": "Câu chuyện cuộc đời dài và chi tiết, viết theo phong cách văn học"
}
\`\`\`

Hãy tạo ra một bản tóm tắt cuộc đời đầy cảm xúc và ý nghĩa!
`;
};

export const buildResurrectionPrompt = (
  characterName: string,
  deathCause: string,
  availableResurrectionMethods: string[],
): string => {
  return `
# HỆ THỐNG HỒI SINH - RESURRECTION SYSTEM v1.0
Bạn là một thực thể siêu nhiên có quyền năng quyết định số phận sống chết.
**Ngôn ngữ: 100% Tiếng Việt**

## THÔNG TIN CÁI CHẾT
**Nhân vật**: ${characterName}
**Nguyên nhân chết**: ${deathCause}
**Phương pháp hồi sinh có sẵn**: ${availableResurrectionMethods.join(', ')}

## NHIỆM VỤ XỬ LÝ HỒI SINH
1. **Đánh giá khả năng**: Liệu có thể hồi sinh không?
2. **Xác định hình phạt**: Hồi sinh có giá phải trả
3. **Mô tả quá trình**: Quá trình hồi sinh diễn ra như thế nào
4. **Cập nhật trạng thái**: Thay đổi stats sau hồi sinh

## CÁC LOẠI HỒI SINH
### HỒI QUY (Regression)
- Quay về thời điểm trước khi chết
- Giữ nguyên ký ức
- Có thể thay đổi quyết định

### TÁI SINH (Rebirth)
- Sinh lại với cơ thể mới
- Giữ một phần ký ức và kỹ năng
- Stats có thể thay đổi

### HỒI SINH (Resurrection)
- Sống lại với cơ thể cũ
- Có thể có hậu quả tiêu cực
- Stats bị giảm tạm thời

## ĐỊNH DẠNG PHẢN HỒI
\`\`\`json
{
  "resurrectionResult": {
    "isSuccessful": true/false,
    "method": "Phương pháp được sử dụng",
    "description": "Mô tả chi tiết quá trình hồi sinh",
    "penalties": {
      "statReductions": {"stat_name": -value},
      "temporaryEffects": ["Hiệu ứng tạm thời"],
      "permanentChanges": ["Thay đổi vĩnh viễn"]
    },
    "newStats": {"stat_name": value},
    "memories": "Ký ức được giữ lại hoặc mất đi",
    "consequences": "Hậu quả của việc hồi sinh"
  },
  "narrative": "Câu chuyện mô tả quá trình hồi sinh"
}
\`\`\`

Hãy xử lý việc hồi sinh một cách công bằng và thú vị!
`;
};
