// Repository Factory - Composition Root (app layer)
// Cria instancias de repositories baseado na configuracao do tenant
// Esta e a unica camada que pode conhecer implementacoes concretas de infra

import { useTenant } from '@shared/config/tenant';

// Interfaces (de entities — camada 5)
import type { IGuestRepository } from '@/entities/guest';
import type { IContractRepository } from '@/entities/contract';
import type { IRsvpRepository } from '@/entities/rsvp';
import type { IPhotoRepository } from '@/entities/photo';

// Implementações Supabase (de features — FSD)
import { GuestRepositorySupabase } from '@/features/guest-management/api/supabaseGuestRepository';
import { ContractRepositorySupabase } from '@/features/contract-management/api/supabaseContractRepository';
import { RsvpRepositorySupabase } from '@/features/rsvp-confirmation/api/supabaseRsvpRepository';
import { PhotoRepositorySupabase } from '@/features/photo-state/api/supabasePhotoRepository';

// Cache de instancias para evitar criacao multipla
const repositoryCache = new Map<string, unknown>();

function getOrCreate<T>(key: string, factory: () => T): T {
  if (!repositoryCache.has(key)) {
    repositoryCache.set(key, factory());
  }
  return repositoryCache.get(key) as T;
}

/**
 * Limpa o cache de repositories
 * Util quando o tenant muda
 */
export function clearRepositoryCache(): void {
  repositoryCache.clear();
}

/**
 * Factory para GuestRepository
 */
export function createGuestRepository(): IGuestRepository {
  const tenant = useTenant();
  const cacheKey = `guest-${tenant.id}-${tenant.backend}`;

  return getOrCreate(cacheKey, () => {
    switch (tenant.backend) {
      case 'supabase':
        return new GuestRepositorySupabase(tenant.id);
      case 'firebase':
        throw new Error('Firebase backend nao implementado ainda');
      case 'custom':
        throw new Error('Custom backend nao implementado ainda');
      default:
        throw new Error(`Backend nao suportado: ${tenant.backend}`);
    }
  });
}

/**
 * Factory para ContractRepository
 */
export function createContractRepository(): IContractRepository {
  const tenant = useTenant();
  const cacheKey = `contract-${tenant.id}-${tenant.backend}`;

  return getOrCreate(cacheKey, () => {
    switch (tenant.backend) {
      case 'supabase':
        return new ContractRepositorySupabase(tenant.id);
      case 'firebase':
        throw new Error('Firebase backend nao implementado ainda');
      case 'custom':
        throw new Error('Custom backend nao implementado ainda');
      default:
        throw new Error(`Backend nao suportado: ${tenant.backend}`);
    }
  });
}

/**
 * Factory para RsvpRepository
 */
export function createRsvpRepository(): IRsvpRepository {
  const tenant = useTenant();
  const cacheKey = `rsvp-${tenant.id}-${tenant.backend}`;

  return getOrCreate(cacheKey, () => {
    switch (tenant.backend) {
      case 'supabase':
        return new RsvpRepositorySupabase(tenant.id);
      case 'firebase':
        throw new Error('Firebase backend nao implementado ainda');
      case 'custom':
        throw new Error('Custom backend nao implementado ainda');
      default:
        throw new Error(`Backend nao suportado: ${tenant.backend}`);
    }
  });
}

/**
 * Factory para PhotoRepository
 */
export function createPhotoRepository(): IPhotoRepository {
  const tenant = useTenant();
  const cacheKey = `photo-${tenant.id}-${tenant.backend}`;

  return getOrCreate(cacheKey, () => {
    switch (tenant.backend) {
      case 'supabase':
        return new PhotoRepositorySupabase(tenant.id);
      case 'firebase':
        throw new Error('Firebase backend nao implementado ainda');
      case 'custom':
        throw new Error('Custom backend nao implementado ainda');
      default:
        throw new Error(`Backend nao suportado: ${tenant.backend}`);
    }
  });
}
