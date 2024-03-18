$(document).ready(() => {
    const $clickButton = $("#clickergame-button");
    const $scoreText = $("#clickergame-score-text");

    let score = 0;

    $clickButton.on("click", () => {
        score++;
        $scoreText.text(`${score}`);
    });
});