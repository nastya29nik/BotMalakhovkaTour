// Основные переменные
let currentLevel = 0;
let moves = 0;
let puzzlePieces = [];
let originalImage = new Image();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка изображения
    originalImage.src = 'Apteka.jpg'; // Замените на путь к вашему изображению
    originalImage.onload = function() {
        console.log('Изображение загружено');
    };
    
    // Обработчики кнопок
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentLevel = parseInt(this.dataset.level);
            startGame(currentLevel);
        });
    });
    
    document.getElementById('back-btn').addEventListener('click', function() {
        showScreen('level-selection');
    });
    
    document.getElementById('menu-btn').addEventListener('click', function() {
        showScreen('level-selection');
    });
});

// Функция начала игры
function startGame(level) {
    moves = 0;
    updateMovesCounter();
    showScreen('game-screen');
    
    // Очищаем контейнер
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';
    
    // Устанавливаем размер контейнера в зависимости от уровня
    const containerSize = Math.min(500, window.innerWidth - 40);
    container.style.width = containerSize + 'px';
    container.style.height = containerSize + 'px';
    
    // Создаем части пазла
    createPuzzlePieces(level, containerSize);
}

// Создание частей пазла
function createPuzzlePieces(level, containerSize) {
    const pieceSize = containerSize / level;
    const container = document.getElementById('puzzle-container');
    puzzlePieces = [];
    
    // Создаем части в правильном порядке
    for (let row = 0; row < level; row++) {
        for (let col = 0; col < level; col++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.row = row;
            piece.dataset.col = col;
            
            // Устанавливаем размер и позицию фона
            piece.style.width = pieceSize + 'px';
            piece.style.height = pieceSize + 'px';
            piece.style.backgroundImage = `url(${originalImage.src})`;
            piece.style.backgroundSize = `${containerSize}px ${containerSize}px`;
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
            
            // Сохраняем правильную позицию
            piece.correctX = col * pieceSize;
            piece.correctY = row * pieceSize;
            
            // Устанавливаем обработчики перетаскивания
            setupDragAndDrop(piece);
            
            container.appendChild(piece);
            puzzlePieces.push(piece);
        }
    }
    
    // Перемешиваем части
    shufflePieces(containerSize);
}

// Настройка перетаскивания
function setupDragAndDrop(piece) {
    let isDragging = false;
    let offsetX, offsetY;
    
    piece.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - piece.getBoundingClientRect().left;
        offsetY = e.clientY - piece.getBoundingClientRect().top;
        piece.style.zIndex = '1000';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;
        
        // Ограничиваем движение в пределах контейнера
        x = Math.max(0, Math.min(container.offsetWidth - piece.offsetWidth, x));
        y = Math.max(0, Math.min(container.offsetHeight - piece.offsetHeight, y));
        
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        piece.style.zIndex = '1';
        moves++;
        updateMovesCounter();
        
        // Проверяем, находится ли кусок близко к правильной позиции
        snapToPositionIfClose(piece);
        checkPuzzleCompletion();
    });
    
    // Добавляем обработчики для сенсорных устройств
    piece.addEventListener('touchstart', function(e) {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - piece.getBoundingClientRect().left;
        offsetY = touch.clientY - piece.getBoundingClientRect().top;
        piece.style.zIndex = '1000';
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        const touch = e.touches[0];
        
        let x = touch.clientX - containerRect.left - offsetX;
        let y = touch.clientY - containerRect.top - offsetY;
        
        // Ограничиваем движение в пределах контейнера
        x = Math.max(0, Math.min(container.offsetWidth - piece.offsetWidth, x));
        y = Math.max(0, Math.min(container.offsetHeight - piece.offsetHeight, y));
        
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
        
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        if (!isDragging) return;
        
        isDragging = false;
        piece.style.zIndex = '1';
        moves++;
        updateMovesCounter();
        
        // Проверяем, находится ли кусок близко к правильной позиции
        snapToPositionIfClose(piece);
        checkPuzzleCompletion();
    });
}

// Функция для "притягивания" куска к правильной позиции если он близко
function snapToPositionIfClose(piece) {
    const container = document.getElementById('puzzle-container');
    const rect = piece.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const currentX = rect.left - containerRect.left;
    const currentY = rect.top - containerRect.top;
    
    // Если кусок близко к правильной позиции, "притягиваем" его
    const tolerance = 10; // Допуск в пикселях
    
    if (Math.abs(currentX - piece.correctX) < tolerance && 
        Math.abs(currentY - piece.correctY) < tolerance) {
        piece.style.left = piece.correctX + 'px';
        piece.style.top = piece.correctY + 'px';
    }
}

// Перемешивание кусочков пазла
function shufflePieces(containerSize) {
    puzzlePieces.forEach(piece => {
        const randomX = Math.random() * (containerSize - piece.offsetWidth);
        const randomY = Math.random() * (containerSize - piece.offsetHeight);
        
        piece.style.left = randomX + 'px';
        piece.style.top = randomY + 'px';
    });
}

// Проверка завершения пазла
function checkPuzzleCompletion() {
    const tolerance = 5; // Допуск в пикселях
    let completed = true;
    
    for (const piece of puzzlePieces) {
        const rect = piece.getBoundingClientRect();
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        
        const currentX = rect.left - containerRect.left;
        const currentY = rect.top - containerRect.top;
        
        if (Math.abs(currentX - piece.correctX) > tolerance || 
            Math.abs(currentY - piece.correctY) > tolerance) {
            completed = false;
            break;
        }
    }
    
    if (completed) {
        document.getElementById('total-moves').textContent = moves;
        showScreen('success-screen');
    }
}

// Обновление счетчика ходов
function updateMovesCounter() {
    document.getElementById('moves-counter').textContent = `Ходы: ${moves}`;
}

// Переключение между экранами
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}