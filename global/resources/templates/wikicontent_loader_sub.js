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
        wikiContentContainer.innerHTML = '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
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
