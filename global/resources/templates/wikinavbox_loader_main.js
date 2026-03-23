document.addEventListener('DOMContentLoaded', async () => {
    const wikinavboxContainer = document.getElementById('wikinavbox-container');

    if (!wikinavboxContainer) {
        console.error('wikinavbox-container element not found.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = getCurrentLang(urlParams);
    const currentDocId = normalizeDocId(urlParams.get('doc') || 'default');

    try {
        const navboxHtml = await loadNavboxWithFallback(currentLang);
        wikinavboxContainer.innerHTML = navboxHtml;

        initializeDropdowns(wikinavboxContainer);
        highlightActiveLinks(wikinavboxContainer, currentDocId);

        if (window.initializeLanguageSwitcher) {
            window.initializeLanguageSwitcher();
        }

        window.dispatchEvent(new Event('wikinavbox-loaded'));
    } catch (error) {
        console.error('Error loading wiki navigation:', error);
        wikinavboxContainer.innerHTML = '<h3>Wiki navigation could not be loaded.</h3><p>An error occurred.</p>';
    }
});

function getCurrentLang(urlParams) {
    const langFromQuery = urlParams.get('lang');
    if (['en', 'ko', 'ja'].includes(langFromQuery)) {
        return langFromQuery;
    }

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const wikiIndex = pathSegments.indexOf('wiki');

    if (wikiIndex !== -1 && pathSegments.length > wikiIndex + 1) {
        const nextSegment = pathSegments[wikiIndex + 1];
        if (['en', 'ko', 'ja'].includes(nextSegment)) {
            return nextSegment;
        }
    }

    return 'en';
}

function normalizeDocId(rawDocId) {
    return (rawDocId || 'default').replace(/_(en|ko|ja)$/i, '');
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

async function loadNavboxWithFallback(currentLang) {
    const primaryPath = `/global/resources/templates/wikinavbox_main_${currentLang}.html`;
    let html = await fetchTextOrNull(primaryPath);
    if (html !== null) {
        return html;
    }

    console.warn(`Primary navbox load failed: ${primaryPath}`);

    const legacyPath = `/global/resources/templates/wikinavbox_main.html`;
    html = await fetchTextOrNull(legacyPath);
    if (html !== null) {
        console.warn(`Loaded navbox via legacy fallback: ${legacyPath}`);
        return html;
    }

    throw new Error(`Navbox not found. Tried: ${primaryPath}, ${legacyPath}`);
}

function initializeDropdowns(container) {
    if (container.dataset.dropdownInitialized === 'true') {
        return;
    }

    container.dataset.dropdownInitialized = 'true';

    container.addEventListener('click', (event) => {
        const trigger = event.target.closest('.toggle-trigger');
        if (!trigger || !container.contains(trigger)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const parentLi = trigger.closest('li');
        if (!parentLi) {
            return;
        }

        const icon = trigger.querySelector('.material-symbols-outlined');
        const isCollapsed = parentLi.classList.toggle('collapsed');

        if (icon) {
            icon.textContent = isCollapsed ? 'add' : 'remove';
        }
    });
}

function highlightActiveLinks(container, currentDocId) {
    const navLinks = container.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkUrl = new URL(href, window.location.origin);
        const linkDocId = normalizeDocId(linkUrl.searchParams.get('doc') || 'default');

        const isActive = linkDocId === currentDocId;
        link.classList.toggle('active', isActive);

        if (isActive) {
            openParentMenus(link);
        }
    });
}

function openParentMenus(element) {
    let parent = element.parentElement;
    const container = document.getElementById('wikinavbox-container');

    while (parent && parent !== container) {
        if (parent.tagName === 'LI' && parent.classList.contains('collapsed')) {
            parent.classList.remove('collapsed');

            const icon = parent.querySelector('.toggle-trigger .material-symbols-outlined');
            if (icon) {
                icon.textContent = 'remove';
            }
        }

        parent = parent.parentElement;
    }
}
