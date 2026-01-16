export default class Rock {
  constructor({ x, y, height, width, miniRockSize = 10, ctx, canvas }) {
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.miniRockSize = miniRockSize;
    this.ctx = ctx;
    this.canvas = canvas;
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
      this.ctx.fillStyle = miniRock.color;
      this.ctx.fillRect(
        miniRock.x,
        miniRock.y,
        this.miniRockSize,
        this.miniRockSize
      );
    });
  }

  update(dtScale = 1) {
    this.y += 1 * dtScale;
    this.miniRocks.forEach((miniRock) => {
      miniRock.y += 1 * dtScale;
    });
    if (this.y > this.canvas.height) {
      this.y = -this.height;
      this.miniRocks = this.generateMiniRocks();
    }
  }

  checkCollision(ship) {
    return this.miniRocks.some(
      (miniRock) =>
        miniRock.x < ship.x + ship.width &&
        miniRock.x + this.miniRockSize > ship.x &&
        miniRock.y < ship.y + ship.height &&
        miniRock.y + this.miniRockSize > ship.y
    );
  }
}
