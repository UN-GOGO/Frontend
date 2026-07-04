-- 알림 피드(목록) 테이블
-- 흐름: 알림 1건 = 1행. 프론트(알림 페이지)가 본인 행을 읽어 피드에 표시하고,
--   '모두 읽음' 시 is_read를 업데이트한다. (생성 로직은 추후 같은 테이블에 insert)
-- type: deadline(마감 임박) / newjob(신규 공석) / news(추천 뉴스) / event(행사·프로그램)

create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (
    type = any (array['deadline'::text, 'newjob'::text, 'news'::text, 'event'::text])
  ),
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now(),

  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey
    foreign key (user_id) references public.users (id) on delete cascade
);

-- 유저별 최신순 + 안 읽은 것 조회 최적화
create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id) where is_read = false;

-- RLS: 본인 행만 읽고/쓰고/수정/삭제
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
  on public.notifications for insert
  with check (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);
