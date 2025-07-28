const marked = require('marked');
const fs = require('fs').promises; // 파일 시스템 모듈
const path = require('path'); // 경로 관련 모듈 추가

async function processMarkdownFile(markdownFilePath) {
    // 1. Markdown 파일 내용 불러오기
    // 파일 경로의 유효성을 먼저 확인하는 것이 좋습니다.
    let markdownContent;
    try {
        markdownContent = await fs.readFile(markdownFilePath, 'utf-8');
    } catch (error) {
        console.error(`Error reading markdown file "${markdownFilePath}":`, error.message);
        return null; // 오류 발생 시 null 반환
    }

    // 2. HTML 임베드 템플릿 파일 불러오기
    // 이 템플릿 파일은 스크립트와 같은 디렉토리에 있다고 가정합니다.
    const templatePath = path.join(__dirname, 'embed_url.html');
    let linkEmbedTemplate;
    try {
        linkEmbedTemplate = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
        console.error(`Error reading template file "${templatePath}":`, error.message);
        return null; // 오류 발생 시 null 반환
    }

    // 3. Markdown을 HTML로 렌더링
    let htmlOutput = marked.parse(markdownContent);

    // 4. 플레이스홀더 교체
    htmlOutput = htmlOutput.replace(/\{\{link_embed:([^:]+):([^}]+)\}\}/g, (match, title, url) => {
        return linkEmbedTemplate
            .replace('{title}', title.trim())
            .replace(/\{url\}/g, url.trim());
    });

    return htmlOutput;
}

// 스크립트 실행 시 전달되는 명령줄 인자를 처리
async function main() {
    const args = process.argv.slice(2); // node process_markdown.js [파일1] [파일2] ...

    if (args.length === 0) {
        console.log('Usage: node process_markdown.js <markdown_file1.md> [markdown_file2.md ...]');
        return;
    }

    for (const filePath of args) {
        console.log(`Processing "${filePath}"...`);
        const htmlResult = await processMarkdownFile(filePath);

        if (htmlResult) {
            // 원본 파일명에서 확장자를 .html로 변경하여 저장
            const outputFileName = filePath.replace(/\.md$/, '.html');
            await fs.writeFile(outputFileName, htmlResult);
            console.log(`Successfully processed "${filePath}" to "${outputFileName}"`);
        }
    }
}

// main 함수 실행
main().catch(console.error);