document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');

    const urlParams = new URLSearchParams(window.location.search);
    const docName = urlParams.get('doc') || 'default';

    // 일본어 파일 경로
    const markdownFilePath = `/global/wiki/doc/main/${docName}_ja.md`; // 경로는 올바름

    try {
        const response = await fetch(markdownFilePath);

        if (!response.ok) {
            console.warn(`Translation for ${docName} in 'ja' not found. Attempting to load original 'en' version.`);
            const fallbackFilePath = `/global/wiki/doc/main/${docName}.md`;
            const fallbackResponse = await fetch(fallbackFilePath);
            if (!fallbackResponse.ok) {
                wikiContentContainer.innerHTML = '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
                return;
            }
            const fallbackMarkdownText = await fallbackResponse.text();
            wikiContentContainer.innerHTML = marked.parse(fallbackMarkdownText);
            return;
        }

        const markdownText = await response.text();
        const htmlContent = marked.parse(markdownText);
        wikiContentContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error('Failed to load or parse Markdown:', error);
        wikiContentContainer.innerHTML = '<h1>Error occurred</h1><p>An unknown error occurred while loading the wiki document.</p>';
    }
});
