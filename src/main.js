import GameAudio from "./audio/GameAudio.js";
import Asteroid from "./entities/Asteroid.js";
import Galaxy from "./entities/Galaxy.js";
import Particle from "./entities/Particle.js";
import Rock from "./entities/Rock.js";
import RadialProjectile from "./entities/RadialProjectile.js";
import { CONFIG } from "./config.js";
import { fastCos, fastSin } from "./utils/math.js";

var animationInstance;
let lastTimestamp;
const TWO_PI = Math.PI * 2;
let debug = false;
let canvas = document.querySelector("canvas");
/*const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
*/
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;
let ctx = canvas.getContext("2d");
let showHelp = false;
let score = 0;
let shipLives = 3;
let currentLife = 0;
let shipHitCount = 0;
let SHOOTING_CHANCE = CONFIG.shootingChance;

let liveEl = document.querySelector("#liveEl");
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

// Fruchtkategorien, Farben repräsentieren unterschiedliche Früchte
let fruitCategories = CONFIG.fruit.categories;

// Fruchtvariablen
let fruitCreationTimer = Date.now();
let fruitWidth = CONFIG.fruit.width;
let fruitHeight = CONFIG.fruit.height;
let fruitSpeed = CONFIG.fruit.speed;
let fruits = [];
let fruitProjectiles = [];
let fruitSideways = false;

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
let playerX = canvas.width * 0.5;
let playerY = (canvas.height / 8) * 7;
let playerSpeed = CONFIG.player.speed;

// Projektilvariablen
let particles = [];
let projectileWidth = 10;
let projectileHeight = 10;
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
let asteroidSpawnTimer = Date.now();
let asteroidSpeed = CONFIG.asteroid.speed;
let asteroidSprite = new Image();
asteroidSprite.src = "asteroid.png";

// Felsenformation
let leftRocks = [];
let rightRocks = [];

// Funktion zum Erzeugen von Asteroiden
function createAsteroid() {
  const currentTime = Date.now();
  if (currentTime - asteroidSpawnTimer < CONFIG.asteroid.spawnIntervalMs) {
    return;
  }

  const positionX = Math.random() * (canvas.width - asteroidSize);
  asteroids.push(
    new Asteroid({
      x: positionX,
      y: -asteroidSize,
      radius: Math.random() * asteroidSize,
      speed: Math.random() * asteroidSpeed + 3,
      rotation: Math.random() * TWO_PI,
      sprite: asteroidSprite,
      ctx,
      canvas,
      twoPi: TWO_PI,
    })
  );

  asteroidSpawnTimer = currentTime;
}

function updateAsteroids(dtScale) {
  createAsteroid();
  asteroids = asteroids.filter((asteroid) => {
    asteroid.update(dtScale);
    return asteroid.y < canvas.height;
  });
}

function renderAsteroids() {
  asteroids.forEach((asteroid) => asteroid.draw());
}

var drawFunctions = [
  function (fruit) {
    // Quadrat
    ctx.fillRect(fruit.x, fruit.y, fruit.width, fruit.height);
  },
  function (fruit) {
    // Kreis
    ctx.beginPath();
    ctx.arc(
      fruit.x + fruit.width * 0.5,
      fruit.y + fruit.height * 0.5,
      fruit.width * 0.5,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Dreieck
    ctx.beginPath();
    ctx.moveTo(fruit.x + fruit.width * 0.5, fruit.y + fruit.height); // Spitze nach unten
    ctx.lineTo(fruit.x, fruit.y); // obere linke Ecke
    ctx.lineTo(fruit.x + fruit.width, fruit.y); // obere rechte Ecke
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Fünfeck
    ctx.beginPath();
    ctx.moveTo(fruit.x + fruit.width * 0.5, fruit.y);
    ctx.lineTo(fruit.x + fruit.width, fruit.y + fruit.height / 3);
    ctx.lineTo(fruit.x + (fruit.width * 3) / 4, fruit.y + fruit.height);
    ctx.lineTo(fruit.x + fruit.width / 4, fruit.y + fruit.height);
    ctx.lineTo(fruit.x, fruit.y + fruit.height / 3);
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // abgerundetes Dreieck mit Spitze nach unten
    var radius = fruit.width / 3;
    ctx.beginPath();
    ctx.moveTo(fruit.x + radius, fruit.y);
    ctx.lineTo(fruit.x + fruit.width - radius, fruit.y);
    ctx.quadraticCurveTo(
      fruit.x + fruit.width,
      fruit.y,
      fruit.x + fruit.width,
      fruit.y + radius
    );
    ctx.lineTo(fruit.x + fruit.width * 0.5, fruit.y + fruit.height);
    ctx.lineTo(fruit.x, fruit.y + radius);
    ctx.quadraticCurveTo(fruit.x, fruit.y, fruit.x + radius, fruit.y);
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Stern
    const spikes = 5;
    const outerRadius = fruit.width * 0.5;
    const innerRadius = fruit.width / 4;
    var rotation = Math.PI * 0.5 * 3;
    const x = fruit.x + fruit.width * 0.5;
    const y = fruit.y + fruit.height * 0.5;
    var step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let xValue = x + fastCos(rotation) * outerRadius;
      let yValue = y + fastSin(rotation) * outerRadius;
      ctx.lineTo(xValue, yValue);
      rotation += step;

      xValue = x + fastCos(rotation) * innerRadius;
      yValue = y + fastSin(rotation) * innerRadius;
      ctx.lineTo(xValue, yValue);
      rotation += step;
    }

    ctx.lineTo(x, y - outerRadius);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.fillStyle = fruit.color;
    ctx.closePath();
    ctx.fill();
  },
];

// Felsenformation rechts und links des Spielfelds definieren
let rockHeight = CONFIG.rocks.height;
let variance = CONFIG.rocks.variance;
let maxOffset = CONFIG.rocks.maxOffset;
function populateRocks() {
  let offset = 0; // aktuelle Höhenänderung für die Felsen

  for (let i = 0; i < canvas.height * 2; i += rockHeight + offset) {
    let randLeft = Math.random() * variance + 10;
    let randRight = Math.random() * variance + 10;
    offset = Math.random() * maxOffset; // aktualisiere die Höhenänderung für die nächsten Felsen

    leftRocks.push(
      new Rock({
        x: 0,
        y: i,
        height: rockHeight,
        width: randLeft,
        miniRockSize: CONFIG.rocks.miniSize,
        ctx,
        canvas,
      })
    );
    rightRocks.push(
      new Rock({
        x: canvas.width - randRight,
        y: i,
        height: rockHeight,
        width: randRight,
        miniRockSize: CONFIG.rocks.miniSize,
        ctx,
        canvas,
      })
    );
  }
}

function updateRocks(dtScale) {
  leftRocks.forEach((rock) => {
    rock.update(dtScale);
  });
  rightRocks.forEach((rock) => {
    rock.update(dtScale);
  });
}

function renderRocks() {
  leftRocks.forEach((rock) => {
    rock.draw();
  });
  rightRocks.forEach((rock) => {
    rock.draw();
  });
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
  particles.push(
    ...new Array(numberOfParticles)
      .fill()
      .map(
        (_, i) =>
          new Particle({
            x,
            y,
            color: colorFromRatio(i / numberOfParticles),
            ctx,
            twoPi: TWO_PI,
          })
      )
  );
}

function colorFromRatio(ratio) {
  const hue = ratio * 40; // Adjust for desired color range (here it's set to yellow-red gradient)
  return `hsl(${hue}, 100%, 50%)`;
}

function createFruit() {
  const currentTime = Date.now();

  if (currentTime - fruitCreationTimer < CONFIG.fruit.spawnIntervalMs) {
    return;
  }

  const xDirection = Math.random() > 0.5;
  const position =
    Math.random() *
    (fruitSideways ? canvas.height - fruitHeight : canvas.width - fruitWidth);
  const speed = fruitSideways === xDirection ? fruitSpeed : -fruitSpeed;
  const category =
    fruitCategories[Math.floor(Math.random() * fruitCategories.length)];
  const shape = Math.floor(Math.random() * drawFunctions.length);

  fruits.push({
    x: fruitSideways ? (xDirection ? -fruitWidth : canvas.width) : position,
    y: fruitSideways ? position : -fruitHeight,
    width: fruitWidth,
    height: fruitHeight,
    speed: fruitSpeed,
    speedX: fruitSideways ? speed : 0,
    speedY: fruitSideways ? 0 : fruitSpeed,
    category: category,
    shape: shape,
    sideWays: fruitSideways,
  });

  fruitSideways = Math.random() < CONFIG.fruit.sidewaysChance;
  fruitCreationTimer = currentTime;
}

function updateFruits(dtScale) {
  const halfPlayerWidth = playerWidth * 0.5;
  const halfPlayerHeight = playerHeight * 0.5;
  fruits = fruits.filter((fruit) => {
    fruit.x += fruit.speedX * dtScale;
    fruit.y += fruit.speedY * dtScale;

    if (
      Math.random() < SHOOTING_CHANCE &&
      fruit.y < playerY &&
      !fruit.sideWays
    ) {
      const projectileX = fruit.x + fruit.width * 0.5;
      const projectileY = fruit.y + fruit.height;

      var directionX = playerX + halfPlayerWidth - projectileX;
      var directionY = playerY + halfPlayerHeight - projectileY;

      const length = Math.hypot(directionX, directionY);

      directionX /= length;
      directionY /= length;

      fruitProjectiles.push({
        x: projectileX,
        y: projectileY,
        speedX: projectileSpeed * directionX,
        speedY: projectileSpeed * directionY,
        category: fruit.category,
        width: 3,
        height: 3,
      });
    }

    if (fruitSideways) {
      return (
        fruit.y < canvas.height &&
        fruit.y > 0 &&
        fruit.x > 0 &&
        fruit.x < canvas.width
      );
    }
    return fruit.y < canvas.height;
  });
}

// Früchte zeichnen
function renderFruits() {
  fruits.forEach((fruit) => {
    const drawFunction = drawFunctions[fruit.shape];
    ctx.fillStyle = fruit.category;
    drawFunction(fruit);

    if (debug) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
      ctx.fillRect(fruit.x, fruit.y, fruit.width, fruit.height);

      if (fruit.sideWays) {
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        const measure = ctx.measureText("S");
        const tw = measure.width * 0.5;
        const tx = fruit.x + fruit.width * 0.5 - tw;
        const ty = fruit.y + fruit.height * 0.5;
        ctx.fillText("S", tx, ty);
      }
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
    touchLastX = touch.pageX;
    touchLastY = touch.pageY;
    intervalId = setInterval(shoot, shootingInterval);
  },
  false
);
document.addEventListener(
  "touchmove",
  function (e) {
    var touch = e.touches[0];
    playerX += touch.pageX - touchLastX;
    playerY += touch.pageY - touchLastY;

    touchLastX = touch.pageX;
    touchLastY = touch.pageY;
  },
  false
);
document.addEventListener(
  "touchend",
  function (e) {
    clearInterval(intervalId);
    intervalId = null;
  },
  false
);

// Zeichnet die Sterne auf dem Canvas
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    star.y = (star.y + CONFIG.stars.speed * dtScale) % canvas.height;
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

function checkFruitProjectileHitShip(projectiles, player) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (checkCollision(projectiles[i], player)) {
      createParticles(
        playerX + playerWidth * 0.5,
        playerY + playerHeight * 0.5,
        "white"
      );
      audio.playExplosionSound();
      fruitProjectiles.splice(i, 1);
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

function checkProjectileHitFruit(p) {
  if (p.length == 0) return;

  for (let i = p.length - 1; i >= 0; i--) {
    for (let j = fruits.length - 1; j >= 0; j--) {
      if (checkCollision(p[i], fruits[j])) {
        createParticles(
          p[i].x + p[i].width * 0.5,
          p[i].y + p[i].height * 0.5,
          fruits[j].category
        );
        audio.playExplosionSound();
        fruits.splice(j, 1);
        p.splice(i, 1);
        score += 25;
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
      projectile.x > canvas.width ||
      projectile.y < 0 ||
      projectile.y > canvas.height
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
  if (input.rightPressed && playerX < canvas.width - playerWidth) {
    playerX += playerSpeed * dtScale;
  } else if (input.leftPressed && playerX > 0) {
    playerX -= playerSpeed * dtScale;
  }

  if (input.upPressed && playerY > 0) {
    playerY -= playerSpeed * dtScale;
  } else if (input.downPressed && playerY < canvas.height - playerHeight) {
    playerY += playerSpeed * dtScale;
  }
}

function updateProjectiles(dtScale) {
  projectiles = projectiles.filter((proj) => {
    proj.y -= proj.speed * dtScale;
    return proj.y >= 0;
  });
}

function updateFruitProjectiles(dtScale) {
  fruitProjectiles = fruitProjectiles.filter((proj) => {
    proj.x += proj.speedX * dtScale;
    proj.y += proj.speedY * dtScale;

    return !(
      proj.y > canvas.height ||
      proj.y < 0 ||
      proj.x < 0 ||
      proj.x > canvas.width
    );
  });
}

function updateParticles(dtScale) {
  particles = particles.filter((particle) => {
    particle.update(dtScale);
    return particle.size > 0.1;
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

function renderFruitProjectiles() {
  for (let { category, x, y } of fruitProjectiles) {
    ctx.beginPath();
    ctx.fillStyle = "yellow"; //category;
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
}

function updateGame(dt) {
  const dtScale = dt * 60;

  updateBackground(dtScale);
  createFruit();
  updateFruits(dtScale);
  updateAsteroids(dtScale);
  updateRocks(dtScale);
  updatePlayer(dtScale);
  updateProjectiles(dtScale);
  updateFruitProjectiles(dtScale);
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

  checkProjectileHitFruit(projectiles);
  checkProjectileHitFruit(radialProjectiles);
  checkFruitProjectileHitShip(fruitProjectiles, {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight,
  });

  updateParticles(dtScale);
}

function renderGame(deltaTime) {
  drawBackground();
  renderFruits();
  renderAsteroids();
  renderRocks();
  renderPlayer();
  renderProjectiles();
  renderRadialProjectiles();
  renderFruitProjectiles();
  renderParticles();
  drawScore();

  ctx.fillStyle = "white";
  ctx.fillText("H for Help", 5, canvas.height - 5);

  if (debug) {
    var t = Math.ceil(1 / deltaTime) + " fps";
    ctx.fillStyle = "white";
    ctx.fillText(t, canvas.width - 100, canvas.height - 5);
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
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let size = Math.random() * CONFIG.stars.maxSize;
  stars[i] = { x: x, y: y, size: size };
}

// Galaxien erstellen
for (let i = 0; i < galaxyCount; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
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
    canvas,
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

populateRocks();

animationInstance = requestAnimationFrame(draw);
