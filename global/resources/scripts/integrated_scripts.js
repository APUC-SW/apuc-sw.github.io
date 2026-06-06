// Year Update Function
(function() {
    function updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement && !yearElement.dataset.updated) {
            yearElement.textContent = new Date().getFullYear();
            yearElement.dataset.updated = "true";
        }
    }

    const observer = new MutationObserver((mutations) => {
        updateYear();
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    updateYear();
})();

// Syntax Highlighting Function
document.addEventListener("wikiContentLoaded", () => {
    document.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el);
    });
});

// Censored Block Highlighting Function
(function() {
    const CENSOR_CHAR = '█';
    const GROUP_CLASS = 'wiki-censor-block';

    function processCensorBlocks(node) {
        if (node.parentNode && node.parentNode.classList.contains(GROUP_CLASS)) return;

        if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(CENSOR_CHAR)) {
            const parent = node.parentNode;
            const span = document.createElement('span');
            
            span.innerHTML = node.textContent.replace(new RegExp(`${CENSOR_CHAR}+`, 'g'), 
                `<span class="${GROUP_CLASS}">$&</span>`);
            
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, node);
            }
            parent.removeChild(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(processCensorBlocks);
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => processCensorBlocks(node));
        });
    });

    const init = () => {
        processCensorBlocks(document.body);
        observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Dynamic Error Image Handler
window.addEventListener('error', function (event) {
    if (event.target.tagName.toLowerCase() === 'img') {
        const img = event.target;
        
        // 무한 루프 방지
        if (img.dataset.errorHandled) return;
        img.dataset.errorHandled = "true";
        
        const basePath = '/global/resources/images/err/';
        const extension = '.png';
        
        // 기본값 설정 (규칙에 맞지 않거나 속성이 없을 때 사용할 기본 이미지)
        let fileName = '404_image03'; 
        
        const errType = img.dataset.err;
        
        if (errType) {
            // 정규표현식: 영문자 소문자/대문자 조합 + 숫자 정확히 2자리
            const match = errType.match(/^([a-zA-Z]+)(\d{2})$/);
            
            if (match) {
                const shape = match[1];  // 예: 'rect', 'cir'
                const number = match[2]; // 예: '01', '02'
                
                // 규칙에 따라 파일명 자동 생성 (예: noimg_rect01)
                fileName = `noimg_${shape}${number}`;
            }
        }
        
        // 최종 경로 주입
        img.src = `${basePath}${fileName}${extension}`;
    }
}, true);
