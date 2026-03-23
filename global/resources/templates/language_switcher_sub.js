(function () {
    let isLanguageSwitcherBound = false;

    const SUPPORTED_LANGS = ['en', 'ko', 'ja'];
    const DOC_SECTION = 'sub'; // sub용

    window.initializeLanguageSwitcher = async function () {
        const langSelect = document.getElementById('lang-select');

        if (!langSelect) {
            console.error("Error: Could not find element with id 'lang-select'. Language switching will not work.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentLang = getCurrentLang(urlParams);
        const currentDocId = normalizeDocId(urlParams.get('doc') || 'default');

        // 현재 드롭다운 값 설정
        langSelect.value = currentLang;

        // 옵션 라벨에 번역률 반영
        await updateLanguageOptionLabels(langSelect, currentDocId);

        // 중복 바인딩 방지
        if (isLanguageSwitcherBound) {
            return;
        }
        isLanguageSwitcherBound = true;

        langSelect.addEventListener('change', (e) => {
            const newLang = e.target.value;
            const currentUrl = new URL(window.location.href);

            // doc는 순수 문서 ID만 유지
            currentUrl.searchParams.set('doc', currentDocId);
            currentUrl.searchParams.set('lang', newLang);

            // 경로도 언어에 맞게 정리
            currentUrl.pathname = buildLocalizedSubPath(newLang);

            window.location.href = currentUrl.toString();
        });
    };

    async function updateLanguageOptionLabels(langSelect, currentDocId) {
        const rateEntries = await Promise.all(
            SUPPORTED_LANGS.map(async (lang) => {
                const rate = await getTranslationRateForLanguage(currentDocId, lang);
                return [lang, rate];
            })
        );

        const rateMap = Object.fromEntries(rateEntries);

        for (const lang of SUPPORTED_LANGS) {
            const option = langSelect.querySelector(`option[value="${lang}"]`);
            if (!option) continue;

            if (!option.dataset.baseLabel) {
                option.dataset.baseLabel = stripExistingRateLabel(option.textContent);
            }

            const baseLabel = option.dataset.baseLabel;
            const rate = rateMap[lang];

            option.textContent = rate === null
                ? `${baseLabel} (--%)`
                : `${baseLabel} (${rate}%)`;
        }
    }

    async function getTranslationRateForLanguage(docId, lang) {
        const baseDocId = normalizeDocId(docId);
        const primaryPath = buildPrimaryMarkdownPath(baseDocId, lang);

        const markdownText = await fetchTextOrNull(primaryPath);
        if (markdownText === null) {
            return null;
        }

        const meta = extractDocMetaFromMarkdown(markdownText);
        if (!meta) {
            return null;
        }

        return normalizeRate(meta.translationRate);
    }

    function buildPrimaryMarkdownPath(baseDocId, lang) {
        return `/global/wiki/doc/${DOC_SECTION}/${baseDocId}_${lang}.md`;
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

    function extractDocMetaFromMarkdown(markdownText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(markdownText, 'text/html');

        const metaEl = doc.querySelector('.wikidoc-meta');
        if (!metaEl) {
            return null;
        }

        // 1차: data-* 속성 방식
        const directMeta = {
            title: metaEl.dataset.title?.trim() || '',
            translationRate: metaEl.dataset.translationRate?.trim() || '',
            translationType: metaEl.dataset.translationType?.trim() || '',
            lang: metaEl.dataset.lang?.trim() || ''
        };

        if (
            directMeta.title ||
            directMeta.translationRate ||
            directMeta.translationType ||
            directMeta.lang
        ) {
            return directMeta;
        }

        // 2차: 내부 [data-key] 방식도 지원
        const keyedNodes = metaEl.querySelectorAll('[data-key]');
        if (keyedNodes.length > 0) {
            const keyedMeta = {};
            keyedNodes.forEach((el) => {
                const key = el.dataset.key?.trim();
                const value = el.textContent.trim();
                if (key) {
                    keyedMeta[key] = value;
                }
            });

            return {
                title: keyedMeta.title || '',
                translationRate: keyedMeta['translation-rate'] || '',
                translationType: keyedMeta['translation-type'] || '',
                lang: keyedMeta.lang || ''
            };
        }

        return null;
    }

    function normalizeRate(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const num = Number(String(value).replace('%', '').trim());
        if (!Number.isFinite(num)) {
            return null;
        }

        return Math.max(0, Math.min(100, Math.round(num)));
    }

    function stripExistingRateLabel(text) {
        return text.replace(/\s*\((?:\d+|--)%\)\s*$/, '').trim();
    }

    function getCurrentLang(urlParams) {
        const langFromQuery = urlParams.get('lang');
        if (SUPPORTED_LANGS.includes(langFromQuery)) {
            return langFromQuery;
        }

        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const wikiIndex = pathSegments.indexOf('wiki');

        if (wikiIndex !== -1 && pathSegments.length > wikiIndex + 1) {
            const nextSegment = pathSegments[wikiIndex + 1];
            if (SUPPORTED_LANGS.includes(nextSegment)) {
                return nextSegment;
            }
        }

        return 'en';
    }

    function normalizeDocId(rawDocId) {
        return (rawDocId || 'default').replace(/_(en|ko|ja)$/i, '');
    }

    function buildLocalizedSubPath(lang) {
        return `/global/wiki/${lang}/index_sub.html`;
    }

    // 초기 doc/lang 보정
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    const normalizedDoc = normalizeDocId(params.get('doc') || 'default');
    const normalizedLang = getCurrentLang(params);

    let shouldReplace = false;

    if (params.get('doc') !== normalizedDoc) {
        params.set('doc', normalizedDoc);
        shouldReplace = true;
    }

    if (!params.has('lang')) {
        params.set('lang', normalizedLang);
        shouldReplace = true;
    }

    if (shouldReplace) {
        window.history.replaceState({}, '', currentUrl.toString());
    }

    // navbox가 나중에 로드되는 구조 대응
    window.addEventListener('wikinavbox-loaded', () => {
        window.initializeLanguageSwitcher();
    });

    // 문서가 다시 로드되는 구조가 있다면 옵션 라벨 재계산
    window.addEventListener('wikiContentLoaded', () => {
        window.initializeLanguageSwitcher();
    });
})();
