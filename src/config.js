export const CONFIG = {
  canvas: {
    width: 1080,
    height: 576,
  },
  shootingChance: 0.0075,
  player: {
    width: 64,
    height: 64,
    speed: 8,
  },
  projectile: {
    speed: 10,
  },
  radialProjectile: {
    count: 36,
    speed: 7,
    size: 4,
  },
  stars: {
    count: 250,
    maxSize: 2,
    speed: 0.5,
  },
  galaxy: {
    colors: ["white", "yellow", "orange", "lightblue"],
    sizes: [2, 3, 5, 7],
    speedBase: 0.05,
    steps: 360,
    count: 8,
    scale: {
      xDiv: 4,
      yDiv: 8,
    },
    depth: {
      min: 0.35,
      max: 1,
    },
    drift: {
      speed: 0.35,
      amplitude: 6,
      wobbleSpeed: 0.5,
    },
  },
  asteroid: {
    size: 20,
    speed: 7,
    spawnIntervalMs: 500,
  },
  rocks: {
    height: 100,
    variance: 50,
    maxOffset: 0,
    miniSize: 5,
  },
  canyon: {
    segmentHeight: 40,
    speed: 0.9,
    wall: {
      min: 30,
      max: 130,
      step: 10,
      phaseStep: 0.18,
      phaseJitter: 0.08,
      color: "#1c1f21",
      edgeColor: "#2c3236",
      speckles: ["#2d3438", "#14191b", "#3b4348"],
      speckleAlpha: 0.35,
    },
  },
  enemy: {
    width: 34,
    height: 28,
    speed: 2.4,
    spawnIntervalMs: 550,
    hitpoints: {
      min: 1,
      max: 3,
    },
    palettes: [
      { primary: "#67d4ff", secondary: "#0f2b3a" },
      { primary: "#ffb347", secondary: "#3a220f" },
      { primary: "#7cff8a", secondary: "#0f3a1a" },
      { primary: "#f26b6b", secondary: "#3a0f0f" },
    ],
    patterns: {
      formationSize: 4,
      formationSpacing: 42,
      sideSpeed: 2.2,
      topSpeed: 2.6,
      radial: {
        count: 8,
        radius: 200,
        speed: 1.8,
      },
    },
  },
  particles: {
    count: 70,
    coreRatio: 0.35,
    shrinkRate: 0.08,
    sizeRange: [1, 8],
    speedRange: {
      x: [-2, 2],
      y: [-2, 2],
    },
  },
  shooting: {
    intervalMs: 100,
  },
};
