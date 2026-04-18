-- Core profiles with roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique,
  role text not null check (role in ('student', 'cr')),
  full_name text,
  created_at timestamptz not null default now()
);

-- Notices shown on dashboard
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  event_type text not null check (event_type in ('quiz', 'mid', 'final')),
  scheduled_at timestamptz not null,
  syllabus text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Materials metadata, files live in Supabase Storage
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null check (
    subject in ('operating-system', 'software-engineering', 'artificial-intelligence', 'introduction-to-data-science')
  ),
  category text not null check (category in ('mid-slides', 'final-slides', 'questions')),
  file_url text,
  external_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((file_url is not null) or (external_url is not null))
);

-- Student completion tracker (per resource)
create table if not exists public.student_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, material_id)
);

-- Query templates for YouTube search
create table if not exists public.video_config (
  id int primary key,
  quiz_query text not null,
  mid_query text not null,
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now()
);

insert into public.video_config (id, quiz_query, mid_query, updated_by)
select 1,
  'operating system software engineering artificial intelligence data science quiz preparation',
  'operating system software engineering artificial intelligence data science mid exam',
  p.id
from public.profiles p
where p.role = 'cr'
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.notices enable row level security;
alter table public.materials enable row level security;
alter table public.student_progress enable row level security;
alter table public.video_config enable row level security;

-- Profiles
create policy "profiles_self_read" on public.profiles
for select using (id = auth.uid());

create policy "profiles_self_insert" on public.profiles
for insert with check (id = auth.uid());

create policy "profiles_self_update" on public.profiles
for update using (id = auth.uid());

-- Students and CR can read notices/materials/video settings
create policy "notices_read_all_users" on public.notices
for select using (auth.uid() is not null);

create policy "materials_read_all_users" on public.materials
for select using (auth.uid() is not null);

create policy "video_config_read_all_users" on public.video_config
for select using (auth.uid() is not null);

-- CR write policies
create policy "notices_cr_write" on public.notices
for all using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
);

create policy "materials_cr_write" on public.materials
for all using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
);

create policy "video_config_cr_write" on public.video_config
for all using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'cr'
  )
);

-- Progress policies (student owns their rows)
create policy "progress_student_read" on public.student_progress
for select using (student_id = auth.uid());

create policy "progress_student_upsert" on public.student_progress
for insert with check (student_id = auth.uid());

create policy "progress_student_update" on public.student_progress
for update using (student_id = auth.uid()) with check (student_id = auth.uid());
