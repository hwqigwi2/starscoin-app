let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

updateUI();

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
    img.style.left = `${i * (imgWidth + gap)}px`;
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
    img.src = `${jpgPrefix}${initialImgs[i]}${jpgSuffix}`;
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
    imgs[i].style.left = `${(i - 1) * (imgWidth + gap)}px`;
  }

  const newImg = document.createElement('img');
  newImg.src = `${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix}`;
  newImg.classList.add("entering");
  newImg.style.opacity = "0";
  newImg.style.left = `${stripWidth}px`;

  jpgStrip.appendChild(newImg);
  imgs.push(newImg);

  requestAnimationFrame(() => {
    newImg.style.left = `${(visibleCount - 1) * (imgWidth + gap)}px`;
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
      showTelegramAlert(`Шансы выпадения:

0 – 70%
🎟️ – 20%
⭐️50 – 5%
⭐️100 – 3%
⭐️500 – 1.9%
🏆Gold Heroic Helmet – 0.1%`);
    });
  }
});

// Логика выделения квадратов с прозрачным белым оверлеем

const squares = document.querySelectorAll('.square');

let activeIndex = 0; // левый квадрат по умолчанию

function updateActiveSquare(newIndex) {
  if (activeIndex !== null && squares[activeIndex]) {
    squares[activeIndex].classList.remove('active');
  }
  activeIndex = newIndex;
  if (squares[activeIndex]) {
    squares[activeIndex].classList.add('active');
  }
}

updateActiveSquare(activeIndex);

// Назначаем обработчики клика на квадраты
squares.forEach((square, index) => {
  square.addEventListener('click', () => {
    if (index === activeIndex) return;
    updateActiveSquare(index);
  });
});

// Переключение экранов по нижним кнопкам

const squareButtons = document.querySelectorAll('.square');
const elementsToToggle = [
  document.querySelector('.wheel-wrapper'),
  document.querySelector('.center-icon'),
  document.querySelector('.btn-bilets-wrapper'),
  document.querySelector('.btn-spin-wrapper'),
  document.getElementById('jpgStrip'),
  document.querySelector('.info-icon'),
  document.querySelector('.png-strip-container')
];

const inviteScreen = document.getElementById('inviteScreen');

let isAltScreen = false;

// Кнопка "Средний квадрат" - скрыть всё кроме фона и 3 кнопок
squareButtons[1].addEventListener('click', () => {
  if (isAltScreen) return;

  elementsToToggle.forEach(el => el.style.display = 'none');
inviteScreen.style.display = 'none';
document.getElementById('midRect').style.display = 'block';
isAltScreen = true;
});

// Кнопка "Левый квадрат" - вернуться на основной экран
squareButtons[0].addEventListener('click', () => {
  if (!isAltScreen) return;

  elementsToToggle.forEach(el => el.style.display = '');
  inviteScreen.style.display = 'none';
  isAltScreen = false;
  document.getElementById('midRect').style.display = 'none';
});

// ====== Логика приглашений ======

// Пример списка приглашённых (имена или id)
const invitedUsers = [
  'user1',
  'user2',
  'user3',
  'user4',
  'user5',
  'user6',
  'user7',
  'user8',
  'user9',
  'user10',
];

// Заполнение списка в inviteList
const inviteListElem = document.getElementById('inviteList');
const inviteCountElem = document.getElementById('inviteCount');

function renderInviteList() {
  inviteListElem.innerHTML = ''; // очистка

  invitedUsers.forEach((user, index) => {
    const div = document.createElement('div');
    div.textContent = `${index + 1}. ${user}`;
    div.style.padding = '5px 0';
    div.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
    inviteListElem.appendChild(div);
  });

  inviteCountElem.textContent = invitedUsers.length;
}

renderInviteList();

// === Кнопка поделиться ===

const inviteShareBtn = document.querySelector('.invite-share-btn');

inviteShareBtn.addEventListener('click', () => {
  const text = `Крути рулетку и получай звезды! За каждого приглашенного человека дается 1 билет. Присоединяйся: https://t.me/XStarsCoin_bot`;

  if (Telegram?.WebApp?.shareData) {
    // Telegram WebApp shareData
    Telegram.WebApp.shareData({
      type: 'text',
      text: text,
    }).then(() => {
      showTelegramAlert('Ссылка успешно отправлена!');
    }).catch(() => {
      showTelegramAlert('Не удалось отправить ссылку');
    });
  } else if (Telegram?.WebApp?.openChat) {
    // Если есть метод открытия чата (редко бывает), можно попробовать
    Telegram.WebApp.openChat(text);
  } else {
    // fallback: обычный prompt для копирования
    window.prompt('Скопируйте текст приглашения:', text);
  }
});
