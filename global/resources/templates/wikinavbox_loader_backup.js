document.addEventListener('DOMContentLoaded', async () => {
    const wikinavboxContainer = document.getElementById('wikinavbox-container');

    // URL에서 현재 문서 ID 및 유형 ID를 파악합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const currentDocId = urlParams.get('doc') || 'default';
    const currentTypeId = urlParams.get('type') || 'main'; // 'main' 또는 'sub'

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

    // 유형에 따라 기본 경로를 설정합니다.
    // let basePath;
    // if (currentTypeId === 'sub') {
    //     // 유형이 'sub'일 경우의 경로
    //     basePath = `/global/wiki/doc/sub`;
    // } else {
    //     // 유형이 'main'이거나 그 외의 기본값일 경우의 경로
    //     basePath = `/global/wiki/doc/main`;
    // }
    
    // 유형(type)에 따라 파일 이름을 결정하고 최종 경로를 설정합니다.
    const typeFileName = `wikinavbox_${currentTypeId}`;
    // 언어 코드를 파일 이름에 추가하여 최종 경로를 완성합니다.
    const navboxFilePath = (currentLang === 'en') 
        ? `/global/resources/templates/${typeFileName}.html`
        : `/global/resources/templates/${typeFileName}_${currentLang}.html`;
    
    // 예: 
    // - type=main, lang=en  => /global/resources/templates/wikinavbox_main.html
    // - type=sub, lang=ko   => /global/resources/templates/wikinavbox_sub_ko.html

    try {
        const response = await fetch(navboxFilePath);
        if (!response.ok) {
            throw new Error(`Failed to load navbox file: ${navboxFilePath}`);
        }
        
        const navboxHtml = await response.text();
        wikinavboxContainer.innerHTML = navboxHtml;

        // URL의 두 매개변수를 사용하여 활성 링크를 하이라이트합니다.
        const targetQuery = `?doc=${currentDocId}&type=${currentTypeId}`;
        
        const navLinks = wikinavboxContainer.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            // href에 두 매개변수가 모두 포함된 경우에만 활성화
            const isActive = link.href.includes(targetQuery);
            link.classList.toggle('active', isActive);
        });

        // 기타 초기화 및 이벤트 로직 유지
        if (window.initializeLanguageSwitcher) {
            window.initializeLanguageSwitcher();
        }
        window.dispatchEvent(new Event('wikinavbox-loaded'));

    } catch (error) {
        console.error('Error loading wiki navigation:', error);
        wikinavboxContainer.innerHTML = '<h3>Wiki navigation could not be loaded.</h3><p>An error occurred.</p>';
    }
});
