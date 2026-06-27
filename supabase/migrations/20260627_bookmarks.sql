-- 저장된 공고·인사이트(북마크) 테이블
-- 흐름: 카드의 북마크 토글 → 프론트가 Supabase에 직접 insert/delete(RLS로 본인 행만)
-- 설계: (user_id, kind, item_id) 1행 = 북마크 1개. 카드 렌더용 원본을 data(jsonb)에 통째 저장.
--   - kind = 'job'     → item_id = opportunities.id(uuid) 문자열, data = Opportunity
--   - kind = 'insight' → item_id = news_articles.id(bigint) 문자열, data = NewsArticle
-- 로그인 유저(users.id = auth.users.id)와 연결

create table if not exists public.bookmarks (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind = any (array['job'::text, 'insight'::text])),
  item_id text not null,                          -- 공고 id(uuid) 또는 인사이트 id(bigint) 문자열
  data jsonb not null default '{}'::jsonb,         -- 카드 렌더용 원본(Opportunity / NewsArticle)
  created_at timestamp with time zone not null default now(),

  constraint bookmarks_pkey primary key (id),
  constraint bookmarks_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade,
  -- 같은 항목 중복 저장 방지 + upsert 충돌 키
  constraint bookmarks_user_kind_item_unique unique (user_id, kind, item_id)
);

-- 유저별 최신순 조회 최적화
create index if not exists bookmarks_user_id_created_at_idx
  on public.bookmarks (user_id, created_at desc);

-- RLS: 본인 행만 읽고/쓰고/지운다
alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own"
  on public.bookmarks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);
