-- ============================================================
-- MIGRATION 008: short_code para links curtos de convite
-- Adiciona campo short_code aleatório de 7 chars (não-sequencial,
-- não-enumerável) para substituir a URL longa com UUID.
-- URL resultante: /convite/7FKP3XZ → /confirmar-presenca?guest=UUID
-- ============================================================

-- Adiciona a coluna
ALTER TABLE convidados
  ADD COLUMN IF NOT EXISTS short_code VARCHAR(8);

-- Garante que pgcrypto está disponível (necessário para gen_random_bytes)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Gera short codes únicos para todos os convidados existentes.
-- Usa 4 bytes aleatórios codificados em hex (8 chars uppercase).
-- Em caso de colisão improvável, tenta novamente com seed diferente.
DO $$
DECLARE
  rec     RECORD;
  v_code  VARCHAR(8);
  v_tries INT;
BEGIN
  FOR rec IN SELECT id FROM convidados WHERE short_code IS NULL ORDER BY id LOOP
    v_tries := 0;
    LOOP
      -- 4 bytes → 8 chars hex uppercase → ~4 bilhões de combinações
      v_code := UPPER(ENCODE(gen_random_bytes(4), 'hex'));
      IF NOT EXISTS (SELECT 1 FROM convidados WHERE short_code = v_code) THEN
        UPDATE convidados SET short_code = v_code WHERE id = rec.id;
        EXIT;
      END IF;
      v_tries := v_tries + 1;
      IF v_tries > 20 THEN
        RAISE EXCEPTION 'Não foi possível gerar short_code único para id %', rec.id;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Constraint de unicidade
ALTER TABLE convidados
  ADD CONSTRAINT convidados_short_code_unique UNIQUE (short_code);

-- Índice para lookup rápido (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_convidados_short_code
  ON convidados(UPPER(short_code));

-- ============================================================
-- RPC pública: resolve short_code → invite_token
-- Usado pela função Vercel /api/convite para o redirect.
-- Retorna NULL se o código não existir (sem revelar informação).
-- ============================================================
CREATE OR REPLACE FUNCTION resolve_short_code(p_short_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token UUID;
BEGIN
  SELECT invite_token
    INTO v_token
    FROM convidados
   WHERE UPPER(short_code) = UPPER(p_short_code)
   LIMIT 1;
  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION resolve_short_code(TEXT) TO anon;
