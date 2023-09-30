// Partikelklasse
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = this.getRandom(1, 7);
    this.speedX = this.getRandom(-1.5, 0.5);
    this.speedY = this.getRandom(-1.5, 1.5);
    this.color = color;
  }

  getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.1) this.size -= 0.1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, TWO_PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}