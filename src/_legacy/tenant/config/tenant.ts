// Configuracao de Tenant para White-Label

export interface TenantConfig {
  id: string;
  name: string;

  // Features habilitadas
  features: {
    photos: boolean;
    rsvp: boolean;
    contracts: boolean;
    checkin: boolean;
    pix: boolean;
  };

  // Limites do plano
  limits: {
    maxGuests: number;
    maxPhotos: number;
    maxAdmins: number;
  };

  // Customizacao visual
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };

  // Backend
  backend: 'supabase' | 'firebase' | 'custom';

  // Integracoes
  integrations: {
    analytics?: string;
    payment?: 'pix' | 'stripe' | 'mercadopago';
  };
}

// Configuracao padrao (tenant atual)
const defaultConfig: TenantConfig = {
  id: 'default',
  name: 'Lista de Casamento',
  features: {
    photos: true,
    rsvp: true,
    contracts: true,
    checkin: true,
    pix: true,
  },
  limits: {
    maxGuests: 500,
    maxPhotos: 1000,
    maxAdmins: 5,
  },
  theme: {
    primaryColor: '#8B5A5A',
    secondaryColor: '#D4A574',
    logoUrl: '',
    faviconUrl: '',
  },
  backend: 'supabase',
  integrations: {
    payment: 'pix',
  },
};

// Configuracao carregada dinamicamente
let currentTenant: TenantConfig = defaultConfig;

export const loadTenantConfig = async (tenantId: string): Promise<TenantConfig> => {
  // Por enquanto retorna config padrao
  // No futuro: carregar do backend ou arquivo de config
  console.log(`Loading tenant config for: ${tenantId}`);
  currentTenant = { ...defaultConfig, id: tenantId };
  return currentTenant;
};

export const getTenant = (): TenantConfig => {
  return currentTenant;
};

export const useTenant = (): TenantConfig => {
  return currentTenant;
};

export const hasFeature = (feature: keyof TenantConfig['features']): boolean => {
  return currentTenant?.features[feature] ?? false;
};

export const getLimit = (limit: keyof TenantConfig['limits']): number => {
  return currentTenant?.limits[limit] ?? 0;
};

export const setTenant = (config: TenantConfig): void => {
  currentTenant = config;
};
