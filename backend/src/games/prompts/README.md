# AI Prompt System v5.0 - Modular Architecture

## Tổng quan

Hệ thống prompt AI được thiết kế theo kiến trúc modular để dễ dàng quản lý, mở rộng và bảo trì. Mỗi module chịu trách nhiệm cho một chức năng cụ thể và có thể được sử dụng độc lập hoặc kết hợp với các module khác.

## Cấu trúc thư mục

```
prompts/
├── index.ts                          # Entry point chính, export tất cả functions
├── enhanced-world-building-v2.prompt.ts  # Core world building và action processing
├── character-creation.prompt.ts      # Prompts cho character creation
├── npc-system.prompt.ts             # Prompts cho NPC management
├── README.md                        # Tài liệu này
└── modules/                         # Các module chuyên biệt
    ├── style.prompt.ts              # Xử lý phong cách văn (Trung/Hàn)
    ├── tag-system.prompt.ts         # Hệ thống tags cho game state
    ├── dialogue.prompt.ts           # Hệ thống đối thoại
    ├── choice-system.prompt.ts      # Hệ thống lựa chọn
    ├── death-system.prompt.ts       # Xử lý cái chết và hồi sinh
    ├── action-context.prompt.ts     # Xử lý context hành động
    ├── game-state.prompt.ts         # Hiển thị trạng thái game
    └── game-mechanics.prompt.ts     # Các cơ chế game phức tạp
```

## Các Module chính

### 1. Core Modules (modules/)

#### style.prompt.ts

- **Chức năng**: Xử lý phong cách văn theo thể loại (Trung Quốc vs Hàn Quốc)
- **Input**: GameSettingsDto
- **Output**: String prompt với style guidelines
- **Sử dụng**: Trong tất cả các prompt cần phong cách văn

#### tag-system.prompt.ts

- **Chức năng**: Định nghĩa tất cả các tags để tracking game state
- **Bao gồm**: [STATS], [INVENTORY_ADD/REMOVE], [SKILL], [LORE_*], [KARMA_SCORE], etc.
- **Type Safety**: Đảm bảo format chính xác cho parser

#### dialogue.prompt.ts

- **Chức năng**: Quy tắc và format cho đối thoại NPC
- **Yêu cầu**: 40% nội dung phải là đối thoại
- **Format**: "Tên NPC: 'Lời nói'"

#### choice-system.prompt.ts

- **Chức năng**: Hệ thống lựa chọn với đánh giá nguy hiểm
- **Format**: [AN TOÀN/THẬN TRỌNG/NGUY HIỂM/CHẾT NGƯỜI]
- **Yêu cầu**: 3-4 lựa chọn mỗi turn

#### death-system.prompt.ts

- **Chức năng**: Xử lý cái chết và hồi sinh
- **Bao gồm**: [DEATH_CAUSE] tag, mô tả chi tiết
- **Logic**: Kiểm tra resurrection items/skills

### 2. Specialized Prompts

#### character-creation.prompt.ts

- **buildBackstoryAnalysisPrompt**: Phân tích tiểu sử → đề xuất stats
- **buildTemplateGenerationPrompt**: Tạo character templates
- **buildStatValidationPrompt**: Kiểm tra phân bổ điểm hợp lệ

#### npc-system.prompt.ts

- **buildNPCCreationPrompt**: Tạo NPCs với đầy đủ thông tin
- **buildNPCInteractionPrompt**: Xử lý tương tác với NPCs
- **buildNPCRelationshipPrompt**: Phân tích và cập nhật mối quan hệ

### 3. Core System

#### enhanced-world-building-v2.prompt.ts

- **buildEnhancedWorldPrompt**: Tạo thế giới ban đầu
- **buildEnhancedActionPrompt**: Xử lý hành động người chơi
- **Sử dụng**: Tất cả modules để tạo prompt hoàn chỉnh

## Type Safety và Integration

### DTOs được sử dụng

- `GameSettingsDto`: Cài đặt game cơ bản
- `GameActionDto`: Hành động người chơi
- `CreateNPCDto`, `UpdateNPCDto`: NPC management
- `CharacterCreationDto`: Character creation process

### Entities được tham chiếu

- `Game`: Trạng thái game chính
- `NPC`: Thông tin NPCs
- `GameStats`, `InventoryItem`, `Skill`: Game content interfaces

### Enums được sử dụng

- `NPCDiscoveryStage`, `NPCRelationshipStatus`, `NPCImportance`
- `NPCInteractionType`, `NPCCurrentStatus`

## Cách sử dụng

### Import và sử dụng

```typescript
import {
  buildEnhancedWorldPrompt,
  buildBackstoryAnalysisPrompt,
  buildNPCCreationPrompt,
} from './prompts';

// Tạo world prompt
const worldPrompt = buildEnhancedWorldPrompt(gameSettings);

// Phân tích backstory
const analysisPrompt = buildBackstoryAnalysisPrompt(backstory, worldType);

// Tạo NPC
const npcPrompt = buildNPCCreationPrompt(context, worldType, characterName);
```

### Dynamic imports (tránh circular dependencies)

```typescript
const { buildStylePrompt } = require('./modules/style.prompt');
const styleContent = buildStylePrompt(gameSettings);
```

## Extensibility

### Thêm module mới

1. Tạo file trong `modules/` với format `feature.prompt.ts`
2. Export function với prefix `build*Prompt`
3. Thêm vào `index.ts`
4. Sử dụng trong core prompts

### Thêm prompt chuyên biệt

1. Tạo file với format `feature.prompt.ts`
2. Import các modules cần thiết
3. Export functions với naming convention rõ ràng
4. Thêm vào `index.ts`

## Best Practices

### 1. Naming Convention

- Files: `kebab-case.prompt.ts`
- Functions: `buildFeaturePrompt()`
- Modules: `feature.prompt.ts`

### 2. Type Safety

- Luôn import đúng types từ DTOs và entities
- Sử dụng TypeScript strict mode
- Validate inputs trước khi sử dụng

### 3. Modularity

- Mỗi module chỉ chịu trách nhiệm một chức năng
- Tránh dependencies giữa các modules
- Sử dụng dynamic imports khi cần thiết

### 4. Documentation

- Comment rõ ràng cho mỗi function
- Giải thích input/output parameters
- Cung cấp examples khi cần thiết

## Performance Considerations

### 1. Lazy Loading

- Sử dụng dynamic imports cho modules lớn
- Chỉ load modules khi cần thiết

### 2. Caching

- Cache compiled prompts khi có thể
- Reuse modules giữa các requests

### 3. Memory Management

- Tránh tạo strings quá lớn
- Clean up unused references

## Testing

### Unit Tests

- Test từng module độc lập
- Mock dependencies khi cần thiết
- Verify output format

### Integration Tests

- Test kết hợp các modules
- Verify AI response parsing
- Test với real game data

## Migration từ hệ thống cũ

### Bước 1: Update imports

```typescript
// Cũ
import { buildEnhancedWorldPrompt } from './enhanced-world-building.prompt';

// Mới
import { buildEnhancedWorldPrompt } from './prompts';
```

### Bước 2: Update function calls

- Các function signatures giữ nguyên
- Chỉ cần update import paths

### Bước 3: Cleanup

- Xóa các file prompt cũ
- Update references trong services

## Troubleshooting

### Common Issues

1. **Circular Dependencies**: Sử dụng dynamic imports
2. **Type Errors**: Kiểm tra import paths và type definitions
3. **Missing Modules**: Đảm bảo export trong index.ts

### Debug Tips

1. Log prompt content trước khi gửi AI
2. Verify module loading order
3. Check for undefined values in templates
