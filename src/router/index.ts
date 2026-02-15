import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';
import { hasFeature } from '@shared/config/tenant';
import type { TenantConfig } from '@shared/config/tenant';

// Views públicas
import HomePage from '@/views/HomePage.vue';
import ChaCasaNovaPage from '@/views/ChaCasaNovaPage.vue';

// Modules
import { LoginPage, authGuard } from '@/modules/auth';
import { AdminLayout, DashboardView, GuestsView, ContractsView } from '@/modules/admin';
import { RsvpView, CheckinView } from '@/modules/rsvp';
import { PhotoFeedView, PhotoUploadView, AdminPhotosView } from '@/modules/photos';

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
    component: RsvpView,
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
    component: CheckinView,
    beforeEnter: featureGuard('checkin'),
  },
  {
    path: '/fotos',
    name: 'photos',
    component: PhotoFeedView,
    beforeEnter: featureGuard('photos'),
  },
  {
    path: '/fotos/enviar',
    name: 'photos-upload',
    component: PhotoUploadView,
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
        component: DashboardView,
      },
      {
        path: 'convidados',
        name: 'admin-guests',
        component: GuestsView,
      },
      {
        path: 'contratos',
        name: 'admin-contracts',
        component: ContractsView,
        beforeEnter: featureGuard('contracts'),
      },
      {
        path: 'fotos',
        name: 'admin-photos',
        component: AdminPhotosView,
        beforeEnter: featureGuard('photos'),
      },
    ],
  },

  // Página de feature não disponível
  {
    path: '/feature-not-available',
    name: 'feature-not-available',
    component: () => import('@/views/FeatureNotAvailablePage.vue'),
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
