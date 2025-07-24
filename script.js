let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const mainScreen = document.getElementById('mainScreen');
const secondaryScreen = document.getElementById('secondaryScreen');

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

// === JPG полоска логика ===

const imgWidth = 45;
const gap = 10;
const visibleCount = 7;
const stripWidth = imgWidth * visibleCount + gap * (visibleCount - 1);

const jpgOrder = [2685, 2685, 2681, 2685, 2680, 2680, 2681, 2680, 2685];

const jpgStrip = document.getElementById('jpgStrip');
const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";
let currentIndex = 0;
let imgs = [];

function initJpgStrip() {
  jpgStrip.innerHTML = "";
  imgs = [];

  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    img.src = `${jpgPrefix}${jpgOrder[i % jpgOrder.length]}${jpgSuffix}`;
    jpgStrip.appendChild(img);
    imgs.push(img);
  }

  imgs.forEach((img, i) => {
    img.style.left = `${i * (imgWidth + gap)}px`;
  });
}

function slideNext() {
  const first = imgs.shift();
  jpgStrip.removeChild(first);

  const newImg = document.createElement('img');
  newImg.src = `${jpgPrefix}${jpgOrder[currentIndex % jpgOrder.length]}${jpgSuffix}`;
  newImg.style.left = `${(visibleCount - 1) * (imgWidth + gap)}px`;
  jpgStrip.appendChild(newImg);
  imgs.push(newImg);
  currentIndex++;
  imgs.forEach((img, i) => {
    img.style.left = `${i * (imgWidth + gap)}px`;
  });
}

initJpgStrip();
setInterval(slideNext, 5000);

// === Квадраты ===
const squares = document.querySelectorAll('.square');
let activeIndex = 0;

function updateActiveSquare(index) {
  squares.forEach((s, i) => s.classList.toggle('active', i === index));
  activeIndex = index;

  if (index === 1) {
    mainScreen.style.display = 'none';
    secondaryScreen.style.display = 'flex';
  } else if (index === 0) {
    mainScreen.style.display = 'flex';
    secondaryScreen.style.display = 'none';
  }
}

squares.forEach((square, index) => {
  square.addEventListener('click', () => {
    if (index !== activeIndex) updateActiveSquare(index);
  });
});

updateActiveSquare(0);
