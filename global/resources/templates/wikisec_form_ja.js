const ENCRYPTED_ENDPOINT = "aHR0cHM6Ly9xNnlsNGkxdm9nLmV4ZWN1dGUtYXBpLmFwLW5vcnRoZWFzdC0yLmFtYXpvbmF3cy5jb20vdmFsaWRhdGU";
const EXPIRATION_DURATION = 5 * 60 * 1000; // 5분

// 클라이언트에 노출될 질문 목록 (정답은 Lambda에만 저장됨)
const SPACE_HISTORY_QUESTIONS = [
    { id: "Q01", question: "ソ連が人類初の人工衛星スプートニク1号を打ち上げたのはいつですか？" },
    { id: "Q02", question: "NASA（アメリカ航空宇宙局）が正式に設立されたのはいつですか？" },
    { id: "Q03", question: "最初に月面に到達した探査機ルナ2号が打ち上げられたのはいつですか？" },
    { id: "Q04", question: "ユーリイ・ガガーリンが人類初の宇宙飛行に成功したのはいつですか？" },
    { id: "Q05", question: "初の女性宇宙飛行士ワレンチナ・テレシコワが飛行したのはいつですか？" },
    { id: "Q06", question: "アポロ11号が月面に着陸し、ニール・アームストロングが最初の一歩を踏み出したのはいつですか？" },
    { id: "Q07", question: "ソ連初の宇宙ステーション、サリュート1号が打ち上げられたのはいつですか？" },
    { id: "Q08", question: "アメリカ初の宇宙ステーション、スカイラブが打ち上げられたのはいつですか？" },
    { id: "Q09", question: "太陽系外へ旅立つためのボイジャー1号が打ち上げられたのはいつですか？" },
    { id: "Q10", question: "初のスペースシャトルであるコロンビア号が初飛行を開始したのはいつですか？" },
    { id: "Q11", question: "ハッブル宇宙望遠鏡がスペースシャトル・ディスカバリーによって打ち上げられたのはいつですか？" },
    { id: "Q12", question: "国際宇宙ステーション（ISS）建設の最初のモジュール「ザーリャ」が打ち上げられたのはいつですか？" },
    { id: "Q13", question: "中国初の有人宇宙船である神舟5号が打ち上げられたのはいつですか？" },
    { id: "Q14", question: "SpaceX初の軌道投入ロケット、ファルコン9が初飛行に成功したのはいつですか？" },
    { id: "Q15", question: "NASAのキュリオシティ・ローバーが火星に着陸したのはいつですか？" },
    { id: "Q16", question: "韓国初の月周回探査機ダヌリが打ち上げられたのはいつですか？" },
    { id: "Q17", question: "アルテミス1号が月周回探査のために打ち上げられたのはいつですか？" },
    { id: "Q18", question: "ソ連の宇宙飛行士アレクセイ・レオーノフが人類初の船外活動（EVA）に成功したのはいつですか？" },
    { id: "Q19", question: "太陽系外惑星すべてに接近した探査機ボイジャー2号が打ち上げられたのはいつですか？" },
    { id: "Q20", question: "日本が自国技術で開発した初の人工衛星おおすみ（OHSUMI）の打ち上げに成功したのはいつですか？" },
    { id: "Q21", question: "韓国初の独自開発ロケット、ヌリ号（KSLV-II）が性能検証衛星などを搭載し、軌道投入に成功したのはいつですか？" },
    { id: "Q22", question: "韓国で初めて民間主導で行われたヌリ号4次打ち上げが成功裏に実施されたのはいつですか？" }
];

const MESSAGES = {
    "loading": "質問を読み込んでいます...",
    "success": "アクセス承認",
    "failure": "アクセス拒否",
    "format_error": "無効な形式: YYYYMMDD 形式で 8 桁を入力してください。",
    "server_error": "サーバー接続に失敗しました: しばらくしてからもう一度お試しください。",
    "expired": "セッションが期限切れです: 再度確認してください。",
    "verifying": "確認中...",
};

let currentQuestionId; // 현재 표시된 질문의 ID
let countdownInterval = null;

// [2] 함수: 질문 랜덤 로드
function loadRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * SPACE_HISTORY_QUESTIONS.length);
    currentQuestionId = SPACE_HISTORY_QUESTIONS[randomIndex].id; 
    
    const questionContainer = document.getElementById('recaptcha-question');
    if (questionContainer) {
        questionContainer.innerHTML = SPACE_HISTORY_QUESTIONS[randomIndex].question;
    }
    
    document.getElementById('date-input').value = '';
    const resultMessage = document.getElementById('result-message');
    if(resultMessage) resultMessage.textContent = "";
}

// [3] 함수: 정적 텍스트 적용
function applyStaticTexts() {
    document.getElementById('recaptcha-question').textContent = MESSAGES.loading;
}

// [4] 함수: 타이머 표시 업데이트 및 만료 처리
function updateTimerDisplay() {
    const timerElement = document.getElementById('session-timer');
    const storedTime = localStorage.getItem('recaptcha_auth_time');
    
    if (!storedTime || !timerElement) {
        if (countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const expirationTime = parseInt(storedTime) + EXPIRATION_DURATION;
    const remainingMillis = expirationTime - Date.now();
    
    if (remainingMillis <= 0) {
        // **세션 만료 시 처리**
        clearInterval(countdownInterval);
        localStorage.removeItem('recaptcha_auth_time');
        timerElement.style.color = '#FF1744'
        timerElement.innerHTML = `セッションが期限切れです<br><strong>00:00</strong>`;
        
        // **핵심: 오버레이를 다시 표시하기 위해 initProtection() 호출**
        initProtection(); 
        
        return;
    }

    const totalSeconds = Math.floor(remainingMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.style.color = '#00FF7F';
    timerElement.innerHTML = `セッションの有効期限まで<br><strong>${timeString}</strong>`;
}

// [5] 함수: 타이머 시작
function startTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    updateTimerDisplay(); 
    countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// [6] 함수: 인증 확인
function handleFormSubmit(event) {
    // 폼 제출의 기본 동작(페이지 새로고침)을 막습니다.
    event.preventDefault(); 
    checkPassword(); // 핵심 인증 로직만 호출
}

async function checkPassword() {
    const userInput = document.getElementById('date-input').value.trim();
    const resultMessage = document.getElementById('result-message');
    const overlayWrapper = document.getElementById('recaptcha-overlay-wrapper');
    const bodyElement = document.body;
    
    // 유효성 검사
    if (userInput.length !== 8 || isNaN(userInput)) {
        resultMessage.style.color = '#FF1744';
        resultMessage.textContent = MESSAGES.format_error;
        return;
    }

    resultMessage.style.color = 'gray';
    resultMessage.textContent = MESSAGES.verifying;

    const LAMBDA_ENDPOINT = atob(ENCRYPTED_ENDPOINT);
    
    try {
        const response = await fetch(LAMBDA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: currentQuestionId, 
                userInputDate: userInput         
            })
        });

        const data = await response.json();
        
        if (data.success) {
            resultMessage.style.color = '#00FF7F';
            resultMessage.textContent = MESSAGES.success;
            
            // 5분 만료를 위해 타임스탬프를 localStorage에 저장
            localStorage.setItem('recaptcha_auth_time', Date.now()); 

            setTimeout(() => {
                overlayWrapper.style.display = 'none';
                bodyElement.classList.remove('blurred');
                startTimer();
            }, 1500); 
            
        } else {
            resultMessage.style.color = '#FF1744';
            resultMessage.textContent = MESSAGES.failure;
            setTimeout(loadRandomQuestion, 2000); 
        }

    } catch (error) {
        console.error("Authentication server communication error:", error);
        resultMessage.style.color = '#FF1744';
        resultMessage.textContent = MESSAGES.server_error;
        setTimeout(loadRandomQuestion, 3000);
    }
}

// [7] 함수: 페이지 초기화 (2분 만료 체크)
function initProtection() {
    applyStaticTexts(); // 폼 텍스트 적용

    const overlayWrapper = document.getElementById('recaptcha-overlay-wrapper');
    const bodyElement = document.body;
    const timerElement = document.getElementById('session-timer');
    
    // 1. 만료 시간 체크
    const storedTime = localStorage.getItem('recaptcha_auth_time');
    const currentTime = Date.now();
    let isRecentlyAuthenticated = false;

    if (storedTime) {
        if (currentTime - storedTime < EXPIRATION_DURATION) {
            isRecentlyAuthenticated = true;
        } else {
            localStorage.removeItem('recaptcha_auth_time');
            if (countdownInterval) clearInterval(countdownInterval);
            if (timerElement) timerElement.textContent = "Session Expired.";
        }
    }

    if (isRecentlyAuthenticated) {
        // 인증 유효: 오버레이 숨기고 타이머 시작
        if(overlayWrapper) overlayWrapper.style.display = 'none';
        startTimer();
        
    } else {
        // 인증 만료 또는 미인증: 오버레이 표시
        if(overlayWrapper) overlayWrapper.style.display = 'flex';
        
        // 미인증 상태이므로 타이머 정보 초기화
        if(timerElement) {
            timerElement.style.color = '#FF1744';
            timerElement.innerHTML = `セッションは検証されていません<br><strong>00:00</strong>`;
        }
        if (countdownInterval) clearInterval(countdownInterval);
        
        loadRandomQuestion(); 
    }
}

// 모든 함수가 정의된 후 페이지 로드 시 실행
window.onload = initProtection;
