let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalOk = document.getElementById('modalOk');

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
      showModal("🎉 Вы получили 1 билет!");
    } else {
      showModal("😔 В следующий раз повезёт");
    }

    updateUI();
  }, 3000);
});

modalOk.addEventListener('click', () => {
  modal.style.display = "none";
});

function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
  btnSpin.src = (tickets <= 0 && !spinning) ? IMG_SPIN_DISABLED : IMG_SPIN_NORMAL;
}

function showModal(text) {
  modalText.textContent = text;
  modal.style.display = "flex";
}
