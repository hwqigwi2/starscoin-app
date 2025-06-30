let clickCount = 0;

const giftEl = document.getElementById('giftAnimation');
const iceEl = document.getElementById('iceAnimation');
const finalImage = document.getElementById('finalImage');

// Проверим загрузку Lottie-анимаций
let giftAnimation, iceAnimation;

try {
  giftAnimation = lottie.loadAnimation({
    container: giftEl,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'gift.tgs'
  });

  iceAnimation = lottie.loadAnimation({
    container: iceEl,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'ice.tgs'
  });

  giftEl.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 2) {
      giftAnimation.stop();
      giftEl.style.display = 'none';
      finalImage.style.display = 'block';
      iceEl.style.display = 'block';
      iceAnimation.play();
    }
  });

} catch (e) {
  console.error('Ошибка загрузки стикеров:', e);
}
