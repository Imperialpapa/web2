// 관리자 모드 관리 클래스
class AdminMode {
    constructor() {
        this.isAdminMode = false;
        this.password = 'admin12'; // 관리자 비밀번호 (테스트용)
        this.contentData = null;

        // GitHub 설정
        this.githubOwner = 'Imperialpapa';
        this.githubRepo = 'web';
        this.githubToken = '';

        this.init();
    }

    async init() {
        // 관리자 모드 UI 생성
        this.createAdminUI();

        // 이벤트 리스너 등록
        this.attachEventListeners();

        // GitHub 토큰 로드 (Supabase에서)
        await this.loadGitHubToken();
    }

    createAdminUI() {
        // 관리자 모드 버튼 추가
        const adminButton = document.createElement('button');
        adminButton.id = 'admin-toggle';
        adminButton.className = 'admin-toggle-btn';
        adminButton.innerHTML = '<i class="fas fa-lock"></i>';
        adminButton.title = '관리자 모드';
        document.body.appendChild(adminButton);

        // 관리자 패널 추가
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-panel-content">
                <div class="admin-header">
                    <h3><i class="fas fa-shield-alt"></i> 관리자 모드</h3>
                    <button class="admin-close" id="admin-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="admin-body">
                    <p class="admin-status">편집 모드가 <span class="status-text">비활성화</span>되었습니다</p>

                    <!-- GitHub 토큰 상태 -->
                    <div class="github-status" id="github-status">
                        <p><i class="fab fa-github"></i> <span id="github-token-status">GitHub 토큰 미설정</span></p>
                    </div>

                    <div class="admin-actions">
                        <button class="admin-btn admin-btn-notice" id="add-notice">
                            <i class="fas fa-bullhorn"></i> 공지사항 추가
                        </button>
                        <button class="admin-btn" id="save-content">
                            <i class="fas fa-save"></i> 변경사항 저장
                        </button>
                        <button class="admin-btn admin-btn-github" id="deploy-github">
                            <i class="fab fa-github"></i> GitHub에 자동 배포
                        </button>
                        <button class="admin-btn" id="download-json">
                            <i class="fas fa-download"></i> JSON 다운로드
                        </button>
                        <button class="admin-btn" id="upload-json-trigger">
                            <i class="fas fa-upload"></i> JSON 업로드
                        </button>
                        <input type="file" id="upload-json" accept=".json" style="display: none;">
                        <button class="admin-btn admin-btn-secondary" id="setup-github-token">
                            <i class="fas fa-key"></i> GitHub 토큰 설정
                        </button>
                        <button class="admin-btn admin-btn-danger" id="reset-content">
                            <i class="fas fa-undo"></i> 초기화
                        </button>
                    </div>
                    <div class="admin-info">
                        <p><i class="fas fa-info-circle"></i> 편집 가능한 텍스트를 클릭하여 수정하세요</p>
                        <p><i class="fas fa-rocket"></i> 변경사항 저장 후 "GitHub에 자동 배포" 클릭!</p>
                        <p><i class="fas fa-lightbulb"></i> GitHub 토큰은 한 번만 설정하면 됩니다</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(adminPanel);
    }

    attachEventListeners() {
        // 관리자 모드 토글 버튼
        const adminToggle = document.getElementById('admin-toggle');
        adminToggle.addEventListener('click', () => this.requestPassword());

        // 패널 닫기 버튼
        const adminClose = document.getElementById('admin-close');
        adminClose.addEventListener('click', () => this.closeAdminPanel());

        // 저장 버튼
        const saveBtn = document.getElementById('save-content');
        saveBtn.addEventListener('click', () => this.saveContent());

        // GitHub 자동 배포 버튼
        const deployBtn = document.getElementById('deploy-github');
        deployBtn.addEventListener('click', () => this.deployToGitHub());

        // GitHub 토큰 설정 버튼
        const tokenBtn = document.getElementById('setup-github-token');
        tokenBtn.addEventListener('click', () => this.setupGitHubToken());

        // JSON 다운로드 버튼
        const downloadBtn = document.getElementById('download-json');
        downloadBtn.addEventListener('click', () => this.downloadJSON());

        // JSON 업로드 버튼
        const uploadTrigger = document.getElementById('upload-json-trigger');
        const uploadInput = document.getElementById('upload-json');
        uploadTrigger.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', (e) => this.uploadJSON(e));

        // 초기화 버튼
        const resetBtn = document.getElementById('reset-content');
        resetBtn.addEventListener('click', () => this.resetContent());

        // 공지사항 추가 버튼
        const addNoticeBtn = document.getElementById('add-notice');
        addNoticeBtn.addEventListener('click', () => this.addNotice());
    }

    requestPassword() {
        // 이미 관리자 모드가 활성화되어 있으면 비활성화
        if (this.isAdminMode) {
            this.disableAdminMode();
            return;
        }

        // 비밀번호 입력
        const userPassword = prompt('관리자 비밀번호를 입력하세요:');

        if (userPassword === this.password) {
            this.enableAdminMode();
        } else if (userPassword !== null) {
            alert('비밀번호가 올바르지 않습니다.');
        }
    }

    enableAdminMode() {
        this.isAdminMode = true;

        // 관리자 패널 표시
        const panel = document.getElementById('admin-panel');
        panel.classList.add('active');

        // 토글 버튼 아이콘 변경
        const toggleBtn = document.getElementById('admin-toggle');
        toggleBtn.innerHTML = '<i class="fas fa-unlock"></i>';
        toggleBtn.classList.add('active');

        // 상태 텍스트 업데이트
        const statusText = document.querySelector('.status-text');
        statusText.textContent = '활성화';
        statusText.style.color = '#4caf50';

        // GitHub 토큰 상태 업데이트
        this.updateGitHubTokenStatus();

        // 편집 가능한 요소들 활성화
        this.makeContentEditable();

        // 공지사항과 방명록 다시 렌더링 (관리자 버튼 표시)
        if (window.boardManager) {
            window.boardManager.renderNotices();
            window.boardManager.renderGuestPosts();
        }

        console.log('관리자 모드가 활성화되었습니다.');
    }

    disableAdminMode() {
        this.isAdminMode = false;

        // 관리자 패널 숨기기
        const panel = document.getElementById('admin-panel');
        panel.classList.remove('active');

        // 토글 버튼 아이콘 변경
        const toggleBtn = document.getElementById('admin-toggle');
        toggleBtn.innerHTML = '<i class="fas fa-lock"></i>';
        toggleBtn.classList.remove('active');

        // 상태 텍스트 업데이트
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = '비활성화';
            statusText.style.color = '#ff5722';
        }

        // 편집 불가능하게 변경
        this.makeContentNonEditable();

        // 공지사항과 방명록 다시 렌더링 (관리자 버튼 제거)
        if (window.boardManager) {
            window.boardManager.renderNotices();
            window.boardManager.renderGuestPosts();
        }

        console.log('관리자 모드가 비활성화되었습니다.');
    }

    closeAdminPanel() {
        // 패널을 닫을 때 관리자 모드도 함께 비활성화
        this.disableAdminMode();
    }

    makeContentEditable() {
        // Hero 섹션
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.hero-description');
        const heroPrimaryBtn = document.querySelector('.hero-buttons .btn-primary');
        const heroSecondaryBtn = document.querySelector('.hero-buttons .btn-secondary');

        this.setEditable(heroTitle);
        this.setEditable(heroDesc);
        this.setEditable(heroPrimaryBtn);
        this.setEditable(heroSecondaryBtn);

        // About 섹션
        const aboutTitle = document.querySelector('#about .section-title');
        const aboutSubtitle = document.querySelector('#about .section-subtitle');
        const aboutHeading = document.querySelector('.about-text h3');
        const aboutDesc = document.querySelector('.about-text > p');

        this.setEditable(aboutTitle);
        this.setEditable(aboutSubtitle);
        this.setEditable(aboutHeading);
        this.setEditable(aboutDesc);

        // About 통계
        const statNumbers = document.querySelectorAll('.stat-number');
        const statLabels = document.querySelectorAll('.stat-label');
        statNumbers.forEach(el => this.setEditable(el));
        statLabels.forEach(el => this.setEditable(el));

        // Projects 섹션
        const projectsTitle = document.querySelector('#projects .section-title');
        const projectsSubtitle = document.querySelector('#projects .section-subtitle');

        this.setEditable(projectsTitle);
        this.setEditable(projectsSubtitle);

        // 각 프로젝트 카드
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const title = card.querySelector('.project-title');
            const desc = card.querySelector('.project-description');
            const techTags = card.querySelectorAll('.tech-tag');

            this.setEditable(title);
            this.setEditable(desc);
            techTags.forEach(tag => this.setEditable(tag));
        });

        // Skills 섹션
        const skillsTitle = document.querySelector('#skills .section-title');
        const skillsSubtitle = document.querySelector('#skills .section-subtitle');

        this.setEditable(skillsTitle);
        this.setEditable(skillsSubtitle);

        // 각 스킬 카테고리
        const categoryTitles = document.querySelectorAll('.category-title');
        const skillNames = document.querySelectorAll('.skill-name');

        categoryTitles.forEach(el => this.setEditable(el));
        skillNames.forEach(el => this.setEditable(el));

        // Contact 섹션
        const contactTitle = document.querySelector('#contact .section-title');
        const contactSubtitle = document.querySelector('#contact .section-subtitle');

        this.setEditable(contactTitle);
        this.setEditable(contactSubtitle);

        // Contact 정보
        const contactDetails = document.querySelectorAll('.contact-details p');
        contactDetails.forEach(el => this.setEditable(el));

        // Footer
        const footerText = document.querySelector('.footer-text p');
        this.setEditable(footerText);
    }

    makeContentNonEditable() {
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.contentEditable = 'false';
            el.classList.remove('editable');
        });
    }

    setEditable(element) {
        if (element) {
            element.contentEditable = 'true';
            element.classList.add('editable');
        }
    }

    saveContent() {
        if (!this.isAdminMode) {
            alert('관리자 모드가 활성화되지 않았습니다.');
            return;
        }

        // 현재 페이지의 모든 편집된 내용을 수집
        const updatedContent = {
            hero: {
                title: document.querySelector('.hero-title').innerHTML,
                description: document.querySelector('.hero-description').innerHTML, // HTML 링크 지원
                primaryButton: document.querySelector('.hero-buttons .btn-primary').textContent,
                secondaryButton: document.querySelector('.hero-buttons .btn-secondary').textContent
            },
            about: {
                title: document.querySelector('#about .section-title').textContent,
                subtitle: document.querySelector('#about .section-subtitle').textContent,
                heading: document.querySelector('.about-text h3').textContent,
                description: document.querySelector('.about-text > p').textContent,
                stats: Array.from(document.querySelectorAll('.stat-item')).map(item => ({
                    number: item.querySelector('.stat-number').textContent,
                    label: item.querySelector('.stat-label').textContent
                }))
            },
            projects: {
                title: document.querySelector('#projects .section-title').textContent,
                subtitle: document.querySelector('#projects .section-subtitle').textContent,
                items: Array.from(document.querySelectorAll('.project-card')).map(card => ({
                    icon: card.querySelector('.project-image i').className.split(' ').pop(),
                    title: card.querySelector('.project-title').textContent,
                    description: card.querySelector('.project-description').textContent,
                    techStack: Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent),
                    demoLink: card.querySelector('.project-links a:first-child').getAttribute('href'),
                    codeLink: card.querySelector('.project-links a:last-child').getAttribute('href')
                }))
            },
            skills: {
                title: document.querySelector('#skills .section-title').textContent,
                subtitle: document.querySelector('#skills .section-subtitle').textContent,
                categories: Array.from(document.querySelectorAll('.skills-category')).map(category => ({
                    title: category.querySelector('.category-title').textContent,
                    items: Array.from(category.querySelectorAll('.skill-item')).map(item => ({
                        icon: item.querySelector('.skill-icon i').className,
                        name: item.querySelector('.skill-name').textContent,
                        level: parseInt(item.querySelector('.skill-progress').getAttribute('data-width'))
                    }))
                }))
            },
            contact: {
                title: document.querySelector('#contact .section-title').textContent,
                subtitle: document.querySelector('#contact .section-subtitle').textContent,
                info: {
                    email: document.querySelectorAll('.contact-details p')[0].textContent,
                    phone: document.querySelectorAll('.contact-details p')[1].textContent,
                    location: document.querySelectorAll('.contact-details p')[2].textContent
                }
            },
            footer: {
                copyright: document.querySelector('.footer-text p').innerHTML
            }
        };

        this.contentData = updatedContent;

        alert('변경사항이 저장되었습니다! 이제 JSON을 다운로드하세요.');
        console.log('저장된 콘텐츠:', updatedContent);
    }

    downloadJSON() {
        if (!this.contentData) {
            alert('먼저 변경사항을 저장해주세요.');
            return;
        }

        const dataStr = JSON.stringify(this.contentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'content.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('JSON 파일이 다운로드되었습니다!');
    }

    uploadJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);

                // content.json 파일로 페이지 업데이트
                if (window.loadContentFromData) {
                    window.loadContentFromData(content);
                    this.contentData = content;
                    alert('JSON 파일이 업로드되어 페이지에 적용되었습니다!');
                } else {
                    alert('페이지를 새로고침한 후 다시 시도해주세요.');
                }
            } catch (error) {
                alert('JSON 파일 형식이 올바르지 않습니다.');
                console.error('JSON 파싱 에러:', error);
            }
        };
        reader.readAsText(file);

        // 파일 입력 초기화
        event.target.value = '';
    }

    resetContent() {
        if (confirm('정말로 모든 변경사항을 초기화하시겠습니까?')) {
            location.reload();
        }
    }

    // GitHub 토큰 로드
    async loadGitHubToken() {
        try {
            if (window.boardManager && window.boardManager.backend) {
                const token = await window.boardManager.backend.loadGitHubToken();
                if (token) {
                    this.githubToken = token;
                    console.log('✅ GitHub 토큰 로드 완료');
                }
            }
        } catch (error) {
            console.error('GitHub 토큰 로드 실패:', error);
        }
    }

    // GitHub 토큰 상태 업데이트
    updateGitHubTokenStatus() {
        const statusElement = document.getElementById('github-token-status');
        if (this.githubToken) {
            statusElement.innerHTML = '<span style="color: #4caf50;">✓ GitHub 토큰 설정됨</span>';
        } else {
            statusElement.innerHTML = '<span style="color: #ff5722;">⚠ GitHub 토큰 미설정</span>';
        }
    }

    // GitHub 토큰 설정
    async setupGitHubToken() {
        const instructions = `GitHub Personal Access Token이 필요합니다.

토큰 생성 방법:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" 클릭
4. Note: "Portfolio Admin" 등 입력
5. repo 권한 체크
6. Generate token 클릭
7. 생성된 토큰 복사

아래에 토큰을 입력하세요:`;

        const token = prompt(instructions);

        if (token && token.trim()) {
            try {
                // Supabase에 저장
                if (window.boardManager && window.boardManager.backend) {
                    await window.boardManager.backend.saveGitHubToken(token.trim());
                    this.githubToken = token.trim();
                    this.updateGitHubTokenStatus();
                    alert('GitHub 토큰이 Supabase에 안전하게 저장되었습니다!\n이제 "GitHub에 자동 배포" 버튼을 사용할 수 있습니다.');
                } else {
                    alert('백엔드가 초기화되지 않았습니다. 페이지를 새로고침하세요.');
                }
            } catch (error) {
                console.error('토큰 저장 실패:', error);
                alert('토큰 저장에 실패했습니다. 콘솔을 확인하세요.');
            }
        } else if (token !== null) {
            alert('토큰이 입력되지 않았습니다.');
        }
    }

    // GitHub에 자동 배포
    async deployToGitHub() {
        // 토큰 확인
        if (!this.githubToken) {
            const setup = confirm('GitHub 토큰이 설정되지 않았습니다.\n토큰을 설정하시겠습니까?');
            if (setup) {
                this.setupGitHubToken();
            }
            return;
        }

        // 콘텐츠 저장 확인
        if (!this.contentData) {
            alert('먼저 "변경사항 저장" 버튼을 클릭하여 변경사항을 저장하세요.');
            return;
        }

        if (!confirm('변경사항을 GitHub에 배포하시겠습니까?\n배포 후 1-2분 내에 웹사이트에 반영됩니다.')) {
            return;
        }

        try {
            // 로딩 표시
            const deployBtn = document.getElementById('deploy-github');
            const originalText = deployBtn.innerHTML;
            deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 배포 중...';
            deployBtn.disabled = true;

            // 1단계: 현재 파일의 SHA 가져오기
            const fileUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/content.json`;

            const getResponse = await fetch(fileUrl, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!getResponse.ok) {
                throw new Error(`파일 정보 가져오기 실패: ${getResponse.status} ${getResponse.statusText}`);
            }

            const fileData = await getResponse.json();
            const currentSha = fileData.sha;

            // 2단계: 파일 업데이트
            const contentStr = JSON.stringify(this.contentData, null, 2);
            const contentBase64 = btoa(unescape(encodeURIComponent(contentStr)));

            const updateResponse = await fetch(fileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update content.json via admin panel\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)`,
                    content: contentBase64,
                    sha: currentSha,
                    branch: 'master'
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`파일 업데이트 실패: ${updateResponse.status} - ${errorData.message || updateResponse.statusText}`);
            }

            const result = await updateResponse.json();

            // 성공
            deployBtn.innerHTML = '<i class="fas fa-check"></i> 배포 완료!';
            setTimeout(() => {
                deployBtn.innerHTML = originalText;
                deployBtn.disabled = false;
            }, 3000);

            alert(`✅ GitHub에 성공적으로 배포되었습니다!\n\n커밋 SHA: ${result.commit.sha.substring(0, 7)}\n\n1-2분 후 웹사이트가 업데이트됩니다.\n웹사이트: https://${this.githubOwner.toLowerCase()}.github.io/${this.githubRepo}/`);

            console.log('배포 완료:', result);

        } catch (error) {
            console.error('배포 에러:', error);

            const deployBtn = document.getElementById('deploy-github');
            deployBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 배포 실패';
            deployBtn.disabled = false;

            setTimeout(() => {
                deployBtn.innerHTML = '<i class="fab fa-github"></i> GitHub에 자동 배포';
            }, 3000);

            let errorMessage = '배포 중 오류가 발생했습니다.\n\n';

            if (error.message.includes('401')) {
                errorMessage += '❌ 토큰이 유효하지 않습니다.\n"GitHub 토큰 설정"에서 새 토큰을 입력하세요.';
            } else if (error.message.includes('403')) {
                errorMessage += '❌ 권한이 없습니다.\n토큰에 "repo" 권한이 있는지 확인하세요.';
            } else if (error.message.includes('404')) {
                errorMessage += '❌ 파일 또는 저장소를 찾을 수 없습니다.\n저장소 정보를 확인하세요.';
            } else {
                errorMessage += `오류: ${error.message}`;
            }

            alert(errorMessage);
        }
    }

    // 공지사항 추가
    async addNotice() {
        console.log('🔔 [Admin] addNotice 호출됨');

        if (!this.isAdminMode) {
            alert('관리자 모드가 활성화되지 않았습니다.');
            return;
        }

        // 공지사항 제목 입력
        const title = prompt('공지사항 제목을 입력하세요:');
        if (!title || title.trim() === '') {
            console.log('🔔 [Admin] 제목 입력 취소됨');
            return;
        }

        // 공지사항 내용 입력
        const content = prompt('공지사항 내용을 입력하세요:');
        if (!content || content.trim() === '') {
            console.log('🔔 [Admin] 내용 입력 취소됨');
            return;
        }

        console.log('🔔 [Admin] 제목:', title);
        console.log('🔔 [Admin] 내용:', content);

        // boardManager가 초기화되었는지 확인
        if (typeof boardManager === 'undefined' || !boardManager) {
            console.error('🔴 [Admin] boardManager가 초기화되지 않음');
            alert('게시판 시스템이 초기화되지 않았습니다. 페이지를 새로고침하세요.');
            return;
        }

        console.log('🔔 [Admin] boardManager.addNotice() 호출 예정');

        try {
            const success = await boardManager.addNotice(title, content);
            if (success) {
                console.log('✅ [Admin] 공지사항 등록 성공');
                alert('공지사항이 성공적으로 등록되었습니다!');
            }
        } catch (error) {
            console.error('🔴 [Admin] 공지사항 추가 중 오류:', error);
            alert('공지사항 추가에 실패했습니다.');
        }
    }
}

// AdminMode 모듈 (즉시 실행 함수 패턴)
const AdminModule = (function() {
    let instance = null;

    // 초기화 함수
    function initialize() {
        if (!instance) {
            instance = new AdminMode();
            // init()은 생성자에서 자동 호출됨
        }
        return instance;
    }

    // 외부에서 접근 가능한 API
    return {
        getInstance: function() {
            return instance;
        },
        init: initialize
    };
})();

// 전역으로 노출 (하위 호환성)
window.adminMode = null;

// 페이지 로드 시 관리자 모드 초기화
window.addEventListener('DOMContentLoaded', () => {
    window.adminMode = AdminModule.init();
});
