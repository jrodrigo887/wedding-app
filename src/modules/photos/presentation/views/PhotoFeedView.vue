<template>
  <div class="photo-feed-view">
    <!-- Topbar fixa -->
    <div class="photo-feed-view__topbar">
      <div class="photo-feed-view__topbar-inner">
        <div class="photo-feed-view__brand">
          <h1 class="photo-feed-view__title">Galeria de Fotos</h1>
          <p class="photo-feed-view__subtitle">Momentos especiais do nosso grande dia</p>
        </div>

        <!-- Lado direito: ações do usuário -->
        <div class="photo-feed-view__topbar-actions">
          <template v-if="isIdentified">
            <button
              class="photo-feed-view__btn photo-feed-view__btn--upload"
              @click="goToUpload"
            >
              Enviar Fotos ou vídeo
            </button>
            <div
              class="photo-feed-view__avatar-area"
              @click="showDropdown = !showDropdown"
            >
              <div class="photo-feed-view__avatar">
                {{ store.currentGuestName?.charAt(0)?.toUpperCase() }}
              </div>
            </div>

            <!-- Dropdown do usuário -->
            <Transition name="dropdown">
              <div
                v-if="showDropdown"
                class="photo-feed-view__dropdown"
              >
                <div class="photo-feed-view__dropdown-header">
                  <span class="photo-feed-view__dropdown-name">{{ store.currentGuestName }}</span>
                  <span class="photo-feed-view__dropdown-code">{{ store.currentGuestCode }}</span>
                </div>
                <button
                  class="photo-feed-view__dropdown-item"
                  @click="handleLogout"
                >
                  Sair
                </button>
              </div>
            </Transition>
          </template>

          <template v-else>
            <button
              class="photo-feed-view__btn photo-feed-view__btn--enter"
              @click="showIdentifyPanel = !showIdentifyPanel"
            >
              Entrar
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Painel de identificação deslizante -->
    <Transition name="identify-slide">
      <div
        v-if="showIdentifyPanel && !isIdentified"
        class="photo-feed-view__identify-bar"
      >
        <div class="photo-feed-view__identify-bar-inner">
          <span class="photo-feed-view__identify-label">Seu código:</span>
          <div class="photo-feed-view__input-group">
            <span class="photo-feed-view__prefix">RE:</span>
            <input
              v-model="guestCode"
              type="text"
              class="photo-feed-view__input"
              placeholder="00"
              maxlength="10"
              @keyup.enter="handleIdentify"
            />
          </div>
          <button
            class="photo-feed-view__btn photo-feed-view__btn--identify"
            :disabled="identifying"
            @click="handleIdentify"
          >
            {{ identifying ? '...' : 'Verificar' }}
          </button>
          <button
            class="photo-feed-view__identify-close"
            @click="showIdentifyPanel = false"
          >
            &times;
          </button>
          <p
            v-if="identifyError"
            class="photo-feed-view__error"
          >
            {{ identifyError }}
          </p>
        </div>
      </div>
    </Transition>

    <!-- Overlay para fechar dropdown -->
    <div
      v-if="showDropdown"
      class="photo-feed-view__overlay"
      @click="showDropdown = false"
    ></div>

    <!-- Feed -->
    <div class="photo-feed-view__container">
      <main class="photo-feed-view__main">
        <PhotoFeed @view="handleViewPhoto" />
      </main>
    </div>

    <!-- Modal -->
    <PhotoModal
      :photo="selectedPhoto"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@shared/lib/supabase';
import { usePhotosStore } from '../../infrastructure/stores';
import { PhotoFeed, PhotoModal } from '../components';
import type { Photo } from '@/entities/photo';

/**
 * View: PhotoFeedView
 * Página pública do feed de fotos
 */

const router = useRouter();
const store = usePhotosStore();

const guestCode = ref('');
const guestName = ref('');
const isIdentified = ref(false);
const identifying = ref(false);
const identifyError = ref('');
const selectedPhoto = ref<Photo | null>(null);
const showIdentifyPanel = ref(false);
const showDropdown = ref(false);

onMounted(async () => {
  const savedCode = localStorage.getItem('photo_guest_code');
  const savedName = localStorage.getItem('photo_guest_name');

  if (savedCode && savedName) {
    store.setGuestContext(savedCode, savedName);
    isIdentified.value = true;
    await store.fetchGuestPhotoCount();
  }

  await store.fetchApprovedPhotos();
});

const getFullCode = () => {
  return 'RE' + guestCode.value.trim();
};

const handleIdentify = async () => {
  if (!guestCode.value.trim()) {
    identifyError.value = 'Digite seu código';
    return;
  }

  identifying.value = true;
  identifyError.value = '';

  try {
    const { data, error } = await supabase
      .from('convidados')
      .select('codigo, nome')
      .ilike('codigo', getFullCode())
      .single();

    if (error || !data) {
      identifyError.value = 'Código não encontrado';
      return;
    }

    store.setGuestContext(data.codigo, data.nome);
    localStorage.setItem('photo_guest_code', data.codigo);
    localStorage.setItem('photo_guest_name', data.nome);
    guestName.value = data.nome;
    isIdentified.value = true;
    showIdentifyPanel.value = false;

    await store.fetchGuestPhotoCount();
    await store.fetchApprovedPhotos(true);
  } catch {
    identifyError.value = 'Erro ao verificar código';
  } finally {
    identifying.value = false;
  }
};

const handleLogout = () => {
  store.clearGuestContext();
  localStorage.removeItem('photo_guest_code');
  localStorage.removeItem('photo_guest_name');
  isIdentified.value = false;
  showDropdown.value = false;
  guestCode.value = '';
  guestName.value = '';
};

const goToUpload = () => {
  router.push('/fotos/enviar');
};

const handleViewPhoto = (photo: Photo) => {
  selectedPhoto.value = photo;
};

const handleCloseModal = () => {
  selectedPhoto.value = null;
};
</script>

<style scoped>
.photo-feed-view {
  min-height: 100vh;
  background: #faf9f7;
}

/* ===== TOPBAR ===== */
.photo-feed-view__topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 249, 247, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.photo-feed-view__topbar-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.photo-feed-view__brand {
  min-width: 0;
}

.photo-feed-view__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d2420;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.photo-feed-view__subtitle {
  font-size: 0.75rem;
  color: #b0b5bd;
  margin: 0;
  font-weight: 400;
  display: none;
}

/* ===== TOPBAR ACTIONS ===== */
.photo-feed-view__topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  position: relative;
}

.photo-feed-view__btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.photo-feed-view__btn--enter {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

.photo-feed-view__btn--enter:hover {
  box-shadow: 0 3px 10px rgba(212, 165, 116, 0.35);
  transform: translateY(-1px);
}

.photo-feed-view__btn--upload {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

.photo-feed-view__btn--upload:hover {
  box-shadow: 0 3px 10px rgba(212, 165, 116, 0.35);
  transform: translateY(-1px);
}

/* ===== AVATAR ===== */
.photo-feed-view__avatar-area {
  cursor: pointer;
}

.photo-feed-view__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8d5c0 0%, #d4a574 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
  transition: box-shadow 0.2s;
}

.photo-feed-view__avatar:hover {
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.2);
}

/* ===== DROPDOWN ===== */
.photo-feed-view__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-width: 180px;
  overflow: hidden;
  z-index: 110;
}

.photo-feed-view__dropdown-header {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.photo-feed-view__dropdown-name {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.photo-feed-view__dropdown-code {
  display: block;
  font-size: 0.6875rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

.photo-feed-view__dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.8125rem;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
}

.photo-feed-view__dropdown-item:hover {
  background: #f9fafb;
  color: #374151;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.photo-feed-view__overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

/* ===== IDENTIFY BAR ===== */
.photo-feed-view__identify-bar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 90;
}

.photo-feed-view__identify-bar-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  position: relative;
}

.photo-feed-view__identify-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.photo-feed-view__input-group {
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color 0.2s;
  width: 120px;
}

.photo-feed-view__input-group:focus-within {
  border-color: #d4a574;
}

.photo-feed-view__prefix {
  padding: 0 0.5rem;
  font-weight: 600;
  font-size: 0.8125rem;
  color: #9ca3af;
  background: transparent;
}

.photo-feed-view__input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  outline: none;
  color: #374151;
}

.photo-feed-view__input::placeholder {
  color: #d1d5db;
}

.photo-feed-view__btn--identify {
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}

.photo-feed-view__btn--identify:hover:not(:disabled) {
  opacity: 0.9;
}

.photo-feed-view__btn--identify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-feed-view__identify-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  margin-left: auto;
}

.photo-feed-view__identify-close:hover {
  color: #6b7280;
}

.photo-feed-view__error {
  width: 100%;
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: #dc2626;
}

.identify-slide-enter-active,
.identify-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.identify-slide-enter-from,
.identify-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.identify-slide-enter-to,
.identify-slide-leave-from {
  max-height: 80px;
  opacity: 1;
}

/* ===== CONTAINER / MAIN ===== */
.photo-feed-view__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 0;
}

.photo-feed-view__main {
  padding-bottom: 3rem;
}

/* ===== MOBILE ===== */
@media (min-width: 641px) {
  .photo-feed-view__subtitle {
    display: block;
  }
}

@media (max-width: 640px) {
  .photo-feed-view__topbar-inner {
    padding: 0.625rem 1rem;
  }

  .photo-feed-view__title {
    font-size: 1.0625rem;
  }

  .photo-feed-view__identify-bar-inner {
    padding: 0.625rem 1rem;
  }

  .photo-feed-view__identify-label {
    display: none;
  }

  .photo-feed-view__container {
    padding: 1rem 1rem 0;
  }
}
</style>
