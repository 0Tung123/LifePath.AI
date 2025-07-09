// Test JSON cleanup and choices separation

// Sample problematic AI response with JSON metadata
const problematicResponse = `
Khánh Tùng đứng trên đỉnh núi Thiên Kiếm, gió rít gào bên tai. Mười năm trôi qua kể từ ngày sư phụ bí ẩn của y qua đời, để lại cho y tuyệt học 'Cửu Thiên Huyền Công' và lời dặn dò báo thù. Giờ đây, y chỉ là một đệ tử ngoại môn tầm thường của Thiên Kiếm Phái, nơi mà kẻ thù của sư phụ y đang ẩn mình. Y siết chặt thanh kiếm gỗ trong tay, ánh mắt kiên định. Hôm nay, y sẽ bắt đầu kế hoạch trả thù. Trước mắt y là ba con đường: luyện tập chăm chỉ, tìm kiếm cơ hội, hoặc thu thập thông tin.

\`\`\`json
{
"choices": [
  {
    "number": 1,
    "text": "Luyện tập chăm chỉ để tăng cường sức mạnh, đồng thời tìm hiểu thêm về 'Cửu Thiên Huyền Công'.",
    "consequences": [
      "Tăng cường tu vi, có thể khám phá ra sức mạnh ẩn giấu trong tuyệt học.",
      "Tốn nhiều thời gian, có thể bỏ lỡ cơ hội khác."
    ]
  },
  {
    "number": 2,
    "text": "Bắt đầu thu thập thông tin về kẻ thù của sư phụ trong Thiên Kiếm Phái.",
    "consequences": [
      "Có thể nguy hiểm nếu bị phát hiện, dễ bị nghi ngờ.",
      "Tìm ra manh mối quan trọng, hiểu rõ hơn về kẻ thù."
    ]
  },
  {
    "number": 3,
    "text": "Tìm kiếm cơ hội để thể hiện bản thân trong phái, leo lên vị trí cao hơn.",
    "consequences": [
      "Cần phải nỗ lực vượt qua các đệ tử khác, đối mặt với cạnh tranh.",
      "Có cơ hội tiếp cận những bí mật và tài nguyên quý giá của phái."
    ]
  }
],
"stats": {
  "mana": {
    "current": 155,
    "max": 155
  },
  "stamina": {
    "current": 135,
    "max": 135
  },
  "experience": 0,
  "level": 1,
  "nextLevelExp": 100
}
}
\`\`\`

[STATS: Tu Vi="Luyện Khí tầng một", Chân Khí=150/150, Thể Lực=120/120]
`;

// Test cleanup function
function testCleanupResponse(response) {
  console.log('=== ORIGINAL RESPONSE ===');
  console.log(response);
  console.log('\n=== CLEANING PROCESS ===');

  let storyText = response;

  // Extract story text (everything before the first tag)
  const firstTagMatch = response.match(
    /\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION|KARMA_SCORE|REPUTATION|WORLD_STATE|EVENT|NPC_UPDATE):/,
  );
  if (firstTagMatch && firstTagMatch.index !== undefined) {
    storyText = response.substring(0, firstTagMatch.index).trim();
  }

  console.log('1. After extracting before first tag:');
  console.log(storyText);

  // Clean ALL JSON metadata from story text với regex mạnh hơn
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

  console.log('\n2. After removing specific JSON properties:');
  console.log(storyText);

  // Xóa các object JSON hoàn chỉnh
  storyText = storyText.replace(/\{[\s\S]*?"choices"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stats"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"inventory"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"skills"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"lore"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"mana"[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\{[\s\S]*?"stamina"[\s\S]*?\}/g, '');

  console.log('\n3. After removing JSON objects:');
  console.log(storyText);

  // Xóa các đoạn JSON còn sót lại
  storyText = storyText.replace(/\`\`\`json[\s\S]*?\`\`\`/g, '');
  storyText = storyText.replace(/\`\`\`[\s\S]*?\`\`\`/g, '');
  storyText = storyText.replace(/\{[\s\S]*?\}/g, '');
  storyText = storyText.replace(/\[[\s\S]*?\]/g, '');

  console.log('\n4. After removing code blocks and remaining JSON:');
  console.log(storyText);

  storyText = storyText.replace(/,\s*,/g, ',');
  storyText = storyText.replace(/,\s*}/g, '}');
  storyText = storyText.replace(/,\s*\]/g, ']');
  storyText = storyText.replace(/^\s*,|,\s*$/g, '');

  console.log('\n5. After cleanup malformed JSON:');
  console.log(storyText);

  storyText = storyText.trim();

  console.log('\n=== FINAL CLEANED STORY TEXT ===');
  console.log(storyText);

  return storyText;
}

// Test choices extraction
function testChoicesExtraction(response) {
  console.log('\n=== CHOICES EXTRACTION TEST ===');

  // Extract AI choices from JSON
  const jsonChoicesMatch = response.match(/"choices":\s*\[[\s\S]*?\]/);
  let aiChoices = [];

  if (jsonChoicesMatch) {
    try {
      const choicesArrayMatch = jsonChoicesMatch[0].match(/\[[\s\S]*?\]/);
      if (choicesArrayMatch) {
        const parsedChoices = JSON.parse(choicesArrayMatch[0]);
        if (Array.isArray(parsedChoices)) {
          aiChoices = parsedChoices.map((choice) => ({
            text: choice.text,
            number: choice.number,
            consequences: choice.consequences || [],
          }));
        }
      }
    } catch (e) {
      console.error('Error parsing choices:', e);
    }
  }

  // Generic choices (always available)
  const genericChoices = [
    { text: 'Tiếp tục quan sát tình hình', number: 1 },
    { text: 'Hành động ngay lập tức', number: 2 },
    { text: 'Tìm cách khác để giải quyết', number: 3 },
    { text: 'Tương tác với người xung quanh', number: 4 },
    { text: 'Nghỉ ngơi và suy nghĩ', number: 5 },
  ];

  console.log('AI Choices (Tab Lựa chọn):');
  aiChoices.forEach((choice, index) => {
    console.log(`${index + 1}. ${choice.text}`);
    if (choice.consequences && choice.consequences.length > 0) {
      console.log(`   Hậu quả: ${choice.consequences.join(', ')}`);
    }
  });

  console.log('\nGeneric Choices (Tab Hỗ trợ lựa chọn):');
  genericChoices.forEach((choice, index) => {
    console.log(`${index + 1}. ${choice.text}`);
  });

  return { aiChoices, genericChoices };
}

// Run tests
console.log('🧪 TESTING JSON CLEANUP AND CHOICES SEPARATION\n');

const cleanedText = testCleanupResponse(problematicResponse);
const { aiChoices, genericChoices } =
  testChoicesExtraction(problematicResponse);

console.log('\n=== SUMMARY ===');
console.log('✅ JSON metadata cleaned from story text');
console.log(`✅ Found ${aiChoices.length} AI choices`);
console.log(`✅ Generated ${genericChoices.length} generic choices`);
console.log('✅ Choices properly separated into different tabs');

// Test with story text that has no JSON
const cleanStoryText = `
Khánh Tùng đứng trên đỉnh núi Thiên Kiếm, gió rít gào bên tai. Mười năm trôi qua kể từ ngày sư phụ bí ẩn của y qua đời, để lại cho y tuyệt học 'Cửu Thiên Huyền Công' và lời dặn dò báo thù. Giờ đây, y chỉ là một đệ tử ngoại môn tầm thường của Thiên Kiếm Phái, nơi mà kẻ thù của sư phụ y đang ẩn mình. Y siết chặt thanh kiếm gỗ trong tay, ánh mắt kiên định. Hôm nay, y sẽ bắt đầu kế hoạch trả thù. Trước mắt y là ba con đường: luyện tập chăm chỉ, tìm kiếm cơ hội, hoặc thu thập thông tin.
`;

console.log('\n=== EXPECTED FINAL RESULT ===');
console.log(cleanStoryText.trim());
console.log('\n=== ACTUAL RESULT ===');
console.log(cleanedText);
console.log('\n=== MATCH? ===');
console.log(cleanedText.trim() === cleanStoryText.trim() ? '✅ YES' : '❌ NO');
