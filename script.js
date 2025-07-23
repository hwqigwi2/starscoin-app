let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

const sectors = [
  { type: "билет", start: 70, end: 105 },
  { type: "0", start: 0, end: 35 },
  { type: "0", start: 38, end: 76 },
  { type: "билет", start: 100, end: 140 },
  { type: "билет", start: 145, end: 180 },
  { type: "0", start: 113, end: 145 },
];

// Добавим size и center
sectors.forEach(s => {
  if (s.end < s.start) {
    s.size = (360 - s.start) + s.end;
    s.center = (s.start + s.size / 2) % 360;
  } else {
    s.size = s.end - s.start;
    s.center = s.start + s.size / 2;
  }
});

updateUI();

function spinWheel() {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 5;

  const prizeType = Math.random() < 0.25 ? "билет" : "0";

  const filteredSectors = sectors.filter(s => s.type === prizeType);
  const sector = filteredSectors[Math.floor(Math.random() * filteredSectors.length)];

  let randomAngleInSector;
  if (sector.end < sector.start) {
    const randInPart = Math.random() * sector.size;
    randomAngleInSector = (sector.start + randInPart) % 360;
  } else {
    randomAngleInSector = sector.start + Math.random() * sector.size;
  }

  const correctedAngle = 90 - randomAngleInSector;
  const newRotation = currentRotation + spins * 360 + correctedAngle;

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
