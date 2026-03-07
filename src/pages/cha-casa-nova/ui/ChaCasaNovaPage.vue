<template>
  <div class="page-container">
    <!-- Elegant Card -->
    <div class="card">
      <!-- Image -->
      <div class="card-image">
        <img
          :src="conviteImage"
          alt="Chá de Casa Nova - Rodrigo & Elisa"
        />
      </div>

      <!-- Content -->
      <div class="card-content">
        <h2 class="title">Confirme sua presença</h2>
        <p class="description">
          Ficaremos muito felizes com a sua presença! Clique no botão abaixo para confirmar via
          WhatsApp.
        </p>

        <!-- WhatsApp Button -->
        <a
          :href="whatsappLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-whatsapp"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
            />
          </svg>
          Confirmar via WhatsApp
        </a>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <p>Rodrigo & Elisa - 21/02/2026</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import conviteImage from '@assets/cha-casa-nova.png';

const phoneNumber = '5583987083837';
const defaultMessage =
  'Olá! Gostaria de confirmar minha presença no Chá de Casa Nova do Rodrigo e Elisa no dia 21/02/2026. \n Nome: [autor]';

const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #faf8f5 0%, #f5ebe0 50%, #ede4d8 100%);
}

.card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(139, 58, 58, 0.15);
  overflow: hidden;
}

.card-image {
  width: 100%;
  background: linear-gradient(180deg, #faf8f5 0%, #ffffff 100%);
  padding: 1rem 1rem 0;
}

.card-image img {
  width: 100%;
  height: auto;
  border-radius: 16px 16px 0 0;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem 2rem 2rem;
  text-align: center;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #8b3a3a;
  margin-bottom: 0.75rem;
}

.description {
  font-family: 'Lato', sans-serif;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-whatsapp {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
}

.btn-whatsapp:hover {
  background: linear-gradient(135deg, #2be074 0%, #25d366 100%);
}

.card-footer {
  padding: 1rem 1.5rem;
  background: linear-gradient(180deg, #ffffff 0%, #faf8f5 100%);
  text-align: center;
  border-top: 1px solid rgba(212, 183, 106, 0.3);
}

.card-footer p {
  font-family: 'Playfair Display', serif;
  font-size: 0.8125rem;
  color: #8b3a3a;
  margin: 0;
  letter-spacing: 0.05em;
}

@media (max-width: 480px) {
  .card {
    border-radius: 20px;
  }

  .card-image {
    padding: 0.75rem 0.75rem 0;
  }

  .card-content {
    padding: 1.25rem 1.5rem 1.5rem;
  }

  .title {
    font-size: 1.375rem;
  }

  .description {
    font-size: 0.875rem;
  }

  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.9375rem;
  }
}
</style>
