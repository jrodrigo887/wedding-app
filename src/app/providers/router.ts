import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';
import { hasFeature } from '@shared/config/tenant';
import type { TenantConfig } from '@shared/config/tenant';

// Pages (FSD)
import { HomePage } from '@/pages/home';
import { ChaCasaNovaPage } from '@/pages/cha-casa-nova';
import { LoginPage, authGuard } from '@/pages/auth';
import { RsvpPage } from '@/pages/rsvp';
import { CheckinPage } from '@/pages/checkin';
import { PhotoFeedPage } from '@/pages/photo-feed';
import { PhotoUploadPage } from '@/pages/photo-upload';
import {
  DashboardPage,
  GuestsPage,
  ContractsPage,
  AdminPhotosPage,
} from '@/pages/admin';
import { FeatureNotAvailablePage } from '@/pages/feature-not-available';

// Widgets
import { AdminLayout } from '@/widgets/admin-panel';

/**
 * Guard para verificar se uma feature está habilitada
 */
const featureGuard = (feature: keyof TenantConfig['features']) => {
  return (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    if (hasFeature(feature)) {
      next();
    } else {
      console.warn(`[Router] Feature "${feature}" não está habilitada para este tenant`);
      next({ name: 'feature-not-available', query: { feature } });
    }
  };
};

const routes: RouteRecordRaw[] = [
  // Rotas públicas
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/confirmar-presenca',
    name: 'rsvp',
    component: RsvpPage,
    beforeEnter: featureGuard('rsvp'),
  },
  {
    path: '/cha-de-casa-nova',
    name: 'cha-casa-nova',
    component: ChaCasaNovaPage,
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckinPage,
    beforeEnter: featureGuard('checkin'),
  },
  {
    path: '/fotos',
    name: 'photos',
    component: PhotoFeedPage,
    beforeEnter: featureGuard('photos'),
  },
  {
    path: '/fotos/enviar',
    name: 'photos-upload',
    component: PhotoUploadPage,
    beforeEnter: featureGuard('photos'),
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },

  // Rotas administrativas (protegidas)
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: DashboardPage,
      },
      {
        path: 'convidados',
        name: 'admin-guests',
        component: GuestsPage,
      },
      {
        path: 'contratos',
        name: 'admin-contracts',
        component: ContractsPage,
        beforeEnter: featureGuard('contracts'),
      },
      {
        path: 'fotos',
        name: 'admin-photos',
        component: AdminPhotosPage,
        beforeEnter: featureGuard('photos'),
      },
    ],
  },

  // Página de feature não disponível
  {
    path: '/feature-not-available',
    name: 'feature-not-available',
    component: FeatureNotAvailablePage,
  },

  // Fallback
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
