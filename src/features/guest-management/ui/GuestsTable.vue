<template>
  <div class="guests-table">
    <div
      v-if="loading"
      class="guests-table__loading"
    >
      Carregando convidados...
    </div>

    <div
      v-else-if="guests.length === 0"
      class="guests-table__empty"
    >
      Nenhum convidado encontrado.
    </div>

    <div
      v-else
      class="guests-table__wrapper"
    >
      <table class="guests-table__table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Confirmado</th>
            <th>Check-in</th>
            <th>Convite</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="guest in guests"
            :key="guest.codigo"
          >
            <td class="guests-table__code">{{ guest.codigo }}</td>
            <td class="guests-table__name">
              {{ guest.nome }}
              <span
                v-if="guest.parceiro"
                class="guests-table__partner"
              >
                e {{ guest.parceiro }}
              </span>
            </td>
            <td>
              <span
                v-if="guest.recusou"
                class="guests-table__badge guests-table__badge--declined"
              >
                Recusou
              </span>
              <span
                v-else
                class="guests-table__badge"
                :class="
                  guest.confirmado ? 'guests-table__badge--success' : 'guests-table__badge--pending'
                "
              >
                {{ guest.confirmado ? 'Sim' : 'Não' }}
              </span>
            </td>
            <td>
              <span
                class="guests-table__badge"
                :class="
                  guest.checkin ? 'guests-table__badge--success' : 'guests-table__badge--pending'
                "
              >
                {{ guest.checkin ? 'Sim' : 'Não' }}
              </span>
            </td>
            <td class="guests-table__invite">
              <template v-if="guest.invite_token">
                <!-- Copiar link -->
                <button
                  class="guests-table__invite-btn"
                  :class="{ 'guests-table__invite-btn--copied': copiedId === guest.id }"
                  :title="copiedId === guest.id ? 'Link copiado!' : 'Copiar link de convite'"
                  @click="copyInviteLink(guest)"
                >
                  {{ copiedId === guest.id ? '✅' : '📋' }}
                </button>

                <!-- WhatsApp direto (só se tiver telefone) -->
                <button
                  v-if="guest.telefone"
                  class="guests-table__invite-btn guests-table__invite-btn--whatsapp"
                  title="Enviar convite pelo WhatsApp"
                  @click="sendWhatsApp(guest)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                </button>

                <!-- Regenerar token (só para quem recusou) -->
                <button
                  v-if="guest.recusou"
                  class="guests-table__invite-btn guests-table__invite-btn--regen"
                  :title="`Gerar novo link para ${guest.nome}`"
                  @click="handleRegenerateToken(guest.id)"
                >
                  🔄
                </button>
              </template>
              <span
                v-else
                class="guests-table__invite-none"
              >—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Guest } from '@/entities/guest';
import { useWhatsApp } from '@shared/utils/useWhatsApp';
import { APP_CONFIG } from '@shared/config/constants';

/**
 * Component: GuestsTable
 * Tabela de convidados com código, nome, confirmado, check-in e coluna de convite.
 */
const props = defineProps<{
  guests: Guest[];
  loading?: boolean;
  baseUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'regenerate-token', guestId: number): void;
}>();

const handleRegenerateToken = (guestId: number | undefined): void => {
  if (guestId !== undefined) emit('regenerate-token', guestId);
};

const { openWhatsAppDirect } = useWhatsApp();

const copiedId = ref<number | null>(null);

const getInviteLink = (guest: Guest): string => {
  const base = props.baseUrl ?? window.location.origin;
  return `${base}/confirmar-presenca?guest=${guest.invite_token}`;
};

const copyInviteLink = async (guest: Guest): Promise<void> => {
  const id = guest.id ?? null;
  try {
    await navigator.clipboard.writeText(getInviteLink(guest));
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 2000);
  } catch {
    // Fallback for browsers without clipboard API
    const input = document.createElement('input');
    input.value = getInviteLink(guest);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 2000);
  }
};

const sendWhatsApp = (guest: Guest): void => {
  const link = getInviteLink(guest);
  const weddingDate = new Date(`${APP_CONFIG.WEDDING_DATE}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const message = [
    `Olá *${guest.nome}*!`,
    `Confirme sua presença no casamento de *${APP_CONFIG.BRIDE_NAME} & ${APP_CONFIG.GROOM_NAME}* pelo link abaixo:`,
    link,
    `*Data:* ${weddingDate}`,
  ].join('\n');
  openWhatsAppDirect(guest.telefone ?? '', message);
};
</script>

<style scoped>
.guests-table__loading,
.guests-table__empty {
  text-align: center;
  color: #64748b;
  padding: 2rem;
}

.guests-table__wrapper {
  overflow-x: auto;
}

.guests-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.guests-table__table th,
.guests-table__table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #2d2d44;
}

.guests-table__table th {
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #16162a;
}

.guests-table__table td {
  color: #e2e8f0;
}

.guests-table__table tbody tr:hover {
  background: rgba(59, 130, 246, 0.1);
}

.guests-table__code {
  font-family: monospace;
  font-weight: 600;
  color: #3b82f6;
}

.guests-table__name {
  font-weight: 500;
}

.guests-table__partner {
  color: #94a3b8;
  font-weight: 400;
}

.guests-table__badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.guests-table__badge--success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.guests-table__badge--pending {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.guests-table__badge--declined {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Invite column */
.guests-table__invite {
  white-space: nowrap;
}

.guests-table__invite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #2d2d44;
  border-radius: 0.375rem;
  background: #1e1e36;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
  margin-right: 0.25rem;
}

.guests-table__invite-btn:hover {
  background: #2d2d44;
  color: #e2e8f0;
}

.guests-table__invite-btn--copied {
  border-color: #10b981;
  color: #10b981;
}

.guests-table__invite-btn--whatsapp {
  color: #25d366;
  border-color: #1a6640;
}

.guests-table__invite-btn--whatsapp:hover {
  background: rgba(37, 211, 102, 0.15);
  color: #25d366;
}

.guests-table__invite-btn--regen {
  color: #f59e0b;
  border-color: #78460e;
}

.guests-table__invite-btn--regen:hover {
  background: rgba(245, 158, 11, 0.15);
}

.guests-table__invite-none {
  color: #475569;
}
</style>
