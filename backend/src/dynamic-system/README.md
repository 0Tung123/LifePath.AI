# Dynamic System - Hệ thống Type Động

## 🎯 Tổng quan

Dynamic System là hệ thống cốt lõi của LifePath.AI cho phép tạo ra nội dung game động và không giới hạn thông qua **Tag-based System**. Hệ thống này cho phép:

- ✨ **AI tự động tạo content** dựa trên context
- 🏷️ **Tag-based composition** linh hoạt
- 🔄 **Dynamic type generation** không giới hạn
- ⚖️ **AI-powered validation** thông minh
- 🎮 **Unlimited game world** expansion

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Tags       │    │  Dynamic Types  │    │ Validation Rules│
│   (Building     │◄──►│   (Generated    │◄──►│   (AI + Schema  │
│    Blocks)      │    │    Content)     │    │   Validation)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Generation Service                        │
│              (Gemini AI + Context-aware)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Tags Table

```sql
- id (UUID, PK)
- name (VARCHAR, UNIQUE)
- category (ENUM: element, class, skill_type, etc.)
- description (TEXT)
- properties (JSONB)
- rarity (ENUM: common -> divine)
- conflicts (JSONB array)
- synergies (JSONB array)
- created_by (JSONB: {type, id, aiModel, context})
- usage_count (INTEGER)
- is_active (BOOLEAN)
```

### Dynamic Types Table

```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- category (ENUM: character, npc, skill, equipment, etc.)
- tags (JSONB array of tag names)
- base_properties (JSONB)
- computed_properties (JSONB)
- active_synergies (JSONB array)
- rarity (ENUM)
- power_level (INTEGER 1-100)
- created_by (JSONB)
- is_template (BOOLEAN)
- generation_metadata (JSONB)
```

### Validation Rules Table

```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- category (ENUM)
- conditions (JSONB array)
- severity (ENUM: error, warning, info)
- is_active (BOOLEAN)
```

## 🚀 API Endpoints

### Tags Management

```typescript
POST   /dynamic-system/tags                    // Tạo tag mới
GET    /dynamic-system/tags                    // Lấy danh sách tags
GET    /dynamic-system/tags/:id               // Lấy tag theo ID
PATCH  /dynamic-system/tags/:id               // Cập nhật tag
DELETE /dynamic-system/tags/:id               // Xóa tag (soft delete)
```

### Dynamic Types Management

```typescript
POST   /dynamic-system/dynamic-types          // Tạo dynamic type
GET    /dynamic-system/dynamic-types          // Lấy danh sách types
GET    /dynamic-system/dynamic-types/:id      // Lấy type theo ID
```

### AI Generation

```typescript
POST / dynamic - system / generate / dynamic - types; // Generate bằng AI
POST / dynamic - system / tags / validate - combination; // Validate tag combination
```

### Utilities

```typescript
GET / dynamic - system / categories; // Lấy danh sách categories
GET / dynamic - system / rarities; // Lấy danh sách rarities
GET / dynamic - system / stats / tags; // Thống kê tags
GET / dynamic - system / stats / dynamic - types; // Thống kê dynamic types
```

## 💡 Cách sử dụng

### 1. Tạo Tags cơ bản

```typescript
// Tạo elemental tag
const fireTag = await dynamicSystemService.createTag({
  name: 'Fire',
  category: TagCategory.ELEMENT,
  description: 'Grants fire-based abilities',
  properties: { fire_damage: 25, fire_resistance: 30 },
  rarity: TagRarity.COMMON,
  createdBy: { type: 'admin', id: 'user-id' },
});
```

### 2. Validate Tag Combination

```typescript
// Kiểm tra xem tags có thể kết hợp không
const result = await dynamicSystemService.combineTagsPreview({
  tagNames: ['Fire', 'Sword', 'Legendary'],
  category: DynamicTypeCategory.EQUIPMENT,
});

if (result.isValid) {
  console.log('Power Level:', result.powerLevel);
  console.log('Synergies:', result.synergies);
} else {
  console.log('Conflicts:', result.conflicts);
}
```

### 3. Tạo Dynamic Type

```typescript
// Tạo equipment từ tags
const flamingSword = await dynamicSystemService.createDynamicType({
  name: 'Flaming Sword of Power',
  description: 'A legendary blade wreathed in eternal flames',
  category: DynamicTypeCategory.EQUIPMENT,
  tags: ['Fire', 'Sword', 'Legendary'],
  baseProperties: { damage: 100, durability: 500 },
  rarity: TagRarity.LEGENDARY,
  powerLevel: 85,
  createdBy: { type: 'admin', id: 'user-id' },
});
```

### 4. AI Generation

```typescript
// Để AI tạo content dựa trên context
const aiTypes = await dynamicSystemService.generateDynamicType({
  category: DynamicTypeCategory.SKILL,
  gameId: 'game-123',
  storyContext: 'Player exploring volcanic dungeon',
  requiredTags: ['Fire', 'Combat'],
  powerLevelRange: [60, 80],
  count: 3,
  customPrompt: 'Create fire-based combat skills',
});
```

## 🔧 Setup và Testing

### 1. Seed dữ liệu mẫu

```bash
# Chạy seeder để tạo tags và types mẫu
npm run seed:dynamic-system
```

### 2. Test hệ thống

```bash
# Chạy test script
npx ts-node src/dynamic-system/test-dynamic-system.ts
```

### 3. Environment Variables

```env
# Cần thiết cho AI generation
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎮 Ví dụ thực tế

### Scenario: Player khám phá Fire Temple

```typescript
// 1. AI tự động tạo enemies phù hợp
const fireEnemies = await aiGenerationService.generateDynamicTypesForContext(
  gameId,
  DynamicTypeCategory.NPC,
  'Player enters ancient fire temple guarded by flame spirits',
  [60, 80], // Power level range
  2, // Count
);

// 2. AI tạo loot phù hợp
const fireLoot = await aiGenerationService.generateDynamicTypesForContext(
  gameId,
  DynamicTypeCategory.EQUIPMENT,
  'Treasure from fire temple, blessed by flame spirits',
  [70, 90],
  3,
);

// 3. Kết quả có thể là:
// - "Flame Guardian" (NPC với tags: [Fire, Guardian, Ancient])
// - "Ember Sprite" (NPC với tags: [Fire, Spirit, Fast])
// - "Phoenix Feather Cloak" (Equipment với tags: [Fire, Armor, Phoenix])
// - "Molten Core Staff" (Equipment với tags: [Fire, Staff, Legendary])
```

## 🔄 Tag Synergies

Tags có thể tạo ra synergies khi kết hợp:

```typescript
// Ví dụ: Fire + Phoenix tags
{
  requiredTags: ['Fire', 'Phoenix'],
  effect: {
    type: 'new_ability',
    name: 'Phoenix Rebirth',
    description: 'Resurrect when killed',
    effects: { auto_resurrect: 1 }
  }
}
```

## 📈 Monitoring và Analytics

Hệ thống track:

- Usage count của từng tag
- Player feedback/rating
- AI generation success rate
- Popular tag combinations
- Performance metrics

## 🛡️ Validation System

### 3 tầng validation:

1. **Schema Validation**: DTO validation với class-validator
2. **Business Rules**: Custom validation rules trong database
3. **AI Validation**: AI đánh giá tính hợp lý của content

### Ví dụ Validation Rules:

```typescript
// Rule: Fire và Water không thể kết hợp
{
  name: 'Fire-Water Conflict',
  conditions: [{
    type: 'tag_forbidden',
    parameters: { tagName: 'Water' },
    errorMessage: 'Fire and Water are incompatible'
  }],
  severity: 'error'
}
```

## 🚀 Mở rộng trong tương lai

- **Machine Learning**: Học từ player behavior để tạo content tốt hơn
- **Community Content**: Player có thể tạo và share tags/types
- **Advanced AI**: Sử dụng multiple AI models cho different content types
- **Real-time Generation**: Generate content trong lúc chơi
- **Cross-game Compatibility**: Share content giữa các games khác nhau

---

**Dynamic System** là trái tim của LifePath.AI, tạo ra một thế giới game thực sự vô hạn và luôn mới mẻ! 🌟
