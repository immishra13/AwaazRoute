// AwaazRoute — web app wiring.
// Voice in  -> Web Speech API (SpeechRecognition, hi-IN / en-IN)
// Classify  -> TF-IDF + Logistic Regression (model.json, trained by train.js)
// Voice out -> Web Speech API (SpeechSynthesis)

const $ = (id) => document.getElementById(id);
const inputEl = $("complaint");
const statusEl = $("status");
const resultEl = $("result");
const micBtn = $("micBtn");
const langSelect = $("lang");

let modelReady = false;
let lastSpokenText = "";

async function init() {
  try {
    await AwaazClassifier.load();
    modelReady = true;
    statusEl.textContent = "Model ready — 144 sample complaints se trained hai.";
  } catch (e) {
    statusEl.textContent =
      "Model load nahi hua. Live link se kholo, ya local server chalao: python3 -m http.server";
  }
}

function classify() {
  const text = inputEl.value.trim();
  if (!text) {
    statusEl.textContent = "Pehle kuch bolo ya likho — phir classify karenge.";
    return;
  }
  if (!modelReady) {
    statusEl.textContent = "Model abhi load ho raha hai, ek second ruko…";
    return;
  }
  const r = AwaazClassifier.predict(text);
  const cat = CATEGORIES.find((c) => c.id === r.category);
  const pct = Math.round(r.confidence * 100);
  const priority = priorityFor(text);
  const needsReview = r.confidence < HUMAN_REVIEW_THRESHOLD;

  $("resCategory").textContent = cat.label;
  $("resConfidence").textContent = `Confidence: ${pct}%`;
  $("resBar").style.transform = "scaleX(" + pct / 100 + ")";
  $("resTeam").textContent = cat.team;
  $("resPriority").textContent = priority;
  $("resEvidence").textContent =
    r.evidence.length ? r.evidence.join(", ") : "—";
  $("resReview").hidden = !needsReview;
  resultEl.hidden = false;

  const lang = langSelect.value;
  lastSpokenText =
    lang === "hi-IN"
      ? `Aapki shikayat ${cat.label} se judi hai. Ise ${cat.team} ko bheja jayega. Confidence ${pct} percent hai.`
      : `Your complaint is about ${cat.label}. It will go to the ${cat.team}. Confidence is ${pct} percent.`;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

$("classifyBtn").addEventListener("click", classify);
inputEl.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") classify();
});

// Sample chips — one tap, full flow.
document.querySelectorAll("[data-sample]").forEach((btn) => {
  btn.addEventListener("click", () => {
    inputEl.value = btn.getAttribute("data-sample");
    classify();
  });
});

// ---- Speech input ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (!SR) {
  micBtn.disabled = true;
  $("micLabel").textContent = "Mic is browser me supported nahi — type karke try karo";
  $("micHint").textContent =
    "Voice input Chrome / Edge me chalta hai. Firefox/Safari me type karo.";
} else {
  micBtn.addEventListener("click", () => {
    if (recognition) return;
    recognition = new SR();
    recognition.lang = langSelect.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    micBtn.classList.add("listening");
    micBtn.setAttribute("aria-pressed", "true");
    $("micLabel").textContent = "Sun raha hoon… bolo";
    statusEl.textContent = "Sun raha hoon — apni shikayat bolo.";
    recognition.onresult = (e) => {
      inputEl.value = e.results[0][0].transcript;
      classify();
    };
    recognition.onerror = (e) => {
      statusEl.textContent =
        e.error === "not-allowed"
          ? "Mic ki permission nahi mili — browser settings me mic allow karo, ya type kar do."
          : "Mic se sun nahi paya (" + e.error + ") — type karke try karo.";
    };
    recognition.onend = () => {
      recognition = null;
      micBtn.classList.remove("listening");
      micBtn.setAttribute("aria-pressed", "false");
      $("micLabel").textContent = "Bolo — mic se shikayat bolo";
    };
    recognition.start();
  });
}

// ---- Speech output ----
$("speakBtn").addEventListener("click", () => {
  if (!lastSpokenText) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(lastSpokenText);
  u.lang = langSelect.value;
  window.speechSynthesis.speak(u);
});

init();
