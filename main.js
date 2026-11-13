// ---------- 1. История браузера ----------

const stateEl = document.getElementById('history-state');
const btnPush = document.getElementById('btn-push');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');

function updateStateDisplay() {
  const s = history.state;
  stateEl.textContent = s ? JSON.stringify(s) : 'нет состояния';
}

window.addEventListener('popstate', updateStateDisplay);

btnPush.addEventListener('click', () => {
  const newState = { page: 'demo-' + Math.random().toFixed(3) };
  history.pushState(newState, '', '#demo');
  updateStateDisplay();
});

btnBack.addEventListener('click', () => history.back());
btnForward.addEventListener('click', () => history.forward());

updateStateDisplay();


// ---------- 2. Canvas и анимация ----------

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const objects = [];
const MOUSE = { x: -9999, y: -9999 };

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  MOUSE.x = e.clientX - rect.left;
  MOUSE.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
  MOUSE.x = -9999;
  MOUSE.y = -9999;
});

class Ball {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.r = 10 + Math.random() * 10;
    this.color = 'hsl(' + Math.floor(Math.random() * 360) + ', 70%, 50%)';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Отскок от стен
    if (this.x - this.r < 0 || this.x + this.r > canvas.width) this.vx *= -1;
    if (this.y - this.r < 0 || this.y + this.r > canvas.height) this.vy *= -1;

    // Лёгкое притяжение к мыши
    const dx = MOUSE.x - this.x;
    const dy = MOUSE.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 200 && dist > 1) {
      const force = 0.05 / (dist * dist + 1);
      this.vx += dx * force;
      this.vy += dy * force;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

for (let i = 0; i < 20; i++) objects.push(new Ball());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.forEach((b) => {
    b.update();
    b.draw();
  });
  requestAnimationFrame(animate);
}
animate();


// ---------- 3. Web Workers ----------

const input = document.getElementById('worker-input');
const btnWorker = document.getElementById('btn-worker');
const statusEl = document.getElementById('worker-status');

function showStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = 'status visible ' + (type || '');
}

// Проверка поддержки воркеров (обработка ошибок среды)
if (typeof Worker === 'undefined') {
  showStatus('Ошибка: браузер не поддерживает Web Workers', 'error');
} else {
  const worker = new Worker('worker.js');

  worker.onmessage = (e) => {
    const { type, n, result, message } = e.data;
    if (type === 'success') {
      showStatus('Успех: факториал(' + n + ') ≈ ' + Number(result).toExponential(4), 'success');
    } else if (type === 'error') {
      showStatus('Ошибка: ' + (message || 'Неизвестная ошибка'), 'error');
    }
  };

  worker.onerror = (err) => {
    showStatus('Ошибка воркера: ' + err.message, 'error');
  };

  btnWorker.addEventListener('click', () => {
    const n = Number(input.value);
    if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
      showStatus('Ошибка: введите целое неотрицательное число', 'error');
      return;
    }
    if (n > 100000) {
      showStatus('Ошибка: число слишком большое (макс. 100000)', 'error');
      return;
    }
    showStatus('Вычисления в фоне...', '');
    worker.postMessage({ n: n });
  });
}
