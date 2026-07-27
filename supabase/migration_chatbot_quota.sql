-- Limite de mensagens do chatbot por mês, conforme o plano
-- Sem isso, o número de mensagens anunciado por plano (50/150/300) não era aplicado de verdade

ALTER TABLE users ADD COLUMN IF NOT EXISTS chatbot_msgs_used integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chatbot_msgs_reset_date timestamptz;
