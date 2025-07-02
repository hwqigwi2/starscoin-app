let clickCount = 0;

const startImage = document.getElementById('startImage');
const giftEl = document.getElementById('giftAnimation');
const animationContainer = document.getElementById('animationContainer');
const finalImage = document.getElementById('finalImage');

// Конфигурация анимаций
const RANDOM_ANIMATIONS = [
  { path: 'ice.json', top: '40%', left: '49%', scale: 1.0 },
  { path: 'esk.json', top: '40%', left: '49%', scale: 1.0 },
  { path: 'plomb.json', top: '40%', left: '50%', scale: 1.0 }
];

let giftAnimation, currentAnimation;

// Предзагрузка анимаций
function preloadAnimations() {
  RANDOM_ANIMATIONS.forEach(anim => {
    const tempContainer = document.createElement('div');
    document.body.appendChild(tempContainer);
    tempContainer.style.display = 'none';
    
    lottie.loadAnimation({
      container: tempContainer,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: anim.path
    });
  });
}

try {
  // Загрузка основной анимации подарка
  giftAnimation = lottie.loadAnimation({
    container: giftEl,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: 'gift.json'
  });

  // Предзагрузка случайных анимаций
  preloadAnimations();

  startImage.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 2) {
      startImage.style.display = 'none';
      giftEl.style.display = 'block';
      giftAnimation.play();
    }
  });

  giftAnimation.addEventListener('complete', () => {
    giftEl.style.display = 'none';
    finalImage.style.display = 'block';
    animationContainer.style.display = 'block';
    
    // Выбираем случайную анимацию
    const randomAnim = RANDOM_ANIMATIONS[Math.floor(Math.random() * RANDOM_ANIMATIONS.length)];
    
    // Очищаем контейнер
    animationContainer.innerHTML = '';
    
    // Загружаем выбранную анимацию
    currentAnimation = lottie.loadAnimation({
      container: animationContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: randomAnim.path
    });
    
    // Настраиваем позиционирование
    animationContainer.style.top = randomAnim.top;
    animationContainer.style.left = randomAnim.left;
    animationContainer.style.transform = `translate(-50%, -50%) scale(${randomAnim.scale})`;
  });

} catch (e) {
  console.error('Ошибка загрузки анимаций:', e);
  // Фолбэк: если анимации не загрузились, показываем финальное изображение
  startImage.addEventListener('click', () => {
    startImage.style.display = 'none';
    finalImage.style.display = 'block';
  });
}