<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@shared/lib/supabase';
import { usePhotosStore } from '../../infrastructure/stores';
import { MediaUploader } from '../components';

/**
 * View: PhotoUploadView
 * Página de upload de fotos e vídeos
 */

const router = useRouter();
const store = usePhotosStore();

const guestCode = ref('');
const isIdentified = ref(false);
const identifying = ref(false);
const identifyError = ref('');

onMounted(async () => {
  // Tenta recuperar identificação salva
  const savedCode = localStorage.getItem('photo_guest_code');
  const savedName = localStorage.getItem('photo_guest_name');

  if (savedCode && savedName) {
    store.setGuestContext(savedCode, savedName);
    isIdentified.value = true;
    await store.fetchGuestPhotoCount();
  }
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
    isIdentified.value = true;

    await store.fetchGuestPhotoCount();
  } catch {
    identifyError.value = 'Erro ao verificar código';
  } finally {
    identifying.value = false;
  }
};

const goToFeed = () => {
  router.push('/fotos');
};
</script>

<template>
  <div class="photo-upload-view">
    <div class="photo-upload-view__container">
      <!-- Header -->
      <header class="photo-upload-view__header">
        <button
          class="photo-upload-view__back"
          @click="goToFeed"
        >
          ← Voltar para galeria
        </button>
        <h1 class="photo-upload-view__title">Enviar Foto ou Vídeo</h1>
        <p class="photo-upload-view__subtitle">Compartilhe seus momentos especiais conosco</p>
      </header>

      <!-- Identificação -->
      <div
        v-if="!isIdentified"
        class="photo-upload-view__identify"
      >
        <div class="photo-upload-view__identify-card">
          <h2 class="photo-upload-view__identify-title">Identifique-se</h2>
          <p class="photo-upload-view__identify-text">
            Digite o código do seu convite para enviar fotos e vídeos
          </p>

          <div class="photo-upload-view__identify-form">
            <div class="photo-upload-view__input-group">
              <span class="photo-upload-view__prefix">RE:</span>
              <input
                v-model="guestCode"
                type="text"
                class="photo-upload-view__input"
                placeholder="00"
                maxlength="10"
                @keyup.enter="handleIdentify"
              />
            </div>
            <button
              class="photo-upload-view__btn"
              :disabled="identifying"
              @click="handleIdentify"
            >
              {{ identifying ? 'Verificando...' : 'Continuar' }}
            </button>
          </div>

          <p
            v-if="identifyError"
            class="photo-upload-view__error"
          >
            {{ identifyError }}
          </p>
        </div>
      </div>

      <!-- Upload -->
      <main
        v-else
        class="photo-upload-view__main"
      >
        <div class="photo-upload-view__user-info">
          <span
            >Enviando como: <strong>{{ store.currentGuestName }}</strong></span
          >
        </div>

        <MediaUploader />

        <div class="photo-upload-view__tips">
          <h3>Dicas</h3>
          <ul>
            <li>Fotos e vídeos são comprimidos automaticamente para envio mais rápido</li>
            <li>Você pode enviar até 20 fotos e 5 vídeos</li>
            <li>Vídeos têm duração máxima de 60 segundos</li>
            <li>Adicione uma legenda para contar a história</li>
          </ul>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.photo-upload-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #fefdfb 0%, #faf4e8 50%, #f5ebd7 100%);
  padding: 2rem 1rem;
}

.photo-upload-view__container {
  max-width: 500px;
  margin: 0 auto;
}

.photo-upload-view__header {
  text-align: center;
  margin-bottom: 2rem;
}

.photo-upload-view__back {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.photo-upload-view__back:hover {
  color: #374151;
}

.photo-upload-view__title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #3d2b1f;
  margin: 0 0 0.5rem 0;
}

.photo-upload-view__subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.photo-upload-view__identify {
  display: flex;
  justify-content: center;
}

.photo-upload-view__identify-card {
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.photo-upload-view__identify-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: #3d2b1f;
  margin: 0 0 0.5rem 0;
}

.photo-upload-view__identify-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.photo-upload-view__identify-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.photo-upload-view__input-group {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.photo-upload-view__prefix {
  padding: 0 1rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
}

.photo-upload-view__input {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  font-size: 1.25rem;
  text-align: center;
  outline: none;
}

.photo-upload-view__btn {
  padding: 1rem;
  background: linear-gradient(135deg, #d4a574 0%, #c49a6c 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.photo-upload-view__btn:hover:not(:disabled) {
  opacity: 0.9;
}

.photo-upload-view__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-upload-view__error {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.photo-upload-view__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.photo-upload-view__user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.photo-upload-view__tips {
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.photo-upload-view__tips h3 {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.photo-upload-view__tips ul {
  margin: 0;
  padding-left: 1.25rem;
}

.photo-upload-view__tips li {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.photo-upload-view__tips li:last-child {
  margin-bottom: 0;
}
</style>
