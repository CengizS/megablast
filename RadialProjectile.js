class RadialProjectile {
  constructor(x, y, speedX, speedY, dimension = 3) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.width = dimension;
    this.height = dimension;
    this.withTrails = false;
    this.trails = [{ x: this.x, y: this.y, opacity: 1 }];
  }

  update() {
    if (this.withTrails) {
      this.trails.push({ x: this.x, y: this.y, opacity: 1 });
      if (this.trails.length > 40) this.trails.shift();
      this.trails = this.trails.map((t) => ({
        ...t,
        opacity: t.opacity * 0.9,
      }));
    }
    this.x += this.speedX;
    this.y += this.speedY;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 0, 1)";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();

    if (!this.withTrails) return;

    this.trails.forEach((trail, i) => {
      ctx.strokeStyle = `rgba(255, 255, 0, ${trail.opacity})`;
      ctx.beginPath();
      if (i < this.trails.length - 1) {
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(this.trails[i + 1].x, this.trails[i + 1].y);
      }
      ctx.stroke();
    });
  }
}
