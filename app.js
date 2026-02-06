const $ = (id) => document.getElementById(id);

const screenStart = $("screenStart");
const screenQuiz = $("screenQuiz");
const screenResult = $("screenResult");

const studentName = $("studentName");
const studentGrade = $("studentGrade");
const studentClass = $("studentClass");

const qCount = $("qCount");
const qIndex = $("qIndex");
const qTotal = $("qTotal");
const qText = $("qText");
const choicesBox = $("choices");

const btnStart = $("btnStart");
const btnExit = $("btnExit");
const btnPrev = $("btnPrev");
const btnNext = $("btnNext");

const scoreBig = $("scoreBig");
const percentBig = $("percentBig");
const btnRetry = $("btnRetry");
const btnCert = $("btnCert");
const reviewBox = $("review");

const certCanvas = $("certCanvas");
const timerEl = $("timer");
const durationEl = $("duration");

const QUIZ_MINUTES = 10;
const QUESTIONS = (window.QUESTIONS || []).slice(0);

qCount.textContent = toArabicDigits(String(QUESTIONS.length));
qTotal.textContent = toArabicDigits(String(QUESTIONS.length));
durationEl.textContent = toArabicDigits(String(QUIZ_MINUTES));

const schoolLogo = new Image();
schoolLogo.src = "school-logo.png";

let idx = 0;
let answers = new Array(QUESTIONS.length).fill(null);
let remainingSeconds = QUIZ_MINUTES * 60;
let timer = null;

function show(screen){
  screenStart.classList.add("hidden");
  screenQuiz.classList.add("hidden");
  screenResult.classList.add("hidden");
  screen.classList.remove("hidden");
}

function toArabicDigits(s){
  const map = {"0":"٠","1":"١","2":"٢","3":"٣","4":"٤","5":"٥","6":"٦","7":"٧","8":"٨","9":"٩"};
  return String(s).replace(/[0-9]/g, d => map[d]);
}

function formatTime(sec){
  const m = Math.floor(sec/60);
  const s = sec % 60;
  return `${toArabicDigits(String(m))}:${toArabicDigits(String(s).padStart(2,"0"))}`;
}

function startTimer(){
  timerEl.textContent = formatTime(remainingSeconds);
  timer = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0){
      stopTimer();
      remainingSeconds = 0;
      timerEl.textContent = formatTime(0);
      finishQuiz();
      return;
    }
    timerEl.textContent = formatTime(remainingSeconds);
  }, 1000);
}

function stopTimer(){
  if (timer){ clearInterval(timer); timer = null; }
}

function renderQuestion(){
  const q = QUESTIONS[idx];
  qIndex.textContent = toArabicDigits(String(idx+1));
  qText.textContent = q.q;

  choicesBox.innerHTML = "";
  q.c.forEach((txt, i) => {
    const wrap = document.createElement("div");
    wrap.className = "choice" + (answers[idx] === i ? " selected" : "");
    wrap.innerHTML = `
      <input type="radio" name="choice" ${answers[idx]===i ? "checked":""} />
      <div class="txt">${txt}</div>
    `;

    // ✅ بدون أصوات
    wrap.addEventListener("click", () => {
      answers[idx] = i;
      renderQuestion();
    });

    choicesBox.appendChild(wrap);
  });

  btnPrev.disabled = idx === 0;
  btnNext.textContent = (idx === QUESTIONS.length-1) ? "إنهاء" : "التالي";
}

function validateStart(){
  return studentName.value.trim().length >= 2 && studentGrade.value.trim().length >= 1;
}

btnStart.addEventListener("click", () => {
  if (!validateStart()){
    alert("اكتب اسم الطالب والصف عشان يبدأ الاختبار.");
    return;
  }
  idx = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  remainingSeconds = QUIZ_MINUTES * 60;
  show(screenQuiz);
  renderQuestion();
  startTimer();
});

btnExit.addEventListener("click", () => {
  const ok = confirm("تبغى تطلع؟ راح ينتهي الاختبار.");
  if (ok){
    stopTimer();
    show(screenStart);
  }
});

btnPrev.addEventListener("click", () => {
  if (idx > 0){ idx--; renderQuestion(); }
});

btnNext.addEventListener("click", () => {
  if (idx === QUESTIONS.length-1) finishQuiz();
  else { idx++; renderQuestion(); }
});

btnRetry.addEventListener("click", () => show(screenStart));

btnCert.addEventListener("click", () => {
  downloadCertificate().catch(() => alert("تعذر حفظ الشهادة. جرّب مرة ثانية."));
});

function finishQuiz(){
  stopTimer();

  let correct = 0;
  QUESTIONS.forEach((q, i) => { if (answers[i] === q.correct) correct++; });

  const total = QUESTIONS.length;
  const percent = Math.round((correct/total)*100);

  scoreBig.textContent = `${toArabicDigits(String(correct))} / ${toArabicDigits(String(total))}`;
  percentBig.textContent = `${toArabicDigits(String(percent))}٪`;

  renderReview();
  show(screenResult);
}

function renderReview(){
  reviewBox.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const userAns = answers[i];
    const isOk = userAns === q.correct;

    const div = document.createElement("div");
    div.className = "revItem";
    div.innerHTML = `
      <div class="revQ">س${toArabicDigits(String(i+1))}: ${q.q}</div>
      <div>إجابتك: <span class="${isOk ? "ok":"bad"}">${userAns===null ? "—" : q.c[userAns]}</span></div>
      <div>الصحيح: <span class="ok">${q.c[q.correct]}</span></div>
    `;
    reviewBox.appendChild(div);
  });
}

async function downloadCertificate(){
  let correct = 0;
  QUESTIONS.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
  const total = QUESTIONS.length;
  const percent = Math.round((correct/total)*100);

  drawCertificate({
    name: studentName.value.trim(),
    grade: studentGrade.value.trim(),
    className: studentClass.value.trim() || "—",
    score: `${correct} / ${total}`,
    percent: `${percent}%`,
  });

  const blob = await new Promise((resolve) => certCanvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("blob failed");

  const file = new File([blob], "certificate.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "الشهادة", text: "شهادة إنجاز" });
      return;
    } catch (e) {}
  }

  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    alert("تم منع فتح نافذة جديدة. فعّل السماح بالنوافذ المنبثقة ثم جرّب.");
  }
}

function drawCertificate({name, grade, className, score, percent}){
  const ctx = certCanvas.getContext("2d");

  ctx.clearRect(0,0,certCanvas.width,certCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0,0,certCanvas.width,certCanvas.height);

  ctx.lineWidth = 18;
  ctx.strokeStyle = "#111";
  ctx.strokeRect(50,50,certCanvas.width-100,certCanvas.height-100);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#d6d7e2";
  ctx.strokeRect(90,90,certCanvas.width-180,certCanvas.height-180);

  if (schoolLogo.complete) {
    ctx.drawImage(schoolLogo, 120, 120, 140, 140);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#111";
  ctx.font = "bold 74px Arial";
  ctx.fillText("شهادة إنجاز", certCanvas.width/2, 210);

  ctx.font = "34px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("تشهد مبادرة التدريب بأن الطالب/ـة", certCanvas.width/2, 300);

  ctx.font = "bold 64px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText(name || "—", certCanvas.width/2, 410);

  ctx.font = "36px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(`الصف: ${grade || "—"}  —  الشعبة: ${className || "—"}`, certCanvas.width/2, 520);
  ctx.fillText(`الدرجة: ${score}  —  النسبة: ${percent.replace("%","٪")}`, certCanvas.width/2, 590);

  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#111";
  ctx.fillText("ملاحظات:", certCanvas.width/2, 690);

  ctx.font = "28px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("استمر يا بطل ⭐ — تدريباتك تصنع الفرق 💪", certCanvas.width/2, 740);
  ctx.fillText("أحسنت… واصل التميز 👏", certCanvas.width/2, 785);

  ctx.textAlign = "right";
  ctx.font = "28px Arial";
  ctx.fillStyle = "#555";
  ctx.fillText("تنفيذ: موسى الصبحي", certCanvas.width-140, certCanvas.height-250);
  ctx.fillText("مدرسة علي بن أبي طالب الابتدائية", certCanvas.width-140, certCanvas.height-210);
  ctx.fillText("الإدارة العامة بمنطقة نجران", certCanvas.width-140, certCanvas.height-170);
  ctx.fillText("مدير المدرسة: نواف آل جافلة", certCanvas.width-140, certCanvas.height-130);

  ctx.textAlign = "left";
  ctx.fillText(new Date().toLocaleDateString("ar-SA"), 140, certCanvas.height-130);
}
