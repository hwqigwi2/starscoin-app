let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

updateUI();

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
    btnSpin.src = "IMG_2666.PNG";
  } else if (!spinning) {
    btnSpin.src = "IMG_2665.PNG";
  }
}

function showTelegramAlert(text) {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}

// === Новый код для полоски JPG с сохранением прогресса и плавной анимацией ===

const jpgOrder = [
  2685, 2685, 2680, 2685, 2680, 2680, 2681, 2680, 2685, 2680,
  2683, 2685, 2685, 2685, 2685, 2680, 2681, 2685, 2680, 2680,
  2684, 2680, 2680, 2681, 2685, 2680, 2685, 2685, 2681
];

const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";

const jpgStrip = document.getElementById('jpgStrip');
const visibleCount = 6; // 6 видимых

let currentIndex = 0;
let imgs = []; // массив DOM элементов картинок

const STORAGE_KEY = "jpgStripState";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      if (obj && typeof obj.currentIndex === "number" && Array.isArray(obj.currentImgs)) {
        currentIndex = obj.currentIndex;
        return obj.currentImgs;
      }
    } catch { }
  }
  return null;
}

function saveState(currentImgs) {
  const obj = {
    currentIndex,
    currentImgs
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function initJpgStrip() {
  jpgStrip.innerHTML = "";
  let initialImgs = loadState();
  if (!initialImgs) {
    initialImgs = [];
    for (let i = 0; i < visibleCount; i++) {
      initialImgs.push(jpgOrder[i]);
    }
    currentIndex = visibleCount % jpgOrder.length;
  }

  imgs = [];
  // Добавляем на 1 картинку больше — 7 штук
  for (let i = 0; i < visibleCount + 1; i++) {
    const img = document.createElement('img');
    let imgNum;
    if (i < initialImgs.length) {
      imgNum = initialImgs[i];
    } else {
      imgNum = jpgOrder[currentIndex];
      currentIndex = (currentIndex + 1) % jpgOrder.length;
    }
    img.src = `${jpgPrefix}${imgNum}${jpgSuffix}`;
    img.alt = `IMG_${imgNum}`;
    img.style.opacity = "1";
    jpgStrip.appendChild(img);
    imgs.push(img);
  }
  saveState(initialImgs);
}

// Функция анимации сдвига влево
function slideNext() {
  // ширина картинки + gap
  const imgWidth = imgs[0].offsetWidth + 10; 

  // Устанавливаем transition и сдвигаем контейнер
  jpgStrip.style.transition = 'transform 1s ease';
  jpgStrip.style.transform = `translateX(-${imgWidth}px)`;

  // Первая (левая) картинка начинает исчезать
  imgs[0].classList.add('leaving');

  jpgStrip.addEventListener('transitionend', onTransitionEnd);

  function onTransitionEnd() {
    jpgStrip.style.transition = 'none';
    jpgStrip.style.transform = 'translateX(0)';

    // Убираем класс ухода у первой картинки
    imgs[0].classList.remove('leaving');

    // Удаляем первый img из DOM и из массива
    const leavingImg = imgs.shift();
    jpgStrip.removeChild(leavingImg);

    // Добавляем новую картинку справа с opacity 0 и классом entering
    const newImg = document.createElement('img');
    newImg.src = `${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix}`;
    newImg.alt = `IMG_${jpgOrder[currentIndex]}`;
    newImg.style.opacity = '0';
    newImg.classList.add('entering');
    jpgStrip.appendChild(newImg);
    imgs.push(newImg);

    currentIndex = (currentIndex + 1) % jpgOrder.length;

    // После окончания анимации появления убираем класс entering
    newImg.addEventListener('animationend', () => {
      newImg.classList.remove('entering');
      newImg.style.opacity = '1';

      // Сохраняем состояние: текущие изображения (по src)
      const currentImgs = imgs.slice(0, visibleCount).map(img => {
        const match = img.src.match(/IMG_(\d+)\.JPG$/i);
        return match ? Number(match[1]) : null;
      });
      saveState(currentImgs);
    }, { once: true });

    jpgStrip.removeEventListener('transitionend', onTransitionEnd);
  }
}

initJpgStrip();
setInterval(slideNext, 5000);
