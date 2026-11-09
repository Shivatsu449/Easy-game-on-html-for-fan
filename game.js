const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки
let gameOver = false;
let score = 0;
let speed = 5;

// Игрок
const player = {
  x: canvas.width / 2 - 16,
  y: canvas.height - 100,
  width: 32,
  height: 64,
  color: "#ff3535"
};

// Противники
const enemies = [];
for (let i = 0; i < 4; i++) {
  enemies.push({
    x: 100 + Math.random() * 250,
    y: Math.random() * -400,
    width: 32,
    height: 64,
    color: "#00c3ff",
    speedOffset: Math.random() * 2
  });
}

// Разметка дороги
const lines = [];
for (let i = 0; i < 15; i++) {
  lines.push({ x: canvas.width / 2 - 5, y: i * 60, width: 10, height: 40 });
}

// Декорации (здания)
const buildings = [];
for (let i = 0; i < 6; i++) {
  buildings.push({
    x: Math.random() * canvas.width,
    y: Math.random() * -600,
    width: 40 + Math.random() * 40,
    height: 100 + Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 40%, 50%)`
  });
}

// Управление
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Обновление
function update() {
  if (gameOver) return;

  // Ускорение
  if (keys["KeyW"]) speed = Math.min(speed + 0.05, 10);
  else speed = Math.max(speed - 0.02, 5);

  // Движение игрока
  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= 5;
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += 5;

  player.x = Math.max(70, Math.min(player.x, canvas.width - 100));

  // Разметка
  for (let line of lines) {
    line.y += speed;
    if (line.y > canvas.height) line.y = -60;
  }

  // Декорации
  for (let b of buildings) {
    b.y += speed * 0.5;
    if (b.y > canvas.height) {
      b.y = -b.height - 100;
      b.x = Math.random() * canvas.width;
      b.color = `hsl(${Math.random() * 360}, 40%, 50%)`;
    }
  }

  // Противники
  for (let enemy of enemies) {
    enemy.y += speed + enemy.speedOffset;
    if (enemy.y > canvas.height) {
      enemy.y = -200 - Math.random() * 300;
      enemy.x = 100 + Math.random() * 250;
      score++;
    }

    // Столкновение
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      gameOver = true;
      explode(player.x + 16, player.y + 32);
    }
  }
}

// Эффект взрыва
const particles = [];
function explode(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x, y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      size: 4,
      color: "orange",
      life: 60
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    p.size *= 0.95;
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

// Отрисовка
function draw() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Здания
  for (let b of buildings) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }

  // Дорога
  ctx.fillStyle = "#444";
  ctx.fillRect(60, 0, canvas.width - 120, canvas.height);

  // Разметка
  ctx.fillStyle = "#fff";
  for (let line of lines) {
    ctx.fillRect(line.x, line.y, line.width, line.height);
  }

  // Противники
  for (let enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  // Игрок
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Частицы (взрыв)
  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  // Счёт
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText("Счёт: " + score, 20, 30);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px monospace";
    ctx.fillText("💥 GAME OVER 💥", 60, 300);
    ctx.font = "20px monospace";
    ctx.fillText("Нажми R, чтобы перезапустить", 80, 340);
  }
}

function loop() {
  update();
  updateParticles();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  if (e.code === "KeyR" && gameOver) {
    player.x = canvas.width / 2 - 16;
    player.y = canvas.height - 100;
    score = 0;
    speed = 5;
    gameOver = false;
    enemies.forEach(enemy => {
      enemy.y = Math.random() * -500;
      enemy.x = 100 + Math.random() * 250;
    });
  }
});

loop();
