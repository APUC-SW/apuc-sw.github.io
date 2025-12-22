let isBypassOpen = false; // 현재 우회창 상태 관리

async function runBypassSequence() {
    const btn = document.getElementById('bypass-btn');
    const originalModal = document.getElementById('recaptcha-overlay-content'); // 가짜 창 클래스
    const bypassUI = document.getElementById('bypass-form');
    const keyQuestion = document.getElementById('accesskey-question');

    if (!isBypassOpen) {
        // [상태 1] 우회창 열기
        btn.classList.add('btn-active'); // 버튼 녹색 변경
        if (originalModal) originalModal.style.visibility = 'hidden'; // 가짜 창 숨김
        bypassUI.style.display = 'block'; // 우회창 표시
        document.getElementById('holo-input').focus();
        isBypassOpen = true;
        keyQuestion.textContent = "WHEN DID THE DIMENSIONAL RESONANCE CASCADE(DRC) EVENT OCCUR?";
    } else {
        // [상태 2] 다시 눌렀을 때 원래대로 복구
        resetBypassUI();
    }
}

// UI를 초기 상태로 되돌리는 공통 함수
function resetBypassUI() {
    const btn = document.getElementById('bypass-btn');
    const originalModal = document.getElementById('recaptcha-overlay-content');
    const bypassUI = document.getElementById('bypass-form');
    const inputField = document.getElementById('holo-input');

    btn.classList.remove('btn-active'); // 버튼 색상 복구
    if (originalModal) originalModal.style.visibility = 'visible'; // 가짜 창 복구
    bypassUI.style.display = 'none'; // 우회창 숨김
    inputField.value = ""; // 입력했던 내용 삭제
    isBypassOpen = false;
}

async function hashPassword(password) {
    // 문자열을 Uint8Array로 인코딩
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // 브라우저 기본 내장 암호화 API 사용 (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Buffer를 16진수 문자열로 변환
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

// 비밀번호 검증 함수 내에서도 실패 시 resetBypassUI()를 호출하도록 수정
async function verifyBypass() {
    const input = document.getElementById('holo-input').value.trim();
    const secureHash = "1aaa3b73c31f5c1be865e20127d848ad75379985fa5d66ae618a43be4ee3ad31";
    const hashedInput = await hashPassword(input);

    if (hashedInput === secureHash) {
        // 1. 시스템이 기대하는 키값으로 현재 시간 저장
        localStorage.setItem('recaptcha_auth_time', Date.now());

        const accessContainer = document.getElementById('wikisec-container');
        const timerElement = document.getElementById('session-timer');

        // 2. 가짜 인증 UI 숨김 및 페이지 복구
        if (accessContainer) accessContainer.style.display = 'none';
        // document.body.classList.remove('blurred');
        // document.body.style.overflow = 'auto';

        // 3. 우회 성공 텍스트 표시 및 원본 타이머 강제 실행
        if (timerElement) {
            timerElement.style.color = '#00FF7F';
			timerElement.innerHTML = `REMAINING SESSION<br><strong>${timeString}</strong>`;

            if (typeof startTimer === 'function') {
                startTimer(); 
            }
        }

        // 4. 우회 UI 정리
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
