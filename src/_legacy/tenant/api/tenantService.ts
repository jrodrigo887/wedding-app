// ========================================
// SERVIÇO DE TENANT
// Gerencia carregamento e persistência de configuração do tenant
// ========================================

import { supabase } from '@shared/lib/supabase';
import { type TenantConfig, setTenant } from '@shared/config/tenant';

// Interface do tenant no banco de dados
interface TenantRow {
  id: string;
  slug: string;
  name: string;
  features: TenantConfig['features'];
  limits: TenantConfig['limits'];
  theme: TenantConfig['theme'];
  config: {
    backend: TenantConfig['backend'];
    integrations: TenantConfig['integrations'];
  };
  plan: string;
  is_active: boolean;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

// Cache do tenant atual
let cachedTenant: TenantConfig | null = null;
let cachedTenantId: string | null = null;

/**
 * Converte dados do banco para TenantConfig
 */
function mapRowToTenantConfig(row: TenantRow): TenantConfig {
  return {
    id: row.id,
    name: row.name,
    features: row.features,
    limits: row.limits,
    theme: {
      primaryColor: row.theme.primaryColor || '#8B5A5A',
      secondaryColor: row.theme.secondaryColor || '#D4A574',
      logoUrl: row.theme.logoUrl || '',
      faviconUrl: row.theme.faviconUrl || '',
    },
    backend: row.config?.backend || 'supabase',
    integrations: row.config?.integrations || {},
  };
}

/**
 * Define o tenant_id no contexto da sessão Supabase
 * Isso é necessário para que as políticas RLS funcionem
 */
async function setTenantContext(tenantId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('set_current_tenant_id', {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.warn('[TenantService] Erro ao definir contexto do tenant:', error);
    }
  } catch (err) {
    console.warn('[TenantService] Função RPC não disponível:', err);
  }
}

/**
 * Carrega tenant pelo slug
 */
export async function loadTenantBySlug(slug: string): Promise<TenantConfig | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`[TenantService] Tenant não encontrado: ${slug}`);
        return null;
      }
      throw error;
    }

    const config = mapRowToTenantConfig(data as TenantRow);

    // Cachear e definir como tenant atual
    cachedTenant = config;
    cachedTenantId = config.id;
    setTenant(config);

    // Definir contexto RLS
    await setTenantContext(config.id);

    console.log(`[TenantService] Tenant carregado: ${config.name} (${slug})`);
    return config;
  } catch (err) {
    console.error('[TenantService] Erro ao carregar tenant:', err);
    return null;
  }
}

/**
 * Carrega tenant pelo domínio customizado
 */
export async function loadTenantByDomain(domain: string): Promise<TenantConfig | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('custom_domain', domain)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`[TenantService] Tenant não encontrado para domínio: ${domain}`);
        return null;
      }
      throw error;
    }

    const config = mapRowToTenantConfig(data as TenantRow);

    // Cachear e definir como tenant atual
    cachedTenant = config;
    cachedTenantId = config.id;
    setTenant(config);

    // Definir contexto RLS
    await setTenantContext(config.id);

    console.log(`[TenantService] Tenant carregado por domínio: ${config.name}`);
    return config;
  } catch (err) {
    console.error('[TenantService] Erro ao carregar tenant por domínio:', err);
    return null;
  }
}

/**
 * Carrega tenant pelo ID
 */
export async function loadTenantById(id: string): Promise<TenantConfig | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`[TenantService] Tenant não encontrado: ${id}`);
        return null;
      }
      throw error;
    }

    const config = mapRowToTenantConfig(data as TenantRow);

    // Cachear e definir como tenant atual
    cachedTenant = config;
    cachedTenantId = config.id;
    setTenant(config);

    // Definir contexto RLS
    await setTenantContext(config.id);

    return config;
  } catch (err) {
    console.error('[TenantService] Erro ao carregar tenant:', err);
    return null;
  }
}

/**
 * Retorna o tenant cacheado
 */
export function getCachedTenant(): TenantConfig | null {
  return cachedTenant;
}

/**
 * Retorna o ID do tenant atual
 */
export function getCurrentTenantId(): string | null {
  return cachedTenantId;
}

/**
 * Limpa o cache do tenant
 */
export function clearTenantCache(): void {
  cachedTenant = null;
  cachedTenantId = null;
}

/**
 * Verifica se o tenant atual está dentro do limite
 */
export function checkTenantLimit(
  limit: keyof TenantConfig['limits'],
  currentValue: number
): { allowed: boolean; max: number; current: number } {
  if (!cachedTenant) {
    return { allowed: true, max: Infinity, current: currentValue };
  }

  const max = cachedTenant.limits[limit];
  return {
    allowed: currentValue < max,
    max,
    current: currentValue,
  };
}

/**
 * Atualiza configuração do tenant no banco
 */
export async function updateTenantConfig(
  tenantId: string,
  updates: Partial<Pick<TenantRow, 'features' | 'limits' | 'theme' | 'config'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId);

    if (error) {
      console.error('[TenantService] Erro ao atualizar tenant:', error);
      return false;
    }

    // Recarregar tenant para atualizar cache
    await loadTenantById(tenantId);

    return true;
  } catch (err) {
    console.error('[TenantService] Erro ao atualizar tenant:', err);
    return false;
  }
}
