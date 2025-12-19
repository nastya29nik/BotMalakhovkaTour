// Список всех картинок из папки images
const availableImages = [
    'images/apteka.jpg',
    'images/dohodniy_dom.jpg',
    'images/gimnazia.png',
    'images/hram.jpg',
    'images/konka1.jpg',
    'images/konka2.jpg',
    'images/peresechenie.jpg',
    'images/school_ovrag1.jpg',
    'images/school_ovrag2.jpg',
    'images/skazka.png',
    'images/souz.jpeg',
    'images/station1.jpg',
    'images/station2.jpg',
    'images/theater1.jpg',
    'images/theater2.jpg',
    'images/usadba_tel.jpg'
];

// Основные переменные
let currentLevel = 0;
let moves = 0;
let puzzlePieces = [];
let currentImageSrc = ''; // Здесь будем хранить путь к текущей картинке

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    
    // Обработчики кнопок уровней
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentLevel = parseInt(this.dataset.level);
            // Выбираем новую картинку перед стартом игры
            selectRandomImage(); 
        });
    });
    
    document.getElementById('back-btn').addEventListener('click', function() {
        showScreen('level-selection');
    });
    
    document.getElementById('menu-btn').addEventListener('click', function() {
        showScreen('level-selection');
    });
});

// Функция выбора случайной картинки
function selectRandomImage() {
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    currentImageSrc = availableImages[randomIndex];
    
    // Предзагрузка картинки, чтобы игра началась только когда она готова
    const tempImg = new Image();
    tempImg.src = currentImageSrc;
    
    tempImg.onload = function() {
        startGame(currentLevel);
    };
    
    tempImg.onerror = function() {
        alert("Ошибка загрузки картинки: " + currentImageSrc);
    };
}

// Функция начала игры
function startGame(level) {
    moves = 0;
    updateMovesCounter();
    showScreen('game-screen');
    
    // Очищаем контейнер
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';
    
    // Устанавливаем размер контейнера (адаптивный квадрат)
    // Отнимаем чуть больше места, чтобы влезало на мобилки
    const containerSize = Math.min(500, window.innerWidth - 30);
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
            
            // Устанавливаем размер и фон
            piece.style.width = pieceSize + 'px';
            piece.style.height = pieceSize + 'px';
            
            // ВАЖНО: Используем выбранную случайную картинку
            piece.style.backgroundImage = `url('${currentImageSrc}')`;
            
            // Настраиваем, чтобы картинка растягивалась на весь контейнер
            piece.style.backgroundSize = `${containerSize}px ${containerSize}px`;
            // Смещаем фон для каждого кусочка
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
            
            // Сохраняем правильную позицию для проверки победы
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

// Настройка перетаскивания (Mouse + Touch)
function setupDragAndDrop(piece) {
    // Функция начала перетаскивания (общая для мыши и тача)
    const startDrag = (e) => {
        // Определяем координаты (мышь или палец)
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        piece.isDragging = true;
        
        const rect = piece.getBoundingClientRect();
        piece.offsetX = clientX - rect.left;
        piece.offsetY = clientY - rect.top;
        
        piece.style.zIndex = '1000';
        piece.classList.add('dragging'); // Добавляем класс для визуала (тень и тд)
        
        // Предотвращаем скролл на мобильных
        if (e.cancelable) e.preventDefault();
    };

    // Функция движения
    const doDrag = (e) => {
        if (!piece.isDragging) return;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        
        let x = clientX - containerRect.left - piece.offsetX;
        let y = clientY - containerRect.top - piece.offsetY;
        
        // Ограничиваем движение границами контейнера
        x = Math.max(-piece.offsetWidth/2, Math.min(container.offsetWidth - piece.offsetWidth/2, x));
        y = Math.max(-piece.offsetHeight/2, Math.min(container.offsetHeight - piece.offsetHeight/2, y));
        
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
        
        if (e.cancelable) e.preventDefault();
    };

    // Функция конца перетаскивания
    const endDrag = () => {
        if (!piece.isDragging) return;
        
        piece.isDragging = false;
        piece.style.zIndex = '10';
        piece.classList.remove('dragging');
        
        moves++;
        updateMovesCounter();
        
        snapToPositionIfClose(piece);
        checkPuzzleCompletion();
    };

    // Слушатели событий
    piece.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    piece.addEventListener('touchstart', startDrag, {passive: false});
    document.addEventListener('touchmove', doDrag, {passive: false});
    document.addEventListener('touchend', endDrag);
}

// "Примагничивание" кусочка
function snapToPositionIfClose(piece) {
    const currentLeft = parseFloat(piece.style.left);
    const currentTop = parseFloat(piece.style.top);
    
    const tolerance = 20; // Радиус прилипания
    
    if (Math.abs(currentLeft - piece.correctX) < tolerance && 
        Math.abs(currentTop - piece.correctY) < tolerance) {
        
        // Ставим точно на место
        piece.style.left = piece.correctX + 'px';
        piece.style.top = piece.correctY + 'px';
        
        // Визуальный эффект (подсветка, что встало на место)
        piece.style.zIndex = '1'; 
        piece.classList.add('snapped');
        
        // Можно проиграть звук щелчка здесь
    }
}

// Перемешивание
function shufflePieces(containerSize) {
    puzzlePieces.forEach(piece => {
        // Случайная позиция внутри контейнера
        const randomX = Math.random() * (containerSize - piece.offsetWidth);
        const randomY = Math.random() * (containerSize - piece.offsetHeight);
        
        piece.style.left = randomX + 'px';
        piece.style.top = randomY + 'px';
    });
}

// Проверка победы
function checkPuzzleCompletion() {
    // Погрешность (должна быть маленькой, так как есть примагничивание)
    const tolerance = 5; 
    let completed = true;
    
    for (const piece of puzzlePieces) {
        const currentLeft = parseFloat(piece.style.left);
        const currentTop = parseFloat(piece.style.top);
        
        if (Math.abs(currentLeft - piece.correctX) > tolerance || 
            Math.abs(currentTop - piece.correctY) > tolerance) {
            completed = false;
            break;
        }
    }
    
    if (completed) {
        setTimeout(() => {
            document.getElementById('total-moves').textContent = moves;
            showScreen('success-screen');
        }, 300); // Небольшая задержка перед победой
    }
}

function updateMovesCounter() {
    document.getElementById('moves-counter').textContent = `Ходы: ${moves}`;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}