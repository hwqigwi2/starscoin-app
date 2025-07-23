let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

// Углы секторов (ты сам их выбрал)
const sectors = [
  { type: "билет", angle: 90 },
  { type: "0", angle: 23 },
  { type: "0", angle: 305 },
  { type: "билет", angle: 235 },
  { type: "билет", angle: 165 },
  { type: "0", angle: 130 },
];

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();

  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 5; // Больше оборотов для красоты

  // Выбор "0" или "билет" по шансу
  const prizeType = Math.random() < 0.25 ? "билет" : "0";
  const possibleSectors = sectors.filter(s => s.type === prizeType);
  const selected = possibleSectors[Math.floor(Math.random() * possibleSectors.length)];
  const targetAngle = selected.angle;

  const newRotation = currentRotation + spins * 360 + (360 + targetAngle - 90) % 360;

  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  overlay.style.transform = `rotate(0deg)`;
  wheel.dataset.rotation = newRotation;

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
