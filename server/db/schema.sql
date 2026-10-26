CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  photo_url  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trails (
  id          SERIAL PRIMARY KEY,
  sloc        JSONB NOT NULL,              -- [lng, lat]
  floc        JSONB NOT NULL,              -- [lng, lat]
  checkp      JSONB NOT NULL DEFAULT '[]', -- [[lng, lat, description], ...]
  price       NUMERIC NOT NULL DEFAULT 0,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  images      JSONB NOT NULL DEFAULT '[]',
  difficulty  DOUBLE PRECISION,
  uid         TEXT NOT NULL,
  u_name      TEXT NOT NULL,
  u_photo     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  from_date    TIMESTAMPTZ NOT NULL,
  to_date      TIMESTAMPTZ NOT NULL,
  location     TEXT NOT NULL,
  participants TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  event_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  username   TEXT NOT NULL,
  content    TEXT NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_event_idx ON messages (event_id, timestamp);
