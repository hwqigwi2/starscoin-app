let clickCount = 0;

const startImage = document.getElementById('startImage');
const giftEl = document.getElementById('giftAnimation');
const iceEl = document.getElementById('iceAnimation');
const finalImage = document.getElementById('finalImage');

let giftAnimation, iceAnimation;

try {
  giftAnimation = lottie.loadAnimation({
    container: giftEl,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: 'gift.json'
  });

  iceAnimation = lottie.loadAnimation({
    container: iceEl,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'ice.json'
  });

  startImage.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 2) {
      startImage.style.display = 'none';
      giftEl.style.display = 'block';
      giftAnimation.play();
    }
  });

  giftAnimation.addEventListener('complete', () => {
  giftEl.classList.add('fade-out'); // запускаем плавное исчезновение

  setTimeout(() => {
    giftEl.style.display = 'none';           // скрываем после затухания
    finalImage.style.display = 'block';      // показываем PNG
    iceEl.style.display = 'block';           // включаем анимацию льда
    iceAnimation.play();                     // запускаем ice.json
  }, 500); // 0.5 секунды (в миллисекундах)
});

} catch (e) {
  console.error('Ошибка загрузки анимаций:', e);
}
