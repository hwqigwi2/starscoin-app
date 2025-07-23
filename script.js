let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const IMG_SPIN_NORMAL = "IMG_2665.PNG";     // кнопка крутить (активна)
const IMG_SPIN_SPINNING = "IMG_2667.PNG";   // кнопка во время кручения
const IMG_SPIN_DISABLED = "IMG_2666.PNG";   // кнопка когда нет билетов

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();

  btnSpin.src = IMG_SPIN_SPINNING;

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 3;

  // Выбор одного из двух углов
  const angleLose = 90;    // сектор "не повезло"
  const angleWin = 270;    // сектор с 1 билетом
  const random = Math.random();
  const targetAngle = random < 0.75 ? angleLose : angleWin;

  const newRotation = currentRotation + spins * 360 + targetAngle;

  wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${newRotation}deg)`;
  overlay.style.transform = `rotate(0deg)`;
  wheel.dataset.rotation = newRotation;

  setTimeout(() => {
    spinning = false;

    // Проверка по углу, что выпало
    const finalAngle = targetAngle % 360;

    if (finalAngle === angleWin) {
      tickets++;
      showTelegramAlert("🎉 Вы получили 1 билет!");
    } else {
      showTelegramAlert("😔 В следующий раз повезёт");
    }

    btnSpin.src = tickets > 0 ? IMG_SPIN_NORMAL : IMG_SPIN_DISABLED;
    updateUI();
  }, 3000);
});

function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
  if (tickets <= 0 && !spinning) {
    btnSpin.src = IMG_SPIN_DISABLED;
  } else if (!spinning) {
    btnSpin.src = IMG_SPIN_NORMAL;
  }
}

function showTelegramAlert(text) {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}
