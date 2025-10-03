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
        ? `/global/resources/templates/wikinavbox_main.html`
        : `/global/resources/templates/wikinavbox_main_${currentLang}.html`;

    try {
        const response = await fetch(navboxFilePath);
        if (!response.ok) {
            throw new Error(`Failed to load navbox file: ${navboxFilePath}`);
        }
        
        const navboxHtml = await response.text();
        wikinavboxContainer.innerHTML = navboxHtml;

        // URL에서 현재 문서 ID를 파악하여 활성 링크를 하이라이트합니다.
        const urlParams = new URLSearchParams(window.location.search);
        const currentDocId = urlParams.get('doc') || 'default';
        const navLinks = wikinavboxContainer.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.href.includes(`?doc=${currentDocId}`));
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
