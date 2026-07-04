-- (선택) 데모용 알림 시드 — 모든 기존 유저에게 샘플 알림 3건씩 넣는다.
-- 피드가 실제로 뜨는지 확인할 때만 실행. 실제 생성 로직이 붙으면 불필요.
-- 재실행 시 중복 생성되므로 한 번만 실행하세요.

insert into public.notifications (user_id, type, title, body, link_url)
select u.id, x.type, x.title, x.body, x.link_url
from public.users u
cross join (
  values
    ('newjob',  'UNDP 서울정책센터 인턴 공고가 새로 등록되었어요.', null::text, '/jobs'),
    ('deadline','WFP 영양 프로그램 담당관 공고가 3일 후 마감돼요.', null::text, '/jobs'),
    ('news',    '관심 키워드 「기후·SDG」 관련 새 인사이트 3건이 도착했어요.', null::text, '/insight')
) as x(type, title, body, link_url);
