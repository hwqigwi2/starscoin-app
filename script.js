let tickets = 0;
let spinning = false;

const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');
const inviteButton = document.getElementById('inviteButton');
const refBox = document.createElement('div');
refBox.className = 'referral-names';
document.getElementById('midRect').appendChild(refBox);

let userId = null;
let userNick = null;
let referrerId = null;

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function showTelegramAlert(text) {
    if (Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

function updateUI() {
    ticketCount.textContent = tickets;
    btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
    btnSpin.src = spinning
        ? "IMG_2667.PNG"
        : tickets > 0
        ? "IMG_2665.PNG"
        : "IMG_2666.PNG";
}

async function fetchUserData() {
    try {
        const res = await fetch(`/api/user-state?user_id=${userId}`);
        const data = await res.json();
        if (data?.tickets !== undefined) {
            tickets = data.tickets;
            updateUI();
        }
    } catch (err) {
        console.error("Ошибка получения данных:", err);
    }
}

async function sendRefData() {
    if (!referrerId || !userId) return;
    try {
        const res = await fetch('/api/register-ref', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inviter: parseInt(referrerId),
                user: parseInt(userId),
                user_nick: userNick || ""
            })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            showTelegramAlert("🎉 Вам начислен бонус за приглашение!");
            await fetchUserData();
        }
    } catch (err) {
        console.error("Ошибка отправки реферала:", err);
    }
}

async function loadReferrals() {
    try {
        const res = await fetch(`/api/get-referrals?user_id=${userId}`);
        const data = await res.json();
        refBox.innerHTML = '';
        data.referrals?.forEach((nick, i) => {
            const div = document.createElement('div');
            div.textContent = `${i + 1}. ${nick}`;
            refBox.appendChild(div);
        });
    } catch (err) {
        console.error("Ошибка загрузки рефералов:", err);
    }
}

function handleReferral() {
    referrerId = getQueryParam('referrer') || Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (referrerId && referrerId !== userId?.toString()) {
        sendRefData();
    }
}

function copyReferralLink() {
    const referralLink = `https://t.me/XStarsCoin_bot?start=${userId}`;
    navigator.clipboard.writeText(referralLink)
        .then(() => showTelegramAlert("Ссылка скопирована!"))
        .catch(err => {
            const textarea = document.createElement("textarea");
            textarea.value = referralLink;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            showTelegramAlert("Ссылка скопирована!");
        });
}

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
    wheel.style.transform = `rotate(0deg)`;
    setTimeout(() => {
        wheel.style.transition = 'transform 3s ease-out';
        wheel.style.transform = `rotate(${rotation}deg)`;
    }, 50);

    setTimeout(async () => {
        spinning = false;
        if (targetAngle === 0) {
            tickets++;
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
        await fetch('/api/update-tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, tickets })
        });
        updateUI();
    }, 3050);
}

function initUser() {
    userId = getQueryParam('user_id') || Telegram?.WebApp?.initDataUnsafe?.user?.id;
    userNick = getQueryParam('nick') || Telegram?.WebApp?.initDataUnsafe?.user?.username || null;
    if (userId) {
        handleReferral();
        fetchUserData().then(loadReferrals);
    }
}

// UI переключения
const squares = document.querySelectorAll('.square');
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
    initUser();
    updateUI();
    btnSpin.addEventListener('click', spinWheel);
    inviteButton?.addEventListener('click', copyReferralLink);

    squares.forEach((square, index) => {
        square.addEventListener('click', () => {
            squares.forEach(sq => sq.classList.remove('active'));
            square.classList.add('active');

            if (index === 1 && !isAltScreen) {
                elementsToToggle.forEach(el => el.style.display = 'none');
                midRect.style.display = 'block';
                isAltScreen = true;
                loadReferrals();
            } else if (index === 0 && isAltScreen) {
                elementsToToggle.forEach(el => el.style.display = '');
                midRect.style.display = 'none';
                isAltScreen = false;
            }
        });
    });

    const infoIcon = document.getElementById('infoBtn');
    infoIcon?.addEventListener('click', () => {
        showTelegramAlert(`Шансы выпадения:

0 – 70%
🎟️ – 20%
⭐️50 – 5%
⭐️100 – 3%
⭐️500 – 1.9%
🏆Gold Heroic Helmet – 0.1%`);
    });

    const shareImg = document.querySelector('#midRect .below-rect-img');
    shareImg?.addEventListener('click', () => {
        const baseUrl = "https://t.me/share/url";
        const url = encodeURIComponent(`https://t.me/XStarsCoin_bot?start=${userId}`);
        const text = encodeURIComponent("🎰 Крути колесо и получай звёзды! ✨");
        const shareUrl = `${baseUrl}?url=${url}&text=${text}`;
        window.open(shareUrl, '_blank');
    });
});
