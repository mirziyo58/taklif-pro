create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invite text,
  name text not null,
  attending boolean not null,
  guests int not null default 1,
  message text,
  created_at timestamptz not null default now()
);
grant all on public.rsvps to service_role;
grant select on public.rsvps to authenticated;
alter table public.rsvps enable row level security;
create policy "admins read rsvps" on public.rsvps for select to authenticated using (public.has_role(auth.uid(), 'admin'));