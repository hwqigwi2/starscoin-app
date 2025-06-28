let balance = 52970;
let energy = 1398;
const maxEnergy = 6000;

const balanceEl = document.getElementById('balance');
const energyEl = document.getElementById('energy');
const progressFill = document.getElementById('progressFill');
const clickButton = document.getElementById('clickButton');

function updateUI() {
  balanceEl.textContent = balance.toLocaleString();
  energyEl.textContent = energy;
  const percent = Math.min((energy / maxEnergy) * 100, 100);
  progressFill.style.width = `${percent}%`;
}

clickButton.addEventListener('click', () => {
  if (energy <= 0) return;

  balance += 1;
  energy -= 1;

  // Вибрация на телефоне
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  updateUI();
});

updateUI();
