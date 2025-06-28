let score = 0;
const scoreElement = document.getElementById('score');
const tapButton = document.getElementById('tapButton');

tapButton.addEventListener('click', () => {
  score++;
  scoreElement.innerText = score;

  // Вибрация
  if (navigator.vibrate) navigator.vibrate(50);

  // Анимация +1
  const plus = document.createElement('div');
  plus.innerText = '+1';
  plus.className = 'float-plus';
  plus.style.left = (tapButton.offsetLeft + 100 + (Math.random() * 60 - 30)) + 'px';
  plus.style.top = (tapButton.offsetTop + 100 + (Math.random() * 60 - 30)) + 'px';
  document.body.appendChild(plus);

  setTimeout(() => {
    plus.remove();
  }, 1000);
});
