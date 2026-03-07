<template>
  <div class="contracts-table-wrapper">
    <div
      v-if="loading"
      class="contracts-table__loading"
    >
      Carregando...
    </div>
    <div
      v-else-if="contracts.length === 0"
      class="contracts-table__empty"
    >
      Nenhum contrato cadastrado.
    </div>
    <table
      v-else
      class="contracts-table"
    >
      <thead>
        <tr>
          <th>Responsável</th>
          <th>Empresa</th>
          <th>Contato</th>
          <th class="text-right">Valor</th>
          <th class="text-right">Pago</th>
          <th class="text-right">Restante</th>
          <th class="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="contract in contracts"
          :key="contract.id"
        >
          <td>{{ contract.responsavel || '-' }}</td>
          <td>{{ contract.empresa || '-' }}</td>
          <td>{{ contract.contato || '-' }}</td>
          <td class="text-right">
            {{ formatCurrency(contract.valor || 0) }}
          </td>
          <td class="text-right">
            {{ formatCurrency(contract.pago || 0) }}
          </td>
          <td class="text-right">
            <span :class="getRestanteClass(contract)">
              {{ formatCurrency(getRestante(contract)) }}
            </span>
          </td>
          <td class="text-center">
            <button
              class="contracts-table__btn"
              @click="$emit('edit', contract)"
              title="Editar"
            >
              ✏️
            </button>
            <button
              class="contracts-table__btn"
              @click="$emit('delete', contract)"
              title="Excluir"
            >
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Contract } from '@/entities/contract';

interface Props {
  contracts: Contract[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  edit: [contract: Contract];
  delete: [contract: Contract];
}>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getRestante = (contract: Contract): number => {
  return (contract.valor || 0) - (contract.pago || 0);
};

const getRestanteClass = (contract: Contract): string => {
  const restante = getRestante(contract);
  if (restante === 0) return 'text-success';
  if (restante < 0) return 'text-info';
  return 'text-warning';
};
</script>

<style scoped>
.contracts-table-wrapper {
  background: #1a1a2e;
  border-radius: 0.75rem;
  overflow: hidden;
}

.contracts-table__loading,
.contracts-table__empty {
  color: #64748b;
  text-align: center;
  padding: 3rem;
}

.contracts-table {
  width: 100%;
  border-collapse: collapse;
}

.contracts-table th,
.contracts-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid #2d2d44;
}

.contracts-table th {
  background: #0f0f1a;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contracts-table td {
  color: #fff;
  font-size: 0.875rem;
}

.contracts-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.contracts-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.text-success {
  color: #10b981;
}

.text-warning {
  color: #f59e0b;
}

.text-info {
  color: #3b82f6;
}

.contracts-table__btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.contracts-table__btn:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .contracts-table-wrapper {
    overflow-x: auto;
  }

  .contracts-table {
    min-width: 600px;
  }
}
</style>
