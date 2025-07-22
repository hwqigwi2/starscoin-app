        document.addEventListener('DOMContentLoaded', function() {
            // Элементы
            const wheel = document.getElementById('wheel');
            const spinButton = document.getElementById('spin-button');
            const ticketsCount = document.getElementById('tickets-count');
            const resultMessage = document.getElementById('result-message');
            
            // Переменные состояния
            let tickets = 3;
            let isSpinning = false;
            
            // Обновление отображения билетов
            function updateTicketsDisplay() {
                ticketsCount.textContent = tickets;
                
                if (tickets <= 0) {
                    spinButton.classList.add('disabled');
                } else {
                    spinButton.classList.remove('disabled');
                }
            }
            
            // Функция вращения колеса
            function spinWheel() {
                if (isSpinning || tickets <= 0) return;
                
                isSpinning = true;
                tickets--;
                updateTicketsDisplay();
                
                spinButton.classList.add('spinning');
                
                // Генерируем случайный угол (от 5 до 10 полных оборотов + случайный сектор)
                const sectors = 8; // Количество секторов на колесе
                const fullRotations = 5 + Math.floor(Math.random() * 6); // 5-10 полных оборотов
                const sectorAngle = 360 / sectors;
                const winningSector = Math.floor(Math.random() * sectors);
                const finalAngle = fullRotations * 360 + (winningSector * sectorAngle) + (sectorAngle / 2);
                
                // Вращаем колесо
                wheel.style.transform = `rotate(${-finalAngle}deg)`;
                
                // Показываем результат через 3 секунды
                setTimeout(() => {
                    isSpinning = false;
                    spinButton.classList.remove('spinning');
                    
                    // Показываем сообщение (всегда "не повезло" по вашему ТЗ)
                    resultMessage.style.display = 'block';
                    
                    // Скрываем сообщение через 2 секунды
                    setTimeout(() => {
                        resultMessage.style.display = 'none';
                    }, 2000);
                }, 3000);
            }
            
            // Обработчик клика на кнопку вращения
            spinButton.addEventListener('click', spinWheel);
            
            // Запрет масштабирования при двойном тапе
            document.addEventListener('dblclick', function(e) {
                e.preventDefault();
            });
            
            // Инициализация
            updateTicketsDisplay();
        });