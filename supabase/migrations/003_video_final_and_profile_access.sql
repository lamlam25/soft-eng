alter table public.video_config
  add column if not exists final_query text;

update public.video_config
set final_query = coalesce(
  final_query,
  'operating system software engineering artificial intelligence data science final exam preparation'
)
where id = 1;

create policy "profiles_read_authenticated" on public.profiles
for select using (auth.uid() is not null);
