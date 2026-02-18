// Все глаголы
let allVerbs = [];

// Состояния для каждого режима
const modes = ['te', 'ta']; // будем расширять
let states = {}; // { te: { queue, score }, ta: { queue, score } }

// Текущий режим
let currentMode = 'te';

// DOM элементы
const verbDisplay = document.getElementById('verbDisplay');
const answerInput = document.getElementById('answerInput');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const modeSelect = document.getElementById('modeSelect');
const feedback = document.getElementById('feedback');
const scoreSpan = document.getElementById('score');
const progressBar = document.getElementById('progressBar');

// Загрузка данных
async function loadVerbs() {
    try {
        const response = await fetch('verbs.json');
        allVerbs = await response.json();
        // Инициализация состояний для каждого режима
        modes.forEach(mode => {
            states[mode] = {
                queue: shuffleArray(allVerbs),
                score: 0
            };
        });
        // Устанавливаем текущий режим из select (по умолчанию te)
        currentMode = modeSelect.value;
        applyCurrentState();
    } catch (error) {
        console.error('Ошибка загрузки глаголов:', error);
        verbDisplay.textContent = 'Ошибка загрузки';
    }
}

// Перемешивание
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Применить состояние текущего режима к интерфейсу
function applyCurrentState() {
    const state = states[currentMode];
    if (!state) return;
    // Обновить счёт
    scoreSpan.textContent = state.score;
    // Обновить очередь, если пуста - пересоздать
    if (state.queue.length === 0) {
        state.queue = shuffleArray(allVerbs);
    }
    // Показать первый глагол из очереди
    currentVerb = state.queue[0];
    verbDisplay.textContent = currentVerb.dictionary;
    answerInput.value = '';
    feedback.textContent = '';
    updateProgress();
    answerInput.focus();
}

// Обновление прогресс-бара
function updateProgress() {
    const state = states[currentMode];
    if (!state || !allVerbs.length) return;
    const total = allVerbs.length;
    const remaining = state.queue.length;
    const completed = total - remaining;
    const percent = (completed / total) * 100;
    progressBar.style.width = percent + '%';
}

// Проверка ответа
function checkAnswer() {
    const state = states[currentMode];
    if (!state || !currentVerb) return;

    const userAnswer = answerInput.value.trim();
    if (userAnswer === '') {
        feedback.textContent = '🔔 Введите ответ';
        feedback.style.color = 'orange';
        return;
    }

    // Получаем правильные варианты в зависимости от режима
    let correctVariants = [];
    if (currentMode === 'te') {
        correctVariants = [
            currentVerb.teForm,
            currentVerb.teHiragana,
            currentVerb.teRomaji.toLowerCase()
        ];
    } else if (currentMode === 'ta') {
        correctVariants = [
            currentVerb.taForm,
            currentVerb.taHiragana,
            currentVerb.taRomaji.toLowerCase()
        ];
    }
    // В будущем: else if (currentMode === 'nai') ...

    const userLower = userAnswer.toLowerCase();
    const isCorrect = correctVariants.some(variant => 
        variant === userAnswer || variant === userLower
    );

    if (isCorrect) {
        // Увеличиваем счёт в текущем состоянии
        state.score++;
        scoreSpan.textContent = state.score;

        // Удаляем первый элемент из очереди (текущий глагол)
        state.queue.shift();

        feedback.textContent = '✅ Правильно!';
        feedback.style.color = 'green';

        // Если очередь опустела, создаём новую
        if (state.queue.length === 0) {
            state.queue = shuffleArray(allVerbs);
        }

        // Переходим к следующему
        setTimeout(() => {
            currentVerb = state.queue[0];
            verbDisplay.textContent = currentVerb.dictionary;
            answerInput.value = '';
            feedback.textContent = '';
            updateProgress();
            answerInput.focus();
        }, 500);
    } else {
        feedback.textContent = '❌ Неправильно. Попробуйте ещё раз.';
        feedback.style.color = 'red';
        answerInput.focus();
    }
}

// Сброс прогресса для текущего режима
function resetProgress() {
    const state = states[currentMode];
    if (!state) return;
    if (confirm('Начать заново в этом режиме? Текущий счёт обнулится.')) {
        state.score = 0;
        state.queue = shuffleArray(allVerbs);
        scoreSpan.textContent = state.score;
        applyCurrentState(); // обновит отображение
        feedback.textContent = '🔄 Прогресс сброшен';
        feedback.style.color = '#3498db';
    }
}

// Обработчик смены режима
function onModeChange() {
    currentMode = modeSelect.value;
    // Если для этого режима ещё нет состояния (например, добавили новый режим), создаём
    if (!states[currentMode]) {
        states[currentMode] = {
            queue: shuffleArray(allVerbs),
            score: 0
        };
    }
    applyCurrentState();
}

// События
checkBtn.addEventListener('click', checkAnswer);
resetBtn.addEventListener('click', resetProgress);
modeSelect.addEventListener('change', onModeChange);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// Запуск
loadVerbs();
