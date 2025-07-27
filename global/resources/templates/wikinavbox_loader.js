fetch('/global/resources/templates/wikinavbox.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('wikinavbox-container').innerHTML = html;
    })
    .catch(error => console.error('위키 네비게이션 상자 로딩 오류:', error));
