// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Работа с балансом
const balanceEl = document.getElementById('balance');
const tapBtn = document.getElementById('tap-btn');
const tapSound = document.getElementById('tap-sound');

let balance = parseInt(localStorage.getItem('tap-balance'), 10) || 0;
balanceEl.textContent = balance;

tapBtn.addEventListener('click', () => {
  balance += 1;
  balanceEl.textContent = balance;
  localStorage.setItem('tap-balance', balance);

  tapSound.currentTime = 0;
  tapSound.play();
});
