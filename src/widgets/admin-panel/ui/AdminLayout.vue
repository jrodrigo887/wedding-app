<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="admin-header__brand">
        <h1 class="admin-header__title">Painel Administrativo</h1>
      </div>

      <nav class="admin-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="admin-nav__link"
          :class="{ 'admin-nav__link--active': isActive(item.to) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="admin-header__actions">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="handleRefresh"
        >
          Atualizar
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="handleLogout"
        >
          Sair
        </BaseButton>
      </div>
    </header>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/features/auth-login';
import { useGuestsStore } from '@/features/guest-management';
import { useContractsStore } from '@/features/contract-management';
import { usePhotosStore } from '@/features/photo-state';
import { BaseButton } from '@shared/ui';

const router = useRouter();
const route = useRoute();
const { logout } = useAuth();
const guestsStore = useGuestsStore();
const contractsStore = useContractsStore();
const photosStore = usePhotosStore();

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/convidados', label: 'Convidados' },
  { to: '/admin/contratos', label: 'Contratos' },
  { to: '/admin/fotos', label: 'Fotos' },
];

const isActive = (path: string): boolean => {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(path);
};

const handleRefresh = async () => {
  await Promise.all([guestsStore.refresh(), contractsStore.refresh(), photosStore.fetchStats()]);
};

const handleLogout = async () => {
  guestsStore.reset();
  contractsStore.reset();
  photosStore.reset();
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #0f0f1a;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #1a1a2e;
  border-bottom: 1px solid #2d2d44;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-header__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-header__title {
  color: #fff;
  font-size: 1.125rem;
  margin: 0;
  font-weight: 600;
}

.admin-nav {
  display: flex;
  gap: 0.5rem;
}

.admin-nav__link {
  padding: 0.5rem 1rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.admin-nav__link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.admin-nav__link--active {
  color: #fff;
  background: #3b82f6;
}

.admin-nav__link--active:hover {
  background: #2563eb;
}

.admin-header__actions {
  display: flex;
  gap: 0.5rem;
}

.admin-main {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-nav {
    justify-content: center;
    flex-wrap: wrap;
  }

  .admin-header__actions {
    justify-content: center;
  }
}
</style>
