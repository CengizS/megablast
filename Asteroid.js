class Asteroid {
  constructor(x, y, radius, speed, rotation, sprite) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.rotation = rotation;
    this.sprite = sprite;
    this.direction = Math.random() * 2 - 1;
  }

  update() {
    this.rotate();
    this.translate();
    this.wrap();
    this.draw();
  }

  rotate() {
    this.rotation += 0.01;
    if (this.rotation > TWO_PI) this.rotation = 0;
  }

  translate() {
    this.x += this.direction * this.speed;
    this.y += this.speed;
  }

  wrap() {
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    else if (this.x > canvas.width + this.radius) this.x = -this.radius;

    if (this.y < -this.radius) this.y = canvas.height + this.radius;
    else if (this.y > canvas.height + this.radius) this.y = -this.radius;
  }

  draw() {
    this.transform(() => {
      ctx.drawImage(
        this.sprite,
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );
    });
  }

  transform(drawFunc) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    drawFunc();
    ctx.restore();
  }
}
