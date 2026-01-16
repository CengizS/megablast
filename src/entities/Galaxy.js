import { fastCos, fastSin } from "../utils/math.js";

export default class Galaxy {
  constructor({
    x,
    y,
    size,
    speed,
    color,
    ctx,
    canvas,
    twoPi,
    galaxySizes,
    galaxyColors,
    galaxySpeedBase,
    steps,
    depth,
    drift,
    scale,
  }) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.theta = 0; // Initial angle
    this.rotation = Math.random() * twoPi;
    this.color = color; // colors for distance representation
    this.ctx = ctx;
    this.canvas = canvas;
    this.galaxySizes = galaxySizes;
    this.galaxyColors = galaxyColors;
    this.galaxySpeedBase = galaxySpeedBase;
    this.steps = steps;
    this.depthRange = depth;
    this.depth =
      this.depthRange.min +
      Math.random() * (this.depthRange.max - this.depthRange.min);
    this.drift = drift;
    this.scale = scale;
    this.phase = Math.random() * twoPi;
    this.baseX = x;
    this.baseSpeed = speed;
  }

  static getPoints(steps) {
    if (!Galaxy.pointsCache) {
      Galaxy.pointsCache = new Map();
    }
    if (Galaxy.pointsCache.has(steps)) {
      return Galaxy.pointsCache.get(steps);
    }

    const points = [];
    for (let i = 0; i < steps; i++) {
      const angle = 0.05 * i;
      points.push({
        x: angle * fastCos(angle),
        y: angle * fastSin(angle),
      });
    }

    Galaxy.pointsCache.set(steps, points);
    return points;
  }

  draw() {
    const points = Galaxy.getPoints(this.steps);
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation + this.theta);
    const scaleX = (this.size / this.scale.xDiv) * this.depth;
    const scaleY = (this.size / this.scale.yDiv) * this.depth;
    this.ctx.scale(scaleX, scaleY); // scaling factor

    this.ctx.beginPath();
    if (points.length > 0) {
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
    }
    this.ctx.strokeStyle = this.color; // color representation of distance
    this.ctx.globalAlpha = 0.4 + 0.6 * this.depth;
    this.ctx.lineWidth = Math.max(0.5, 1 / Math.max(scaleX, scaleY));
    this.ctx.stroke();
    this.ctx.restore();
  }

  update(dtScale = 1) {
    this.y += this.baseSpeed * this.depth * dtScale;
    this.theta += 0.01 * dtScale;
    this.phase += this.drift.wobbleSpeed * dtScale * 0.01;
    this.x =
      this.baseX +
      Math.sin(this.phase) * this.drift.amplitude * this.depth +
      this.drift.speed * dtScale * 0.1 * (this.depth - 0.5);

    if (this.y > this.canvas.height) {
      this.baseX = Math.random() * this.canvas.width;
      this.x = this.baseX;
      this.y = 0;

      let sizeIndex = Math.floor(Math.random() * this.galaxySizes.length);
      this.size = this.galaxySizes[sizeIndex];
      this.baseSpeed = this.galaxySpeedBase + this.size / 5;

      let colorIndex = Math.floor(Math.random() * this.galaxyColors.length);
      this.color = this.galaxyColors[colorIndex];

      this.depth =
        this.depthRange.min +
        Math.random() * (this.depthRange.max - this.depthRange.min);
    }
  }
}
