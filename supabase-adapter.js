// Supabase 백엔드 어댑터
class SupabaseAdapter {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.subscriptions = {
            visitorCount: null,
            notices: null,
            guestPosts: null
        };
    }

    async init() {
        if (!checkSupabase()) {
            console.warn('Supabase가 초기화되지 않았습니다.');
            return false;
        }

        this.client = getSupabase();
        this.isInitialized = true;
        return true;
    }

    // 방문자 카운터 증가
    async incrementVisitorCount() {
        try {
            // Supabase RPC 함수 호출 (increment_visitor_count 함수 필요)
            const { data, error } = await this.client.rpc('increment_visitor_count');

            if (error) {
                // RPC 함수가 없으면 직접 업데이트
                console.warn('RPC 함수가 없습니다. 직접 업데이트를 시도합니다.');

                // 현재 카운트 가져오기
                const { data: currentData } = await this.client
                    .from('visitor_counter')
                    .select('count')
                    .single();

                const currentCount = currentData?.count || 0;
                const newCount = currentCount + 1;

                // 업데이트
                await this.client
                    .from('visitor_counter')
                    .upsert({ id: 1, count: newCount });

                return newCount;
            }

            return data;
        } catch (error) {
            console.error('방문자 카운터 증가 실패:', error);
            throw error;
        }
    }

    // 방문자 카운터 실시간 구독
    subscribeVisitorCount(callback) {
        // 실시간 구독 설정
        const channel = this.client
            .channel('visitor_counter_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'visitor_counter'
            }, (payload) => {
                callback(payload.new.count || 0);
            })
            .subscribe();

        this.subscriptions.visitorCount = channel;

        // 초기 데이터 로드
        this.client
            .from('visitor_counter')
            .select('count')
            .single()
            .then(({ data }) => {
                if (data) callback(data.count);
            });

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.visitorCount) {
                this.client.removeChannel(this.subscriptions.visitorCount);
                this.subscriptions.visitorCount = null;
            }
        };
    }

    // 공지사항 목록 가져오기
    async getNotices() {
        try {
            const { data, error } = await this.client
                .from('notices')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            throw error;
        }
    }

    // 공지사항 실시간 구독
    subscribeNotices(callback) {
        const channel = this.client
            .channel('notices_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notices'
            }, async () => {
                // 변경 발생 시 전체 목록 다시 로드
                const notices = await this.getNotices();
                callback(notices);
            })
            .subscribe();

        this.subscriptions.notices = channel;

        // 초기 데이터 로드
        this.getNotices().then(callback);

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.notices) {
                this.client.removeChannel(this.subscriptions.notices);
                this.subscriptions.notices = null;
            }
        };
    }

    // 공지사항 추가
    async addNotice(notice) {
        try {
            console.log('🔵 [Supabase] addNotice 호출됨');
            console.log('🔵 [Supabase] 저장할 데이터:', notice);
            console.log('🔵 [Supabase] 대상 테이블: notices');

            const { data, error } = await this.client
                .from('notices')
                .insert([notice])
                .select();

            if (error) {
                console.error('🔴 [Supabase] notices 테이블 저장 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] notices 테이블에 저장 성공:', data);
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] 공지사항 추가 실패:', error);
            throw error;
        }
    }

    // 공지사항 수정
    async updateNotice(noticeId, updates) {
        try {
            console.log('🔵 [Supabase] updateNotice 호출됨');
            console.log('🔵 [Supabase] 수정할 ID:', noticeId);
            console.log('🔵 [Supabase] 수정할 데이터:', updates);

            const { data, error } = await this.client
                .from('notices')
                .update(updates)
                .eq('id', noticeId)
                .select();

            if (error) {
                console.error('🔴 [Supabase] 공지사항 수정 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] 공지사항 수정 성공:', data);
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] 공지사항 수정 실패:', error);
            throw error;
        }
    }

    // 공지사항 삭제
    async deleteNotice(noticeId) {
        try {
            console.log('🔵 [Supabase] deleteNotice 호출됨, ID:', noticeId);

            const { error } = await this.client
                .from('notices')
                .delete()
                .eq('id', noticeId);

            if (error) {
                console.error('🔴 [Supabase] 공지사항 삭제 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] 공지사항 삭제 성공');
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] 공지사항 삭제 실패:', error);
            throw error;
        }
    }

    // 방문자 글 목록 가져오기
    async getGuestPosts() {
        try {
            const { data, error } = await this.client
                .from('guest_posts')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('방문자 글 로드 실패:', error);
            throw error;
        }
    }

    // 방문자 글 실시간 구독
    subscribeGuestPosts(callback) {
        const channel = this.client
            .channel('guest_posts_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'guest_posts'
            }, async () => {
                // 변경 발생 시 전체 목록 다시 로드
                const posts = await this.getGuestPosts();
                callback(posts);
            })
            .subscribe();

        this.subscriptions.guestPosts = channel;

        // 초기 데이터 로드
        this.getGuestPosts().then(callback);

        // 구독 해제 함수 반환
        return () => {
            if (this.subscriptions.guestPosts) {
                this.client.removeChannel(this.subscriptions.guestPosts);
                this.subscriptions.guestPosts = null;
            }
        };
    }

    // 방문자 글 추가
    async addGuestPost(post) {
        try {
            console.log('🟢 [Supabase] addGuestPost 호출됨');
            console.log('🟢 [Supabase] 저장할 데이터:', post);
            console.log('🟢 [Supabase] 대상 테이블: guest_posts');

            const { data, error } = await this.client
                .from('guest_posts')
                .insert([post])
                .select();

            if (error) {
                console.error('🔴 [Supabase] guest_posts 테이블 저장 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] guest_posts 테이블에 저장 성공:', data);
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] 방문자 글 추가 실패:', error);
            throw error;
        }
    }

    // 방문자 글 삭제
    async deleteGuestPost(postId) {
        try {
            console.log('🟢 [Supabase] deleteGuestPost 호출됨, ID:', postId);

            const { error } = await this.client
                .from('guest_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error('🔴 [Supabase] 방문자 글 삭제 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] 방명록 글 삭제 성공');
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] 방명록 글 삭제 실패:', error);
            throw error;
        }
    }

    // GitHub 토큰 저장
    async saveGitHubToken(token) {
        try {
            console.log('🔑 [Supabase] GitHub 토큰 저장');

            const { data, error } = await this.client
                .from('admin_settings')
                .upsert({
                    key: 'github_token',
                    value: token,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('🔴 [Supabase] GitHub 토큰 저장 실패:', error);
                throw error;
            }

            console.log('✅ [Supabase] GitHub 토큰 저장 성공');
            return true;
        } catch (error) {
            console.error('🔴 [Supabase] GitHub 토큰 저장 실패:', error);
            throw error;
        }
    }

    // GitHub 토큰 로드
    async loadGitHubToken() {
        try {
            console.log('🔑 [Supabase] GitHub 토큰 로드');

            const { data, error } = await this.client
                .from('admin_settings')
                .select('value')
                .eq('key', 'github_token')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // 데이터가 없음 (정상)
                    console.log('ℹ️ [Supabase] GitHub 토큰 없음');
                    return null;
                }
                throw error;
            }

            console.log('✅ [Supabase] GitHub 토큰 로드 성공');
            return data?.value || null;
        } catch (error) {
            console.error('🔴 [Supabase] GitHub 토큰 로드 실패:', error);
            throw error;
        }
    }
}
