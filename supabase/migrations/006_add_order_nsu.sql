-- Migration: Adiciona order_nsu para rastreio de checkouts InfinityPay
-- Permite vincular um registro de contribuição ao checkout criado via API

ALTER TABLE contribuicoes_lua_de_mel
  ADD COLUMN IF NOT EXISTS order_nsu text;
