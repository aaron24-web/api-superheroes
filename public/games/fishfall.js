document.addEventListener('fishfallGame', (e) => {
    const canvas = document.getElementById('fishfall-canvas');
    const ctx = canvas.getContext('2d');
    const livesEl = document.getElementById('fishfall-lives');
    const timerEl = document.getElementById('fishfall-timer');
    const scoreEl = document.getElementById('fishfall-score');
    const restartBtn = document.getElementById('fishfall-restart-btn');
    const { onWin } = e.detail;

    let lives, timeLeft, score, gameInterval, timerInterval;
    let player = { x: canvas.width / 2, y: canvas.height - 30, size: 30, speed: 8 };
    let items = [];
    
    const playerImg = new Image();
    playerImg.src = '/images/pet_actions/cat.png';
    const fishImg = new Image();
    fishImg.src = '/images/pet_actions/fish.png';
    const trashImg = new Image();
    trashImg.src = '/images/pet_actions/trash.png';
    let itemSpawnCounter = 0;

    function createItem() {
        const isFish = Math.random() > 0.4;
        items.push({
            x: Math.random() * (canvas.width - 20),
            y: -20, size: 20,
            speed: Math.random() * 2 + 1,
            type: isFish ? 'fish' : 'trash'
        });
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

        items.forEach((item, index) => {
            item.y += item.speed;
            const img = item.type === 'fish' ? fishImg : trashImg;
            ctx.drawImage(img, item.x, item.y, item.size, item.size);

            if (item.y > canvas.height) items.splice(index, 1);

            if (player.x < item.x + item.size && player.x + player.size > item.x &&
                player.y < item.y + item.size && player.y + player.size > item.y) {
                if (item.type === 'trash') {
                    lives--;
                    livesEl.textContent = lives;
                    if (lives <= 0) {
                        endGame(false);
                    }
                } else {
                    score++;
                    scoreEl.textContent = score;
                }
                items.splice(index, 1);
            }
        });
    }

    function countdown() {
        timeLeft--;
        timerEl.textContent = timeLeft;
        itemSpawnCounter++;
        if (itemSpawnCounter > 1) { // Items fall more frequently
            createItem();
            itemSpawnCounter = 0;
        }
        if (timeLeft <= 0) {
            endGame(true);
        }
    }

     function endGame(isWinner) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        if (isWinner) {
            onWin(score); // <-- Pasa el puntaje (los peces atrapados) a la función de victoria
        } else {
            alert('¡Has perdido!');
            restartBtn.classList.remove('hidden');
        }
    }

    function startGame() {
        lives = 3;
        timeLeft = 50; // 50 seconds game time
        score = 0;
        items.length = 0;
        player.x = canvas.width / 2;
        livesEl.textContent = lives;
        timerEl.textContent = timeLeft;
        scoreEl.textContent = score;
        restartBtn.classList.add('hidden');
        gameInterval = setInterval(update, 20);
        timerInterval = setInterval(countdown, 1000);
    }

    const keyHandler = e => {
        if (e.key === 'ArrowRight') player.x += player.speed;
        if (e.key === 'ArrowLeft') player.x -= player.speed;
        if (player.x < 0) player.x = 0;
        if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    };

    document.addEventListener('keydown', keyHandler);
    restartBtn.addEventListener('click', startGame);
    document.addEventListener('endGame', () => {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        document.removeEventListener('keydown', keyHandler);
    }, { once: true });
    
    startGame();
});