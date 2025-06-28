let balance = 0;

const balanceEl = document.getElementById('balance');
const clickButton = document.getElementById('clickButton');

clickButton.addEventListener('click', (e) => {
  balance++;
  balanceEl.textContent = balance;

  // вибрация (для смартфонов)
  if (window.navigator.vibrate) {
    window.navigator.vibrate(50);
  }

  // эффект +1
  const plusOne = document.createElement('div');
  plusOne.className = 'plus-one';
  plusOne.textContent = '+1';
  document.body.appendChild(plusOne);

  // случайная позиция вокруг кнопки
  const x = e.clientX + (Math.random() * 80 - 40);
  const y = e.clientY + (Math.random() * 80 - 40);
  plusOne.style.left = x + 'px';
  plusOne.style.top = y + 'px';

  // удалить через анимацию
  setTimeout(() => {
    plusOne.remove();
  }, 800);
});
