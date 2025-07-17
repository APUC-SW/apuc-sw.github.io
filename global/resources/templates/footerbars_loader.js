fetch('/global/resources/templates/footerbars.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footerbase-container').innerHTML = html;
    })
    .catch(error => console.error('푸터 바 로딩 오류:', error));