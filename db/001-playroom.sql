CREATE TABLE IF NOT EXISTS skye_game_presets (
  id uuid PRIMARY KEY,
  name varchar(80) NOT NULL,
  config jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS skye_admin_sessions (
  token_hash text PRIMARY KEY,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS skye_login_limits (
  bucket bigint PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1
);
