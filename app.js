const SESSION_SIZE = 15;
const REPEAT_AFTER = 4;

const imageFiles = [
  "1 gelijkbenige driehoek.jpg","2 gelijkzijdige driehoek.jpg","3. ellips.jpg","4 cirkel.jpg","5 gelijkzijdige driehoek.jpg","6 gelijkbenige driehoek.jpg","7 rechthoekige driehoek.jpg","8 gelijkbenige rechthoekige driehoek.jpg","9 gewone driehoek.jpg","10 vierkant.jpg","11 rechthoek.jpg","12 ruit.jpg","13 parallellogram.jpg","14 vlieger.jpg","15 trapezium.jpg","16 gewone vierhoek.jpg","17 vijfhoek.jpg","18 zeshoek.jpg","19 zevenhoek.jpg","20 achthoek.jpg","21 zeshoek.jpg","22 rechthoek.jpg","23 ruit.jpg","24 gelijkbenige rechthoekige driehoek.jpg","25 gelijkzijdige driehoek.jpg","26 gelijkbenige driehoek.jpg","27 gelijkbenige rechthoekige driehoek.jpg","28 rechthoekige driehoek.jpg","29 rechthoek.jpg","30 vlieger.jpg","31 gewone vierhoek.jpg","32 vierkant.jpg","33 ruit.jpg","34 trapezium.jpg","35 parallellogram.jpg","36 ruit.jpg","37 zeshoek.jpg","38 rechthoekige driehoek.jpg","39 ellips.jpg","40 vijfhoek.jpg","41 gewone vierhoek.jpg","42 gelijkzijdige driehoek.jpg","43 parallellogram.jpg","44 gelijkbenige driehoek.jpg","45 gelijkzijdige driehoek.jpg","46 rechthoekige driehoek.jpg","47 gelijkbenige driehoek.jpg","48 gelijkzijdige driehoek.jpg","49 rechthoekige driehoek.jpg","50 gelijkbenige driehoek.jpg","51 rechthoekige driehoek.jpg","52 gelijkbenige driehoek.jpg","53 gewone driehoek.jpg","54 gelijkbenige driehoek.jpg","55 rechthoekige driehoek.jpg","56 gelijkbenige driehoek.jpg","57 gelijkbenige rechthoekige driehoek.jpg","58 zevenhoek.jpg"
];

// Handmatige correctie: afbeelding 41 is inhoudelijk een gewone driehoek.
const answerOverrides = {
  "41 gewone vierhoek.jpg": "gewone driehoek"
};

const displayName = {
  "gewone driehoek": "driehoek",
  "gelijkbenige driehoek": "gelijkbenige driehoek",
  "gelijkzijdige driehoek": "gelijkzijdige driehoek",
  "rechthoekige driehoek": "rechthoekige driehoek",
  "gelijkbenige rechthoekige driehoek": "gelijkbenige rechthoekige driehoek",
  "vierkant": "vierkant",
  "rechthoek": "rechthoek",
  "ruit": "ruit",
  "parallellogram": "parallellogram",
  "trapezium": "trapezium",
  "vlieger": "vlieger",
  "gewone vierhoek": "vierhoek",
  "vijfhoek": "vijfhoek",
  "zeshoek": "zeshoek",
  "zevenhoek": "zevenhoek",
  "achthoek": "achthoek",
  "cirkel": "cirkel",
  "ellips": "ellips"
};

const aliases = {
  "gewone driehoek": ["gewone driehoek", "driehoek"],
  "gewone vierhoek": ["gewone vierhoek", "vierhoek"],
  "vijfhoek": ["vijfhoek", "gewone vijfhoek"],
  "zeshoek": ["zeshoek", "gewone zeshoek"],
  "zevenhoek": ["zevenhoek", "gewone zevenhoek"],
  "achthoek": ["achthoek", "gewone achthoek"]
};

const figures = imageFiles.map(file => {
  const raw = file.replace(/^\d+\.?\s*/, "").replace(/\.jpg$/i, "").trim();
  const answer = answerOverrides[file] || raw;
  return { file, answer, shown: displayName[answer] || answer };
});

const allCanonicalAnswers = [...new Set(figures.map(f => f.answer))];
const acceptedAnswers = new Map();
for (const answer of allCanonicalAnswers) {
  const terms = aliases[answer] || [answer];
  acceptedAnswers.set(answer, [...new Set(terms.map(normalize))]);
}
const allAcceptedTerms = [...new Set([...acceptedAnswers.values()].flat())];
const termToCanonical = new Map();
for (const [canon, terms] of acceptedAnswers.entries()) {
  for (const term of terms) termToCanonical.set(term, canon);
}

const els = {
  startScreen: document.getElementById("startScreen"), quizScreen: document.getElementById("quizScreen"), endScreen: document.getElementById("endScreen"),
  startBtn: document.getElementById("startBtn"), restartBtn: document.getElementById("restartBtn"), newSessionBtn: document.getElementById("newSessionBtn"), retryMistakesBtn: document.getElementById("retryMistakesBtn"),
  progressText: document.getElementById("progressText"), progressBar: document.getElementById("progressBar"), scoreText: document.getElementById("scoreText"), scoreBarGreen: document.getElementById("scoreBarGreen"), scoreBarOrange: document.getElementById("scoreBarOrange"), scoreBarRed: document.getElementById("scoreBarRed"),
  figureImage: document.getElementById("figureImage"), answerForm: document.getElementById("answerForm"), answerInput: document.getElementById("answerInput"), feedback: document.getElementById("feedback"), nextBtn: document.getElementById("nextBtn"),
  finalMessage: document.getElementById("finalMessage"), finalScore: document.getElementById("finalScore"), mistakesBox: document.getElementById("mistakesBox"), endProgressBar: document.getElementById("endProgressBar"), endGreen: document.getElementById("endGreen"), endOrange: document.getElementById("endOrange"), endRed: document.getElementById("endRed"), endScoreText: document.getElementById("endScoreText")
};

let state;

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function typoLimit(s) {
  if (s.length <= 5) return 1;
  if (s.length <= 10) return 2;
  return 3;
}

function bestFuzzy(input, terms) {
  let best = { term: null, distance: 999 };
  for (const term of terms) {
    const d = levenshtein(input, term);
    if (d < best.distance) best = { term, distance: d };
  }
  return best;
}

function canFollow(prev, next) {
  return !prev || prev.answer !== next.answer;
}

function uniqueAnswers(items) {
  return [...new Set(items.map(x => x.answer))];
}

function arrangeNoSameNeighbours(items) {
  const remaining = [...items];
  const arranged = [];
  while (remaining.length) {
    const prev = arranged.at(-1);
    let candidates = remaining.filter(x => canFollow(prev, x));
    if (!candidates.length) candidates = remaining;
    candidates.sort((a, b) => {
      const ca = remaining.filter(x => x.answer === a.answer).length;
      const cb = remaining.filter(x => x.answer === b.answer).length;
      return cb - ca || Math.random() - 0.5;
    });
    const chosen = candidates[0];
    arranged.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }
  return arranged;
}

function buildQueue(pool, size = SESSION_SIZE) {
  const wantedSize = Math.min(size, pool.length);
  const labels = shuffle(uniqueAnswers(pool));
  const minimumDifferent = Math.min(10, labels.length, wantedSize);
  const selected = [];

  for (const label of labels.slice(0, minimumDifferent)) {
    const variants = pool.filter(item => item.answer === label && !selected.includes(item));
    selected.push(shuffle(variants)[0]);
  }

  const rest = shuffle(pool.filter(item => !selected.includes(item)));
  while (selected.length < wantedSize && rest.length) selected.push(rest.shift());

  return arrangeNoSameNeighbours(selected).slice(0, wantedSize);
}

function show(screen) {
  [els.startScreen, els.quizScreen, els.endScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function startSession(pool = figures) {
  state = {
    pool,
    queue: buildQueue(pool, Math.min(SESSION_SIZE, pool.length)),
    index: 0,
    attempts: 0,
    green: 0,
    orange: 0,
    red: 0,
    wrongItems: [],
    repeatUsed: new Set(),
    answered: false,
    total: Math.min(SESSION_SIZE, pool.length)
  };
  show(els.quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const item = current();
  state.attempts = 0;
  state.answered = false;
  els.figureImage.src = `images/${item.file}`;
  els.answerInput.value = "";
  els.answerInput.disabled = false;
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";
  els.nextBtn.classList.add("hidden");
  updateBars();
  setTimeout(() => els.answerInput.focus(), 0);
}

function updateBars() {
  const total = state.total || SESSION_SIZE;
  const shownQuestion = Math.min(state.index + 1, total);
  els.progressText.textContent = `Vraag ${shownQuestion} van ${total}`;
  els.progressBar.style.width = `${(state.index / total) * 100}%`;
  const g = state.green, o = state.orange, r = state.red;
  els.scoreText.textContent = `Groen: ${g} in één keer goed · Oranje: ${o} na de tweede keer goed · Rood: ${r} na twee pogingen fout`;
  els.scoreBarGreen.style.width = `${(g / total) * 100}%`;
  els.scoreBarOrange.style.width = `${(o / total) * 100}%`;
  els.scoreBarRed.style.width = `${(r / total) * 100}%`;
}

function feedback(msg, type = "warn") {
  els.feedback.innerHTML = msg;
  els.feedback.className = `feedback ${type}`;
}

function current() {
  return state.queue[state.index];
}

function isCorrect(input, answer) {
  return acceptedAnswers.get(answer).includes(input);
}

function canonicalOf(input) {
  return termToCanonical.get(input) || input;
}

function detectIntendedFigure(input) {
  if (termToCanonical.has(input)) return { canonical: canonicalOf(input), term: input, exact: true };
  const closeAny = bestFuzzy(input, allAcceptedTerms);
  if (closeAny.term && closeAny.distance <= typoLimit(closeAny.term)) {
    return { canonical: canonicalOf(closeAny.term), term: closeAny.term, exact: false };
  }
  return null;
}

function checkAnswer(e) {
  e.preventDefault();
  if (state.answered) return;

  const item = current();
  const input = normalize(els.answerInput.value);
  if (!input) {
    feedback("Typ eerst je antwoord.", "warn");
    return;
  }

  if (isCorrect(input, item.answer)) return markCorrect();

  // Eerst kijken of de leerling waarschijnlijk een ander bestaand figuur bedoelt.
  const intended = detectIntendedFigure(input);
  if (intended && intended.canonical !== item.answer) {
    state.attempts++;
    if (state.attempts >= 2) return markWrong();
    feedback(conceptHint(item.answer, intended.canonical), "bad");
    els.answerInput.select();
    return;
  }

  // Alleen daarna spellingcorrectie voor het juiste antwoord.
  const closeCorrect = bestFuzzy(input, acceptedAnswers.get(item.answer));
  if (closeCorrect.term && closeCorrect.distance > 0 && closeCorrect.distance <= typoLimit(closeCorrect.term)) {
    feedback(`Je bent warm! Bedoel je <strong>${item.shown}</strong>? Typ het woord nog eens goed over.`, "warn");
    els.answerInput.select();
    return;
  }

  state.attempts++;
  if (state.attempts >= 2) return markWrong();
  feedback(conceptHint(item.answer, canonicalOf(input)), "bad");
  els.answerInput.select();
}

function isSpecificTriangle(name) {
  return [
    "gelijkbenige driehoek",
    "gelijkzijdige driehoek",
    "rechthoekige driehoek",
    "gelijkbenige rechthoekige driehoek"
  ].includes(name);
}

function conceptHint(correct, guessed) {
  if (isSpecificTriangle(correct) && guessed === "gewone driehoek") {
    return "Goed gezien! Het is inderdaad een driehoek. Maar welke soort driehoek zie je? Kijk nog eens goed.";
  }
  if (correct === "gelijkzijdige driehoek" && guessed === "gelijkbenige driehoek") {
    return "Een gelijkbenige driehoek heeft 2 gelijke zijden. Bij deze driehoek zijn niet 2 maar 3 zijden even lang. Kijk nog eens goed.";
  }
  if (correct === "gelijkbenige driehoek" && guessed === "gelijkzijdige driehoek") {
    return "Bij een gelijkzijdige driehoek zijn 3 zijden even lang. Deze driehoek heeft maar 2 gelijke zijden. Denk aan het trucje van de benen.";
  }
  if (correct === "vierkant" && guessed === "rechthoek") {
    return "Een rechthoek heeft wel gelijke hoeken, maar zijn alle zijden van dit figuur ook even lang? Kijk nog eens goed!";
  }
  if (correct === "rechthoek" && guessed === "vierkant") {
    return "Bij een vierkant moeten alle zijden exact even lang zijn. Is dat hier ook zo, of zijn alleen de tegenoverliggende zijden even lang? Probeer het nog eens!";
  }
  if (correct === "vierkant" && guessed === "ruit") {
    return "De zijden zijn inderdaad allemaal even lang, maar kijk eens goed naar de hoeken. Zijn dit rechte hoeken? Probeer het opnieuw!";
  }
  if (correct === "ruit" && guessed === "vierkant") {
    return "Alle zijden zijn even lang, dat klopt! Maar heeft dit figuur wel rechte hoeken? Kijk nog eens goed naar de hoeken en probeer het opnieuw!";
  }
  if (correct === "ruit" && guessed === "parallellogram") {
    return "Goed gezien! Het is alleen een bijzonder parallellogram. Omdat alle vier de zijden even lang zijn, heeft dit figuur een eigen naam. Welke is dat?";
  }
  if (correct === "parallellogram" && guessed === "trapezium") {
    return "Goed kijken naar de zijden. Heeft dit figuur twee paar evenwijdige zijden of maar één paar?";
  }
  if (correct === "trapezium" && guessed === "parallellogram") {
    return "Kijk nog eens goed. Heeft dit figuur één paar evenwijdige zijden of twee paren?";
  }
  return "Dat is niet helemaal juist. Kijk goed naar het aantal zijden en de hoeken van het figuur. Probeer het nog eens!";
}

function markCorrect() {
  if (state.attempts === 0) state.green++;
  else state.orange++;
  state.answered = true;
  els.answerInput.disabled = true;
  feedback(`Goed zo! Dit is een <strong>${current().shown}</strong>.`, "good");
  els.nextBtn.classList.remove("hidden");
  updateBars();
}

function markWrong() {
  const item = current();
  state.red++;
  state.wrongItems.push(item);
  state.answered = true;
  els.answerInput.disabled = true;
  scheduleRepeat(item);
  feedback(`Nog niet goed. Het juiste antwoord is: <strong>${item.shown}</strong>.`, "bad");
  els.nextBtn.classList.remove("hidden");
  updateBars();
}

function scheduleRepeat(item) {
  if (state.repeatUsed.has(item.answer)) return;
  state.repeatUsed.add(item.answer);
  const variants = state.pool.filter(x => x.answer === item.answer && x.file !== item.file);
  const repeatItem = variants.length ? shuffle(variants)[0] : item;
  let pos = Math.min(state.index + 1 + REPEAT_AFTER, state.queue.length);
  if (pos >= state.total) return;
  while (pos < state.queue.length && ((state.queue[pos - 1] && state.queue[pos - 1].answer === repeatItem.answer) || (state.queue[pos] && state.queue[pos].answer === repeatItem.answer))) pos++;
  if (pos < state.total) state.queue.splice(pos, 0, repeatItem);
}

function nextQuestion() {
  state.index++;
  if (state.index >= state.total || state.index >= state.queue.length) return endSession();
  renderQuestion();
}

function endSession() {
  show(els.endScreen);
  const correct = state.green + state.orange;
  const total = state.total || SESSION_SIZE;
  let message = "Goed bezig!";
  if (correct === total) message = "Fantastisch! Je kent alle vlakke figuren!";
  else if (correct >= Math.ceil(total * 0.87)) message = "Heel knap! Je bent er bijna.";
  else if (correct >= Math.ceil(total * 0.67)) message = "Goed gedaan! Blijf oefenen, dan lukt het helemaal.";
  else message = "Je bent goed op weg. Oefen de fout beantwoorde figuren nog eens!";

  els.finalMessage.textContent = message;
  els.finalScore.textContent = `${correct} van de ${total} goed.`;
  els.endProgressBar.style.width = "100%";
  els.endGreen.style.width = `${(state.green / total) * 100}%`;
  els.endOrange.style.width = `${(state.orange / total) * 100}%`;
  els.endRed.style.width = `${(state.red / total) * 100}%`;
  els.endScoreText.textContent = `Groen: ${state.green} in één keer goed · Oranje: ${state.orange} na de tweede keer goed · Rood: ${state.red} na twee pogingen fout`;

  const uniqueWrong = [...new Map(state.wrongItems.map(x => [x.answer, x])).values()];
  if (uniqueWrong.length) {
    els.mistakesBox.classList.remove("hidden");
    els.mistakesBox.innerHTML = `<strong>Fouten om nog eens te oefenen:</strong> ${uniqueWrong.map(x => x.shown).join(", ")}`;
    els.retryMistakesBtn.classList.remove("hidden");
    els.retryMistakesBtn.onclick = () => startSession(figures.filter(f => uniqueWrong.some(w => w.answer === f.answer)));
  } else {
    els.mistakesBox.classList.add("hidden");
    els.retryMistakesBtn.classList.add("hidden");
  }
}

els.startBtn.addEventListener("click", () => startSession());
els.restartBtn.addEventListener("click", () => startSession());
els.newSessionBtn.addEventListener("click", () => startSession());
els.answerForm.addEventListener("submit", checkAnswer);
els.nextBtn.addEventListener("click", nextQuestion);
