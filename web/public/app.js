class Pong {
    BALL_SIZE = 20;
    BALL_INITIAL_SPEED = 10;
    PLAYER_WIDTH = 6;
    PLAYER_HEIGHT = 80;

    ball = {};
    player = {};

    constructor() {
        this.board = document.querySelector('.board');

        this.addBall();
        this.placeBallRandomly();
        this.addPlayer();

        window.addEventListener('mousemove', this.playerListener);

        this.gameLoop();
    }
    destroy() {
        window.removeEventListener('mousemove', this.playerListener);
    }

    addBall() {
        const ball = new Image();
        ball.src = './circle-solid-full.svg';
        ball.classList.add('ball');
        ball.onload = () => {
            this.board.appendChild(ball);
        }
        this.ball.img = ball;
        this.ball.speed = this.BALL_INITIAL_SPEED
    }

    placeBallRandomly(board, BALL_SIZE) {
        this.ball.x = Math.random() * (this.board.clientWidth - this.BALL_SIZE);
        this.ball.y = Math.random() * (this.board.clientHeight - this.BALL_SIZE);

        // todo: these ratios arent quite right
        this.ball.xDir = Math.random() * 2 - 1;
        this.ball.yDir = Math.random() * 2 - 1;

        this.ball.img.style.transform = `translate(${this.ball.x}px,${this.ball.y}px)`;
    }

    addPlayer() {
        const player = document.createElement('div');
        player.classList.add('player');
        this.player.img = player;
        this.board.appendChild(player);
    }

    gameLoop() {
        const animate = () => {
            this.renderBall();
            this.renderPlayer();
            this.detectCollisions();
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    renderBall() {
        this.ball.x = this.ball.x + this.ball.xDir * this.ball.speed;
        this.ball.y = this.ball.y + this.ball.yDir * this.ball.speed;

        if (this.ball.x <= 0) {
            this.ball.x = 0;
            this.ball.xDir = Math.abs(this.ball.xDir);
        } else if (this.ball.x >= this.board.clientWidth - this.BALL_SIZE) {
            this.ball.x = this.board.clientWidth - this.BALL_SIZE;
            this.ball.xDir = -Math.abs(this.ball.xDir);
        }

        if (this.ball.y <= 0) {
            this.ball.y = 0;
            this.ball.yDir = Math.abs(this.ball.yDir);
        } else if (this.ball.y >= this.board.clientHeight - this.BALL_SIZE) {
            this.ball.y = this.board.clientHeight - this.BALL_SIZE;
            this.ball.yDir = -Math.abs(this.ball.yDir);
        }

        this.ball.img.style.transform = `translate(${this.ball.x}px,${this.ball.y}px)`;
    }

    renderPlayer() {
        const bottom = this.board.clientHeight;
        const right = this.board.clientWidth;

        if (this.player.x < 0) {
            this.player.x = 0;
        }
        if (this.player.y - 40 < 0) {
            this.player.y = 40;
        }
        if (this.player.x + 3 > right) {
            this.player.x = right - 3;
        }
        if (this.player.y > bottom - 40) {
            this.player.y = bottom - 40;
        }
        const y = this.player.y - 40;
        const x = this.player.x - 3;
        this.player.img.style.transform = `translate(${x}px,${y}px)`;
    }

    playerListener = (e) => {
        const rect = this.board.getBoundingClientRect();
        this.player.x = e.clientX - rect.left; // X relative to box
        this.player.y = e.clientY - rect.top;  // Y relative to box
    }

    detectCollisions() {
        const ballSides = this.getSides(this.ball, this.BALL_SIZE, this.BALL_SIZE);
        const playerSides = this.getSides(this.player, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
``
        const playerTop = playerSides.top - 40;
        const playerBottom = playerSides.bottom - 40;

        if (
            playerTop <= ballSides.bottom &&
            playerBottom >= ballSides.top &&
            playerSides.left <= ballSides.right &&
            playerSides.right >= ballSides.left
        ) {
            const ballCentre = (ballSides.top + ballSides.bottom) / 2;
            const playerCentre = (playerTop + playerBottom) / 2;

            const yAdjust = (ballCentre - playerCentre) / this.PLAYER_HEIGHT;

            this.ball.xDir = Math.abs(this.ball.xDir);

            if (Math.abs(this.ball.yDir + yAdjust) < 0.5) {
                this.ball.yDir = this.ball.yDir + yAdjust;
            }
        }
    }

    getSides(element, width, height) {
        const left = element.x;
        const right = element.x + width;
        const top = element.y;
        const bottom = element.y + height;
        return {
            left,
            right,
            top,
            bottom
        }
    }
}

new Pong();