let tickets = 3;
let spinning = false;
const API_BASE = 'https://starscoin-app-33ik.vercel.app'; // Ваш API-адрес

// Элементы интерфейса
const wheel = document.getElementById('wheel');
const btnSpin = document.getElementById('btnSpin');
const ticketCount = document.getElementById('ticketCount');

// Данные пользователя
let userId = null;
let userNick = null;
const TICKETS_KEY = 'user_tickets'; // Ключ для localStorage

// Инициализация пользователя
async function initUser() {
    // Получаем ID пользователя из Telegram WebApp или URL
    userId = getQueryParam('user_id') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.user?.id) || null;
    userNick = getQueryParam('nick') || (window.Telegram && Telegram.WebApp.initDataUnsafe?.user?.username) || "Unknown";

    if (userId) {
        // Загружаем билеты с сервера
        await loadTickets();
        
        // Обработка реферальной ссылки
        const referrerId = getQueryParam('referrer');
        if (referrerId && referrerId !== userId.toString()) {
            await handleReferral(referrerId);
        }
    }
}

// Загрузка билетов с сервера
async function loadTickets() {
    try {
        const response = await fetch(`${API_BASE}/api/get-tickets?user_id=${userId}`);
        const data = await response.json();
        
        if (data.tickets !== undefined) {
            tickets = data.tickets;
            // Сохраняем в localStorage на случай, если сервер недоступен
            localStorage.setItem(`${TICKETS_KEY}_${userId}`, tickets.toString());
            updateUI();
        }
    } catch (err) {
        console.error("Ошибка загрузки билетов:", err);
        // Используем локально сохраненное значение, если сервер недоступен
        const savedTickets = localStorage.getItem(`${TICKETS_KEY}_${userId}`);
        if (savedTickets) {
            tickets = parseInt(savedTickets);
            updateUI();
        }
    }
}

// Обновление интерфейса
function updateUI() {
    ticketCount.textContent = tickets;
    btnSpin.style.cursor = tickets > 0 && !spinning ? 'pointer' : 'default';
    btnSpin.src = spinning ? "IMG_2667.PNG" : tickets > 0 ? "IMG_2665.PNG" : "IMG_2666.PNG";
}

// Вращение колеса
async function spinWheel() {
    if (spinning || tickets <= 0) return;

    spinning = true;
    tickets--;
    updateUI();

    try {
        // Сохраняем новое количество билетов на сервере
        await saveTickets();
    } catch (err) {
        console.error("Ошибка сохранения билетов:", err);
    }

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
            tickets++;
            showTelegramAlert("🎉 Вы получили 1 билет!");
        } else {
            showTelegramAlert("😔 В следующий раз повезёт");
        }
        updateUI();
        await saveTickets();
    }, 3050);
}

// Сохранение билетов на сервере
async function saveTickets() {
    try {
        const response = await fetch(`${API_BASE}/api/update-tickets`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: parseInt(userId),
                new_tickets: tickets
            })
        });
        
        // Сохраняем локально на случай проблем с сервером
        localStorage.setItem(`${TICKETS_KEY}_${userId}`, tickets.toString());
    } catch (err) {
        console.error("Ошибка сохранения билетов:", err);
        throw err;
    }
}

// Обработка реферальной ссылки
async function handleReferral(inviterId) {
    const refKey = `ref_${userId}_${inviterId}`;
    if (localStorage.getItem(refKey)) return;

    try {
        const response = await fetch(`${API_BASE}/api/register-ref`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                inviter: parseInt(inviterId),
                user: parseInt(userId),
                user_nick: userNick
            })
        });

        const data = await response.json();
        if (data.status === 'ok') {
            localStorage.setItem(refKey, "1");
            await loadTickets(); // Обновляем билеты после реферальной регистрации
            showTelegramAlert("🎉 Вам начислен бонус за приглашение!");
        }
    } catch (err) {
        console.error("Ошибка обработки реферала:", err);
    }
}

// Вспомогательные функции
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showTelegramAlert(text) {
    if (Telegram?.WebApp?.showAlert) {
        Telegram.WebApp.showAlert(text);
    } else {
        alert(text);
    }
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initUser();
    updateUI();
    
    // Остальная инициализация (анимации, обработчики и т.д.)
    // ... ваш существующий код ...
    
    btnSpin.addEventListener('click', spinWheel);
});