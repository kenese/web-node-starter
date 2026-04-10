class BoardDOM {

  IMAGE_WIDTH = 50;
  IMAGE_HEIGHT = 50;
  IMAGE_SPEED = 1;
  score = 0;

  images = [];

  constructor() {
    this.initBoard();
    this.createImage();
    this.setupListeners();
    this.loop();
  }

  setupListeners() {
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
    window.addEventListener('resize', () => {
      this.setBoardSize();
    });
  }

  initBoard() {
    this.board = document.querySelector('.board');
    this.scoreElement = document.querySelector('.score');

    if (!this.board) {
      throw new Error('Canna find the board');
    }

    if (!this.scoreElement) {
      throw new Error('Canna find the score element');
    }

    this.setBoardSize();
  }

  setBoardSize() {
    this.boardWidth = this.board.clientWidth;
    this.boardHeight = this.board.clientHeight;

    for (const i of this.images) {
      i.imageX = Math.min(Math.max(0, i.imageX), this.boardWidth - this.IMAGE_WIDTH);
      i.imageY = Math.min(Math.max(0, i.imageY), this.boardHeight - this.IMAGE_HEIGHT);
    }
  }

  createImage() {
    const img = new Image();
    img.src = "/target.png";
    img.classList.add('image');
    const imageX = Math.floor(Math.random() * (this.boardWidth - this.IMAGE_WIDTH));
    const imageY = Math.floor(Math.random() * (this.boardHeight - this.IMAGE_HEIGHT));

    // uses trigonometry to get a random direction rather than independent random numbers between -1 and 1 for x and y
    const angle = Math.random() * Math.PI * 2;
    const imageDirectionX = Math.cos(angle);
    const imageDirectionY = Math.sin(angle);

    // old way
    // const imageDirectionX = Math.random() * 2 - 1;
    // const imageDirectionY = Math.random() * 2 - 1;

    img.style.transform = `translate(${imageX}px, ${imageY}px)`

    // less performant
    // this.image.style.left = left + 'px';
    // this.image.style.top = top + 'px';

    img.onload = () => {
      this.images.push({
        img,
        imageX,
        imageY,
        imageDirectionX,
        imageDirectionY,

      });
      this.board.appendChild(img);
    };
    img.onerror = () => {
      console.error("Canna find the image", img);
    };
  }

  removeImage(img) {
    const idx = this.images.findIndex((entry) => entry.img === img);
    if (idx === -1) return;

    this.images.splice(idx, 1);
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
    const maxX = this.boardWidth - this.IMAGE_WIDTH;
    const maxY = this.boardHeight - this.IMAGE_HEIGHT;

    this.images.forEach((image) => {
      image.imageX += image.imageDirectionX * this.IMAGE_SPEED;
      image.imageY += image.imageDirectionY * this.IMAGE_SPEED;

      if (image.imageX < 0) {
        // bounce off the left side (set to edge (0) and force positive direction - away from left wall)
        image.imageX = 0;
        image.imageDirectionX = Math.abs(image.imageDirectionX);
      } else if (image.imageX > maxX) {
        // bounce off the right side (set to edge (maxX) and force negative direction - away from right wall)
        image.imageX = maxX;
        image.imageDirectionX = -Math.abs(image.imageDirectionX);
      }

      if (image.imageY < 0) {
        // bounce off the top side (set to edge (0) and force positive direction - away from top wall)
        image.imageY = 0;
        image.imageDirectionY = Math.abs(image.imageDirectionY);
      } else if (image.imageY > maxY) {
        // bounce off the bottom side (set to edge (maxY) and force negative direction - away from bottom wall)
        image.imageY = maxY;
        image.imageDirectionY = -Math.abs(image.imageDirectionY);
      }

      image.img.style.transform = `translate(${image.imageX}px, ${image.imageY}px)`;
    });
  }
}



class BoardCanvas {
  IMAGE_WIDTH = 50;
  IMAGE_HEIGHT = 50;
  IMAGE_SPEED = 1;
  score = 0;
  targets = [];
  flashUntil = 0;
  dpr = 1;

  constructor() {
    this.initBoard();
    this.initSprite();
  }

  initBoard() {
    this.board = document.querySelector('.board');
    this.canvas = document.querySelector('.game-canvas');
    this.scoreElement = document.querySelector('.score');
    if (!this.board) {
      throw new Error('Canna find the board');
    }
    if (!this.canvas) {
      throw new Error('Canna find the canvas');
    }
    if (!this.scoreElement) {
      throw new Error('Canna find the score element');
    }
    this.ctx = this.canvas.getContext('2d');
  }

  setBoardSize() {
    this.boardWidth = this.board.clientWidth;
    this.boardHeight = this.board.clientHeight;
    this.dpr = window.devicePixelRatio || 1;

    const w = Math.max(1, Math.round(this.boardWidth * this.dpr));
    const h = Math.max(1, Math.round(this.boardHeight * this.dpr));
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${this.boardWidth}px`;
    this.canvas.style.height = `${this.boardHeight}px`;

    for (const t of this.targets) {
      t.x = Math.min(Math.max(0, t.x), this.boardWidth - this.IMAGE_WIDTH);
      t.y = Math.min(Math.max(0, t.y), this.boardHeight - this.IMAGE_HEIGHT);
    }
  }

  initSprite() {
    this.sprite = new Image();
    this.sprite.src = '/target.png';
    this.sprite.onerror = () => {
      console.error('Canna find the image', this.sprite);
    };

    const start = () => {
      this.setBoardSize();
      this.createTarget();
      this.setupListeners();
      this.loop();
    };

    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      start();
    } else {
      this.sprite.addEventListener('load', start, { once: true });
    }
  }

  setupListeners() {
    this.board.addEventListener('mousedown', (e) => {
      if (!this.targets.length) return;
      if (e.target.closest('.score')) {
        this.flashBoardRed();
        this.score--;
        this.scoreElement.textContent = 'Score: ' + this.score;
        return;
      }
      const { mx, my } = this.canvasCoordsFromEvent(e);
      if (mx == null) {
        this.flashBoardRed();
        this.score--;
        this.scoreElement.textContent = 'Score: ' + this.score;
        return;
      }
      const idx = this.hitTest(mx, my);
      if (idx !== -1) {
        this.targets.splice(idx, 1);
        this.createTarget();
        this.createTarget();
        this.score++;
      } else {
        this.flashBoardRed();
        this.score--;
      }
      this.scoreElement.textContent = 'Score: ' + this.score;
    });
    window.addEventListener('resize', () => {
      this.setBoardSize();
    });
  }

  canvasCoordsFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { mx: null, my: null };
    const scaleX = this.boardWidth / rect.width;
    const scaleY = this.boardHeight / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    if (mx < 0 || my < 0 || mx > this.boardWidth || my > this.boardHeight) {
      return { mx: null, my: null };
    }
    return { mx, my };
  }
  hitTest(mx, my) {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (
        mx >= t.x &&
        mx <= t.x + this.IMAGE_WIDTH &&
        my >= t.y &&
        my <= t.y + this.IMAGE_HEIGHT
      ) {
        return i;
      }
    }
    return -1;
  }
  createTarget() {
    const imageX = Math.floor(Math.random() * (this.boardWidth - this.IMAGE_WIDTH));
    const imageY = Math.floor(Math.random() * (this.boardHeight - this.IMAGE_HEIGHT));
    const angle = Math.random() * Math.PI * 2;
    const imageDirectionX = Math.cos(angle);
    const imageDirectionY = Math.sin(angle);
    this.targets.push({
      x: imageX,
      y: imageY,
      dx: imageDirectionX,
      dy: imageDirectionY,
    });
  }
  flashBoardRed() {
    this.flashUntil = performance.now() + 50;
  }
  loop() {
    const animate = () => {
      this.moveTargets();
      this.draw();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  moveTargets() {
    for (const t of this.targets) {
      if (t.x <= 0 || t.x >= this.boardWidth - this.IMAGE_WIDTH) {
        t.dx = -t.dx;
      }
      if (t.y <= 0 || t.y >= this.boardHeight - this.IMAGE_HEIGHT) {
        t.dy = -t.dy;
      }
      t.x += t.dx * this.IMAGE_SPEED;
      t.y += t.dy * this.IMAGE_SPEED;
    }
  }
  draw() {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const bg = performance.now() < this.flashUntil ? 'red' : 'pink';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.boardWidth, this.boardHeight);
    for (const t of this.targets) {
      ctx.drawImage(
        this.sprite,
        t.x,
        t.y,
        this.IMAGE_WIDTH,
        this.IMAGE_HEIGHT,
      );
    }
  }
}
// new BoardCanvas();
new BoardDOM();


