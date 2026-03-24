-- ============================================
-- SQL para Permissões de Edição de Convidados
-- ============================================
-- Este arquivo contém as políticas RLS (Row Level Security) necessárias
-- para permitir que usuários autenticados (administradores) possam
-- editar convidados na tabela 'convidados'.

-- 1. Habilitar RLS na tabela convidados (caso ainda não esteja habilitado)
ALTER TABLE convidados ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir UPDATE (edição) de convidados
-- Esta política permite que apenas usuários autenticados possam atualizar registros
CREATE POLICY "Authenticated users can update guests"
ON convidados
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Política para permitir SELECT (leitura) de convidados
-- Geralmente já existe, mas incluímos aqui para garantir
CREATE POLICY IF NOT EXISTS "Authenticated users can read guests"
ON convidados
FOR SELECT
TO authenticated
USING (true);

-- 4. (Opcional) Política para permitir INSERT (criação) de convidados
-- Descomente se você quiser adicionar funcionalidade de criação de convidados
-- CREATE POLICY "Authenticated users can insert guests"
-- ON convidados
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- 5. (Opcional) Política para permitir DELETE (exclusão) de convidados
-- Descomente se você quiser adicionar funcionalidade de exclusão de convidados
-- CREATE POLICY "Authenticated users can delete guests"
-- ON convidados
-- FOR DELETE
-- TO authenticated
-- USING (true);

-- ============================================
-- Verificar políticas existentes
-- ============================================
-- Execute esta query para ver todas as políticas na tabela convidados:
-- SELECT * FROM pg_policies WHERE tablename = 'convidados';

-- ============================================
-- Remover políticas antigas (se necessário)
-- ============================================
-- Se você precisa substituir políticas existentes, use:
-- DROP POLICY IF EXISTS "nome_da_politica_antiga" ON convidados;

-- ============================================
-- IMPORTANTE: Segurança
-- ============================================
-- Estas políticas permitem que QUALQUER usuário autenticado possa editar convidados.
-- Se você tiver diferentes níveis de usuários (ex: admin, user), você deve
-- modificar as políticas para verificar roles específicos.
--
-- Exemplo com verificação de role de admin:
-- CREATE POLICY "Only admins can update guests"
-- ON convidados
-- FOR UPDATE
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin')
-- WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Notas Adicionais
-- ============================================
-- 1. Certifique-se de que o campo 'updated_at' é atualizado automaticamente
--    através de um trigger ou pela aplicação (já implementado no código)
--
-- 2. Os campos 'id', 'created_at', 'invite_token' e 'short_code' são
--    protegidos no código da aplicação e não serão atualizados mesmo
--    que a política permita
--
-- 3. Para aplicar estas mudanças no Supabase:
--    - Acesse o Dashboard do Supabase
--    - Vá em "SQL Editor"
--    - Cole e execute este SQL
--    - Ou use a CLI do Supabase: supabase db push
