// ===== مثال بيانات (بدّلها ببياناتك) =====
const QUESTIONS = [
  { q: "ما القاسم المشترك الأكبر للعددين 12 و 18؟", c: ["3", "6", "9", "12"], correct: 1 },
  { q: "أوجد ناتج: 362 × 25", c: ["7250", "8050", "9050", "6250"], correct: 0 },
  { q: "أوجد ناتج: 6873594 − 3761452", c: ["3112142", "3012142", "3211142", "3111242"], correct: 0 },
];

// ===== عناصر الصفحة =====
const qText = document.getElementById("qText");
const choicesBox = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const qIndexText = document.getElementById("qIndexText");
const qTotalText = document.getElementById("qTotalText");
const progressFill = document.getElementById("progressFill");
const studentNameTop = document.getElementById("studentNameTop");

// ===== حالة الاختبار =====
let idx = 0;
let selected = null;   // رقم الخيار المختار
let answers = new Array(QUESTIONS.length).fill(null);

// ضع اسم الطالب هنا أو خذه من صفحة الدخول
studentNameTop.textContent = "عبدالله";

qTotalText.textContent = `من ${QUESTIONS.length}`;

// ===== رسم السؤال =====
function render(){
  const item = QUESTIONS[idx];
  selected = answers[idx];

  qIndexText.textContent = `السؤال ${idx + 1}`;
  qText.textContent = item.q;

  // progress
  const percent = ((idx + 1) / QUESTIONS.length) * 100;
  progressFill.style.width = `${percent}%`;

  // choices
  choicesBox.innerHTML = "";
  item.c.forEach((txt, i) => {
    const row = document.createElement("div");
    row.className = "choice" + (selected === i ? " is-active" : "");
    row.setAttribute("role","button");
    row.setAttribute("tabindex","0");

    row.innerHTML = `
      <div class="choice__text">${txt}</div>
      <div class="choice__radio" aria-hidden="true"></div>
    `;

    const pick = () => {
      answers[idx] = i;
      selected = i;
      // فعّل زر التالي
      nextBtn.disabled = false;
      // حدث الستايل
      [...choicesBox.children].forEach((el, k) => {
        el.classList.toggle("is-active", k === i);
      });
    };

    row.addEventListener("click", pick);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
    });

    choicesBox.appendChild(row);
  });

  // زر التالي
  nextBtn.disabled = (answers[idx] === null);
}

nextBtn.addEventListener("click", () => {
  if (answers[idx] === null) return;

  if (idx < QUESTIONS.length - 1) {
    idx++;
    render();
  } else {
    // نهاية الاختبار (تقدر تحولها لصفحة النتيجة)
    const score = answers.reduce((s, a, i) => s + (a === QUESTIONS[i].correct ? 1 : 0), 0);
    alert(`انتهى الاختبار ✅\nدرجتك: ${score} / ${QUESTIONS.length}`);
  }
});

// تشغيل
render();
