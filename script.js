// Получаем WebApp данные из Telegram
Telegram.WebApp.ready();

const userData = Telegram.WebApp.initDataUnsafe.user;
const userId = userData?.id || 'guest';
const username = userData?.username || 'Гость';
const photoUrl = userData?.photo_url || 'default-avatar.png';

// Подставляем данные
document.getElementById('user-name').textContent = username;
document.getElementById('user-avatar').src = photoUrl;

let balance = 0;

// Обновить баланс на экране
function updateBalance() {
  document.getElementById('balance').textContent = balance;
}

// Анимация + вибрация на клике
document.getElementById('clickButton').addEventListener('click', () => {
  balance++;
  updateBalance();
  
  // Вибрация
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }

  // Анимация нажатия
  const btn = document.getElementById('clickButton');
  btn.style.transform = 'scale(0.92)';
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
  }, 100);
});

// Стартовый баланс
updateBalance();
