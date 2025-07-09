/**
 * Utility functions for handling narrative terms based on storytelling style
 */

export type NarrativeStyle = 'Chinese' | 'Korean' | 'Vietnamese';

export interface NarrativeTerms {
  level: string;
  experience: string;
  health: string;
  mana: string;
  strength: string;
  agility: string;
  intelligence: string;
  wisdom: string;
  constitution: string;
  charisma: string;
  luck: string;
  stamina: string;
}

const NARRATIVE_TERMS: Record<NarrativeStyle, NarrativeTerms> = {
  Chinese: {
    level: 'Cảnh giới',
    experience: 'Tu vi',
    health: 'Sinh lực',
    mana: 'Linh lực',
    strength: 'Sức mạnh',
    agility: 'Nhanh nhẹn',
    intelligence: 'Trí tuệ',
    wisdom: 'Hiểu biết',
    constitution: 'Thể chất',
    charisma: 'Uy tín',
    luck: 'May mắn',
    stamina: 'Thể lực',
  },
  Korean: {
    level: 'Cấp độ',
    experience: 'Kinh nghiệm',
    health: 'Sinh lực',
    mana: 'Ma lực',
    strength: 'Sức mạnh',
    agility: 'Nhanh nhẹn',
    intelligence: 'Trí tuệ',
    wisdom: 'Hiểu biết',
    constitution: 'Thể chất',
    charisma: 'Uy tín',
    luck: 'May mắn',
    stamina: 'Thể lực',
  },
  Vietnamese: {
    level: 'Cấp độ',
    experience: 'Kinh nghiệm',
    health: 'Sinh lực',
    mana: 'Ma lực',
    strength: 'Sức mạnh',
    agility: 'Nhanh nhẹn',
    intelligence: 'Trí tuệ',
    wisdom: 'Hiểu biết',
    constitution: 'Thể chất',
    charisma: 'Uy tín',
    luck: 'May mắn',
    stamina: 'Thể lực',
  },
};

/**
 * Get narrative terms based on storytelling style
 */
export function getNarrativeTerms(style?: string): NarrativeTerms {
  const narrativeStyle = (style as NarrativeStyle) || 'Vietnamese';
  return NARRATIVE_TERMS[narrativeStyle] || NARRATIVE_TERMS.Vietnamese;
}

/**
 * Get specific term based on storytelling style
 */
export function getNarrativeTerm(
  termKey: keyof NarrativeTerms,
  style?: string,
): string {
  const terms = getNarrativeTerms(style);
  return terms[termKey];
}

/**
 * Create stat mapping based on narrative style
 */
export function createStatMapping(style?: string): Record<string, string> {
  const terms = getNarrativeTerms(style);

  return {
    // English terms
    Strength: terms.strength,
    Agility: terms.agility,
    Intelligence: terms.intelligence,
    Wisdom: terms.wisdom,
    Constitution: terms.constitution,
    Charisma: terms.charisma,
    Luck: terms.luck,
    Level: terms.level,
    Experience: terms.experience,
    Health: terms.health,
    Mana: terms.mana,
    Stamina: terms.stamina,

    // Vietnamese terms (default)
    'Sức Mạnh': terms.strength,
    'Nhanh Nhẹn': terms.agility,
    'Trí Tuệ': terms.intelligence,
    'Khôn Ngoan': terms.wisdom,
    'Thể Chất': terms.constitution,
    'Quyến Rũ': terms.charisma,
    'May Mắn': terms.luck,
    'Cấp độ': terms.level,
    'Kinh Nghiệm': terms.experience,
    'Sinh Lực': terms.health,
    'Ma lực': terms.mana,
    'Thể Lực': terms.stamina,

    // Chinese terms
    'Cảnh giới': terms.level,
    'Tu vi': terms.experience,
    'Linh lực': terms.mana,
    'Uy tín': terms.charisma,
    'Hiểu biết': terms.wisdom,
  };
}

/**
 * Format level display based on narrative style
 */
export function formatLevelDisplay(level: number, style?: string): string {
  if (style === 'Chinese') {
    // Chinese cultivation realms
    const cultivationRealms = [
      {
        min: 1,
        max: 9,
        name: 'Luyện Khí',
        format: (l: number) => `Luyện Khí tầng ${l}`,
      },
      {
        min: 10,
        max: 18,
        name: 'Trúc Cơ',
        format: (l: number) => `Trúc Cơ tầng ${l - 9}`,
      },
      {
        min: 19,
        max: 27,
        name: 'Kim Đan',
        format: (l: number) => `Kim Đan tầng ${l - 18}`,
      },
      {
        min: 28,
        max: 36,
        name: 'Nguyên Anh',
        format: (l: number) => `Nguyên Anh tầng ${l - 27}`,
      },
      {
        min: 37,
        max: 45,
        name: 'Hóa Thần',
        format: (l: number) => `Hóa Thần tầng ${l - 36}`,
      },
      {
        min: 46,
        max: 54,
        name: 'Luyện Hư',
        format: (l: number) => `Luyện Hư tầng ${l - 45}`,
      },
      {
        min: 55,
        max: 63,
        name: 'Hợp Thể',
        format: (l: number) => `Hợp Thể tầng ${l - 54}`,
      },
      {
        min: 64,
        max: 72,
        name: 'Đại Thừa',
        format: (l: number) => `Đại Thừa tầng ${l - 63}`,
      },
      {
        min: 73,
        max: 81,
        name: 'Độ Kiếp',
        format: (l: number) => `Độ Kiếp tầng ${l - 72}`,
      },
      {
        min: 82,
        max: 90,
        name: 'Địa Tiên',
        format: (l: number) => `Địa Tiên tầng ${l - 81}`,
      },
      {
        min: 91,
        max: 99,
        name: 'Thiên Tiên',
        format: (l: number) => `Thiên Tiên tầng ${l - 90}`,
      },
      {
        min: 100,
        max: Infinity,
        name: 'Kim Tiên',
        format: (l: number) => `Kim Tiên tầng ${l - 99}`,
      },
    ];

    const realm = cultivationRealms.find(
      (r) => level >= r.min && level <= r.max,
    );
    if (realm) {
      return realm.format(level);
    }
  }

  // Default format for Korean and Vietnamese
  const levelTerm = getNarrativeTerm('level', style);
  return `${levelTerm} ${level}`;
}

/**
 * Convert stats object to use narrative terms
 */
export function convertStatsToNarrativeTerms(
  stats: Record<string, any>,
  style?: string,
): Record<string, any> {
  const mapping = createStatMapping(style);
  const convertedStats: Record<string, any> = {};

  Object.entries(stats).forEach(([key, value]) => {
    const narrativeKey = mapping[key] || key;
    convertedStats[narrativeKey] = value;
  });

  return convertedStats;
}
