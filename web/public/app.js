class Board {

    IMAGE_WIDTH = 50;
    IMAGE_HEIGHT = 50;
    IMAGE_SPEED = 5;
    score = 0;

    images = [];

    constructor() {
        const el = document.querySelector('.board');
        if (el) {
            this.board = el;
            this.boardWidth = el.clientWidth;
            this.boardHeight = el.clientHeight;
            this.scoreElement = document.querySelector('.score');

            this.createImage();

            window.addEventListener('mousedown', (e) => {
                const img = e.target.closest('img');
                if (img) {
                    this.removeImage(img);
                    this.createImage();
                    this.createImage();
                    this.score++;
                } else {
                    this.flashBoardRed();
                    this.score--;
                }
                this.scoreElement.textContent = 'Score: ' + this.score;
            });

            this.loop()

        } else {
            throw new Error('Canna find the board');
        }

    }

    createImage() {
        const img = new Image();
        img.src = "/target.png";
        img.classList.add('image');
        const imageX = Math.floor(Math.random() * (this.boardWidth - this.IMAGE_WIDTH));
        const imageY = Math.floor(Math.random() * (this.boardHeight - this.IMAGE_HEIGHT));
        const imageDirectionX = Math.random() * 2 - 1;
        const imageDirectionY = Math.random() * 2 - 1;

        img.style.transform = `translate(${imageX}px, ${imageY}px)`

        // this.image.style.left = left + 'px';
        // this.image.style.top = top + 'px';

        img.onload = () => {
            console.log("Image loaded successfully!");
        };
        img.onerror = () => {
            throw new Error("Canna find the image");
        };
        this.images.push({
            img,
            imageX,
            imageY,
            imageDirectionX,
            imageDirectionY,

        });
        this.board.appendChild(img);
    }

    removeImage(img) {
        const image = this.images.find(image => image.img === img);

        this.images.splice(this.images.indexOf(image), 1);
        this.board.removeChild(img);
    }

    flashBoardRed() {
        this.board.style.backgroundColor = 'red';

        setTimeout(() => {
            this.board.style.backgroundColor = '';
        }, 50);
    }

    loop() {
        const animate = () => {
            this.moveTarget();
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    moveTarget() {

        this.images.forEach((image) => {

            if (image.imageX <= 0 || image.imageX > this.boardWidth - this.IMAGE_WIDTH) {
                image.imageDirectionX = -image.imageDirectionX;
            }
            if (image.imageY <= 0 || image.imageY > this.boardHeight - this.IMAGE_HEIGHT) {
                image.imageDirectionY = -image.imageDirectionY;
            }

            image.imageX = image.imageX + image.imageDirectionX * this.IMAGE_SPEED;
            image.imageY = image.imageY + image.imageDirectionY * this.IMAGE_SPEED;

            image.img.style.transform = `translate(${image.imageX}px, ${image.imageY}px)`
        })
    }
}

const thing = new Board();


