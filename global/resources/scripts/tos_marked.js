// English TOS
fetch('/global/locales/md/tos_english.md')
.then(response => response.text())
.then(markdown => {
    const html = marked.parse(markdown);
    document.getElementById('tos-english').innerHTML = html;
})
.catch(error => {
    console.error('File load failed: ', error);
    document.getElementById('tos-english').innerHTML = '<p>Failed to load file.</p>';
});

// Korean TOS
fetch('/global/locales/md/tos_korean.md')
.then(response => response.text())
.then(markdown => {
    const html = marked.parse(markdown);
    document.getElementById('tos-korean').innerHTML = html;
})
.catch(error => {
    console.error('File load failed: ', error);
    document.getElementById('tos-korean').innerHTML = '<p>Failed to load file.</p>';
});
