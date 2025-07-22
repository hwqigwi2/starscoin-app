document.addEventListener('DOMContentLoaded', function() {
  // Элементы
  const wheel = document.getElementById('wheel');
  const spinBtn = document.getElementById('spin-btn');
  const ticketCount = document.getElementById('ticket-count');
  const message = document.getElementById('message');
  
  // Переменные состояния
  let tickets = 3;
  let isSpinning = false;
  
  // Обновление отображения билетов
  function updateTickets() {
    ticketCount.textContent = tickets;
    
    if (tickets <= 0) {
      spinBtn.classList.add('disabled');
    } else {
      spinBtn.classList.remove('disabled');
    }
  }
  
  // Функция вращения колеса
  function spinWheel() {
    if (isSpinning || tickets <= 0) return;
    
    isSpinning = true;
    tickets--;
    updateTickets();
    
    spinBtn.classList.add('spinning');
    
    // Генерируем случайный угол (5-10 полных оборотов + случайный сектор)
    const sectors = 8;
    const fullRotations = 5 + Math.floor(Math.random() * 6);
    const sectorAngle = 360 / sectors;
    const winningSector = Math.floor(Math.random() * sectors);
    const finalAngle = fullRotations * 360 + (winningSector * sectorAngle) + (sectorAngle / 2);
    
    // Вращаем колесо
    wheel.style.transform = `translateX(-50%) rotate(${-finalAngle}deg)`;
    
    // Показываем результат через 3 секунды
    setTimeout(() => {
      isSpinning = false;
      spinBtn.classList.remove('spinning');
      
      // Показываем сообщение
      message.classList.add('visible');
      
      // Скрываем сообщение через 2 секунды
      setTimeout(() => {
        message.classList.remove('visible');
      }, 2000);
    }, 3000);
  }
  
  // Обработчик клика на кнопку вращения
  spinBtn.addEventListener('click', spinWheel);
  
  // Запрет масштабирования при двойном тапе
  document.addEventListener('dblclick', function(e) {
    e.preventDefault();
  });
  
  // Инициализация
  updateTickets();
});