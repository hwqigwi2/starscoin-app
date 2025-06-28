let balance = 0;
let energy = 6000;

document.getElementById("tapButton").addEventListener("click", (e) => {
  if (energy <= 0) return;

  balance++;
  energy--;

  document.getElementById("balance").textContent = balance;
  document.getElementById("energy").textContent = energy;

  if (navigator.vibrate) navigator.vibrate(50);

  const plusOne = document.createElement("div");
  plusOne.className = "plus-one";
  plusOne.style.left = `${e.clientX - 50}px`;
  plusOne.style.top = `${e.clientY - 70}px`;
  plusOne.textContent = "+1";

  document.body.appendChild(plusOne);

  setTimeout(() => {
    plusOne.remove();
  }, 500);
});

// Получение данных Telegram
if (window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  const user = window.Telegram.WebApp.initDataUnsafe?.user;
  if (user) {
    document.getElementById("username").textContent = user.username || "User";
    document.getElementById("avatar").src = user.photo_url;
  }
}
