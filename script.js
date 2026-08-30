"use strict";

const LANGUAGES = ["es-AR", "en-US", "ca"];
const DEFAULT_LANGUAGE = "es-AR";
const STORAGE_KEY = "ahorcabol";
const MAX_LIVES = 6;
const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

const ROUND = Object.freeze({
  LOADING: "loading",
  PLAYING: "playing",
  WON: "won",
  LOST: "lost",
  GIVEN_UP: "given-up",
  ERROR: "error"
});

const I18N = {
  "es-AR": {
    htmlLang: "es-AR",
    locale: "es-AR",
    title: "Ahorcabol — Ahorcado futbolero",
    description: "Ahorcabol es un ahorcado futbolero para adivinar clubes antes de quedarte sin vidas.",
    league: "Liga / país",
    all: "Todos",
    score: "Puntos",
    streak: "Racha",
    best: "Mejor",
    challenge: "Desafío",
    hint: "Pista (−1 vida)",
    giveUp: "Me rindo",
    nextTeam: "Siguiente equipo",
    retry: "Reintentar",
    footer: "Ahorcabol — fútbol, letras y decisiones cuestionables.",
    donate: "Donar",
    sfx: "SFX",
    voice: "Voz",
    languageSwitcher: "Idioma",
    audioControls: "Audio",
    scoreboard: "Marcador",
    hiddenTeam: "Equipo oculto",
    keyboard: "Teclado",
    gameControls: "Controles del partido",
    arenaLabel: "Cancha de Ahorcabol",
    filterHelp: "Cambiar el filtro durante una ronda inicia otra y reinicia la racha.",
    loading: "Buscando rival…",
    noTeams: "No hay equipos disponibles con este filtro.",
    noMoreHints: "Con una sola vida ya no hay margen para otra pista.",
    alreadyRevealed: "Ya está todo revelado.",
    hintMessage: "Pista servida. Costó una vida.",
    goal: "¡Gol! Esa letra estaba.",
    out: "Al palo. Esa letra no está.",
    gameOver: "Se terminó. Era {team}.",
    was: "Era {team}.",
    greatGoal: "¡Golazo! Equipo resuelto.",
    rival: "Te tocó {country}.",
    dataWarning: "No se pudo cargar teamlist.json.",
    dataErrorEyebrow: "Datos",
    dataErrorTitle: "No pudimos cargar los equipos.",
    dataErrorBody: "Revisá la conexión y volvé a intentarlo.",
    roundPoints: "Puntos de la ronda",
    currentStreak: "Racha actual",
    wonEyebrow: "Victoria",
    lostEyebrow: "Final",
    gaveUpEyebrow: "Bandera blanca",
    wonTitle: "¡Golazo!",
    lostTitle: "Partido terminado",
    gaveUpTitle: "Hasta acá llegamos",
    wonSummary: "Era {team}. Sumaste la ronda.",
    lostSummary: "El equipo era {team}. La racha vuelve a cero.",
    gaveUpSummary: "El equipo era {team}. La racha vuelve a cero.",
    voiceUnavailable: "La voz no está disponible en este navegador.",
    sfxUnavailable: "El audio no está disponible en este navegador.",
    speechGoal: "¡Gooooool!",
    speechOut: "¡Fuera!",
    speechWin: "¡Golazo!",
    oneLife: "1 vida",
    manyLives: "{count} vidas"
  },
  "en-US": {
    htmlLang: "en-US",
    locale: "en-US",
    title: "Ahorcabol — Football Hangman",
    description: "Ahorcabol is a football hangman game: guess club names before you run out of lives.",
    league: "League / country",
    all: "All",
    score: "Score",
    streak: "Streak",
    best: "Best",
    challenge: "Challenge",
    hint: "Hint (−1 life)",
    giveUp: "Give up",
    nextTeam: "Next team",
    retry: "Retry",
    footer: "Ahorcabol — football, letters and questionable decisions.",
    donate: "Donate",
    sfx: "SFX",
    voice: "Voice",
    languageSwitcher: "Language",
    audioControls: "Audio",
    scoreboard: "Scoreboard",
    hiddenTeam: "Hidden team",
    keyboard: "Keyboard",
    gameControls: "Match controls",
    arenaLabel: "Ahorcabol pitch",
    filterHelp: "Changing the filter during a round starts another round and resets the streak.",
    loading: "Finding an opponent…",
    noTeams: "No teams are available with this filter.",
    noMoreHints: "With one life left there is no room for another hint.",
    alreadyRevealed: "Everything is already revealed.",
    hintMessage: "Hint delivered. It cost one life.",
    goal: "Goal. That letter is in.",
    out: "Off the post. That letter is out.",
    gameOver: "That's it. It was {team}.",
    was: "It was {team}.",
    greatGoal: "What a goal. Team solved.",
    rival: "You got {country}.",
    dataWarning: "Could not load teamlist.json.",
    dataErrorEyebrow: "Data",
    dataErrorTitle: "We could not load the teams.",
    dataErrorBody: "Check the connection and try again.",
    roundPoints: "Round points",
    currentStreak: "Current streak",
    wonEyebrow: "Victory",
    lostEyebrow: "Full time",
    gaveUpEyebrow: "White flag",
    wonTitle: "What a goal!",
    lostTitle: "Match over",
    gaveUpTitle: "That's enough",
    wonSummary: "It was {team}. Round complete.",
    lostSummary: "The team was {team}. Your streak is back to zero.",
    gaveUpSummary: "The team was {team}. Your streak is back to zero.",
    voiceUnavailable: "Voice is not available in this browser.",
    sfxUnavailable: "Audio is not available in this browser.",
    speechGoal: "Goal!",
    speechOut: "Wide!",
    speechWin: "What a goal!",
    oneLife: "1 life",
    manyLives: "{count} lives"
  },
  ca: {
    htmlLang: "ca",
    locale: "ca-ES",
    title: "Ahorcabol — Penjat futboler",
    description: "Ahorcabol és un joc del penjat futboler: endevina clubs abans de quedar-te sense vides.",
    league: "Lliga / país",
    all: "Tots",
    score: "Punts",
    streak: "Ratxa",
    best: "Millor",
    challenge: "Repte",
    hint: "Pista (−1 vida)",
    giveUp: "Em rendeixo",
    nextTeam: "Equip següent",
    retry: "Torna-ho a provar",
    footer: "Ahorcabol — futbol, lletres i decisions qüestionables.",
    donate: "Donar",
    sfx: "SFX",
    voice: "Veu",
    languageSwitcher: "Idioma",
    audioControls: "Àudio",
    scoreboard: "Marcador",
    hiddenTeam: "Equip ocult",
    keyboard: "Teclat",
    gameControls: "Controls del partit",
    arenaLabel: "Camp d'Ahorcabol",
    filterHelp: "Canviar el filtre durant una ronda n'inicia una altra i reinicia la ratxa.",
    loading: "Buscant rival…",
    noTeams: "No hi ha equips disponibles amb aquest filtre.",
    noMoreHints: "Amb una sola vida ja no hi ha marge per a una altra pista.",
    alreadyRevealed: "Ja està tot revelat.",
    hintMessage: "Pista servida. Ha costat una vida.",
    goal: "Gol. Aquesta lletra hi és.",
    out: "Al pal. Aquesta lletra no hi és.",
    gameOver: "S'ha acabat. Era {team}.",
    was: "Era {team}.",
    greatGoal: "Golàs. Equip resolt.",
    rival: "T'ha tocat {country}.",
    dataWarning: "No s'ha pogut carregar teamlist.json.",
    dataErrorEyebrow: "Dades",
    dataErrorTitle: "No hem pogut carregar els equips.",
    dataErrorBody: "Comprova la connexió i torna-ho a provar.",
    roundPoints: "Punts de la ronda",
    currentStreak: "Ratxa actual",
    wonEyebrow: "Victòria",
    lostEyebrow: "Final",
    gaveUpEyebrow: "Bandera blanca",
    wonTitle: "Golàs!",
    lostTitle: "Partit acabat",
    gaveUpTitle: "Fins aquí",
    wonSummary: "Era {team}. Ronda completada.",
    lostSummary: "L'equip era {team}. La ratxa torna a zero.",
    gaveUpSummary: "L'equip era {team}. La ratxa torna a zero.",
    voiceUnavailable: "La veu no està disponible en aquest navegador.",
    sfxUnavailable: "L'àudio no està disponible en aquest navegador.",
    speechGoal: "Gol!",
    speechOut: "Fora!",
    speechWin: "Golàs!",
    oneLife: "1 vida",
    manyLives: "{count} vides"
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

const state = {
  data: [],
  pool: [],
  bag: [],
  bagKey: "",
  current: null,
  previousTeamName: null,
  masked: [],
  guessed: new Set(),
  lives: MAX_LIVES,
  score: 0,
  streak: 0,
  bestStreak: 0,
  roundStartScore: 0,
  language: DEFAULT_LANGUAGE,
  country: "ALL",
  sfxEnabled: true,
  voiceEnabled: false,
  roundStatus: ROUND.LOADING
};

const els = {
  metaDescription: document.getElementById("metaDescription"),
  country: document.getElementById("countrySelect"),
  score: document.getElementById("score"),
  streak: document.getElementById("streak"),
  bestStreak: document.getElementById("bestStreak"),
  countryBadge: document.getElementById("countryBadge"),
  livesLabel: document.getElementById("livesLabel"),
  lifePips: document.getElementById("lifePips"),
  masked: document.getElementById("maskedWord"),
  keyboard: document.getElementById("keyboard"),
  hint: document.getElementById("hintBtn"),
  giveUp: document.getElementById("giveUpBtn"),
  nextGame: document.getElementById("nextGameBtn"),
  retryData: document.getElementById("retryDataBtn"),
  goal: document.getElementById("goalSvg"),
  toast: document.getElementById("toast"),
  redCard: document.getElementById("redCard"),
  confetti: document.getElementById("confetti"),
  languageSwitcher: document.getElementById("languageSwitcher"),
  audioControls: document.getElementById("audioControls"),
  sfxToggle: document.getElementById("sfxToggle"),
  voiceToggle: document.getElementById("voiceToggle"),
  scoreboard: document.getElementById("scoreboard"),
  matchPanel: document.getElementById("matchPanel"),
  arena: document.getElementById("arena"),
  word: document.getElementById("wordSection"),
  playActions: document.getElementById("playActions"),
  resultPanel: document.getElementById("resultPanel"),
  resultEyebrow: document.getElementById("resultEyebrow"),
  resultTitle: document.getElementById("resultTitle"),
  resultSummary: document.getElementById("resultSummary"),
  roundPoints: document.getElementById("roundPoints"),
  resultStreak: document.getElementById("resultStreak"),
  dataErrorPanel: document.getElementById("dataErrorPanel"),
  ball: document.getElementById("ball"),
  netRect: document.querySelector(".net-rect")
};

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

function t(key, params = {}) {
  const template = I18N[state.language]?.[key] ?? I18N[DEFAULT_LANGUAGE]?.[key] ?? key;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function countryLabel(country) {
  return COUNTRY_LABELS[country]?.[state.language] ?? country;
}

function normalizeLetter(character) {
  const upper = String(character).toLocaleUpperCase("es");
  if (upper === "Ñ") return "Ñ";

  return upper
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Z]/g, "")
    .slice(0, 1);
}

function safeReadStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadPersist() {
  const saved = safeReadStorage();

  if (Number.isFinite(saved.score) && saved.score >= 0) state.score = saved.score;
  if (Number.isFinite(saved.streak) && saved.streak >= 0) state.streak = saved.streak;
  if (Number.isFinite(saved.bestStreak) && saved.bestStreak >= 0) state.bestStreak = saved.bestStreak;
  if (LANGUAGES.includes(saved.language)) state.language = saved.language;
  if (typeof saved.country === "string") state.country = saved.country;
  if (typeof saved.sfxEnabled === "boolean") state.sfxEnabled = saved.sfxEnabled;
  if (typeof saved.voiceEnabled === "boolean") state.voiceEnabled = saved.voiceEnabled;

  state.bestStreak = Math.max(state.bestStreak, state.streak);
}

function savePersist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score: state.score,
        streak: state.streak,
        bestStreak: state.bestStreak,
        language: state.language,
        country: state.country,
        sfxEnabled: state.sfxEnabled,
        voiceEnabled: state.voiceEnabled
      })
    );
  } catch {
    // Persistence is optional. The game remains playable without it.
  }
}

let audioCtx;
function audioSupported() {
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

function beep(freq = 880, duration = 0.08, type = "square", volume = 0.03) {
  if (!state.sfxEnabled || !audioSupported()) return;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch {
    // Sound effects are non-essential.
  }
}

const sfx = {
  good() { beep(940, 0.06, "square", 0.045); },
  bad() { beep(240, 0.1, "sawtooth", 0.05); },
  win() {
    [880, 990, 1180].forEach((freq, index) => {
      window.setTimeout(() => beep(freq, 0.1, "triangle", 0.05), index * 110);
    });
  },
  lose() {
    [300, 220, 180].forEach((freq, index) => {
      window.setTimeout(() => beep(freq, 0.13, "sawtooth", 0.055), index * 125);
    });
  }
};

let voices = [];
function setupVoices() {
  if (!("speechSynthesis" in window)) return;
  try {
    voices = window.speechSynthesis.getVoices();
  } catch {
    voices = [];
  }
}

if ("speechSynthesis" in window) {
  setupVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", setupVoices);
}

function speak(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const preferred = I18N[state.language].locale;
    const base = preferred.split("-")[0].toLowerCase();
    const voice =
      voices.find((item) => item.lang.toLowerCase() === preferred.toLowerCase()) ||
      voices.find((item) => item.lang.toLowerCase().startsWith(base)) ||
      voices[0];

    if (voice) utterance.voice = voice;
    utterance.lang = preferred;
    utterance.rate = 0.96;
    utterance.pitch = 0.96;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Voice feedback is optional.
  }
}

function renderAudioSettings() {
  const sfxAvailable = audioSupported();
  const voiceAvailable = "speechSynthesis" in window;

  if (!sfxAvailable) state.sfxEnabled = false;
  if (!voiceAvailable) state.voiceEnabled = false;

  els.sfxToggle.disabled = !sfxAvailable;
  els.voiceToggle.disabled = !voiceAvailable;

  els.sfxToggle.classList.toggle("active", state.sfxEnabled);
  els.voiceToggle.classList.toggle("active", state.voiceEnabled);
  els.sfxToggle.setAttribute("aria-pressed", String(state.sfxEnabled));
  els.voiceToggle.setAttribute("aria-pressed", String(state.voiceEnabled));
  els.sfxToggle.title = sfxAvailable ? t("sfx") : t("sfxUnavailable");
  els.voiceToggle.title = voiceAvailable ? t("voice") : t("voiceUnavailable");
}

function throwConfetti() {
  els.confetti.replaceChildren();
  if (reducedMotion?.matches) return;

  const colors = ["#45c77a", "#50b8ff", "#f4f8fb", "#d8f56a", "#ffd56a"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 48; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 96 + 2}%`;
    piece.style.setProperty("--fall-delay", `${Math.random() * 0.24}s`);
    piece.style.setProperty("--fall-rotate", `${360 + Math.random() * 420}deg`);
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    fragment.appendChild(piece);
  }

  els.confetti.appendChild(fragment);
  window.setTimeout(() => els.confetti.replaceChildren(), 1900);
}

let toastTimer = null;
function say(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("muted");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.add("muted"), 2200);
}

function bump(element, value) {
  element.textContent = value;
  element.classList.remove("bump");
  void element.offsetWidth;
  element.classList.add("bump");
}

function renderStats({ animate = true } = {}) {
  if (animate) {
    bump(els.score, state.score);
    bump(els.streak, state.streak);
    bump(els.bestStreak, state.bestStreak);
  } else {
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.bestStreak.textContent = state.bestStreak;
  }
  renderLives();
}

function renderLives() {
  els.livesLabel.textContent = state.lives === 1
    ? t("oneLife")
    : t("manyLives", { count: state.lives });

  [...els.lifePips.children].forEach((pip, index) => {
    pip.classList.toggle("lost", index >= state.lives);
  });
}

function buildKeyboard() {
  els.keyboard.replaceChildren();

  KB_ROWS.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div");
    rowElement.className = `keyboard-row row-${rowIndex + 1}`;

    [...row].forEach((character) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";
      button.textContent = character;
      button.dataset.key = character;
      button.setAttribute("aria-label", character);
      button.addEventListener("click", () => onGuess(character));
      rowElement.appendChild(button);
    });

    els.keyboard.appendChild(rowElement);
  });
}

function resetKeyboard() {
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    key.disabled = false;
    key.classList.remove("used", "good", "bad");
  });
}

function setKeyboardEnabled(enabled) {
  els.keyboard.querySelectorAll(".key").forEach((key) => {
    const alreadyUsed = key.classList.contains("used");
    key.disabled = !enabled || alreadyUsed;
  });
}

function markKey(rawCharacter, good) {
  const normalized = normalizeLetter(rawCharacter);

  els.keyboard.querySelectorAll(".key").forEach((key) => {
    if (normalizeLetter(key.dataset.key) !== normalized) return;
    key.classList.add("used", good ? "good" : "bad");
    key.disabled = true;
  });
}

function updateGoalGraphics() {
  const misses = MAX_LIVES - state.lives;
  for (let index = 1; index <= MAX_LIVES; index += 1) {
    els.goal
      .querySelectorAll(`.hang-part.s${index}`)
      .forEach((node) => node.classList.toggle("show", misses >= index));
  }

  const cardVisible = state.roundStatus === ROUND.LOST || state.roundStatus === ROUND.GIVEN_UP;
  els.redCard.classList.toggle("show", cardVisible);
}

function setBallAnim(name) {
  if (!els.ball) return;

  ["idle", "tap", "post", "kick"].forEach((className) => els.ball.classList.remove(className));
  void els.ball.offsetWidth;
  if (name) els.ball.classList.add(name);
}

function goalShake() {
  els.goal.classList.remove("shake");
  void els.goal.offsetWidth;
  els.goal.classList.add("shake");
  window.setTimeout(() => els.goal.classList.remove("shake"), 320);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function rebuildPool() {
  const selected = state.country;
  const pool = [];

  state.data.forEach((group) => {
    if (selected !== "ALL" && group.pais !== selected) return;
    group.equipos.forEach((name) => {
      pool.push({ pais: group.pais, nombre: name, chars: [...name] });
    });
  });

  state.pool = pool;
  state.bag = [];
  state.bagKey = selected;
}

function refillBag() {
  state.bag = shuffle(state.pool);

  if (state.bag.length > 1 && state.bag[0].nombre === state.previousTeamName) {
    [state.bag[0], state.bag[1]] = [state.bag[1], state.bag[0]];
  }
}

function pickWord() {
  if (!state.pool.length) return null;
  if (!state.bag.length || state.bagKey !== state.country) refillBag();

  const picked = state.bag.shift();
  state.previousTeamName = picked?.nombre ?? state.previousTeamName;
  return picked;
}

function setupMasked() {
  state.masked = state.current.chars.map((character) => ({
    character,
    shown: !/\p{L}/u.test(character)
  }));
  renderMasked();
}

function renderMasked() {
  els.masked.replaceChildren();

  let cluster = null;
  const ensureCluster = () => {
    if (cluster) return cluster;
    cluster = document.createElement("span");
    cluster.className = "word-cluster";
    els.masked.appendChild(cluster);
    return cluster;
  };

  state.masked.forEach((item) => {
    const isWhitespace = /\s/u.test(item.character);

    if (isWhitespace) {
      const spacer = document.createElement("span");
      spacer.className = "word-space";
      spacer.setAttribute("aria-hidden", "true");
      els.masked.appendChild(spacer);
      cluster = null;
      return;
    }

    const tile = document.createElement("span");
    const isLetter = /\p{L}/u.test(item.character);
    tile.className = `letter-slot${item.shown ? " revealed" : ""}${isLetter ? "" : " punctuation"}`;
    tile.textContent = item.shown ? item.character : "";
    ensureCluster().appendChild(tile);
  });

  const accessibleWord = state.masked
    .map((item) => (item.shown ? item.character : "_"))
    .join("");
  els.masked.setAttribute("aria-label", `${t("hiddenTeam")}: ${accessibleWord}`);
}

function reveal(letter) {
  let hits = 0;

  state.masked.forEach((item) => {
    if (
      !item.shown &&
      /\p{L}/u.test(item.character) &&
      normalizeLetter(item.character) === letter
    ) {
      item.shown = true;
      hits += 1;
    }
  });

  if (hits) renderMasked();
  return hits;
}

function revealAll() {
  state.masked.forEach((item) => {
    item.shown = true;
  });
  renderMasked();
}

function isSolved() {
  return state.masked.every((item) => item.shown);
}

function renderRoundControls() {
  const playing = state.roundStatus === ROUND.PLAYING;

  els.playActions.hidden = !playing;
  els.resultPanel.hidden = ![ROUND.WON, ROUND.LOST, ROUND.GIVEN_UP].includes(state.roundStatus);
  els.dataErrorPanel.hidden = state.roundStatus !== ROUND.ERROR;

  els.hint.disabled = !playing || state.lives <= 1;
  els.giveUp.disabled = !playing;
  setKeyboardEnabled(playing);
}

function renderResult() {
  const gained = Math.max(0, state.score - state.roundStartScore);
  els.roundPoints.textContent = gained;
  els.resultStreak.textContent = state.streak;

  if (state.roundStatus === ROUND.WON) {
    els.resultEyebrow.textContent = t("wonEyebrow");
    els.resultTitle.textContent = t("wonTitle");
    els.resultSummary.textContent = t("wonSummary", { team: state.current.nombre });
  } else if (state.roundStatus === ROUND.LOST) {
    els.resultEyebrow.textContent = t("lostEyebrow");
    els.resultTitle.textContent = t("lostTitle");
    els.resultSummary.textContent = t("lostSummary", { team: state.current.nombre });
  } else {
    els.resultEyebrow.textContent = t("gaveUpEyebrow");
    els.resultTitle.textContent = t("gaveUpTitle");
    els.resultSummary.textContent = t("gaveUpSummary", { team: state.current.nombre });
  }
}

function finishRound(status) {
  state.roundStatus = status;
  renderStats();
  updateGoalGraphics();
  renderRoundControls();
  renderResult();
  savePersist();
}

function useHint() {
  if (state.roundStatus !== ROUND.PLAYING) return;
  if (state.lives <= 1) {
    say(t("noMoreHints"));
    return;
  }

  const hidden = state.masked.filter((item) => !item.shown && /\p{L}/u.test(item.character));
  if (!hidden.length) {
    say(t("alreadyRevealed"));
    return;
  }

  const item = hidden[Math.floor(Math.random() * hidden.length)];
  const normalized = normalizeLetter(item.character);

  state.lives -= 1;
  state.guessed.add(normalized);
  markKey(item.character, true);
  reveal(normalized);

  renderStats();
  updateGoalGraphics();
  renderRoundControls();
  say(t("hintMessage"));
  sfx.good();
  setBallAnim("tap");

  if (isSolved()) handleWin();
}

function giveUp() {
  if (state.roundStatus !== ROUND.PLAYING || !state.current) return;

  state.lives = 0;
  state.streak = 0;
  revealAll();
  say(t("was", { team: state.current.nombre }));
  sfx.lose();
  finishRound(ROUND.GIVEN_UP);
}

function onGuess(rawCharacter) {
  if (state.roundStatus !== ROUND.PLAYING || !state.current) return;

  const character = normalizeLetter(rawCharacter);
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
  renderRoundControls();
  say(t("out"));
  speak(t("speechOut"));
  sfx.bad();
  goalShake();
  setBallAnim("post");

  if (state.lives <= 0) {
    state.streak = 0;
    revealAll();
    say(t("gameOver", { team: state.current.nombre }));
    sfx.lose();
    finishRound(ROUND.LOST);
  }
}

function handleWin() {
  if (state.roundStatus !== ROUND.PLAYING) return;

  state.score += 500 + state.lives * 50;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);

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

  finishRound(ROUND.WON);
}

function startRound() {
  if (!state.pool.length) {
    state.roundStatus = ROUND.ERROR;
    renderRoundControls();
    say(t("noTeams"));
    return;
  }

  state.roundStatus = ROUND.PLAYING;
  state.lives = MAX_LIVES;
  state.guessed.clear();
  state.roundStartScore = state.score;
  els.confetti.replaceChildren();
  els.redCard.classList.remove("show");

  resetKeyboard();
  state.current = pickWord();

  if (!state.current) {
    state.roundStatus = ROUND.ERROR;
    renderRoundControls();
    say(t("noTeams"));
    return;
  }

  setupMasked();
  renderStats();
  updateGoalGraphics();
  setBallAnim("idle");
  renderRoundControls();

  els.countryBadge.textContent = countryLabel(state.current.pais);
  say(t("rival", { country: countryLabel(state.current.pais) }));
}

function abandonRoundForFilterChange() {
  if (state.roundStatus === ROUND.PLAYING) {
    state.streak = 0;
    renderStats();
    savePersist();
  }
}

function onKeydown(event) {
  if (
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.target?.closest?.("button, select, input, textarea, [contenteditable='true']")
  ) {
    return;
  }

  if (state.roundStatus === ROUND.PLAYING && /^\p{L}$/u.test(event.key)) {
    event.preventDefault();
    onGuess(event.key);
    return;
  }

  if (
    event.key === "Enter" &&
    [ROUND.WON, ROUND.LOST, ROUND.GIVEN_UP].includes(state.roundStatus)
  ) {
    event.preventDefault();
    startRound();
  }
}

function validateTeamData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new TypeError("Team data must be a non-empty array.");
  }

  const seenCountries = new Set();

  return data.map((group, groupIndex) => {
    if (!group || typeof group !== "object") {
      throw new TypeError(`Invalid group at index ${groupIndex}.`);
    }

    const country = typeof group.pais === "string" ? group.pais.trim() : "";
    if (!country || seenCountries.has(country)) {
      throw new TypeError(`Invalid or duplicated country at index ${groupIndex}.`);
    }
    seenCountries.add(country);

    if (!Array.isArray(group.equipos) || group.equipos.length === 0) {
      throw new TypeError(`Country ${country} has no valid team list.`);
    }

    const seenTeams = new Set();
    const teams = group.equipos.map((team, teamIndex) => {
      const name = typeof team === "string" ? team.trim() : "";
      if (!name || name.length < 2 || seenTeams.has(name)) {
        throw new TypeError(`Invalid or duplicated team at ${country}:${teamIndex}.`);
      }
      seenTeams.add(name);
      return name;
    });

    return { pais: country, equipos: teams };
  });
}

async function loadData() {
  state.roundStatus = ROUND.LOADING;
  renderRoundControls();
  els.country.disabled = true;
  els.countryBadge.textContent = "—";
  say(t("loading"));

  try {
    const response = await fetch("teamlist.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    state.data = validateTeamData(await response.json());
    fillCountrySelect();
    rebuildPool();
    startRound();
  } catch (error) {
    console.warn(t("dataWarning"), error);
    state.data = [];
    state.pool = [];
    state.current = null;
    state.roundStatus = ROUND.ERROR;
    els.country.disabled = true;
    els.countryBadge.textContent = "—";
    renderRoundControls();
    say(t("dataWarning"));
  }
}

function fillCountrySelect() {
  const countries = Array.from(new Set(state.data.map((group) => group.pais)))
    .sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), I18N[state.language].locale));

  els.country.replaceChildren();

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

  if (state.country !== "ALL" && !countries.includes(state.country)) {
    state.country = "ALL";
  }

  els.country.value = state.country;
  els.country.disabled = false;
}

function applyLanguage(language, { persist = true } = {}) {
  if (!LANGUAGES.includes(language)) return;

  state.language = language;
  document.documentElement.lang = I18N[language].htmlLang;
  document.title = t("title");
  els.metaDescription?.setAttribute("content", t("description"));

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  els.languageSwitcher.setAttribute("aria-label", t("languageSwitcher"));
  els.audioControls.setAttribute("aria-label", t("audioControls"));
  els.scoreboard.setAttribute("aria-label", t("scoreboard"));
  els.matchPanel.setAttribute("aria-label", t("gameControls"));
  els.arena.setAttribute("aria-label", t("arenaLabel"));
  els.word.setAttribute("aria-label", t("hiddenTeam"));
  els.keyboard.setAttribute("aria-label", t("keyboard"));

  els.languageSwitcher.querySelectorAll(".segment").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (state.data.length) {
    fillCountrySelect();
    rebuildPool();
  }

  if (state.current) {
    els.countryBadge.textContent = countryLabel(state.current.pais);
    if (state.roundStatus === ROUND.PLAYING) {
      say(t("rival", { country: countryLabel(state.current.pais) }));
    }
    if ([ROUND.WON, ROUND.LOST, ROUND.GIVEN_UP].includes(state.roundStatus)) {
      renderResult();
    }
    renderMasked();
  }

  renderLives();
  renderAudioSettings();

  if (persist) savePersist();
}

function toggleSfx() {
  if (!audioSupported()) {
    say(t("sfxUnavailable"));
    return;
  }

  state.sfxEnabled = !state.sfxEnabled;
  renderAudioSettings();
  savePersist();
  if (state.sfxEnabled) sfx.good();
}

function toggleVoice() {
  if (!("speechSynthesis" in window)) {
    say(t("voiceUnavailable"));
    return;
  }

  state.voiceEnabled = !state.voiceEnabled;
  if (!state.voiceEnabled) window.speechSynthesis.cancel();
  renderAudioSettings();
  savePersist();
}

function bindEvents() {
  els.languageSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest(".segment");
    if (button) applyLanguage(button.dataset.lang);
  });

  els.country.addEventListener("change", () => {
    abandonRoundForFilterChange();
    state.country = els.country.value;
    savePersist();
    rebuildPool();
    startRound();
  });

  els.sfxToggle.addEventListener("click", toggleSfx);
  els.voiceToggle.addEventListener("click", toggleVoice);
  els.hint.addEventListener("click", useHint);
  els.giveUp.addEventListener("click", giveUp);
  els.nextGame.addEventListener("click", startRound);
  els.retryData.addEventListener("click", loadData);
  window.addEventListener("keydown", onKeydown);
}

(async function init() {
  loadPersist();
  buildKeyboard();
  bindEvents();
  applyLanguage(state.language, { persist: false });
  renderStats({ animate: false });
  renderRoundControls();
  renderAudioSettings();
  await loadData();
})();
