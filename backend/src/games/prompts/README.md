# PROMPTING SYSTEM - LIFEPATH.AI

## Tổng quan

Hệ thống prompt của LifePath.AI bao gồm hai phần chính:

1. **Chain of Thought Prompting System**: Hệ thống 6 giai đoạn để tạo nội dung game dựa trên dynamic type system
2. **Narrative Style Prompts**: Các prompt chuyên biệt cho các phong cách viết truyện khác nhau

## 📚 NARRATIVE STYLE PROMPTS

### Tổng quan Narrative Styles

Hệ thống narrative styles cung cấp các prompt chuyên biệt để tạo ra câu chuyện theo phong cách văn hóa khác nhau, đảm bảo tính đa dạng và phong phú trong trải nghiệm game.

### 🇨🇳 Chinese Style Narrative

**File**: `chinese-style-narrative.prompt.ts`

**Đặc điểm chính**:

- **Đề tài kinh điển**: Tu tiên/Tu luyện, Trọng sinh/Xuyên việt, Hệ thống, Dị năng
- **Cấu trúc truyện**: Nghịch cảnh → Cơ duyên → Tu luyện → Trả thù/Cứu thế
- **Phong cách ngôn ngữ**: Trang trọng, cổ điển, nhấn mạnh "khí chất", "định mệnh"
- **Yếu tố đặc trưng**: Phân cấp tu vi, tôn sư trọng đạo, nhân quả báo ứng

**Sử dụng**:

```typescript
import { generateChineseStyleNarrativePrompt } from './prompts';

const prompt = generateChineseStyleNarrativePrompt(gameSettings);
```

### 🇰🇷 Korean Style Narrative

**File**: `korean-style-narrative.prompt.ts`

**Đặc điểm chính**:

- **Đề tài phổ biến**: Regression/Hồi quy, Dungeon/Hunter, System, Murim, Chaebol
- **Cấu trúc truyện**: Hook mạnh → Flashback → Power scaling → Face slapping
- **Phong cách ngôn ngữ**: Ngắn gọn, súc tích, tâm lý nội tâm chi tiết
- **Yếu tố đặc trưng**: Hierarchy (E-S rank), Guild, Status window, Skills

**Sử dụng**:

```typescript
import { generateKoreanStyleNarrativePrompt } from './prompts';

const prompt = generateKoreanStyleNarrativePrompt(gameSettings);
```

### 📋 Narrative Rules

**File**: `narrative-rules.prompt.ts`

**Mục đích**: Định nghĩa quy tắc chung cho tất cả các phong cách viết truyện

**Bao gồm**:

- **Quy tắc nội dung**: Nội dung được phép/bị cấm
- **Quy tắc nhân vật**: Phát triển character, tính cách
- **Quy tắc cốt truyện**: Cấu trúc, pacing, tension
- **Quy tắc kỹ thuật**: Format, độ dài, chất lượng

**Sử dụng**:

```typescript
import { generateNarrativeRulesPrompt } from './prompts';

const rules = generateNarrativeRulesPrompt(gameSettings);
```

### 🛠️ Narrative Utilities

**File**: `narrative-styles-demo.ts`

**Chức năng**:

- Demo sử dụng các prompt styles
- Validation prompt output
- Utility functions cho narrative generation

**Sử dụng**:

```typescript
import {
  generatePromptByStyle,
  validatePromptOutput,
  NARRATIVE_STYLES,
} from './narrative-styles-demo';

// Tạo prompt theo style
const prompt = generatePromptByStyle('chinese', gameSettings);

// Validate output
const validation = validatePromptOutput(prompt);
```

## ⚙️ CHAIN OF THOUGHT PROMPTING SYSTEM

## Kiến trúc hệ thống

### Nguyên tắc cốt lõi

1. **Type-First Approach**: Mọi thứ phải được sinh ra dựa trên hệ thống type đã khai báo
2. **Chain of Thought**: Thực hiện từng giai đoạn một cách logic và tuần tự
3. **Validation-Driven**: Mỗi giai đoạn được validate trước khi chuyển tiếp
4. **Production-Ready**: Output cuối cùng sẵn sàng deploy

### Cấu trúc 6 giai đoạn

```
┌─────────────────────────────────────────────────────────────┐
│                    CHAIN OF THOUGHT PIPELINE                │
├─────────────────────────────────────────────────────────────┤
│ Stage 1: Type System Analysis                               │
│ ├─ Phân tích hệ thống type hiện có                         │
│ ├─ Hiểu context game và player                             │
│ └─ Xác định tags và types phù hợp                          │
├─────────────────────────────────────────────────────────────┤
│ Stage 2: Tag Composition Strategy                           │
│ ├─ Xây dựng chiến lược kết hợp tags                        │
│ ├─ Phân tích synergy và conflicts                          │
│ └─ Tối ưu hóa combinations                                 │
├─────────────────────────────────────────────────────────────┤
│ Stage 3: Dynamic Content Generation                         │
│ ├─ Tạo nội dung cụ thể từ tag combinations                 │
│ ├─ Áp dụng templates theo category                         │
│ └─ Đảm bảo type safety và balance                          │
├─────────────────────────────────────────────────────────────┤
│ Stage 4: Narrative Integration                              │
│ ├─ Tích hợp nội dung vào câu chuyện                        │
│ ├─ Đảm bảo tính liên tục narrative                         │
│ └─ Tạo emotional engagement                                │
├─────────────────────────────────────────────────────────────┤
│ Stage 5: Game Balance Validation                            │
│ ├─ Validate toàn diện nội dung                             │
│ ├─ Kiểm tra game balance                                   │
│ └─ Tối ưu hóa performance                                  │
├─────────────────────────────────────────────────────────────┤
│ Stage 6: Final Output Generation                            │
│ ├─ Tạo output production-ready                             │
│ ├─ Thêm metadata và monitoring                             │
│ └─ Chuẩn bị deployment                                     │
└─────────────────────────────────────────────────────────────┘
```

## Chi tiết từng giai đoạn

### Giai đoạn 1: Type System Analysis

**File**: `01-type-system-analysis.prompt.ts`

**Mục tiêu**: Phân tích sâu hệ thống type để hiểu context và xác định direction

**Input**:

- Existing tags và dynamic types
- Validation rules
- Game context hiện tại

**Output**:

- System analysis chi tiết
- Compatible tags list
- Recommended strategies

**Key Features**:

- Phân tích 32 tag categories
- Hiểu 8 rarity levels
- Mapping validation rules
- Context awareness

### Giai đoạn 2: Tag Composition Strategy

**File**: `02-tag-composition-strategy.prompt.ts`

**Mục tiêu**: Xây dựng chiến lược kết hợp tags tối ưu

**Input**:

- Available tags
- Validation rules
- Target category và power level

**Output**:

- Top 5 tag combinations
- Synergy analysis
- Risk assessment
- Optimization suggestions

**Key Features**:

- Compatibility checking
- Synergy optimization
- Balance calculation
- Conflict resolution

### Giai đoạn 3: Dynamic Content Generation

**File**: `03-dynamic-content-generation.prompt.ts`

**Mục tiêu**: Tạo nội dung cụ thể từ tag combinations

**Input**:

- Tag combinations đã validate
- Game state hiện tại
- Target category

**Output**:

- Generated dynamic types
- Category-specific properties
- Quality metrics
- Integration metadata

**Key Features**:

- Template-based generation
- Type-safe properties
- Category specialization
- Quality assurance

### Giai đoạn 4: Narrative Integration

**File**: `04-narrative-integration.prompt.ts`

**Mục tiêu**: Tích hợp nội dung vào narrative một cách tự nhiên

**Input**:

- Generated content
- Game state và story history
- Player action context

**Output**:

- Integrated narrative
- Rich story segments
- Enhanced choices
- World state updates

**Key Features**:

- Seamless integration
- Emotional engagement
- Character development
- World consistency

### Giai đoạn 5: Game Balance Validation

**File**: `05-game-balance-validation.prompt.ts`

**Mục tiêu**: Validate và đảm bảo game balance

**Input**:

- Integrated content
- Validation rules
- Balance metrics

**Output**:

- Comprehensive validation result
- Optimized content
- Quality gates status
- Performance metrics

**Key Features**:

- Type safety validation
- Game balance checking
- Narrative consistency
- Performance optimization

### Giai đoạn 6: Final Output Generation

**File**: `06-final-output-generation.prompt.ts`

**Mục tiêu**: Tạo output cuối cùng production-ready

**Input**:

- Validated content
- Validation metadata
- Player context

**Output**:

- Production-ready content
- Complete metadata
- Deployment configuration
- Monitoring hooks

**Key Features**:

- Production packaging
- Quality enhancement
- Accessibility features
- Telemetry integration

## 🎯 NARRATIVE STYLES - HƯỚNG DẪN SỬ DỤNG

### Lựa chọn phong cách phù hợp

```typescript
import { GameTheme } from '../dto/create-game.dto';
import {
  generateChineseStyleNarrativePrompt,
  generateKoreanStyleNarrativePrompt,
  generateNarrativeRulesPrompt,
} from './prompts';

// Lựa chọn style dựa trên theme
function selectNarrativeStyle(gameSettings: GameSettingsDto): string {
  switch (gameSettings.theme) {
    case GameTheme.CULTIVATION:
    case GameTheme.MARTIAL_ARTS:
    case GameTheme.REINCARNATION:
      return generateChineseStyleNarrativePrompt(gameSettings);

    case GameTheme.SYSTEM:
    case GameTheme.REGRESSION:
    case GameTheme.ISEKAI:
      return generateKoreanStyleNarrativePrompt(gameSettings);

    default:
      // Sử dụng rules chung cho các theme khác
      return generateNarrativeRulesPrompt(gameSettings);
  }
}
```

### Kết hợp nhiều styles

```typescript
// Tạo prompt hybrid kết hợp nhiều phong cách
function createHybridNarrativePrompt(gameSettings: GameSettingsDto): string {
  const baseRules = generateNarrativeRulesPrompt(gameSettings);
  const stylePrompt = selectNarrativeStyle(gameSettings);

  return `
${baseRules}

---

${stylePrompt}

## HYBRID INSTRUCTIONS
Kết hợp các quy tắc chung với phong cách đặc trưng để tạo ra câu chuyện độc đáo.
`;
}
```

### Validation và Quality Control

```typescript
import { validatePromptOutput } from './narrative-styles-demo';

async function generateValidatedNarrative(gameSettings: GameSettingsDto) {
  const prompt = selectNarrativeStyle(gameSettings);

  // Validate prompt trước khi gửi
  const validation = validatePromptOutput(prompt);

  if (!validation.isValid) {
    throw new Error(
      `Prompt validation failed: ${validation.errors.join(', ')}`,
    );
  }

  // Log warnings nếu có
  if (validation.warnings.length > 0) {
    console.warn('Prompt warnings:', validation.warnings);
  }

  // Gửi đến AI service
  const result = await aiService.generateNarrative(prompt);
  return result;
}
```

## ⚙️ CHAIN OF THOUGHT PROMPTING SYSTEM

### Tổng quan Chain of Thought

Hệ thống Chain of Thought được thiết kế theo phương pháp **Chain of Thought Prompting**, chia thành 6 giai đoạn tuần tự để đảm bảo AI hiểu sâu về hệ thống type và tạo ra nội dung game chất lượng cao.

### Basic Usage

```typescript
import { buildMasterChainOfThoughtPrompt, PIPELINE_METADATA } from './prompts';

// Tạo master prompt cho toàn bộ pipeline
const masterPrompt = buildMasterChainOfThoughtPrompt(
  gameState,
  playerAction,
  {
    tags: availableTags,
    dynamicTypes: existingTypes,
    validationRules: rules,
  },
  'equipment', // target category
  {
    contentCount: 1,
    powerLevelRange: [50, 80],
    customPrompt: 'Create a legendary weapon',
  },
);

// Gửi prompt đến AI service
const result = await aiService.processChainOfThought(masterPrompt);
```

### Stage-by-Stage Usage

```typescript
import {
  buildTypeSystemAnalysisPrompt,
  buildTagCompositionStrategyPrompt,
  // ... other stages
} from './prompts';

// Giai đoạn 1
const stage1Prompt = buildTypeSystemAnalysisPrompt(
  existingTags,
  existingDynamicTypes,
  validationRules,
  gameContext,
);

const stage1Result = await aiService.generate(stage1Prompt);

// Giai đoạn 2
const stage2Prompt = buildTagCompositionStrategyPrompt(
  stage1Result.compatibleTags,
  validationRules,
  context,
  targetCategory,
  powerLevelRange,
);

// ... tiếp tục với các giai đoạn khác
```

### Validation

```typescript
import { validatePipelineStage, calculatePipelineProgress } from './prompts';

// Validate từng giai đoạn
const validation = validatePipelineStage(1, input, output);
if (!validation.valid) {
  console.error('Stage 1 validation failed:', validation.errors);
}

// Theo dõi progress
const progress = calculatePipelineProgress(3, 6);
console.log(`Progress: ${progress.percentage}% - ${progress.currentStage}`);
```

## Quality Standards

### Type Safety

- **100% TypeScript compliance** (Bắt buộc)
- Tất cả interfaces phải được tuân thủ chính xác
- Properties phải có đúng type và validation

### Game Balance

- **≥ 85% balance score** (Khuyến nghị)
- Power level phù hợp với player progression
- Economic impact được kiểm soát

### Narrative Quality

- **≥ 90% coherence score** (Mục tiêu)
- Character consistency 100%
- World logic consistency 100%
- Emotional engagement ≥ 85%

### Performance

- **≤ 3s total processing time** (Requirement)
- Memory usage tối ưu
- Database impact tối thiểu

## 📖 NARRATIVE STYLES - BEST PRACTICES

### 1. Lựa chọn Style phù hợp

```typescript
// ✅ Tốt - Dựa trên theme và setting
const style =
  gameSettings.theme === GameTheme.CULTIVATION
    ? 'chinese'
    : gameSettings.theme === GameTheme.SYSTEM
      ? 'korean'
      : 'rules';

// ❌ Tránh - Lựa chọn random
const style = Math.random() > 0.5 ? 'chinese' : 'korean';
```

### 2. Consistency trong Narrative

```typescript
// ✅ Tốt - Maintain style consistency
class NarrativeManager {
  private selectedStyle: NarrativeStyle;

  constructor(gameSettings: GameSettingsDto) {
    this.selectedStyle = this.determineStyle(gameSettings);
  }

  generateChapter(context: any) {
    return generatePromptByStyle(this.selectedStyle, context);
  }
}

// ❌ Tránh - Thay đổi style giữa chừng
function generateChapter(context: any, randomStyle: boolean) {
  const style = randomStyle ? getRandomStyle() : this.currentStyle;
  return generatePromptByStyle(style, context);
}
```

### 3. Cultural Sensitivity

```typescript
// ✅ Tốt - Tôn trọng văn hóa
const chinesePrompt = generateChineseStyleNarrativePrompt(gameSettings);
// Prompt sẽ sử dụng thuật ngữ và cấu trúc phù hợp với văn hóa Trung Quốc

// ❌ Tránh - Stereotype hoặc không chính xác
const fakeChinesePrompt = 'Write like Chinese but use random Asian words';
```

### 4. Quality Validation

```typescript
// ✅ Tốt - Validate trước khi sử dụng
const validation = validatePromptOutput(prompt);
if (validation.isValid && validation.metrics.hasCharacterInfo) {
  await processNarrative(prompt);
}

// ❌ Tránh - Bỏ qua validation
await processNarrative(prompt); // Có thể có lỗi
```

## 🎮 NARRATIVE EXAMPLES

### Chinese Style Example

```typescript
const gameSettings: GameSettingsDto = {
  theme: GameTheme.CULTIVATION,
  setting: 'Thế giới tu tiên với các tông phái cổ đại',
  characterName: 'Trương Vô Kỵ',
  characterBackstory: 'Thiếu niên mồ côi với huyết mạch đặc biệt',
};

const chinesePrompt = generateChineseStyleNarrativePrompt(gameSettings);
// Output: Prompt với phong cách tu tiên, nhấn mạnh tu luyện, định mệnh
```

### Korean Style Example

```typescript
const gameSettings: GameSettingsDto = {
  theme: GameTheme.SYSTEM,
  setting: 'Thế giới hiện đại với dungeon và hunter',
  characterName: 'Park Jin-Woo',
  characterBackstory: 'Hunter hạng E được hệ thống lựa chọn',
};

const koreanPrompt = generateKoreanStyleNarrativePrompt(gameSettings);
// Output: Prompt với phong cách system, level up, guild
```

### Rules Example

```typescript
const gameSettings: GameSettingsDto = {
  theme: GameTheme.FANTASY,
  setting: 'Thế giới fantasy truyền thống',
  characterName: 'Aragorn',
  characterBackstory: 'Hoàng tử lưu vong',
};

const rulesPrompt = generateNarrativeRulesPrompt(gameSettings);
// Output: Quy tắc chung cho mọi phong cách
```

## ⚙️ CHAIN OF THOUGHT - BEST PRACTICES

### 1. Type-First Development

```typescript
// ✅ Tốt - Dựa trên types đã định nghĩa
const equipment: DynamicType = {
  category: DynamicTypeCategory.EQUIPMENT,
  tags: validatedTags,
  baseProperties: typedProperties,
  // ...
};

// ❌ Tránh - Tạo properties tùy ý
const equipment = {
  category: 'weapon', // string thay vì enum
  randomProperty: 'value', // không có trong interface
  // ...
};
```

### 2. Validation-Driven

```typescript
// ✅ Tốt - Validate trước khi sử dụng
const validation = validateTagCombination(tags, rules);
if (validation.isValid) {
  const content = generateContent(tags);
}

// ❌ Tránh - Bỏ qua validation
const content = generateContent(tags); // Có thể tạo ra content không hợp lệ
```

### 3. Context Awareness

```typescript
// ✅ Tốt - Sử dụng context đầy đủ
const prompt = buildPrompt(gameState, playerAction, fullContext);

// ❌ Tránh - Thiếu context
const prompt = buildPrompt(gameState); // Thiếu thông tin quan trọng
```

## 🔧 NARRATIVE STYLES - TROUBLESHOOTING

### Common Issues với Narrative Styles

1. **Style Mismatch**

   ```typescript
   // Problem: Theme không match với style
   const gameSettings = { theme: GameTheme.SCIFI };
   const prompt = generateChineseStyleNarrativePrompt(gameSettings); // ❌

   // Solution: Sử dụng style phù hợp
   const prompt =
     gameSettings.theme === GameTheme.CULTIVATION
       ? generateChineseStyleNarrativePrompt(gameSettings)
       : generateNarrativeRulesPrompt(gameSettings); // ✅
   ```

2. **Cultural Inconsistency**

   ```typescript
   // Problem: Trộn lẫn các yếu tố văn hóa
   const mixedPrompt = chinesePrompt + koreanPrompt; // ❌

   // Solution: Giữ consistency
   const consistentPrompt = selectNarrativeStyle(gameSettings); // ✅
   ```

3. **Validation Failures**

   ```typescript
   // Problem: Prompt không pass validation
   const validation = validatePromptOutput(prompt);
   if (!validation.isValid) {
     console.error(validation.errors); // Check lỗi cụ thể
   }

   // Solution: Fix theo errors
   if (validation.errors.includes('Missing character information')) {
     // Đảm bảo gameSettings có đầy đủ thông tin
   }
   ```

4. **Performance Issues**

   ```typescript
   // Problem: Prompt quá dài
   if (prompt.length > 5000) {
     console.warn('Prompt might be too long');
   }

   // Solution: Optimize prompt length
   const optimizedPrompt = optimizePromptLength(prompt);
   ```

### Debug Mode cho Narrative

```typescript
// Enable debug cho narrative generation
const debugConfig = {
  logPromptGeneration: true,
  validateOutput: true,
  trackMetrics: true,
};

const result = await generateNarrative(gameSettings, debugConfig);
```

## ⚙️ CHAIN OF THOUGHT - TROUBLESHOOTING

### Common Issues

1. **Type Safety Violations**

   - Kiểm tra interfaces compliance
   - Validate property types
   - Đảm bảo required fields

2. **Game Balance Issues**

   - Kiểm tra power level calculations
   - Review progression curves
   - Validate economic impact

3. **Narrative Inconsistencies**

   - Check character behavior consistency
   - Validate world logic
   - Review story flow

4. **Performance Problems**
   - Optimize complex calculations
   - Reduce memory usage
   - Cache frequently used data

### Debug Mode

```typescript
// Enable debug mode for detailed logging
const result = await processChainOfThought(prompt, {
  debug: true,
  logLevel: 'verbose',
  validateEachStage: true,
});
```

## Monitoring và Analytics

### Metrics Tracking

- Processing time per stage
- Quality scores
- Validation pass rates
- User engagement metrics

### Performance Monitoring

- Memory usage patterns
- Database query optimization
- API response times
- Error rates

## 🗺️ ROADMAP

### 📚 Narrative Styles - Version 1.1

- [ ] **Japanese Light Novel Style**: Phong cách light novel Nhật Bản
- [ ] **Western Fantasy Style**: Phong cách fantasy phương Tây
- [ ] **Vietnamese Traditional Style**: Phong cách truyện cổ tích Việt Nam
- [ ] **Hybrid Style Generator**: Tự động kết hợp nhiều phong cách
- [ ] **Style Recommendation Engine**: AI gợi ý style phù hợp
- [ ] **Cultural Sensitivity Checker**: Kiểm tra tính chính xác văn hóa

### 📚 Narrative Styles - Version 1.2

- [ ] **Dynamic Style Adaptation**: Thay đổi style theo player preference
- [ ] **Community Style Templates**: Cho phép user tạo style riêng
- [ ] **Multi-language Narrative**: Hỗ trợ nhiều ngôn ngữ
- [ ] **Voice Style Matching**: Match style với voice acting
- [ ] **Emotional Tone Analysis**: Phân tích và điều chỉnh tone
- [ ] **Interactive Style Tutorial**: Hướng dẫn tương tác về các style

### ⚙️ Chain of Thought - Version 1.1

- [ ] Advanced synergy detection
- [ ] Machine learning optimization
- [ ] Real-time balance adjustment
- [ ] Enhanced narrative templates

### ⚙️ Chain of Thought - Version 1.2

- [ ] Multi-language support
- [ ] Custom validation rules
- [ ] Advanced analytics
- [ ] A/B testing framework

### 🔮 Future Vision (Version 2.0)

- [ ] **AI Style Learning**: AI học từ feedback để cải thiện style
- [ ] **Cross-Cultural Fusion**: Tự động tạo fusion styles
- [ ] **Real-time Style Adaptation**: Thay đổi style theo gameplay
- [ ] **Personalized Narrative Engine**: Engine cá nhân hóa hoàn toàn
- [ ] **VR/AR Narrative Integration**: Tích hợp với VR/AR
- [ ] **Collaborative Storytelling**: Nhiều player cùng tạo story

## 🤝 CONTRIBUTING

### Contributing to Narrative Styles

Khi thêm narrative style mới:

1. **Research văn hóa kỹ lưỡng**

   ```typescript
   // ✅ Tốt - Research đầy đủ về văn hóa
   const japaneseStyle = {
     themes: ['isekai', 'slice_of_life', 'school'],
     structure: ['kishōtenketsu'], // 4-act structure
     language: ['keigo', 'casual', 'dialect'],
     culturalElements: ['wa', 'giri', 'ninjo'],
   };
   ```

2. **Tạo template chuẩn**

   ```typescript
   export function generateNewStyleNarrativePrompt(
     gameSettings: GameSettingsDto,
   ): string {
     return `
   # PHONG CÁCH [TÊN STYLE] - LIFEPATH.AI
   
   ## THÔNG TIN NHÂN VẬT
   // ... standard format
   
   ## HƯỚNG DẪN VIẾT THEO PHONG CÁCH [STYLE]
   // ... style-specific guidelines
   `;
   }
   ```

3. **Thêm validation rules**

   ```typescript
   export function validateNewStylePrompt(prompt: string): ValidationResult {
     // Validate style-specific requirements
   }
   ```

4. **Tạo demo và tests**

   ```typescript
   export function demoNewStylePrompt() {
     const sampleSettings = createSampleGameSettings();
     const prompt = generateNewStyleNarrativePrompt(sampleSettings);
     console.log(prompt);
   }
   ```

5. **Update exports và documentation**

   ```typescript
   // Thêm vào index.ts
   export { generateNewStyleNarrativePrompt } from './new-style-narrative.prompt';

   // Update README.md với thông tin style mới
   ```

### Contributing to Chain of Thought

Khi contribute vào hệ thống Chain of Thought:

1. **Tuân thủ type system** - Tất cả changes phải type-safe
2. **Maintain chain logic** - Đảm bảo logic chain of thought
3. **Add comprehensive tests** - Test coverage ≥ 90%
4. **Update documentation** - Document tất cả changes
5. **Performance testing** - Đảm bảo không impact performance

### Code Review Checklist

#### For Narrative Styles:

- [ ] Cultural accuracy verified
- [ ] Style consistency maintained
- [ ] Proper TypeScript typing
- [ ] Validation functions included
- [ ] Demo examples provided
- [ ] Documentation updated
- [ ] No cultural stereotypes
- [ ] Appropriate content guidelines

#### For Chain of Thought:

- [ ] Type safety maintained
- [ ] Chain logic preserved
- [ ] Performance benchmarks met
- [ ] Validation rules updated
- [ ] Test coverage ≥ 90%
- [ ] Documentation complete
- [ ] Backward compatibility
- [ ] Error handling robust

### Style Guidelines

```typescript
// ✅ Good - Consistent naming
export function generateChineseStyleNarrativePrompt() {}
export function generateKoreanStyleNarrativePrompt() {}
export function generateJapaneseStyleNarrativePrompt() {}

// ❌ Bad - Inconsistent naming
export function chinesePrompt() {}
export function createKoreanStyle() {}
export function japaneseNarrativeGenerator() {}
```

### Testing Requirements

```typescript
// Test cho mỗi narrative style
describe('Chinese Style Narrative', () => {
  it('should generate valid prompt', () => {
    const prompt = generateChineseStyleNarrativePrompt(sampleSettings);
    const validation = validatePromptOutput(prompt);
    expect(validation.isValid).toBe(true);
  });

  it('should include cultural elements', () => {
    const prompt = generateChineseStyleNarrativePrompt(sampleSettings);
    expect(prompt).toContain('tu luyện');
    expect(prompt).toContain('định mệnh');
  });
});
```

## License

MIT License - See LICENSE file for details.
