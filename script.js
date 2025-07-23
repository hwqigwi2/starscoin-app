let tickets = 3;
let spinning = false;
let currentRotation = 0;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";     // кнопка крутить (активна)
const IMG_SPIN_SPINNING = "IMG_2667.PNG";   // кнопка во время кручения
const IMG_SPIN_DISABLED = "IMG_2666.PNG";   // кнопка когда нет билетов

function updateUI() {
  ticketCount.textContent = `Билетов: ${tickets}`;
  btnSpin.disabled = spinning || tickets <= 0;
  btnSpin.style.cursor = btnSpin.disabled ? 'default' : 'pointer';
  if (tickets <= 0 && !spinning) btnSpin.src = IMG_SPIN_DISABLED;
  else if (!spinning) btnSpin.src = IMG_SPIN_NORMAL;
}

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();
  btnSpin.src = IMG_SPIN_SPINNING;

  const spins = 5; // количество полных оборотов перед остановкой
  const chance = Math.random();

  // Выбор угла по шансам: 20% билет (90°), 80% ноль (125°)
  const targetAngle = chance < 0.2 ? 90 : 125;

  // Новый угол вращения колеса, чтобы targetAngle оказался под стрелкой (90°)
  // Формула: currentRotation + spins*360 + (90 - targetAngle)
  const newRotation = currentRotation + spins * 360 + (90 - targetAngle);

  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  wheel.dataset.rotation = newRotation;

  currentRotation = newRotation;

  setTimeout(() => {
    spinning = false;

    if (targetAngle === 90) {
      tickets++;
      alert("🎉 Вы получили билет!");
    } else {
      alert("😔 В следующий раз повезёт!");
    }

    updateUI();
  }, 3000);
});

updateUI();
