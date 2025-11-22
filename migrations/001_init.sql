-- migrations/001_init.sql
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ NULL,
  total_clicks INTEGER NOT NULL DEFAULT 0
);


-- Helpful index for search
CREATE INDEX IF NOT EXISTS idx_links_code ON links (code);
CREATE INDEX IF NOT EXISTS idx_links_url ON links USING GIN (to_tsvector('simple', url));
