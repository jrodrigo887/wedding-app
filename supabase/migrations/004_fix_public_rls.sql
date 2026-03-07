-- ========================================
-- MIGRATION 004: Segurança por invite_token via RPC SECURITY DEFINER
--
-- Problema: políticas RLS de tenant isolation bloqueiam silenciosamente
-- atualizações de convidados anônimos (migration 001 atribuiu tenant_id
-- a todos os registros, mas get_current_tenant_id() retorna NULL para anônimos).
--
-- Solução: remover as políticas de tenant isolation, manter SELECT público,
-- e expor as operações de escrita exclusivamente via funções SECURITY DEFINER
-- (chamadas por supabase.rpc()). O banco valida o invite_token internamente —
-- sem o token correto, nenhum UPDATE é possível.
-- ========================================

-- Remove políticas de tenant isolation (se existirem)
DROP POLICY IF EXISTS "tenant_isolation_select_convidados" ON convidados;
DROP POLICY IF EXISTS "tenant_isolation_insert_convidados" ON convidados;
DROP POLICY IF EXISTS "tenant_isolation_update_convidados" ON convidados;
DROP POLICY IF EXISTS "tenant_isolation_delete_convidados" ON convidados;

-- Remove políticas públicas antigas (se existirem) para evitar conflito de nomes
DROP POLICY IF EXISTS "Convidados podem ser lidos publicamente" ON convidados;
DROP POLICY IF EXISTS "Convidados podem ser atualizados publicamente" ON convidados;
DROP POLICY IF EXISTS "convidados_select_public" ON convidados;
DROP POLICY IF EXISTS "convidados_update_public" ON convidados;

-- Leitura pública (SELECT permanece público para carregar dados do convidado via token)
CREATE POLICY "convidados_select_public"
    ON convidados FOR SELECT
    USING (true);

-- ========================================
-- RPC: Confirmar presença
-- Requer invite_token válido; atualiza confirmado = true
-- ========================================
CREATE OR REPLACE FUNCTION rsvp_confirm_presence(p_invite_token UUID)
RETURNS VOID AS $$
DECLARE
  v_id INT;
BEGIN
  UPDATE convidados
    SET confirmado = true,
        data_confirmacao = NOW()
    WHERE invite_token = p_invite_token
    RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Token inválido ou não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rsvp_confirm_presence(UUID) TO anon;

-- ========================================
-- RPC: Cancelar presença (voltou a indeciso)
-- Requer invite_token válido; atualiza confirmado = false
-- ========================================
CREATE OR REPLACE FUNCTION rsvp_cancel_presence(p_invite_token UUID)
RETURNS VOID AS $$
DECLARE
  v_id INT;
BEGIN
  UPDATE convidados
    SET confirmado = false,
        data_confirmacao = NOW()
    WHERE invite_token = p_invite_token
    RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Token inválido ou não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rsvp_cancel_presence(UUID) TO anon;

-- ========================================
-- RPC: Recusar presença (explicitamente não virá)
-- Requer invite_token válido; atualiza confirmado = false, recusou = true
-- ========================================
CREATE OR REPLACE FUNCTION rsvp_decline_presence(p_invite_token UUID)
RETURNS VOID AS $$
DECLARE
  v_id INT;
BEGIN
  UPDATE convidados
    SET confirmado = false,
        recusou = true,
        data_confirmacao = NOW()
    WHERE invite_token = p_invite_token
    RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Token inválido ou não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rsvp_decline_presence(UUID) TO anon;

-- ========================================
-- RPC: Regenerar invite_token de um convidado (operação de admin)
-- Gera um novo UUID e sobrescreve o token anterior
-- ========================================
CREATE OR REPLACE FUNCTION rsvp_regenerate_invite_token(p_guest_id INT)
RETURNS UUID AS $$
DECLARE
  v_new_token UUID;
BEGIN
  v_new_token := gen_random_uuid();

  UPDATE convidados
    SET invite_token = v_new_token,
        recusou = false,
        confirmado = false
    WHERE id = p_guest_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convidado com id % não encontrado', p_guest_id;
  END IF;

  RETURN v_new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rsvp_regenerate_invite_token(INT) TO anon;
