(async function initTOC() {
    const rsidewrapper = document.getElementById('rsidewrapper');
    const urlParams = new URLSearchParams(window.location.search);
    const lang = getCurrentLang(urlParams);

    try {
        const html = await loadTemplateWithFallback(lang);
        if (rsidewrapper) {
            rsidewrapper.innerHTML = html;
        }
    } catch (error) {
        console.error('템플릿 로드 오류:', error);
        return;
    }

    document.addEventListener('wikiContentLoaded', () => {
        const contentArea = document.getElementById('wikicontent-container');
        const tocList = document.getElementById('toc-list');

        if (!contentArea || !tocList) return;

        const headings = contentArea.querySelectorAll('h1, h2, h3');
        tocList.innerHTML = '';

        let h1Count = 0;
        let h2Count = 0;
        let h3Count = 0;

        headings.forEach((header, index) => {
            if (!header.id) {
                header.id = `heading-${index}`;
            }

            let numberPrefix = '';
            const tagName = header.tagName.toUpperCase();

            if (tagName === 'H1') {
                h1Count++;
                h2Count = 0;
                h3Count = 0;
                numberPrefix = `${h1Count}. `;
            } else if (tagName === 'H2') {
                h2Count++;
                h3Count = 0;
                numberPrefix = `${h1Count}.${h2Count}. `;
            } else if (tagName === 'H3') {
                h3Count++;
                numberPrefix = `${h1Count}.${h2Count}.${h3Count}. `;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${header.id}`;

            const fullTitle = numberPrefix + header.textContent;
            a.textContent = fullTitle;
            a.title = fullTitle;

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

function getCurrentLang(urlParams) {
    const langFromQuery = urlParams.get('lang');
    if (['en', 'ko', 'ja'].includes(langFromQuery)) {
        return langFromQuery;
    }

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const wikiIndex = pathSegments.indexOf('wiki');

    if (wikiIndex !== -1 && pathSegments.length > wikiIndex + 1) {
        const nextSegment = pathSegments[wikiIndex + 1];
        if (['en', 'ko', 'ja'].includes(nextSegment)) {
            return nextSegment;
        }
    }

    return 'en';
}

async function fetchTextOrNull(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (error) {
        console.warn(`템플릿 fetch 실패: ${path}`, error);
        return null;
    }
}

async function loadTemplateWithFallback(lang) {
    const primaryPath = `/global/resources/templates/wikinavbox_sub_${lang}.html`;
    let html = await fetchTextOrNull(primaryPath);
    if (html !== null) {
        return html;
    }

    console.warn(`기본 템플릿 로드 실패: ${primaryPath}`);

    const legacyPath = `/global/resources/templates/wikinavbox_sub.html`;
    html = await fetchTextOrNull(legacyPath);
    if (html !== null) {
        console.warn(`구 방식 fallback 로드 성공: ${legacyPath}`);
        return html;
    }

    throw new Error(`템플릿을 찾을 수 없습니다. Tried: ${primaryPath}, ${legacyPath}`);
}
