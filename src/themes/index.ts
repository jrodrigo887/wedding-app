// Theme System - Export available themes
export const AVAILABLE_THEMES = ['default', 'elegant', 'modern'] as const;

export type ThemeName = (typeof AVAILABLE_THEMES)[number];

export interface ThemeInfo {
  id: ThemeName;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const THEMES: Record<ThemeName, ThemeInfo> = {
  default: {
    id: 'default',
    name: 'Romântico',
    description: 'Tema clássico com tons de rosa e dourado',
    preview: {
      primary: '#8B5A5A',
      secondary: '#D4A574',
      background: '#FDF8F5',
    },
  },
  elegant: {
    id: 'elegant',
    name: 'Elegante',
    description: 'Sofisticado com azul marinho e dourado',
    preview: {
      primary: '#1a365d',
      secondary: '#c9a227',
      background: '#f8fafc',
    },
  },
  modern: {
    id: 'modern',
    name: 'Moderno',
    description: 'Minimalista com tons neutros e verde',
    preview: {
      primary: '#059669',
      secondary: '#6366f1',
      background: '#fafafa',
    },
  },
};
