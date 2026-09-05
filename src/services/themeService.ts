export type ThemeId = 'midnight' | 'forest' | 'carbon' | 'daylight';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  dotColor: string;
  bgClass: string;
  cardClass: string;
  borderClass: string;
  textPrimary: string;
  textSecondary: string;
  accentClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Emerald',
    dotColor: '#10b981',
    bgClass: 'bg-[#090d16]',
    cardClass: 'bg-[#111827]',
    borderClass: 'border-[#1f2937]',
    textPrimary: 'text-[#f8fafc]',
    textSecondary: 'text-[#94a3b8]',
    accentClass: 'bg-[#10b981] text-neutral-950'
  },
  forest: {
    id: 'forest',
    name: 'Pine & Gold',
    dotColor: '#f59e0b',
    bgClass: 'bg-[#05140d]',
    cardClass: 'bg-[#0d241a]',
    borderClass: 'border-[#1b3d2c]',
    textPrimary: 'text-[#f1f5f9]',
    textSecondary: 'text-[#8ba79b]',
    accentClass: 'bg-[#f59e0b] text-neutral-950'
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon & Orange',
    dotColor: '#f97316',
    bgClass: 'bg-[#0f0f12]',
    cardClass: 'bg-[#18181f]',
    borderClass: 'border-[#272732]',
    textPrimary: 'text-[#ffffff]',
    textSecondary: 'text-[#a1a1aa]',
    accentClass: 'bg-[#f97316] text-white'
  },
  daylight: {
    id: 'daylight',
    name: 'Daylight Sun',
    dotColor: '#059669',
    bgClass: 'bg-[#f1f5f9]',
    cardClass: 'bg-[#ffffff]',
    borderClass: 'border-[#cbd5e1]',
    textPrimary: 'text-[#0f172a]',
    textSecondary: 'text-[#475569]',
    accentClass: 'bg-[#059669] text-white'
  }
};

const THEME_KEY = 'sore_sacks_theme';

export const themeService = {
  getTheme(): ThemeId {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return 'forest'; // Default theme changed to Forest
  },

  setTheme(themeId: ThemeId): void {
    try {
      localStorage.setItem(THEME_KEY, themeId);
      document.documentElement.setAttribute('data-theme', themeId);
    } catch {}
  }
};
