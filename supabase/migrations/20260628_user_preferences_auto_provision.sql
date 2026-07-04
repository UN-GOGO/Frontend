-- 가입 시 user_preferences 행 자동 생성 + 이메일 채우기
-- 배경:
--   주간 발송(un-gogo/pipeline/weekly_digest.py)은 user_preferences.email로만 메일을 보낸다.
--   하지만 지금은 사용자가 알림 설정 페이지에서 한 번 "저장"해야만 행이 생겨서,
--   가입만 하고 설정을 안 건드린 유저는 발송 대상에서 빠진다.
-- 해결:
--   1) auth.users INSERT 트리거(handle_new_user)를 확장해 user_preferences 행도 생성.
--      이메일은 auth.users.email을 그대로 넣는다(기본 수신 ON / weekly).
--   2) 이미 가입했지만 user_preferences 행이 없는 기존 유저 백필.
-- 참고:
--   수정(이메일 변경)은 프론트 src/lib/notifications/preferences.ts의
--   saveNotificationPrefs upsert(onConflict: user_id)로 기존 행 값이 갱신되므로
--   추가 작업이 필요 없다.
--   handle_new_user 트리거 자체는 un-gogo 004_user_auto_provision.sql에서 정의됨.

BEGIN;

-- 0. upsert(onConflict: user_id) / 트리거의 on conflict (user_id) 가 동작하려면
--    user_id에 UNIQUE 제약이 필요하다. (원격 DB엔 이미 있지만 안전하게 보장)
ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- 1. 가입 트리거 함수 확장: public.users + public.user_preferences 동시 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 프로필 행 (기존 로직 유지)
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name'
    )
  )
  on conflict (id) do nothing;

  -- 알림 설정 행 (신규): 가입 이메일을 그대로 저장, 기본 수신 ON / weekly
  insert into public.user_preferences (user_id, email, enable_notifications, notification_frequency)
  values (new.id, new.email, true, 'weekly')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 트리거 재생성 (auth.users INSERT 시 실행)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. 기존 유저 백필: user_preferences 행이 없는 가입자에게 가입 이메일로 행 생성
insert into public.user_preferences (user_id, email, enable_notifications, notification_frequency)
select u.id, u.email, true, 'weekly'
from auth.users u
join public.users pu on pu.id = u.id          -- FK(user_id → users.id) 충족 보장
left join public.user_preferences up on up.user_id = u.id
where up.user_id is null
on conflict (user_id) do nothing;

COMMIT;
