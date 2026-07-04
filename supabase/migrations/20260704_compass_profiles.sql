-- 나침반(Compass) 프로필 정본(canonical) 저장 테이블
-- 목적: 나침반 ↔ 마이페이지 프로필 "양방향 동기화"의 단일 원천(source of truth).
--   ProfileSummary(A/B 공통 스키마 9필드)를 구조 그대로 jsonb로 저장 → 무손실 왕복.
-- 흐름:
--   · 나침반 완료 + 저장 동의  → upsert → 마이페이지 프로필에 즉시 반영
--   · 마이페이지 프로필 저장    → upsert → 나침반 재방문 시 "불러오기"로 프리필
-- 설계: 유저당 1행(user_id PK, upsert). 개인정보(이메일·전화)는 여기서 다루지 않는다.

create table if not exists public.compass_profiles (
  user_id    uuid not null,
  data       jsonb not null default '{}'::jsonb,  -- ProfileSummary 통째(track, nick, status, major, english, experience, second, cert, targetPath)
  updated_at timestamp with time zone not null default now(),

  constraint compass_profiles_pkey primary key (user_id),
  constraint compass_profiles_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade
);

-- RLS: 본인 행만 읽고/쓰기
alter table public.compass_profiles enable row level security;

drop policy if exists "compass_profiles_select_own" on public.compass_profiles;
create policy "compass_profiles_select_own"
  on public.compass_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "compass_profiles_insert_own" on public.compass_profiles;
create policy "compass_profiles_insert_own"
  on public.compass_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "compass_profiles_update_own" on public.compass_profiles;
create policy "compass_profiles_update_own"
  on public.compass_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
