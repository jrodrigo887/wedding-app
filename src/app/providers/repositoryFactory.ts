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
    guestRepo = new GuestRepositorySupabase();
  }
  return guestRepo;
}

export function createContractRepository(): IContractRepository {
  if (!contractRepo) {
    contractRepo = new ContractRepositorySupabase();
  }
  return contractRepo;
}

export function createRsvpRepository(): IRsvpRepository {
  if (!rsvpRepo) {
    rsvpRepo = new RsvpRepositorySupabase();
  }
  return rsvpRepo;
}

export function createPhotoRepository(): IPhotoRepository {
  if (!photoRepo) {
    photoRepo = new PhotoRepositorySupabase();
  }
  return photoRepo;
}
