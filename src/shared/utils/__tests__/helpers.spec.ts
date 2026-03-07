import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatCurrency,
  debounce,
  throttle,
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeString,
  generateId,
  capitalize,
  removeAccents,
  truncate,
  groupBy,
  sortBy,
  formatPhone,
} from '../helpers';

describe('helpers', () => {
  describe('formatDate', () => {
    it('formata data no formato ISO (YYYY-MM-DD)', () => {
      expect(formatDate('2026-04-12')).toMatch(/12 de abril de 2026/);
    });

    it('formata objeto Date', () => {
      const date = new Date(2026, 3, 12); // abril = mês 3
      expect(formatDate(date)).toMatch(/12 de abril de 2026/);
    });
  });

  describe('formatCurrency', () => {
    it('formata valor em BRL', () => {
      expect(formatCurrency(1234.56)).toMatch(/R\$[\s\u00A0]?1\.234,56/);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('atrasa execução da função', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('limita execuções em sequência', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isValidEmail', () => {
    it('valida email correto', () => {
      expect(isValidEmail('teste@exemplo.com')).toBe(true);
    });

    it('rejeita email inválido', () => {
      expect(isValidEmail('invalido')).toBe(false);
      expect(isValidEmail('sem@')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('valida nome com 3+ caracteres', () => {
      expect(isValidName('João Silva')).toBe(true);
    });

    it('rejeita nome muito curto', () => {
      expect(isValidName('Jo')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('valida telefone brasileiro', () => {
      expect(isValidPhone('(11) 98765-4321')).toBe(true);
    });
  });

  describe('sanitizeString', () => {
    it('remove tags HTML', () => {
      expect(sanitizeString('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  describe('generateId', () => {
    it('gera IDs únicos', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('capitalize', () => {
    it('capitaliza primeira letra', () => {
      expect(capitalize('joão')).toBe('João');
    });
  });

  describe('removeAccents', () => {
    it('remove acentos', () => {
      expect(removeAccents('café')).toBe('cafe');
    });
  });

  describe('truncate', () => {
    it('trunca texto longo', () => {
      expect(truncate('Texto muito longo para caber', 10)).toBe('Texto muit...');
    });

    it('mantém texto curto', () => {
      expect(truncate('Curto', 10)).toBe('Curto');
    });
  });

  describe('groupBy', () => {
    it('agrupa array por propriedade', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      const result = groupBy(items, 'type');
      expect(result.a).toHaveLength(2);
      expect(result.b).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('ordena array ascendente', () => {
      const items = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
      const result = sortBy(items, 'name', 'asc');
      expect(result[0].name).toBe('a');
    });

    it('ordena array descendente', () => {
      const items = [{ name: 'a' }, { name: 'c' }, { name: 'b' }];
      const result = sortBy(items, 'name', 'desc');
      expect(result[0].name).toBe('c');
    });
  });

  describe('formatPhone', () => {
    it('formata telefone brasileiro', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
  });
});
