const ENCRYPTED_ENDPOINT = "aHR0cHM6Ly9xNnlsNGkxdm9nLmV4ZWN1dGUtYXBpLmFwLW5vcnRoZWFzdC0yLmFtYXpvbmF3cy5jb20vdmFsaWRhdGU";
const EXPIRATION_DURATION = 5 * 60 * 1000; // 5분

// 질문 목록
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
        timerElement.innerHTML = `SESSION EXPIRED<br><strong>00:00</strong>`;
        
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
                // overlayWrapper.style.display = 'none';
                // bodyElement.classList.remove('blurred');
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
    const accessContainer = document.getElementById('wikisec-container');
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
            timerElement.innerHTML = `SESSION NOT VERIFIED<br><strong>00:00</strong>`;
        }
        if (countdownInterval) clearInterval(countdownInterval);
        
        loadRandomQuestion(); 
    }
}

window.onload = initProtection;
