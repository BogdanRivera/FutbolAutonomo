const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carga de imágenes
const leftTeamImage = new Image();
leftTeamImage.src = "./img/master-chief.png";

const rightTeamImage = new Image();
rightTeamImage.src = "./img/elite.png";

const ballImage = new Image();
ballImage.src = "./img/balon.webp";

// Definir zonas compartidas entre jugadores del equipo izquierdo y derecho
function getSharedZone(player, team) {
  const areaMargin = 250; // Margen de las zonas
  let sharedZone;

  switch (player.role) {
    case "defender":
      sharedZone = {
        minX: Math.min(player.initialX, canvas.width - player.initialX) - areaMargin,
        maxX: Math.max(player.initialX, canvas.width - player.initialX) + areaMargin,
        minY: player.initialY - areaMargin,
        maxY: player.initialY + areaMargin,
      };
      break;
    case "midfielder":
      sharedZone = {
        minX: Math.min(player.initialX, canvas.width - player.initialX) - areaMargin,
        maxX: Math.max(player.initialX, canvas.width - player.initialX) + areaMargin,
        minY: player.initialY - areaMargin,
        maxY: player.initialY + areaMargin,
      };
      break;
    case "goalkeeper":
      sharedZone = {
        minX: player.initialX - areaMargin,
        maxX: player.initialX + areaMargin,
        minY: player.initialY - areaMargin,
        maxY: player.initialY + areaMargin,
      };
      break;
  }
  return sharedZone;
}



// Parámetros iniciales para 8 jugadores por equipo
const initialLeftTeamPositions = [
  { x: 150, y: 100, direction: 1, role: 'defender', initialX: 150, initialY: 100 },
  { x: 150, y: 500, direction: 1, role: 'defender', initialX: 150, initialY: 500 },
  { x: 300, y: 200, direction: 1, role: 'midfielder', initialX: 300, initialY: 200 },
  { x: 300, y: 400, direction: 1, role: 'midfielder', initialX: 300, initialY: 400 },
  { x: 50, y: 300, direction: 1, role: 'goalkeeper', initialX: 50, initialY: 300, moveDirection: 1 },
  { x: 200, y: 150, direction: 1, role: 'midfielder', initialX: 200, initialY: 150 },
  { x: 200, y: 450, direction: 1, role: 'defender', initialX: 200, initialY: 450 },
  { x: 350, y: 300, direction: 1, role: 'midfielder', initialX: 350, initialY: 300 }
];

const initialRightTeamPositions = [
  { x: 850, y: 100, direction: -1, role: 'defender', initialX: 850, initialY: 100 },
  { x: 850, y: 500, direction: -1, role: 'defender', initialX: 850, initialY: 500 },
  { x: 700, y: 200, direction: -1, role: 'midfielder', initialX: 700, initialY: 200 },
  { x: 700, y: 400, direction: -1, role: 'midfielder', initialX: 700, initialY: 400 },
  { x: 950, y: 300, direction: -1, role: 'goalkeeper', initialX: 950, initialY: 300, moveDirection: 1 },
  { x: 800, y: 150, direction: -1, role: 'midfielder', initialX: 800, initialY: 150 },
  { x: 800, y: 450, direction: -1, role: 'defender', initialX: 800, initialY: 450 },
  { x: 650, y: 300, direction: -1, role: 'midfielder', initialX: 650, initialY: 300 }
];

let leftTeamPositions = JSON.parse(JSON.stringify(initialLeftTeamPositions));
let rightTeamPositions = JSON.parse(JSON.stringify(initialRightTeamPositions));

// Parámetros del balón
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speedX: 80, // Velocidad fija X
  speedY: 60, // Velocidad fija Y
};

// Variables de marcador
let leftScore = 0;
let rightScore = 0;

const maxBallSpeed = 100; // Velocidad máxima



// Variables de animación y cronómetro
let animationId;
let isMoving = false;
let isBallMoving = false;
let initialTime = 300; // 5 minutos en segundos
let remainingTime = initialTime;
let timerInterval;

// Función de cronómetro
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
  const seconds = (remainingTime % 60).toString().padStart(2, '0');
  document.querySelector(".timer p").textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime -= 1;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      cancelAnimationFrame(animationId);
      displayEndGameMessage(); // Mostrar el mensaje del ganador o empate
      document.querySelector(".btn.btn-success").disabled = true; // Desactivar botón de inicio
      document.querySelector(".btn.btn-danger").disabled = true; // Desactivar botón de paro
    }
  }, 1000);
}

function displayEndGameMessage() {
  let message = "";
  if (leftScore > rightScore) {
    message = "¡Equipo izquierdo gana!";
  } else if (rightScore > leftScore) {
    message = "¡Equipo derecho gana!";
  } else {
    message = "¡Es un empate!";
  }

  alert(message); // Mostrar el mensaje al usuario
}




function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  remainingTime = initialTime;
  updateTimerDisplay();
}

// Dibujo del campo y los jugadores
// Dibujo del campo y los jugadores
function drawField() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  drawGoals(); // Dibuja las porterías ampliadas

  drawPlayers();
  drawBall();
}

// Dibujo de los jugadores
function drawPlayers() {
  leftTeamPositions.forEach(pos => {
    ctx.drawImage(leftTeamImage, pos.x - 25, pos.y - 25, 40, 40);
  });

  rightTeamPositions.forEach(pos => {
    ctx.drawImage(rightTeamImage, pos.x - 25, pos.y - 25, 40, 40);
  });
}

// Dibujo del balón
function drawBall() {
  ctx.drawImage(ballImage, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

function movePlayers() {
  // Primero movemos a los jugadores en su zona respectiva
  leftTeamPositions = leftTeamPositions.map(pos => movePlayerInZone(pos, 'left'));
  rightTeamPositions = rightTeamPositions.map(pos => movePlayerInZone(pos, 'right'));

  // Verificamos las colisiones entre los jugadores del mismo equipo
  for (let i = 0; i < leftTeamPositions.length; i++) {
    for (let j = i + 1; j < leftTeamPositions.length; j++) {
      checkPlayerCollisionsSameTeam(leftTeamPositions[i], leftTeamPositions[j]);
    }
  }

  for (let i = 0; i < rightTeamPositions.length; i++) {
    for (let j = i + 1; j < rightTeamPositions.length; j++) {
      checkPlayerCollisionsSameTeam(rightTeamPositions[i], rightTeamPositions[j]);
    }
  }

  // Verificamos las colisiones entre jugadores de ambos equipos
  for (let i = 0; i < leftTeamPositions.length; i++) {
    for (let j = 0; j < rightTeamPositions.length; j++) {
      checkPlayerCollisions(leftTeamPositions[i], rightTeamPositions[j]);
    }
  }

  // Movemos el balón
  moveBall();
  drawField();
  animationId = requestAnimationFrame(movePlayers);
}



// Movimiento en función de la zona asignada
function movePlayerInZone(player, team) {
  const sharedZone = getSharedZone(player, team);

  // Establecemos un rango de velocidad aleatoria para los jugadores
  const randomSpeed = 1 + Math.random() * 2.6; // Velocidades aleatorias entre 1 y 3 unidades

  if (player.role === "goalkeeper") {
    // Movimiento simple para los porteros en sus límites
    player.y += player.moveDirection * randomSpeed;
    const goalAreaTop = player.initialY - 120;
    const goalAreaBottom = player.initialY + 120;

    if (player.y <= goalAreaTop || player.y >= goalAreaBottom) {
      player.moveDirection *= -1; // Cambiar dirección de movimiento
    }
  } else {
    if (
      ball.x < sharedZone.minX || ball.x > sharedZone.maxX || 
      ball.y < sharedZone.minY || ball.y > sharedZone.maxY
    ) {
      // Movimiento gradual hacia la posición inicial
      if (player.x < player.initialX) player.x += randomSpeed;
      if (player.x > player.initialX) player.x -= randomSpeed;
      if (player.y < player.initialY) player.y += randomSpeed;
      if (player.y > player.initialY) player.y -= randomSpeed;
    } else {
      // Movimiento hacia el balón dentro de la zona compartida
      if (player.x < ball.x && player.x < sharedZone.maxX) player.x += randomSpeed;
      if (player.x > ball.x && player.x > sharedZone.minX) player.x -= randomSpeed;
      if (player.y < ball.y && player.y < sharedZone.maxY) player.y += randomSpeed;
      if (player.y > ball.y && player.y > sharedZone.minY) player.y -= randomSpeed;
    }
  }

  // Verificar colisiones y patear el balón
  if (checkCollisions(player)) kickBall(player, team);

  return player;
}


function checkPlayerCollisions(playerA, playerB) {
  const distance = Math.hypot(playerA.x - playerB.x, playerA.y - playerB.y);
  const minDistance = 30; // Distancia mínima para que se consideren como "colisión" (puedes ajustarlo)

  if (distance < minDistance) {
    // Repulsión simple: mover los jugadores en direcciones opuestas
    const angle = Math.atan2(playerB.y - playerA.y, playerB.x - playerA.x);
    const force = 3; // Fuerza de repulsión más fuerte

    // Repulsión en el eje X y Y
    playerA.x -= Math.cos(angle) * force;
    playerA.y -= Math.sin(angle) * force;
    playerB.x += Math.cos(angle) * force;
    playerB.y += Math.sin(angle) * force;
  }
}

function checkPlayerCollisionsSameTeam(playerA, playerB) {
  const distance = Math.hypot(playerA.x - playerB.x, playerA.y - playerB.y);
  const minDistance = 20; // Distancia mínima para que se consideren como "colisión" entre jugadores del mismo equipo

  if (distance < minDistance) {
    // Repulsión simple: mover los jugadores en direcciones opuestas
    const angle = Math.atan2(playerB.y - playerA.y, playerB.x - playerA.x);
    const force = 3; // Fuerza de repulsión más fuerte

    // Repulsión en el eje X y Y
    playerA.x -= Math.cos(angle) * force;
    playerA.y -= Math.sin(angle) * force;
    playerB.x += Math.cos(angle) * force;
    playerB.y += Math.sin(angle) * force;
  }
}








// Verificar colisiones
function checkCollisions(player) {
  const distance = Math.hypot(ball.x - player.x, ball.y - player.y);
  return distance < ball.radius + 25;
}


function kickBall(player, team) {
    // Se asegura de que el balón siempre tenga una dirección consistente
    if (team === 'left') {
      ball.speedX = Math.abs(ball.speedX); // Mantener velocidad positiva
    } else {
      ball.speedX = -Math.abs(ball.speedX); // Mantener velocidad negativa
    }
  
    // La velocidad en Y puede ser ligeramente ajustada aleatoriamente, pero sin aceleración
    ball.speedY += (Math.random() * 2 - 1) * 0.5;
    ball.speedY = Math.max(-5, Math.min(5, ball.speedY)); // Limitar la velocidad Y
}


// Parámetros para las porterías
const goalWidth = 80; // Ancho ampliado de la portería
const goalHeight = canvas.height / 2 // Alto de la portería
const goalTop = canvas.height / 4; // Altura desde la parte superior


function moveBall() {
  // Limitar las velocidades del balón
  ball.speedX = Math.max(-maxBallSpeed, Math.min(maxBallSpeed, ball.speedX));
  ball.speedY = Math.max(-maxBallSpeed, Math.min(maxBallSpeed, ball.speedY));

  // Actualizar posición del balón
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Rebote en las paredes superior e inferior
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY *= -1; // Cambiar dirección en Y
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y)); // Asegurar que no salga del canvas
  }

  // Verificar si el balón entra completamente en la portería izquierda
  if (
    ball.x - ball.radius <= 0 && // El balón cruza completamente la línea izquierda
    ball.y + ball.radius >= goalTop && // Dentro del rango vertical superior de la portería
    ball.y - ball.radius <= goalTop + goalHeight // Dentro del rango vertical inferior de la portería
  ) {
    // Gol para el equipo derecho
    rightScore++;
    updateScoreDisplay();
    resetBall("right");
    return;
  }

  // Verificar si el balón entra completamente en la portería derecha
  if (
    ball.x + ball.radius >= canvas.width && // El balón cruza completamente la línea derecha
    ball.y + ball.radius >= goalTop && // Dentro del rango vertical superior de la portería
    ball.y - ball.radius <= goalTop + goalHeight // Dentro del rango vertical inferior de la portería
  ) {
    // Gol para el equipo izquierdo
    leftScore++;
    updateScoreDisplay();
    resetBall("left");
    return;
  }

  // Rebote en los bordes izquierdo y derecho (fuera de las porterías)
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
    ball.speedX *= -1; // Cambiar dirección en X
    ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x)); // Asegurar que no salga del canvas
  }
}





function resetBall(lastScoringTeam) {
  // Restablecer posición del balón al centro del campo
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = 0; // Detener el movimiento en X
  ball.speedY = 0; // Detener el movimiento en Y
  isBallMoving = false;

  // Configuración para reiniciar el balón y posiciones de jugadores
  let resetting = true; // Indicador para reinicio gradual
  const tolerance = 100; // Tolerancia para las posiciones iniciales

  function gradualReset() {
    // Mover jugadores gradualmente a sus posiciones iniciales
    let allPlayersReady = true;

    leftTeamPositions.forEach(player => {
      if (Math.abs(player.x - player.initialX) > tolerance) {
        player.x += player.x < player.initialX ? 15 : -15;
        allPlayersReady = false;
      }
      if (Math.abs(player.y - player.initialY) > tolerance) {
        player.y += player.y < player.initialY ? 15 : -15;
        allPlayersReady = false;
      }
    });

    rightTeamPositions.forEach(player => {
      if (Math.abs(player.x - player.initialX) > tolerance) {
        player.x += player.x < player.initialX ? 15 : -15;
        allPlayersReady = false;
      }
      if (Math.abs(player.y - player.initialY) > tolerance) {
        player.y += player.y < player.initialY ? 15 : -15;
        allPlayersReady = false;
      }
    });

    // Redibujar el campo mientras los jugadores regresan a sus posiciones
    drawField();

    if (allPlayersReady) {
      resetting = false; // Terminar reinicio gradual
      // Configurar dirección inicial en función del equipo que anotó
      if (lastScoringTeam === "left") {
        ball.speedX = 6; // Mover hacia la derecha
      } else if (lastScoringTeam === "right") {
        ball.speedX = -6; // Mover hacia la izquierda
      }
      ball.speedY = Math.random() > 0.5 ? 4 : -4; // Dirección aleatoria en Y
      isBallMoving = true; // Reiniciar movimiento del balón
    } else {
      requestAnimationFrame(gradualReset); // Continuar el proceso de reinicio
    }
  }

  // Iniciar el proceso de reinicio gradual
  if (resetting) requestAnimationFrame(gradualReset);
}








// Actualizar la visualización del marcador
function updateScoreDisplay() {
  document.querySelector(".score p").textContent = `${leftScore} - ${rightScore}`;
}

// Listener para iniciar el juego
document.querySelector(".btn.btn-success").addEventListener("click", () => {
  if (!isMoving) {
    isMoving = true;
    if (!isBallMoving) {
      // Aumentar la velocidad inicial del balón
      ball.speedX = Math.random() > 0.5 ? 10 : -10;
      ball.speedY = Math.random() > 0.5 ? 8 : -8;
      isBallMoving = true;
    }
    movePlayers();
    startTimer();
    document.querySelector(".btn.btn-success").disabled = true;
  }
});


// Listener para detener el juego
document.querySelector(".btn.btn-danger").addEventListener("click", () => {
  isMoving = false;
  cancelAnimationFrame(animationId);
  stopTimer();
  document.querySelector(".btn.btn-success").disabled = false;
});

// Listener para reiniciar el juego
document.querySelector(".btn.btn-warning").addEventListener("click", () => {
  isMoving = false;
  cancelAnimationFrame(animationId);
  stopTimer();
  resetTimer();

  leftTeamPositions = JSON.parse(JSON.stringify(initialLeftTeamPositions));
  rightTeamPositions = JSON.parse(JSON.stringify(initialRightTeamPositions));

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = 4;
  ball.speedY = 4;
  isBallMoving = false;

  // Reiniciar marcador
  leftScore = 0;
  rightScore = 0;
  updateScoreDisplay(); // Actualizar la visualización del marcador

  drawField();
    // Habilitar los botones de inicio y paro
    document.querySelector(".btn.btn-success").disabled = false;
    document.querySelector(".btn.btn-danger").disabled = false;
});


leftTeamImage.onload = rightTeamImage.onload = ballImage.onload = drawField;
resetTimer();

function drawGoals() {
  // Portería izquierda
  ctx.strokeRect(0, canvas.height / 4, goalWidth, goalHeight); // Ampliada a 100px de ancho

  // Portería derecha
  ctx.strokeRect(canvas.width - goalWidth, canvas.height / 4, goalWidth, goalHeight); // Ampliada a 100px de ancho
}

/*
Delimitar la porteria 
Mezclar los agentes
Velocidad del balón
*/