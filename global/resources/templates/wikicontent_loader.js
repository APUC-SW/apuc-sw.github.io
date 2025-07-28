document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');

    // **1. 문서 ID를 파싱하는 함수 정의**
    // 이 함수는 초기 로드 시 직접 호출되거나, language_switcher.js에 의해 호출될 수 있습니다.
    const getDocIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('doc') || 'default'; // 'doc' 매개변수가 없으면 'default' 반환
    };

    // **2. Markdown 콘텐츠를 로드하고 렌더링하는 핵심 함수를 전역 노출**
    // 이 함수는 다른 스크립트(language_switcher.js)에서 언어 전환 시 호출됩니다.
    // docId는 이 함수가 호출될 때 전달받고, lang은 localStorage에서 가져옵니다.
    window.loadWikiContent = async function(docIdToLoad) {
        // localStorage에서 현재 선택된 언어를 가져옵니다.
        const currentLang = localStorage.getItem('wikiLang') || 'en'; // 기본 언어는 'en'

        // 파일 경로 구성: 기본 언어(en)일 경우 docId.md, 그 외는 docId.lang.md
        const markdownFileName = (currentLang === 'en') 
                                ? `${docIdToLoad}.md` 
                                : `${docIdToLoad}.${currentLang}.md`;
        
        const markdownFilePath = `/global/wiki/doc/${markdownFileName}`;

        try {
            const response = await fetch(markdownFilePath);

            if (!response.ok) {
                // 요청한 언어의 파일이 없으면 기본 언어(en) 파일로 폴백
                if (currentLang !== 'en') {
                    console.warn(`Markdown file for ${docIdToLoad} in ${currentLang} not found. Attempting to load 'en' version.`);
                    const fallbackFilePath = `/global/wiki/doc/${docIdToLoad}.md`; // 기본 영어 파일 경로
                    const fallbackResponse = await fetch(fallbackFilePath);
                    if (!fallbackResponse.ok) {
                        throw new Error(`Markdown file for ${docIdToLoad} not found in 'en' either.`);
                    }
                    const fallbackMarkdownText = await fallbackResponse.text();
                    wikiContentContainer.innerHTML = marked.parse(fallbackMarkdownText);
                    return;
                }
                // 기본 언어 파일도 없으면 404 또는 일반 오류 처리
                if (response.status === 404) {
                    wikiContentContainer.innerHTML = '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
                } else {
                    wikiContentContainer.innerHTML = `<h1>Error occurred</h1><p>An error occurred while loading the wiki document: ${response.statusText}</p>`;
                }
                console.error(`Error fetching Markdown file: ${response.status} ${response.statusText} for ${markdownFilePath}`);
                return;
            }

            const markdownText = await response.text();
            const htmlContent = marked.parse(markdownText);
            wikiContentContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error('Failed to load or parse Markdown:', error);
            wikiContentContainer.innerHTML = '<h1>Error occurred</h1><p>An unknown error occurred while loading the wiki document.';
        }
    };

    // **3. 초기 페이지 로드 시 문서 로드**
    // DOMContentLoaded 시점에 현재 URL에서 문서 ID를 파싱하여 로드합니다.
    const initialDocId = getDocIdFromUrl();
    window.loadWikiContent(initialDocId);
});
