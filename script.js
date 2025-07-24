let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

// === Обновление интерфейса ===
function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
  btnSpin.src = spinning
    ? "IMG_2667.PNG"
    : tickets > 0
      ? "IMG_2665.PNG"
      : "IMG_2666.PNG";
}

// === Показ уведомления в Telegram или alert ===
function showTelegramAlert(text) {
  if (Telegram?.WebApp?.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}

// === Кнопка "Крутить колесо" ===
btnSpin.addEventListener('click', spinWheel);

function spinWheel() {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = "IMG_2667.PNG";

  const rand = Math.random();
  const spins = 5;
  const targetAngle = rand < 0.8 ? -75 : 0;
  const rotation = spins * 360 + targetAngle;

  wheel.style.transition = 'none';
  wheel.style.transform = `rotate(0deg)`;

  setTimeout(() => {
    wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
    wheel.style.transform = `rotate(${rotation}deg)`;
  }, 50);

  setTimeout(() => {
    spinning = false;
    if (targetAngle === 0) {
      tickets++;
      showTelegramAlert("🎉 Вы получили 1 билет!");
    } else {
      showTelegramAlert("😔 В следующий раз повезёт");
    }
    updateUI();
  }, 3050);
}

updateUI();

// === Анимация JPG полосы ===
const imgWidth = 45;
const gap = 10;
const visibleCount = 7;
const jpgOrder = [
  2685, 2685, 2681, 2685, 2680,
  2680, 2681, 2680, 2685, 2680,
  2683, 2685, 2682, 2685, 2685,
  2680, 2681, 2685, 2680, 2680,
  2682, 2680, 2680, 2681, 2685,
  2680, 2681, 2685, 2681
];
const jpgStrip = document.getElementById('jpgStrip');
const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";
const STORAGE_KEY = "jpgStripState";
let currentIndex = 0;
let imgs = [];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.currentImgs)) {
      currentIndex = saved.currentIndex;
      return saved.currentImgs;
    }
  } catch {}
  return null;
}

function saveState(currentImgs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentIndex,
    currentImgs
  }));
}

function positionImgs() {
  imgs.forEach((img, i) => {
    img.style.left = `${i * (imgWidth + gap)}px`;
    img.style.opacity = "1";
    img.classList.remove("leaving", "entering");
  });
}

function initJpgStrip() {
  jpgStrip.innerHTML = "";

  const initialIds = loadState() || jpgOrder.slice(0, visibleCount);

  imgs = initialIds.map(id => {
    const img = document.createElement("img");
    img.src = jpgPrefix + id + jpgSuffix;
    jpgStrip.appendChild(img);
    return img;
  });

  positionImgs();

  setInterval(() => {
    const oldImg = imgs.shift();
    oldImg.classList.add("leaving");

    const nextId = jpgOrder[currentIndex % jpgOrder.length];
    const newImg = document.createElement("img");
    newImg.src = jpgPrefix + nextId + jpgSuffix;
    newImg.classList.add("entering");
    jpgStrip.appendChild(newImg);
    imgs.push(newImg);

    setTimeout(() => {
      jpgStrip.removeChild(oldImg);
      positionImgs();
    }, 1000);

    currentIndex++;
    saveState(imgs.map(img => parseInt(img.src.match(/IMG_(\d+)\.JPG/)[1])));
  }, 2300);
}

initJpgStrip();

// === Кнопка "Поделиться" ===
const inviteBtn = document.getElementById('inviteShareBtn');
if (inviteBtn) {
  inviteBtn.addEventListener('click', () => {
    if (Telegram?.WebApp?.shareTelegram) {
      Telegram.WebApp.shareTelegram({
        text: '🎯 Заходи в мини-игру и получай билеты каждый день!',
        url: Telegram.WebApp.initDataUnsafe?.start_param || location.href
      });
    } else {
      alert('Поделиться можно только в Telegram.');
    }
  });
}
