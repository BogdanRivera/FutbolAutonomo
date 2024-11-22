const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carga de imágenes
const leftTeamImage = new Image();
leftTeamImage.src = "./img/master-chief.png";

const rightTeamImage = new Image();
rightTeamImage.src = "./img/elite.png";

const ballImage = new Image();
ballImage.src = "./img/balon.webp";


// Parámetros iniciales
const initialLeftTeamPositions = [
  { x: 150, y: 100, direction: 1, role: 'defender', initialX: 150, initialY: 100 },
  { x: 150, y: 300, direction: 1, role: 'defender', initialX: 150, initialY: 300 },
  { x: 150, y: 500, direction: 1, role: 'defender', initialX: 150, initialY: 500 },
  { x: 300, y: 200, direction: 1, role: 'midfielder', initialX: 300, initialY: 200 },
  { x: 300, y: 400, direction: 1, role: 'midfielder', initialX: 300, initialY: 400 },
  { x: 50, y: 300, direction: 1, role: 'goalkeeper', initialX: 50, initialY: 300, moveDirection: 1 }
];

const initialRightTeamPositions = [
  { x: 850, y: 100, direction: -1, role: 'defender', initialX: 850, initialY: 100 },
  { x: 850, y: 300, direction: -1, role: 'defender', initialX: 850, initialY: 300 },
  { x: 850, y: 500, direction: -1, role: 'defender', initialX: 850, initialY: 500 },
  { x: 700, y: 200, direction: -1, role: 'midfielder', initialX: 700, initialY: 200 },
  { x: 700, y: 400, direction: -1, role: 'midfielder', initialX: 700, initialY: 400 },
  { x: 950, y: 300, direction: -1, role: 'goalkeeper', initialX: 950, initialY: 300, moveDirection: 1 }
];

let leftTeamPositions = JSON.parse(JSON.stringify(initialLeftTeamPositions));
let rightTeamPositions = JSON.parse(JSON.stringify(initialRightTeamPositions));

// Parámetros del balón
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
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
    ctx.drawImage(leftTeamImage, pos.x - 25, pos.y - 25, 50, 50);
  });

  rightTeamPositions.forEach(pos => {
    ctx.drawImage(rightTeamImage, pos.x - 25, pos.y - 25, 50, 50);
  });
}

// Dibujo del balón
function drawBall() {
  ctx.drawImage(ballImage, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

// Movimiento de los jugadores
function movePlayers() {
  leftTeamPositions = leftTeamPositions.map(pos => movePlayerInZone(pos, 'left'));
  rightTeamPositions = rightTeamPositions.map(pos => movePlayerInZone(pos, 'right'));

  moveBall();
  drawField();
  animationId = requestAnimationFrame(movePlayers);
}

// Movimiento en función de la zona asignada

// Movimiento en función de la zona asignada
function movePlayerInZone(pos, team) {
  const areaMargin = 120;

  if (pos.role === 'goalkeeper') {
    // Límite de movimiento vertical del portero
    const goalAreaTop = pos.initialY - areaMargin;
    const goalAreaBottom = pos.initialY + areaMargin;

    // Movimiento simple hacia arriba y abajo dentro del área
    pos.y += pos.moveDirection;

    // Cambiar de dirección al llegar al límite
    if (pos.y <= goalAreaTop || pos.y >= goalAreaBottom) {
      pos.moveDirection *= -1; // Cambia de dirección
    }
  } else {
    const minX = pos.initialX - areaMargin;
    const maxX = pos.initialX + areaMargin;
    const minY = pos.initialY - areaMargin;
    const maxY = pos.initialY + areaMargin;

    if (ball.x < minX || ball.x > maxX || ball.y < minY || ball.y > maxY) {
      // Movimiento gradual hacia la posición inicial cuando el balón está fuera del área asignada
      if (pos.x < pos.initialX) pos.x += 0.5;
      if (pos.x > pos.initialX) pos.x -= 0.5;
      if (pos.y < pos.initialY) pos.y += 0.5;
      if (pos.y > pos.initialY) pos.y -= 0.5;
    } else {
      // Movimiento hacia el balón dentro de la zona específica del jugador
      if (pos.x < ball.x && pos.x < maxX) pos.x += 1;
      if (pos.x > ball.x && pos.x > minX) pos.x -= 1;
      if (pos.y < ball.y && pos.y < maxY) pos.y += 1;
      if (pos.y > ball.y && pos.y > minY) pos.y -= 1;
    }
  }

  // Verificar colisiones y patear el balón si hay contacto
  if (checkCollisions(pos)) kickBall(pos, team);

  return pos;
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

  // Rebote en los bordes izquierdo y derecho (sin portería)
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
    ball.speedX *= -1; // Cambiar dirección en X
    ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x)); // Asegurar que no salga del canvas
  }

  // Verificar si el balón entra completamente en la portería izquierda
  if (
    ball.x - ball.radius <= 15 && // El borde izquierdo del balón toca la línea de la portería izquierda
    ball.x - ball.radius >= 0 && // El balón no se ha ido fuera por el lado izquierdo
    ball.y >= canvas.height / 3 && // Dentro del rango vertical de la portería izquierda
    ball.y <= canvas.height / 4 + canvas.height / 2 && // Dentro del rango vertical de la portería izquierda
    ball.x - ball.radius <= 15 && // El balón debe estar más adentro de la portería
    ball.x - ball.radius > 0 // El balón debe haber pasado la línea de la portería
  ) {
    // Gol para el equipo derecho
    rightScore++;
    updateScoreDisplay();
    resetBall("right"); // El equipo derecho anotó
    return;
  }

  // Verificar si el balón entra completamente en la portería derecha
  if (
    ball.x + ball.radius >= canvas.width - 15 && // El borde derecho del balón toca la línea de la portería derecha
    ball.x + ball.radius <= canvas.width && // El balón no se ha ido fuera por el lado derecho
    ball.y >= canvas.height / 4 && // Dentro del rango vertical de la portería derecha
    ball.y <= canvas.height / 4 + canvas.height / 2 && // Dentro del rango vertical de la portería derecha
    ball.x + ball.radius >= canvas.width - 15 && // El balón debe estar más adentro de la portería
    ball.x + ball.radius < canvas.width // El balón debe haber pasado la línea de la portería
  ) {
    // Gol para el equipo izquierdo
    leftScore++;
    updateScoreDisplay();
    resetBall("left"); // El equipo izquierdo anotó
    return;
  }
}




function resetBall(lastScoringTeam) {
  // Restablecer posición del balón al centro del campo
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = 0; // Detener el movimiento en X
  ball.speedY = 0; // Detener el movimiento en Y
  isBallMoving = false;

  // Esperar 90 segundos antes de mover el balón
  setTimeout(() => {
    // Configurar dirección inicial en función del equipo que anotó
    if (lastScoringTeam === "left") {
      ball.speedX = 10; // Mover hacia la derecha
    } else if (lastScoringTeam === "right") {
      ball.speedX = -10; // Mover hacia la izquierda
    }

    // Configurar velocidad inicial en Y aleatoria
    ball.speedY = Math.random() > 0.5 ? 8 : -8;
    isBallMoving = true;
  }, 1500); // 
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
  ball.speedX = 2;
  ball.speedY = 2;
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