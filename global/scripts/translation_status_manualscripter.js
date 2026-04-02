document.addEventListener('DOMContentLoaded', () => {
    const jsonPath = 'global/resources/data/translations.json'; // JSON 파일 경로

    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('lang-select');
            const options = selectElement.querySelectorAll('option');

            options.forEach(option => {
                const langKey = option.getAttribute('data-lang'); // 'english', 'korean' 등
                const percent = data[langKey]; // JSON에서 해당 수치 가져오기

                if (percent !== undefined) {
                    // 기존 텍스트(예: "한국어")를 유지하고 괄호 안의 숫자만 업데이트
                    // 텍스트 노드에서 이름만 추출하거나 직접 지정할 수 있습니다.
                    const langName = option.textContent.split(' ('); 
                    option.textContent = `${langName} (${percent}%)`;

                    // 수치가 100% 미만이면 비활성화하거나 스타일을 주고 싶을 경우
                    if (percent === 0) {
                        option.disabled = true;
                    } else {
                        option.disabled = false;
                    }
                }
            });
        })
        .catch(error => console.error('Error loading translation data:', error));
});
