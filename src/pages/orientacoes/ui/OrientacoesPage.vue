<template>
  <div class="orientacoes-page">
    <div class="orientacoes-container">
      <!-- Header -->
      <header class="orientacoes-header">
        <p class="orientacoes-header__eyebrow">Rodrigo &amp; Elisa</p>
        <h1 class="orientacoes-header__title">Orientações para Convidados</h1>
        <p class="orientacoes-header__subtitle">
          Para que nosso grande dia seja ainda mais especial para todos
        </p>
      </header>

      <!-- Seção: Traje -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">👗</span>
          <h2 class="orientacoes-card__title">Traje</h2>
        </div>
        <p class="orientacoes-card__lead">
          Nossa cerimônia é <strong>formal</strong> — traje passeio completo.
          Capriche no visual e vista-se à altura do momento!
        </p>

        <!-- Mulheres -->
        <div class="orientacoes-gender">
          <h3 class="orientacoes-gender__title">
            <span class="orientacoes-gender__icon">♀</span>
            Para as convidadas
          </h3>
          <ul class="orientacoes-list">
            <li>
              Sugerimos o uso de vestidos longos ou midi, ou macacões elegantes
            </li>
            <li>
              Podem usar cores e estampas! Pedimos apenas que evitem as cores
              <span
                class="orientacoes-list__highlight orientacoes-list__highlight--warning"
              >
                branca, marfim, off-white ou marsala (cor das madrinhas)
              </span>
              e cores semelhantes
            </li>
            <li>
              Em nome da elegância da ocasião, pedimos gentilmente que evitem
              decotes muito profundos ou transparências excessivas
            </li>
          </ul>
        </div>

        <!-- Homens -->
        <div class="orientacoes-gender">
          <h3 class="orientacoes-gender__title">
            <span class="orientacoes-gender__icon">♂</span>
            Para os convidados
          </h3>
          <ul class="orientacoes-list">
            <li>
              Sugerimos o uso de calça social ou esporte fino, com camisa social
              — com ou sem gravata
            </li>
            <li>
              Em consideração à formalidade do evento, solicitamos que evitem o
              uso de
              <span
                class="orientacoes-list__highlight orientacoes-list__highlight--warning"
              >
                shorts (calções) ou jeans
              </span>
            </li>
            <li>
              <span
                class="orientacoes-list__highlight orientacoes-list__highlight--warning"
              >
                Evite o Azul-cobalto
              </span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Seção: Pontualidade -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">⏰</span>
          <h2 class="orientacoes-card__title">Pontualidade</h2>
        </div>
        <p class="orientacoes-card__lead">
          A cerimônia terá início às 15h. Recomendamos chegar com
          <strong>20 a 30 minutos de antecedência</strong> para acomodação
          confortável e evitar contratempos.
        </p>
      </section>

      <!-- Seção: Cerimônia -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">💍</span>
          <h2 class="orientacoes-card__title">Durante a Cerimônia</h2>
        </div>
        <ul class="orientacoes-list">
          <li>Silenciar ou desligar o celular antes do início</li>
          <li>Evitar conversas paralelas durante a cerimônia</li>
          <li>
            Evite fechar o campo de visão dos profissionais que estarão
            registrando esse momento — nossos fotógrafos cuidarão de cada
            detalhe!
          </li>
          <li>
            Siga as orientações dos cerimonialistas para entrada e saída do
            espaço
          </li>
        </ul>
      </section>

      <!-- Seção: Fotos -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">📸</span>
          <h2 class="orientacoes-card__title">Registro do Momento</h2>
        </div>
        <p class="orientacoes-card__lead">
          Na festa, fiquem à vontade para registrar e compartilhar as memórias
          pela galeria de fotos do nosso
          <router-link to="/fotos" class="orientacoes-inline-link">site</router-link>.
        </p>
      </section>

      <!-- Seção: Check-in -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">🎫</span>
          <h2 class="orientacoes-card__title">Check-in na Entrada</h2>
        </div>
        <p class="orientacoes-card__lead">
          Não esqueça de apresentar o <strong>QR Code</strong> recebido ao
          confirmar sua presença na entrada do evento. Você pode encontrá-lo
          novamente acessando seu link exclusivo.
        </p>
      </section>

      <!-- Seção: Local do Evento -->
      <section class="orientacoes-card">
        <div class="orientacoes-card__header">
          <span class="orientacoes-card__icon">📍</span>
          <h2 class="orientacoes-card__title">Local do Evento</h2>
        </div>
        <div class="orientacoes-venue">
          <p class="orientacoes-venue__name">Quintal Verde</p>
          <p class="orientacoes-venue__address">
            Av. Florianópolis, 147 — Alto Planalto Boa Esperança<br />
            João Pessoa, PB
          </p>
          <a
            href="https://maps.google.com/?q=Av.+Florianópolis,+147,+Boa+Esperança,+João+Pessoa,+PB"
            target="_blank"
            rel="noopener noreferrer"
            class="orientacoes-venue__link"
          >
            Abrir no Google Maps →
          </a>
        </div>
        <div class="orientacoes-map">
          <iframe
            title="Local do evento — Quintal Verde"
            src="https://maps.google.com/maps?q=Av.+Florianópolis,+147,+Boa+Esperança,+João+Pessoa,+PB&output=embed&z=16"
            width="100%"
            height="260"
            style="border: 0; border-radius: 0.5rem"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <!-- Data do casamento -->
      <div class="orientacoes-date">
        <p class="orientacoes-date__label">Nos vemos em</p>
        <p class="orientacoes-date__value">{{ formattedWeddingDate }}</p>
      </div>

      <!-- Ações -->
      <div class="orientacoes-actions">
        <router-link
          to="/"
          class="orientacoes-actions__btn orientacoes-actions__btn--secondary"
        >
          Página Principal
        </router-link>
      </div>

      <!-- Footer -->
      <footer class="orientacoes-footer">
        <p class="orientacoes-footer__message">
          Com amor, Rodrigo &amp; Elisa 💕
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { APP_CONFIG } from '@shared/config/constants';

const formattedWeddingDate = computed(() => {
  const date = new Date(`${APP_CONFIG.WEDDING_DATE}T12:00:00`);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});
</script>

<style scoped>
.orientacoes-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2.5rem 1rem 3rem;
  position: relative;
  overflow: hidden;
}

.orientacoes-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('@/app/assets/IMG_6499.jpg') center / cover no-repeat;
  opacity: 0.45;
  z-index: 0;
}

.orientacoes-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #fff9f0 0%, #f5e6d3 100%);
  opacity: 0.6;
  z-index: 0;
}

.orientacoes-container {
  width: 100%;
  max-width: 520px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ─── Header ─────────────────────────────────────────────── */
.orientacoes-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.orientacoes-header__eyebrow {
  font-family: 'Great Vibes', cursive;
  font-size: 1.75rem;
  color: #8b3a3a;
  margin: 0 0 0.25rem;
}

.orientacoes-header__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0 0 0.5rem;
}

.orientacoes-header__subtitle {
  font-family: 'Lato', sans-serif;
  font-size: 0.95rem;
  color: #8b7355;
  margin: 0;
  font-style: italic;
}

/* ─── Card ───────────────────────────────────────────────── */
.orientacoes-card {
  background: rgba(255, 252, 248, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 183, 106, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(139, 58, 58, 0.08);
}

.orientacoes-card__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(212, 183, 106, 0.25);
}

.orientacoes-card__icon {
  font-size: 1.4rem;
  line-height: 1;
}

.orientacoes-card__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #3d2b1f;
  margin: 0;
}

.orientacoes-card__lead {
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  color: #5a4a3a;
  line-height: 1.65;
  margin: 0 0 1rem;
}

.orientacoes-card__lead:last-child {
  margin-bottom: 0;
}

.orientacoes-card__note {
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  color: #8b7355;
  font-style: italic;
  line-height: 1.5;
  margin: 0.5rem 0 0;
}

/* ─── Gênero ─────────────────────────────────────────────── */
.orientacoes-gender {
  margin-top: 1rem;
}

.orientacoes-gender:first-of-type {
  margin-top: 0;
}

.orientacoes-gender__title {
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #8b3a3a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.orientacoes-gender__icon {
  font-style: normal;
  font-size: 1rem;
}

/* ─── Lista ──────────────────────────────────────────────── */
.orientacoes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.orientacoes-list li {
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  color: #5a4a3a;
  line-height: 1.55;
  padding-left: 1.1rem;
  position: relative;
}

.orientacoes-list li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: #d4b76a;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.3;
}

.orientacoes-list__highlight {
  font-weight: 600;
  border-radius: 3px;
  padding: 0 2px;
}

.orientacoes-list__highlight--warning {
  color: #8b3a3a;
  background: rgba(139, 58, 58, 0.07);
}

/* ─── Data ───────────────────────────────────────────────── */
.orientacoes-date {
  text-align: center;
  padding: 1.25rem 1rem;
  background: rgba(212, 183, 106, 0.12);
  border: 1px solid rgba(212, 183, 106, 0.35);
  border-radius: 0.75rem;
}

.orientacoes-date__label {
  font-family: 'Lato', sans-serif;
  font-size: 0.8rem;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.25rem;
}

.orientacoes-date__value {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d2b1f;
  margin: 0;
  text-transform: capitalize;
}

/* ─── Ações ──────────────────────────────────────────────── */
.orientacoes-actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.orientacoes-actions__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0.625rem;
  transition: all 0.2s ease;
}

.orientacoes-actions__btn--primary {
  color: white;
  background: linear-gradient(135deg, #8b3a3a 0%, #c45c5c 100%);
  box-shadow: 0 4px 14px rgba(139, 58, 58, 0.25);
}

.orientacoes-actions__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 58, 58, 0.35);
}

.orientacoes-actions__btn--secondary {
  color: #8b7355;
  background: rgba(255, 252, 248, 0.8);
  border: 1.5px solid #e8dcc8;
}

.orientacoes-actions__btn--secondary:hover {
  background: #e8dcc8;
  color: #3d2b1f;
}

/* ─── Footer ─────────────────────────────────────────────── */
.orientacoes-footer {
  text-align: center;
  padding-bottom: 0.5rem;
}

.orientacoes-footer__message {
  font-family: 'Great Vibes', cursive;
  font-size: 1.5rem;
  color: #8b3a3a;
  margin: 0;
}

/* ─── Inline link ────────────────────────────────────────── */
.orientacoes-inline-link {
  color: #8b3a3a;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.orientacoes-inline-link:hover {
  color: #3d2b1f;
}

/* ─── Venue / Mapa ───────────────────────────────────────── */
.orientacoes-venue {
  margin-bottom: 1rem;
}

.orientacoes-venue__name {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #3d2b1f;
  margin: 0 0 0.25rem;
}

.orientacoes-venue__address {
  font-family: 'Lato', sans-serif;
  font-size: 0.9rem;
  color: #5a4a3a;
  line-height: 1.55;
  margin: 0 0 0.625rem;
}

.orientacoes-venue__link {
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #8b3a3a;
  text-decoration: none;
  transition: color 0.2s;
}

.orientacoes-venue__link:hover {
  color: #3d2b1f;
}

.orientacoes-map {
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgba(212, 183, 106, 0.3);
  line-height: 0;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 480px) {
  .orientacoes-page {
    padding: 1.5rem 1rem 2.5rem;
  }

  .orientacoes-header__title {
    font-size: 1.35rem;
  }

  .orientacoes-card {
    padding: 1.25rem;
  }
}
</style>
