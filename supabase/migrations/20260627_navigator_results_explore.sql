-- 나침반 결과 상세(마이페이지에서 결과 페이지처럼 펼쳐보기)를 위해
-- '더 둘러볼 기구(explore)' 묶음을 결과 행에 함께 저장한다.
-- (recommendations는 이미 저장 중. explore만 추가.)

alter table public.navigator_results
  add column if not exists explore jsonb not null default '[]'::jsonb;
