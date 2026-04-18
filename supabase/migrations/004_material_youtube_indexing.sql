create table if not exists public.material_video_queries (
  material_id uuid primary key references public.materials(id) on delete cascade,
  query_text text not null,
  source_filename text not null,
  status text not null default 'pending' check (status in ('pending', 'fetching', 'ready', 'error')),
  last_fetched_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_youtube_videos (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  youtube_video_id text not null,
  title text not null,
  channel text not null,
  published_at timestamptz not null,
  video_url text not null,
  rank int not null check (rank > 0),
  created_at timestamptz not null default now(),
  unique(material_id, youtube_video_id)
);

create index if not exists idx_material_video_queries_status
  on public.material_video_queries(status);

create index if not exists idx_material_youtube_videos_material_rank
  on public.material_youtube_videos(material_id, rank);

alter table public.material_video_queries enable row level security;
alter table public.material_youtube_videos enable row level security;

create policy "material_video_queries_read_all_users" on public.material_video_queries
for select using (auth.uid() is not null);

create policy "material_video_queries_cr_admin_write" on public.material_video_queries
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

create policy "material_youtube_videos_read_all_users" on public.material_youtube_videos
for select using (auth.uid() is not null);

create policy "material_youtube_videos_cr_admin_write" on public.material_youtube_videos
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
