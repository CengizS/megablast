// Pseudo-code overview:

// Globals and game state:
let canvas, ctx, playerX, playerY, score, fruits, projectiles, asteroids;

// Handle input events:
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(event) { /*...*/ }
function keyUpHandler(event) { /*...*/ }

// Game logic functions:
function createFruit() { /*...*/ }
function createAsteroid() { /*...*/ }
function shoot() { /*...*/ }
function checkCollision(object1, object2) { /*...*/ }
function checkProjectileHitFruit(p) { /*...*/ }
function checkFruitProjectileHitShip(projectiles, player) { /*...*/ }

// Drawing functions:
function drawBackground() { /*...*/ }
function drawFruits() { /*...*/ }
function drawPlayer() { /*...*/ }
function drawProjectiles() { /*...*/ }
function drawScore() { /*...*/ }

// Main game loop:
function draw(timestamp) {
  // drawing and updating
  drawBackground();
  drawFruits();
  drawPlayer();
  drawProjectiles();
  drawScore();
  
  // game logic
  createFruit();
  createAsteroid();
  shoot();
  checkProjectileHitFruit(projectiles);
  checkFruitProjectileHitShip(fruitProjectiles, player);
 
  requestAnimationFrame(draw);
}

// Start game:
draw();
