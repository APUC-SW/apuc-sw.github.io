// Load the Wiki Navigation Box HTML template
fetch('/global/resources/templates/wikinavbox.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('wikinavbox-container').innerHTML = html;
    })
    .catch(error => console.error('위키 네비게이션 상자 로딩 오류:', error));

// Table of Contents navigation function
// 목차 로드 함수를 전역적으로 노출
window.loadWikiNavigation = async function(docId) { // docId는 language_switcher.js에서 옴
    const wikinavboxContainer = document.getElementById('wikinavbox-container');
    const manifestPath = `/global/wiki/doc/wiki_manifest.json`; // 매니페스트 파일 경로 (동일)

    const currentLang = localStorage.getItem('wikiLang') || 'en';

    try {
        const response = await fetch(manifestPath);
        if (!response.ok) {
            throw new Error(`Failed to load wiki manifest: ${manifestPath}`);
        }
        const wikiPages = await response.json();
        renderNavigation(wikiPages, docId, currentLang);
    } catch (error) {
        console.error('Error loading wiki navigation:', error);
        wikinavboxContainer.innerHTML = '<h3>Wiki navigation could not be loaded.</h3><p>An error occurred.</p>';
    }
};

function renderNavigation(pages, currentDocId, displayLang) {
    const wikinavboxContainer = document.getElementById('wikinavbox-container');
    let navHtml = `<h3>Wiki Navigation (${displayLang.toUpperCase()})</h3><nav><ul>`;
    pages.forEach(page => {
        const title = page.title[displayLang] || page.title['en'];
        // 목차 링크는 URL 매개변수를 사용하도록 변경
        navHtml += `<li><a href="/global/wiki/index.html?doc=${page.id}" data-doc-id="${page.id}">${title}</a></li>`;
    });
    navHtml += '</ul></nav>';
    wikinavboxContainer.innerHTML = navHtml;

    highlightActiveNavLink(currentDocId);
}

function highlightActiveNavLink(currentDocId) {
    const navLinks = document.querySelectorAll('#wikinavbox-container nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkDocId = link.getAttribute('data-doc-id');
        
        // 현재 URL의 문서 ID를 다시 파싱 (language_switcher.js와 동일 로직)
        const urlParams = new URLSearchParams(window.location.search);
        const currentUrlDocId = urlParams.get('doc') || 'default';

        if (linkDocId === currentUrlDocId) {
            link.classList.add('active');
        }
    });
}
