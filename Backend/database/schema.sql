CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID, name VARCHAR(120) NOT NULL, email VARCHAR(255) NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (business_id,email));
CREATE UNIQUE INDEX users_global_email_unique ON users(email) WHERE business_id IS NULL;
CREATE TABLE appointments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, service VARCHAR(160) NOT NULL, starts_at TIMESTAMPTZ NOT NULL, duration_minutes SMALLINT NOT NULL CHECK(duration_minutes BETWEEN 15 AND 240), notes TEXT NOT NULL DEFAULT '', status VARCHAR(24) NOT NULL DEFAULT 'confirmed' CHECK(status IN ('pending','confirmed','cancelled','completed')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX appointments_user_starts_at_idx ON appointments(user_id,starts_at);
CREATE INDEX appointments_business_starts_at_idx ON appointments(business_id,starts_at) WHERE business_id IS NOT NULL;
CREATE TABLE chat_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, messages JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX chat_sessions_user_updated_idx ON chat_sessions(user_id,updated_at DESC);
CREATE INDEX chat_sessions_messages_gin_idx ON chat_sessions USING GIN(messages);
INSERT INTO users(id,name,email,password_hash) VALUES ('00000000-0000-0000-0000-000000000001','Demo User','demo@example.com','replace-with-real-scrypt-or-bcrypt-hash');
INSERT INTO appointments(user_id,service,starts_at,duration_minutes,status) VALUES ('00000000-0000-0000-0000-000000000001','Consultation',NOW()+INTERVAL '2 days',30,'confirmed');
-- Bound JSONB histories in the application. At scale, split messages into a chat_messages table and partition appointments by business/date.
