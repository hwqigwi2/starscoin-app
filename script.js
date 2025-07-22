const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

let tickets = 3;
let spinning = false;

const IMG_SPIN_NORMAL = 'IMG_2637.PNG';   // кнопка крутить (есть билеты)
const IMG_SPIN_SPINNING = 'IMG_2639.PNG'; // кнопка крутится
const IMG_SPIN_DISABLED = 'IMG_2638.PNG'; // кнопка крутить (нет билетов)

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();

  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 5; // сколько полных оборотов
  const randomAngle = Math.floor(Math.random() * 360);
  const newRotation = currentRotation + spins * 360 + randomAngle;

  wheel.style.transition = 'transform 4s ease-out';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  wheel.dataset.rotation = newRotation;

  setTimeout(() => {
    spinning = false;

    // Здесь можно добавить логику выигрыша (например, рандом)
    // Для примера просто показываю alert
    if (Math.random() < 0.4) {
      tickets++;
      alert('🎉 Вы получили 1 билет!');
    } else {
      alert('😔 В следующий раз повезёт');
    }

    updateUI();
  }, 4000);
});

function updateUI() {
  ticketCount.textContent = tickets;
  if (spinning) {
    btnSpin.style.cursor = 'default';
  } else if (tickets > 0) {
    btnSpin.style.cursor = 'pointer';
    btnSpin.src = IMG_SPIN_NORMAL;
  } else {
    btnSpin.style.cursor = 'default';
    btnSpin.src = IMG_SPIN_DISABLED;
  }
}
