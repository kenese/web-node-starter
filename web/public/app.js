class Game {

    TARGET_SIZE = 50;
    target = {
        speed: 10
    };
    lives = 5;

    constructor() {

        this.board = document.querySelector('.board');
        this.addTarget();

        this.board.addEventListener('mousedown', this.clickListener);

        this.renderLoop()
    }

    destroy() {
        this.board.removeEventListener('mousedown', this.clickListener);
    }

    addTarget() {
        const target = new Image();
        target.classList.add('target');
        target.src = '/target.png';

        target.onload = () => {
            this.board.appendChild(target);
        }
        this.target.img = target;
        this.placeTargetRandomly();
    }

    placeTargetRandomly() {
        this.target.x = Math.random() * (this.board.clientWidth - this.TARGET_SIZE);
        this.target.y = Math.random() * (this.board.clientHeight - this.TARGET_SIZE);

        const angle = Math.random() * Math.PI * 2;
        this.target.xDir = Math.cos(angle)
        this.target.yDir = Math.sin(angle)

        this.target.img.style.transform = `translate(${this.target.x}px,${this.target.y}px)`;
    }

    clickListener = (e) => {
        const target = e.target.closest('.target');
        if (target) {
            this.placeTargetRandomly()
        } else {
            this.placeTargetRandomly()
            this.board.style.backgroundColor = 'pink';
            this.flashTimer = performance.now() + 50;
            this.lives--;
        }
    }

    renderLoop() {
        const animate = () => {
            if (this.lives > 0) {
                if (this.flashTimer < performance.now()) {
                    this.board.style.backgroundColor = 'lightskyblue';
                }
                this.moveTarget();
                requestAnimationFrame(animate);
            } else {
                this.destroy();
            }
        }
        requestAnimationFrame(animate);
    }

    moveTarget() {
        this.target.x = this.target.x + this.target.xDir * this.target.speed;
        this.target.y = this.target.y + this.target.yDir * this.target.speed;

        if (this.target.x <= 0) {
            this.target.x = 0;
            this.target.xDir = Math.abs(this.target.xDir);
        } else if (this.target.x >= this.board.clientWidth - this.TARGET_SIZE) {
            this.target.x = this.board.clientWidth  - this.TARGET_SIZE;
            this.target.xDir = -Math.abs(this.target.xDir);
        }
        if (this.target.y <= 0) {
            this.target.y = 0;
            this.target.yDir = Math.abs(this.target.yDir);
        } else if (this.target.y >= this.board.clientHeight - this.TARGET_SIZE) {
            this.target.y = this.board.clientHeight  - this.TARGET_SIZE;
            this.target.yDir = -Math.abs(this.target.yDir);
        }
        this.target.img.style.transform = `translate(${this.target.x}px,${this.target.y}px)`;
    }
}

new Game();