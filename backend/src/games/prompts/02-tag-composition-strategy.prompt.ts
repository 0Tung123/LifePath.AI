/**
 * GIAI ĐOẠN 2: CHIẾN LƯỢC KẾT HỢP TAG
 * Prompt này hướng dẫn AI cách kết hợp tags một cách thông minh và hợp lý
 */

import {
  Tag,
  ValidationRule,
  AIGenerationContext,
} from '../../common/types/dynamic-system.types';

export function buildTagCompositionStrategyPrompt(
  availableTags: Tag[],
  validationRules: ValidationRule[],
  context: AIGenerationContext,
  targetCategory: string,
  powerLevelRange: [number, number],
): string {
  return `
# GIAI ĐOẠN 2: CHIẾN LƯỢC KẾT HỢP TAG - LIFEPATH.AI

## NHIỆM VỤ
Dựa trên phân tích hệ thống type từ giai đoạn 1, bây giờ bạn cần xây dựng chiến lược kết hợp tags để tạo ra nội dung game phù hợp và cân bằng.

## BỐI CẢNH HIỆN TẠI
- **Game ID**: ${context.gameId}
- **Scene hiện tại**: ${context.currentScene || 'Chưa xác định'}
- **Player Level**: ${context.playerLevel || 'Chưa xác định'}
- **Story Context**: ${context.storyContext || 'Tổng quát'}
- **Target Category**: ${targetCategory}
- **Power Level Range**: ${powerLevelRange[0]} - ${powerLevelRange[1]}

## TAGS KHẢ DỤNG TRONG HỆ THỐNG
${availableTags
  .map(
    (tag) => `
### ${tag.name} (${tag.category} - ${tag.rarity})
- **Mô tả**: ${tag.description}
- **Properties**: ${JSON.stringify(tag.properties, null, 2)}
- **Conflicts**: ${tag.conflicts?.join(', ') || 'Không có'}
- **Synergies**: ${tag.synergies?.length || 0} hiệu ứng
${tag.synergies?.map((synergy) => `  - Kết hợp với [${synergy.requiredTags.join(', ')}] → ${synergy.effect.name}: ${synergy.effect.description}`).join('\n') || ''}
`,
  )
  .join('\n')}

## QUY TẮC VALIDATION PHẢI TUÂN THỦ
${validationRules
  .map(
    (rule) => `
### ${rule.name} (${rule.severity.toUpperCase()})
- **Mô tả**: ${rule.description}
- **Áp dụng cho**: ${rule.category}
- **Điều kiện**: ${rule.conditions.map((c) => `${c.type}: ${c.errorMessage}`).join(', ')}
`,
  )
  .join('\n')}

## CHIẾN LƯỢC KẾT HỢP TAG

### 1. PHÂN TÍCH COMPATIBILITY (Tương thích)
Trước khi kết hợp, phải kiểm tra:
- **Conflicts**: Tags có xung đột không?
- **Category Balance**: Có cân bằng giữa các loại tag không?
- **Power Level**: Tổng power level có phù hợp không?
- **Rarity Distribution**: Phân bố độ hiếm có hợp lý không?

### 2. TỐI ƯU SYNERGY EFFECTS
Ưu tiên các kết hợp tạo ra synergy:
- **Multiplicative Effects**: Hiệu ứng nhân lên
- **New Abilities**: Kỹ năng mới
- **Transformations**: Biến đổi đặc biệt
- **Special Events**: Sự kiện đặc biệt

### 3. CÂN BẰNG GAME
Đảm bảo không tạo ra content quá mạnh hoặc quá yếu:
- **Power Scaling**: Tỷ lệ với player level
- **Risk vs Reward**: Cân bằng rủi ro và phần thưởng
- **Progression Logic**: Logic tiến triển hợp lý

### 4. NARRATIVE COHERENCE (Tính nhất quán câu chuyện)
Tags phải phù hợp với bối cảnh:
- **World Building**: Xây dựng thế giới
- **Character Development**: Phát triển nhân vật
- **Story Progression**: Tiến triển câu chuyện

## THUẬT TOÁN KẾT HỢP TAG

### Bước 1: Lọc Tags phù hợp
\`\`\`typescript
function filterCompatibleTags(
  availableTags: Tag[],
  context: AIGenerationContext,
  targetCategory: string
): Tag[] {
  return availableTags.filter(tag => {
    // Kiểm tra category phù hợp
    if (targetCategory && !isCategoryCompatible(tag.category, targetCategory)) {
      return false;
    }
    
    // Kiểm tra power level
    if (context.powerLevelRange) {
      const tagPowerLevel = calculateTagPowerLevel(tag);
      if (tagPowerLevel < context.powerLevelRange[0] || 
          tagPowerLevel > context.powerLevelRange[1]) {
        return false;
      }
    }
    
    // Kiểm tra rarity constraints
    if (context.rarityConstraints && 
        !context.rarityConstraints.includes(tag.rarity)) {
      return false;
    }
    
    return true;
  });
}
\`\`\`

### Bước 2: Tìm Synergy Combinations
\`\`\`typescript
function findSynergyCombinations(tags: Tag[]): TagCombination[] {
  const combinations: TagCombination[] = [];
  
  for (const tag of tags) {
    if (tag.synergies) {
      for (const synergy of tag.synergies) {
        const requiredTags = synergy.requiredTags
          .map(name => tags.find(t => t.name === name))
          .filter(Boolean);
          
        if (requiredTags.length === synergy.requiredTags.length) {
          combinations.push({
            tags: [tag, ...requiredTags],
            synergy: synergy,
            powerLevel: calculateCombinationPowerLevel([tag, ...requiredTags]),
            conflicts: checkConflicts([tag, ...requiredTags])
          });
        }
      }
    }
  }
  
  return combinations.filter(combo => combo.conflicts.length === 0);
}
\`\`\`

### Bước 3: Validate Combination
\`\`\`typescript
function validateTagCombination(
  tags: Tag[],
  validationRules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const rule of validationRules) {
    for (const condition of rule.conditions) {
      const result = evaluateCondition(condition, tags);
      if (!result.valid) {
        if (rule.severity === 'error') {
          errors.push(result.message);
        } else {
          warnings.push(result.message);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
\`\`\`

## OUTPUT EXPECTED - CHIẾN LƯỢC KẾT HỢP

Hãy đưa ra:

### 1. TOP 5 KẾT HỢP TAG TỐI ƯU
Cho mỗi kết hợp, cung cấp:
- **Tags sử dụng**: Danh sách tags
- **Synergy Effects**: Hiệu ứng kết hợp
- **Power Level**: Tổng power level
- **Validation Status**: Có hợp lệ không
- **Narrative Fit**: Mức độ phù hợp với câu chuyện (1-10)

### 2. PHÂN TÍCH RỦI RO
- **Potential Conflicts**: Xung đột tiềm ẩn
- **Balance Issues**: Vấn đề cân bằng
- **Validation Violations**: Vi phạm quy tắc

### 3. ĐỀ XUẤT TỐI ƯU
- **Recommended Combination**: Kết hợp được đề xuất
- **Alternative Options**: Các lựa chọn thay thế
- **Future Synergies**: Synergy có thể phát triển

### 4. IMPLEMENTATION NOTES
- **Technical Considerations**: Cân nhắc kỹ thuật
- **Performance Impact**: Tác động hiệu suất
- **Extensibility**: Khả năng mở rộng

## LƯU Ý QUAN TRỌNG
1. **Type Safety**: Tất cả kết hợp phải tuân thủ TypeScript interfaces
2. **Immutability**: Không thay đổi tags gốc, chỉ tạo combinations mới
3. **Performance**: Tối ưu thuật toán cho hiệu suất cao
4. **Scalability**: Thiết kế có thể mở rộng cho hàng nghìn tags

**Format Output**: JSON structure tuân thủ TagCombinationResult interface
`;
}

// Interfaces moved to types file to avoid unused declarations
