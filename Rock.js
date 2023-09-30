class Rock {
  constructor(x, y, height, width, miniRockSize = 10) {
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.miniRockSize = miniRockSize;
    this.miniRocks = this.generateMiniRocks();
  }

  generateMiniRocks() {
    const miniRocks = [];
    for (let y = 0; y < this.height; y += this.miniRockSize) {
      for (let x = 0; x < this.width; x += this.miniRockSize) {
        const grayShade = Math.floor(Math.random() * 128);
        const brownShade = Math.floor(Math.random() * 128);
        miniRocks.push({ x: this.x + x, y: this.y + y, color: `rgb(${grayShade}, ${brownShade}, ${brownShade})` });
      }
    }
    return miniRocks;
  }

  draw() {
    this.miniRocks.forEach((miniRock) => {
      ctx.fillStyle = miniRock.color;
      ctx.fillRect(
        miniRock.x,
        miniRock.y,
        this.miniRockSize,
        this.miniRockSize
      );
    });
  }

  update() {
    this.y += 1;
    this.miniRocks.forEach((miniRock) => {
      miniRock.y += 1;
    });
    if (this.y > canvas.height) {
      this.y = -this.height;
      this.miniRocks = this.generateMiniRocks();
    }
  }

  checkCollision(ship) {
    return this.miniRocks.some(
      (miniRock) =>
        miniRock.x < ship.x + ship.width &&
        miniRock.x + this.miniRockSize > ship.x &&
        Rock.y < ship.y + ship.height &&
        miniRock.y + this.miniRockSize > ship.y
    );
  }
}
