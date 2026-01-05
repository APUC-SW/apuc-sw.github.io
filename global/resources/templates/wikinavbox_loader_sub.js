document.addEventListener('DOMContentLoaded', async () => {
    const wikinavboxContainer = document.getElementById('wikinavbox-container');

    // URL 경로에서 현재 언어 코드를 파악합니다.
    const pathSegments = window.location.pathname.split('/').filter(s => s);
    const wikiIndex = pathSegments.indexOf('wiki');
    let currentLang = 'en';

    if (wikiIndex !== -1 && pathSegments.length > wikiIndex + 1) {
        const nextSegment = pathSegments[wikiIndex + 1];
        if (['ko', 'ja'].includes(nextSegment)) {
            currentLang = nextSegment;
        }
    }
    
    // 언어 코드에 따라 목차 HTML 파일 경로를 결정합니다.
    const navboxFilePath = (currentLang === 'en') 
        ? `/global/resources/templates/wikinavbox_sub.html`
        : `/global/resources/templates/wikinavbox_sub_${currentLang}.html`;

    try {
        const response = await fetch(navboxFilePath);
        if (!response.ok) {
            throw new Error(`Failed to load navbox file: ${navboxFilePath}`);
        }
        
        const navboxHtml = await response.text();
        wikinavboxContainer.innerHTML = navboxHtml;

        // fetch로 가져온 HTML 내의 버튼들을 찾아 이벤트를 연결합니다.
        initializeDropdowns(wikinavboxContainer);

        // URL에서 현재 문서 ID를 파악하여 활성 링크를 하이라이트합니다.
        const urlParams = new URLSearchParams(window.location.search);
        const currentDocId = urlParams.get('doc') || 'default';
        const navLinks = wikinavboxContainer.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.href.includes(`?doc=${currentDocId}`));

            // 현재 활성화된 링크가 포함된 부모 메뉴를 자동으로 열어둡니다.
            if (link.classList.contains('active')) {
                openParentMenus(link);
            }
        });

        // language switcher 초기화 및 커스텀 이벤트
        if (window.initializeLanguageSwitcher) {
            window.initializeLanguageSwitcher();
        }
        window.dispatchEvent(new Event('wikinavbox-loaded'));

    } catch (error) {
        console.error('Error loading wiki navigation:', error);
        wikinavboxContainer.innerHTML = '<h3>Wiki navigation could not be loaded.</h3><p>An error occurred.</p>';
    }
});

function initializeDropdowns(container) {
    container.querySelectorAll('.toggle-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parentLi = this.closest('li');
            const icon = this.querySelector('.material-symbols-outlined');
            
            const isCollapsed = parentLi.classList.toggle('collapsed');
            
            if (icon) {
                icon.textContent = isCollapsed ? 'add' : 'remove';
            }
        });
    });
}

function openParentMenus(element) {
    let parent = element.parentElement;
    const container = document.getElementById('wikinavbox-container');

    while (parent && parent !== container) {
        if (parent.tagName === 'LI' && parent.classList.contains('collapsed')) {
            parent.classList.remove('collapsed');
            
            const icon = parent.querySelector('.toggle-trigger .material-symbols-outlined');
            
            if (icon) {
                icon.textContent = 'remove';
            }
        }
        parent = parent.parentElement;
    }
}
