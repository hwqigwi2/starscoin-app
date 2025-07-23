let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

// Чётко определённые секторы
const sectors = {
  zero: {
    type: "0",
    center: 125
  },
  ticket: {
    type: "билет",
    center: 90
  }
};

updateUI();

function spinWheel() {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  const spins = 5;

  // Выбор сектора строго по шансу 80/20
  const rand = Math.random();
  const selected = rand < 0.8 ? sectors.zero : sectors.ticket;

  // Угол для поворота: ровно чтобы нужный сектор встал под стрелку (на 90°)
  const angleToCenter = 90 - selected.center;
  const rotation = spins * 360 + angleToCenter;

  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${rotation}deg)`;
  overlay.style.transform = `rotate(0deg)`;

  setTimeout(() => {
    spinning = false;

    if (selected.type === "билет") {
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
