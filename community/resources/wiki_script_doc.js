document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.getElementById('content-area');
    const menuContainer = document.getElementById('menu-container');

    menuContainer.addEventListener('click', function(event) {
        let target = event.target.closest('li[data-doc]');
        if (target) {
            const docFileName = target.getAttribute('data-doc');
            fetch(`./docs/${docFileName}`)
                .then(response => response.text())
                .then(html => {
                    contentArea.innerHTML = html;
                })
                .catch(error => {
                    console.error('Failed to fetch the document:', error);
                    contentArea.innerHTML = '<p>Error loading the document.</p>';
                });
        }
    });
});
