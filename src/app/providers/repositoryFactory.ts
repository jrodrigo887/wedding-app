// Repository Factory - Composition Root (app layer)
// Cria instâncias singleton de repositories para o Supabase

import { APP_TENANT_ID } from '@shared/config/constants';

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

// Singletons — criados uma única vez com o ID fixo da aplicação
let guestRepo: IGuestRepository | null = null;
let contractRepo: IContractRepository | null = null;
let rsvpRepo: IRsvpRepository | null = null;
let photoRepo: IPhotoRepository | null = null;

export function createGuestRepository(): IGuestRepository {
  if (!guestRepo) {
    guestRepo = new GuestRepositorySupabase(APP_TENANT_ID);
  }
  return guestRepo;
}

export function createContractRepository(): IContractRepository {
  if (!contractRepo) {
    contractRepo = new ContractRepositorySupabase(APP_TENANT_ID);
  }
  return contractRepo;
}

export function createRsvpRepository(): IRsvpRepository {
  if (!rsvpRepo) {
    rsvpRepo = new RsvpRepositorySupabase(APP_TENANT_ID);
  }
  return rsvpRepo;
}

export function createPhotoRepository(): IPhotoRepository {
  if (!photoRepo) {
    photoRepo = new PhotoRepositorySupabase(APP_TENANT_ID);
  }
  return photoRepo;
}
