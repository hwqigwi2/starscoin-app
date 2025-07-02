let clickCount = 0;

const startImage = document.getElementById('startImage');
const giftEl = document.getElementById('giftAnimation');
const iceEl = document.getElementById('iceAnimation');
const finalImage = document.getElementById('finalImage');

let giftAnimation, randomAnimation;

const randomAnimations = [
  { path: 'ice.json' },
  { path: 'plomb.json' },
  { path: 'esk.json' },
];

// Загружаем gift-анимацию
giftAnimation = lottie.loadAnimation({
  container: giftEl,
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'gift.json',
});

// Функция запуска случайной анимации
function playRandomAnimation() {
  const choice = randomAnimations[Math.floor(Math.random() * randomAnimations.length)];

  // Если была предыдущая анимация — уничтожаем
  if (randomAnimation) randomAnimation.destroy();

  randomAnimation = lottie.loadAnimation({
    container: iceEl,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: choice.path,
  });
}

startImage.classList.add('fade-in');
giftEl.classList.remove('fade-in');
iceEl.classList.remove('fade-in');
finalImage.classList.remove('fade-in');

startImage.addEventListener('click', () => {
  clickCount++;
  if (clickCount >= 2) {
    startImage.classList.remove('fade-in');
    startImage.classList.add('fade-out');

    giftEl.classList.remove('fade-out');
    giftEl.classList.add('fade-in');
    giftAnimation.play();
  }
});

giftAnimation.addEventListener('complete', () => {
  giftEl.classList.remove('fade-in');
  giftEl.classList.add('fade-out');

  finalImage.classList.remove('fade-out');
  finalImage.classList.add('fade-in');

  iceEl.classList.remove('fade-out');
  iceEl.classList.add('fade-in');

  playRandomAnimation();

  setTimeout(() => {
    giftEl.style.display = 'none';
    startImage.style.display = 'none';
  }, 500);
});
