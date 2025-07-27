document.addEventListener('DOMContentLoaded', async () => {
    const wikiContentContainer = document.getElementById('wikicontent-container');

    // 현재 페이지의 URL에서 'doc' 쿼리 매개변수를 가져옵니다.
    // 예: about_project.html?doc=about_project_content
    const urlParams = new URLSearchParams(window.location.search);
    const docName = urlParams.get('doc') || 'default'; // 'doc' 매개변수가 없으면 'default.md' 로드

    // Markdown 파일의 경로를 설정합니다.
    // 이 경로는 웹 서버에서 실제로 .md 파일이 위치하는 경로여야 합니다.
    const markdownFilePath = `/global/wiki/doc/${docName}.md`;

    try {
        // fetch API를 사용하여 Markdown 파일을 가져옵니다.
        const response = await fetch(markdownFilePath);

        if (!response.ok) {
            // 파일이 없거나 로드에 실패한 경우
            if (response.status === 404) {
                wikiContentContainer.innerHTML = '<h1>404 - Page Not Found</h1><p>The wiki document you requested could not be found.</p>';
            } else {
                wikiContentContainer.innerHTML = `<h1>Error occurred</h1><p>An error occurred while loading the wiki document: ${response.statusText}</p>`;
            }
            console.error(`Error fetching Markdown file: ${response.status} ${response.statusText} for ${markdownFilePath}`);
            return;
        }

        const markdownText = await response.text();

        // marked.js를 사용하여 Markdown 텍스트를 HTML로 변환합니다.
        // marked.parse()는 동기 함수이므로 await를 붙이지 않습니다.
        const htmlContent = marked.parse(markdownText);

        // 변환된 HTML을 컨테이너에 삽입합니다.
        wikiContentContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error('Failed to load or parse Markdown:', error);
        wikiContentContainer.innerHTML = '<h1>Error occurred</h1><p>An unknown error occurred while loading the wiki document.';
    }
});
