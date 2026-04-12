const WARNING_MAP = {
    ko: {
        violence: "폭력적인 장면이 포함되어 있습니다.",
        gore: "유혈 및 신체 훼손 묘사가 포함되어 있습니다.",
        sexual: "선정적인 내용이 포함되어 있습니다.",
        drugs: "약물 관련 내용이 포함되어 있습니다.",
        horror: "공포 요소가 포함되어 있습니다."
    },
    en: {
        violence: "Contains violent content.",
        gore: "Includes graphic gore.",
        sexual: "Contains sexual content.",
        drugs: "Contains drug-related content.",
        horror: "Contains horror elements."
    },
    ja: {
        violence: "暴力的な内容が含まれています。",
        gore: "流血・損壊描写が含まれています。",
        sexual: "性的な内容が含まれています。",
        drugs: "薬に関する内容が含まれています。",
        horror: "ホラー要素が含まれています。"
    }
};

export function parseWarningTags(tagString) {
    if (!tagString) return [];

    return tagString
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
}

export function buildWarningMessages(tags, lang) {
    const langMap = WARNING_MAP[lang] || WARNING_MAP['en'];

    return tags.map(tag => {
        return langMap[tag]
            || WARNING_MAP['en']?.[tag]
            || tag;
    });
}

export function shouldBlock(meta) {
    return meta.ageRestricted === true;
}

export function renderAgeGate(container, warnings, onConfirm) {
    const warningList = warnings
        .map(msg => `<li>${msg}</li>`)
        .join("");

    container.innerHTML = `
        <div class="age-gate">
            <h2>ADULT ONLY</h2>
            <ul>${warningList}</ul>
            <button id="enter-btn">CONTINUE</button>
            <button id="return-btn">RETURN</button>
        </div>
    `;

    document.getElementById("enter-btn").onclick = onConfirm;
}
