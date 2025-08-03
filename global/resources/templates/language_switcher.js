window.initializeLanguageSwitcher = function() {
    const langSelect = document.getElementById('lang-select');
    
    if (!langSelect) {
        console.error("Error: Could not find element with id 'lang-select'. Language switching will not work.");
        return;
    }

    // 현재 URL 경로에서 언어 코드를 파악하여 드롭다운 값 설정
    const pathSegments = window.location.pathname.split('/').filter(s => s);
    const wikiIndex = pathSegments.indexOf('wiki');
    let currentLang = 'en';
    if (wikiIndex !== -1 && pathSegments.length > wikiIndex + 1) {
        const nextSegment = pathSegments[wikiIndex + 1];
        if (['ko', 'ja'].includes(nextSegment)) {
            currentLang = nextSegment;
        }
    }
    
    langSelect.value = currentLang;

    // 이벤트 기다렸다가 초기화
    window.addEventListener('wikinavbox-loaded', () => {
        window.initializeLanguageSwitcher();
    });

    // 드롭다운 변경 시 리디렉션하는 이벤트 리스너
    langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        const urlParams = new URLSearchParams(window.location.search);
        let docParam = urlParams.get('doc') || 'default'; // 현재 문서 ID

        let redirectUrl = `/global/wiki/`;

        // 새로운 언어에 따라 기본 URL 경로를 설정
        if (newLang === 'en') {
            redirectUrl += 'index.html';
        } else {
            redirectUrl += `${newLang}/index.html`;
        }

        // 새로운 언어에 따라 doc 매개변수 값을 변경
        let newDocParam;
        if (newLang === 'en') {
            // 영어 선택 시: doc 매개변수에서 언어 코드 제거
            newDocParam = docParam.replace(/_(ko|ja)$/, '');
        } else {
            // 한국어/일본어 선택 시: doc 매개변수에 새로운 언어 코드 추가
            // 기존에 언어 코드가 있으면 교체
            newDocParam = docParam.replace(/_(ko|ja)$/, '') + `_${newLang}`;
        }
        
        // 최종 URL 구성
        redirectUrl += `?doc=${newDocParam}`;
        
        window.location.href = redirectUrl;
    });
};

const url = new URL(window.location.href);
const params = url.searchParams;
if (!params.has('doc')) {
    params.set('doc', 'default');
    // 변경 이력을 덮어쓰듯 반영: pushState 하면 쌓이니 replaceState가 적절
    window.history.replaceState({}, '', url);
}