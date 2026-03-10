// Year Update Function
(function() {
    // 1. 연도를 업데이트하는 함수
    function updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement && !yearElement.dataset.updated) {
            yearElement.textContent = new Date().getFullYear();
            yearElement.dataset.updated = "true"; // 중복 실행 방지
        }
    }

    // 2. DOM 변화를 감시하여 푸터가 로드되는 시점을 캐치
    const observer = new MutationObserver((mutations) => {
        updateYear();
    });

    // 3. 페이지 전체(document.body)를 감시 시작
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // 초기 실행 시도 (이미 로드되었을 경우 대비)
    updateYear();
})();

// Syntax Highlighting Function
document.addEventListener("wikiContentLoaded", () => {
    document.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el);
    });
});
