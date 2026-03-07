<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">Área Restrita</h1>
        <p class="login-subtitle">Faça login para continuar</p>

        <form
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <div class="login-form__group">
            <input
              v-model="email"
              type="email"
              class="login-form__input"
              placeholder="Email"
              required
              autocomplete="email"
            />
          </div>

          <div class="login-form__group">
            <input
              v-model="password"
              type="password"
              class="login-form__input"
              placeholder="Senha"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="login-form__button"
            :disabled="loading"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p
          v-if="error"
          class="login-error"
        >
          {{ error }}
        </p>

        <router-link
          to="/"
          class="login-back"
        >
          Voltar ao início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/features/auth-login';

const router = useRouter();
const route = useRoute();
const { loading, error, login, clearError } = useAuth();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  clearError();
  const success = await login(email.value, password.value);

  if (success) {
    const redirect = (route.query.redirect as string) || '/admin';
    router.push(redirect);
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f1a;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: #1a1a2e;
  border-radius: 1rem;
  padding: 2.5rem 2rem;
}

.login-title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  text-align: center;
}

.login-subtitle {
  color: #64748b;
  margin: 0 0 2rem;
  text-align: center;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__group {
  width: 100%;
}

.login-form__input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: #0f0f1a;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.login-form__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.login-form__input::placeholder {
  color: #64748b;
}

.login-form__button {
  width: 100%;
  padding: 0.875rem;
  background: #3b82f6;
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.login-form__button:hover:not(:disabled) {
  background: #2563eb;
}

.login-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-error {
  color: #ef4444;
  text-align: center;
  margin: 1rem 0 0;
  font-size: 0.9rem;
}

.login-back {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: #64748b;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.login-back:hover {
  color: #fff;
}
</style>
