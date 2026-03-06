// Identificador da aplicação (sem multi-tenancy)
export const APP_TENANT_ID = 'default';

export const APP_CONFIG = {
  APP_NAME: 'Lista de Casamento',
  BRIDE_NAME: 'Rodrigo',
  GROOM_NAME: 'Elisa',
  WEDDING_DATE: '2026-04-12',
  PIX_KEY: '83999480965',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  API_TIMEOUT: 10000,
  NOTIFICATION_DURATION: 3000,
  BENEFICIARY_NAME: 'João Rodrigo Filipe da Silva',
  CONTACT_EMAIL: 'rodrigo.elisa2026@gmail.com',
} as const;

export const API_ENDPOINTS = {
  GIFTS: '/gifts',
  RESERVE: '/gifts/:id/reserve',
  CATEGORIES: '/categories',
} as const;

export const GIFT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
} as const;

export type GiftStatus = (typeof GIFT_STATUS)[keyof typeof GIFT_STATUS];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const MESSAGES = {
  SUCCESS: {
    RESERVE: 'Presente reservado com sucesso!',
    COPY: 'Chave PIX copiada!',
  },
  ERROR: {
    RESERVE: 'Erro ao reservar presente. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    GENERIC: 'Algo deu errado. Tente novamente mais tarde.',
    VALIDATION: 'Por favor, preencha todos os campos obrigatórios.',
  },
  WARNING: {
    ALREADY_RESERVED: 'Este presente já foi reservado.',
  },
  INFO: {
    LOADING: 'Carregando presentes...',
  },
} as const;

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ÿ\s]+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
  },
} as const;
