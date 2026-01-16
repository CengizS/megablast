// Partikelklasse
export default class Particle {
  constructor({
    x,
    y,
    color,
    ctx,
    twoPi,
    sizeRange,
    speedRange,
    shrinkRate,
  }) {
    this.x = x;
    this.y = y;
    const sizeMin = sizeRange ? sizeRange[0] : 1;
    const sizeMax = sizeRange ? sizeRange[1] : 7;
    this.size = this.getRandom(sizeMin, sizeMax);
    const speedXRange = speedRange ? speedRange.x : [-1.5, 0.5];
    const speedYRange = speedRange ? speedRange.y : [-1.5, 1.5];
    this.speedX = this.getRandom(speedXRange[0], speedXRange[1]);
    this.speedY = this.getRandom(speedYRange[0], speedYRange[1]);
    this.color = color;
    this.ctx = ctx;
    this.twoPi = twoPi;
    this.shrinkRate = shrinkRate || 0.1;
  }

  getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  update(dtScale = 1) {
    this.x += this.speedX * dtScale;
    this.y += this.speedY * dtScale;
    if (this.size > 0.1) this.size -= this.shrinkRate * dtScale;
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
