import {
    parseWarningTags,
    buildWarningMessages,
    renderAgeGate
} from './warning_system.js';

document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');

    if (!wikiContentContainer) {
        console.error('wikicontent-container element not found.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const rawDocId = urlParams.get('doc') || 'default';
    const currentLang = getCurrentLang(urlParams);

    try {
        const markdownText = await loadDocumentWithFallback(rawDocId, currentLang);

        const htmlContent = marked.parse(markdownText);
        wikiContentContainer.innerHTML = htmlContent;

        const SITE_NAME = 'APUC Software - Official Wiki';

        const meta = readDocMeta(wikiContentContainer);
        const h1 = wikiContentContainer.querySelector('h1');
        const fallbackTitle = normalizeDocId(rawDocId).replace(/[-_]/g, ' ');

        const docTitle =
            meta?.title ||
            h1?.textContent.trim() ||
            fallbackTitle;

        document.title = `${docTitle} | ${SITE_NAME}`;

        if (meta?.translationRate) {
            document.documentElement.dataset.translationRate = meta.translationRate;
        }

        if (meta?.translationType) {
            document.documentElement.dataset.translationType = meta.translationType;
        }

        const event = new CustomEvent('wikiContentLoaded', {
            detail: { meta }
        });

    document.dispatchEvent(event);
    } catch (error) {
        console.error('Failed to load or parse Markdown:', error);

        const baseDocId = normalizeDocId(rawDocId);
        
        // 1. 404 전용 MD 파일 로드 시도
        const errorDocId = `_404_${currentLang}`;
        const errorPath = buildPrimaryPath(normalizeDocId(errorDocId), currentLang);
        let errorMarkdown = await fetchTextOrNull(errorPath);

        if (!errorMarkdown) {
            errorMarkdown = "# 404 - Page Not Found\n\nThe requested document could not be found.";
        }

        // 2. 다른 언어 버전이 존재하는지 모두 확인
        // 지원하는 전체 언어 목록 (현재 언어와 영어 fallback은 이미 실패했으므로 제외하고 체크 가능)
        const supportedLangs = ['ko', 'ja', 'en']; 
        const availableLangs = [];

        // 병렬로 파일 존재 여부 확인
        await Promise.all(supportedLangs.map(async (lang) => {
            // 현재 시도했던 언어와 같으면 스킵 (이미 실패했으므로)
            if (lang === currentLang) return;

            const checkPath = buildPrimaryPath(baseDocId, lang);
            const content = await fetchTextOrNull(checkPath);
            
            if (content !== null) {
                availableLangs.push({
                    code: lang,
                    name: lang === 'ko' ? '한국어' : lang === 'ja' ? '日本語' : 'English'
                });
            }
        }));

        // 3. 안내 문구 및 링크 목록 생성
        let altLinkContent = '';
        if (availableLangs.length > 0) {
            // 마크다운 문법으로 리스트 작성
            const langLinks = availableLangs
                .map(l => `* [${l.name} (${l.code})](?doc=${rawDocId}&lang=${l.code})`)
                .join('\n');

            altLinkContent = `
# Why?
Because this document is not an completely reviewed yet. But you're an lucky.
See below, you can check this document to see other languages. Have it if you really want.
Or, would you like to forget the language barrier for a moment and take a look at these three cute friends?

<image class="imgol-bottomfixed" src="/global/resources/images/err/404_image.png" oncontextmenu="return false;">
<br>
Related documents in other languages:

${langLinks}
            `;
        }

        // 4. 최종 결합 및 렌더링
        // 원본 404 MD에 {{SOURCE_LINK}}가 있으면 마크다운 상태에서 치환
        let combinedMarkdown = errorMarkdown;
        if (combinedMarkdown.includes('{{SOURCE_LINK}}')) {
            combinedMarkdown = combinedMarkdown.replace('{{SOURCE_LINK}}', altLinkContent);
        } else {
            combinedMarkdown += altLinkContent;
        }

        wikiContentContainer.innerHTML = marked.parse(combinedMarkdown);
        document.title = `404 Not Found | APUC Software - Official Wiki`;
    }
});

function readDocMeta(container) {
    const metaEl = container.querySelector('.wikidoc-meta');
    if (!metaEl) {
        return null;
    }

    return {
        title: metaEl.dataset.title?.trim() || '',
        translationRate: metaEl.dataset.translationRate?.trim() || '',
        translationType: metaEl.dataset.translationType?.trim() || '',
        lang: metaEl.dataset.lang?.trim() || ''
    };
}

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

function normalizeDocId(rawDocId) {
    return (rawDocId || 'default').replace(/_(en|ko|ja)$/i, '');
}

function buildPrimaryPath(baseDocId, lang) {
    return `/global/wiki/doc/sub/${baseDocId}_${lang}.md`;
}

function buildLegacyPath(rawDocId) {
    return `/global/wiki/doc/sub/${rawDocId}.md`;
}

async function fetchTextOrNull(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (error) {
        console.warn(`Fetch failed: ${path}`, error);
        return null;
    }
}

async function loadDocumentWithFallback(rawDocId, currentLang) {
    const baseDocId = normalizeDocId(rawDocId);

    // 1차: 새 방식
    const primaryPath = buildPrimaryPath(baseDocId, currentLang);
    let markdownText = await fetchTextOrNull(primaryPath);
    if (markdownText !== null) {
        return markdownText;
    }
    console.warn(`Primary load failed: ${primaryPath}`);

    // 2차: 구 방식 fallback
    const legacyPath = buildLegacyPath(rawDocId);
    markdownText = await fetchTextOrNull(legacyPath);
    if (markdownText !== null) {
        console.warn(`Loaded via legacy fallback: ${legacyPath}`);
        return markdownText;
    }

    // 3차: 영어 fallback
    const englishPath = buildPrimaryPath(baseDocId, 'en');
    markdownText = await fetchTextOrNull(englishPath);
    if (markdownText !== null) {
        console.warn(`Loaded via English fallback: ${englishPath}`);
        return markdownText;
    }

    throw new Error(`Document not found. Tried: ${primaryPath}, ${legacyPath}, ${englishPath}`);
}
