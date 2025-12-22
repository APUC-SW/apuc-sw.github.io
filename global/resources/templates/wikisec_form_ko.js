const ENCRYPTED_ENDPOINT = "aHR0cHM6Ly9xNnlsNGkxdm9nLmV4ZWN1dGUtYXBpLmFwLW5vcnRoZWFzdC0yLmFtYXpvbmF3cy5jb20vdmFsaWRhdGU";
const EXPIRATION_DURATION = 5 * 60 * 1000; // 5분

// 질문 목록
const SPACE_HISTORY_QUESTIONS = [
    { id: "Q01", question: "소련이 인류 최초의 인공위성 스푸트니크 1호를 발사한 날은 언제인가요?" },
    { id: "Q02", question: "NASA(미국 항공우주국)가 공식적으로 설립된 날은 언제인가요?" },
    { id: "Q03", question: "최초로 달 표면에 도달한 탐사선인 루나 2호가 발사된 날은 언제인가요?" },
    { id: "Q04", question: "유리 가가린이 인류 최초로 우주 비행에 성공한 날은 언제인가요?" },
    { id: "Q05", question: "최초의 여성 우주인 발렌티나 테레시코바가 비행한 날은 언제인가요?" },
    { id: "Q06", question: "아폴로 11호가 달 표면에 착륙하여 닐 암스트롱이 첫 발을 내디딘 날은 언제인가요?" },
    { id: "Q07", question: "소련의 최초 우주정거장 살류트 1호가 발사된 날은 언제인가요?" },
    { id: "Q08", question: "미국 최초의 우주정거장 스카이랩이 발사된 날은 언제인가요?" },
    { id: "Q09", question: "보이저 1호가 태양계를 벗어나기 위해 발사된 날은 언제인가요?" },
    { id: "Q10", question: "최초의 우주 왕복선인 컬럼비아 호가 첫 비행을 시작한 날은 언제인가요?" },
    { id: "Q11", question: "허블 우주 망원경이 디스커버리 우주 왕복선에 의해 발사된 날은 언제인가요?" },
    { id: "Q12", question: "국제 우주 정거장(ISS) 건설의 첫 모듈인 '자랴'가 발사된 날은 언제인가요?" },
    { id: "Q13", question: "중국 최초의 유인 우주선인 선저우 5호가 발사된 날은 언제인가요?" },
    { id: "Q14", question: "스페이스X의 첫 궤도 발사체인 팰컨 9호가 첫 비행을 성공한 날은 언제인가요?" },
    { id: "Q15", question: "NASA의 큐리오시티 로버가 화성에 착륙한 날은 언제인가요?" },
    { id: "Q16", question: "한국 최초의 달 궤도선인 다누리가 발사된 날은 언제인가요?" },
    { id: "Q17", question: "아르테미스 1호가 달 궤도 탐사를 위해 발사된 날은 언제인가요?" },
    { id: "Q18", question: "소련의 우주인 알렉세이 레오노프가 인류 최초로 우주 유영에 성공한 날짜는 언제인가요?" },
    { id: "Q19", question: "태양계 4대 외행성에 모두 접근한 탐사선 보이저 2호가 발사된 날짜는 언제인가요?" },
    { id: "Q20", question: "일본이 자국 기술로 개발한 최초의 인공위성인 오오스미(OHSUMI) 발사에 성공한 날짜는 언제인가요?" },
    { id: "Q21", question: "대한민국 최초의 독자 개발 발사체인 누리호(KSLV-II)가 성능검증위성 및 더미 위성을 싣고 성공적으로 궤도에 안착한 날은 언제인가요?" },
    { id: "Q22", question: "대한민국 최초로 민간이 주도한 누리호 4차 발사가 성공적으로 수행된 날짜는 언제인가요?" }
];

const MESSAGES = {
    "loading": "질문 불러오는 중...",
    "success": "접근 승인",
    "failure": "접근 거부",
    "format_error": "잘못된 형식: 날짜 YYYYMMDD 형식의 숫자 8자를 입력하세요.",
    "server_error": "서버 연결 실패: 다음에 다시 시도하세요.",
    "expired": "세션 만료: 다시 인증하세요.",
    "verifying": "검사 중...",
};

let currentQuestionId;
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
        clearInterval(countdownInterval);
        localStorage.removeItem('recaptcha_auth_time');
        timerElement.style.color = '#FF1744'
        timerElement.innerHTML = `세션 만료됨<br><strong>00:00</strong>`;
        
        initProtection(); 
        
        return;
    }

    const totalSeconds = Math.floor(remainingMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerElement.style.color = '#00FF7F';
    timerElement.innerHTML = `세션 만료까지<br><strong>${timeString}</strong>`;
}

// [5] 함수: 타이머 시작
function startTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    updateTimerDisplay(); 
    countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// [6] 함수: 인증 확인
function handleFormSubmit(event) {
    event.preventDefault(); 
    checkPassword();
}

async function checkPassword() {
    const userInput = document.getElementById('date-input').value.trim();
    const resultMessage = document.getElementById('result-message');
    const overlayWrapper = document.getElementById('recaptcha-overlay-wrapper');
    const bodyElement = document.body;
    
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

// [7] 함수: 페이지 초기화
function initProtection() {
    applyStaticTexts();

    const overlayWrapper = document.getElementById('recaptcha-overlay-wrapper');
    const bodyElement = document.body;
    const timerElement = document.getElementById('session-timer');
    
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
        if (accessContainer) {
            accessContainer.style.display = 'none';
        }
        startTimer();
        
    } else {
        accessContainer.style.display = 'flex';
        
        if(timerElement) {
            timerElement.style.color = '#FF1744';
            timerElement.innerHTML = `세션 검증되지 않음<br><strong>00:00</strong>`;
        }
        if (countdownInterval) clearInterval(countdownInterval);
        
        loadRandomQuestion(); 
    }
}

window.onload = initProtection;
