// JSON에서 콘텐츠 로드하는 함수
async function loadContent() {
    try {
        const response = await fetch('content.json');
        const content = await response.json();
        applyContent(content);
    } catch (error) {
        console.warn('content.json 로드 실패, 기본 콘텐츠 사용:', error);
    }
}

// 콘텐츠를 페이지에 적용하는 함수
function applyContent(content) {
    // Hero 섹션
    if (content.hero) {
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.hero-description');
        const heroPrimaryBtn = document.querySelector('.hero-buttons .btn-primary');
        const heroSecondaryBtn = document.querySelector('.hero-buttons .btn-secondary');

        if (heroTitle) heroTitle.innerHTML = content.hero.title;
        if (heroDesc) heroDesc.innerHTML = content.hero.description; // HTML 링크 지원을 위해 innerHTML 사용
        if (heroPrimaryBtn) heroPrimaryBtn.textContent = content.hero.primaryButton;
        if (heroSecondaryBtn) heroSecondaryBtn.textContent = content.hero.secondaryButton;
    }

    // About 섹션
    if (content.about) {
        const aboutTitle = document.querySelector('#about .section-title');
        const aboutSubtitle = document.querySelector('#about .section-subtitle');
        const aboutHeading = document.querySelector('.about-text h3');
        const aboutDesc = document.querySelector('.about-text > p');

        if (aboutTitle) aboutTitle.textContent = content.about.title;
        if (aboutSubtitle) aboutSubtitle.textContent = content.about.subtitle;
        if (aboutHeading) aboutHeading.textContent = content.about.heading;
        if (aboutDesc) aboutDesc.textContent = content.about.description;

        // 통계 업데이트
        if (content.about.stats) {
            const statItems = document.querySelectorAll('.stat-item');
            content.about.stats.forEach((stat, index) => {
                if (statItems[index]) {
                    const number = statItems[index].querySelector('.stat-number');
                    const label = statItems[index].querySelector('.stat-label');
                    if (number) number.textContent = stat.number;
                    if (label) label.textContent = stat.label;
                }
            });
        }
    }

    // Projects 섹션
    if (content.projects) {
        const projectsTitle = document.querySelector('#projects .section-title');
        const projectsSubtitle = document.querySelector('#projects .section-subtitle');

        if (projectsTitle) projectsTitle.textContent = content.projects.title;
        if (projectsSubtitle) projectsSubtitle.textContent = content.projects.subtitle;

        // 프로젝트 카드 업데이트
        if (content.projects.items) {
            const projectCards = document.querySelectorAll('.project-card');
            content.projects.items.forEach((project, index) => {
                if (projectCards[index]) {
                    const card = projectCards[index];
                    const icon = card.querySelector('.project-image i');
                    const title = card.querySelector('.project-title');
                    const desc = card.querySelector('.project-description');
                    const techTags = card.querySelectorAll('.tech-tag');
                    const demoLink = card.querySelector('.project-links a:first-child');
                    const codeLink = card.querySelector('.project-links a:last-child');

                    if (icon) icon.className = `fas ${project.icon}`;
                    if (title) title.textContent = project.title;
                    if (desc) desc.textContent = project.description;

                    // 기술 스택 업데이트
                    if (project.techStack) {
                        project.techStack.forEach((tech, i) => {
                            if (techTags[i]) techTags[i].textContent = tech;
                        });
                    }

                    if (demoLink) demoLink.setAttribute('href', project.demoLink);
                    if (codeLink) codeLink.setAttribute('href', project.codeLink);
                }
            });
        }
    }

    // Skills 섹션
    if (content.skills) {
        const skillsTitle = document.querySelector('#skills .section-title');
        const skillsSubtitle = document.querySelector('#skills .section-subtitle');

        if (skillsTitle) skillsTitle.textContent = content.skills.title;
        if (skillsSubtitle) skillsSubtitle.textContent = content.skills.subtitle;

        // 스킬 카테고리 업데이트
        if (content.skills.categories) {
            const categories = document.querySelectorAll('.skills-category');
            content.skills.categories.forEach((category, index) => {
                if (categories[index]) {
                    const categoryTitle = categories[index].querySelector('.category-title');
                    if (categoryTitle) categoryTitle.textContent = category.title;

                    // 각 스킬 아이템 업데이트
                    const skillItems = categories[index].querySelectorAll('.skill-item');
                    category.items.forEach((skill, i) => {
                        if (skillItems[i]) {
                            const icon = skillItems[i].querySelector('.skill-icon i');
                            const name = skillItems[i].querySelector('.skill-name');
                            const progress = skillItems[i].querySelector('.skill-progress');

                            if (icon) icon.className = skill.icon;
                            if (name) name.textContent = skill.name;
                            if (progress) progress.setAttribute('data-width', skill.level);
                        }
                    });
                }
            });
        }
    }

    // Contact 섹션
    if (content.contact) {
        const contactTitle = document.querySelector('#contact .section-title');
        const contactSubtitle = document.querySelector('#contact .section-subtitle');

        if (contactTitle) contactTitle.textContent = content.contact.title;
        if (contactSubtitle) contactSubtitle.textContent = content.contact.subtitle;

        // 연락처 정보 업데이트
        if (content.contact.info) {
            const contactDetails = document.querySelectorAll('.contact-details p');
            if (contactDetails[0]) contactDetails[0].textContent = content.contact.info.email;
            if (contactDetails[1]) contactDetails[1].textContent = content.contact.info.phone;
            if (contactDetails[2]) contactDetails[2].textContent = content.contact.info.location;
        }
    }

    // Footer
    if (content.footer) {
        const footerText = document.querySelector('.footer-text p');
        if (footerText) footerText.innerHTML = content.footer.copyright;
    }
}

// 관리자 모드에서 사용할 수 있도록 전역 함수로 노출
window.loadContentFromData = applyContent;

// 페이지 로드 시 JSON 콘텐츠 먼저 로드
loadContent();

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 캐싱 (성능 최적화)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const contactForm = document.querySelector('.contact-form');
    const skillBars = document.querySelectorAll('.skill-progress');

    // 탭 전환 함수
    function switchTab(tabName) {
        // 모든 탭 비활성화
        navTabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 선택한 탭 활성화
        const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);

        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');

            // 선택한 탭 컨텐츠를 맨 위로 스크롤
            selectedContent.scrollTop = 0;

            // 스킬 섹션이면 스킬 바 애니메이션 시작
            if (tabName === 'skills') {
                setTimeout(animateSkillBars, 300);
            }
        }
    }

    // 탭 클릭 이벤트
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);

            // 모바일 메뉴 닫기
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // 홈의 "프로젝트 보기" 버튼 - 프로젝트 탭으로 이동
    const projectViewBtn = document.querySelector('.hero-buttons .btn-primary');
    if (projectViewBtn) {
        projectViewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab('projects');
        });
    }

    // 홈의 "연락하기" 버튼 - 연락처 탭으로 이동
    const contactBtn = document.querySelector('.hero-buttons .btn-secondary');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab('contact');
        });
    }

    // 모바일 메뉴 토글
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // 탭 방식이므로 스크롤 네비게이션 비활성화

    // 스킬 바 애니메이션 (캐시된 요소 사용)
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            if (targetWidth) {
                bar.style.width = targetWidth + '%';
            }
        });
    }

    // 탭 방식으로 변경되어 IntersectionObserver 불필요

    // 탭 방식이므로 부드러운 스크롤 비활성화

    // 초기 애니메이션은 CSS로 처리

    // 폼 제출 처리
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                showNotification('모든 필드를 입력해주세요.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }

            showNotification('메시지가 성공적으로 전송되었습니다!', 'success');
            contactForm.reset();
        });
    }

    // 이메일 유효성 검사
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // 알림 타임아웃 ID 저장 (메모리 누수 방지)
    let notificationTimeoutId = null;

    // 알림 메시지 표시
    function showNotification(message, type = 'success') {
        // 기존 타임아웃 취소
        if (notificationTimeoutId) {
            clearTimeout(notificationTimeoutId);
        }

        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : '#EF4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // 애니메이션으로 표시
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // 닫기 버튼 이벤트
        notification.querySelector('.notification-close').addEventListener('click', () => {
            hideNotification(notification);
        });

        // 5초 후 자동으로 숨기기
        notificationTimeoutId = setTimeout(() => {
            hideNotification(notification);
        }, 5000);
    }

    // 알림 숨기기
    function hideNotification(notification) {
        if (!notification) return;
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    // 탭 방식으로 변경되어 스크롤 이벤트 불필요

    // 로딩 스피너 처리 (있는 경우)
    window.addEventListener('load', function() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.remove(), 300);
        }
    });

    // 탭 방식이므로 스크롤 이벤트 비활성화
});
