const SUPABASE_URL = 'https://jvezdcspexdvskkdlcwi.supabase.co'; // Твой Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZXpkY3NwZXhkdnNra2RsY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjI5MjcsImV4cCI6MjA2OTYzODkyN30.1Qkliu9JukmhoTmkstHnASMfxwB7Tcp3bCt-2CooNq4';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let tickets;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

const STORAGE_USER_ID = 'user_id';
const STORAGE_PENDING_REFS = 'pendingRefs';

let userId = null;
let refLink = null;

console.log('*** Debug info ***');
console.log('user_id из URL или localStorage:', userId);
console.log('Telegram.WebApp.initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
console.log('userId из Telegram WebApp:', window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
console.log('start_param из Telegram WebApp:', window.Telegram?.WebApp?.initDataUnsafe?.start_param);


// Получить параметр из URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Создать или получить пользователя из Supabase, если нет - создать с 3 билетами
async function fetchOrCreateUser(id, inviter = null) {
    const { data, error } = await supabase
        .from('users')
        .select('tickets')
        .eq('id', id)
        .single();

    if (error && error.code === 'PGRST116') {
        // Пользователь не найден - создаём
        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{ id: id, tickets: 3, inviter_id: inviter }])
            .select()
            .single();

        if (insertError) {
            console.error('Ошибка создания пользователя:', insertError);
            return 3; // По умолчанию 3 билета
        }
        return insertData.tickets;
    } else if (error) {
        console.error('Ошибка запроса пользователя:', error);
        return 3;
    }

    return data.tickets ?? 3;
}

// Обновить количество билетов в Supabase
async function updateTicketsInDb(id, newTickets) {
    const { error } = await supabase
        .from('users')
        .update({ tickets: newTickets })
        .eq('id', id);

    if (error) {
        console.error('Ошибка обновления билетов:', error);
    }
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

// Загрузить билеты из Supabase (async)
async function loadTickets() {
    tickets = await fetchOrCreateUser(userId);
    updateUI();
}

// Сохранить билеты локально и в Supabase
async function saveTickets() {
    localStorage.setItem('tickets', tickets);
    await updateTicketsInDb(userId, tickets);
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

// Обработка реферала — проверяем, если пригласил кто-то новый, даём +1 билет
async function handleReferral() {
    const referrer = getQueryParam('referrer') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.start_param) || null;
    if (!referrer || referrer === userId) return;

    // Загружаем уже учтённые рефералы из localStorage
    const pendingRefs = JSON.parse(localStorage.getItem(STORAGE_PENDING_REFS) || '{}');

    if (!pendingRefs[referrer]) {
        // Проверим, есть ли такой реферал в базе (чтобы не повторять)
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (!error && data) {
            // Добавляем билет, отмечаем реферал учтенным
            pendingRefs[referrer] = true;
            localStorage.setItem(STORAGE_PENDING_REFS, JSON.stringify(pendingRefs));

            tickets++;
            await saveTickets();
            updateUI();

            showTelegramAlert("🎉 Вы зашли по ссылке друга и получили 1 билет!");
        }
    }
}

// Функция вращения колеса
async function spinWheel() {
    if (spinning || tickets <= 0) return;

    spinning = true;
    tickets--;
    await saveTickets();
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

    setTimeout(async () => {
        spinning = false;
        if (targetAngle === 0) {
            tickets++;
            await saveTickets();
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
        updateUI();
    }, 3050);
}

// --- JPG лента (оставляю без изменений) ---
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

// --- Переключение экранов (3 кнопки квадраты) ---
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

window.addEventListener('DOMContentLoaded', async () => {
    loadUserId();

    if (!userId) return;

    await loadTickets();
    await handleReferral();

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
            const url = userId
                ? encodeURIComponent(`https://t.me/XStarsCoin_bot?referrer=${userId}`)
                : encodeURIComponent("https://t.me/XStarsCoin_bot");
            const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
            const shareUrl = `${baseUrl}?url=${url}&text=${text}`;
            window.open(shareUrl, '_blank');
        });
    }
});
