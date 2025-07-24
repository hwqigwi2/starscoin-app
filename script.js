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
  // Снимаем класс с предыдущего активного квадрата
  if (activeIndex !== null && squares[activeIndex]) {
    squares[activeIndex].classList.remove('active');
  }

  // Обновляем индекс активного квадрата
  activeIndex = newIndex;

  // Добавляем класс новому активному квадрату
  if (squares[activeIndex]) {
    squares[activeIndex].classList.add('active');
  }
}

// Инициализация — подсвечиваем левый квадрат сразу
updateActiveSquare(activeIndex);

// Назначаем обработчики клика на квадраты
squares.forEach((square, index) => {
  square.addEventListener('click', () => {
    if (index === activeIndex) return; // если клик на активный, игнорируем
    updateActiveSquare(index);
  });
});

// ... существующий код ...

// === Функционал страницы приглашений ===
let invitedUsers = JSON.parse(localStorage.getItem('invitedUsers')) || [];

function renderInvitedList() {
  const list = document.querySelector('.invite-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  invitedUsers.forEach(user => {
    const item = document.createElement('div');
    item.className = 'invite-item';
    item.textContent = user.name;
    list.appendChild(item);
  });
  
  // Обновляем счетчик приглашенных
  const countElement = document.querySelector('.invite-count');
  if (countElement) {
    countElement.textContent = invitedUsers.length;
  }
}

function addInvitedUser(user) {
  invitedUsers.push(user);
  localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
  renderInvitedList();
}

// Обработчик кнопки "Поделиться"
document.getElementById('btnShare')?.addEventListener('click', function() {
  // Используем Telegram WebApp для отправки приглашения
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.shareUrl) {
    Telegram.WebApp.shareUrl(
      'https://t.me/XStarsCoin_bot',
      '🎉 Крути рулетку и получай звезды! За каждого приглашенного друга получишь билет!'
    );
  } else {
    // Альтернатива для браузеров
    const shareUrl = 'https://t.me/XStarsCoin_bot';
    if (navigator.share) {
      navigator.share({
        title: 'XStarsCoin',
        text: '🎉 Крути рулетку и получай звезды! За каждого приглашенного друга получишь билет!',
        url: shareUrl
      });
    } else {
      // Fallback для старых браузеров
      alert(`Поделитесь ссылкой: ${shareUrl}`);
    }
  }
});

// === Переключение страниц ===
const pages = {
  0: 'page-roulette',
  1: 'page-invite'
};

function switchPage(index) {
  // Скрываем все страницы
  Object.values(pages).forEach(pageId => {
    document.getElementById(pageId).classList.remove('active');
  });
  
  // Показываем выбранную страницу
  const pageId = pages[index];
  if (pageId) {
    document.getElementById(pageId).classList.add('active');
    
    // Если переключились на страницу приглашений - рендерим список
    if (pageId === 'page-invite') {
      renderInvitedList();
    }
  }
}

// Обновляем обработчики квадратов
squares.forEach((square, index) => {
  square.addEventListener('click', () => {
    if (index === activeIndex) return;
    switchPage(index);
    updateActiveSquare(index);
  });
});

// Инициализация при загрузке
renderInvitedList();

// === Имитация приглашения ===
// В реальном приложении это будет обрабатываться через реферальные ссылки
document.getElementById('btnShare')?.addEventListener('click', function() {
  // ... существующий код отправки ...
  
  // Имитация: через 2 секунды добавляем пользователя
  setTimeout(() => {
    const randomId = Math.floor(Math.random() * 10000);
    addInvitedUser({ name: `User${randomId}` });
    
    // Начисляем билет за приглашение
    tickets++;
    updateUI();
  }, 2000);
});
