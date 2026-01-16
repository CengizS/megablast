export default class Asteroid {
  constructor({ x, y, radius, speed, rotation, sprite, ctx, canvas, twoPi }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.rotation = rotation;
    this.sprite = sprite;
    this.ctx = ctx;
    this.canvas = canvas;
    this.twoPi = twoPi;
    this.direction = Math.random() * 2 - 1;
  }

  update(dtScale = 1) {
    this.rotate(dtScale);
    this.translate(dtScale);
    this.wrap();
  }

  rotate(dtScale) {
    this.rotation += 0.01 * dtScale;
    if (this.rotation > this.twoPi) this.rotation = 0;
  }

  translate(dtScale) {
    this.x += this.direction * this.speed * dtScale;
    this.y += this.speed * dtScale;
  }

  wrap() {
    if (this.x < -this.radius) this.x = this.canvas.width + this.radius;
    else if (this.x > this.canvas.width + this.radius) this.x = -this.radius;

    if (this.y < -this.radius) this.y = this.canvas.height + this.radius;
    else if (this.y > this.canvas.height + this.radius) this.y = -this.radius;
  }

  draw() {
    this.transform(() => {
      this.ctx.drawImage(
        this.sprite,
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );
    });
  }

  transform(drawFunc) {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);
    drawFunc();
    this.ctx.restore();
  }
}
