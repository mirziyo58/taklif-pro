create table public.invites (
  id text primary key,
  owner_code text not null unique,
  data jsonb not null,
  created_at timestamptz not null default now()
);
grant all on public.invites to service_role;
grant select on public.invites to authenticated;
alter table public.invites enable row level security;
create policy "admins read invites" on public.invites for select to authenticated using (public.has_role(auth.uid(), 'admin'));

alter table public.rsvps add column invite_id text;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  service text not null, name text not null, contact text not null,
  deadline text, brief text not null,
  created_at timestamptz not null default now()
);
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create table public.telegram_chats (
  chat_id bigint primary key, title text,
  created_at timestamptz not null default now()
);
grant all on public.telegram_chats to service_role;
alter table public.telegram_chats enable row level security;