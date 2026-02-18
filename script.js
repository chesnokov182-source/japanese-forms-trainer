// Загружаем глаголы из JSON-файла
let verbs = [];
let currentVerb = null;
let score = 0;

// Элементы DOM
const verbDisplay = document.getElementById('verbDisplay');
const answerInput = document.getElementById('answerInput');
const checkBtn = document.getElementById('checkBtn');
const feedback = document.getElementById('feedback');
const scoreSpan = document.getElementById('score');

// Загрузка данных
async function loadVerbs() {
    try {
        const response = await fetch('verbs.json');
        verbs = await response.json();
        pickRandomVerb(); // Выбираем первый глагол после загрузки
    } catch (error) {
        console.error('Ошибка загрузки глаголов:', error);
        verbDisplay.textContent = 'Ошибка загрузки данных';
    }
}

// Выбор случайного глагола
function pickRandomVerb() {
    if (verbs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * verbs.length);
    currentVerb = verbs[randomIndex];
    verbDisplay.textContent = currentVerb.dictionary;
    answerInput.value = '';
    feedback.textContent = '';
    // Убираем фокус с поля для удобства (чтобы сразу начать печатать)
    answerInput.focus();
}

// Проверка ответа
function checkAnswer() {
    if (!currentVerb) return;

    const userAnswer = answerInput.value.trim();
    if (userAnswer === '') {
        feedback.textContent = 'Введите ответ';
        feedback.style.color = 'orange';
        return;
    }

    // Подготавливаем варианты правильных ответов
    const correctVariants = [
        currentVerb.teForm,          // кандзи+хирагана
        currentVerb.teHiragana,       // хирагана
        currentVerb.teRomaji.toLowerCase() // ромадзи в нижнем регистре
    ];

    // Приводим ввод пользователя к нижнему регистру для сравнения с ромадзи
    const userLower = userAnswer.toLowerCase();

    // Проверяем, совпадает ли с одним из вариантов
    const isCorrect = correctVariants.some(variant => 
        variant === userAnswer || variant === userLower
    );

    if (isCorrect) {
        // Правильно: увеличиваем счёт и переходим к следующему глаголу
        score++;
        scoreSpan.textContent = score;
        feedback.textContent = '✅ Правильно!';
        feedback.style.color = 'green';
        
        // Ждём немного и показываем следующий вопрос
        setTimeout(() => {
            pickRandomVerb();
        }, 500);
    } else {
        // Неправильно
        feedback.textContent = `❌ Неправильно. Попробуйте ещё раз.`;
        feedback.style.color = 'red';
        // Оставляем текущий глагол, не переходим
        answerInput.focus();
    }
}

// События
checkBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// Запуск загрузки данных
loadVerbs();
