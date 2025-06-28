const tg = window.Telegram.WebApp;
tg.expand();

let balance = 0;
const balanceEl = document.getElementById('balance');
const usernameEl = document.getElementById('username');
const tapBtn = document.getElementById('tap-btn');
const clickSound = document.getElementById('click-sound');

// Telegram user info
const user = tg.initDataUnsafe?.user;
if (user) {
  usernameEl.textContent = user.first_name || user.username || "неизвестен";
} else {
  usernameEl.textContent = "гость";
}

// Тап логика
tapBtn.addEventListener('click', () => {
  balance += 1;
  balanceEl.textContent = balance;

  // Воспроизведение звука
  clickSound.currentTime = 0;
  clickSound.play();
});
