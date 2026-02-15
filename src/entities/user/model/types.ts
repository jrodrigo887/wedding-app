import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
