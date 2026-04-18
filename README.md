# StudyBuddy

StudyBuddy is a student study portal with:
- Student login/register using 3-digit ID (`000`-`999`) + password
- CR/Admin panel for notices, materials, videos, and credentials
- Dashboard notices with upcoming countdown
- Subject-wise materials (mid slides, final slides, questions) for both students and CR
- Suggested YouTube videos auto-fetched from uploaded slide names (mid + final)
- Per-student progress tracker
- Topic and subject search by category
- Quiz/mid/final notice notifications
- Content suggestion feedback system from students
- Credential management for student/CR accounts
- Exam timer board (countdown from notices)

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind
- Supabase Auth + Postgres + Storage
- YouTube Data API v3

## Local setup
1. Install dependencies:
   - `npm install`
2. Copy env:
   - `copy .env.example .env.local`
3. Fill `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `YOUTUBE_API_KEY`
4. Run migration SQL in Supabase SQL editor (both):
    - `supabase/migrations/001_init.sql`
    - `supabase/migrations/002_cr_project_features.sql`
    - `supabase/migrations/003_video_final_and_profile_access.sql`
    - `supabase/migrations/004_material_youtube_indexing.sql`
5. Start app:
   - `npm run dev`

## Where to upload your slides and questions (local)
You can upload locally by copying files into:

- `public/course-content/operating-system/mid-slides`
- `public/course-content/operating-system/final-slides`
- `public/course-content/operating-system/questions`
- `public/course-content/software-engineering/mid-slides`
- `public/course-content/software-engineering/final-slides`
- `public/course-content/software-engineering/questions`
- `public/course-content/artificial-intelligence/mid-slides`
- `public/course-content/artificial-intelligence/final-slides`
- `public/course-content/artificial-intelligence/questions`
- `public/course-content/introduction-to-data-science/mid-slides`
- `public/course-content/introduction-to-data-science/final-slides`
- `public/course-content/introduction-to-data-science/questions`

These local files are auto-discovered and shown in:
- `/materials`

You can still use CR upload panel:
- `/cr/admin/materials` (Supabase Storage bucket `study-materials`)

## Auto YouTube video generation from slides
- Upload slides from `/cr/admin/materials` under categories:
  - `mid-slides`
  - `final-slides`
- For each uploaded slide, the system auto-searches YouTube and saves up to **5** videos.
- Students can view grouped results at:
  - `/videos` (slide name first, then video list)
- For already uploaded slides, run backfill from:
  - `/cr/admin/videos`

## Important notes
- Student login internally maps 3-digit ID to a synthetic email format:
  - `NNN@studybuddy.app`
- CR login can auto-create profile as `cr` on first login.
- To use admin role, set `profiles.role` to `admin` manually in Supabase.

## Deploy on Vercel
1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.local`.
4. Deploy.
