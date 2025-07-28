// Конфигурация
const API_BASE = 'https://starscoin-app-33ik.vercel.app';
const BOT_USERNAME = 'XStarsCoin_bot';

// Состояние приложения
let state = {
    tickets: 3,
    spinning: false,
    userId: null,
    userNick: null,
    referrerId: null
};

// Элементы интерфейса
const elements = {
    wheel: document.getElementById('wheel'),
    btnSpin: document.getElementById('btnSpin'),
    ticketCount: document.getElementById('ticketCount'),
    refBox: document.createElement('div')
};

// Инициализация
function init() {
    setupRefBox();
    initUser();
    initJpgStrip();
    setupEventListeners();
    setInterval(slideNext, 5000);
}

// Настройка контейнера для рефералов
function setupRefBox() {
    elements.refBox.className = 'referral-names';
    document.getElementById('midRect').appendChild(elements.refBox);
}

// Инициализация пользователя
async function initUser() {
    state.userId = getQueryParam('user_id') || getTelegramUserId();
    state.userNick = getQueryParam('nick') || getTelegramUsername();
    state.referrerId = getQueryParam('referrer') || getTelegramStartParam();

    if (state.userId) {
        await loadUserData();
        handleReferral();
    }
}

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const ticketsData = await apiRequest(`/api/get-tickets?user_id=${state.userId}`);
        if (ticketsData?.tickets !== undefined) {
            state.tickets = ticketsData.tickets;
            updateUI();
        }
    } catch (err) {
        console.error("Ошибка загрузки данных:", err);
    }
}

// Обработка реферальной ссылки
async function handleReferral() {
    if (!state.referrerId || state.referrerId === state.userId.toString()) return;

    const refKey = `ref_${state.userId}_${state.referrerId}`;
    if (localStorage.getItem(refKey)) return;

    try {
        const response = await apiRequest('/api/register-ref', 'POST', {
            inviter: parseInt(state.referrerId),
            user: parseInt(state.userId),
            user_nick: state.userNick
        });

        if (response?.status === 'ok') {
            localStorage.setItem(refKey, '1');
            showAlert("🎉 Вам начислен бонус за приглашение!");
            await loadUserData();
        }
    } catch (err) {
        console.error("Ошибка реферальной системы:", err);
    }
}

// Вращение колеса
async function spinWheel() {
    if (state.spinning || state.tickets <= 0) return;

    state.spinning = true;
    state.tickets--;
    updateUI();

    try {
        await apiRequest('/api/update-tickets', 'POST', {
            user_id: parseInt(state.userId),
            new_tickets: state.tickets
        });
    } catch (err) {
        console.error("Ошибка сохранения билетов:", err);
    }

    // Анимация вращения
    const result = Math.random() < 0.8 ? "lose" : "win";
    animateWheel(result);

    setTimeout(async () => {
        if (result === "win") {
            state.tickets++;
            showAlert("🎉 Вы получили 1 билет!");
        } else {
            showAlert("😔 В следующий раз повезёт");
        }

        state.spinning = false;
        updateUI();

        try {
            await apiRequest('/api/update-tickets', 'POST', {
                user_id: parseInt(state.userId),
                new_tickets: state.tickets
            });
        } catch (err) {
            console.error("Ошибка сохранения билетов:", err);
        }
    }, 3500);
}

// API запросы
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {'Content-Type': 'application/json'}
        };

        if (data) options.body = JSON.stringify(data);

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        return await response.json();
    } catch (err) {
        console.error(`API request failed: ${err}`);
        throw err;
    }
}

// Вспомогательные функции
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function getTelegramUserId() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
}

function getTelegramUsername() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.username;
}

function getTelegramStartParam() {
    return window.Telegram?.WebApp?.initDataUnsafe?.start_param;
}

function showAlert(text) {
    if (window.Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

function updateUI() {
    elements.ticketCount.textContent = state.tickets;
    elements.btnSpin.style.cursor = state.tickets > 0 && !state.spinning ? 'pointer' : 'default';
    elements.btnSpin.src = state.spinning
        ? "IMG_2667.PNG"
        : state.tickets > 0
            ? "IMG_2665.PNG"
            : "IMG_2666.PNG";
}

// Анимация колеса
function animateWheel(result) {
    const spins = 5;
    const targetAngle = result === "win" ? 0 : -75;
    const rotation = spins * 360 + targetAngle;

    elements.wheel.style.transition = 'none';
    elements.wheel.style.transform = 'rotate(0deg)';

    setTimeout(() => {
        elements.wheel.style.transition = 'transform 3s cubic-bezier(0.33, 1, 0.68, 1)';
        elements.wheel.style.transform = `rotate(${rotation}deg)`;
    }, 50);
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', init);