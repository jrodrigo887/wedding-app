// ========================================
// TENANT RESOLVER
// Identifica o tenant atual baseado na URL ou domínio
// ========================================

import {
  type TenantConfig,
  loadTenantConfig,
  useTenant,
  setTenant,
} from '@shared/config/tenant';
import { loadTenantBySlug, loadTenantByDomain } from '@shared/api/tenantService';

// Estratégias de resolução de tenant
export type TenantResolutionStrategy =
  | 'subdomain' // tenant.exemplo.com
  | 'path' // exemplo.com/tenant-slug
  | 'query' // exemplo.com?tenant=slug
  | 'domain'; // dominio-customizado.com

export interface TenantResolverConfig {
  // Estratégias a serem usadas, em ordem de prioridade
  strategies: TenantResolutionStrategy[];

  // Domínio base (para estratégia subdomain)
  baseDomain?: string;

  // Slug do tenant padrão (fallback)
  defaultTenantSlug?: string;

  // Parâmetro de query para estratégia query
  queryParam?: string;

  // Prefixo do path para estratégia path (ex: /app/)
  pathPrefix?: string;
}

// Configuração padrão
const DEFAULT_CONFIG: TenantResolverConfig = {
  strategies: ['subdomain', 'path', 'domain'],
  baseDomain: import.meta.env.VITE_BASE_DOMAIN || 'localhost',
  defaultTenantSlug: 'default',
  queryParam: 'tenant',
  pathPrefix: '',
};

let resolverConfig: TenantResolverConfig = { ...DEFAULT_CONFIG };

/**
 * Configura o resolver de tenant
 */
export function configureTenantResolver(config: Partial<TenantResolverConfig>): void {
  resolverConfig = { ...DEFAULT_CONFIG, ...config };
}

/**
 * Extrai slug do tenant pelo subdomínio
 * Ex: meu-casamento.app.com -> meu-casamento
 */
function resolveFromSubdomain(hostname: string): string | null {
  const baseDomain = resolverConfig.baseDomain || '';

  // Se for localhost, não tem subdomínio
  if (hostname === 'localhost' || hostname.startsWith('127.')) {
    return null;
  }

  // Remove o domínio base para obter o subdomínio
  if (hostname.endsWith(baseDomain)) {
    const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  // Tenta extrair primeiro segmento como subdomínio
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain !== 'www') {
      return subdomain;
    }
  }

  return null;
}

/**
 * Extrai slug do tenant pelo path da URL
 * Ex: /meu-casamento/dashboard -> meu-casamento
 */
function resolveFromPath(pathname: string): string | null {
  const prefix = resolverConfig.pathPrefix || '';
  let path = pathname;

  // Remove prefixo se configurado
  if (prefix && path.startsWith(prefix)) {
    path = path.substring(prefix.length);
  }

  // Remove barra inicial
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // Pega primeiro segmento
  const segments = path.split('/');
  if (segments.length > 0 && segments[0]) {
    // Ignora rotas conhecidas
    const knownRoutes = [
      'admin',
      'login',
      'logout',
      'confirmar-presenca',
      'checkin',
      'fotos',
      'cha-de-casa-nova',
      'feature-not-available',
    ];

    if (!knownRoutes.includes(segments[0])) {
      return segments[0];
    }
  }

  return null;
}

/**
 * Extrai slug do tenant pela query string
 * Ex: ?tenant=meu-casamento -> meu-casamento
 */
function resolveFromQuery(search: string): string | null {
  const params = new URLSearchParams(search);
  const param = resolverConfig.queryParam || 'tenant';
  return params.get(param);
}

/**
 * Verifica se é um domínio customizado
 */
function resolveFromCustomDomain(hostname: string): string | null {
  const baseDomain = resolverConfig.baseDomain || '';

  // Se não for o domínio base, pode ser customizado
  if (!hostname.includes(baseDomain) && hostname !== 'localhost') {
    // Retorna o hostname completo para buscar no banco
    return `domain:${hostname}`;
  }

  return null;
}

/**
 * Resolve o tenant atual baseado na URL
 */
export async function resolveTenant(url?: string | URL): Promise<TenantConfig | null> {
  // Usa URL atual se não fornecida
  const currentUrl = url
    ? typeof url === 'string'
      ? new URL(url)
      : url
    : new URL(window.location.href);

  const { hostname, pathname, search } = currentUrl;

  let tenantIdentifier: string | null = null;

  // Tenta resolver usando as estratégias configuradas
  for (const strategy of resolverConfig.strategies) {
    switch (strategy) {
      case 'subdomain':
        tenantIdentifier = resolveFromSubdomain(hostname);
        break;
      case 'path':
        tenantIdentifier = resolveFromPath(pathname);
        break;
      case 'query':
        tenantIdentifier = resolveFromQuery(search);
        break;
      case 'domain':
        tenantIdentifier = resolveFromCustomDomain(hostname);
        break;
    }

    if (tenantIdentifier) {
      console.log(`[TenantResolver] Tenant identificado via ${strategy}: ${tenantIdentifier}`);
      break;
    }
  }

  // Carrega o tenant
  let tenant: TenantConfig | null = null;

  if (tenantIdentifier) {
    if (tenantIdentifier.startsWith('domain:')) {
      // Busca por domínio customizado
      const domain = tenantIdentifier.replace('domain:', '');
      tenant = await loadTenantByDomain(domain);
    } else {
      // Busca por slug
      tenant = await loadTenantBySlug(tenantIdentifier);
    }
  }

  // Se não encontrou, usa tenant padrão
  if (!tenant && resolverConfig.defaultTenantSlug) {
    console.log(`[TenantResolver] Usando tenant padrão: ${resolverConfig.defaultTenantSlug}`);
    tenant = await loadTenantBySlug(resolverConfig.defaultTenantSlug);

    // Se ainda não encontrou no banco, usa config local
    if (!tenant) {
      tenant = await loadTenantConfig(resolverConfig.defaultTenantSlug);
    }
  }

  return tenant;
}

/**
 * Inicializa o tenant na aplicação
 * Deve ser chamado no início da aplicação (main.ts ou App.vue)
 */
export async function initializeTenant(
  config?: Partial<TenantResolverConfig>
): Promise<TenantConfig> {
  // Configura resolver se fornecido
  if (config) {
    configureTenantResolver(config);
  }

  // Resolve tenant atual
  const tenant = await resolveTenant();

  if (!tenant) {
    // Fallback para config padrão local
    console.warn('[TenantResolver] Nenhum tenant encontrado, usando configuração padrão');
    return useTenant();
  }

  // Define como tenant atual
  setTenant(tenant);

  return tenant;
}

/**
 * Gera URL para um tenant específico
 */
export function getTenantUrl(
  tenantSlug: string,
  path: string = '/',
  strategy: TenantResolutionStrategy = 'subdomain'
): string {
  const baseDomain = resolverConfig.baseDomain || window.location.host;

  switch (strategy) {
    case 'subdomain':
      return `https://${tenantSlug}.${baseDomain}${path}`;
    case 'path':
      return `https://${baseDomain}/${tenantSlug}${path}`;
    case 'query': {
      const param = resolverConfig.queryParam || 'tenant';
      const separator = path.includes('?') ? '&' : '?';
      return `https://${baseDomain}${path}${separator}${param}=${tenantSlug}`;
    }
    default:
      return `https://${baseDomain}${path}`;
  }
}

/**
 * Verifica se um domínio pertence a um tenant
 */
export function isTenantDomain(hostname: string): boolean {
  const baseDomain = resolverConfig.baseDomain || '';

  // Localhost não é domínio de tenant
  if (hostname === 'localhost' || hostname.startsWith('127.')) {
    return false;
  }

  // Se não for o domínio base, é domínio de tenant
  return !hostname.endsWith(baseDomain) || resolveFromSubdomain(hostname) !== null;
}
