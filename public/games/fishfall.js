// Objeto para gestionar el estado y los listeners del juego entre partidas
const fishfallGameManager = {
    gameInterval: null,
    timerInterval: null,
    itemSpawnInterval: null,
    keyHandler: null,
};

document.addEventListener('fishfallGame', (e) => {
    // --- Elementos del DOM y del Juego ---
    const canvas = document.getElementById('fishfall-canvas');
    const ctx = canvas.getContext('2d');
    let startBtn = document.getElementById('fishfall-start-btn');
    let restartBtn = document.getElementById('fishfall-restart-btn');
    // MODIFICACIÓN: Se cambió el selector para apuntar al botón correcto.
    const exitBtn = document.querySelector('#fishfall-screen .back-btn');
    const livesEl = document.getElementById('fishfall-lives');
    const timerEl = document.getElementById('fishfall-timer');
    const scoreEl = document.getElementById('fishfall-score');
    const { onWin } = e.detail;

    // --- Variables de Estado ---
    let lives, timeLeft, score;
    let gameOver = true;
    let player = { x: canvas.width / 2, y: canvas.height - 30, size: 30, speed: 8 };
    let items = [];
    
    // --- Imágenes ---
    const playerImg = new Image();
    playerImg.src = '/images/pet_actions/cat.png';
    const fishImg = new Image();
    fishImg.src = '/images/pet_actions/fish.png';
    const trashImg = new Image();
    trashImg.src = '/images/pet_actions/trash.png';

    function cleanup() {
        clearInterval(fishfallGameManager.gameInterval);
        clearInterval(fishfallGameManager.timerInterval);
        clearInterval(fishfallGameManager.itemSpawnInterval);
        if (fishfallGameManager.keyHandler) {
            document.removeEventListener('keydown', fishfallGameManager.keyHandler);
        }
    }

    // --- LÓGICA PRINCIPAL ---
    cleanup();
    
    let newStartBtn = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    startBtn = newStartBtn;

    let newRestartBtn = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
    restartBtn = newRestartBtn;

    // --- Funciones del Juego ---
    function createItem() {
        if (gameOver) return;
        items.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            size: 20,
            speed: Math.random() * 2 + 1,
            type: Math.random() > 0.4 ? 'fish' : 'trash'
        });
    }

    function draw() {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (playerImg.complete) ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

        items.forEach(item => {
            const img = item.type === 'fish' ? fishImg : trashImg;
            if (img.complete) ctx.drawImage(img, item.x, item.y, item.size, item.size);
        });
    }

    function update() {
        if (gameOver) return;
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speed;
            if (item.y > canvas.height) {
                items.splice(i, 1);
                continue;
            }
            if (player.x < item.x + item.size && player.x + player.size > item.x &&
                player.y < item.y + item.size && player.y + player.size > item.y) {
                if (item.type === 'trash') {
                    lives--;
                    livesEl.textContent = lives;
                    if (lives <= 0) {
                        endGame(false);
                        return;
                    }
                } else {
                    score++;
                    scoreEl.textContent = score;
                }
                items.splice(i, 1);
            }
        }
        draw();
    }

    function countdown() {
        if (gameOver) return;
        if(timeLeft > 0) timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame(true);
    }

    function endGame(isWinner) {
        if (gameOver) return;
        gameOver = true;
        cleanup();

        exitBtn.classList.remove('hidden'); // Muestra el botón Salir

        if (isWinner) {
            onWin(10 + score);
            alert('¡Has ganado!');
        } else {
            alert('¡Has perdido!');
        }
        restartBtn.classList.remove('hidden');
        startBtn.classList.add('hidden');
    }

    function resetGame() {
        cleanup();
        gameOver = true;
        lives = 3;
        timeLeft = 40;
        score = 0;
        items = [];
        player.x = canvas.width / 2;
        
        livesEl.textContent = lives;
        timerEl.textContent = timeLeft;
        scoreEl.textContent = score;
        
        restartBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        exitBtn.classList.remove('hidden'); // Muestra el botón Salir en el inicio
        
        draw();
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', resetGame);
        addKeyListeners();
    }

    function startGame() {
        if (!gameOver) return;
        gameOver = false;
        
        startBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
        exitBtn.classList.add('hidden'); // Oculta el botón Salir durante la partida
        
        fishfallGameManager.gameInterval = setInterval(update, 20);
        fishfallGameManager.timerInterval = setInterval(countdown, 1000);
        fishfallGameManager.itemSpawnInterval = setInterval(createItem, 1500);
    }

    function addKeyListeners() {
        fishfallGameManager.keyHandler = e => {
            if (gameOver) return;
            if (e.key === 'ArrowRight') player.x += player.speed;
            if (e.key === 'ArrowLeft') player.x -= player.speed;
            if (player.x < 0) player.x = 0;
            if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
        };
        document.addEventListener('keydown', fishfallGameManager.keyHandler);
    }
    
    resetGame();
});