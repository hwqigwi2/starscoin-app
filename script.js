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
const visibleCount = 6; // показываем 6 штук одновременно

let currentIndex = 0;  // индекс следующей картинки из массива
let imgs = []; // массив DOM элементов картинок

// Ключ для localStorage
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

// Инициализация полосы с картинками, либо из localStorage либо новые
function initJpgStrip() {
  jpgStrip.innerHTML = "";
  let initialImgs = loadState();
  if (!initialImgs) {
    // Если нет сохранения, то просто первые visibleCount из массива по порядку
    initialImgs = [];
    for (let i = 0; i < visibleCount; i++) {
      initialImgs.push(jpgOrder[i]);
    }
    currentIndex = visibleCount % jpgOrder.length;
  }

  imgs = [];
  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    img.src = `${jpgPrefix}${initialImgs[i]}${jpgSuffix}`;
    img.alt = `IMG_${initialImgs[i]}`;
    img.style.opacity = "1";
    jpgStrip.appendChild(img);
    imgs.push(img);
  }
  saveState(initialImgs);
}

function slideNext() {
  // Начинаем исчезать первую картинку
  imgs[0].classList.add('fading-out');

  // Через 1 сек (анимация исчезновения), меняем src, убираем первый элемент и сдвигаем массив
  setTimeout(() => {
    imgs[0].classList.remove('fading-out');
    // Заменяем src у первой картинки на следующую в списке
    imgs[0].style.opacity = "0";
    imgs[0].src = `${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix}`;
    imgs[0].alt = `IMG_${jpgOrder[currentIndex]}`;
    currentIndex = (currentIndex + 1) % jpgOrder.length;

    // Плавно показываем новую картинку
    imgs[0].classList.add('fading-in');
    imgs[0].style.opacity = "1";

    // Циклично сдвигаем массив так, чтобы порядок был как сдвиг влево
    // imgs[0] переходит в конец
    imgs.push(imgs.shift());

    // Обновляем localStorage с текущими src в порядке
    const currentImgs = imgs.map(img => {
      // Вычислим число из src, пример: IMG_2680.JPG
      const match = img.src.match(/IMG_(\d+)\.JPG$/i);
      return match ? Number(match[1]) : null;
    });
    saveState(currentImgs);

    // Убираем класс fading-in через 1s для готовности к следующему циклу
    setTimeout(() => {
      imgs[imgs.length - 1].classList.remove('fading-in');
    }, 1000);
  }, 1000);
}

initJpgStrip();
setInterval(slideNext, 5000);
