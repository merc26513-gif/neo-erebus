-- Production schema (Postgres + pgvector). Phase-0 dev uses in-memory store.js with identical ops.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tg_id bigint UNIQUE, username text, lang text, is_premium bool DEFAULT false, created_at timestamptz DEFAULT now());
CREATE TABLE spaces(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid REFERENCES users, slug text UNIQUE, title text, theme jsonb, bg_shader_seed bigint, visibility text DEFAULT 'public', created_at timestamptz DEFAULT now());
CREATE TABLE rooms(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), space_id uuid REFERENCES spaces, parent_room_id uuid, title text, order_idx int);
CREATE TABLE artifacts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), space_id uuid REFERENCES spaces, room_id uuid, author_id uuid REFERENCES users, type text, title text, description text, storage_ref text, preview_ref text, loop_ref text, manifest jsonb, visibility text DEFAULT 'public', remix_of uuid, embedding vector(1536), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE editions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), artifact_id uuid REFERENCES artifacts, supply int, kind text);
CREATE TABLE ownership(edition_id uuid REFERENCES editions, owner_id uuid REFERENCES users, serial int, PRIMARY KEY(edition_id, serial));
CREATE TABLE reactions(user_id uuid, artifact_id uuid, kind text, PRIMARY KEY(user_id, artifact_id, kind));
CREATE TABLE ledger(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account text, amount bigint, memo text, ref text, created_at timestamptz DEFAULT now());
CREATE INDEX ledger_acct ON ledger(account);
-- balance = SELECT COALESCE(SUM(amount),0) FROM ledger WHERE account=$1;  (never store balance)
