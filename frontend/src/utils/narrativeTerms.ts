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
 * Format stat name based on storytelling style
 */
export function formatStatName(statName: string, style?: string): string {
  const terms = getNarrativeTerms(style);

  // Map common stat names to narrative terms
  const statMapping: Record<string, keyof NarrativeTerms> = {
    level: 'level',
    experience: 'experience',
    exp: 'experience',
    health: 'health',
    hp: 'health',
    mana: 'mana',
    mp: 'mana',
    strength: 'strength',
    str: 'strength',
    agility: 'agility',
    agi: 'agility',
    intelligence: 'intelligence',
    int: 'intelligence',
    wisdom: 'wisdom',
    wis: 'wisdom',
    constitution: 'constitution',
    con: 'constitution',
    charisma: 'charisma',
    cha: 'charisma',
  };

  const normalizedStatName = statName.toLowerCase();
  const termKey = statMapping[normalizedStatName];

  if (termKey) {
    return terms[termKey];
  }

  // If no mapping found, return original name
  return statName;
}
