const supabaseUrl = 'https://qqczvmnhsymrfnnsilvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY3p2bW5oc3ltcmZubnNpbHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTg4MzAsImV4cCI6MjA2OTYzNDgzMH0.HG6iXIM_M5MzaS_UHhPrlBFgk3m5evSLfhPZCOK6g-U';
const supabase = createClient(supabaseUrl, supabaseKey);

let tickets;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const STORAGE_TICKETS = 'tickets';
const STORAGE_USER_ID = 'user_id';
const STORAGE_PENDING_REFS = 'pendingRefs';

let userId = null;
let refLink = null;

async function initAuth() {
  const { user, error } = await supabase.auth.signIn({
    provider: 'telegram',
    token: Telegram.WebApp.initDataUnsafe.user.id.toString()
  });
  if (error) console.error(error);
}

// Получить параметр из URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Загрузить userId из localStorage или URL или Telegram WebApp
function loadUserId() {
    userId = localStorage.getItem(STORAGE_USER_ID)
        || getQueryParam('user_id')
        || (window.Telegram && Telegram.WebApp.initDataUnsafe?.user?.id)
        || null;

    if (!userId) {
        alert("Ошибка: Не удалось определить user_id");
        return;
    }

    userId = userId.toString();
    localStorage.setItem(STORAGE_USER_ID, userId);
    refLink = `https://t.me/XStarsCoin_bot?start=${userId}`;
}

// Загрузить билеты из localStorage или установить 3 по умолчанию
async function loadTickets() {
  if (!userId) return;
  
  const { data, error } = await supabase
    .from('users')
    .select('tickets')
    .eq('user_id', userId)
    .single();

  tickets = error ? 3 : data.tickets;
}

// Сохранить билеты в localStorage
function saveTickets() {
    localStorage.setItem(STORAGE_TICKETS, tickets);
}

// Обновить UI по билету и кнопке
function updateUI() {
    ticketCount.textContent = tickets;
    btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
    btnSpin.src = spinning
        ? "IMG_2667.PNG"
        : tickets > 0
            ? "IMG_2665.PNG"
            : "IMG_2666.PNG";
}

// Показать alert в Telegram WebApp или браузере
function showTelegramAlert(text) {
    if (Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

// Обработка реферала, добавление билета если новый приглашённый
async function handleReferral() {
  const referrer = getQueryParam('referrer') || Telegram.WebApp.initDataUnsafe?.start_param;
  if (!referrer || referrer === userId) return;

  // Проверяем, есть ли уже такая запись
  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact' })
    .eq('referred_id', userId)
    .eq('referrer_id', referrer);

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
}  


function spinWheel() {
    if (spinning || tickets <= 0) return;

    spinning = true;
    tickets--;
    saveTickets();
    updateUI();
    btnSpin.src = "IMG_2667.PNG";

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

    setTimeout(() => {
        spinning = false;
        if (targetAngle === 0) {
            tickets++;
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
        saveTickets();
        updateUI();
    }, 3050);
}

// JPG лента
const imgWidth = 45;
const gap = 10;
const visibleCount = 7;
const stripWidth = imgWidth * visibleCount + gap * (visibleCount - 1);

const jpgOrder = [
    2685, 2685, 2681, 2685, 2680,
    2680, 2681, 2680, 2685, 2680,
    2683, 2685, 2682, 2685, 2685,
    2680, 2681, 2685, 2680, 2680,
    2682, 2680, 2680, 2681, 2685,
    2680, 2681, 2685, 2681
];

const jpgStrip = document.getElementById('jpgStrip');
const jpgPrefix = "IMG_";
const jpgSuffix = ".JPG";
let currentIndex = 0;
let imgs = [];

function positionImgs() {
    imgs.forEach((img, i) => {
        img.style.left = `${i * (imgWidth + gap)}px`;
        img.style.opacity = "1";
        img.classList.remove("leaving", "entering");
    });
}

function initJpgStrip() {
    jpgStrip.innerHTML = "";
    currentIndex = visibleCount % jpgOrder.length;
    imgs = [];

    for (let i = 0; i < visibleCount; i++) {
        const img = document.createElement('img');
        img.src = `${jpgPrefix}${jpgOrder[i]}${jpgSuffix}`;
        jpgStrip.appendChild(img);
        imgs.push(img);
    }

    positionImgs();
}

function slideNext() {
    if (!imgs.length) return;

    imgs[0].classList.add("leaving");
    imgs[0].style.left = "0px";

    for (let i = 1; i < imgs.length; i++) {
        imgs[i].style.left = `${(i - 1) * (imgWidth + gap)}px`;
    }

    const newImg = document.createElement('img');
    newImg.src = `${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix}`;
    newImg.classList.add("entering");
    newImg.style.opacity = "0";
    newImg.style.left = `${stripWidth}px`;

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
}

// Кнопки переключения
const squares = document.querySelectorAll('.square');
let activeIndex = 0;

function updateActiveSquare(newIndex) {
    if (activeIndex !== null && squares[activeIndex]) {
        squares[activeIndex].classList.remove('active');
    }
    activeIndex = newIndex;
    if (squares[activeIndex]) {
        squares[activeIndex].classList.add('active');
    }
}

const elementsToToggle = [
    document.querySelector('.wheel-wrapper'),
    document.querySelector('.center-icon'),
    document.querySelector('.btn-bilets-wrapper'),
    document.querySelector('.btn-spin-wrapper'),
    document.getElementById('jpgStrip'),
    document.querySelector('.info-icon'),
    document.querySelector('.png-strip-container')
];

const midRect = document.getElementById('midRect');
let isAltScreen = false;

window.addEventListener('DOMContentLoaded', () => {
    loadUserId();
    loadTickets();
    handleReferral();
    updateUI();
    initJpgStrip();
    setInterval(slideNext, 5000);

    btnSpin.addEventListener('click', spinWheel);
    updateActiveSquare(activeIndex);

    squares.forEach((square, index) => {
        square.addEventListener('click', () => {
            if (index === activeIndex) return;
            updateActiveSquare(index);

            if (index === 1) {
                elementsToToggle.forEach(el => el.style.display = 'none');
                midRect.style.display = 'block';
                document.getElementById('topLeftImg').style.display = 'none';
                document.getElementById('topLeftImg2777').style.display = 'none';
                document.getElementById('topLeftImg2774').style.display = 'none';
                document.getElementById('topLeftImg2773').style.display = 'none';
                document.getElementById('topRightImg2776').style.display = 'none';
                isAltScreen = true;
            } else if (index === 2) {
                elementsToToggle.forEach(el => el.style.display = 'none');
                midRect.style.display = 'none';
                document.getElementById('topLeftImg').style.display = 'block';
                document.getElementById('topLeftImg2777').style.display = 'block';
                document.getElementById('topLeftImg2774').style.display = 'block';
                document.getElementById('topLeftImg2773').style.display = 'block';
                document.getElementById('topRightImg2776').style.display = 'block';
                isAltScreen = true;
            } else if (index === 0) {
                elementsToToggle.forEach(el => el.style.display = '');
                midRect.style.display = 'none';
                document.getElementById('topLeftImg').style.display = 'none';
                document.getElementById('topLeftImg2777').style.display = 'none';
                document.getElementById('topLeftImg2774').style.display = 'none';
                document.getElementById('topLeftImg2773').style.display = 'none';
                document.getElementById('topRightImg2776').style.display = 'none';
                isAltScreen = false;
            }
        });
    });

    // Инфо-иконка
    const pngLeft = document.querySelector('.png-strip-left');
    const infoIcon = document.getElementById('infoBtn');

    if (pngLeft && infoIcon) {
        const rect = pngLeft.getBoundingClientRect();
        infoIcon.style.left = rect.left + 'px';
        infoIcon.style.top = (rect.bottom + 10) + 'px';
        infoIcon.style.opacity = '1';

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
        shareImg.style.cursor = 'pointer';
        shareImg.addEventListener('click', () => {
            const baseUrl = "https://t.me/share/url";
            // Делаем ссылку с userId, чтобы другие могли по ней зайти и пригласить
            const url = userId
                ? encodeURIComponent(`https://t.me/XStarsCoin_bot?referrer=${userId}`)
                : encodeURIComponent("https://t.me/XStarsCoin_bot");
            const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
            const shareUrl = `${baseUrl}?url=${url}&text=${text}`;
            window.open(shareUrl, '_blank');
        });
    }
});
