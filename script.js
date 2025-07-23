let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";
const IMG_SPIN_SPINNING = "IMG_2667.PNG";
const IMG_SPIN_DISABLED = "IMG_2666.PNG";

// Все секторы с типом и углом (0-360)
const sectors = [
  { type: "билет", angle: 90 },
  { type: "звезды", angle: 55 },
  { type: "0", angle: 15 },
  { type: "звезды", angle: 340 },
  { type: "0", angle: 305 },
  { type: "шлем", angle: 270 },
  { type: "билет", angle: 240 },
  { type: "звезды", angle: 200 },
  { type: "билет", angle: 160 },
  { type: "0", angle: 125 },
];

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 5; // количество полных оборотов

  // Выбираем тип с шансом 20% билет, 80% ноль
  const prizeType = Math.random() < 0.2 ? "билет" : "0";

  // Фильтруем сектора по типу
  const allowedSectors = sectors.filter(s => s.type === prizeType);

  // Случайно выбираем сектор из разрешённых
  const selected = allowedSectors[Math.floor(Math.random() * allowedSectors.length)];

  // Вычисляем угол вращения, чтобы selected.angle стал на 90°
  // correctedAngle — сколько повернуть колёсо
  const correctedAngle = 90 - selected.angle;

  // Новое вращение — добавляем полные обороты и корректируем угол
  const newRotation = currentRotation + spins * 360 + correctedAngle;

  // Запускаем анимацию вращения
  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  overlay.style.transform = `rotate(0deg)`;
  wheel.dataset.rotation = newRotation;

  // По окончании вращения через 3 сек
  setTimeout(() => {
    spinning = false;

    // Определяем реальный угол под стрелкой (смотрим где остановились)
    // Угол под стрелкой — всегда 90°, значит угол колеса = newRotation % 360
    // Вращение колеса — это вращение самого изображения, поэтому чтобы получить угол, 
    // который сейчас под стрелкой 90°, считаем:
    const finalRotation = newRotation % 360;
    const actualAngle = (90 - finalRotation + 360) % 360;

    // Функция для определения сектора по углу
    function findSector(angle) {
      // Возьмём ближайший сектор по минимальному расстоянию углов
      let minDiff = 360;
      let foundSector = null;
      for (const s of sectors) {
        let diff = Math.abs(s.angle - angle);
        if (diff > 180) diff = 360 - diff; // учитываем цикличность круга
        if (diff < minDiff) {
          minDiff = diff;
          foundSector = s;
        }
      }
      return foundSector;
    }

    const landedSector = findSector(actualAngle);

    if (landedSector.type === "билет") {
      tickets++;
      showTelegramAlert("🎉 Вы получили 1 билет!");
    } else if (landedSector.type === "0") {
      showTelegramAlert("😔 В следующий раз повезёт");
    } else {
      // Если вдруг выпал запрещённый сектор — предупреждаем (но по логике так быть не должно)
      showTelegramAlert(`Выпал сектор "${landedSector.type}", который не должен выпадать!`);
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
