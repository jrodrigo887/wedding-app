-- Migration: Tabela de contribuições para o Fundo de Lua de Mel
-- Os itens são simbólicos/fictícios; o registro serve apenas para estatística.

CREATE TABLE IF NOT EXISTS contribuicoes_lua_de_mel (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id    integer NOT NULL,
  item_title text NOT NULL,
  item_price numeric(10, 2) NOT NULL,
  metodo     text NOT NULL CHECK (metodo IN ('pix', 'cartao')),
  created_at timestamptz DEFAULT now()
);

-- Acesso público: qualquer visitante pode inserir e ler (sem autenticação)
ALTER TABLE contribuicoes_lua_de_mel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert contribuicoes"
  ON contribuicoes_lua_de_mel
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read contribuicoes"
  ON contribuicoes_lua_de_mel
  FOR SELECT
  USING (true);
