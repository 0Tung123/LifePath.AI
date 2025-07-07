/**
 * GIAI ĐOẠN 1: PHÂN TÍCH HỆ THỐNG TYPE
 * Prompt này giúp AI hiểu sâu về hệ thống type-based architecture
 */

import {
  TagCategory,
  TagRarity,
  DynamicTypeCategory,
  Tag,
  DynamicType,
  ValidationRule,
} from '../../common/types/dynamic-system.types';

export function buildTypeSystemAnalysisPrompt(
  existingTags: Tag[],
  existingDynamicTypes: DynamicType[],
  validationRules: ValidationRule[],
  gameContext: any,
): string {
  return `
# GIAI ĐOẠN 1: PHÂN TÍCH HỆ THỐNG TYPE - LIFEPATH.AI

## NHIỆM VỤ CỐT LÕI
Bạn là một AI chuyên gia về hệ thống type động (Dynamic Type System) của LifePath.AI. 
Nhiệm vụ của bạn là phân tích và hiểu sâu về cấu trúc type-based architecture để tạo ra nội dung game chính xác và nhất quán.

## KIẾN TRÚC HỆ THỐNG TYPE

### 1. TAG SYSTEM - HỆ THỐNG THẺ CƠ BẢN
Tags là đơn vị cơ bản nhất, mọi thứ trong game đều được xây dựng từ việc kết hợp tags:

**Các loại Tag Categories:**
${Object.values(TagCategory)
  .map((cat) => `- ${cat.toUpperCase()}: ${getTagCategoryDescription(cat)}`)
  .join('\n')}

**Hệ thống Rarity:**
${Object.values(TagRarity)
  .map((rarity) => `- ${rarity.toUpperCase()}: ${getRarityDescription(rarity)}`)
  .join('\n')}

### 2. DYNAMIC TYPE SYSTEM - HỆ THỐNG TYPE ĐỘNG
Dynamic Types được tạo ra từ việc kết hợp nhiều tags:

**Các loại Dynamic Type Categories:**
${Object.values(DynamicTypeCategory)
  .map(
    (cat) =>
      `- ${cat.toUpperCase()}: ${getDynamicTypeCategoryDescription(cat)}`,
  )
  .join('\n')}

### 3. VALIDATION RULES - QUY TẮC VALIDATION
Hệ thống có các quy tắc nghiêm ngặt để đảm bảo tính nhất quán:

**Quy tắc hiện tại:**
${validationRules
  .map(
    (rule) => `
- **${rule.name}**: ${rule.description}
  - Severity: ${rule.severity}
  - Conditions: ${rule.conditions.map((c) => c.errorMessage).join(', ')}
`,
  )
  .join('\n')}

## TAGS HIỆN CÓ TRONG HỆ THỐNG
${existingTags
  .map(
    (tag) => `
**${tag.name}** (${tag.category} - ${tag.rarity})
- Mô tả: ${tag.description}
- Properties: ${JSON.stringify(tag.properties, null, 2)}
- Conflicts: ${tag.conflicts?.join(', ') || 'Không có'}
- Synergies: ${tag.synergies?.length || 0} hiệu ứng kết hợp
`,
  )
  .join('\n')}

## DYNAMIC TYPES HIỆN CÓ
${existingDynamicTypes
  .map(
    (type) => `
**${type.name}** (${type.category} - ${type.rarity} - Power: ${type.powerLevel})
- Mô tả: ${type.description}
- Tags sử dụng: ${type.tags.join(', ')}
- Base Properties: ${JSON.stringify(type.baseProperties, null, 2)}
- Computed Properties: ${JSON.stringify(type.computedProperties, null, 2)}
`,
  )
  .join('\n')}

## BỐI CẢNH GAME HIỆN TẠI
${JSON.stringify(gameContext, null, 2)}

## NGUYÊN TẮC PHÂN TÍCH
1. **Type Safety**: Mọi thứ phải tuân thủ strict typing
2. **Tag Composition**: Tất cả content được tạo từ việc kết hợp tags hợp lý
3. **Validation Compliance**: Phải tuân thủ tất cả validation rules
4. **Synergy Awareness**: Hiểu và tận dụng các hiệu ứng synergy
5. **Context Relevance**: Phù hợp với bối cảnh game hiện tại

## OUTPUT EXPECTED
Phân tích chi tiết về:
1. Các tags phù hợp cho tình huống hiện tại
2. Các dynamic types có thể được tạo ra
3. Các validation rules cần tuân thủ
4. Các synergy effects có thể kích hoạt
5. Đề xuất cải tiến hệ thống type

**Lưu ý quan trọng**: Tất cả output phải tuân thủ TypeScript interfaces đã định nghĩa trong hệ thống.
`;
}

function getTagCategoryDescription(category: TagCategory): string {
  const descriptions = {
    [TagCategory.RACE]: 'Chủng tộc nhân vật (Elf, Human, Dragon, etc.)',
    [TagCategory.CLASS]: 'Lớp nhân vật (Warrior, Mage, Rogue, etc.)',
    [TagCategory.PERSONALITY]: 'Tính cách (Brave, Cunning, Wise, etc.)',
    [TagCategory.BACKGROUND]: 'Xuất thân (Noble, Peasant, Scholar, etc.)',
    [TagCategory.FACTION]: 'Phe phái (Kingdom, Guild, Cult, etc.)',
    [TagCategory.SKILL_TYPE]: 'Loại kỹ năng (Combat, Magic, Social, etc.)',
    [TagCategory.ELEMENT]: 'Nguyên tố (Fire, Water, Earth, Air, etc.)',
    [TagCategory.SCHOOL_OF_MAGIC]:
      'Trường phái ma thuật (Necromancy, Illusion, etc.)',
    [TagCategory.COMBAT_STYLE]:
      'Phong cách chiến đấu (Aggressive, Defensive, etc.)',
    [TagCategory.EFFECT_TYPE]: 'Loại hiệu ứng (Buff, Debuff, Damage, etc.)',
    [TagCategory.TALENT_ORIGIN]:
      'Nguồn gốc tài năng (Innate, Learned, Divine, etc.)',
    [TagCategory.GIFT_TYPE]:
      'Loại thiên phú (Physical, Mental, Spiritual, etc.)',
    [TagCategory.BLOODLINE]: 'Dòng máu (Dragon, Phoenix, Demon, etc.)',
    [TagCategory.DIVINE_BLESSING]:
      'Phước lành thần thánh (God of War, Goddess of Magic, etc.)',
    [TagCategory.ITEM_TYPE]: 'Loại vật phẩm (Weapon, Armor, Accessory, etc.)',
    [TagCategory.MATERIAL]: 'Chất liệu (Steel, Mithril, Dragon Scale, etc.)',
    [TagCategory.CRAFTING_METHOD]:
      'Phương pháp chế tạo (Forged, Enchanted, Blessed, etc.)',
    [TagCategory.ENCHANTMENT]: 'Phù phép (Sharpness, Vampiric, Phoenix, etc.)',
    [TagCategory.ARTIFACT_TIER]:
      'Cấp độ artifact (Lesser, Greater, Legendary, etc.)',
    [TagCategory.CONDITION_TYPE]:
      'Loại trạng thái (Poisoned, Blessed, Cursed, etc.)',
    [TagCategory.CURSE_TYPE]:
      'Loại lời nguyền (Weakness, Madness, Transformation, etc.)',
    [TagCategory.BLESSING_TYPE]:
      'Loại phước lành (Strength, Wisdom, Protection, etc.)',
    [TagCategory.DISEASE_TYPE]:
      'Loại bệnh tật (Plague, Corruption, Madness, etc.)',
    [TagCategory.QUEST_TYPE]: 'Loại nhiệm vụ (Main, Side, Hidden, Daily, etc.)',
    [TagCategory.STORY_THEME]: 'Chủ đề câu chuyện (Revenge, Love, Power, etc.)',
    [TagCategory.LOCATION_TYPE]: 'Loại địa điểm (City, Dungeon, Forest, etc.)',
    [TagCategory.EVENT_TYPE]: 'Loại sự kiện (Battle, Festival, Disaster, etc.)',
    [TagCategory.RARITY]: 'Độ hiếm (Common, Rare, Legendary, etc.)',
    [TagCategory.POWER_LEVEL]: 'Cấp độ sức mạnh (Weak, Strong, Godlike, etc.)',
    [TagCategory.ALIGNMENT]: 'Thiên hướng đạo đức (Good, Evil, Neutral, etc.)',
    [TagCategory.CUSTOM]: 'Tùy chỉnh (Các tag đặc biệt do AI hoặc admin tạo)',
  };
  return descriptions[category] || 'Mô tả chưa được định nghĩa';
}

function getRarityDescription(rarity: TagRarity): string {
  const descriptions = {
    [TagRarity.COMMON]: 'Phổ biến, dễ tìm thấy (70% drop rate)',
    [TagRarity.UNCOMMON]: 'Không phổ biến (20% drop rate)',
    [TagRarity.RARE]: 'Hiếm (7% drop rate)',
    [TagRarity.EPIC]: 'Sử thi (2% drop rate)',
    [TagRarity.LEGENDARY]: 'Huyền thoại (0.8% drop rate)',
    [TagRarity.MYTHICAL]: 'Thần thoại (0.15% drop rate)',
    [TagRarity.DIVINE]: 'Thần thánh (0.04% drop rate)',
    [TagRarity.UNIQUE]:
      'Độc nhất (0.01% drop rate, chỉ có 1 trong toàn bộ game)',
  };
  return descriptions[rarity] || 'Mô tả chưa được định nghĩa';
}

function getDynamicTypeCategoryDescription(
  category: DynamicTypeCategory,
): string {
  const descriptions = {
    [DynamicTypeCategory.CHARACTER]: 'Nhân vật chính của người chơi',
    [DynamicTypeCategory.NPC]: 'Nhân vật không người chơi',
    [DynamicTypeCategory.SKILL]: 'Kỹ năng và phép thuật',
    [DynamicTypeCategory.TALENT]: 'Tài năng và thiên phú bẩm sinh',
    [DynamicTypeCategory.EQUIPMENT]: 'Trang bị (vũ khí, giáp, phụ kiện)',
    [DynamicTypeCategory.ITEM]: 'Vật phẩm tiêu hao và nguyên liệu',
    [DynamicTypeCategory.STATUS]: 'Trạng thái và hiệu ứng',
    [DynamicTypeCategory.QUEST]: 'Nhiệm vụ và mục tiêu',
    [DynamicTypeCategory.EVENT]: 'Sự kiện trong game',
    [DynamicTypeCategory.LOCATION]: 'Địa điểm và khu vực',
  };
  return descriptions[category] || 'Mô tả chưa được định nghĩa';
}
