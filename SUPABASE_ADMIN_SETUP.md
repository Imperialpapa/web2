# Supabase 관리자 설정 테이블 생성

GitHub 토큰을 Supabase에 안전하게 저장하기 위한 테이블을 생성합니다.

## 1. Supabase SQL Editor에서 다음 쿼리 실행

```sql
-- 관리자 설정 테이블 생성
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (anon key로 접근 가능)
CREATE POLICY "Anyone can read admin settings"
ON admin_settings
FOR SELECT
USING (true);

-- 모든 사용자가 쓰기 가능 (anon key로 접근 가능)
-- 주의: 실제 프로덕션 환경에서는 인증된 사용자만 쓰기 가능하도록 변경해야 합니다
CREATE POLICY "Anyone can insert/update admin settings"
ON admin_settings
FOR ALL
USING (true)
WITH CHECK (true);
```

## 2. 보안 권장사항

### 현재 설정 (테스트용)
- 모든 사용자가 읽기/쓰기 가능
- 간단한 비밀번호 인증만 사용

### 프로덕션 환경 권장사항
1. **Supabase Auth 사용**: 실제 사용자 인증 시스템 구현
2. **RLS 정책 강화**: 인증된 관리자만 접근 가능하도록 변경
   ```sql
   -- 인증된 사용자만 쓰기 가능
   DROP POLICY IF EXISTS "Anyone can insert/update admin settings" ON admin_settings;

   CREATE POLICY "Only authenticated users can insert/update admin settings"
   ON admin_settings
   FOR ALL
   USING (auth.role() = 'authenticated')
   WITH CHECK (auth.role() = 'authenticated');
   ```

3. **토큰 암호화**: 서버 사이드에서 토큰 암호화 저장

## 3. 테이블 구조

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| key | TEXT | 설정 키 (예: 'github_token') |
| value | TEXT | 설정 값 (암호화 권장) |
| updated_at | TIMESTAMP | 마지막 업데이트 시간 |

## 4. 사용 방법

1. Supabase Console → SQL Editor로 이동
2. 위의 SQL 쿼리 복사 & 실행
3. 웹사이트에서 관리자 모드 진입
4. "GitHub 토큰 설정" 버튼 클릭
5. 토큰 입력 → Supabase에 자동 저장

## 5. 확인 방법

Supabase Console → Table Editor → admin_settings 테이블에서 저장된 데이터 확인 가능
