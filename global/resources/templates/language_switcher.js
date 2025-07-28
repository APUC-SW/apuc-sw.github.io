document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    
    // 1. **URL 쿼리 매개변수에서 문서 ID 파싱**
    const urlParams = new URLSearchParams(window.location.search);
    let currentDocId = urlParams.get('doc') || 'default'; // 'doc' 매개변수 값, 없으면 'default' 사용

    // 2. localStorage에서 저장된 언어 설정 불러오기
    let currentSelectedLang = localStorage.getItem('wikiLang') || 'en';
    
    // 드롭다운의 현재 선택 값 설정
    langSelect.value = currentSelectedLang;

    // 3. 드롭다운 변경 이벤트 리스너
    langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        if (newLang === currentSelectedLang) return;

        localStorage.setItem('wikiLang', newLang);
        currentSelectedLang = newLang;

        // 목차와 콘텐츠를 새 언어로 다시 로드
        // currentDocId는 URL의 ?doc=... 에서 가져온 값이므로 정확합니다.
        if (window.loadWikiNavigation) {
            window.loadWikiNavigation(currentDocId); 
        }
        if (window.loadWikiContent) {
            window.loadWikiContent(currentDocId); 
        }
    });

    // 초기 로드를 위한 전역 함수
    window.loadInitialWikiContent = function() {
        // currentDocId는 DOMContentLoaded 시점에 이미 파싱되어 있습니다.
        const initialLang = localStorage.getItem('wikiLang') || 'en';

        if (window.loadWikiNavigation) {
            window.loadWikiNavigation(currentDocId); 
        }
        if (window.loadWikiContent) {
            window.loadWikiContent(currentDocId); 
        }
        document.documentElement.lang = initialLang.split('-')[0];
    };

    window.loadInitialWikiContent(); // DOMContentLoaded 후 초기 로드 함수 호출
});
