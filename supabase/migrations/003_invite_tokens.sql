-- ========================================
-- MIGRATION 003: Invite Tokens + Recusou
-- Adiciona suporte a links exclusivos de convite
-- e rastreamento de recusa explícita de presença
-- ========================================

-- Coluna para link exclusivo de convite (magic link)
ALTER TABLE convidados
  ADD COLUMN IF NOT EXISTS invite_token UUID DEFAULT gen_random_uuid();

-- Coluna para distinguir "nunca respondeu" de "explicitamente recusou"
ALTER TABLE convidados
  ADD COLUMN IF NOT EXISTS recusou BOOLEAN DEFAULT FALSE;

-- Preenche registros existentes que ainda não têm token
UPDATE convidados
  SET invite_token = gen_random_uuid()
  WHERE invite_token IS NULL;

-- Garante unicidade do token
ALTER TABLE convidados
  ADD CONSTRAINT IF NOT EXISTS convidados_invite_token_unique UNIQUE (invite_token);

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_convidados_invite_token ON convidados(invite_token);
