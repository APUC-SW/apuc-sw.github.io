fetch('/global/resources/templates/navbars.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbarbase-container').innerHTML = html;
    })
    .catch(error => console.error('내비게이션 바 로딩 오류:', error));