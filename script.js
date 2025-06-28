const tg = window.Telegram.WebApp;
tg.expand();

const balanceEl = document.getElementById('balance');
const tapBtn = document.getElementById('tap-btn');
const clickSound = document.getElementById('click-sound');

let balance = 0;

// Загрузка баланса из localStorage
const savedBalance = localStorage.getItem('starscoin_balance');
if (savedBalance !== null) {
  balance = parseInt(savedBalance, 10);
  updateBalance();
}

function updateBalance() {
  balanceEl.textContent = balance;
}

// Обработка клика
tapBtn.addEventListener('click', () => {
  balance++;
  updateBalance();

  // Сохраняем баланс
  localStorage.setItem('starscoin_balance', balance);

  // Воспроизведение звука
  clickSound.currentTime = 0;
  clickSound.play();
});
