-- user_preferences RLS — 알림 설정을 프론트(Supabase 직접 접근)에서 안전하게 저장하기 위함.
-- 흐름: 알림 설정 페이지가 본인 행을 upsert(enable_notifications / notification_frequency / email).
-- 본인(auth.uid() = user_id) 행만 read/insert/update 가능하게 제한한다.
--
-- ⚠️ 중요: 주간 발송 스크립트(pipeline/weekly_digest.py)는 로그인 세션이 아니라
--   서버에서 도므로, RLS를 우회하려면 GitHub Actions의 SUPABASE_KEY 시크릿이
--   반드시 **service_role 키**여야 한다(anon 키면 RLS에 막혀 유저 목록을 못 읽음).
--   service_role 키는 RLS를 자동으로 우회하므로 발송 로직은 그대로 동작한다.

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
