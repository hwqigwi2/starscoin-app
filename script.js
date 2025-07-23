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

const imgWidth = 45;
const gap = 10;
const visibleCount = 6;
const stripWidth = imgWidth * visibleCount + gap * (visibleCount - 1);

const jpgOrder = [
  2685, 2685, 2680, 2685, 2680, 2680, 2681, 2680, 2685, 2680,
  2683, 2685, 2685, 2685, 2685, 2680, 2681, 2685, 2680, 2680,
  2685, 2680, 2680, 2681, 2685, 2680, 2685, 2685, 2681
];

const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";

const jpgStrip = document.getElementById('jpgStrip');

let currentIndex = 0;
let imgs = [];

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

function positionImgs() {
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].style.left = (i * (imgWidth + gap)) + "px";
    imgs[i].style.top = "0px";
    imgs[i].style.opacity = "1";
    imgs[i].classList.remove("leaving");
    imgs[i].classList.remove("entering");
    // Скругление всегда остаётся — не сбрасываем!
  }
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

  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    img.src = `${jpgPrefix}${initialImgs[i]}${jpgSuffix}`;
    img.alt = `IMG_${initialImgs[i]}`;
    jpgStrip.appendChild(img);
    imgs.push(img);
  }

  positionImgs();
  saveState(initialImgs);
}

function slideNext() {
  if (imgs.length === 0) return;

  // Левая уходит — сдвиг только на 3px и исчезает
  imgs[0].classList.add("leaving");
  imgs[0].style.left = "3px";

  // Остальные сдвигаются влево на ширину + gap
  for (let i = 1; i < imgs.length; i++) {
    const targetLeft = (i - 1) * (imgWidth + gap);
    imgs[i].style.left = targetLeft + "px";
  }

  // Новая картинка — справа за контейнером, с закруглённым правым краем
  const newImg = document.createElement('img');
  newImg.src = `${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix}`;
  newImg.alt = `IMG_${jpgOrder[currentIndex]}`;
  newImg.style.opacity = "0";
  newImg.style.left = stripWidth + "px";
  newImg.classList.add("entering");

  jpgStrip.appendChild(newImg);
  imgs.push(newImg);

  // Плавно выезжает на позицию последней картинки
  requestAnimationFrame(() => {
    newImg.style.left = ((visibleCount - 1) * (imgWidth + gap)) + "px";
    newImg.style.opacity = "1";
  });

  currentIndex = (currentIndex + 1) % jpgOrder.length;

  setTimeout(() => {
    // Удаляем ушедшую картинку
    const leavingImg = imgs.shift();
    jpgStrip.removeChild(leavingImg);

    // Снимаем класс entering у новой
    newImg.classList.remove("entering");

    // Фиксируем позиции всех
    positionImgs();

    // Сохраняем прогресс
    const currentImgs = imgs.map(img => {
      const match = img.src.match(/IMG_(\d+)\.JPG$/i);
      return match ? Number(match[1]) : null;
    });
    saveState(currentImgs);
  }, 1000);
}

initJpgStrip();
setInterval(slideNext, 5000);
