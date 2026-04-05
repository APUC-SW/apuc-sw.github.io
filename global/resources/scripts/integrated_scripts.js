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
