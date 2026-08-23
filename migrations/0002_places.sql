create table if not exists saved_places (
  id serial primary key,
  user_id text not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  admin text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists saved_places_user_id_idx on saved_places (user_id);
