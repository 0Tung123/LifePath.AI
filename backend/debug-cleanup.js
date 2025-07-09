// Debug regex cleanup để tìm ra vấn đề
console.log('🔍 DEBUGGING REGEX CLEANUP');
console.log('='.repeat(50));

// Simulate một response thực tế từ AI
const sampleResponse = `Khánh Tùng đứng trên đỉnh núi Thiên Kiếm, gió rít gào bên tai. Mười năm trôi qua kể từ ngày sư phụ bí ẩn của y qua đời, để lại cho y tuyệt học 'Cửu Thiên Huyền Công' và lời dặn dò báo thù.

Giờ đây, y chỉ là một đệ tử ngoại môn tầm thường của Thiên Kiếm Phái, nơi mà kẻ thù của sư phụ y đang ẩn mình. Y siết chặt thanh kiếm gỗ trong tay, ánh mắt kiên định.

Hôm nay, y sẽ bắt đầu kế hoạch trả thù. Trước mắt y là ba con đường: luyện tập chăm chỉ, tìm kiếm cơ hội, hoặc thu thập thông tin.

Y nhìn về phía xa, nơi mà ký ức đau đớn về cái chết của sư phụ vẫn còn rõ nét. Quyết tâm trả thù càng lúc càng mạnh mẽ.

[STATS: Tu Vi="Luyện Khí tầng một", Chân Khí=150/150, Thể Lực=120/120]`;

function debugCleanupSteps(response) {
  console.log('📖 ORIGINAL RESPONSE:');
  console.log(response);
  console.log(`Length: ${response.length}`);

  // Step 1: Extract before tags
  let storyText = response;
  const firstTagMatch = response.match(
    /\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION|KARMA_SCORE|REPUTATION|WORLD_STATE|EVENT|NPC_UPDATE):/,
  );
  if (firstTagMatch && firstTagMatch.index !== undefined) {
    storyText = response.substring(0, firstTagMatch.index).trim();
  }

  console.log('\n🔄 STEP 1: After extracting before tags');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 2: JSON code blocks
  storyText = storyText.replace(/```json[\s\S]*?```/g, '');
  storyText = storyText.replace(/```[\s\S]*?```/g, '');

  console.log('\n🔄 STEP 2: After removing code blocks');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 3: JSON properties
  storyText = storyText.replace(/"choices":\s*\[[\s\S]*?\]/g, '');
  storyText = storyText.replace(/"stats":\s*\{[\s\S]*?\}/g, '');
  storyText = storyText.replace(/"inventory":\s*\[[\s\S]*?\]/g, '');
  storyText = storyText.replace(/"skills":\s*\[[\s\S]*?\]/g, '');
  storyText = storyText.replace(/"lore":\s*\[[\s\S]*?\]/g, '');
  storyText = storyText.replace(/"mana":\s*\{[\s\S]*?\}/g, '');
  storyText = storyText.replace(/"stamina":\s*\{[\s\S]*?\}/g, '');
  storyText = storyText.replace(/"experience":\s*\d+/g, '');
  storyText = storyText.replace(/"level":\s*\d+/g, '');
  storyText = storyText.replace(/"nextLevelExp":\s*\d+/g, '');

  console.log('\n🔄 STEP 3: After removing JSON properties');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 4: JSON objects
  storyText = storyText.replace(/\{[\s\S]*?"choices"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stats"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"inventory"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"skills"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"lore"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"mana"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stamina"[\s\S]*?\}/g, '');

  console.log('\n🔄 STEP 4: After removing JSON objects');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 5: Individual JSON properties
  storyText = storyText.replace(/^\s*"number":\s*\d+,?\s*$/gm, '');
  storyText = storyText.replace(/^\s*"text":\s*"[^"]*",?\s*$/gm, '');
  storyText = storyText.replace(
    /^\s*"consequences":\s*\[[\s\S]*?\],?\s*$/gm,
    '',
  );
  storyText = storyText.replace(/^\s*"current":\s*\d+,?\s*$/gm, '');
  storyText = storyText.replace(/^\s*"max":\s*\d+,?\s*$/gm, '');
  storyText = storyText.replace(/^\s*"experience":\s*\d+,?\s*$/gm, '');
  storyText = storyText.replace(/^\s*"level":\s*\d+,?\s*$/gm, '');
  storyText = storyText.replace(/^\s*"nextLevelExp":\s*\d+,?\s*$/gm, '');

  console.log('\n🔄 STEP 5: After removing individual JSON properties');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 6: Loose JSON remnants
  storyText = storyText.replace(/^\s*[,\{\[\]\}]\s*$/gm, '');
  storyText = storyText.replace(/^\s*"[^"]*":\s*$/gm, '');
  storyText = storyText.replace(/^\s*},?\s*$/gm, '');
  storyText = storyText.replace(/^\s*\],?\s*$/gm, '');

  console.log('\n🔄 STEP 6: After removing loose JSON remnants');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  // Step 7: Final cleanup
  storyText = storyText.replace(/,\s*,/g, ',');
  storyText = storyText.replace(/,\s*}/g, '}');
  storyText = storyText.replace(/,\s*\]/g, ']');
  storyText = storyText.replace(/^\s*,|,\s*$/gm, '');
  storyText = storyText.replace(/\n\s*\n\s*\n/g, '\n\n');
  storyText = storyText.trim();

  console.log('\n🔄 STEP 7: Final cleanup');
  console.log(storyText);
  console.log(`Length: ${storyText.length}`);

  console.log('\n✅ FINAL RESULT:');
  console.log(storyText);

  return storyText;
}

// Test với response mẫu
debugCleanupSteps(sampleResponse);
