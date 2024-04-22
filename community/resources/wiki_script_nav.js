document.addEventListener('DOMContentLoaded', function() {
    fetch('/community/resources/wiki_locale.json')
        .then(response => response.json())
        .then(data => {
            const treeMenu = document.getElementById('menu-container');
            data.forEach(item => {
                treeMenu.appendChild(createMenuItem(item));
            });
        })
        .catch(error => {
            console.error('Failed to load menu:', error);
        });
});

function createMenuItem(item) {
    let li = document.createElement('li');
    let span = document.createElement('span');
    span.className = 'material-symbols-outlined caret';

    if (item.children && item.children.length > 0) {
        span.textContent = 'expand_more'; // Default icon for collapsible items
        span.onclick = function() {
            this.nextElementSibling.classList.toggle('active');
            this.textContent = this.nextElementSibling.classList.contains('active') ? 'expand_less' : 'expand_more';
        };
    } else {
        span.textContent = 'chevron_right'; // Default icon for items without children
    }

    li.appendChild(span);
    let textNode = document.createTextNode(item.title);
    li.appendChild(textNode);

    // 문서 식별자를 data-doc 속성으로 설정
    if (item.doc) {
        li.setAttribute('data-doc', item.doc);
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
