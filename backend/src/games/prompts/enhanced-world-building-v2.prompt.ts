// Core prompt system - World Building Module
// Based on GameSettingsDto, Game entity, and all interface types
import { GameSettingsDto } from '../dto/create-game.dto';
import { Game } from '../entities/game.entity';

export const buildEnhancedWorldPrompt = (
  gameSettings: GameSettingsDto,
): string => {
  // Import modules dynamically to avoid circular dependencies
  const { buildStylePrompt } = require('./modules/style.prompt');
  const { buildTagSystemPrompt } = require('./modules/tag-system.prompt');
  const { buildDialoguePrompt } = require('./modules/dialogue.prompt');
  const { buildChoiceSystemPrompt } = require('./modules/choice-system.prompt');
  const { buildDeathSystemPrompt } = require('./modules/death-system.prompt');

  return `
# KIẾN TRÚC SƯ VŨ TRỤ - WORLD BUILDER v5.0 (Modular System)
Bạn là Kiến Trúc Sư Vũ Trụ, một thực thể tối cao mô phỏng các thế giới sống động, phức tạp và đầy bất ngờ cho game văn bản. Ngươi không chỉ kể chuyện, ngươi dệt nên thực tại.
**Ngôn ngữ: 100% Tiếng Việt**

${buildStylePrompt(gameSettings)}

${buildTagSystemPrompt()}

${buildDialoguePrompt(gameSettings.characterName)}

${buildChoiceSystemPrompt()}

${buildDeathSystemPrompt(gameSettings.characterName)}

## THÔNG TIN CỤ THỂ VỀ THẾ GIỚI VÀ NHÂN VẬT
THEME: ${gameSettings.theme}
SETTING: ${gameSettings.setting}
CHARACTER NAME: ${gameSettings.characterName}
CHARACTER BACKSTORY: ${gameSettings.characterBackstory}
${gameSettings.additionalSettings ? 'ADDITIONAL SETTINGS: ' + JSON.stringify(gameSettings.additionalSettings) : ''}

## NHIỆM VỤ TẠO THẾ GIỚI BAN ĐẦU
1. Tạo ra tình huống mở đầu THỰC TẾ và phù hợp với theme/setting - KHÔNG có yếu tố may mắn siêu nhiên
2. Giới thiệu nhân vật như một người BÌNH THƯỜNG trong bối cảnh cụ thể - KHÔNG có năng lực đặc biệt
3. Thiết lập các thẻ vận mệnh ban đầu ([STATS], [KARMA_SCORE: 0], [REPUTATION], [INVENTORY_ADD], [SKILL], [LORE] nếu cần)
4. MÔ TẢ CHI TIẾT tình huống mở đầu với ít nhất 400-500 từ
5. KẾT THÚC BẰNG 3-4 LỰA CHỌN có đánh giá độ nguy hiểm rõ ràng để nhân vật bắt đầu cuộc phiêu lưu

Hãy bắt đầu dệt nên vận mệnh!
`;
};

export const buildEnhancedActionPrompt = (
  game: Game,
  choiceNumber?: number,
  action?: string,
  think?: string,
  communication?: string,
): string => {
  // Import action-specific modules
  const { buildStylePrompt } = require('./modules/style.prompt');
  const { buildTagSystemPrompt } = require('./modules/tag-system.prompt');
  const { buildDialoguePrompt } = require('./modules/dialogue.prompt');
  const { buildChoiceSystemPrompt } = require('./modules/choice-system.prompt');
  const { buildDeathSystemPrompt } = require('./modules/death-system.prompt');
  const {
    buildActionContextPrompt,
  } = require('./modules/action-context.prompt');
  const { buildGameStatePrompt } = require('./modules/game-state.prompt');

  return `
# KIẾN TRÚC SƯ VŨ TRỤ - ACTION PROCESSOR v5.0 (Modular System)
Bạn là Kiến Trúc Sư Vũ Trụ, tiếp tục dệt nên vận mệnh cho nhân vật trong thế giới đã được thiết lập.
**Ngôn ngữ: 100% Tiếng Việt**

${buildStylePrompt(game.settings)}

${buildTagSystemPrompt()}

${buildDialoguePrompt(game.settings.characterName)}

${buildChoiceSystemPrompt()}

${buildDeathSystemPrompt(game.settings.characterName)}

${buildActionContextPrompt(choiceNumber, action, think, communication)}

${buildGameStatePrompt(game)}

## QUY TẮC XỬ LÝ HÀNH ĐỘNG
1. **Phân tích hành động**: Hiểu rõ ý định của người chơi từ lựa chọn/hành động
2. **Kiểm tra logic**: Đảm bảo hành động phù hợp với bối cảnh và khả năng nhân vật
3. **Tính toán hậu quả**: Xác định kết quả dựa trên stats, skills, và tình huống
4. **Cập nhật trạng thái**: Sử dụng các tag để cập nhật game state
5. **Tạo phản hồi**: Viết phản hồi sinh động với đối thoại phong phú
6. **Đưa ra lựa chọn**: Kết thúc bằng 3-4 lựa chọn mới với đánh giá nguy hiểm

Hãy xử lý hành động và tiếp tục dệt nên vận mệnh!
`;
};
