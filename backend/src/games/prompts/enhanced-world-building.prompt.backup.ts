/**
 * ENHANCED WORLD BUILDING PROMPT - BACKUP COMPATIBILITY
 * Tạm thời để maintain compatibility với games.service.ts
 */

import { GameSettingsDto } from '../dto/create-game.dto';
import { Game } from '../entities/game.entity';

export function buildEnhancedWorldPrompt(
  gameSettings: GameSettingsDto,
): string {
  // Tạm thời return một prompt đơn giản để maintain compatibility
  return `
# ENHANCED WORLD BUILDING - LIFEPATH.AI

## CHARACTER SETUP
- **Name**: ${gameSettings.characterName}
- **Background**: ${gameSettings.characterBackstory}
- **World**: ${gameSettings.setting}

## WORLD BUILDING PROMPT
Bạn là một AI chuyên gia tạo thế giới game. Hãy tạo ra một câu chuyện mở đầu hấp dẫn cho nhân vật ${gameSettings.characterName} với background ${gameSettings.characterBackstory} trong thế giới ${gameSettings.setting}.

Câu chuyện cần:
1. Giới thiệu nhân vật và bối cảnh
2. Tạo ra tình huống thú vị
3. Đưa ra 3-4 lựa chọn có ý nghĩa
4. Đảm bảo tính nhất quán với background

## OUTPUT FORMAT
Trả về JSON với format:
{
  "storyText": "Câu chuyện mở đầu...",
  "choices": [
    {
      "number": 1,
      "text": "Lựa chọn 1"
    }
  ],
  "stats": {
    "level": 1,
    "experience": 0,
    "health": 100,
    "mana": 50
  },
  "inventory": [],
  "skills": [],
  "lore": []
}
`;
}

export function buildEnhancedActionPrompt(
  game: Game,
  choiceNumber: number,
  action: string,
  think: string,
  communication: string,
): string {
  // Tạm thời return một prompt đơn giản để maintain compatibility
  return `
# ENHANCED ACTION PROMPT - LIFEPATH.AI

## GAME CONTEXT
- **Character**: ${game.settings.characterName}
- **Current Level**: ${game.characterStats.level}
- **Current Story**: ${game.currentPrompt}

## PLAYER ACTION
- **Choice Number**: ${choiceNumber}
- **Action**: ${action}
- **Think**: ${think}
- **Communication**: ${communication}

## ENHANCED ACTION INFO
${JSON.stringify((game as any).enhancedActionInfo || {}, null, 2)}

## TASK
Tiếp tục câu chuyện dựa trên hành động của người chơi. Đảm bảo:
1. Tính liên tục của câu chuyện
2. Phản ứng hợp lý với hành động
3. Tạo ra tình huống mới thú vị
4. Đưa ra lựa chọn tiếp theo

## OUTPUT FORMAT
Trả về JSON với format:
{
  "storyText": "Tiếp tục câu chuyện...",
  "choices": [
    {
      "number": 1,
      "text": "Lựa chọn 1"
    }
  ],
  "stats": {
    "level": ${game.characterStats.level},
    "experience": ${game.characterStats.experience},
    "health": ${game.characterStats.health},
    "mana": ${game.characterStats.mana}
  },
  "inventory": [],
  "skills": [],
  "lore": []
}
`;
}
