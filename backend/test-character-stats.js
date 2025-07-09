// Test file to demonstrate the new character stats system
const { GameService } = require('./dist/games/games.service');

// Mock data for testing
const testBackgrounds = [
  'Tôi là một chiến binh đã từng phục vụ trong quân đội hoàng gia',
  'Tôi là một pháp sư nghiên cứu về magic cổ xưa',
  'Tôi là một sát thủ trong bóng tối',
  'Tôi là một thương gia giàu có',
  'Tôi là một nông dân bình thường',
  'Tôi là một quý tộc sinh ra trong cung điện',
];

const testWorlds = [
  'Thế giới tu tiên với các cửa phái lớn',
  'Thế giới fantasy với ma thuật và rồng',
  'Thế giới sci-fi trong tương lai',
  'Thế giới medieval lịch sử',
  'Thế giới hiện đại với siêu năng lực',
];

console.log('=== DEMO HỆ THỐNG CHỈ SỐ NHÂN VẬT MỚI ===\n');

// Simulate character generation
function simulateCharacterGeneration() {
  console.log('🎲 Tạo nhân vật với các tiểu sử khác nhau:\n');

  testBackgrounds.forEach((background, index) => {
    const world = testWorlds[index % testWorlds.length];
    console.log(`--- Nhân vật ${index + 1} ---`);
    console.log(`Tiểu sử: ${background}`);
    console.log(`Thế giới: ${world}`);

    // Simulate stat generation (would be done in GameService)
    const baseStats = {
      strength: 8 + Math.floor(Math.random() * 5),
      agility: 8 + Math.floor(Math.random() * 5),
      intelligence: 8 + Math.floor(Math.random() * 5),
      wisdom: 8 + Math.floor(Math.random() * 5),
      charisma: 8 + Math.floor(Math.random() * 5),
      constitution: 8 + Math.floor(Math.random() * 5),
      luck: 8 + Math.floor(Math.random() * 5),
    };

    // Apply background bonus
    const backgroundBonus = getBackgroundBonus(background);
    const worldBonus = getWorldBonus(world);

    Object.keys(backgroundBonus).forEach((key) => {
      if (key in baseStats) {
        baseStats[key] += backgroundBonus[key];
      }
    });

    Object.keys(worldBonus).forEach((key) => {
      if (key in baseStats) {
        baseStats[key] += worldBonus[key];
      }
    });

    // Calculate secondary stats
    const level = 1;
    const healthMax = Math.floor(baseStats.constitution * 8 + level * 12 + 50);
    const manaMax = Math.floor(
      baseStats.intelligence * 6 + baseStats.wisdom * 4 + level * 8 + 30,
    );
    const staminaMax = Math.floor(
      baseStats.constitution * 4 + baseStats.agility * 6 + level * 10 + 40,
    );

    console.log(`Chỉ số cơ bản:`);
    console.log(`  Sức mạnh: ${baseStats.strength}`);
    console.log(`  Nhanh nhẹn: ${baseStats.agility}`);
    console.log(`  Trí tuệ: ${baseStats.intelligence}`);
    console.log(`  Khôn ngoan: ${baseStats.wisdom}`);
    console.log(`  Quyến rũ: ${baseStats.charisma}`);
    console.log(`  Thể chất: ${baseStats.constitution}`);
    console.log(`  May mắn: ${baseStats.luck}`);
    console.log(`Chỉ số phụ:`);
    console.log(`  HP: ${healthMax}/${healthMax}`);
    console.log(`  MP: ${manaMax}/${manaMax}`);
    console.log(`  Stamina: ${staminaMax}/${staminaMax}`);
    console.log('');
  });
}

// Simulate level up
function simulateLevelUp() {
  console.log('⬆️ Mô phỏng Level Up:\n');

  let character = {
    strength: 10,
    agility: 12,
    intelligence: 14,
    wisdom: 11,
    charisma: 9,
    constitution: 13,
    luck: 8,
    level: 1,
    health: { current: 154, max: 154 },
    mana: { current: 132, max: 132 },
    stamina: { current: 114, max: 114 },
    experience: 0,
    nextLevelExp: 100,
  };

  console.log('--- Level 1 ---');
  console.log(`HP: ${character.health.current}/${character.health.max}`);
  console.log(`MP: ${character.mana.current}/${character.mana.max}`);
  console.log(`Stamina: ${character.stamina.current}/${character.stamina.max}`);
  console.log(
    `STR: ${character.strength}, AGI: ${character.agility}, INT: ${character.intelligence}`,
  );
  console.log(
    `WIS: ${character.wisdom}, CHA: ${character.charisma}, CON: ${character.constitution}, LUK: ${character.luck}`,
  );

  // Level up to 2
  character.level = 2;
  character.strength += 1;
  character.agility += 1;
  character.constitution += 1;

  const newHealthMax = Math.floor(
    character.constitution * 8 + character.level * 12 + 50,
  );
  const newManaMax = Math.floor(
    character.intelligence * 6 +
      character.wisdom * 4 +
      character.level * 8 +
      30,
  );
  const newStaminaMax = Math.floor(
    character.constitution * 4 +
      character.agility * 6 +
      character.level * 10 +
      40,
  );

  character.health.max = newHealthMax;
  character.health.current = newHealthMax;
  character.mana.max = newManaMax;
  character.mana.current = newManaMax;
  character.stamina.max = newStaminaMax;
  character.stamina.current = newStaminaMax;

  console.log('\n--- Level 2 (after level up) ---');
  console.log(
    `HP: ${character.health.current}/${character.health.max} (+${newHealthMax - 154})`,
  );
  console.log(
    `MP: ${character.mana.current}/${character.mana.max} (+${newManaMax - 132})`,
  );
  console.log(
    `Stamina: ${character.stamina.current}/${character.stamina.max} (+${newStaminaMax - 114})`,
  );
  console.log(
    `STR: ${character.strength}, AGI: ${character.agility}, INT: ${character.intelligence}`,
  );
  console.log(
    `WIS: ${character.wisdom}, CHA: ${character.charisma}, CON: ${character.constitution}, LUK: ${character.luck}`,
  );
}

function getBackgroundBonus(background) {
  const backgroundLower = background.toLowerCase();
  const bonus = {};

  if (
    backgroundLower.includes('chiến binh') ||
    backgroundLower.includes('warrior')
  ) {
    bonus.strength = 2;
    bonus.constitution = 2;
    bonus.agility = 1;
  } else if (
    backgroundLower.includes('pháp sư') ||
    backgroundLower.includes('mage')
  ) {
    bonus.intelligence = 3;
    bonus.wisdom = 2;
    bonus.constitution = -1;
  } else if (
    backgroundLower.includes('sát thủ') ||
    backgroundLower.includes('assassin')
  ) {
    bonus.agility = 3;
    bonus.intelligence = 1;
    bonus.luck = 1;
    bonus.strength = -1;
  } else if (
    backgroundLower.includes('quý tộc') ||
    backgroundLower.includes('noble')
  ) {
    bonus.charisma = 3;
    bonus.intelligence = 1;
    bonus.wisdom = 1;
    bonus.constitution = -1;
  } else if (
    backgroundLower.includes('thương gia') ||
    backgroundLower.includes('merchant')
  ) {
    bonus.charisma = 2;
    bonus.intelligence = 1;
    bonus.luck = 2;
  } else if (
    backgroundLower.includes('nông dân') ||
    backgroundLower.includes('farmer')
  ) {
    bonus.constitution = 2;
    bonus.strength = 1;
    bonus.wisdom = 1;
  }

  return bonus;
}

function getWorldBonus(world) {
  const worldLower = world.toLowerCase();
  const bonus = {};

  if (worldLower.includes('tu tiên') || worldLower.includes('cultivation')) {
    bonus.wisdom = 2;
    bonus.intelligence = 1;
    bonus.constitution = 1;
  } else if (worldLower.includes('fantasy') || worldLower.includes('magic')) {
    bonus.intelligence = 2;
    bonus.wisdom = 1;
    bonus.luck = 1;
  } else if (
    worldLower.includes('sci-fi') ||
    worldLower.includes('tương lai')
  ) {
    bonus.intelligence = 2;
    bonus.agility = 1;
    bonus.constitution = 1;
  } else if (
    worldLower.includes('medieval') ||
    worldLower.includes('lịch sử')
  ) {
    bonus.strength = 1;
    bonus.constitution = 1;
    bonus.wisdom = 1;
  }

  return bonus;
}

// Run the simulation
simulateCharacterGeneration();
simulateLevelUp();

console.log('\n=== TÍNH NĂNG MỚI ===');
console.log('✅ Chỉ số random (8-12) thay vì cố định 10');
console.log('✅ Bonus chỉ số dựa trên tiểu sử nhân vật');
console.log('✅ Bonus chỉ số dựa trên thế giới game');
console.log('✅ HP/MP/Stamina tính theo công thức động');
console.log('✅ Chỉ số tăng khi level up');
console.log('✅ HP/MP/Stamina tăng theo level và chỉ số');
console.log('✅ Hỗ trợ nhiều background và world khác nhau');
