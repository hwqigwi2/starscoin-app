let tickets = 3;
let spinning = false;
const wheel = document.getElementById('wheel');
const overlay = document.getElementById('overlay');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');
const API_BASE_URL = "https://starscdihe.online/api";
const STORAGE_TICKETS = 'tickets';
const STORAGE_USER_ID = 'user_id';
const STORAGE_PENDING_REFS = 'pendingRefs';
let userId = null;
let refLink = null;

async function initApp() {
    loadUserId();

    if (!userId) {
        showTelegramAlert("Ошибка: Не удалось определить user_id");
        return;
    }

    await initUser();
    await handleReferral();
    await loadTickets();
    updateUI();
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function loadUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('tg_user_id')
        || (window.Telegram && Telegram.WebApp.initDataUnsafe?.user?.id)
        || localStorage.getItem(STORAGE_USER_ID)
        || null;

    if (urlParams.get('tg_user_id')) {
        localStorage.setItem(STORAGE_USER_ID, urlParams.get('tg_user_id'));
        userId = urlParams.get('tg_user_id');
    }

    if (userId) {
        refLink = `https://t.me/XStarsCoin_bot?start=ref${userId}`;
    }
}

async function initUser() {
    if (!userId) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/init`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                referrer_id: getQueryParam('referrer') 
            })
        });
        
        const data = await res.json();
        tickets = data.tickets;
    } catch {
        tickets = 3;
    }
    updateUI();
}

async function loadTickets() {
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/${userId}`);
        if (res.ok) {
            const data = await res.json();
            tickets = data.tickets;
        }
    } catch(e) {
        console.error('Ticket sync error:', e);
    }
}

async function saveTickets() {
    if (!userId) return;
    try {
        await fetch(`${API_BASE_URL}/set-tickets`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, tickets})
        });
    } catch(e) {
        console.error('Ошибка сохранения билетов:', e);
    }
}

function updateUI() {
    if (!ticketCount) return;

    ticketCount.textContent = tickets ?? 0;
    if (!btnSpin) return;

    btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
    btnSpin.src = spinning
        ? "IMG_2667.PNG"
        : tickets > 0
            ? "IMG_2665.PNG"
            : "IMG_2666.PNG";
}

function showTelegramAlert(text) {
    if (Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

async function handleReferral() {
    const referrer = getQueryParam('referrer') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.start_param) || null;
    if (!referrer || referrer === userId) return;

    try {
        const res = await fetch(`${API_BASE_URL}/referral`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, referrer})
        });

        if (res.ok) {
            const data = await res.json();
            if (data.added) {
                await loadTickets();
            }
        }
    } catch(e) {
        console.error('Ошибка реферальной системы:', e);
    }
}

async function spinWheel() {
    if (spinning || tickets <= 0) return;
    spinning = true;
    updateUI();

    try {
        const res = await fetch(`${API_BASE_URL}/spin`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Spin failed');
        }

        const data = await res.json();
        tickets = data.tickets;
        
        if (data.won) {
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
    } catch (error) {
        // Всегда синхронизируем состояние с сервером
        await loadTickets();
        showTelegramAlert(error.message || "Ошибка соединения");
    } finally {
        spinning = false;
        updateUI();
    }
}
        }, 3000);

    } catch (error) {
        spinning = false;

        // Если ошибка, возвращаем билет назад
        tickets += 1;
        updateUI();

        showTelegramAlert(error.message || "Ошибка соединения с сервером");
    }
}

if (userId) {
    setInterval(async () => {
        if (!document.hidden) {
            await loadTickets();
        }
    }, 3000);
}

// --- JPG лента ---
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

// --- Переключение экранов ---
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
    try {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
        }

        await initApp();

        initJpgStrip();
        setInterval(slideNext, 5000);

        if (btnSpin) {
            btnSpin.addEventListener('click', spinWheel);
        }

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
                    document.getElementById('topOverlayRect').style.display = 'none';
                    isAltScreen = true;
                } else if (index === 2) {
                    elementsToToggle.forEach(el => el.style.display = 'none');
                    midRect.style.display = 'none';
                    document.getElementById('topLeftImg').style.display = 'block';
                    document.getElementById('topLeftImg2777').style.display = 'block';
                    document.getElementById('topLeftImg2774').style.display = 'block';
                    document.getElementById('topLeftImg2773').style.display = 'block';
                    document.getElementById('topRightImg2776').style.display = 'block';
                    document.getElementById('topOverlayRect').style.display = 'block';
                    isAltScreen = true;
                } else if (index === 0) {
                    elementsToToggle.forEach(el => el.style.display = '');
                    midRect.style.display = 'none';
                    document.getElementById('topLeftImg').style.display = 'none';
                    document.getElementById('topLeftImg2777').style.display = 'none';
                    document.getElementById('topLeftImg2774').style.display = 'none';
                    document.getElementById('topLeftImg2773').style.display = 'none';
                    document.getElementById('topRightImg2776').style.display = 'none';
                    document.getElementById('topOverlayRect').style.display = 'none';
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
                    ? encodeURIComponent(`https://t.me/XStarsCoin_bot?start=ref${userId}`)
                    : encodeURIComponent("https://t.me/XStarsCoin_bot");
                const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
                const shareUrl = `${baseUrl}?url=${url}&text=${text}`;
                window.open(shareUrl, '_blank');
            });
        }

    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showTelegramAlert("Ошибка при запуске приложения");
    }
});