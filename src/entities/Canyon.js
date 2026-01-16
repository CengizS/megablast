import { clamp } from "../utils/math.js";

export default class Canyon {
  constructor({ ctx, bounds, config }) {
    this.ctx = ctx;
    this.bounds = bounds;
    this.config = config;
    this.segmentHeight = config.segmentHeight;
    this.speed = config.speed;
    this.wallMin = config.wall.min;
    this.wallMax = config.wall.max;
    this.wallStep = config.wall.step;
    this.phaseStep = config.wall.phaseStep;
    this.phaseJitter = config.wall.phaseJitter;
    this.wallColor = config.wall.color;
    this.wallEdgeColor = config.wall.edgeColor;
    this.wallSpeckles = config.wall.speckles;
    this.wallSpeckleAlpha = config.wall.speckleAlpha;
    this.outcroppings = [];
    this.scroll = 0;
    this.phaseLeft = Math.random() * Math.PI * 2;
    this.phaseRight = Math.random() * Math.PI * 2;
    this.segmentOffset = 0;
    this.segmentCount = Math.ceil(bounds.height / this.segmentHeight) + 3;
    this.wallPattern = this.createWallPattern();
  }

  createWallPattern() {
    const size = 64;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const octx = offscreen.getContext("2d");
    octx.fillStyle = this.wallColor;
    octx.fillRect(0, 0, size, size);

    for (let i = 0; i < 180; i++) {
      const color =
        this.wallSpeckles[Math.floor(Math.random() * this.wallSpeckles.length)];
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 2 + 0.5;
      octx.fillStyle = color;
      octx.beginPath();
      octx.arc(x, y, r, 0, Math.PI * 2);
      octx.fill();
    }

    return this.ctx.createPattern(offscreen, "repeat");
  }

  hash(n) {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  wallAt(index, phaseBase, min, max) {
    const center = (min + max) * 0.5;
    const amplitude = (max - min) * 0.5;
    const phase = phaseBase + index * this.phaseStep;
    const jitter = (this.hash(index + phaseBase * 10) * 2 - 1) * this.wallStep;
    return clamp(center + Math.sin(phase) * amplitude + jitter, min, max);
  }

  update(dtScale) {
    this.scroll -= this.speed * dtScale;
    while (this.scroll <= 0) {
      this.scroll += this.segmentHeight;
      this.segmentOffset -= 1;
    }
  }

  segmentIndexForY(y) {
    const index = Math.floor((y + this.scroll) / this.segmentHeight);
    return clamp(index, 0, this.segmentCount - 1);
  }

  drawWalls() {
    const startY = -this.scroll;
    const endY = this.bounds.height + this.segmentHeight;
    const leftPoints = [];
    const rightPoints = [];
    for (let i = 0; i < this.segmentCount; i++) {
      const index = this.segmentOffset + i;
      const left = this.wallAt(index, this.phaseLeft, this.wallMin, this.wallMax);
      const right = this.wallAt(index, this.phaseRight, this.wallMin, this.wallMax);
      leftPoints.push(left);
      rightPoints.push(right);
    }
    for (let i = 0; i < leftPoints.length; i++) {
      const prev = leftPoints[i - 1] ?? leftPoints[i];
      const next = leftPoints[i + 1] ?? leftPoints[i];
      leftPoints[i] = (prev + leftPoints[i] + next) / 3;
    }
    for (let i = 0; i < rightPoints.length; i++) {
      const prev = rightPoints[i - 1] ?? rightPoints[i];
      const next = rightPoints[i + 1] ?? rightPoints[i];
      rightPoints[i] = (prev + rightPoints[i] + next) / 3;
    }

    const drawLeftPath = () => {
      this.ctx.beginPath();
      this.ctx.moveTo(0, startY);
    for (let i = 0; i < leftPoints.length; i++) {
      const y = startY + i * this.segmentHeight;
      this.ctx.lineTo(leftPoints[i], y);
    }
      this.ctx.lineTo(0, endY);
      this.ctx.closePath();
    };

    const drawRightPath = () => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.bounds.width, startY);
    for (let i = 0; i < rightPoints.length; i++) {
      const y = startY + i * this.segmentHeight;
      this.ctx.lineTo(this.bounds.width - rightPoints[i], y);
    }
      this.ctx.lineTo(this.bounds.width, endY);
      this.ctx.closePath();
    };

    this.ctx.fillStyle = this.wallColor;
    drawLeftPath();
    this.ctx.fill();
    drawRightPath();
    this.ctx.fill();

    if (this.wallPattern) {
      this.ctx.save();
      this.ctx.globalAlpha = this.wallSpeckleAlpha;
      this.ctx.fillStyle = this.wallPattern;
      drawLeftPath();
      this.ctx.fill();
      drawRightPath();
      this.ctx.fill();
      this.ctx.restore();
    }


    this.ctx.strokeStyle = this.wallEdgeColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = "round";
    this.ctx.beginPath();
    for (let i = 0; i < leftPoints.length; i++) {
      const y = startY + i * this.segmentHeight;
      if (i === 0) {
        this.ctx.moveTo(leftPoints[i], y);
      } else {
        this.ctx.lineTo(leftPoints[i], y);
      }
    }
    this.ctx.stroke();

    this.ctx.beginPath();
    for (let i = 0; i < rightPoints.length; i++) {
      const y = startY + i * this.segmentHeight;
      const x = this.bounds.width - rightPoints[i];
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }

  draw() {
    this.drawWalls();
  }
}
