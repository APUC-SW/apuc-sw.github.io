export function extractDocMetaFromMarkdown(markdownText) {
    const rateMatch = markdownText.match(/data-translation-rate=["'](\d+)["']/);
    const langMatch = markdownText.match(/data-lang=["']([^"']+)["']/);
    const titleMatch = markdownText.match(/data-title=["']([^"']+)["']/);
    const ageMatch = markdownText.match(/data-age-restricted=["'](true|false)["']/);
    const warningTagMatch = markdownText.match(/data-warning-tag=["']([^"']+)["']/);

    return {
        title: titleMatch ? titleMatch[1] : '',
        translationRate: rateMatch ? rateMatch[1] : '',
        lang: langMatch ? langMatch[1] : '',
        ageRestricted: ageMatch ? ageMatch[1] === 'true' : false,
        warningTags: warningTagMatch ? warningTagMatch[1] : ''
    };
}
