// Game State Module - Provides current game context to AI
// Based on Game Entity with all its relationships and json fields
import { Game } from '../../entities/game.entity';

export const buildGameStatePrompt = (game: Game): string => {
  // Get recent story history (last 3 entries)
  const recentHistory = game.storyHistory
    .slice(-3)
    .map((entry) => `[${entry.type.toUpperCase()}] ${entry.content}`)
    .join('\n');

  // Format current stats
  const statsDisplay = Object.entries(game.characterStats)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  // Format inventory
  const inventoryDisplay =
    game.inventoryItems.length > 0
      ? game.inventoryItems
          .map((item) => `${item.name} (${item.quantity})`)
          .join(', ')
      : 'Trống';

  // Format skills
  const skillsDisplay =
    game.characterSkills.length > 0
      ? game.characterSkills
          .map((skill) => {
            let skillText = skill.name;
            if (skill.level) skillText += ` (Cấp ${skill.level})`;
            if (skill.mastery) skillText += ` [${skill.mastery}]`;
            return skillText;
          })
          .join(', ')
      : 'Chưa có kỹ năng';

  // Format NPCs met
  const npcsDisplay =
    game.npcsMet && game.npcsMet.length > 0
      ? game.npcsMet.map((npc) => npc.name).join(', ')
      : 'Chưa gặp ai';

  return `
## TRẠNG THÁI GAME HIỆN TẠI

### THÔNG TIN NHÂN VẬT
**Tên**: ${game.settings.characterName}
**Theme**: ${game.settings.theme}
**Setting**: ${game.settings.setting}
**Backstory**: ${game.settings.characterBackstory}

### STATS HIỆN TẠI
${statsDisplay}

### TÚI ĐỒ
${inventoryDisplay}

### KỸ NĂNG
${skillsDisplay}

### KARMA & REPUTATION
**Karma Score**: ${game.karmaScore}
**Reputation**: ${
    game.reputation
      ? Object.entries(game.reputation)
          .map(([group, score]) => `${group}: ${score}`)
          .join(', ')
      : 'Chưa có'
  }

### NPC ĐÃ GẶP
${npcsDisplay}

### LỊCH SỬ GẦN ĐÂY
${recentHistory}

### TRẠNG THÁI SỐNG/CHẾT
**Trạng thái**: ${game.active ? 'Còn sống' : 'Đã chết'}
${game.deathCause ? `**Nguyên nhân chết**: ${game.deathCause}` : ''}
${game.deathDate ? `**Thời gian chết**: ${game.deathDate}` : ''}

### SỰ KIỆN QUAN TRỌNG
${
  game.importantEvents && game.importantEvents.length > 0
    ? game.importantEvents
        .slice(-3)
        .map((event) => `- ${event.title}: ${event.description}`)
        .join('\n')
    : 'Chưa có sự kiện quan trọng nào'
}

### THÀNH TỰU
${
  game.achievements && game.achievements.length > 0
    ? game.achievements
        .map(
          (achievement) => `- ${achievement.name}: ${achievement.description}`,
        )
        .join('\n')
    : 'Chưa có thành tựu nào'
}`;
};
