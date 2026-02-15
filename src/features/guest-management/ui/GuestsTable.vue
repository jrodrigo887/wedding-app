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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '@/entities/guest';

/**
 * Component: GuestsTable
 * Tabela de convidados com código, nome, confirmado e check-in
 */
defineProps<{
  guests: Guest[];
  loading?: boolean;
}>();
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
</style>
