function normalizeLang(lang) {
    if (!lang) return "text";
    lang = lang.toLowerCase();
    const map = {
        none: "Plain Text",
        text: "Plain Text",
        csharp: "C#",
        cs: "C#",
        "c#": "C#",
        cpp: "C++",
        cxx: "C++",
        cc: "C++",
        c: "C",
        java: "Java",
        python: "Python",
        py: "Python",
        javascript: "JavaScript",
        js: "JavaScript",
        typescript: "TypeScript",
        ts: "TypeScript",
        json: "JSON",
        yaml: "YAML",
        yml: "YAML",
        xml: "XML",
        html: "HTML",
        css: "CSS",
        bash: "Bash",
        sh: "Shell",
        powershell: "PowerShell",
        ps1: "PowerShell"
    };
    return map[lang] ?? (lang.length ? (lang[0].toUpperCase() + lang.slice(1)) : "text");
}

function detectLangFromCodeEl(codeEl) {
    // class="language-xxx" 우선
    for (const cls of codeEl.classList) {
        const m = cls.match(/^language-(.+)$/);
        if (m) return m[1];
    }
    return "";
}

function toHljsLangKey(langKey) {
    if (!langKey) return "";
    const k = langKey.toLowerCase();
    const map = {
        none: "Plain Text",
        text: "Plain Text",
        csharp: "cs",
        "c#": "cs",
        cs: "cs",
        cpp: "cpp",
        cxx: "cpp",
        cc: "cpp",
        c: "c",
        java: "java",
        python: "python",
        py: "python",
        javascript: "javascript",
        js: "javascript",
        typescript: "typescript",
        ts: "typescript",
        json: "json",
        yaml: "yaml",
        yml: "yaml",
        xml: "xml",
        html: "xml", // hljs에서 html은 보통 xml로 처리
        css: "css",
        bash: "bash",
        sh: "bash",
        powershell: "powershell",
        ps1: "powershell"
    };
    return map[k] ?? k;
}

function splitLinesPreserveEmpty(raw) {
    const lines = [];
    let start = 0;

    for (let i = 0; i <= raw.length; i++) {
        if (i === raw.length || raw[i] === "\n") {
        lines.push(raw.slice(start, i)); // 빈 줄이면 ""가 그대로 들어감
        start = i + 1;
        }
    }

    return lines;
}

function buildToolbarForMarkdown(root = document) {
    const codeBlocks = root.querySelectorAll(".markdown-body pre > code");

    codeBlocks.forEach((codeEl) => {
        const preEl = codeEl.parentElement;
        if (!preEl) return;

        // 이미 처리한 블록이면 스킵
        if (preEl.closest(".code-toolbar")) return;

        // 원문 텍스트 확보 (복사/라인 쪼개기 기준)
        // let raw = codeEl.textContent;
        let raw = preEl.textContent;

        // <code> 시작 직후 들어간 개행 1개 제거(HTML 태그로 코드 넣을 때 흔한 문제)
        if (raw.startsWith("\n")) raw = raw.slice(1);

        // 마지막 개행 1개 제거(원하시면 이 줄은 빼셔도 됩니다)
        // raw = raw.replace(/\n$/, "");

        // pre 안을 완전히 정리해서 code 하나만 남기기
        const keepCode = codeEl; // 기존 code 재사용
        preEl.textContent = "";  // pre의 모든 자식 노드 제거(잔재 제거)
        preEl.appendChild(keepCode);
        codeEl = keepCode; // 이후 로직에서 사용

        const langKey = detectLangFromCodeEl(codeEl);
        const langLabel = normalizeLang(langKey);
        const hljsLang = toHljsLangKey(langKey);

        // wrapper
        const wrap = document.createElement("div");
        wrap.className = "code-toolbar";
        wrap.dataset.lang = (langKey || "text").toLowerCase();

        // header
        const header = document.createElement("div");
        header.className = "code-header";

        const langSpan = document.createElement("span");
        langSpan.className = "code-lang";
        langSpan.innerHTML = `
        <span class="material-symbols-outlined lang-icon notranslate" translate="no">code</span>
        <span class="lang-text">${langLabel === "text" ? "Text" : langLabel}</span>
        `;

        const btn = document.createElement("button");
        btn.className = "copy-button";
        btn.type = "button";
        btn.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">content_copy</span>';
        btn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(raw);
                btn.setAttribute("data-copied", "true");
                btn.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">check</span>';
                setTimeout(() => {
                btn.removeAttribute("data-copied");
                btn.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">content_copy</span>';
                }, 1200);
            } catch (e) {
                btn.setAttribute("data-error", "true");
                btn.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">error</span>';
                setTimeout(() => {
                    btn.removeAttribute("data-error");
                    btn.innerHTML = '<span class="material-symbols-outlined notranslate" translate="no">content_copy</span>';
                }, 1200);
            }
        });

        header.appendChild(langSpan);
        header.appendChild(btn);

        // line numbers container
        const ol = document.createElement("ol");
        ol.className = "code-lines";

        const useHljs = typeof window.hljs !== "undefined";
        const canUseSpecifiedLang = useHljs && hljsLang && typeof hljs.getLanguage === "function" && hljs.getLanguage(hljsLang);

        const lines = splitLinesPreserveEmpty(raw);

        for (const line of lines) {
        const li = document.createElement("li");

        // 빈 줄은 높이 유지용
        if (line.length === 0) {
            li.textContent = "\u200B";
            ol.appendChild(li);
            continue;
        }

        // highlight.js 적용 (라인 단위)
        if (useHljs) {
            try {
            if (canUseSpecifiedLang) {
                li.innerHTML = hljs.highlight(line, { language: hljsLang, ignoreIllegals: true }).value;
            } else if (!hljsLang) {
                // 언어가 아예 없으면 자동감지(원치 않으면 이 분기 제거)
                li.innerHTML = hljs.highlightAuto(line).value;
            } else {
                // 지정 언어가 hljs에 없으면 그냥 텍스트
                li.textContent = line;
            }
            } catch {
            li.textContent = line;
            }
        } else {
            li.textContent = line;
        }

        // 혹시 innerHTML이 비게 되는 케이스 방지
        if (!li.innerHTML && !li.textContent) li.textContent = "\u200B";

        ol.appendChild(li);
        }

        // codeEl을 hljs 스타일 대상으로 표기(테마에 따라 필요)
        codeEl.classList.add("hljs");

        // 기존 code 내용을 ol로 교체
        codeEl.textContent = "";
        codeEl.appendChild(ol);

        // assemble
        preEl.replaceWith(wrap);
        wrap.appendChild(header);
        wrap.appendChild(preEl);
    });
}

function runCodeEnhancements() {
    buildToolbarForMarkdown(document);
}

// 마크다운을 동적으로 주입하는 환경이라면 둘 다 걸어두는 편이 안전합니다.
document.addEventListener("wikiContentLoaded", runCodeEnhancements);
document.addEventListener("DOMContentLoaded", runCodeEnhancements);