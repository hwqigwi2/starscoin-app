let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const btnBack = document.getElementById('btnBack');
const btnBilets = document.getElementById('btnBilets');
const ticketCount = document.getElementById('ticketCount');
const message = document.getElementById('message');

const IMG_SPIN_NORMAL = "IMG_2618.PNG";
const IMG_SPIN_SPINNING = "IMG_2620.PNG";
const IMG_SPIN_DISABLED = "IMG_2619.PNG";

updateUI();

btnSpin.onclick = () => {
  if (spinning || tickets <= 0) return;

  spinning = true;
  tickets--;
  updateUI();

  btnSpin.src = IMG_SPIN_SPINNING;

  // Вращаем колесо плавно в одну сторону с 3+ оборотами
  // Накапливаем угол, чтобы не скакало назад
  let currentRotation = wheel.dataset.rotation ? parseFloat(wheel.dataset.rotation) : 0;
  const spins = 3;
  const randomAngle = Math.floor(Math.random() * 360);
  const newRotation = currentRotation + spins * 360 + randomAngle;
  wheel.style.transform = `translateX(-50%) rotate(${newRotation}deg)`;
  wheel.dataset.rotation = newRotation;

  setTimeout(() => {
    spinning = false;
    const won = Math.random() < 0.4; // 40% шанс выиграть билет

    if (won) {
      tickets++;
      message.textContent = "Вы получили 1 билет!";
    } else {
      message.textContent = "В следующий раз повезёт 😔";
    }

    btnSpin.style.display = "none";
    btnBack.style.display = "block";
    updateUI();
  }, 3000);
};

btnBack.onclick = () => {
  message.textContent = "";
  btnSpin.style.display = "block";
  btnBack.style.display = "none";
  updateUI();
};

function updateUI() {
  ticketCount.textContent = tickets;
  if (tickets <= 0 && !spinning) {
    btnSpin.src = IMG_SPIN_DISABLED;
  } else if (!spinning) {
    btnSpin.src = IMG_SPIN_NORMAL;
  }
}
