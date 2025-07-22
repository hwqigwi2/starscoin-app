let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const btnBack = document.getElementById('btnBack');
const btnBilets = document.getElementById('btnBilets');
const message = document.getElementById('message');

// Пути к картинкам для кнопок крутить
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

  // Вращаем колесо на случайный угол с 3 полными оборотами
  const rotation = 360 * 3 + Math.floor(Math.random() * 360);
  wheel.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

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
  btnBilets.title = `Билеты: ${tickets}`;
  if (tickets <= 0 && !spinning) {
    btnSpin.src = IMG_SPIN_DISABLED;
  } else if (!spinning) {
    btnSpin.src = IMG_SPIN_NORMAL;
  }
}
