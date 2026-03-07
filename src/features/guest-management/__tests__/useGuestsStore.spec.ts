import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuestsStore } from '../model/useGuestsStore';

// Mock do repositório
vi.mock('@/app/providers', () => ({
  createGuestRepository: () => ({
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    getStats: vi.fn().mockResolvedValue({ total: 0, confirmed: 0, checkedIn: 0 }),
    getCheckedIn: vi.fn().mockResolvedValue([]),
    registerCheckin: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('useGuestsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('inicializa com estado vazio', () => {
    const store = useGuestsStore();

    expect(store.guests).toEqual([]);
    expect(store.loading).toBe(false);
  });
});
