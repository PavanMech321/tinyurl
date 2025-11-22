-- migrations/001_init.sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ NULL,
  total_clicks INTEGER NOT NULL DEFAULT 0
);


-- Helpful index for search
CREATE INDEX IF NOT EXISTS idx_links_code ON links (code);
CREATE INDEX IF NOT EXISTS idx_links_url ON links USING GIN (to_tsvector('simple', url));
