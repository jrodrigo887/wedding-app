<template>
  <div class="pin-auth">
    <div class="pin-auth__icon">{{ icon }}</div>
    <h2 class="pin-auth__title">{{ title }}</h2>
    <p class="pin-auth__message">{{ message }}</p>

    <div class="pin-auth__input-group">
      <input
        ref="inputRef"
        :value="modelValue"
        type="password"
        class="pin-auth__input"
        placeholder="Digite o PIN"
        maxlength="10"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('submit')"
      />
      <button
        class="pin-auth__button"
        :disabled="!modelValue.trim()"
        @click="$emit('submit')"
      >
        Acessar
      </button>
    </div>

    <p
      v-if="error"
      class="pin-auth__error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * Component: PinAuth
 * Formulário de autenticação por PIN
 */
withDefaults(
  defineProps<{
    modelValue: string;
    error?: string;
    icon?: string;
    title?: string;
    message?: string;
  }>(),
  {
    icon: '🔐',
    title: 'Área Restrita',
    message: 'Digite o PIN de acesso para continuar',
  }
);

defineEmits<{
  'update:modelValue': [value: string];
  submit: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const focus = (): void => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<style scoped>
.pin-auth {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.pin-auth__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pin-auth__title {
  font-size: 1.3rem;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

.pin-auth__message {
  color: #64748b;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.pin-auth__input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pin-auth__input {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 0.3em;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  color: #1a1a2e;
  box-sizing: border-box;
}

.pin-auth__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.pin-auth__button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pin-auth__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.pin-auth__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pin-auth__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}
</style>
