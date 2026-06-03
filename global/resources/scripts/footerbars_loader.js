fetch('/global/resources/templates/footerbars.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footerbase-container').innerHTML = html;
    })
    .catch(error => console.error('Footer bars loading error:', error));

