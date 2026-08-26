-- Web Push subscriptions (optional; in-app Notification API needs no table)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id TEXT NULL,
  -- last place the client reported (for alert targeting)
  latitude DOUBLE PRECISION NULL,
  longitude DOUBLE PRECISION NULL,
  place_name TEXT NULL,
  -- preferences
  rain_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  uv_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id);
