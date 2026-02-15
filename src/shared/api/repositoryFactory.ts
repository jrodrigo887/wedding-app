// Repository Factory - Multi-backend support
// Cria instancias de repositories baseado na configuracao do tenant

import { useTenant } from '@shared/config/tenant';

// Interfaces
import type { IGuestRepository, IContractRepository } from '@/modules/admin/domain/interfaces';
import type { IRsvpRepository } from '@/modules/rsvp/domain/interfaces';
import type { IPhotoRepository } from '@/modules/photos/domain/interfaces';

// Implementacoes Supabase
import { GuestRepositorySupabase } from '@/modules/admin/infrastructure/repositories/supabase/GuestRepository';
import { ContractRepositorySupabase } from '@/modules/admin/infrastructure/repositories/supabase/ContractRepository';
import { RsvpRepositorySupabase } from '@/modules/rsvp/infrastructure/repositories/supabase/RsvpRepository';
import { PhotoRepositorySupabase } from '@/modules/photos/infrastructure/repositories/supabase/PhotoRepository';

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
