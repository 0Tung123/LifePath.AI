// Test story preservation while cleaning JSON metadata
console.log('🧪 TESTING STORY PRESERVATION');
console.log('='.repeat(50));

// Test case với JSON metadata mixed với story content
const testResponse = `
Khánh Tùng đứng trên đỉnh núi Thiên Kiếm, gió rít gào bên tai. Mười năm trôi qua kể từ ngày sư phụ bí ẩn của y qua đời, để lại cho y tuyệt học 'Cửu Thiên Huyền Công' và lời dặn dò báo thù.

Giờ đây, y chỉ là một đệ tử ngoại môn tầm thường của Thiên Kiếm Phái, nơi mà kẻ thù của sư phụ y đang ẩn mình. Y siết chặt thanh kiếm gỗ trong tay, ánh mắt kiên định.

"choices": [
  {
    "number": 1,
    "text": "Luyện tập chăm chỉ để tăng cường sức mạnh",
    "consequences": ["Tăng cường tu vi", "Tốn thời gian"]
  },
  {
    "number": 2,
    "text": "Thu thập thông tin về kẻ thù",
    "consequences": ["Có thể nguy hiểm", "Tìm manh mối"]
  }
]

Hôm nay, y sẽ bắt đầu kế hoạch trả thù. Trước mắt y là ba con đường: luyện tập chăm chỉ, tìm kiếm cơ hội, hoặc thu thập thông tin.

"stats": {
  "mana": {"current": 155, "max": 155},
  "stamina": {"current": 135, "max": 135},
  "experience": 0,
  "level": 1
}

Y nhìn về phía xa, nơi mà ký ức đau đớn về cái chết của sư phụ vẫn còn rõ nét. Quyết tâm trả thù càng lúc càng mạnh mẽ.

[STATS: Tu Vi="Luyện Khí tầng một", Chân Khí=150/150, Thể Lực=120/120]
`;

function testStoryPreservation(response) {
  console.log('📖 ORIGINAL RESPONSE:');
  console.log(response);

  console.log('\n🔧 PROCESSING...');

  // Extract story text before tags
  let storyText = response;
  const firstTagMatch = response.match(/\[STATS:/);
  if (firstTagMatch && firstTagMatch.index !== undefined) {
    storyText = response.substring(0, firstTagMatch.index).trim();
  }

  console.log('1. After extracting before [STATS] tag:');
  console.log(storyText);

  // Clean JSON metadata - IMPROVED VERSION
  console.log('\n2. Cleaning JSON metadata...');

  // Xóa các JSON code blocks
  storyText = storyText.replace(/\`\`\`json[\s\S]*?\`\`\`/g, '');
  storyText = storyText.replace(/\`\`\`[\s\S]*?\`\`\`/g, '');

  // Xóa các JSON property cụ thể (chỉ xóa khi có key rõ ràng)
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

  // Xóa các object JSON hoàn chỉnh chỉ khi có key cụ thể
  storyText = storyText.replace(/\{[\s\S]*?"choices"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stats"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"inventory"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"skills"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"lore"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"mana"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stamina"[\s\S]*?\}/g, '');

  // Xóa các dòng JSON properties riêng lẻ
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

  // Xóa những dòng JSON rời rạc (bắt đầu bằng dấu phẩy hoặc dấu ngoặc)
  storyText = storyText.replace(/^\s*[,\{\[\]\}]\s*$/gm, '');
  storyText = storyText.replace(/^\s*"[^"]*":\s*$/gm, '');
  storyText = storyText.replace(/^\s*},?\s*$/gm, '');
  storyText = storyText.replace(/^\s*\],?\s*$/gm, '');

  // Xóa dấu phẩy thừa và malformed JSON
  storyText = storyText.replace(/,\s*,/g, ',');
  storyText = storyText.replace(/,\s*}/g, '}');
  storyText = storyText.replace(/,\s*\]/g, ']');
  storyText = storyText.replace(/^\s*,|,\s*$/gm, '');

  // Xóa dòng trống thừa
  storyText = storyText.replace(/\n\s*\n\s*\n/g, '\n\n');

  storyText = storyText.trim();

  console.log('\n📖 FINAL CLEANED STORY TEXT:');
  console.log(storyText);

  return storyText;
}

// Test
const cleanedStory = testStoryPreservation(testResponse);

console.log('\n✅ EXPECTED RESULT:');
console.log(
  `
Khánh Tùng đứng trên đỉnh núi Thiên Kiếm, gió rít gào bên tai. Mười năm trôi qua kể từ ngày sư phụ bí ẩn của y qua đời, để lại cho y tuyệt học 'Cửu Thiên Huyền Công' và lời dặn dò báo thù.

Giờ đây, y chỉ là một đệ tử ngoại môn tầm thường của Thiên Kiếm Phái, nơi mà kẻ thù của sư phụ y đang ẩn mình. Y siết chặt thanh kiếm gỗ trong tay, ánh mắt kiên định.

Hôm nay, y sẽ bắt đầu kế hoạch trả thù. Trước mắt y là ba con đường: luyện tập chăm chỉ, tìm kiếm cơ hội, hoặc thu thập thông tin.

Y nhìn về phía xa, nơi mà ký ức đau đớn về cái chết của sư phụ vẫn còn rõ nét. Quyết tâm trả thù càng lúc càng mạnh mẽ.
`.trim(),
);

console.log('\n🎯 ANALYSIS:');
console.log('- Story content should be preserved');
console.log('- JSON metadata should be removed');
console.log('- Narrative flow should remain intact');
console.log('- No loss of important story elements');
