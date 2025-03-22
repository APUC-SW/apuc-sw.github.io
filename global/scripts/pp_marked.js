// English PP
fetch('/global/locales/md/pp_english.md')
.then(response => response.text())
.then(markdown => {
    const html = marked.parse(markdown);
    document.getElementById('pp-english').innerHTML = html;
})
.catch(error => {
    console.error('File load failed: ', error);
    document.getElementById('pp-english').innerHTML = '<p>Failed to load file.</p>';
});

// Korean PP
fetch('/global/locales/md/pp_korean.md')
.then(response => response.text())
.then(markdown => {
    const html = marked.parse(markdown);
    document.getElementById('pp-korean').innerHTML = html;
})
.catch(error => {
    console.error('File load failed: ', error);
    document.getElementById('pp-korean').innerHTML = '<p>Failed to load file.</p>';
});
