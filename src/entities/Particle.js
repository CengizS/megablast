// Partikelklasse
export default class Particle {
  constructor({ x, y, color, ctx, twoPi }) {
    this.x = x;
    this.y = y;
    this.size = this.getRandom(1, 7);
    this.speedX = this.getRandom(-1.5, 0.5);
    this.speedY = this.getRandom(-1.5, 1.5);
    this.color = color;
    this.ctx = ctx;
    this.twoPi = twoPi;
  }

  getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  update(dtScale = 1) {
    this.x += this.speedX * dtScale;
    this.y += this.speedY * dtScale;
    if (this.size > 0.1) this.size -= 0.1 * dtScale;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, this.twoPi);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
}
