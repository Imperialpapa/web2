// Supabase 설정
// Supabase Console (https://supabase.com/)에서 프로젝트를 생성하고
// 여기에 실제 설정 값을 입력하세요

const supabaseConfig = {
    url: "https://uaddtyybgxrbudkosuvr.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZGR0eXliZ3hyYnVka29zdXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNzksImV4cCI6MjA3OTk3OTE3OX0.gJp10ne93dfYvh7a37qZoOiDqTgEuYrFcZIo99aF71E"
};

// Supabase 클라이언트
let supabaseClient = null;
let isSupabaseInitialized = false;

function initializeSupabase() {
    try {
        // Supabase가 로드되었는지 확인
        if (typeof supabase === 'undefined') {
            console.warn('Supabase SDK가 로드되지 않았습니다.');
            return false;
        }

        // Supabase 설정이 유효한지 확인
        if (supabaseConfig.url === "YOUR_SUPABASE_URL") {
            console.warn('Supabase 설정이 필요합니다. supabase-config.js 파일을 확인하세요.');
            return false;
        }

        // Supabase 클라이언트 초기화
        supabaseClient = supabase.createClient(
            supabaseConfig.url,
            supabaseConfig.anonKey
        );

        isSupabaseInitialized = true;
        console.log('Supabase가 성공적으로 초기화되었습니다.');
        return true;
    } catch (error) {
        console.error('Supabase 초기화 실패:', error);
        return false;
    }
}

// Supabase가 초기화되었는지 확인하는 함수
function checkSupabase() {
    return isSupabaseInitialized && supabaseClient !== null;
}

// Supabase 클라이언트 가져오기
function getSupabase() {
    return supabaseClient;
}
