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
  fruit: {
    categories: ["red", "green", "cyan", "orange", "purple"],
    width: 30,
    height: 30,
    speed: 3,
    spawnIntervalMs: 500,
    sidewaysChance: 0.2,
  },
  particles: {
    count: 50,
  },
  shooting: {
    intervalMs: 100,
  },
};
