// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    initializeCounters();
    setupFormHandlers();
    
    // Обновление времени каждую секунду
    setInterval(updateTime, 1000);
    
    // Симуляция изменения данных
    setInterval(updateStats, 5000);
});

// Обновление текущего времени
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU');
    document.getElementById('currentTime').textContent = timeString;
}

// Инициализация счетчиков
function initializeCounters() {
    const visitorCount = Math.floor(Math.random() * 100) + 1;
    document.getElementById('visitorCount').textContent = visitorCount;
    
    // Анимация появления карточек
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
}

// Обновление статистики
function updateStats() {
    const visitorElement = document.getElementById('visitorCount');
    const currentCount = parseInt(visitorElement.textContent);
    const change = Math.floor(Math.random() * 5) - 2; // -2 до +2
    const newCount = Math.max(1, currentCount + change);
    
    animateNumber(visitorElement, currentCount, newCount);
}

// Анимация изменения числа
function animateNumber(element, from, to) {
    const duration = 1000;
    const steps = 20;
    const stepValue = (to - from) / steps;
    let current = from;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += stepValue;
        element.textContent = Math.round(current);
        
        if (step >= steps) {
            clearInterval(timer);
            element.textContent = to;
        }
    }, duration / steps);
}

// Обработчики форм
function setupFormHandlers() {
    const form = document.getElementById('testForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Показываем уведомление об успешной отправке
        showNotification('Форма успешно отправлена!', 'success');
        
        // Очищаем форму
        form.reset();
        
        // Выводим данные в консоль (для демонстрации)
        console.log('Отправленные данные:', data);
    });
}

// Функции для кнопок функций
function showDashboard() {
    showNotification('Открытие дашборда...', 'info');
    
    // Создаем модальное окно с дашбордом
    const modal = createModal('Дашборд', `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; text-align: center;">
                <h3 style="color: #27ae60;">Пользователи</h3>
                <p style="font-size: 2rem; font-weight: bold; color: #27ae60;">${Math.floor(Math.random() * 1000)}</p>
            </div>
            <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; text-align: center;">
                <h3 style="color: #3498db;">Просмотры</h3>
                <p style="font-size: 2rem; font-weight: bold; color: #3498db;">${Math.floor(Math.random() * 5000)}</p>
            </div>
            <div style="background: #fdf2e8; padding: 20px; border-radius: 10px; text-align: center;">
                <h3 style="color: #f39c12;">Заказы</h3>
                <p style="font-size: 2rem; font-weight: bold; color: #f39c12;">${Math.floor(Math.random() * 100)}</p>
            </div>
        </div>
        <canvas id="chartCanvas" width="400" height="200" style="border: 1px solid #ddd; border-radius: 5px;"></canvas>
    `);
    
    // Простой график
    setTimeout(() => {
        drawSimpleChart();
    }, 100);
}

function showSettings() {
    showNotification('Открытие настроек...', 'info');
    
    const modal = createModal('Настройки', `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Тема:</label>
                <select style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <option>Светлая</option>
                    <option>Темная</option>
                    <option>Автоматическая</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Язык:</label>
                <select style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <option>Русский</option>
                    <option>English</option>
                    <option>Español</option>
                </select>
            </div>
            <div>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked> Уведомления
                </label>
            </div>
            <div>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox"> Автосохранение
                </label>
            </div>
            <button onclick="saveSettings()" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Сохранить настройки
            </button>
        </div>
    `);
}

function showNotes() {
    showNotification('Открытие редактора заметок...', 'info');
    
    const modal = createModal('Заметки', `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <input type="text" placeholder="Заголовок заметки" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <textarea placeholder="Содержание заметки..." rows="10" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;"></textarea>
            <div style="display: flex; gap: 10px;">
                <button onclick="saveNote()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Сохранить
                </button>
                <button onclick="clearNote()" style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Очистить
                </button>
            </div>
        </div>
    `);
}

// Создание модального окна
function createModal(title, content) {
    // Удаляем существующее модальное окно
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #2c3e50;">${title}</h2>
                <button onclick="closeModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #95a5a6;
                ">×</button>
            </div>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие по клику на фон
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Закрытие модального окна
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Дополнительные стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Простой график
function drawSimpleChart() {
    const canvas = document.getElementById('chartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Очистка canvas
    ctx.clearRect(0, 0, width, height);
    
    // Данные для графика
    const data = Array.from({length: 12}, () => Math.random() * 100);
    const maxValue = Math.max(...data);
    
    // Настройки
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Фон
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Линии сетки
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // График
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Точки
    ctx.fillStyle = '#3498db';
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Функции для сохранения
function saveSettings() {
    showNotification('Настройки сохранены!', 'success');
    closeModal();
}

function saveNote() {
    showNotification('Заметка сохранена!', 'success');
}

function clearNote() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        const textarea = modal.querySelector('textarea');
        const input = modal.querySelector('input');
        if (textarea) textarea.value = '';
        if (input) input.value = '';
    }
    showNotification('Заметка очищена', 'info');
}