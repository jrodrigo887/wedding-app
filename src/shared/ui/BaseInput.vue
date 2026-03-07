<template>
  <div class="input-wrapper">
    <label
      v-if="label"
      :for="inputId"
      class="input-label"
    >
      {{ label }}
      <span
        v-if="required"
        class="input-required"
        >*</span
      >
    </label>

    <div class="input-container">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="input"
        :class="{
          'input--error': error,
          'input--disabled': disabled,
        }"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>

    <p
      v-if="error"
      class="input-error"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      class="input-hint"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  modelValue?: string | number;
  type?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  required: false,
  error: '',
  hint: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const inputId = ref('');

onMounted(() => {
  inputId.value = `input-${Math.random().toString(36).substring(2, 9)}`;
});

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event);
};
</script>

<style scoped>
.input-wrapper {
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--input-label-color, #374151);
}

.input-required {
  color: var(--input-required-color, #ef4444);
  margin-left: 0.25rem;
}

.input-container {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--input-border-color, #d1d5db);
  border-radius: 0.5rem;
  background: var(--input-bg, #fff);
  color: var(--input-text-color, #1f2937);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--input-focus-border, #3b82f6);
  box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(59, 130, 246, 0.2));
}

.input::placeholder {
  color: var(--input-placeholder-color, #9ca3af);
}

.input--error {
  border-color: var(--input-error-border, #ef4444);
}

.input--error:focus {
  border-color: var(--input-error-border, #ef4444);
  box-shadow: 0 0 0 3px var(--input-error-ring, rgba(239, 68, 68, 0.2));
}

.input--disabled {
  background: var(--input-disabled-bg, #f3f4f6);
  cursor: not-allowed;
  opacity: 0.6;
}

.input-error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--input-error-text, #ef4444);
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--input-hint-color, #6b7280);
}
</style>
