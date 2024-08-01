function createMenuItem(item) {
    let li = document.createElement('li');
    let a = document.createElement('a');  // A 태그 생성
    a.className = 'menu-link';
    a.textContent = item.title;  // 링크 텍스트 설정

    let span = document.createElement('span');
    span.className = 'material-symbols-outlined caret';

    if (item.children && item.children.length > 0) {
        span.textContent = 'expand_more';  // Default icon for collapsible items
        span.onclick = function() {
            this.parentNode.nextElementSibling.classList.toggle('active');
            this.textContent = this.parentNode.nextElementSibling.classList.contains('active') ? 'expand_less' : 'expand_more';
        };
    } else {
        span.textContent = 'chevron_right';  // Icon for items without children
    }

    a.appendChild(span);
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
