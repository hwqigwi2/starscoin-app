let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');
const message = document.getElementById('message');

const IMG_SPIN_NORMAL = "IMG_2618.PNG";
const IMG_SPIN_SPINNING = "IMG_2620.PNG";
const IMG_SPIN_DISABLED = "IMG_2619.PNG";

updateUI();

btnSpin.addEventListener('click', () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();

  btnSpin.src = IMG_SPIN_SPINNING;
  message.classList.remove('visible');

  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 3;
  const randomAngle = Math.floor(Math.random() * 360);
  const newRotation = currentRotation + spins * 360 + randomAngle;

  wheel.style.transform = `translateX(-50%) rotate(${newRotation}deg)`;
  wheel.dataset.rotation = newRotation;

  setTimeout(() => {
    spinning = false;
    const won = Math.random() < 0.4;

    if (won) {
      tickets++;
      showMessage("🎉 Вы получили 1 билет!");
    } else {
      showMessage("В следующий раз повезёт 😔");
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

function showMessage(text) {
  message.textContent = text;
  message.classList.add('visible');
  setTimeout(() => {
    message.classList.remove('visible');
  }, 3000);
}
