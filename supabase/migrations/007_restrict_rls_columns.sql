-- ============================================================
-- MIGRATION 007: Restringir SELECT público na tabela convidados
-- Remove a política wildcard e expõe apenas campos não-sensíveis
-- via funções SECURITY DEFINER para usuários anônimos.
-- ============================================================

-- Remove a política que permitia SELECT * para qualquer anônimo
DROP POLICY IF EXISTS "convidados_select_public" ON convidados;

-- SELECT direto na tabela somente para usuários autenticados (admin)
CREATE POLICY "convidados_select_authenticated_only"
    ON convidados FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================
-- RPC pública: busca por código do convidado
-- Retorna apenas campos não-sensíveis (sem email, telefone,
-- observacoes, invite_token).
-- Usado pela área de check-in (scanner QR + entrada manual).
-- ============================================================
CREATE OR REPLACE FUNCTION get_guest_by_code(p_codigo TEXT)
RETURNS TABLE(
  id           INT,
  codigo       VARCHAR,
  nome         VARCHAR,
  parceiro     VARCHAR,
  acompanhantes INT,
  confirmado   BOOLEAN,
  checkin      BOOLEAN,
  horario_entrada TIMESTAMPTZ,
  recusou      BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      c.id,
      c.codigo,
      c.nome,
      c.parceiro,
      c.acompanhantes,
      c.confirmado,
      c.checkin,
      c.horario_entrada,
      c.recusou
    FROM convidados c
    WHERE LOWER(c.codigo) = LOWER(p_codigo)
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_guest_by_code(TEXT) TO anon;

-- ============================================================
-- RPC pública: busca por invite_token
-- Retorna campos não-sensíveis + o próprio invite_token
-- (seguro pois o caller já o possui para fazer a busca).
-- Usado pelo fluxo de RSVP via magic link.
-- ============================================================
CREATE OR REPLACE FUNCTION get_guest_by_token(p_invite_token UUID)
RETURNS TABLE(
  id           INT,
  codigo       VARCHAR,
  nome         VARCHAR,
  parceiro     VARCHAR,
  acompanhantes INT,
  confirmado   BOOLEAN,
  checkin      BOOLEAN,
  horario_entrada TIMESTAMPTZ,
  recusou      BOOLEAN,
  invite_token UUID,
  short_code   VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      c.id,
      c.codigo,
      c.nome,
      c.parceiro,
      c.acompanhantes,
      c.confirmado,
      c.checkin,
      c.horario_entrada,
      c.recusou,
      c.invite_token,
      c.short_code
    FROM convidados c
    WHERE c.invite_token = p_invite_token
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_guest_by_token(UUID) TO anon;
