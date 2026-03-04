import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { supabase } from '@shared/lib/supabase';

/**
 * Guard de autenticação para rotas protegidas
 * Redireciona para login se não estiver autenticado
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    next();
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }
};

export default authGuard;
