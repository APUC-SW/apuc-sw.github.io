document.addEventListener('DOMContentLoaded', function() {
    fetch('/community/resources/wiki_menuitem.json')
        .then(response => response.json())
        .then(data => {
            const treeMenu = document.getElementById('menu-container');
            data.forEach(item => {
                treeMenu.appendChild(createMenuItem(item));
            });
            // 문서 매핑 불러오기
            return fetch('/community/resources/doc_mapping.json');
        })
        .then(response => response.json())
        .then(mapping => {
            const links = document.querySelectorAll('.menu-link');
            links.forEach(link => {
                const uniqueKey = link.getAttribute('data-doc');
                if (mapping[uniqueKey]) {
                    link.href = `./docs/${mapping[uniqueKey]}`; // 링크 설정
                }
            });
        })
        .catch(error => {
            console.error('Failed to load resources:', error);
        });
});

function createMenuItem(item) {
    let li = document.createElement('li');
    let a = document.createElement('a');  // A 태그 생성
    a.className = 'menu-link';
    
    let span = document.createElement('span');
    span.className = 'material-symbols-outlined caret';
    
    // 아이콘 설정
    if (item.children && item.children.length > 0) {
        span.textContent = 'expand_more';  // Default icon for collapsible items
        span.onclick = function() {
            this.parentNode.nextElementSibling.classList.toggle('active');
            this.textContent = this.parentNode.nextElementSibling.classList.contains('active') ? 'expand_less' : 'expand_more';
        };
    } else {
        span.textContent = 'chevron_right';  // Icon for items without children
    }
    
    // 링크 구성
    a.appendChild(span);  // 아이콘을 먼저 추가
    a.appendChild(document.createTextNode(item.title));  // 그 다음 텍스트 추가
    li.appendChild(a);
    
    // 문서 식별자를 data-doc 속성으로 설정
    if (item.doc) {
        a.setAttribute('href', '#');  // 임시 하이퍼링크, 나중에 실제 경로로 변경될 예정
        a.setAttribute('data-doc', item.doc);
    }
    
    if (item.children && item.children.length > 0) {
        let ul = document.createElement('ul');
        ul.className = 'nested';
        item.children.forEach(child => {
            ul.appendChild(createMenuItem(child));
        });
        li.appendChild(ul);
    }
    
    return li;
}
