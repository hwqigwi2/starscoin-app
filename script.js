let clickCount = 0;

const giftAnimation = lottie.loadAnimation({
  container: document.getElementById('giftAnimation'),
  renderer: 'svg',
  loop: false,
  autoplay: true,
  path: 'gift.tgs'
});

const iceAnimation = lottie.loadAnimation({
  container: document.getElementById('iceAnimation'),
  renderer: 'svg',
  loop: true,
  autoplay: false,
  path: 'ice.tgs'
});

const giftEl = document.getElementById('giftAnimation');
const iceEl = document.getElementById('iceAnimation');
const finalImage = document.getElementById('finalImage');

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
