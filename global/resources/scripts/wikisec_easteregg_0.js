let isBypassOpen = false;

async function runBypassSequence() {
    const btn = document.getElementById('bypass-btn');
    const originalModal = document.getElementById('recaptcha-overlay-content');
    const bypassUI = document.getElementById('bypass-form');
    const keyQuestion = document.getElementById('accesskey-question');

    if (!isBypassOpen) {
        btn.classList.add('btn-active');
        if (originalModal) originalModal.style.visibility = 'hidden';
        bypassUI.style.display = 'block';
        document.getElementById('holo-input').focus();
        isBypassOpen = true;
        keyQuestion.textContent = "WHEN DID THE DIMENSIONAL RESONANCE CASCADE(DRC) EVENT OCCUR?";
    } else {
        resetBypassUI();
    }
}

function resetBypassUI() {
    const btn = document.getElementById('bypass-btn');
    const originalModal = document.getElementById('recaptcha-overlay-content');
    const bypassUI = document.getElementById('bypass-form');
    const inputField = document.getElementById('holo-input');

    btn.classList.remove('btn-active');
    if (originalModal) originalModal.style.visibility = 'visible';
    bypassUI.style.display = 'none';
    inputField.value = "";
    isBypassOpen = false;
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

async function verifyBypass() {
    const input = document.getElementById('holo-input').value.trim();
    const secureHash = "1aaa3b73c31f5c1be865e20127d848ad75379985fa5d66ae618a43be4ee3ad31";
    const hashedInput = await hashPassword(input);

    if (hashedInput === secureHash) {
        document.getElementById('holo-input').value = "";
        localStorage.setItem('recaptcha_auth_time', Date.now());

        const accessContainer = document.getElementById('wikisec-container');
        const timerElement = document.getElementById('session-timer');

        if (accessContainer) accessContainer.style.display = 'none';
        // document.body.classList.remove('blurred');
        // document.body.style.overflow = 'auto';

        if (timerElement) {
            timerElement.style.color = '#00FF7F';
			timerElement.innerHTML = `REMAINING SESSION<br><strong>${timeString}</strong>`;

            if (typeof startTimer === 'function') {
                startTimer(); 
            }
        }

        document.getElementById('bypass-form').style.display = 'none';
        const btn = document.getElementById('bypass-btn');
        btn.classList.remove('btn-active');
        isBypassOpen = false;

        alert("ACCESS_PROTOCOL_401: CREDENTIALS_VERIFIED");
    } else {
        alert("ACCESS_PROTOCOL_401: INVALID_CREDENTIALS");
        resetBypassUI();
    }
}
