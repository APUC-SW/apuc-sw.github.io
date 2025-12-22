document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');

    const urlParams = new URLSearchParams(window.location.search);
    const docName = urlParams.get('doc') || 'default';

    // 한국어 파일 경로
    const markdownFilePath = `/global/wiki/doc/sub/${docName}_ko.md`; // 경로는 올바름

    try {
        const response = await fetch(markdownFilePath);

        if (!response.ok) {
            console.warn(`Translation for ${docName} in 'ko' not found. Attempting to load original 'en' version.`);
            const fallbackFilePath = `/global/wiki/doc/sub/${docName}.md`;
            const fallbackResponse = await fetch(fallbackFilePath);
            if (!fallbackResponse.ok) {
                wikiContentContainer.innerHTML = '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
                return;
            }
            const fallbackMarkdownText = await fallbackResponse.text();
            wikiContentContainer.innerHTML = marked.parse(fallbackMarkdownText);
            return;
        }

        // fetch로 가져온 HTML 내의 버튼들을 찾아 이벤트를 연결합니다.
        initializeDropdowns(wikinavboxContainer);

        const markdownText = await response.text();
        const htmlContent = marked.parse(markdownText);
        wikiContentContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error('Failed to load or parse Markdown:', error);
        wikiContentContainer.innerHTML = '<h1>Error occurred</h1><p>An unknown error occurred while loading the wiki document.</p>';
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
