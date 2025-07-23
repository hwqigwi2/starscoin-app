let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

// Твои сектора с центрами по среднему углу
const sectors = [
  { type: "билет", angle: 87.5 },
  { type: "0", angle: 17.5 },
  { type: "0", angle: 57 },
  { type: "билет", angle: 120 },
  { type: "билет", angle: 162.5 },
  { type: "0", angle: 129 },
];

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 5; // Число полных оборотов

  // Выбираем тип приза с шансом: билет - 25%, ноль - 75%
  const prizeType = Math.random() < 0.25 ? "билет" : "0";

  // Фильтруем возможные секторы по типу
  const possibleSectors = sectors.filter(s => s.type === prizeType);

  // Случайный выбор сектора из подходящих
  const selected = possibleSectors[Math.floor(Math.random() * possibleSectors.length)];

  // Вычисляем угол для вращения: чтобы выбранный сектор оказался под стрелкой (90°)
  const correctedAngle = 90 - selected.angle;
  const newRotation = currentRotation + spins * 360 + correctedAngle;

  // Запускаем анимацию вращения
  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  overlay.style.transform = `rotate(0deg)`;
  wheel.dataset.rotation = newRotation;

  // По окончании вращения
  setTimeout(() => {
    spinning = false;

    if (prizeType === "билет") {
      tickets++;
      showTelegramAlert("🎉 Вы получили 1 билет!");
    } else {
      showTelegramAlert("😔 В следующий раз повезёт");
    }

    btnSpin.src = tickets > 0 ? IMG_SPIN_NORMAL : IMG_SPIN_DISABLED;
    updateUI();
  }, 3000);
});

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
