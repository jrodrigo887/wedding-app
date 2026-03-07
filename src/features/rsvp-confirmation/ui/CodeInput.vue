<template>
  <div class="code-input">
    <p class="code-input__instruction">
      Digite o código que está no seu convite para confirmar sua presença
    </p>

    <div class="code-input__input-group">
      <div class="code-input__input-wrapper">
        <span class="code-input__prefix">RE:</span>
        <input
          ref="inputRef"
          :value="modelValue"
          type="text"
          class="code-input__input"
          placeholder="00"
          :disabled="disabled"
          @input="onInput"
          @keyup.enter="$emit('submit')"
        />
      </div>
      <button
        class="code-input__button"
        :disabled="disabled || !modelValue.trim()"
        @click="$emit('submit')"
      >
        <span v-if="loading">Verificando...</span>
        <span v-else>Verificar</span>
      </button>
    </div>

    <p
      v-if="error"
      class="code-input__error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  submit: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const onInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const numericValue = target.value.replace(/\D/g, '');
  emit('update:modelValue', numericValue);
};

const focus = (): void => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<style scoped>
.code-input__instruction {
  text-align: center;
  color: #5a4a3a;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.code-input__input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-input__input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e8dcc8;
  border-radius: 0.5rem;
  background: #fff9f0;
  overflow: hidden;
  transition: border-color 0.2s;
}

.code-input__input-wrapper:focus-within {
  border-color: #d4a574;
}

.code-input__prefix {
  padding: 1rem 0.5rem 1rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d2b1f;
  background: #e8dcc8;
  user-select: none;
}

.code-input__input {
  flex: 1;
  padding: 1rem;
  padding-left: 0.5rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #3d2b1f;
  box-sizing: border-box;
}

.code-input__input:focus {
  outline: none;
}

.code-input__input::placeholder {
  text-transform: none;
  color: #8b7355;
}

.code-input__button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8b3a3a 0%, #c45c5c 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.code-input__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 58, 58, 0.3);
}

.code-input__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.code-input__error {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
