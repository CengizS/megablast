class Galaxy {
  constructor(x, y, size, speed, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.theta = 0; // Initial angle
    this.rotation = Math.atan2(Math.random() * TWO_PI, Math.random() * TWO_PI);
    this.color = color; // colors for distance representation
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size / 10, this.size / 20); // scaling factor

    ctx.beginPath();
    let angle, xOffset, yOffset;
    for (let i = 0; i < 720; i++) {
      angle = 0.05 * i;
      xOffset = angle * Math.cos(angle + this.theta);
      yOffset = angle * Math.sin(angle + this.theta);

      if (i == 0) {
        ctx.moveTo(xOffset, yOffset);
      } else {
        ctx.lineTo(xOffset, yOffset);
      }
    }

    ctx.strokeStyle = this.color; // color representation of distance
    ctx.stroke();
    ctx.restore();
  }

  update() {
    this.y += this.speed;
    this.theta += 0.01;

    if (this.y > canvas.height) {
      this.x = Math.random() * canvas.width;
      this.y = 0;

      let sizeIndex = Math.floor(Math.random() * galaxySizes.length);
      this.size = galaxySizes[sizeIndex];
      this.speed = galaxySpeedBase + this.size / 5;

      let colorIndex = Math.floor(Math.random() * galaxyColors.length);
      this.color = galaxyColors[colorIndex];
    }
  }
}