const ENCRYPTED_ENDPOINT = "aHR0cHM6Ly9xNnlsNGkxdm9nLmV4ZWN1dGUtYXBpLmFwLW5vcnRoZWFzdC0yLmFtYXpvbmF3cy5jb20vdmFsaWRhdGU";
const EXPIRATION_DURATION = 5 * 60 * 1000; // 5분

// 클라이언트에 노출될 질문 목록 (정답은 Lambda에만 저장됨)
const SPACE_HISTORY_QUESTIONS = [
    { id: "Q01", question: "When did the Soviet Union launch Sputnik 1, the first artificial satellite in human history?" },
    { id: "Q02", question: "When was NASA (National Aeronautics and Space Administration) officially established?" },
    { id: "Q03", question: "When was Luna 2, the first probe to reach the surface of the Moon, launched?" },
    { id: "Q04", question: "When did Yuri Gagarin become the first human to successfully fly in space?" },
    { id: "Q05", question: "When did Valentina Tereshkova, the first female astronaut, fly in space?" },
    { id: "Q06", question: "When did Apollo 11 land on the Moon, and Neil Armstrong take his first step?" },
    { id: "Q07", question: "When was Salyut 1, the Soviet Union's first space station, launched?" },
    { id: "Q08", question: "When was Skylab, the United States' first space station, launched?" },
    { id: "Q09", question: "When was Voyager 1 launched to travel beyond the solar system?" },
    { id: "Q10", question: "When did the Space Shuttle Columbia, the first space shuttle, begin its maiden flight?" },
    { id: "Q11", question: "When was the Hubble Space Telescope launched by the Space Shuttle Discovery?" },
    { id: "Q12", question: "When was 'Zarya', the first module for the construction of the International Space Station (ISS), launched?" },
    { id: "Q13", question: "When was Shenzhou 5, China's first crewed spacecraft, launched?" },
    { id: "Q14", question: "When did SpaceX's first orbital launch vehicle, Falcon 9, make its successful maiden flight?" },
    { id: "Q15", question: "When did NASA's Curiosity rover land on Mars?" },
    { id: "Q16", question: "When was Danuri, South Korea's first lunar orbiter, launched?" },
    { id: "Q17", question: "When was Artemis 1 launched for lunar orbit exploration?" },
    { id: "Q18", question: "When did Soviet cosmonaut Alexei Leonov perform the first spacewalk (EVA) in human history?" },
    { id: "Q19", question: "When was the Voyager 2 probe, which approached all four outer planets of the solar system, launched?" },
    { id: "Q20", question: "When did Japan succeed in launching Osumi (OHSUMI), its first domestically developed satellite?" },
    { id: "Q21", question: "When did Nuri (KSLV-II), South Korea's first self-developed launch vehicle, successfully reach orbit with a performance verification satellite and dummy satellite?" },
    { id: "Q22", question: "When was the 4th launch of Nuri, the first led by a private company in South Korea, successfully conducted?" }
];

const MESSAGES = {
    "loading": "LOADING QUESTION...",
    "success": "ACCESS GRANTED",
    "failure": "ACCESS DENIED",
    "format_error": "INVALID FORMAT: Please enter 8 digits in YYYYMMDD format.",
    "server_error": "SERVER CONNECTION FAILED: Please try again later.",
    "expired": "SESSION EXPIRED: Please verify again.",
    "verifying": "VERIFYING...",
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
        timerElement.innerHTML = `SESSION EXPIRED<br><strong>00:00</strong>`;
        
        // **핵심: 오버레이를 다시 표시하기 위해 initProtection() 호출**
        initProtection(); 
        
        return;
    }

    const totalSeconds = Math.floor(remainingMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.style.color = '#00FF7F';
    timerElement.innerHTML = `REMAINING SESSION<br><strong>${timeString}</strong>`;
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
            timerElement.innerHTML = `SESSION NOT VERIFIED<br><strong>00:00</strong>`;
        }
        if (countdownInterval) clearInterval(countdownInterval);
        
        loadRandomQuestion(); 
    }
}

// 모든 함수가 정의된 후 페이지 로드 시 실행
window.onload = initProtection;
