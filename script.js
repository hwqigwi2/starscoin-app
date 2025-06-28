// Telegram Web App SDK init
const tg = window.Telegram.WebApp;
tg.expand();

// Баланс и звук
const balanceEl = document.getElementById('balance');
const tapBtn = document.getElementById('tap-btn');
const tapSound = document.getElementById('tap-sound');

let balance = parseInt(localStorage.getItem('tap-balance')) || 0;
balanceEl.textContent = balance;

tapBtn.addEventListener('click', () => {
  balance++;
  balanceEl.textContent = balance;
  localStorage.setItem('tap-balance', balance);
  tapSound.currentTime = 0;
  tapSound.play();

  // лёгкая анимация при клике
  tapBtn.classList.add('clicked');
  setTimeout(() => tapBtn.classList.remove('clicked'), 200);
});
