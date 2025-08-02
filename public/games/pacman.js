document.addEventListener('pacmanGame', (e) => {
    const canvas = document.getElementById('pacman-canvas');
    const ctx = canvas.getContext('2d');
    const livesEl = document.getElementById('pacman-lives');
    const timerEl = document.getElementById('pacman-timer');
    const restartBtn = document.getElementById('pacman-restart-btn');
    const { onWin } = e.detail;

    let lives, timeLeft, gameInterval, timerInterval;
    let player = { x: 50, y: 50, size: 20, speed: 2, dx: 0, dy: 0, invincible: false };
    let enemy = { x: 200, y: 200, size: 20, speed: 1 };
    
    const playerImg = new Image();
    playerImg.src = '/images/pet_actions/cat.png';
    const enemyImg = new Image();
    enemyImg.src = '/images/pet_actions/dog.png';

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Player blinks when invincible
        ctx.globalAlpha = player.invincible ? (Math.floor(Date.now() / 200) % 2 === 0 ? 1 : 0.5) : 1.0;
        ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
        ctx.globalAlpha = 1.0;

        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.size, enemy.size);
    }

    function update() {
        player.x += player.dx;
        player.y += player.dy;

        if (player.x < 0) player.x = 0;
        if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
        if (player.y < 0) player.y = 0;
        if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

        if (enemy.x < player.x) enemy.x += enemy.speed;
        if (enemy.x > player.x) enemy.x -= enemy.speed;
        if (enemy.y < player.y) enemy.y += enemy.speed;
        if (enemy.y > player.y) enemy.y -= enemy.speed;

        if (!player.invincible && player.x < enemy.x + enemy.size && player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size && player.y + player.size > enemy.y) {
            
            lives--;
            livesEl.textContent = lives;
            player.invincible = true;
            setTimeout(() => { player.invincible = false; }, 2000); // 2 seconds of invincibility

            if (lives <= 0) {
                endGame(false);
            }
        }
        draw();
    }

    function countdown() {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame(true);
        }
    }

    function endGame(isWinner) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        if (isWinner) {
            onWin();
        } else {
            alert('¡Has perdido!');
            restartBtn.classList.remove('hidden');
        }
    }
    
    function startGame() {
        lives = 3;
        timeLeft = 120;
        livesEl.textContent = lives;
        timerEl.textContent = timeLeft;
        player.x = 50;
        player.y = 50;
        enemy.x = 200;
        enemy.y = 200;
        player.invincible = false;
        restartBtn.classList.add('hidden');
        
        gameInterval = setInterval(update, 20);
        timerInterval = setInterval(countdown, 1000);
    }

    const keyHandler = (e) => {
        if (e.type === 'keydown') {
            if (e.key === 'ArrowRight') player.dx = player.speed;
            if (e.key === 'ArrowLeft') player.dx = -player.speed;
            if (e.key === 'ArrowUp') player.dy = -player.speed;
            if (e.key === 'ArrowDown') player.dy = player.speed;
        } else if (e.type === 'keyup') {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyHandler);
    restartBtn.addEventListener('click', startGame);
    document.addEventListener('endGame', () => {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('keyup', keyHandler);
    }, { once: true });

    startGame();
});