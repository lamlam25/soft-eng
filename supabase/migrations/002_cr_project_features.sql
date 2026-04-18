-- Expand roles
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'cr', 'admin'));

-- CR searchable profile details
create table if not exists public.cr_profiles (
  cr_id uuid primary key references public.profiles(id) on delete cascade,
  designation text default 'Class Representative',
  expertise text,
  bio text,
  contact_email text,
  updated_at timestamptz not null default now()
);

-- Project topic ideas with tutorial links
create table if not exists public.project_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  video_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Student -> CR selection workflow
create table if not exists public.cr_selections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  cr_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  unique(student_id)
);

-- In-app notification feed
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Feedback/message system (email-style inside app)
create table if not exists public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Project registration records
create table if not exists public.project_registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  cr_id uuid references public.profiles(id) on delete set null,
  topic text not null,
  category text not null,
  summary text not null,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'defended')),
  created_at timestamptz not null default now()
);

-- Defense scheduling
create table if not exists public.defense_schedules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project_registrations(id) on delete cascade,
  scheduled_at timestamptz not null,
  venue text not null,
  panel text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Admin credential management vault (metadata/hints only)
create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  credential_name text not null,
  username text not null,
  secret_hint text not null,
  is_active boolean not null default true,
  managed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.cr_profiles enable row level security;
alter table public.project_topics enable row level security;
alter table public.cr_selections enable row level security;
alter table public.notifications enable row level security;
alter table public.feedback_messages enable row level security;
alter table public.project_registrations enable row level security;
alter table public.defense_schedules enable row level security;
alter table public.admin_credentials enable row level security;

-- Allow authenticated users to browse profiles (needed for CR search/feedback targets)
create policy "profiles_read_all_users" on public.profiles
for select using (auth.uid() is not null);

-- Extend write permissions on existing tables for admin role
create policy "notices_admin_write" on public.notices
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "materials_admin_write" on public.materials
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "video_config_admin_write" on public.video_config
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- CR profile browsing
create policy "cr_profiles_read_all_users" on public.cr_profiles
for select using (auth.uid() is not null);

create policy "cr_profiles_cr_admin_write" on public.cr_profiles
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('cr', 'admin')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('cr', 'admin')
  )
);

-- Topics
create policy "project_topics_read_all_users" on public.project_topics
for select using (auth.uid() is not null);

create policy "project_topics_cr_admin_write" on public.project_topics
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('cr', 'admin')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('cr', 'admin')
  )
);

-- CR selections
create policy "cr_selection_read_related" on public.cr_selections
for select using (
  student_id = auth.uid() or cr_id = auth.uid() or
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('cr', 'admin')
  )
);

create policy "cr_selection_student_insert" on public.cr_selections
for insert with check (
  student_id = auth.uid() and
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
);

create policy "cr_selection_cr_admin_update" on public.cr_selections
for update using (
  cr_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
) with check (
  cr_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

-- Notifications
create policy "notifications_user_read" on public.notifications
for select using (user_id = auth.uid());

create policy "notifications_cr_admin_insert" on public.notifications
for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

create policy "notifications_user_update" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Feedback
create policy "feedback_read_related" on public.feedback_messages
for select using (
  from_user = auth.uid() or to_user = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

create policy "feedback_insert_sender" on public.feedback_messages
for insert with check (from_user = auth.uid());

-- Project registration
create policy "projects_read_related" on public.project_registrations
for select using (
  student_id = auth.uid() or cr_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

create policy "projects_student_insert" on public.project_registrations
for insert with check (
  student_id = auth.uid() and
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
);

create policy "projects_cr_admin_update" on public.project_registrations
for update using (
  cr_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

-- Defense schedule
create policy "defense_read_all_users" on public.defense_schedules
for select using (auth.uid() is not null);

create policy "defense_cr_admin_write" on public.defense_schedules
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

-- Admin credentials
create policy "admin_credentials_cr_admin_read" on public.admin_credentials
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);

create policy "admin_credentials_cr_admin_write" on public.admin_credentials
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('cr', 'admin'))
);
