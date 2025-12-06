# Firebase 설정 가이드

이 가이드는 공지사항 게시판, 방명록, 방문자 카운터를 위한 Firebase 설정 방법을 안내합니다.

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. "프로젝트 추가" 버튼을 클릭합니다.
3. 프로젝트 이름을 입력합니다 (예: "my-portfolio").
4. Google Analytics는 선택사항입니다 (필요 없으면 비활성화 가능).
5. "프로젝트 만들기" 버튼을 클릭하고 완료될 때까지 기다립니다.

## 2. Firebase Realtime Database 설정

1. Firebase 콘솔에서 좌측 메뉴의 "빌드" > "Realtime Database"를 클릭합니다.
2. "데이터베이스 만들기" 버튼을 클릭합니다.
3. 데이터베이스 위치를 선택합니다 (아시아는 `asia-southeast1` 권장).
4. 보안 규칙 선택:
   - **테스트 모드로 시작**: 개발/테스트용 (30일 후 자동 만료)
   - **잠금 모드로 시작**: 프로덕션용 (나중에 규칙 수정 필요)
5. "사용 설정" 버튼을 클릭합니다.

## 3. 보안 규칙 설정 (중요!)

데이터베이스가 생성된 후, "규칙" 탭에서 아래 규칙을 적용하세요:

```json
{
  "rules": {
    "visitorCount": {
      ".read": true,
      ".write": true
    },
    "notices": {
      ".read": true,
      ".write": true,
      "$noticeId": {
        ".validate": "newData.hasChildren(['title', 'content', 'timestamp', 'isAdmin'])"
      }
    },
    "guestPosts": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp"],
      "$postId": {
        ".validate": "newData.hasChildren(['author', 'content', 'timestamp'])"
      }
    }
  }
}
```

**보안 강화 버전** (관리자만 공지사항 작성 가능):

```json
{
  "rules": {
    "visitorCount": {
      ".read": true,
      ".write": true
    },
    "notices": {
      ".read": true,
      ".write": "auth != null && auth.uid == 'YOUR_ADMIN_UID'",
      "$noticeId": {
        ".validate": "newData.hasChildren(['title', 'content', 'timestamp', 'isAdmin'])"
      }
    },
    "guestPosts": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp"],
      "$postId": {
        ".validate": "newData.hasChildren(['author', 'content', 'timestamp']) && newData.child('content').val().length <= 500"
      }
    }
  }
}
```

## 4. Firebase 설정 정보 가져오기

1. Firebase 콘솔 좌측 상단의 ⚙️ (톱니바퀴) 아이콘을 클릭합니다.
2. "프로젝트 설정"을 선택합니다.
3. 아래로 스크롤하여 "내 앱" 섹션을 찾습니다.
4. 웹 앱이 없다면, `</>` (웹) 아이콘을 클릭하여 앱을 추가합니다.
   - 앱 닉네임을 입력합니다 (예: "Portfolio Web").
   - "Firebase Hosting 설정" 체크박스는 선택사항입니다.
   - "앱 등록" 버튼을 클릭합니다.
5. Firebase SDK 구성 정보가 표시됩니다. 이 정보를 복사합니다.

## 5. firebase-config.js 파일 수정

프로젝트의 `firebase-config.js` 파일을 열고, Firebase 콘솔에서 복사한 설정 정보로 교체하세요:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};
```

**중요**: `databaseURL` 값이 제공되지 않았다면, Firebase 콘솔의 Realtime Database 페이지 상단에서 URL을 확인할 수 있습니다.

## 6. 테스트

1. 웹사이트를 열어 다음 기능들이 작동하는지 확인합니다:
   - ✅ 방문자 카운터가 증가하는지
   - ✅ 방명록에 글을 작성할 수 있는지
   - ✅ 작성한 글이 실시간으로 표시되는지
   - ✅ 관리자 모드에서 공지사항을 추가할 수 있는지

2. 브라우저 개발자 도구 콘솔(F12)을 열어 오류 메시지가 없는지 확인합니다.

## 7. Firebase Console에서 데이터 확인

Firebase 콘솔의 Realtime Database 탭에서 실시간으로 데이터가 저장되는 것을 확인할 수 있습니다:

```
your-database/
├── visitorCount: 123
├── notices/
│   └── -NXXxxxXXXxxx/
│       ├── title: "환영합니다!"
│       ├── content: "사이트를 방문해주셔서 감사합니다."
│       ├── timestamp: 1234567890123
│       └── isAdmin: true
└── guestPosts/
    └── -NXXxxxXXXxxx/
        ├── author: "방문자"
        ├── content: "좋은 사이트네요!"
        └── timestamp: 1234567890123
```

## 문제 해결

### Firebase가 초기화되지 않음
- 브라우저 콘솔에서 "Firebase SDK가 로드되지 않았습니다" 메시지 확인
- `index.html`에 Firebase SDK가 올바르게 포함되어 있는지 확인
- 인터넷 연결 확인

### "Permission denied" 오류
- Firebase Realtime Database 규칙이 올바르게 설정되어 있는지 확인
- 테스트 모드로 시작했다면 30일 만료 여부 확인

### 데이터가 저장되지 않음
- `firebase-config.js`의 `databaseURL`이 올바른지 확인
- Firebase 콘솔에서 Realtime Database가 활성화되어 있는지 확인

### 방문자 카운터가 표시되지 않음
- 브라우저 콘솔에서 JavaScript 오류 확인
- 페이지를 새로고침하여 재시도

## 비용

Firebase Realtime Database 무료 플랜(Spark):
- **저장 용량**: 1GB
- **동시 연결**: 100개
- **다운로드**: 10GB/월

일반적인 포트폴리오 웹사이트에는 무료 플랜으로 충분합니다.

## 추가 보안 설정 (선택사항)

스팸 방지를 위해 다음을 고려하세요:

1. **reCAPTCHA 추가**: 방명록 작성 시 봇 방지
2. **Rate Limiting**: Firebase Functions로 작성 빈도 제한
3. **욕설 필터**: 부적절한 내용 차단

## 도움말 링크

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Realtime Database 시작하기](https://firebase.google.com/docs/database/web/start)
- [보안 규칙 가이드](https://firebase.google.com/docs/database/security)
