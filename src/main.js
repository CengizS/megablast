import GameAudio from "./audio/GameAudio.js";
import Asteroid from "./entities/Asteroid.js";
import Galaxy from "./entities/Galaxy.js";
import Particle from "./entities/Particle.js";
import Canyon from "./entities/Canyon.js";
import RadialProjectile from "./entities/RadialProjectile.js";
import { CONFIG } from "./config.js";
import { fastCos, fastSin, randBetween } from "./utils/math.js";

var animationInstance;
let lastTimestamp;
const TWO_PI = Math.PI * 2;
let debug = false;
let canvas = document.querySelector("canvas");
const container = canvas.parentElement;
const view = {
  width: CONFIG.canvas.width,
  height: CONFIG.canvas.height,
  dpr: 1,
  scale: 1,
};
let canyon;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.min(
    window.innerWidth / view.width,
    window.innerHeight / view.height
  );
  const cssWidth = Math.floor(view.width * scale);
  const cssHeight = Math.floor(view.height * scale);

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  if (container) {
    container.style.width = `${cssWidth}px`;
    container.style.height = `${cssHeight}px`;
  }

  canvas.width = Math.floor(view.width * scale * dpr);
  canvas.height = Math.floor(view.height * scale * dpr);

  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  view.dpr = dpr;
  view.scale = scale;

  if (canyon) {
    canyon.bounds = view;
  }
}

canvas.width = view.width;
canvas.height = view.height;
let ctx = canvas.getContext("2d");
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
let showHelp = false;
let score = 0;
let shipLives = 3;
let shipHitCount = 0;
let SHOOTING_CHANCE = CONFIG.shootingChance;

let scoreEl = document.querySelector("#scoreEl");
let radialProjectiles = [];
let trackTitle = document.querySelector("#trackTitle");
let trackDiv = document.querySelector("#titleDiv");

let touchLastX = 0;
let touchLastY = 0;

const keyMap = {
  ArrowRight: "rightPressed",
  ArrowLeft: "leftPressed",
  ArrowUp: "upPressed",
  ArrowDown: "downPressed",
  Space: "spacePressed",
  KeyC: "cPressed",
  KeyT: "tPressed",
  KeyD: "dPressed",
  KeyM: "mPressed",
  KeyH: "hPressed",
};

// Instantiate audio
let audio = new GameAudio({
  backgroundMusicEl: document.querySelector("#backgroundMusic"),
  explosionEl: document.getElementById("explosion"),
  trackTitleEl: trackTitle,
  trackDivEl: trackDiv,
});

let help = document.getElementById("help");

// Gegner-Variablen
let enemyPalettes = CONFIG.enemy.palettes;
let enemySpawnAccumulator = 0;
let enemyWidth = CONFIG.enemy.width;
let enemyHeight = CONFIG.enemy.height;
let enemies = [];
let enemyProjectiles = [];

// Player sprite
const playerSprite = document.getElementById("playerSprite");

const input = {
  rightPressed: false,
  leftPressed: false,
  upPressed: false,
  downPressed: false,
  spacePressed: false,
  cPressed: false,
  tPressed: false,
  dPressed: false,
  mPressed: false,
  hPressed: false,
};

// Spielvariablen
let playerWidth = CONFIG.player.width;
let playerHeight = CONFIG.player.height;
let playerX = view.width * 0.5;
let playerY = (view.height / 8) * 7;
let playerSpeed = CONFIG.player.speed;

// Projektilvariablen
let particles = [];
let shockwaves = [];
let projectileSpeed = CONFIG.projectile.speed;
let projectiles = [];

let starCount = CONFIG.stars.count; // Anzahl der Sterne, die zufällig platziert werden
let stars = [];

// Galaxiendefinitionen
const galaxyColors = CONFIG.galaxy.colors;
let galaxySizes = CONFIG.galaxy.sizes;
let galaxySpeedBase = CONFIG.galaxy.speedBase;
let galaxyCount = CONFIG.galaxy.count;
let galaxies = [];

// Asteroidenvariablen
let asteroidSize = CONFIG.asteroid.size;
let asteroids = [];
let asteroidSpawnAccumulator = 0;
let asteroidSpeed = CONFIG.asteroid.speed;
let asteroidSprite = new Image();
asteroidSprite.src = "asteroid.png";

  canyon = new Canyon({
    ctx,
    bounds: view,
    config: CONFIG.canyon,
  });

// Funktion zum Erzeugen von Asteroiden
function createAsteroid() {
  if (asteroidSpawnAccumulator < CONFIG.asteroid.spawnIntervalMs) return;

  const positionX = Math.random() * (view.width - asteroidSize);
  asteroids.push(
    new Asteroid({
      x: positionX,
      y: -asteroidSize,
      radius: Math.random() * asteroidSize,
      speed: Math.random() * asteroidSpeed + 3,
      rotation: Math.random() * TWO_PI,
      sprite: asteroidSprite,
      ctx,
      bounds: view,
      twoPi: TWO_PI,
    })
  );

  asteroidSpawnAccumulator -= CONFIG.asteroid.spawnIntervalMs;
}

function updateAsteroids(dtScale) {
  createAsteroid();
  asteroids = asteroids.filter((asteroid) => {
    asteroid.update(dtScale);
    return asteroid.y < view.height;
  });
}

function renderAsteroids() {
  asteroids.forEach((asteroid) => asteroid.draw());
}

function drawEnemy(enemy) {
  const { x, y, width, height, palette } = enemy;
  const centerX = x + width * 0.5;

  ctx.fillStyle = palette.primary;
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + width * 0.12, y + height * 0.4);
  ctx.lineTo(x + width * 0.18, y + height * 0.9);
  ctx.lineTo(x + width * 0.82, y + height * 0.9);
  ctx.lineTo(x + width * 0.88, y + height * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.secondary;
  ctx.beginPath();
  ctx.moveTo(centerX, y + height * 0.18);
  ctx.lineTo(x + width * 0.35, y + height * 0.52);
  ctx.lineTo(x + width * 0.65, y + height * 0.52);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(
    x + width * 0.32,
    y + height * 0.6,
    width * 0.36,
    height * 0.16
  );

  if (enemy.maxHp > 1) {
    const barWidth = width * 0.6;
    const barHeight = 3;
    const barX = x + width * 0.2;
    const barY = y + height * 0.82;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = palette.secondary;
    ctx.fillRect(barX, barY, barWidth * (enemy.hp / enemy.maxHp), barHeight);
  }
}

function updateCanyon(dtScale) {
  canyon.update(dtScale);
}

function renderCanyon() {
  canyon.draw();
}

// Radiales Projektil abfeuern
function fireRadialProjectile() {
  const numberOfProjectiles = CONFIG.radialProjectile.count; // Anzahl der radialen Projektile
  const speed = CONFIG.radialProjectile.speed; // Geschwindigkeit der radialen Projektile
  const posX = playerX + playerWidth * 0.5;
  const posY = playerY + playerHeight * 0.5;
  const angleIncrement = TWO_PI / numberOfProjectiles;

  for (let i = 0; i < numberOfProjectiles; i++) {
    let angle = angleIncrement * i;
    let speedX = fastCos(angle) * speed;
    let speedY = fastSin(angle) * speed;

    // Projektile in Liste aufnehmen und sie von der Position des Spielers aus abfeuern
    radialProjectiles.push(
      new RadialProjectile({
        x: posX,
        y: posY,
        speedX,
        speedY,
        dimension: CONFIG.radialProjectile.size,
        ctx,
      })
    );
  }
}

function createParticles(x, y, color) {
  const numberOfParticles = CONFIG.particles.count;
  const coreCount = Math.floor(numberOfParticles * CONFIG.particles.coreRatio);
  const outerCount = numberOfParticles - coreCount;
  const particleOptions = {
    ctx,
    twoPi: TWO_PI,
    sizeRange: CONFIG.particles.sizeRange,
    speedRange: CONFIG.particles.speedRange,
    shrinkRate: CONFIG.particles.shrinkRate,
  };
  particles.push(
    ...new Array(coreCount)
      .fill()
      .map(
        () =>
          new Particle({
            x,
            y,
            color: colorWithAlpha(color, 0.9),
            ...particleOptions,
          })
      )
  );
  particles.push(
    ...new Array(outerCount)
      .fill()
      .map(
        (_, i) =>
          new Particle({
            x,
            y,
            color: colorFromRatio(i / outerCount),
            ...particleOptions,
          })
      )
  );
}

function createShockwave(x, y, color) {
  shockwaves.push({
    x,
    y,
    radius: 6,
    maxRadius: 46,
    lineWidth: 4,
    opacity: 0.8,
    color,
  });
}

function colorWithAlpha(color, alpha) {
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function colorFromRatio(ratio) {
  const hue = ratio * 40; // Adjust for desired color range (here it's set to yellow-red gradient)
  return `hsl(${hue}, 100%, 50%)`;
}

function createEnemies() {
  if (enemySpawnAccumulator < CONFIG.enemy.spawnIntervalMs) return;

  const palette =
    enemyPalettes[Math.floor(Math.random() * enemyPalettes.length)];
  const patternRoll = Math.random();
  const hp =
    Math.floor(
      randBetween(CONFIG.enemy.hitpoints.min, CONFIG.enemy.hitpoints.max + 1)
    ) || 1;

  if (patternRoll < 0.45) {
    // Top-down single
    const x = Math.random() * (view.width - enemyWidth);
    enemies.push({
      x,
      y: -enemyHeight,
      width: enemyWidth,
      height: enemyHeight,
      speedX: 0,
      speedY: CONFIG.enemy.patterns.topSpeed,
      palette,
      hp,
      maxHp: hp,
    });
  } else if (patternRoll < 0.65) {
    // Side-in
    const fromLeft = Math.random() > 0.5;
    const y = Math.random() * (view.height * 0.6);
    enemies.push({
      x: fromLeft ? -enemyWidth : view.width + enemyWidth,
      y,
      width: enemyWidth,
      height: enemyHeight,
      speedX: fromLeft
        ? CONFIG.enemy.patterns.sideSpeed
        : -CONFIG.enemy.patterns.sideSpeed,
      speedY: CONFIG.enemy.patterns.sideSpeed * 0.6,
      palette,
      hp,
      maxHp: hp,
    });
  } else if (patternRoll < 0.85) {
    // Formation
    const count = CONFIG.enemy.patterns.formationSize;
    const spacing = CONFIG.enemy.patterns.formationSpacing;
    const totalWidth = enemyWidth * count + spacing * (count - 1);
    const startX = Math.random() * Math.max(10, view.width - totalWidth);
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: startX + i * (enemyWidth + spacing),
        y: -enemyHeight - i * 8,
        width: enemyWidth,
        height: enemyHeight,
        speedX: 0,
        speedY: CONFIG.enemy.patterns.topSpeed * 0.9,
        palette,
        hp,
        maxHp: hp,
      });
    }
  } else {
    // Radial burst around player
    const centerX = playerX + playerWidth * 0.5;
    const centerY = playerY + playerHeight * 0.5;
    const count = CONFIG.enemy.patterns.radial.count;
    const radius = CONFIG.enemy.patterns.radial.radius;
    const speed = CONFIG.enemy.patterns.radial.speed;
    const angleStep = TWO_PI / count;
    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;
      const spawnX = centerX + fastCos(angle) * radius - enemyWidth * 0.5;
      const spawnY = centerY + fastSin(angle) * radius - enemyHeight * 0.5;
      enemies.push({
        x: spawnX,
        y: spawnY,
        width: enemyWidth,
        height: enemyHeight,
        speedX: -fastCos(angle) * speed,
        speedY: -fastSin(angle) * speed,
        palette,
        hp,
        maxHp: hp,
      });
    }
  }

  enemySpawnAccumulator -= CONFIG.enemy.spawnIntervalMs;
}

function updateEnemies(dtScale) {
  const halfPlayerWidth = playerWidth * 0.5;
  const halfPlayerHeight = playerHeight * 0.5;
  const shootingChancePerTick = SHOOTING_CHANCE * dtScale;
  enemies = enemies.filter((enemy) => {
    enemy.x += enemy.speedX * dtScale;
    enemy.y += enemy.speedY * dtScale;

    if (Math.random() < shootingChancePerTick && enemy.y < playerY) {
      const projectileX = enemy.x + enemy.width * 0.5;
      const projectileY = enemy.y + enemy.height;

      var directionX = playerX + halfPlayerWidth - projectileX;
      var directionY = playerY + halfPlayerHeight - projectileY;

      const length = Math.hypot(directionX, directionY);

      directionX /= length;
      directionY /= length;

      enemyProjectiles.push({
        x: projectileX,
        y: projectileY,
        speedX: projectileSpeed * directionX,
        speedY: projectileSpeed * directionY,
        palette: enemy.palette,
        width: 3,
        height: 3,
      });
    }

    return !(
      enemy.y > view.height + enemy.height ||
      enemy.y < -enemy.height * 2 ||
      enemy.x < -enemy.width * 2 ||
      enemy.x > view.width + enemy.width * 2
    );
  });
}

function renderEnemies() {
  enemies.forEach((enemy) => {
    drawEnemy(enemy);

    if (debug) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var intervalId = null;
// Intervall zwischen den Schüssen
const shootingInterval = CONFIG.shooting.intervalMs;

document.addEventListener(
  "touchstart",
  function (e) {
    var touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchLastX = (touch.clientX - rect.left) * (view.width / rect.width);
    touchLastY = (touch.clientY - rect.top) * (view.height / rect.height);
    intervalId = setInterval(shoot, shootingInterval);
  },
  false
);
document.addEventListener(
  "touchmove",
  function (e) {
    var touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX =
      (touch.clientX - rect.left) * (view.width / rect.width);
    const currentY =
      (touch.clientY - rect.top) * (view.height / rect.height);

    playerX += currentX - touchLastX;
    playerY += currentY - touchLastY;

    touchLastX = currentX;
    touchLastY = currentY;
  },
  false
);
document.addEventListener(
  "touchend",
  function (_e) {
    clearInterval(intervalId);
    intervalId = null;
  },
  false
);

// Zeichnet die Sterne auf dem Canvas
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, view.width, view.height);
  for (let { x, y, size } of stars) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TWO_PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
  galaxies.forEach((galaxy) => galaxy.draw());
}

// Ändert die Position der Sterne
function updateBackground(dtScale) {
  stars.forEach((star) => {
    star.y = (star.y + CONFIG.stars.speed * dtScale) % view.height;
  });
  galaxies.forEach((galaxy) => galaxy.update(dtScale));
}

function keyDownHandler(event) {
  if (debug) console.log(event);

  const key = keyMap[event.code];
  if (key) {
    event.preventDefault();
    input[key] = true;
  }
  if (input.hPressed) {
    input.hPressed = false;
    help.style.display = !showHelp ? "inline-block" : "none";
    showHelp = !showHelp;
    if (!showHelp) {
      lastTimestamp = 0;
      accumulator = 0;
      animationInstance = requestAnimationFrame(draw);
    }
    console.log(showHelp);
  }
}

function keyUpHandler(event) {
  const key = keyMap[event.code];
  if (key) {
    event.preventDefault();
    input[key] = false;
  }
}

function checkEnemyProjectileHitShip(projectiles, player) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (checkCollision(projectiles[i], player)) {
      const explosionX = playerX + playerWidth * 0.5;
      const explosionY = playerY + playerHeight * 0.5;
      createParticles(explosionX, explosionY, "#ffffff");
      createShockwave(explosionX, explosionY, "#ffffff");
      audio.playExplosionSound();
      enemyProjectiles.splice(i, 1);
      shipHitCount += 1;
      if (shipHitCount >= 3) {
        shipHitCount = 0;
        shipLives--;
        //liveEl.innerHTML = shipLives;
        // for now it's endless mode
        //liveEl.innerHTML = "&infin;";

        if (shipLives <= 0) {
          // Spielende Logik hier
        }
      }
      break;
    }
  }
}

function checkProjectileHitEnemy(p) {
  if (p.length == 0) return;

  for (let i = p.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (checkCollision(p[i], enemies[j])) {
        const explosionX = p[i].x + p[i].width * 0.5;
        const explosionY = p[i].y + p[i].height * 0.5;
        createParticles(explosionX, explosionY, enemies[j].palette.primary);
        createShockwave(explosionX, explosionY, enemies[j].palette.primary);
        enemies[j].hp -= 1;
        p.splice(i, 1);
        if (enemies[j].hp <= 0) {
          audio.playExplosionSound();
          enemies.splice(j, 1);
          score += 25;
        }
        break;
      }
    }
  }
}

function checkCollision(object1, object2) {
  return (
    object1.x < object2.x + object2.width &&
    object1.x + object1.width > object2.x &&
    object1.y < object2.y + object2.height &&
    object1.y + object1.height > object2.y
  );
}

function updateRadialProjectiles(dtScale) {
  radialProjectiles = radialProjectiles.filter((projectile) => {
    projectile.update(dtScale);
    return !(
      projectile.x < 0 ||
      projectile.x > view.width ||
      projectile.y < 0 ||
      projectile.y > view.height
    );
  });
}

function renderRadialProjectiles() {
  radialProjectiles.forEach((projectile) => projectile.draw());
}

// Score anzeigen
function drawScore() {
  scoreEl.innerHTML = score;
}

function updatePlayer(dtScale) {
  if (input.rightPressed && playerX < view.width - playerWidth) {
    playerX += playerSpeed * dtScale;
  } else if (input.leftPressed && playerX > 0) {
    playerX -= playerSpeed * dtScale;
  }

  if (input.upPressed && playerY > 0) {
    playerY -= playerSpeed * dtScale;
  } else if (input.downPressed && playerY < view.height - playerHeight) {
    playerY += playerSpeed * dtScale;
  }
}

function updateProjectiles(dtScale) {
  projectiles = projectiles.filter((proj) => {
    proj.y -= proj.speed * dtScale;
    return proj.y >= 0;
  });
}

function updateEnemyProjectiles(dtScale) {
  enemyProjectiles = enemyProjectiles.filter((proj) => {
    proj.x += proj.speedX * dtScale;
    proj.y += proj.speedY * dtScale;

    return !(
      proj.y > view.height ||
      proj.y < 0 ||
      proj.x < 0 ||
      proj.x > view.width
    );
  });
}

function updateParticles(dtScale) {
  particles = particles.filter((particle) => {
    particle.update(dtScale);
    return particle.size > 0.1;
  });

  shockwaves = shockwaves.filter((wave) => {
    wave.radius += 2.4 * dtScale;
    wave.opacity -= 0.04 * dtScale;
    wave.lineWidth = Math.max(0.5, wave.lineWidth - 0.08 * dtScale);
    return wave.opacity > 0 && wave.radius < wave.maxRadius;
  });
}

function renderProjectiles() {
  for (let { x, y } of projectiles) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, TWO_PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();
  }
}

function renderEnemyProjectiles() {
  for (let { palette, x, y } of enemyProjectiles) {
    ctx.beginPath();
    ctx.fillStyle = palette ? palette.secondary : "yellow";
    ctx.strokeStyle = "white";
    ctx.arc(x, y, 3, 0, TWO_PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

function renderPlayer() {
  ctx.drawImage(playerSprite, playerX, playerY, playerWidth, playerHeight);
  if (debug) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
  }
}

function renderParticles() {
  particles.forEach((particle) => particle.draw());
  shockwaves.forEach((wave) => {
    ctx.beginPath();
    ctx.strokeStyle = colorWithAlpha(wave.color, wave.opacity);
    ctx.lineWidth = wave.lineWidth;
    ctx.arc(wave.x, wave.y, wave.radius, 0, TWO_PI);
    ctx.stroke();
    ctx.closePath();
  });
}

function updateGame(dt) {
  const dtScale = dt * 60;
  const dtMs = dt * 1000;
  enemySpawnAccumulator += dtMs;
  asteroidSpawnAccumulator += dtMs;

  updateBackground(dtScale);
  createEnemies();
  updateEnemies(dtScale);
  updateAsteroids(dtScale);
  updateCanyon(dtScale);
  updatePlayer(dtScale);
  updateProjectiles(dtScale);
  updateEnemyProjectiles(dtScale);
  updateRadialProjectiles(dtScale);

  if (input.spacePressed) {
    shoot();
    input.spacePressed = false;
  }
  if (input.cPressed) {
    fireRadialProjectile();
    input.cPressed = false;
    audio.playShootSound();
  }
  if (input.tPressed) {
    input.tPressed = false;
    audio.nextTrack();
  }
  if (input.dPressed) {
    input.dPressed = false;
    debug = !debug;
  }
  if (input.mPressed) {
    input.mPressed = false;
    audio.toggleAudioPlaying();
  }

  checkProjectileHitEnemy(projectiles);
  checkProjectileHitEnemy(radialProjectiles);
  checkEnemyProjectileHitShip(enemyProjectiles, {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight,
  });

  updateParticles(dtScale);
}

function renderGame(deltaTime) {
  drawBackground();
  renderEnemies();
  renderAsteroids();
  renderCanyon();
  renderPlayer();
  renderProjectiles();
  renderRadialProjectiles();
  renderEnemyProjectiles();
  renderParticles();
  drawScore();

  ctx.fillStyle = "white";
  ctx.fillText("H for Help", 5, view.height - 5);

  if (debug) {
    var t = Math.ceil(1 / deltaTime) + " fps";
    ctx.fillStyle = "white";
    ctx.fillText(t, view.width - 100, view.height - 5);
  }
}

const FIXED_DT = 1 / 60;
const MAX_DELTA = 0.1;
let accumulator = 0;

// Spiel-Loop
function draw(timestamp) {
  if (showHelp) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  let deltaTime = (timestamp - lastTimestamp) / 1000;
  if (deltaTime > MAX_DELTA) deltaTime = MAX_DELTA;
  lastTimestamp = timestamp;

  accumulator += deltaTime;
  while (accumulator >= FIXED_DT) {
    updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  renderGame(deltaTime);

  animationInstance = requestAnimationFrame(draw);
}

function shoot() {
  var projectileX = Math.floor(playerX + playerWidth / 3);
  var projectileY = playerY;
  projectiles.push({
    x: projectileX,
    y: projectileY,
    width: 3,
    height: 3,
    speed: projectileSpeed,
  });
  projectileX = Math.floor(playerX + 2 * (playerWidth / 3));
  projectiles.push({
    x: projectileX,
    y: projectileY,
    width: 3,
    height: 3,
    speed: projectileSpeed,
  });
  audio.playShootSound();
}

function handleVisibilityChange() {
  var d = new Date(Date.now());
  var str = d.toLocaleTimeString();
  if (document.hidden) {
    // Tab ist nicht sichtbar, Animation pausieren
    cancelAnimationFrame(animationInstance);
    console.log(`[${str}] Animation paused`);
  } else {
    // Tab ist wieder sichtbar, Animation fortsetzen
    lastTimestamp = 0;
    accumulator = 0;
    animationInstance = requestAnimationFrame(draw);
    console.log(`[${str}] Animation resumed`);
  }
}

// Erstellt Sterne mit zufälligen Positionen und Größe
for (let i = 0; i < starCount; i++) {
  let x = Math.random() * view.width;
  let y = Math.random() * view.height;
  let size = Math.random() * CONFIG.stars.maxSize;
  stars[i] = { x: x, y: y, size: size };
}

// Galaxien erstellen
for (let i = 0; i < galaxyCount; i++) {
  let x = Math.random() * view.width;
  let y = Math.random() * view.height;
  let size = galaxySizes[Math.floor(Math.random() * galaxySizes.length)];
  let speed = galaxySpeedBase + size / 5;
  let color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];

  galaxies[i] = new Galaxy({
    x,
    y,
    size,
    speed,
    color,
    ctx,
    bounds: view,
    twoPi: TWO_PI,
    galaxySizes,
    galaxyColors,
    galaxySpeedBase,
    steps: CONFIG.galaxy.steps,
    depth: CONFIG.galaxy.depth,
    drift: CONFIG.galaxy.drift,
    scale: CONFIG.galaxy.scale,
  });
}

animationInstance = requestAnimationFrame(draw);
