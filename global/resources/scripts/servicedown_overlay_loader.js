fetch('/global/resources/templates/503_temp.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbarbase-container').innerHTML = html;
    })
    .catch(error => console.error('Page loading error:', error));
