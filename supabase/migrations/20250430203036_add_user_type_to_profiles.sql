alter table profiles
  add column IF NOT EXISTS user_role text not null default 'user';
