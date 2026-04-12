document.addEventListener('DOMContentLoaded', () => {
    loadGitHubCommits();
});

async function loadGitHubCommits() {
    const container = document.getElementById('ch-github');
    if (!container) return;

    const REPO = "APUC-SW/apuc-sw.github.io";
    const NOW = Date.now();
    const DELAY = 5 * 60 * 1000; // 5분 지연

    const lastFetch = localStorage.getItem('last_commit_fetch');
    const cachedData = localStorage.getItem('github_commits_cache');

    // 1. 5분 이내 재방문 시 캐시 데이터 사용
    if (lastFetch && (NOW - lastFetch < DELAY) && cachedData) {
        renderCommits(JSON.parse(cachedData));
        return;
    }

    // 2. API 호출
    try {
        container.innerHTML = "<p>Loading commit histories...</p>";
        
        const response = await fetch(`https://api.github.com/repos/${REPO}/commits`);
        if (!response.ok) throw new Error("Github API request failed: " + response.status);

        const commits = await response.json();

        // 데이터 저장
        localStorage.setItem('last_commit_fetch', NOW);
        localStorage.setItem('github_commits_cache', JSON.stringify(commits));

        renderCommits(commits);
    } catch (error) {
        console.error("GitHub API Error:", error);
        if (cachedData) {
            renderCommits(JSON.parse(cachedData));
        } else {
            container.innerHTML = "<p>Failed to load commit histories. Please try again later.</p>";
        }
    }
}

function renderCommits(commits) {
    const container = document.getElementById('ch-github');
    container.innerHTML = ""; // 기존 메시지 초기화

    const ul = document.createElement('ul');

    // 최근 10개의 커밋만 표시
    commits.slice(0, 10).forEach(item => {
        const date = new Date(item.commit.author.date).toLocaleDateString();
        const fullMessage = item.commit.message;
        const url = item.html_url;

        // 1. "Changelog" 또는 "Changelogs" 위치 찾기 (대소문자 구분 안 함)
        const firstNewLine = fullMessage.indexOf('\n');
        
        let title = "";
        let body = "";

        if (firstNewLine !== -1) {
            // 엔터가 있으면: 그 전까지는 제목, 그 후는 본문
            title = fullMessage.substring(0, firstNewLine).trim();
            body = fullMessage.substring(firstNewLine).trim();
        } else {
            // 엔터가 없으면: 메시지 전체가 제목
            title = fullMessage;
            body = "";
        }

        const li = document.createElement('li');
        li.className = 'commit-item';

        const bodyHTML = body ? `<span class="commit-body">${body}</span>` : "";

        li.innerHTML = `
            <span class="commit-date">[${date}]</span>
            <a href="${url}" target="_blank" class="commit-title">${title}</a>
            ${bodyHTML}
        `;
        ul.appendChild(li);
    });

    container.appendChild(ul);
}