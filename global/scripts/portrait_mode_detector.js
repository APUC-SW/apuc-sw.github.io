function checkPortraitMode() {
    const overlay = document.getElementById('portrait-warning-overlay');
    const isPortrait = window.matchMedia('(orientation: portrait) and (max-width: 768px)').matches;
    
    if (isPortrait) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// 초기 로드 시 확인
document.addEventListener('DOMContentLoaded', checkPortraitMode);

// orientation 변경 시 감지
window.addEventListener('orientationchange', checkPortraitMode);

// resize 이벤트로도 감지
window.addEventListener('resize', checkPortraitMode);
