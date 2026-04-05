(function () {
    let isLanguageSwitcherBound = false;

    const SUPPORTED_LANGS = ['en', 'ko', 'ja'];
    const DOC_SECTION = 'main'; // main용

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

    let translationDataCache = null;

    async function getTranslationRateForLanguage(docId, lang) {
        if (!translationDataCache) {
            try {
                const response = await fetch('/global/resources/data/translations_main.json');
                if (response.ok) {
                    translationDataCache = await response.json();
                }
            } catch (e) {
                console.warn("JSON 번역 데이터를 불러올 수 없습니다. 기존 방식으로 대체합니다.");
            }
        }

        if (translationDataCache && translationDataCache[lang] !== undefined) {
            return normalizeRate(translationDataCache[lang]);
        }

        const baseDocId = normalizeDocId(docId);
        const primaryPath = buildPrimaryMarkdownPath(baseDocId, lang);

        const markdownText = await fetchTextOrNull(primaryPath);
        if (markdownText === null) return null;

        const meta = extractDocMetaFromMarkdown(markdownText);
        return meta ? normalizeRate(meta.translationRate) : null;
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
        // 텍스트 내부에서 data-translation-rate="숫자" 패턴을 직접 찾습니다.
        const rateMatch = markdownText.match(/data-translation-rate=["'](\d+)["']/);
        const langMatch = markdownText.match(/data-lang=["']([^"']+)["']/);
        const titleMatch = markdownText.match(/data-title=["']([^"']+)["']/);

        // 정규표현식으로 매칭된 결과가 있으면 해당 값을 반환합니다.
        return {
            title: titleMatch ? titleMatch : '',
            translationRate: rateMatch ? rateMatch : '',
            lang: langMatch ? langMatch : ''
        };
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
        return `/global/wiki/${lang}/index_main.html`;
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
