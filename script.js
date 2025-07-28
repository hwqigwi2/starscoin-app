let tickets = 3;
let spinning = false;

const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

let userId = null;
let referrerId = null;
let userNick = null;

const refBox = document.createElement('div');
refBox.className = 'referral-names';
document.getElementById('midRect').appendChild(refBox);

// Функция для получения параметра из URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
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

// Показать alert в Telegram или обычный alert
function showTelegramAlert(text) {
    if (Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

// Отправка данных о реферале на сервер
async function sendRefData(inviterId, nick) {
    if (!userId) return;

    try {
        const response = await fetch('/api/register-ref', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inviter: parseInt(inviterId),
                user: parseInt(userId),
                user_nick: nick
            })
        });

        const data = await response.json();
        console.log("Реферальные данные отправлены:", data);

        if (data.status === 'ok') {
            await updateTicketsFromServer();
            showTelegramAlert("🎉 Вам начислен бонус за приглашение!");
        } else if (data.status === "already-registered") {
            console.log("Реферальная система: пользователь уже зарегистрирован по реферальной ссылке.");
        } else if (data.status === "self-referral") {
            console.log("Реферальная система: попытка самореферала, игнорируем.");
        }
    } catch (err) {
        console.error("Ошибка отправки реферальных данных:", err);
    }
}

// Получение количества билетов с сервера
async function updateTicketsFromServer() {
    if (!userId) return;

    try {
        const response = await fetch(/api/get-tickets?user_id=${userId});
        const data = await response.json();

        if (data.tickets !== undefined) {
            tickets = data.tickets;
            updateUI();
        }
    } catch (err) {
        console.error("Ошибка получения билетов:", err);
    }
}

// Загрузка списка рефералов с сервера и вывод в refBox
async function loadReferrals() {
    if (!userId) return;

    try {
        const response = await fetch(/api/get-referrals?user_id=${userId});
        const data = await response.json();

        refBox.innerHTML = '';
        if (data.referrals && Array.isArray(data.referrals)) {
            data.referrals.forEach((nick, i) => {
                const div = document.createElement('div');
                div.textContent = ${i + 1}. ${nick};
                refBox.appendChild(div);
            });
        }
    } catch (err) {
        console.error("Ошибка загрузки рефералов:", err);
    }
}

// Обработка реферального перехода с локальным кэшем, отправка данных
function handleReferral() {
    referrerId = getQueryParam('referrer') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.start_param) || null;

    if (referrerId && referrerId !== userId?.toString()) {
        const pendingRefs = JSON.parse(localStorage.getItem('pendingRefs') || '{}');
        if (!pendingRefs[referrerId]) {
            pendingRefs[referrerId] = true;
            localStorage.setItem('pendingRefs', JSON.stringify(pendingRefs));

            showTelegramAlert("🎉 Вы зашли по ссылке друга! Спасибо!");
            // userNick может быть null, это ок
            sendRefData(referrerId, userNick);
        }
    }
}

// Инициализация пользователя, получение параметров из URL или Telegram WebApp
function initUser() {
    userId = getQueryParam('user_id') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.user?.id) || null;
    referrerId = getQueryParam('referrer') || null;
    userNick = getQueryParam('nick') || null;

    if (userId) {
        handleReferral();
        updateTicketsFromServer().then(loadReferrals);
    }
}

// Вращение колеса
function spinWheel() {
    if (spinning || tickets <= 0) return;

    spinning = true;
    tickets--;
    updateUI();
    btnSpin.src = "IMG_2667.PNG";

    const rand = Math.random();
    const spins = 5;
    const targetAngle = rand < 0.8 ? -75 : 0;
    const rotation = spins * 360 + targetAngle;

    wheel.style.transition = 'none';
    wheel.style.transform = rotate(0deg);

    setTimeout(() => {
        wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
        wheel.style.transform = rotate(${rotation}deg);
    }, 50);

    setTimeout(async () => {
        spinning = false;
        if (targetAngle === 0) {
            tickets++;
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
        updateUI();
        await updateTicketsFromServer();
    }, 3050);
}

// === Анимация JPG полосы ===
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
const STORAGE_KEY = "jpgStripState";

let currentIndex = 0;
let imgs = [];

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && Array.isArray(saved.currentImgs)) {
            currentIndex = saved.currentIndex;
            return saved.currentImgs;
        }
    } catch { }
    return null;
}

function saveState(currentImgs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentIndex,
        currentImgs
    }));
}

function positionImgs() {
    imgs.forEach((img, i) => {
        img.style.left = ${i * (imgWidth + gap)}px;
        img.style.opacity = "1";
        img.classList.remove("leaving", "entering");
    });
}

function initJpgStrip() {
    jpgStrip.innerHTML = "";
    let initialImgs = loadState() || jpgOrder.slice(0, visibleCount);
    currentIndex = visibleCount % jpgOrder.length;
    imgs = [];

    for (let i = 0; i < visibleCount; i++) {
        const img = document.createElement('img');
        img.src = ${jpgPrefix}${initialImgs[i]}${jpgSuffix};
        jpgStrip.appendChild(img);
        imgs.push(img);
    }

    positionImgs();
    saveState(initialImgs);
}

function slideNext() {
    if (!imgs.length) return;

    imgs[0].classList.add("leaving");
    imgs[0].style.left = "0px";

    for (let i = 1; i < imgs.length; i++) {
        imgs[i].style.left = ${(i - 1) * (imgWidth + gap)}px;
    }

    const newImg = document.createElement('img');
    newImg.src = ${jpgPrefix}${jpgOrder[currentIndex]}${jpgSuffix};
    newImg.classList.add("entering");
    newImg.style.opacity = "0";
    newImg.style.left = ${stripWidth}px;

    jpgStrip.appendChild(newImg);
    imgs.push(newImg);

    requestAnimationFrame(() => {
        newImg.style.left = ${(visibleCount - 1) * (imgWidth + gap)}px;
        newImg.style.opacity = "1";
    });

    currentIndex = (currentIndex + 1) % jpgOrder.length;

    setTimeout(() => {
        jpgStrip.removeChild(imgs.shift());
        newImg.classList.remove("entering");
        positionImgs();

        const currentImgs = imgs.map(img => {
            const match = img.src.match(/IMG_(\d+)\.JPG$/i);
            return match ? Number(match[1]) : null;
        });
        saveState(currentImgs);
    }, 1000);
}

// Логика выделения квадратов с прозрачным белым оверлеем
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

// Переключение экранов по нижним кнопкам
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

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initUser();
    updateUI();
    initJpgStrip();
    setInterval(slideNext, 5000);

    btnSpin.addEventListener('click', spinWheel);
    updateActiveSquare(activeIndex);

    // Обработчики для квадратов
    squares.forEach((square, index) => {
        square.addEventListener('click', () => {
            if (index === activeIndex) return;
            updateActiveSquare(index);

            // Обработка переключения экранов
            if (index === 1 && !isAltScreen) {
                elementsToToggle.forEach(el => el.style.display = 'none');
                midRect.style.display = 'block';
                isAltScreen = true;

                // При показе midRect подгружаем рефералов заново
                loadReferrals();
            } else if (index === 0 && isAltScreen) {
                elementsToToggle.forEach(el => el.style.display = '');
                midRect.style.display = 'none';
                isAltScreen = false;
            }
        });
    });

    // Информационная иконка
    const pngLeft = document.querySelector('.png-strip-left');
    const infoIcon = document.getElementById('infoBtn');

    if (pngLeft && infoIcon) {
        const rect = pngLeft.getBoundingClientRect();
        infoIcon.style.left = rect.left + 'px';
        infoIcon.style.top = (rect.bottom + 10) + 'px';
        infoIcon.style.opacity = '1';

        infoIcon.addEventListener('click', () => {
            showTelegramAlert(Шансы выпадения:

0 – 70%
🎟️ – 20%
⭐️50 – 5%
⭐️100 – 3%
⭐️500 – 1.9%
🏆Gold Heroic Helmet – 0.1%);
        });
    }

    // Реферальная кнопка share
    const shareImg = document.querySelector('#midRect .below-rect-img');

    if (shareImg) {
        shareImg.style.cursor = 'pointer';
        shareImg.addEventListener('click', () => {
            const baseUrl = "https://t.me/share/url";
            const url = userId
                ? encodeURIComponent(https://t.me/XStarsCoin_bot?start=${userId})
                : encodeURIComponent("https://t.me/XStarsCoin_bot");
            const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
            const shareUrl = ${baseUrl}?url=${url}&text=${text};

            window.open(shareUrl, '_blank');
        });
    }
});  