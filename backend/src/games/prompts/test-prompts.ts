/**
 * Test script for enhanced world-building prompts
 * 
 * Run with: npx ts-node test-prompts.ts
 */

import { buildEnhancedWorldPrompt, buildEnhancedActionPrompt } from './enhanced-world-building.prompt';

// Test game settings
const testGameSettings = {
  theme: 'Tiên Hiệp',
  setting: 'Thế giới tu tiên, nơi con người có thể tu luyện để đạt đến cảnh giới tiên nhân',
  characterName: 'Lý Tiểu Vân',
  characterBackstory: 'Một thiếu niên bình thường từ một gia tộc nhỏ, có khả năng cảm nhận linh khí tốt hơn người thường.',
  additionalSettings: {
    style: 'Trung Quốc',
    difficulty: 'medium',
    gameLength: 'long',
    combatStyle: 'balanced'
  }
};

// Test game object
const testGame = {
  settings: testGameSettings,
  characterStats: {
    'Tu Vi': 'Luyện Khí tầng một',
    'Chân Khí': '100/100',
    'Sinh Lực': '100/100',
    'Sức Mạnh': 15,
    'Nhanh Nhẹn': 12,
    'Trí Tuệ': 20
  },
  inventoryItems: [
    {
      name: 'Kiếm Gỗ',
      description: 'Một thanh kiếm gỗ dùng để luyện tập cơ bản',
      quantity: 1
    },
    {
      name: 'Đan Dược Tụ Khí',
      description: 'Giúp tăng tốc độ tu luyện trong thời gian ngắn',
      quantity: 3
    }
  ],
  characterSkills: [
    {
      name: 'Cơ Bản Kiếm Pháp',
      level: 1,
      description: 'Những đường kiếm cơ bản nhất'
    }
  ],
  storyHistory: [
    {
      type: 'story',
      content: 'Lý Tiểu Vân đang luyện tập kiếm pháp trong sân sau của gia tộc. Mồ hôi nhỏ giọt trên trán khi cậu cố gắng hoàn thiện những đường kiếm cơ bản.',
      timestamp: new Date()
    }
  ],
  currentChoices: [
    { text: '[AN TOÀN] Tiếp tục luyện tập kiếm pháp', number: 1 },
    { text: '[THẬN TRỌNG] Đi tìm sư phụ để xin chỉ dẫn', number: 2 },
    { text: '[NGUY HIỂM] Thử vận dụng chân khí vào kiếm pháp', number: 3 }
  ]
};

// Test initial prompt
console.log('=== TESTING INITIAL PROMPT ===');
const initialPrompt = buildEnhancedWorldPrompt(testGameSettings);
console.log(`Initial prompt length: ${initialPrompt.length} characters`);
console.log('First 500 characters:');
console.log(initialPrompt.substring(0, 500));
console.log('...');
console.log('Last 500 characters:');
console.log(initialPrompt.substring(initialPrompt.length - 500));
console.log('\n');

// Test action prompt
console.log('=== TESTING ACTION PROMPT ===');
const actionPrompt = buildEnhancedActionPrompt(testGame, 3); // Testing choice #3
console.log(`Action prompt length: ${actionPrompt.length} characters`);
console.log('First 500 characters:');
console.log(actionPrompt.substring(0, 500));
console.log('...');
console.log('Last 500 characters:');
console.log(actionPrompt.substring(actionPrompt.length - 500));

console.log('\n=== TESTS COMPLETED ===');