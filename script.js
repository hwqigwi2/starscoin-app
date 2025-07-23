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

// === Новый код для полоски JPG ===

const jpgOrder = [
  2685, 2685, 2680, 2685, 2680, 2680, 2681, 2680, 2685, 2680,
  2683, 2685, 2685, 2685, 2685, 2680, 2681, 2685, 2680, 2680,
  2684, 2680, 2680, 2681, 2685, 2680, 2685, 2685, 2681
];

const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";

const jpgStrip = document.getElementById('jpgStrip');
const visibleCount = 5; // сколько показываем одновременно

let currentIndex = 0;
let isAnimating = false;

// Инициализация: вставим первые 5 картинок
function initJpgStrip() {
  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    const num = jpgOrder[(currentIndex + i) % jpgOrder.length];
    img.src = `${jpgPrefix}${num}${jpgSuffix}`;
    img.alt = `IMG_${num}`;
    jpgStrip.appendChild(img);
  }
  currentIndex = (currentIndex + visibleCount) % jpgOrder.length;
}

function slideNext() {
  if (isAnimating) return;
  isAnimating = true;

  const firstImg = jpgStrip.querySelector('img');
  const imgWidth = firstImg.offsetWidth + 10; // ширина + gap

  // Анимация сдвига через translateX
  jpgStrip.style.transition = 'transform 1s ease';
  jpgStrip.style.transform = `translateX(-${imgWidth}px)`;

  // По окончании анимации:
  jpgStrip.addEventListener('transitionend', onTransitionEnd);

  function onTransitionEnd() {
    jpgStrip.style.transition = 'none';
    jpgStrip.style.transform = 'translateX(0)';

    // Удаляем первый элемент
    jpgStrip.removeChild(firstImg);

    // Добавляем новую картинку справа
    const newImg = document.createElement('img');
    const num = jpgOrder[currentIndex];
    newImg.src = `${jpgPrefix}${num}${jpgSuffix}`;
    newImg.alt = `IMG_${num}`;
    jpgStrip.appendChild(newImg);

    currentIndex = (currentIndex + 1) % jpgOrder.length;

    jpgStrip.removeEventListener('transitionend', onTransitionEnd);
    isAnimating = false;
  }
}

initJpgStrip();

setInterval(slideNext, 5000);
