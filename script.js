const supabaseUrl = 'https://qqczvmnhsymrfnnsilvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY3p2bW5oc3ltcmZubnNpbHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTg4MzAsImV4cCI6MjA2OTYzNDgzMH0.HG6iXIM_M5MzaS_UHhPrlBFgk3m5evSLfhPZCOK6g-U';
const supabase = createClient(supabaseUrl, supabaseKey);

let tickets = 0;
let spinning = false;

// DOM элементы
const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');
const squares = document.querySelectorAll('.square');
const midRect = document.getElementById('midRect');
const jpgStrip = document.getElementById('jpgStrip');

let userId = null;

// Инициализация аутентификации
async function initAuth() {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${Telegram.WebApp.initDataUnsafe.user.id}@telegram.org`,
      password: Telegram.WebApp.initDataUnsafe.user.id.toString()
    });
    if (error) throw error;
  } catch (error) {
    console.error('Auth error:', error);
  }
}

// Загрузка данных пользователя
async function loadUserData() {
  userId = Telegram.WebApp.initDataUnsafe?.user?.id?.toString();
  if (!userId) {
    console.error("User ID not found");
    return;
  }

  // Создаем или получаем пользователя
  const { data, error } = await supabase
    .from('users')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error loading user:', error);
    tickets = 3; // Значение по умолчанию
  } else {
    tickets = data.tickets || 3;
  }
  updateUI();
}

// Обработка рефералов
async function handleReferral() {
  const referrer = Telegram.WebApp.initDataUnsafe?.start_param;
  if (!referrer || referrer === userId) return;

  try {
    // Проверяем существование реферала
    const { count, error } = await supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('referred_id', userId);

    if (count === 0) {
      // Добавляем запись о реферале
      await supabase.from('referrals').insert({
        referrer_id: referrer,
        referred_id: userId
      });
      
      // Начисляем билет пригласившему
      await supabase.rpc('increment_tickets', {
        user_id: referrer,
        amount: 1
      });
      
      showTelegramAlert("🎉 Вы зашли по ссылке друга!");
    }
  } catch (error) {
    console.error('Referral error:', error);
  }
}

// Функция вращения колеса
async function spinWheel() {
  if (spinning || tickets <= 0) return;

  spinning = true;
  updateUI();

  try {
    // Уменьшаем билеты
    await supabase.rpc('decrement_tickets', {
      user_id: userId,
      amount: 1
    });

    // Анимация вращения
    const rand = Math.random();
    const spins = 5;
    const targetAngle = rand < 0.8 ? -75 : 0;
    const rotation = spins * 360 + targetAngle;

    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(0deg)`;

    setTimeout(() => {
      wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
      wheel.style.transform = `rotate(${rotation}deg)`;
    }, 50);

    setTimeout(async () => {
      spinning = false;
      
      if (targetAngle === 0) {
        // Начисляем выигрыш
        await supabase.rpc('increment_tickets', {
          user_id: userId,
          amount: 1
        });
        showTelegramAlert("🎉 Вы получили 1 билет!");
      } else {
        showTelegramAlert("😔 В следующий раз повезёт");
      }
      
      // Обновляем данные
      await loadUserData();
    }, 3050);
  } catch (error) {
    console.error('Spin error:', error);
    spinning = false;
    updateUI();
  }
}

// Обновление UI
function updateUI() {
  ticketCount.textContent = tickets;
  btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
  btnSpin.src = spinning
    ? "IMG_2667.PNG"
    : tickets > 0
      ? "IMG_2665.PNG"
      : "IMG_2666.PNG";
}

// Показать alert
function showTelegramAlert(text) {
  if (Telegram?.WebApp?.showAlert) {
    Telegram.WebApp.showAlert(text);
  } else {
    alert(text);
  }
}

// Инициализация ленты изображений
const initJpgStrip = () => {
  const imgWidth = 45;
  const gap = 10;
  const visibleCount = 7;
  const jpgOrder = [2685, 2685, 2681, 2685, 2680, 2680, 2681, 2680, 2685, 2680, 2683, 2685, 2682, 2685, 2685, 2680, 2681, 2685, 2680, 2680, 2682, 2680, 2680, 2681, 2685, 2680, 2681, 2685, 2681];
  
  let currentIndex = 0;
  let imgs = [];

  const positionImgs = () => {
    imgs.forEach((img, i) => {
      img.style.left = `${i * (imgWidth + gap)}px`;
      img.style.opacity = "1";
      img.classList.remove("leaving", "entering");
    });
  };

  const slideNext = () => {
    if (!imgs.length) return;

    imgs[0].classList.add("leaving");
    imgs[0].style.left = "0px";

    for (let i = 1; i < imgs.length; i++) {
      imgs[i].style.left = `${(i - 1) * (imgWidth + gap)}px`;
    }

    const newImg = document.createElement('img');
    newImg.src = `IMG_${jpgOrder[currentIndex]}.JPG`;
    newImg.classList.add("entering");
    newImg.style.opacity = "0";
    newImg.style.left = `${(imgWidth + gap) * visibleCount}px`;

    jpgStrip.appendChild(newImg);
    imgs.push(newImg);

    requestAnimationFrame(() => {
      newImg.style.left = `${(visibleCount - 1) * (imgWidth + gap)}px`;
      newImg.style.opacity = "1";
    });

    currentIndex = (currentIndex + 1) % jpgOrder.length;

    setTimeout(() => {
      jpgStrip.removeChild(imgs.shift());
      newImg.classList.remove("entering");
      positionImgs();
    }, 1000);
  };

  // Инициализация
  jpgStrip.innerHTML = "";
  currentIndex = visibleCount % jpgOrder.length;
  imgs = [];

  for (let i = 0; i < visibleCount; i++) {
    const img = document.createElement('img');
    img.src = `IMG_${jpgOrder[i]}.JPG`;
    jpgStrip.appendChild(img);
    imgs.push(img);
  }

  positionImgs();
  setInterval(slideNext, 5000);
};

// Обработчики кнопок
function setupButtons() {
  const elementsToToggle = [
    document.querySelector('.wheel-wrapper'),
    document.querySelector('.center-icon'),
    document.querySelector('.btn-bilets-wrapper'),
    document.querySelector('.btn-spin-wrapper'),
    jpgStrip,
    document.querySelector('.info-icon'),
    document.querySelector('.png-strip-container')
  ];

  // Кнопка вращения
  btnSpin.addEventListener('click', spinWheel);

  // Кнопки переключения экранов
  squares.forEach((square, index) => {
    square.addEventListener('click', () => {
      if (index === 1) {
        elementsToToggle.forEach(el => el.style.display = 'none');
        midRect.style.display = 'block';
      } else if (index === 2) {
        elementsToToggle.forEach(el => el.style.display = 'none');
        midRect.style.display = 'none';
        document.querySelectorAll('[id^="topLeftImg"], #topRightImg2776').forEach(el => {
          el.style.display = 'block';
        });
      } else if (index === 0) {
        elementsToToggle.forEach(el => el.style.display = '');
        midRect.style.display = 'none';
        document.querySelectorAll('[id^="topLeftImg"], #topRightImg2776').forEach(el => {
          el.style.display = 'none';
        });
      }
    });
  });

  // Инфо-иконка
  const infoIcon = document.getElementById('infoBtn');
  if (infoIcon) {
    infoIcon.addEventListener('click', () => {
      showTelegramAlert(`Шансы выпадения:
0 – 70%
🎟️ – 20%
⭐️50 – 5%
⭐️100 – 3%
⭐️500 – 1.9%
🏆Gold Heroic Helmet – 0.1%`);
    });
  }

  // Кнопка поделиться
  const shareImg = document.querySelector('#midRect .below-rect-img');
  if (shareImg) {
    shareImg.addEventListener('click', () => {
      const url = encodeURIComponent(`https://t.me/XStarsCoin_bot?start=${userId}`);
      const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    });
  }
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  await loadUserData();
  await handleReferral();
  initJpgStrip();
  setupButtons();
});