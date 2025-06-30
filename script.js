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
  giftEl.classList.add('fade-out'); // запускаем затухание

  // Через 500 мс (после fade-out) начинаем показывать следующее
  setTimeout(() => {
    giftEl.style.display = 'none';

    finalImage.classList.add('fade-in'); // теперь плавно появляется
    iceEl.classList.add('fade-in');
    iceAnimation.play();
  }, 500); // 0.5 секунды = длительность затухания
});

} catch (e) {
  console.error('Ошибка загрузки анимаций:', e);
}
