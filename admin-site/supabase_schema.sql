
-- Schema & policies for Projects, Certificates, Experiences, Admins

create table if not exists public.projects (
  id bigserial primary key,
  title text not null,
  description text,
  img text,
  link text,
  github text,
  features jsonb default '[]'::jsonb,
  techstack jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.certificates (
  id bigserial primary key,
  img text not null,
  created_at timestamptz default now()
);

create table if not exists public.experiences (
  id bigserial primary key,
  year int not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.admins (
  id uuid primary key default auth.uid(),
  email text unique
);

alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.experiences enable row level security;
alter table public.admins enable row level security;

create policy if not exists "public read projects" on public.projects for select using (true);
create policy if not exists "public read certificates" on public.certificates for select using (true);
create policy if not exists "public read experiences" on public.experiences for select using (true);

create policy if not exists "admin write projects" on public.projects for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy if not exists "admin write certificates" on public.certificates for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy if not exists "admin write experiences" on public.experiences for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy if not exists "admins self view" on public.admins for select using (auth.uid() = id);
create policy if not exists "admins insert by self" on public.admins for insert with check (auth.uid() = id);
create policy if not exists "admins update by self" on public.admins for update using (auth.uid() = id);
