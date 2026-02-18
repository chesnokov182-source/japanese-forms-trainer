// Массив всех глаголов (загрузится из JSON)
let allVerbs = [];
// Очередь глаголов для текущего круга (перемешанная)
let queue = [];
// Текущий глагол
let currentVerb = null;
// Счётчик правильных ответов (общий)
let score = 0;

// Элементы DOM
const verbDisplay = document.getElementById('verbDisplay');
const answerInput = document.getElementById('answerInput');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const feedback = document.getElementById('feedback');
const scoreSpan = document.getElementById('score');
const progressBar = document.getElementById('progressBar');

// Загрузка данных
async function loadVerbs() {
    try {
        const response = await fetch('verbs.json');
        allVerbs = await response.json();
        startNewRound(); // Начинаем первый круг
    } catch (error) {
        console.error('Ошибка загрузки глаголов:', error);
        verbDisplay.textContent = 'Ошибка загрузки';
    }
}

// Перемешивание массива (алгоритм Фишера-Йетса)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Начать новый круг (перемешиваем все глаголы и ставим в очередь)
function startNewRound() {
    queue = shuffleArray(allVerbs);
    nextVerb();
}

// Перейти к следующему глаголу
function nextVerb() {
    if (queue.length === 0) {
        // Очередь пуста — начинаем новый круг
        startNewRound();
        return;
    }
    // Берём первый из очереди
    currentVerb = queue[0];
    verbDisplay.textContent = currentVerb.dictionary;
    answerInput.value = '';
    feedback.textContent = '';
    updateProgress();
    answerInput.focus();
}

// Удалить текущий глагол из очереди (после правильного ответа)
function removeCurrentFromQueue() {
    if (queue.length > 0) {
        queue.shift(); // удаляем первый элемент
    }
}

// Обновление индикатора прогресса
function updateProgress() {
    if (!allVerbs.length) return;
    const total = allVerbs.length;
    const remaining = queue.length;
    const completed = total - remaining;
    const percent = (completed / total) * 100;
    progressBar.style.width = percent + '%';
}

// Проверка ответа
function checkAnswer() {
    if (!currentVerb) return;

    const userAnswer = answerInput.value.trim();
    if (userAnswer === '') {
        feedback.textContent = '🔔 Введите ответ';
        feedback.style.color = 'orange';
        return;
    }

    // Подготавливаем правильные варианты
    const correctVariants = [
        currentVerb.teForm,          // кандзи+хирагана
        currentVerb.teHiragana,       // хирагана
        currentVerb.teRomaji.toLowerCase() // ромадзи
    ];

    const userLower = userAnswer.toLowerCase();

    const isCorrect = correctVariants.some(variant => 
        variant === userAnswer || variant === userLower
    );

    if (isCorrect) {
        // Увеличиваем общий счёт
        score++;
        scoreSpan.textContent = score;

        // Удаляем пройденный глагол из очереди
        removeCurrentFromQueue();

        // Сообщение об успехе
        feedback.textContent = '✅ Правильно!';
        feedback.style.color = 'green';

        // Переходим к следующему (если очередь пуста, начнётся новый круг)
        setTimeout(() => {
            nextVerb();
        }, 500);
    } else {
        // Неправильно
        feedback.textContent = '❌ Неправильно. Попробуйте ещё раз.';
        feedback.style.color = 'red';
        answerInput.focus();
    }
}

// Сброс прогресса (начать заново)
function resetProgress() {
    if (confirm('Начать заново? Текущий счёт обнулится.')) {
        score = 0;
        scoreSpan.textContent = score;
        startNewRound(); // перемешиваем и начинаем новый круг
        feedback.textContent = '🔄 Прогресс сброшен';
        feedback.style.color = '#3498db';
    }
}

// События
checkBtn.addEventListener('click', checkAnswer);
resetBtn.addEventListener('click', resetProgress);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// Запуск загрузки
loadVerbs();
