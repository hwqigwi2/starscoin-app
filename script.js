let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

updateUI();

// Получаем userId и формируем реферальную ссылку
let userId = null;
let refLink = null;

if (window.Telegram && Telegram.WebApp) {
  userId = Telegram.WebApp.initDataUnsafe?.user?.id || null;
  
  // Обработка реферального перехода
  const startParam = Telegram.WebApp.initDataUnsafe?.start_param || null;
  if (startParam && startParam !== userId?.toString()) {
    // Сохраняем информацию о реферале
    const pendingRefs = JSON.parse(localStorage.getItem('pendingRefs') || '{}');
    
    if (!pendingRefs[startParam]) {
      pendingRefs[startParam] = true;
      localStorage.setItem('pendingRefs', JSON.stringify(pendingRefs));
      
      // Показываем уведомление
      showTelegramAlert("🎉 Вы зашли по ссылке друга! Спасибо!");
      
      // Здесь должен быть запрос к серверу для начисления билетов пригласившему
      // Например: fetch(/api/add-ref?inviter=${startParam})
    }
  }
  
  if (userId) {
    refLink = https://t.me/XStarsCoin_bot?start=${userId};
  }

  // При загрузке проверяем и начисляем билеты за приглашенных друзей (если есть)
  handlePendingRefs();
}

function handlePendingRefs() {
  const pendingRefs = parseInt(localStorage.getItem('pendingRefs') || '0');
  if (pendingRefs > 0) {
    tickets += pendingRefs;
    localStorage.setItem('pendingRefs', '0');
    updateUI();
    showTelegramAlert(🎉 Вы получили ${pendingRefs} билет(ов) за приглашенных друзей!);
  }
}

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
  wheel.style.transform = rotate(0deg);

  setTimeout(() => {
    wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
    wheel.style.transform = rotate(${rotation}deg);
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

function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
  btnSpin.src = spinning
    ? "IMG_2667.PNG"
    : tickets > 0
      ? "IMG_2665.PNG"
      : "IMG_2666.PNG";
}

function showTelegramAlert(text) {
  if (Telegram?.WebApp?.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}

// === Анимация JPG полосы ===

const imgWidth = 45;
const gap = 10;
const visibleCount = 7;
const stripWidth = imgWidth * visibleCount + gap * (visibleCount - 1);

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
  } catch { }
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
    img.style.left = ${i * (imgWidth + gap)}px;
    img.style.opacity = "1";
    img.classList.remove("leaving", "entering");
  });
}

function initJpgStrip() {
  jpgStrip.innerHTML = "";
  let initialImgs = loadState() || jpgOrder.slice(0, visibleCount);
  currentIndex = visibleCount % jpgOrder.length;
  imgs = [];

  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    img.src = ${jpgPrefix}${initialImgs[i]}${jpgSuffix};
    jpgStrip.appendChild(img);
    imgs.push(img);
  }

  positionImgs();
  saveState(initialImgs);
}

function slideNext() {
  if (!imgs.length) return;

  imgs[0].classList.add("leaving");
  imgs[0].style.left = "0px";

  for (let i = 1; i < imgs.length; i++) {
    imgs[i].style.left = ${(i - 1) * (imgWidth + gap)}px;
  }

  const newImg = document.createElement('img');
  newImg.src = ${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix};
  newImg.classList.add("entering");
  newImg.style.opacity = "0";
  newImg.style.left = ${stripWidth}px;

  jpgStrip.appendChild(newImg);
  imgs.push(newImg);

  requestAnimationFrame(() => {
    newImg.style.left = ${(visibleCount - 1) * (imgWidth + gap)}px;
    newImg.style.opacity = "1";
  });

  currentIndex = (currentIndex + 1) % jpgOrder.length;

  setTimeout(() => {
    jpgStrip.removeChild(imgs.shift());
    newImg.classList.remove("entering");
    positionImgs();

    const currentImgs = imgs.map(img => {
      const match = img.src.match(/IMG_(\d+)\.JPG$/i);
      return match ? Number(match[1]) : null;
    });
    saveState(currentImgs);
  }, 1000);
}

initJpgStrip();
setInterval(slideNext, 5000);

window.addEventListener('load', () => {
  const pngLeft = document.querySelector('.png-strip-left');
  const infoIcon = document.getElementById('infoBtn');

  if (pngLeft && infoIcon) {
    const rect = pngLeft.getBoundingClientRect();
    infoIcon.style.left = rect.left + 'px';
    infoIcon.style.top = (rect.bottom + 10) + 'px';
    infoIcon.style.opacity = '1';

    infoIcon.addEventListener('click', () => {
      showTelegramAlert(Шансы выпадения:

0 – 70%
🎟️ – 20%
⭐️50 – 5%
⭐️100 – 3%
⭐️500 – 1.9%
🏆Gold Heroic Helmet – 0.1%);
    });
  }
});