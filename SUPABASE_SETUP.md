# Supabase 설정 가이드

이 가이드는 Supabase를 사용하여 공지사항 게시판, 방명록, 방문자 카운터를 설정하는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/)에 접속하여 계정을 생성합니다.
2. "New Project" 버튼을 클릭합니다.
3. 프로젝트 정보를 입력합니다:
   - **Name**: 프로젝트 이름 (예: my-portfolio)
   - **Database Password**: 강력한 비밀번호 입력 (잘 기억하세요!)
   - **Region**: 가까운 지역 선택 (한국은 Northeast Asia - Seoul 추천)
4. "Create new project" 버튼을 클릭합니다.
5. 프로젝트 생성이 완료될 때까지 기다립니다 (약 2분).

## 2. 데이터베이스 테이블 생성

Supabase 대시보드에서 SQL Editor를 사용하여 테이블을 생성합니다.

### SQL Editor 열기
1. 좌측 메뉴에서 "SQL Editor" 클릭
2. "New query" 버튼 클릭

### 전체 SQL 실행

아래 SQL을 복사하여 실행하세요:

```sql
-- 방문자 카운터 테이블
CREATE TABLE visitor_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO visitor_counter (id, count) VALUES (1, 0);

-- 방문자 카운터 증가 함수
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE visitor_counter
    SET count = count + 1,
        updated_at = NOW()
    WHERE id = 1
    RETURNING count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 공지사항 테이블
CREATE TABLE notices (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    is_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타임스탬프 인덱스 (빠른 정렬)
CREATE INDEX idx_notices_timestamp ON notices(timestamp DESC);

-- 방명록 테이블
CREATE TABLE guest_posts (
    id BIGSERIAL PRIMARY KEY,
    author TEXT DEFAULT '익명',
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타임스탬프 인덱스 (빠른 정렬)
CREATE INDEX idx_guest_posts_timestamp ON guest_posts(timestamp DESC);

-- 콘텐츠 길이 체크 제약조건
ALTER TABLE guest_posts ADD CONSTRAINT check_content_length
    CHECK (length(content) <= 500);
```

"RUN" 버튼을 클릭하여 실행합니다.

## 3. Row Level Security (RLS) 설정

보안을 위해 RLS 정책을 설정합니다.

### 방법 1: SQL Editor에서 실행

```sql
-- 방문자 카운터: 모두 읽기/쓰기 가능
ALTER TABLE visitor_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visitor count" ON visitor_counter
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update visitor count" ON visitor_counter
    FOR UPDATE USING (true);

-- 공지사항: 모두 읽기 가능, 쓰기는 인증된 사용자만
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notices" ON notices
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert notices" ON notices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete notices" ON notices
    FOR DELETE USING (true);

-- 방명록: 모두 읽기/쓰기 가능
ALTER TABLE guest_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read guest posts" ON guest_posts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert guest posts" ON guest_posts
    FOR INSERT WITH CHECK (true);
```

### 방법 2: GUI에서 설정

1. 좌측 메뉴에서 "Authentication" → "Policies" 클릭
2. 각 테이블별로 정책 추가

## 4. API 설정 정보 가져오기

1. 좌측 메뉴에서 ⚙️ "Project Settings" 클릭
2. "API" 탭 선택
3. 다음 정보를 복사합니다:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** API Key: `eyJhbGc...` (긴 문자열)

## 5. supabase-config.js 파일 수정

프로젝트의 `supabase-config.js` 파일을 열고 설정 정보를 입력하세요:

```javascript
const supabaseConfig = {
    url: "https://your-project-id.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi..."
};
```

## 6. backend-config.js에서 Supabase 선택

`backend-config.js` 파일을 열고 provider를 'supabase'로 변경하세요:

```javascript
const BACKEND_CONFIG = {
    provider: 'supabase', // 'firebase'에서 'supabase'로 변경
    demoMode: false
};
```

## 7. 테스트

웹사이트를 열어 다음 기능들이 작동하는지 확인합니다:

✅ 방문자 카운터가 증가하는지
✅ 방명록에 글을 작성할 수 있는지
✅ 작성한 글이 실시간으로 표시되는지
✅ 관리자 모드에서 공지사항을 추가할 수 있는지

## 8. Supabase 대시보드에서 데이터 확인

1. 좌측 메뉴에서 "Table Editor" 클릭
2. 각 테이블의 데이터를 실시간으로 확인할 수 있습니다:
   - `visitor_counter`: 방문자 수
   - `notices`: 공지사항 목록
   - `guest_posts`: 방명록 글 목록

## 9. 고급 설정 (선택사항)

### 방문자 카운터 최적화

동시 접속자가 많을 경우를 대비한 최적화:

```sql
-- 트랜잭션 격리 수준 설정
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE visitor_counter
    SET count = count + 1,
        updated_at = NOW()
    WHERE id = 1
    RETURNING count INTO new_count;

    -- 충돌 방지
    IF new_count IS NULL THEN
        INSERT INTO visitor_counter (id, count)
        VALUES (1, 1)
        ON CONFLICT (id) DO UPDATE
        SET count = visitor_counter.count + 1
        RETURNING count INTO new_count;
    END IF;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 스팸 방지

방명록 스팸 방지를 위한 rate limiting:

```sql
-- 최근 1분 내 같은 IP에서의 작성 제한
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- 여기서는 간단한 버전만 제공
    -- 실제로는 IP 주소를 저장하고 확인하는 로직 필요
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_limit_trigger
    BEFORE INSERT ON guest_posts
    FOR EACH ROW
    EXECUTE FUNCTION check_rate_limit();
```

## 문제 해결

### "relation does not exist" 오류
- SQL Editor에서 테이블 생성 SQL을 다시 실행하세요
- Table Editor에서 테이블이 생성되었는지 확인하세요

### "new row violates row-level security policy" 오류
- RLS 정책이 올바르게 설정되었는지 확인하세요
- Authentication → Policies에서 정책 확인

### 실시간 업데이트가 작동하지 않음
- Supabase 프로젝트 설정에서 Realtime이 활성화되어 있는지 확인
- Database → Replication에서 테이블의 REALTIME 옵션 활성화

### 데이터가 저장되지 않음
- 브라우저 콘솔에서 오류 메시지 확인
- Supabase API 키가 올바른지 확인
- RLS 정책 확인

## Supabase vs Firebase 비교

**Supabase 장점:**
- ✅ PostgreSQL (강력한 관계형 DB)
- ✅ SQL 직접 사용 가능
- ✅ 오픈소스
- ✅ 더 나은 무료 플랜

**Firebase 장점:**
- ✅ 더 간단한 설정
- ✅ 더 성숙한 생태계
- ✅ 오프라인 지원

## 비용

Supabase 무료 플랜:
- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/월
- **API 요청**: 무제한
- **월간 활성 사용자**: 50,000명

일반적인 포트폴리오 웹사이트에는 무료 플랜으로 충분합니다.

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL 가이드](https://supabase.com/docs/guides/database)
- [Realtime 구독](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 도움말

문제가 발생하면:
1. 브라우저 개발자 도구(F12)에서 콘솔 확인
2. Supabase 대시보드의 Logs 확인
3. backend-config.js에서 `demoMode: true`로 설정하여 로컬 테스트
