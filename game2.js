/* global Asteroid, Rock, RadialProjectile, Particle, Galaxy */
/* global GSAP */
var animationInstance;
let lastTimestamp;
const TWO_PI = Math.PI * 2;
let debug = false;
let canvas = document.querySelector("canvas");
const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
let ctx = canvas.getContext("2d");
let audioPlaying = false;
let showHelp = false;
let score = 0;
let shipLives = 3;
let currentLife = 0;
let shipHitCount = 0;
let SHOOTING_CHANCE = 0.0075;
let backgroundMusic = document.querySelector("#backgroundMusic");
let liveEl = document.querySelector("#liveEl");
let scoreEl = document.querySelector("#scoreEl");
let radialProjectiles = [];
let trackPlaying = 0;
let trackTitle = document.querySelector("#trackTitle");
let trackDiv = document.querySelector("#titleDiv");
let tracks = [
  {
    title: "When the Siren sounds",
    track: "track_0.mp3",
  },
  {
    title: "Flying",
    track: "track_2.mp3",
  },
  {
    title: "Pulse",
    track: "track_3.mp3",
  },
  {
    title: "XENON 3 Gigablast",
    track: "track_4.mp3",
  },
  {
    title: "XENON 2 Megablast",
    track: "track_5.mp3",
  },
];
let touchLastX = 0;
let touchLastY = 0;

const keyMap = {
  39: "rightPressed",
  37: "leftPressed",
  38: "upPressed",
  40: "downPressed",
  32: "spacePressed",
  67: "cPressed",
  84: "tPressed",
  68: "dPressed",
  77: "mPressed",
  72: "hPressed",
};

let explosionSound = document.getElementById("explosion");
let help = document.getElementById("help");

// Fruchtkategorien, Farben repräsentieren unterschiedliche Früchte
let fruitCategories = ["red", "green", "cyan", "orange", "purple"];

// Fruchtvariablen
let fruitCreationTimer = Date.now();
let fruitWidth = 30;
let fruitHeight = 30;
let fruitSpeed = 3;
let fruits = [];
let fruitProjectiles = [];
let fruitSideways = false;

// Soundeffekt
let shootSound = new Audio("shoot.wav");
shootSound.volume = 0.2;

// Player sprite
const playerSprite = document.getElementById("playerSprite");

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var spacePressed = false;
var cPressed = false;
var tPressed = false;
var dPressed = false;
var mPressed = false;
var hPressed = false;

// Spielvariablen
let playerWidth = 64;
let playerHeight = 64;
let playerX = canvas.width / 2;
let playerY = (canvas.height / 8) * 7;
let playerSpeed = 8;

// Projektilvariablen
let particles = [];
let projectileWidth = 10;
let projectileHeight = 10;
let projectileSpeed = 10;
let projectiles = [];

let starCount = 250; // Anzahl der Sterne, die zufällig platziert werden
let stars = [];

// Galaxiendefinitionen
const galaxyColors = ["white", "yellow", "orange", "lightblue"];
let galaxySizes = [2, 3, 5, 7];
let galaxySpeedBase = 0.05;
let galaxyCount = 5;
let galaxies = [];

// Asteroidenvariablen
let asteroidSize = 20;
let asteroids = [];
let asteroidSpawnTimer = Date.now();
let asteroidSpeed = 7;
let asteroidSprite = new Image();
asteroidSprite.src = "asteroid.png";

// Felsenformation
let leftRocks = [];
let rightRocks = [];

// Funktion zum Erzeugen von Asteroiden
function createAsteroid() {
  const currentTime = Date.now();
  if (currentTime - asteroidSpawnTimer < 500) return;

  const positionX = Math.random() * (canvas.width - asteroidSize);
  asteroids.push(
    new Asteroid(
      positionX,
      -asteroidSize,
      Math.random() * asteroidSize,
      Math.random() * asteroidSpeed + 3,
      Math.random() * TWO_PI,
      asteroidSprite
    )
  );

  asteroidSpawnTimer = currentTime;
}

function updateAndDrawAsteroids() {
  createAsteroid();
  asteroids = asteroids.filter((asteroid) => {
    asteroid.update();

    return asteroid.y < canvas.height;
  });
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
      fruit.x + fruit.width / 2,
      fruit.y + fruit.height / 2,
      fruit.width / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Dreieck
    ctx.beginPath();
    ctx.moveTo(fruit.x + fruit.width / 2, fruit.y + fruit.height); // Spitze nach unten
    ctx.lineTo(fruit.x, fruit.y); // obere linke Ecke
    ctx.lineTo(fruit.x + fruit.width, fruit.y); // obere rechte Ecke
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Fünfeck
    ctx.beginPath();
    ctx.moveTo(fruit.x + fruit.width / 2, fruit.y);
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
    ctx.lineTo(fruit.x + fruit.width / 2, fruit.y + fruit.height);
    ctx.lineTo(fruit.x, fruit.y + radius);
    ctx.quadraticCurveTo(fruit.x, fruit.y, fruit.x + radius, fruit.y);
    ctx.closePath();
    ctx.fill();
  },
  function (fruit) {
    // Stern
    const spikes = 5;
    const outerRadius = fruit.width / 2;
    const innerRadius = fruit.width / 4;
    var rotation = (Math.PI / 2) * 3;
    const x = fruit.x + fruit.width / 2;
    const y = fruit.y + fruit.height / 2;
    var step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      xValue = x + Math.cos(rotation) * outerRadius;
      yValue = y + Math.sin(rotation) * outerRadius;
      ctx.lineTo(xValue, yValue);
      rotation += step;

      xValue = x + Math.cos(rotation) * innerRadius;
      yValue = y + Math.sin(rotation) * innerRadius;
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
let rockHeight = 100;
let variance = 50;
let maxOffset = 0;
function populateRocks() {
  let offset = 0; // aktuelle Höhenänderung für die Felsen

  for (let i = 0; i < canvas.height * 2; i += rockHeight + offset) {
    let randLeft = Math.random() * variance + 10;
    let randRight = Math.random() * variance + 10;
    offset = Math.random() * maxOffset; // aktualisiere die Höhenänderung für die nächsten Felsen

    leftRocks.push(new Rock(0, i, rockHeight, randLeft, 5));
    rightRocks.push(
      new Rock(canvas.width - randRight, i, rockHeight, randRight, 5)
    );
  }
}

function updateRocks() {
  leftRocks.forEach((rock) => {
    rock.update();
    rock.draw();
  });
  rightRocks.forEach((rock) => {
    rock.update();
    rock.draw();
  });
}

// Radiales Projektil abfeuern
function fireRadialProjectile() {
  const numberOfProjectiles = 36; // Anzahl der radialen Projektile
  const speed = 7; // Geschwindigkeit der radialen Projektile
  const posX = playerX + playerWidth / 2;
  const posY = playerY + playerHeight / 2;
  const angleIncrement = TWO_PI / numberOfProjectiles;

  for (let i = 0; i < numberOfProjectiles; i++) {
    let angle = angleIncrement * i;
    let speedX = Math.cos(angle) * speed;
    let speedY = Math.sin(angle) * speed;

    // Projektile in Liste aufnehmen und sie von der Position des Spielers aus abfeuern
    radialProjectiles.push(new RadialProjectile(posX, posY, speedX, speedY, 4));
  }
}

function createParticles(x, y, color) {
  const numberOfParticles = 50;
  particles.push(
    ...new Array(numberOfParticles)
      .fill()
      .map((_, i) => new Particle(x, y, colorFromRatio(i / numberOfParticles)))
  );
}

function colorFromRatio(ratio) {
  const hue = ratio * 40; // Adjust for desired color range (here it's set to yellow-red gradient)
  return `hsl(${hue}, 100%, 50%)`;
}

function createFruit() {
  const currentTime = Date.now();

  if (currentTime - fruitCreationTimer < 750) return;

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

  fruitSideways = Math.random() < 0.2;
  fruitCreationTimer = currentTime;
}

// Früchte zeichnen
function drawFruits() {
  const halfPlayerWidth = playerWidth / 2;
  const halfPlayerHeight = playerHeight / 2;
  fruits = fruits.filter((fruit) => {
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
        const tw = measure.width / 2;
        const tx = fruit.x + fruit.width / 2 - tw;
        const ty = fruit.y + fruit.height / 2;
        ctx.fillText("S", tx, ty);
      }
    }

    fruit.x += fruit.speedX;
    fruit.y += fruit.speedY;

    if (
      Math.random() < SHOOTING_CHANCE &&
      fruit.y < playerY &&
      !fruit.sideWays
    ) {
      const projectileX = fruit.x + fruit.width / 2;
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
    } else {
      return fruit.y < canvas.height;
    }
  });
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener(
  "touchstart",
  function (e) {
    var touch = e.touches[0];
    touchLastX = touch.pageX;
    touchLastY = touch.pageY;
  },
  false
);
document.addEventListener(
  "touchmove",
  function (e) {
    console.log("Moving ...");
    var touch = e.touches[0];

    console.log(`${touchLastX} / ${touchLastX}`);

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
    // Hier kann optional Logik hinzugefügt werden, die ausgeführt wird, wenn der Benutzer die Berührung beendet
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
function updateBackground() {
  stars.forEach((star) => {
    star.y = (star.y + 0.5) % canvas.height;
  });
  galaxies.forEach((galaxy) => galaxy.update());
}

function keyDownHandler(event) {
  if (debug) console.log(event);

  const key = keyMap[event.keyCode];
  if (key) {
    window[key] = true;
  }
  if (hPressed) {
    hPressed = false;
    help.style.display = !showHelp ? "inline-block" : "none";
    showHelp = !showHelp;
    if (!showHelp) {
      animationInstance = requestAnimationFrame(draw);
    }
    console.log(showHelp);
  }
}

function keyUpHandler(event) {
  const key = keyMap[event.keyCode];
  if (key) {
    window[key] = false;
  }
}

function checkFruitProjectileHitShip(projectiles, player) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (checkCollision(projectiles[i], player)) {
      createParticles(
        playerX + playerWidth / 2,
        playerY + playerHeight / 2,
        "white"
      );
      explosionSound.currentTime = 0;
      //explosionSound.play();
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
          p[i].x + p[i].width / 2,
          p[i].y + p[i].height / 2,
          fruits[j].category
        );
        explosionSound.currentTime = 0;
        explosionSound.play();
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

// Zeichnen und Bewegen der radialen Projektile
function updateAndDrawRadialProjectiles() {
  for (var i = 0; i < radialProjectiles.length; i++) {
    radialProjectiles[i].update();
    radialProjectiles[i].draw();
    if (
      radialProjectiles[i].x < 0 ||
      radialProjectiles[i].x > canvas.width ||
      radialProjectiles[i].y < 0 ||
      radialProjectiles[i].y > canvas.height
    ) {
      radialProjectiles.splice(i, 1);
    }
  }
}

// Score anzeigen
function drawScore() {
  scoreEl.innerHTML = score;
}

// Spiel-Loop
function draw(timestamp) {
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  if (showHelp) return;

  drawBackground();
  updateBackground();
  drawScore();
  createFruit();
  drawFruits();
  updateAndDrawAsteroids();
  updateRocks();

  // Spieler zeichnen
  ctx.drawImage(playerSprite, playerX, playerY, playerWidth, playerHeight);
  if (debug) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
  }

  // Raumschiff-Projektil zeichnen
  for (let { x, y } of projectiles) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, TWO_PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();
  }

  updateAndDrawRadialProjectiles();

  // Früchte-Projektil zeichnen
  for (let { category, x, y } of fruitProjectiles) {
    ctx.beginPath();
    ctx.fillStyle = "yellow"; //category;
    ctx.strokeStyle = "white";
    ctx.arc(x, y, 3, 0, TWO_PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  // Spielerbewegung
  if (rightPressed && playerX < canvas.width - playerWidth) {
    playerX += playerSpeed;
  } else if (leftPressed && playerX > 0) {
    playerX -= playerSpeed;
  }

  if (upPressed && playerY > 0) {
    playerY -= playerSpeed;
  } else if (downPressed && playerY < canvas.height - playerHeight) {
    playerY += playerSpeed;
  }

  // Raumschiff-Projektilbewegung
  projectiles = projectiles.filter((proj) => {
    proj.y -= proj.speed;
    // return true if the projectile is within the canvas
    return !(proj.y < 0);
  });

  // Früchte-Projektilbewegung
  fruitProjectiles = fruitProjectiles.filter((proj, i) => {
    proj.x += proj.speedX;
    proj.y += proj.speedY;

    // return true if the projectile is within the canvas
    return !(
      proj.y > canvas.height ||
      proj.y < 0 ||
      proj.x < 0 ||
      proj.x > canvas.width
    );
  });

  // Raumschiff-Projektil abfeuern
  if (spacePressed) {
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
    spacePressed = false;
    shootSound.currentTime = 0;
    shootSound.play();
  }
  if (cPressed) {
    fireRadialProjectile();
    cPressed = false;
    shootSound.currentTime = 0;
    shootSound.play();
  }
  if (tPressed) {
    tPressed = false;
    nextTrack();
  }
  if (dPressed) {
    dPressed = false;
    debug = !debug;
  }
  if (mPressed) {
    mPressed = false;

    if (audioPlaying) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    } else {
      trackPlaying = -1;
      backgroundMusic.volume = 0.1; // Lautstärke einstellen (0.0 - 1.0)
      nextTrack();
    }
    audioPlaying = !audioPlaying;
  }

  checkProjectileHitFruit(projectiles);

  checkProjectileHitFruit(radialProjectiles);

  checkFruitProjectileHitShip(fruitProjectiles, {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight,
  });

  // Zeichnen und Aktualisieren der Partikel
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
    particles[i].update();

    // Partikel entfernen, wenn die Größe kleiner als 0.2 ist
    if (particles[i].size <= 0.1) {
      particles.splice(i, 1);
      i--; // Die Positionsindeksierung ausichen
    }
  }

  // Hint for Help ...
  ctx.fillStyle = "white";
  ctx.fillText("H for Help", 5, canvas.height - 5);

  animationInstance = requestAnimationFrame(draw);
}

function nextTrack() {
  backgroundMusic.volume = 0.1; // Lautstärke einstellen (0.0 - 1.0)
  trackPlaying++;
  if (trackPlaying >= tracks.length) trackPlaying = 0;
  backgroundMusic.src = tracks[trackPlaying].track;
  trackTitle.innerHTML = tracks[trackPlaying].title;
  backgroundMusic.play();
  gsap.fromTo(
    trackDiv,
    {
      opacity: 1,
    },
    {
      duration: 8,
      opacity: 0,
      delay: 3,
    }
  );
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
    animationInstance = requestAnimationFrame(draw);
    console.log(`[${str}] Animation resumed`);
  }
}

backgroundMusic.onended = function () {
  nextTrack();
};

// Erstellt Sterne mit zufälligen Positionen und Größe
for (let i = 0; i < starCount; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let size = Math.random() * 2;
  stars[i] = { x: x, y: y, size: size };
}

// Galaxien erstellen
for (let i = 0; i < galaxyCount; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let size = galaxySizes[Math.floor(Math.random() * galaxySizes.length)];
  let speed = galaxySpeedBase + size / 5;
  let color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];

  galaxies[i] = new Galaxy(x, y, size, speed, color);
}

populateRocks();

draw();
