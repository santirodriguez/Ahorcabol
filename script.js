"use strict";

const LANGUAGES = ["es-AR", "en-US", "ca"];
const DEFAULT_LANGUAGE = "es-AR";
const STORAGE_KEY = "ahorcabol";
const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

const I18N = {
  "es-AR": {
    htmlLang: "es-AR",
    locale: "es-AR",
    title: "Ahorcabol — Ahorcado futbolero",
    country: "País",
    all: "Todos",
    newGame: "Nuevo partido",
    score: "Puntos",
    streak: "Racha",
    lives: "Vidas",
    hint: "Pista (−1 vida)",
    giveUp: "Me rindo",
    footer: "Ahorcabol — fútbol, letras y potrero.",
    languageSwitcher: "Idioma",
    scoreboard: "Marcador",
    hiddenTeam: "Equipo oculto",
    keyboard: "Teclado",
    noTeams: "No hay equipos en este filtro",
    noMoreHints: "No da para más pistas…",
    alreadyRevealed: "¡Ya está todo revelado!",
    hintMessage: "Te tiro una bocha…",
    was: "Era: {team}",
    goal: "¡Goool!",
    out: "¡Fuera!",
    gameOver: "Fin del partido. Era: {team}",
    greatGoal: "¡GOLAZO! 🎉",
    rival: "Rival: {country}",
    dataWarning: "No se pudo leer teamlist.json. Usando la lista de respaldo.",
    formatWarning: "Formato inesperado",
    speechGoal: "¡Gooooool!",
    speechOut: "¡Fuera!",
    speechWin: "¡Golazo!"
  },
  "en-US": {
    htmlLang: "en-US",
    locale: "en-US",
    title: "Ahorcabol — Football Hangman",
    country: "Country",
    all: "All",
    newGame: "New match",
    score: "Score",
    streak: "Streak",
    lives: "Lives",
    hint: "Hint (−1 life)",
    giveUp: "Give up",
    footer: "Ahorcabol — football, letters and match-day flair.",
    languageSwitcher: "Language",
    scoreboard: "Scoreboard",
    hiddenTeam: "Hidden team",
    keyboard: "Keyboard",
    noTeams: "There are no teams in this filter",
    noMoreHints: "No more hints available…",
    alreadyRevealed: "Everything is already revealed!",
    hintMessage: "Here comes a hint…",
    was: "It was: {team}",
    goal: "Goal!",
    out: "Wide!",
    gameOver: "Full time. It was: {team}",
    greatGoal: "WHAT A GOAL! 🎉",
    rival: "Opponent: {country}",
    dataWarning: "Could not read teamlist.json. Using the fallback list.",
    formatWarning: "Unexpected data format",
    speechGoal: "Goal!",
    speechOut: "Wide!",
    speechWin: "What a goal!"
  },
  ca: {
    htmlLang: "ca",
    locale: "ca-ES",
    title: "Ahorcabol — Penjat futboler",
    country: "País",
    all: "Tots",
    newGame: "Partit nou",
    score: "Punts",
    streak: "Ratxa",
    lives: "Vides",
    hint: "Pista (−1 vida)",
    giveUp: "Em rendeixo",
    footer: "Ahorcabol — futbol, lletres i ambient de partit.",
    languageSwitcher: "Idioma",
    scoreboard: "Marcador",
    hiddenTeam: "Equip ocult",
    keyboard: "Teclat",
    noTeams: "No hi ha equips en aquest filtre",
    noMoreHints: "Ja no queden més pistes…",
    alreadyRevealed: "Ja està tot revelat!",
    hintMessage: "Aquí tens una pista…",
    was: "Era: {team}",
    goal: "Gol!",
    out: "Fora!",
    gameOver: "Final del partit. Era: {team}",
    greatGoal: "GOLÀS! 🎉",
    rival: "Rival: {country}",
    dataWarning: "No s'ha pogut llegir teamlist.json. S'utilitza la llista de reserva.",
    formatWarning: "Format inesperat",
    speechGoal: "Gol!",
    speechOut: "Fora!",
    speechWin: "Golàs!"
  }
};

const COUNTRY_LABELS = {
  Argentina: { "es-AR": "Argentina", "en-US": "Argentina", ca: "Argentina" },
  España: { "es-AR": "España", "en-US": "Spain", ca: "Espanya" },
  Inglaterra: { "es-AR": "Inglaterra", "en-US": "England", ca: "Anglaterra" },
  Alemania: { "es-AR": "Alemania", "en-US": "Germany", ca: "Alemanya" },
  Francia: { "es-AR": "Francia", "en-US": "France", ca: "França" },
  Portugal: { "es-AR": "Portugal", "en-US": "Portugal", ca: "Portugal" },
  Brasil: { "es-AR": "Brasil", "en-US": "Brazil", ca: "Brasil" }
};

const FULL_FALLBACK = [
  { pais: "Argentina", equipos: ["Argentinos Juniors","Atlético Tucumán","Banfield","Barracas Central","Belgrano","Boca Juniors","Central Córdoba","Defensa y Justicia","Deportivo Riestra","Estudiantes de La Plata","Gimnasia y Esgrima La Plata","Godoy Cruz","Huracán","Independiente","Independiente Rivadavia","Instituto de Córdoba","Lanús","Newell’s Old Boys","Platense","Racing","River Plate","Rosario Central","San Lorenzo","San Martín de San Juan","Sarmiento","Talleres de Córdoba","Tigre","Unión de Santa Fe","Vélez Sarsfield"] },
  { pais: "España", equipos: ["Alavés","Athletic Club","Atlético de Madrid","Barcelona","Celta de Vigo","Elche","Espanyol","Getafe","Girona","Levante","Mallorca","Osasuna","Rayo Vallecano","Real Betis","Real Madrid","Real Oviedo","Real Sociedad","Sevilla","Valencia","Villarreal"] },
  { pais: "Inglaterra", equipos: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds United","Liverpool","Manchester City","Manchester United","Newcastle United","Nottingham Forest","Sunderland","Tottenham Hotspur","West Ham United","Wolverhampton Wanderers"] },
  { pais: "Alemania", equipos: ["Augsburg","Union Berlin","Werder Bremen","Borussia Dortmund","Eintracht Frankfurt","Freiburg","Hamburg","Heidenheim","Hoffenheim","Köln","RB Leipzig","Bayer Leverkusen","Mainz","Borussia Mönchengladbach","Bayern München","St. Pauli","Stuttgart","Wolfsburg"] },
  { pais: "Francia", equipos: ["Paris Saint-Germain","Marseille","Strasbourg","Lyon","Monaco","Lens","Lille","Brest","Nice","Nantes","Rennes","Lorient","Le Havre","Auxerre","Metz","Angers"] },
  { pais: "Portugal", equipos: ["Porto","Sporting CP","Benfica","Braga","Gil Vicente","Moreirense","Famalicão","Vitória de Guimarães","Nacional","Alverca","Arouca","Rio Ave","Santa Clara","Casa Pia","Estrela da Amadora","Estoril","Tondela","AVS"] },
  { pais: "Brasil", equipos: ["Flamengo","Palmeiras","Red Bull Bragantino","Fluminense","Ceará","Cruzeiro","Corinthians","Bahia","Internacional","Botafogo","São Paulo","Vasco da Gama","Juventude","Mirassol","Fortaleza","Atlético Mineiro","Vitória","Grêmio","Santos","Sport Recife"] }
];

const normalize = (str) => str
  .toUpperCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^A-Z]/g, "");
const normalizeChar = (ch) => normalize(ch).slice(0, 1);

const state = {
  data: [],
  pool: [],
  current: null,
  masked: [],
  guessed: new Set(),
  lives: 6,
  score: 0,
  streak: 0,
  language: DEFAULT_LANGUAGE
};

const els = {
  country: document.getElementById("countrySelect"),
  score: document.getElementById("score"),
  streak: document.getElementById("streak"),
  lives: document.getElementById("lives"),
  masked: document.getElementById("maskedWord"),
  keyboard: document.getElementById("keyboard"),
  newGame: document.getElementById("newGameBtn"),
  hint: document.getElementById("hintBtn"),
  giveUp: document.getElementById("giveUpBtn"),
  goal: document.getElementById("goalSvg"),
  toast: document.getElementById("toast"),
  redCard: document.getElementById("redCard"),
  confetti: document.getElementById("confetti"),
  languageSwitcher: document.getElementById("languageSwitcher"),
  scoreboard: document.querySelector(".scoreboard"),
  word: document.querySelector(".word"),
  ball: null,
  netRect: null
};

function t(key, params = {}) {
  const template = I18N[state.language]?.[key] ?? I18N[DEFAULT_LANGUAGE]?.[key] ?? key;
  return Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function countryLabel(country) {
  return COUNTRY_LABELS[country]?.[state.language] ?? country;
}

let audioCtx;
function beep(freq = 880, dur = 0.08, type = "square", vol = 0.03) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = vol;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + dur);
  } catch {}
}
const sfx = {
  good() { beep(940, .06, "square", .05); },
  bad() { beep(240, .10, "sawtooth", .06); },
  win() { [880, 990, 1180].forEach((freq, i) => setTimeout(() => beep(freq, .10, "triangle", .06), i * 120)); },
  lose() { [300, 220, 180].forEach((freq, i) => setTimeout(() => beep(freq, .14, "sawtooth", .07), i * 140)); }
};

let voices = [];
function setupVoices() {
  try { voices = window.speechSynthesis.getVoices(); } catch {}
}
if ("speechSynthesis" in window) {
  setupVoices();
  window.speechSynthesis.onvoiceschanged = setupVoices;
}
function speak(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const preferred = I18N[state.language].locale;
    const base = preferred.split("-")[0];
    const voice = voices.find((item) => item.lang.toLowerCase() === preferred.toLowerCase())
      || voices.find((item) => item.lang.toLowerCase().startsWith(base.toLowerCase()))
      || voices[0];
    if (voice) utterance.voice = voice;
    utterance.lang = preferred;
    utterance.rate = .96;
    utterance.pitch = .96;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {}
}

function throwConfetti() {
  els.confetti.innerHTML = "";
  const colors = ["#1ca5ee", "#073b75", "#f4fbff", "#9be34b", "#ffd54a", "#20b968"];
  for (let i = 0; i < 120; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 96 + 2}%`;
    piece.style.top = `${Math.random() * 8}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * .35}s`;
    piece.style.transform = `translateY(-${Math.random() * 60}px) rotate(${Math.random() * 180}deg)`;
    els.confetti.appendChild(piece);
  }
  setTimeout(() => { els.confetti.innerHTML = ""; }, 2200);
}

let toastTimer = null;
function say(message) {
  els.toast.textContent = message;
  els.toast.style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.style.opacity = .72; }, 1900);
}

function loadPersist() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (Number.isFinite(saved.score)) state.score = saved.score;
    if (Number.isFinite(saved.streak)) state.streak = saved.streak;
    if (LANGUAGES.includes(saved.language)) state.language = saved.language;
  } catch {}
}
function savePersist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: state.score, streak: state.streak, language: state.language }));
}

function renderStats() {
  bump(els.score, state.score);
  bump(els.streak, state.streak);
  bump(els.lives, state.lives);
}
function bump(el, value) {
  el.textContent = value;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function buildKeyboard() {
  els.keyboard.innerHTML = "";
  KB_ROWS.forEach((row) => {
    [...row].forEach((character) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";
      button.textContent = character;
      button.dataset.k = character;
      button.addEventListener("click", () => onGuess(character));
      els.keyboard.appendChild(button);
    });
  });
}
function markKey(rawCharacter, good) {
  const normalized = normalizeChar(rawCharacter);
  const key = [...els.keyboard.querySelectorAll(".key")].find((item) => normalizeChar(item.dataset.k) === normalized);
  if (!key) return;
  key.classList.add("used", good ? "good" : "bad");
}

function updateGoalGraphics() {
  const misses = 6 - state.lives;
  for (let i = 1; i <= 6; i += 1) {
    els.goal.querySelectorAll(`.s${i}`).forEach((node) => node.classList.toggle("show", misses >= i));
  }
  els.redCard.classList.toggle("show", state.lives <= 0);
}
function setBallAnim(name) {
  ["idle", "tap", "post", "kick"].forEach((className) => els.ball?.classList.remove(className));
  if (!els.ball) return;
  void els.ball.offsetWidth;
  if (name) els.ball.classList.add(name);
}
function goalShake() {
  els.goal.classList.add("shake");
  setTimeout(() => els.goal.classList.remove("shake"), 320);
}

function rebuildPool() {
  const selected = els.country.value;
  const pool = [];
  state.data.forEach((group) => {
    if (selected !== "ALL" && group.pais !== selected) return;
    group.equipos.forEach((name) => pool.push({ pais: group.pais, nombre: name, chars: [...name] }));
  });
  state.pool = pool;
}
function pickWord() {
  if (!state.pool.length) {
    say(t("noTeams"));
    return null;
  }
  return state.pool[Math.floor(Math.random() * state.pool.length)];
}
function setupMasked() {
  state.masked = state.current.chars.map((character) => ({ character, shown: !/\p{L}/u.test(character) }));
  renderMasked();
}
function renderMasked() {
  els.masked.innerHTML = "";
  state.masked.forEach((item) => {
    const tile = document.createElement("div");
    const isSpace = item.character === " " || item.character === "\u00A0";
    tile.className = `tile${item.shown ? " revealed" : ""}${isSpace ? " space" : ""}`;
    tile.textContent = item.shown ? item.character : "—";
    els.masked.appendChild(tile);
  });
}
function reveal(letter) {
  let hits = 0;
  state.masked.forEach((item) => {
    if (!item.shown && /\p{L}/u.test(item.character) && normalizeChar(item.character) === letter) {
      item.shown = true;
      hits += 1;
    }
  });
  if (hits) renderMasked();
  return hits;
}
function isSolved() { return state.masked.every((item) => item.shown); }

function useHint() {
  if (state.lives <= 1) { say(t("noMoreHints")); return; }
  const hidden = state.masked.filter((item) => !item.shown && /\p{L}/u.test(item.character));
  if (!hidden.length) { say(t("alreadyRevealed")); return; }
  const item = hidden[Math.floor(Math.random() * hidden.length)];
  const normalized = normalizeChar(item.character);
  state.lives -= 1;
  state.guessed.add(normalized);
  renderStats();
  updateGoalGraphics();
  markKey(item.character, true);
  reveal(normalized);
  say(t("hintMessage"));
  sfx.good();
  setBallAnim("tap");
  if (isSolved()) handleWin();
}

function giveUp() {
  if (!state.current) return;
  state.lives = 0;
  state.streak = 0;
  state.masked.forEach((item) => { item.shown = true; });
  renderStats();
  updateGoalGraphics();
  renderMasked();
  say(t("was", { team: state.current.nombre }));
  sfx.lose();
  savePersist();
}

function onGuess(rawCharacter) {
  if (!state.current || state.lives <= 0 || isSolved()) return;
  const character = normalizeChar(rawCharacter);
  if (!character || state.guessed.has(character)) return;
  state.guessed.add(character);
  const hits = reveal(character);
  if (hits > 0) {
    markKey(rawCharacter, true);
    state.score += 100 * hits;
    renderStats();
    say(t("goal"));
    speak(t("speechGoal"));
    sfx.good();
    setBallAnim("tap");
    if (isSolved()) handleWin();
    return;
  }

  markKey(rawCharacter, false);
  state.lives -= 1;
  renderStats();
  updateGoalGraphics();
  say(t("out"));
  speak(t("speechOut"));
  sfx.bad();
  goalShake();
  setBallAnim("post");
  if (state.lives <= 0) {
    state.streak = 0;
    state.masked.forEach((item) => { item.shown = true; });
    renderMasked();
    say(t("gameOver", { team: state.current.nombre }));
    sfx.lose();
    savePersist();
  }
}

function handleWin() {
  say(t("greatGoal"));
  speak(t("speechWin"));
  sfx.win();
  throwConfetti();
  setBallAnim("kick");
  if (els.netRect) {
    els.netRect.classList.remove("ripple");
    void els.netRect.offsetWidth;
    els.netRect.classList.add("ripple");
  }
  state.score += 500 + state.lives * 50;
  state.streak += 1;
  renderStats();
  savePersist();
}

function onKeydown(event) {
  if (/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑçÇ]$/.test(event.key)) onGuess(event.key);
  else if (event.key === "Enter") newGame();
}

function newGame() {
  state.lives = 6;
  state.guessed.clear();
  renderStats();
  els.keyboard.querySelectorAll(".key").forEach((key) => key.classList.remove("used", "good", "bad"));
  updateGoalGraphics();
  setBallAnim("idle");
  state.current = pickWord();
  if (!state.current) return;
  setupMasked();
  say(t("rival", { country: countryLabel(state.current.pais) }));
}

async function loadData() {
  try {
    const response = await fetch("teamlist.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(t("formatWarning"));
    state.data = data;
  } catch (error) {
    console.warn(t("dataWarning"), error);
    state.data = FULL_FALLBACK;
  }
}

function fillCountrySelect() {
  const currentValue = els.country.value || "ALL";
  const countries = Array.from(new Set(state.data.map((group) => group.pais)))
    .sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), I18N[state.language].locale));
  els.country.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "ALL";
  allOption.textContent = t("all");
  els.country.appendChild(allOption);
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = countryLabel(country);
    els.country.appendChild(option);
  });
  els.country.value = currentValue === "ALL" || countries.includes(currentValue) ? currentValue : "ALL";
}

function applyLanguage(language, { persist = true } = {}) {
  if (!LANGUAGES.includes(language)) return;
  state.language = language;
  document.documentElement.lang = I18N[language].htmlLang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  els.languageSwitcher.setAttribute("aria-label", t("languageSwitcher"));
  els.scoreboard.setAttribute("aria-label", t("scoreboard"));
  els.word.setAttribute("aria-label", t("hiddenTeam"));
  els.masked.setAttribute("aria-label", t("hiddenTeam"));
  els.keyboard.setAttribute("aria-label", t("keyboard"));
  els.languageSwitcher.querySelectorAll(".language-btn").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  fillCountrySelect();
  rebuildPool();
  if (state.current) say(t("rival", { country: countryLabel(state.current.pais) }));
  if (persist) savePersist();
}

(async function init() {
  loadPersist();
  buildKeyboard();
  await loadData();
  els.ball = document.getElementById("ball");
  els.netRect = document.querySelector(".net-rect");
  fillCountrySelect();
  applyLanguage(state.language, { persist: false });
  rebuildPool();
  renderStats();
  newGame();

  els.languageSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest(".language-btn");
    if (button) applyLanguage(button.dataset.lang);
  });
  els.country.addEventListener("change", () => { rebuildPool(); newGame(); });
  els.newGame.addEventListener("click", newGame);
  els.hint.addEventListener("click", useHint);
  els.giveUp.addEventListener("click", giveUp);
  window.addEventListener("keydown", onKeydown);
})();
