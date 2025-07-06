import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GeminiService } from './gemini.service';
import { NPCService } from './services/npc.service';

describe('Death Cause System', () => {
  let service: GamesService;
  let mockRepository: any;
  let mockGeminiService: any;
  let mockNPCService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    mockGeminiService = {
      generateGameContent: jest.fn(),
    };

    mockNPCService = {
      processLoreFragments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockRepository,
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: NPCService,
          useValue: mockNPCService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  describe('extractDeathCause', () => {
    it('should extract death cause from DEATH_CAUSE tag with quotes', () => {
      const storyText = `
        Nhân vật chiến đấu dũng cảm nhưng cuối cùng không thể chống chọi được.
        [DEATH_CAUSE: "Bị thương nặng do đòn tấn công của Hắc Ám Sát Thủ, mất máu quá nhiều"]
        [STATS: Sinh Lực=0/100]
      `;

      const result = (service as any).extractDeathCause(storyText);
      expect(result).toBe(
        'Bị thương nặng do đòn tấn công của Hắc Ám Sát Thủ, mất máu quá nhiều',
      );
    });

    it('should extract death cause from DEATH_CAUSE tag without quotes', () => {
      const storyText = `
        Cuộc chiến kết thúc bi thảm.
        [DEATH_CAUSE: Trúng độc từ Ngũ Độc Tán, cơ thể không chịu nổi]
        [STATS: Sinh Lực=0/100]
      `;

      const result = (service as any).extractDeathCause(storyText);
      expect(result).toBe('Trúng độc từ Ngũ Độc Tán, cơ thể không chịu nổi');
    });

    it('should fallback to keyword-based extraction when no DEATH_CAUSE tag', () => {
      const storyText = `
        Nhân vật cố gắng chạy trốn nhưng không kịp.
        Cuối cùng, anh ta bị thương nặng và mất máu quá nhiều.
        Tầm nhìn dần mờ đi và anh ta ngã xuống không bao giờ tỉnh lại.
      `;

      const result = (service as any).extractDeathCause(storyText);
      // Should find the sentence with death keywords
      expect(result).toContain('ngã xuống');
    });

    it('should return fallback message when no death keywords found', () => {
      const storyText = `Nhân vật tiếp tục cuộc hành trình của mình.`;

      const result = (service as any).extractDeathCause(storyText);
      // Should return the last sentence as fallback
      expect(result).toBe('Nhân vật tiếp tục cuộc hành trình của mình');
    });
  });

  describe('parseAiResponse', () => {
    it('should parse DEATH_CAUSE tag correctly', () => {
      const aiResponse = `
        Nhân vật đã chiến đấu hết sức nhưng không thể thắng được kẻ thù.
        Anh ta ngã xuống trong vinh quang.
        
        [STATS: Sinh Lực=0/100, Sức Mạnh=50]
        [DEATH_CAUSE: "Bị sát thủ đâm thấu tim bằng thanh kiếm độc"]
        [KARMA_SCORE: +5, "Hy sinh để bảo vệ người vô tội"]
        
        1. [AN TOÀN] Chấp nhận cái chết
        2. [NGUY HIỂM] Cố gắng hồi sinh
      `;

      const result = (service as any).parseAiResponse(aiResponse);

      expect(result.deathCause).toBe(
        'Bị sát thủ đâm thấu tim bằng thanh kiếm độc',
      );
      expect(result.stats['Sinh Lực']).toBe('0/100');
      expect(result.karmaChange).toBe(5);
    });

    it('should handle missing DEATH_CAUSE tag gracefully', () => {
      const aiResponse = `
        Nhân vật tiếp tục cuộc phiêu lưu.
        
        [STATS: Sinh Lực=80/100, Sức Mạnh=60]
        [KARMA_SCORE: +2, "Giúp đỡ người dân"]
        
        1. [AN TOÀN] Tiếp tục đi
        2. [THẬN TRỌNG] Nghỉ ngơi
      `;

      const result = (service as any).parseAiResponse(aiResponse);

      expect(result.deathCause).toBeUndefined();
      expect(result.stats['Sinh Lực']).toBe('80/100');
    });
  });

  describe('checkIfCharacterIsDead', () => {
    it('should detect death when health is 0', () => {
      const stats = { 'Sinh Lực': '0/100', 'Sức Mạnh': '50' };
      const result = (service as any).checkIfCharacterIsDead(stats);
      expect(result).toBe(true);
    });

    it('should detect alive when health is above 0', () => {
      const stats = { 'Sinh Lực': '50/100', 'Sức Mạnh': '50' };
      const result = (service as any).checkIfCharacterIsDead(stats);
      expect(result).toBe(false);
    });

    it('should handle different health stat names', () => {
      const stats1 = { Health: '0/100' };
      const stats2 = { HP: '0' };
      const stats3 = { Máu: '0/80' };

      expect((service as any).checkIfCharacterIsDead(stats1)).toBe(true);
      expect((service as any).checkIfCharacterIsDead(stats2)).toBe(true);
      expect((service as any).checkIfCharacterIsDead(stats3)).toBe(true);
    });
  });
});
