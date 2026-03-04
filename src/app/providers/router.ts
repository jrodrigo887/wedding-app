import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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
  },
  {
    path: '/fotos',
    name: 'photos',
    component: PhotoFeedPage,
  },
  {
    path: '/fotos/enviar',
    name: 'photos-upload',
    component: PhotoUploadPage,
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
      },
      {
        path: 'fotos',
        name: 'admin-photos',
        component: AdminPhotosPage,
      },
    ],
  },

  // Página de feature não disponível (mantida para compatibilidade)
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
