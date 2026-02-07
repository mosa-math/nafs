let currentIdx = 0;
let totalScore = 0;
let timeLeft = 15;
let timerInterval;

const qText = document.getElementById('question-text');
const optionsBox = document.getElementById('options-container');
const progressBox = document.getElementById('progress');
const timeText = document.getElementById('time');

function initQuiz() {
    showQuestion();
}

function startTimer() {
    timeLeft = 15;
    timeText.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeText.innerText = timeLeft;
        if (timeLeft <= 0) {
            nextQuestion(0); // انتقال تلقائي عند انتهاء الوقت
        }
    }, 1000);
}

function showQuestion() {
    startTimer();
    const q = questions[currentIdx];
    qText.innerText = q.question;
    optionsBox.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.onclick = () => nextQuestion(opt.score);
        optionsBox.appendChild(btn);
    });

    const progress = ((currentIdx + 1) / questions.length) * 100;
    progressBox.style.width = `${progress}%`;
}

function nextQuestion(score) {
    totalScore += score;
    currentIdx++;
    
    if (currentIdx < questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('timer-display').classList.add('hidden');
    const resBox = document.getElementById('result-container');
    const resContent = document.getElementById('result-content');
    resBox.classList.remove('hidden');

    const result = personalityResults.find(r => totalScore >= r.min && totalScore <= r.max);
    
    resContent.innerHTML = `
        <h3>${result.title}</h3>
        <p>${result.desc}</p>
        <hr>
        <p>مجموع نقاطك: <strong>${totalScore}</strong></p>
    `;
}

initQuiz();
