document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('background-music');
    const muteBtn = document.getElementById('mute-btn');
    const enterBtn = document.querySelector('.enter-button');
    let musicStarted = false;

    function playMusic() {
        if (backgroundMusic && !musicStarted) {
            backgroundMusic.volume = 0.2;
            backgroundMusic.play().catch(e => console.error("Error al reproducir música:", e));
            musicStarted = true;
        }
    }

    // Inicia la música cuando el usuario hace clic en el botón "Entrar".
    if (enterBtn) {
        enterBtn.addEventListener('click', playMusic, { once: true });
    }

    // Funcionalidad del botón de Mute
    muteBtn.addEventListener('click', () => {
        if (!musicStarted) playMusic(); // Inicia la música si aún no ha comenzado
        backgroundMusic.muted = !backgroundMusic.muted;
        muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
    });
});