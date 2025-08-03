// Creamos un objeto para mantener una referencia a los intervalos y manejadores de eventos.
// Esto nos permite limpiarlos de forma segura entre partidas.
const pacmanGameManager = {
    gameInterval: null,
    timerInterval: null,
    keyHandler: null,
    // Usaremos esta bandera para asegurarnos de que el código de limpieza se ejecute solo una vez por carga.
    isInitialized: false 
};

document.addEventListener('pacmanGame', (e) => {
    // --- Elementos del DOM y del Juego ---
    const canvas = document.getElementById('pacman-canvas');
    const ctx = canvas.getContext('2d');
    let startBtn = document.getElementById('pacman-start-btn');
    let restartBtn = document.getElementById('pacman-restart-btn');
    const livesEl = document.getElementById('pacman-lives');
    const timerEl = document.getElementById('pacman-timer');
    const { onWin } = e.detail;

    // --- Variables de Estado ---
    let lives, timeLeft;
    let gameOver = true;
    let player = { x: 50, y: 50, size: 20, speed: 2, dx: 0, dy: 0, invincible: false };
    let enemy = { x: 200, y: 200, size: 20, speed: 1 };
    
    // --- Imágenes ---
    const playerImg = new Image();
    playerImg.src = '/images/pet_actions/cat.png';
    const enemyImg = new Image();
    enemyImg.src = '/images/pet_actions/dog.png';

    // --- FUNCIÓN DE LIMPIEZA ---
    // Esta función detiene todos los procesos del juego y elimina los listeners.
    function cleanup() {
        clearInterval(pacmanGameManager.gameInterval);
        clearInterval(pacmanGameManager.timerInterval);
        if (pacmanGameManager.keyHandler) {
            document.removeEventListener('keydown', pacmanGameManager.keyHandler);
            document.removeEventListener('keyup', pacmanGameManager.keyHandler);
        }
    }

    // --- LÓGICA PRINCIPAL ---

    // 1. Limpiamos cualquier partida anterior ANTES de hacer nada más.
    cleanup();

    // 2. Reseteamos los listeners de los botones para evitar duplicados.
    // La forma más segura es clonar el botón para eliminar todos sus listeners anteriores.
    let newStartBtn = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    startBtn = newStartBtn; // Actualizamos la referencia

    let newRestartBtn = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
    restartBtn = newRestartBtn; // Actualizamos la referencia

    // --- Funciones del Juego ---

    function draw() {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = player.invincible ? (Math.floor(Date.now() / 200) % 2 === 0 ? 1 : 0.5) : 1.0;
        ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.size, enemy.size);
    }

    function update() {
        if (gameOver) return;
        // Lógica de movimiento del jugador
        player.x += player.dx;
        player.y += player.dy;
        if (player.x < 0) player.x = 0;
        if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
        if (player.y < 0) player.y = 0;
        if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

        // Lógica de movimiento del enemigo
        if (enemy.x < player.x) enemy.x += enemy.speed;
        if (enemy.x > player.x) enemy.x -= enemy.speed;
        if (enemy.y < player.y) enemy.y += enemy.speed;
        if (enemy.y > player.y) enemy.y -= enemy.speed;

        // Detección de colisión
        if (!player.invincible && player.x < enemy.x + enemy.size && player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size && player.y + player.size > enemy.y) {
            lives--;
            livesEl.textContent = lives;
            if (lives <= 0) {
                endGame(false);
            } else {
                player.invincible = true;
                setTimeout(() => { player.invincible = false; }, 2000);
            }
        }
        draw();
    }

    function countdown() {
        if (gameOver) return;
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame(true);
    }

    function endGame(isWinner) {
        if (gameOver) return; // Evita que la función se ejecute varias veces
        gameOver = true;
        cleanup(); // Usamos nuestra función de limpieza aquí también.

        if (isWinner) {
            onWin(10);
            alert('¡Has ganado!');
            restartBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } else {
            alert('¡Has perdido!');
            restartBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        }
    }
    
    function resetGame() {
        cleanup(); // Limpia todo antes de resetear
        gameOver = true;
        lives = 3;
        timeLeft = 10;
        livesEl.textContent = lives;
        timerEl.textContent = timeLeft;
        player = { x: 50, y: 50, size: 20, speed: 2, dx: 0, dy: 0, invincible: false };
        enemy = { x: 200, y: 200, size: 20, speed: 1 };
        
        restartBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        draw(); // Dibuja el estado inicial
        
        // Vuelve a añadir los listeners a los botones reseteados
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', resetGame);
        // Y el listener de teclado
        addKeyListeners();
    }

    function startGame() {
        if (!gameOver) return; // Evita iniciar un juego que ya está en curso
        gameOver = false;
        startBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
        
        // Guardamos las referencias en nuestro objeto `manager`
        pacmanGameManager.gameInterval = setInterval(update, 20);
        pacmanGameManager.timerInterval = setInterval(countdown, 1000);
    }

    function addKeyListeners() {
        // Definimos la función de manejo de teclas
        pacmanGameManager.keyHandler = (e) => {
            if (gameOver) return;
            if (e.type === 'keydown') {
                if (e.key === 'ArrowRight') player.dx = player.speed;
                else if (e.key === 'ArrowLeft') player.dx = -player.speed;
                else if (e.key === 'ArrowUp') player.dy = -player.speed;
                else if (e.key === 'ArrowDown') player.dy = player.speed;
            } else if (e.type === 'keyup') {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
            }
        };
        // Añadimos los listeners al documento
        document.addEventListener('keydown', pacmanGameManager.keyHandler);
        document.addEventListener('keyup', pacmanGameManager.keyHandler);
    }
    
    // 3. Inicia el juego en un estado limpio
    resetGame();
});