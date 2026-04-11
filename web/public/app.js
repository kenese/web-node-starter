const UP = 'ArrowUp';
const DOWN = 'ArrowDown';
const LEFT = 'ArrowLeft';
const RIGHT = 'ArrowRight';

function delay(speed) {
    return (800 / speed) + 200;
}
const calcIndex = (row, column, width) => ((row * width) + column);

function calcRowCol(id, gridWidth) {
    const row = Math.floor(id / gridWidth);
    const col = id % gridWidth;
    return {row, col};
}

class Snake {
    gem = {};
    snake = {
        sections: [],
        direction: UP,
        speed: 5
    };
    GRID_WIDTH = 9;

    constructor() {
        this.grid = document.querySelector('.grid');
        this.addGem();
        this.addSnake();

        window.addEventListener('keydown', e => {
            if (e.key === UP || e.key === DOWN || e.key === LEFT || e.key === RIGHT) {
                this.snake.direction = e.key;
            }
        })

        this.loop();
    }

    addGem() {
        const image = new Image();
        image.src = './gem-solid-full.svg';
        image.style.color = 'green';
        image.classList.add('image');
        image.classList.add('gem');

        this.gem.img = image;

        image.onload = () => {
            this.randomGemPosition();
        }
    }

    addSnake() {
        const id = Math.floor(Math.random() * this.GRID_WIDTH*this.GRID_WIDTH);

        const {row, col} = calcRowCol(id, this.GRID_WIDTH);
        const rowDirection = row < Math.ceil(this.GRID_WIDTH / 2) ? DOWN : UP;
        const colDirection = col < Math.ceil(this.GRID_WIDTH / 2) ? RIGHT : LEFT;
        const dirs = [rowDirection, colDirection];

        this.snake.direction = dirs[Math.floor(Math.random() * 2)];
        if (!this.snake.direction) {
            throw 'now direction set'
        }

        const img = new Image();
        img.src = './circle-solid-full.svg';
        img.classList.add('image');
        img.classList.add('snake');
        this.snake.img = img;

        this.snake.sections.push({id, img});
        this.grid.querySelector(`[data-cell="${id}"]`).appendChild(img);
    }

    addSnakeSection() {
        const lastSec = this.snake.sections[this.snake.sections.length - 1];
        this.snake.sections.push(lastSec);
    }

    moveSnake() {

        const lastHead = this.snake.sections[0];
        const nextId = this.calculateNext(lastHead.id, this.snake.direction);
        if (isNaN(nextId) || nextId < 0 || nextId > 81) {
            this.grid.style.backgroundColor = 'red';
            this.grid.style.borderColor = 'red';
            return true;
        }

        const newHead = {
            ...this.snake,
            img: this.snake.img.cloneNode(true),
            id: nextId
        };
        this.snake.sections.unshift(newHead);
        const deadTail = this.snake.sections.pop();

        // remove old tail
        this.grid.querySelector(`[data-cell="${deadTail.id}"]`).innerHTML = '';;

        // add new head
        this.grid.querySelector(`[data-cell="${newHead.id}"]`).appendChild(newHead.img);

        lastHead.img.classList.remove('head');
        newHead.img.classList.add('head');
    }

    randomGemPosition() {
        this.gem.id = Math.floor(Math.random() * 81);

        const newCell = this.grid.querySelector(`[data-cell="${this.gem.id}"]`);
        newCell?.appendChild(this.gem.img);
    }

    loop() {
        this.timer = performance.now() + delay(this.snake.speed);

        const animate = () => {
            if (this.timer < performance.now()) {
                this.timer = performance.now() + delay(this.snake.speed);
                this.end = this.moveSnake();
                if (this.snake.sections[0].id === this.gem.id) {
                    this.randomGemPosition();
                    this.addSnakeSection();
                    this.snake.sections[0].img.classList.add('hit');
                }
            }
            if (!this.end) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }

    calculateNext(id, direction) {
        const {row, col} = calcRowCol(id, this.GRID_WIDTH);

        switch (direction) {
            case UP:
                return calcIndex(row - 1, col, this.GRID_WIDTH)
            case DOWN:
                return calcIndex(row + 1, col, this.GRID_WIDTH)
            case LEFT:
                return calcIndex(row, col - 1, this.GRID_WIDTH)
            case RIGHT:
                return calcIndex(row, col + 1, this.GRID_WIDTH)
        }
    }

}

new Snake();


// class Board {
//     IMAGE_SIZE = 50;
//     IMAGE_SPEED = 5;
//     image = {};
//
//     constructor() {
//         this.board = document.querySelector('.board');
//
//         this.addTarget();
//         this.board.addEventListener('mousedown', this.mousedownHandler);
//
//         this.loop();
//
//         return {
//             destroy: () => {
//                 this.board.remove();
//                 this.board.removeEventListener('mousedown', this.mousedownHandler)
//             }
//         }
//     }
//
//     mousedownHandler = (e) => {
//         const image = e.target.closest('.image');
//         if (image) {
//             this.newTargetPosition();
//         } else {
//             this.board.style.backgroundColor = 'lightcoral';
//             this.timerEnd = performance.now() + 50;
//         }
//     }
//
//     addTarget() {
//         const image = new Image();
//         image.src = './target.png';
//         image.classList.add('image');
//
//         this.image.img = image;
//         this.newTargetPosition();
//
//         image.onload = () => {
//             this.board.appendChild(image);
//         }
//     }
//
//     newTargetPosition ()  {
//         this.image.x = Math.random() * (this.board.clientWidth - this.IMAGE_SIZE);
//         this.image.y = Math.random() * (this.board.clientHeight - this.IMAGE_SIZE);
//
//         const angle = Math.random() * Math.PI * 2;
//         this.image.xDir = Math.sin(angle);
//         this.image.yDir = Math.cos(angle);
//
//         this.image.img.style.transform = `translate(${this.image.x}px, ${this.image.y}px)`;
//     }
//
//     updateTargetPosition () {
//         this.image.x = this.image.x + this.image.xDir * this.IMAGE_SPEED;
//         this.image.y = this.image.y + this.image.yDir * this.IMAGE_SPEED;
//
//         if (this.image.x <= 0) {
//             this.image.x = 0;
//             this.image.xDir = -this.image.xDir;
//         } else if (this.image.x >= this.board.clientWidth - this.IMAGE_SIZE) {
//             this.image.x = this.board.clientWidth - this.IMAGE_SIZE;
//             this.image.xDir = -this.image.xDir;
//         }
//
//         if (this.image.y <= 0) {
//             this.image.y = 0;
//             this.image.yDir = -this.image.yDir;
//         } else if (this.image.y >= this.board.clientHeight - this.IMAGE_SIZE) {
//             this.image.y = this.board.clientHeight - this.IMAGE_SIZE;
//             this.image.yDir = -this.image.yDir;
//         }
//
//         this.image.img.style.transform = `translate(${this.image.x}px, ${this.image.y}px)`;
//     }
//
//     loop() {
//         const animate = () => {
//             this.updateTargetPosition();
//             if (this.timerEnd && this.timerEnd < performance.now()) {
//                 this.timerEnd = null;
//                 this.board.style.backgroundColor = 'pink';
//             }
//             requestAnimationFrame(animate);
//         }
//         requestAnimationFrame(animate);
//
//     }
// }
//
// const board = new Board();
//
// setTimeout(() => {
//     board.destroy();
// }, 100000);

