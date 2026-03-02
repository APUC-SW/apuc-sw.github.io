document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');
    const wikinavboxContainer = document.getElementById('wikinavbox-container');

    const urlParams = new URLSearchParams(window.location.search);
    const docName = urlParams.get('doc') || 'default';

    const markdownFilePath = `/global/wiki/doc/sub/${docName}_ja.md`;

    try {
        let response = await fetch(markdownFilePath);

        // 번역 파일이 없으면 영어 원문으로 fallback
        if (!response.ok) {
            console.warn(`Translation for ${docName} in 'ja' not found. Falling back to English.`);
            const fallbackFilePath = `/global/wiki/doc/sub/${docName}.md`;
            response = await fetch(fallbackFilePath);

            if (!response.ok) {
                wikiContentContainer.innerHTML =
                    '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
                return;
            }
        }

        const markdownText = await response.text();
        const htmlContent = marked.parse(markdownText);
        wikiContentContainer.innerHTML = htmlContent;

        // 드롭다운 초기화 (DOM 삽입 이후 실행)
        if (wikinavboxContainer) {
            initializeDropdowns(wikinavboxContainer);
        }

        // ✅ 항상 이벤트 발생
        document.dispatchEvent(new CustomEvent('wikiContentLoaded'));

    } catch (error) {
        console.error('Failed to load or parse Markdown:', error);
        wikiContentContainer.innerHTML =
            '<h1>Error occurred</h1><p>An unknown error occurred while loading the wiki document.</p>';
    }
});

function initializeDropdowns(container) {
    container.querySelectorAll('.toggle-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parentLi = this.closest('li');
            const icon = this.querySelector('.material-symbols-outlined');
            
            // 상태 전환
            const isCollapsed = parentLi.classList.toggle('collapsed');
            
            // 아이콘 텍스트 변경 (add <-> remove)
            if (icon) {
                icon.textContent = isCollapsed ? 'add' : 'remove';
            }
        });
    });
}

function openParentMenus(element) {
    let parent = element.parentElement;
    while (parent && parent !== document.getElementById('wikinavbox-container')) {
        if (parent.tagName === 'LI' && parent.classList.contains('collapsed')) {
            parent.classList.remove('collapsed');
            const btn = parent.querySelector('.toggle-btn');
            if (btn) btn.textContent = '-';
        }
        parent = parent.parentElement;
    }
}
