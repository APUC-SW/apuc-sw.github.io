(async function initTOC() {
    const rsidewrapper = document.getElementById('rsidewrapper');
    
    // 1. 경로 기반 언어 코드 추출
    const supportedLangs = ['ko', 'ja', 'zh']; // 영어는 기본값

    const pathSegments = window.location.pathname.split('/');

    let lang = 'en';

    const wikiIndex = pathSegments.indexOf('wiki');

    if (wikiIndex !== -1) {
        const possibleLang = pathSegments[wikiIndex + 1];
        if (supportedLangs.includes(possibleLang)) {
            lang = possibleLang;
        }
    }

    // 2. 파일명 동적 생성 로직
    // 기본 언어(en)는 접미사 없음, 그 외에는 _ko, _ja 등 추가
    let fileName = 'wikinavbox_sub';
    if (lang !== 'en') {
        fileName += `_${lang}`;
    }
    
    const TEMPLATE_URL = `/global/resources/templates/${fileName}.html`;

    try {
        const response = await fetch(TEMPLATE_URL);
        
        // 404 오류 발생 시 MIME 타입 에러로 이어지므로 엄격히 체크
        if (!response.ok) {
            throw new Error(`파일을 찾을 수 없습니다: ${TEMPLATE_URL}`);
        }
        
        const html = await response.text();
        if (rsidewrapper) {
            rsidewrapper.innerHTML = html;
        }
    } catch (error) {
        console.error('템플릿 로드 오류:', error);
        return;
    }

    // 3. 본문 로드 완료 리스너 (기존 로직 유지 및 h1 포함)
    document.addEventListener('wikiContentLoaded', () => {
        const contentArea = document.getElementById('wikicontent-container');
        const tocList = document.getElementById('toc-list');

        if (!contentArea || !tocList) return;

        const headings = contentArea.querySelectorAll('h1, h2, h3');
        tocList.innerHTML = '';

        // 각 계층의 번호를 저장할 카운터 (h1, h2, h3 순서)
        let h1Count = 0;
        let h2Count = 0;
        let h3Count = 0;

        headings.forEach((header, index) => {
            if (!header.id) header.id = `heading-${index}`;

            let numberPrefix = "";
            const tagName = header.tagName.toUpperCase();

            if (tagName === 'H1') {
                h1Count++;
                h2Count = 0; // 하위 계층 초기화
                h3Count = 0;
                numberPrefix = `${h1Count}. `;
            } else if (tagName === 'H2') {
                h2Count++;
                h3Count = 0; // 하위 계층 초기화
                numberPrefix = `${h1Count}.${h2Count}. `;
            } else if (tagName === 'H3') {
                h3Count++;
                numberPrefix = `${h1Count}.${h2Count}.${h3Count}. `;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${header.id}`;
            
            // 번호와 텍스트 결합
            const fullTitle = numberPrefix + header.textContent;
            a.textContent = fullTitle;
            // 마우스를 올리면 전체 제목이 툴팁으로 표시됨
            a.title = fullTitle;

            // 스타일링 (계층 구조 시각화)
            if (tagName === 'H1') {
                li.style.fontWeight = 'bold';
                li.style.marginTop = '0.8em';
            } else if (tagName === 'H2') {
                li.style.paddingLeft = '1rem';
                li.style.fontSize = '0.8em';
            } else if (tagName === 'H3') {
                li.style.paddingLeft = '2rem';
                li.style.fontSize = '0.8em';
            }

            li.appendChild(a);
            tocList.appendChild(li);
        });
    });
})();
