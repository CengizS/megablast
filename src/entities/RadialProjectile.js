export default class RadialProjectile {
  constructor({ x, y, speedX, speedY, dimension = 3, ctx }) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.width = dimension;
    this.height = dimension;
    this.ctx = ctx;
    this.withTrails = false;
    this.trails = [{ x: this.x, y: this.y, opacity: 1 }];
  }

  update(dtScale = 1) {
    if (this.withTrails) {
      this.trails.push({ x: this.x, y: this.y, opacity: 1 });
      if (this.trails.length > 40) this.trails.shift();
      this.trails = this.trails.map((t) => ({
        ...t,
        opacity: t.opacity * 0.9,
      }));
    }
    this.x += this.speedX * dtScale;
    this.y += this.speedY * dtScale;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(255, 255, 0, 1)";
    this.ctx.fill();
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
    this.ctx.closePath();

    if (!this.withTrails) return;

    this.trails.forEach((trail, i) => {
      this.ctx.strokeStyle = `rgba(255, 255, 0, ${trail.opacity})`;
      this.ctx.beginPath();
      if (i < this.trails.length - 1) {
        this.ctx.moveTo(trail.x, trail.y);
        this.ctx.lineTo(this.trails[i + 1].x, this.trails[i + 1].y);
      }
      this.ctx.stroke();
    });
  }
}
