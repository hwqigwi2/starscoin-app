let clickCount = 0;

const startImage = document.getElementById('startImage');
const giftEl = document.getElementById('giftAnimation');
const finalImage = document.getElementById('finalImage');

const animContainer = document.getElementById('iceAnimation'); // контейнер для рандомной анимации

let giftAnimation, randomAnimation;

const randomAnimations = [
  { path: 'ice.json', png: 'IMG_2125.PNG' },
  { path: 'plomb.json', png: 'IMG_2125.PNG' },
  { path: 'esk.json', png: 'IMG_2125.PNG' },
];

// Загружаем gift-анимацию
giftAnimation = lottie.loadAnimation({
  container: giftEl,
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'gift.json',
});

// Функция запуска рандомной анимации
function playRandomAnimation() {
  const choice = randomAnimations[Math.floor(Math.random() * randomAnimations.length)];

  finalImage.src = choice.png;
  finalImage.style.display = 'block';
  finalImage.classList.add('fade-in');

  // Если анимация уже была — уничтожаем, чтобы не накладывались
  if (randomAnimation) randomAnimation.destroy();

  randomAnimation = lottie.loadAnimation({
    container: animContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: choice.path,
  });

  animContainer.style.display = 'block';
  animContainer.classList.add('fade-in');
}

// Обработчик клика
startImage.addEventListener('click', () => {
  clickCount++;
  if (clickCount >= 2) {
    startImage.style.display = 'none';

    giftEl.style.display = 'block';
    giftEl.classList.remove('fade-out');
    giftEl.classList.add('fade-in');

    giftAnimation.play();
  }
});

// Когда gift-анимация закончилась
giftAnimation.addEventListener('complete', () => {
  // Скрываем gift с плавным исчезновением
  giftEl.classList.remove('fade-in');
  giftEl.classList.add('fade-out');

  // Появление finalImage и рандомной анимации происходит одновременно с затуханием gift
  finalImage.classList.add('fade-in');
  animContainer.classList.add('fade-in');
  animContainer.style.display = 'block';

  playRandomAnimation();

  setTimeout(() => {
    giftEl.style.display = 'none';
  }, 500); // Ждём окончания затухания
});
