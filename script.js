let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

updateUI();

function spinWheel() {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  // 70% шанс на 0, 30% на билет
  const rand = Math.random();
  const spins = 5;

  // Углы:
  // Билет (в центре): 0
  // Ноль — левее: -75
  const targetAngle = rand < 0.8 ? -75 : 0;

  const rotation = spins * 360 + targetAngle;

  // сброс предыдущего вращения
  wheel.style.transition = 'none';
  wheel.style.transform = `rotate(0deg)`;

  // задержка перед новым вращением, чтобы сброс отработал
  setTimeout(() => {
    wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
    wheel.style.transform = `rotate(${rotation}deg)`;
    overlay.style.transform = `rotate(0deg)`;
  }, 50);

  setTimeout(() => {
    spinning = false;

    const result = targetAngle === 0 ? "билет" : "ноль";

    if (result === "билет") {
      tickets++;
      showTelegramAlert("🎉 Вы получили 1 билет!");
    } else {
      showTelegramAlert("😔 В следующий раз повезёт");
    }

    updateUI();
  }, 3050);
}

btnSpin.addEventListener('click', spinWheel);

function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';

  if (tickets <= 0 && !spinning) {
    btnSpin.src = IMG_SPIN_DISABLED;
  } else if (!spinning) {
    btnSpin.src = IMG_SPIN_NORMAL;
  }
}

function showTelegramAlert(text) {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}
