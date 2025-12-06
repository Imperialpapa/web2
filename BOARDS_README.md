# 게시판 시스템 README

공지사항 게시판, 방명록, 방문자 카운터가 추가된 포트폴리오 웹사이트입니다.

## 🎯 주요 기능

### 1. 방문자 카운터 👥
- 페이지 방문 시 자동으로 카운트 증가
- 실시간 동기화
- 네비게이션 바에 표시

### 2. 공지사항 게시판 📢
- 관리자가 공지사항 작성
- 제목, 내용, 날짜 표시
- "관리자" 배지 표시
- 실시간 업데이트

### 3. 방명록 ✍️
- 방문자가 메시지 남기기
- 이름 입력 (선택사항, 기본값: 익명)
- 최대 500자 제한
- 최신 50개 게시글 표시
- 실시간 업데이트

## 🔧 백엔드 옵션

이 시스템은 **세 가지** 백엔드를 지원합니다:

### 옵션 1: Firebase (NoSQL)
- **장점**: 설정 간단, 실시간 성능 우수
- **단점**: NoSQL 구조, 복잡한 쿼리 어려움
- **설정 가이드**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### 옵션 2: Supabase (PostgreSQL)
- **장점**: SQL 사용, 강력한 쿼리, 오픈소스
- **단점**: 설정이 약간 복잡
- **설정 가이드**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 옵션 3: 데모 모드 (localStorage)
- **장점**: 설정 불필요, 즉시 테스트 가능
- **단점**: 데이터가 각 브라우저에만 저장됨 (공유 안 됨)
- **사용법**: `backend-config.js`에서 `demoMode: true` 설정

## 📦 설치 및 설정

### 1. 백엔드 선택

`backend-config.js` 파일을 열고 사용할 백엔드를 선택하세요:

```javascript
const BACKEND_CONFIG = {
    // 'firebase', 'supabase' 중 선택
    provider: 'firebase',

    // 데모 모드 (백엔드 없이 로컬 테스트)
    demoMode: false
};
```

### 2. 백엔드 설정

선택한 백엔드에 따라 설정 파일을 수정하세요:

#### Firebase 사용 시
1. [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) 가이드 참조
2. `firebase-config.js` 파일 수정

#### Supabase 사용 시
1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 가이드 참조
2. `supabase-config.js` 파일 수정

#### 데모 모드 사용 시
- 추가 설정 불필요
- 바로 웹사이트 열기

### 3. 웹사이트 실행

로컬에서 테스트:

```bash
# Python이 설치되어 있는 경우
python -m http.server 8000

# 또는 Node.js가 설치되어 있는 경우
npx serve

# 또는 VS Code의 Live Server 확장 사용
```

브라우저에서 `http://localhost:8000` 접속

## 🎨 파일 구조

```
web/
├── index.html                 # 메인 HTML (게시판 섹션 포함)
├── styles.css                 # 스타일시트 (게시판 스타일 포함)
├── script.js                  # 기본 스크립트
├── admin.js                   # 관리자 모드 (공지사항 추가 기능)
│
├── backend-config.js          # 백엔드 선택 설정
│
├── firebase-config.js         # Firebase 설정
├── firebase-adapter.js        # Firebase 어댑터
│
├── supabase-config.js         # Supabase 설정
├── supabase-adapter.js        # Supabase 어댑터
│
├── board.js                   # 게시판 메인 로직
│
├── FIREBASE_SETUP.md          # Firebase 설정 가이드
├── SUPABASE_SETUP.md          # Supabase 설정 가이드
└── BOARDS_README.md           # 이 파일
```

## 🔐 관리자 모드

### 관리자 로그인
1. 화면 우측 하단의 🔒 아이콘 클릭
2. 비밀번호 입력: `admin12` (admin.js:5에서 변경 가능)
3. 관리자 패널이 열림

### 공지사항 추가
1. 관리자 모드 활성화
2. "공지사항 추가" 버튼 클릭
3. 제목과 내용 입력
4. 자동으로 게시판에 표시됨

## 🏗️ 아키텍처

이 시스템은 **어댑터 패턴**을 사용하여 설계되었습니다:

```
BoardManager
    ↓
Backend Adapter Interface
    ↙         ↘
Firebase   Supabase
Adapter     Adapter
```

### 장점
- ✅ 백엔드 쉽게 전환 가능
- ✅ 새로운 백엔드 추가 간편
- ✅ 코드 재사용성 높음
- ✅ 테스트 용이

### BoardManager (board.js)
게시판의 핵심 로직을 담당:
- 방문자 카운터 관리
- 공지사항 렌더링
- 방명록 렌더링
- 실시간 업데이트 구독

### 어댑터 (firebase-adapter.js, supabase-adapter.js)
각 백엔드의 API를 공통 인터페이스로 래핑:
- `incrementVisitorCount()`: 방문자 수 증가
- `subscribeVisitorCount(callback)`: 실시간 구독
- `getNotices()`: 공지사항 가져오기
- `addNotice(notice)`: 공지사항 추가
- `getGuestPosts()`: 방명록 글 가져오기
- `addGuestPost(post)`: 방명록 글 추가

## 🛡️ 보안

### XSS 방지
- 사용자 입력은 모두 `escapeHtml()` 함수로 필터링
- `textContent` 사용으로 HTML 삽입 방지

### 입력 검증
- 방명록 글 최대 500자 제한
- 빈 내용 전송 방지

### Firebase 보안 규칙
```json
{
  "rules": {
    "notices": {
      ".read": true,
      ".write": true
    },
    "guestPosts": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Supabase RLS 정책
```sql
-- 모두 읽기 가능
CREATE POLICY "Anyone can read" ON guest_posts
    FOR SELECT USING (true);

-- 모두 쓰기 가능 (내용 길이 체크)
CREATE POLICY "Anyone can insert" ON guest_posts
    FOR INSERT WITH CHECK (length(content) <= 500);
```

## 🎯 사용 예시

### 방문자 게시판에 글 작성

```javascript
// 직접 호출 (개발자 도구 콘솔에서)
await boardManager.submitGuestPost('홍길동', '멋진 사이트네요!');
```

### 공지사항 추가 (관리자 전용)

```javascript
// 관리자 모드에서
await boardManager.addNotice('환영합니다', '새로운 포트폴리오 사이트입니다.');
```

## 🔄 백엔드 전환하기

### Firebase → Supabase로 전환

1. Supabase 프로젝트 생성 및 테이블 설정
2. `supabase-config.js` 파일 수정
3. `backend-config.js`에서 provider 변경:
   ```javascript
   provider: 'supabase'
   ```
4. 페이지 새로고침

### 데이터 마이그레이션

Firebase에서 Supabase로 데이터 이동:

```javascript
// Firebase에서 데이터 내보내기
const notices = await firebaseAdapter.getNotices();
const posts = await firebaseAdapter.getGuestPosts();

// Supabase로 데이터 가져오기
for (const notice of notices) {
    await supabaseAdapter.addNotice(notice);
}
for (const post of posts) {
    await supabaseAdapter.addGuestPost(post);
}
```

## 🐛 문제 해결

### 방문자 카운터가 표시되지 않음
1. 브라우저 콘솔(F12) 열기
2. 오류 메시지 확인
3. `backend-config.js` 설정 확인
4. 백엔드 설정 파일 확인

### "초기화 실패" 메시지
- Firebase/Supabase 설정 정보가 올바른지 확인
- API 키와 URL 재확인
- 데모 모드로 전환하여 테스트: `demoMode: true`

### 데이터가 저장되지 않음
- 백엔드 서비스 상태 확인
- 보안 규칙/RLS 정책 확인
- 네트워크 연결 확인

### 실시간 업데이트 안 됨
- Firebase: Realtime Database 규칙 확인
- Supabase: Realtime 옵션 활성화 확인
- 페이지 새로고침

## 📝 커스터마이징

### 디자인 변경
`styles.css`의 게시판 관련 섹션 수정:
- `.notices` (라인 1569-1647)
- `.guestbook` (라인 1649-1758)
- `.visitor-counter` (라인 1540-1566)

### 기능 추가

새로운 기능 추가 예시 (댓글 기능):

1. 어댑터에 메서드 추가:
```javascript
// firebase-adapter.js
async addComment(postId, comment) {
    await this.db.ref(`comments/${postId}`).push(comment);
}
```

2. BoardManager에 메서드 추가:
```javascript
// board.js
async addComment(postId, author, content) {
    const comment = { author, content, timestamp: Date.now() };
    await this.backend.addComment(postId, comment);
}
```

## 🚀 배포

### GitHub Pages로 배포
1. GitHub 저장소에 푸시
2. Settings → Pages
3. Source를 `main` 브랜치로 설정
4. 저장 → 배포 완료

### Vercel/Netlify로 배포
1. 저장소 연결
2. 빌드 설정 없음 (정적 사이트)
3. 배포 → 완료

## 📚 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [어댑터 패턴](https://refactoring.guru/design-patterns/adapter)

## 💡 팁

1. **개발 시**: 데모 모드 사용하여 빠르게 테스트
2. **프로덕션**: Firebase 또는 Supabase 사용
3. **백업**: 정기적으로 데이터 백업
4. **모니터링**: 백엔드 대시보드에서 사용량 확인

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
