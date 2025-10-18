"use strict";

/* ================= normalización: ignora acentos (A≈Á, Ñ≈N, etc.) ================= */
const normalize = (str) =>
  str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .replace(/[^A-Z]/g, "");         // solo letras base

const normalizeChar = (ch) => normalize(ch).slice(0,1);

/* Teclado (incluye Ñ visual, pero al comparar Ñ≈N) */
const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

/* ====== Fallback completo si falla el fetch del JSON ====== */
const FULL_FALLBACK = [
  {
    "pais": "Argentina",
    "equipos": [
      "Argentinos Juniors","Atlético Tucumán","Banfield","Barracas Central","Belgrano","Boca Juniors",
      "Central Córdoba (Sgo. del Estero)","Defensa y Justicia","Deportivo Riestra","Estudiantes de La Plata",
      "Gimnasia y Esgrima La Plata","Godoy Cruz","Huracán","Independiente","Independiente Rivadavia",
      "Instituto de Córdoba","Lanús","Newell’s Old Boys","Platense","Racing","River Plate","Rosario Central",
      "San Lorenzo","San Martín de San Juan","Sarmiento","Talleres de Córdoba","Tigre","Unión de Santa Fe",
      "Vélez Sarsfield"
    ]
  },
  {
    "pais": "España",
    "equipos": [
      "Alavés","Athletic (de Bilbao)","Atlético de Madrid","Barcelona","Celta de Vigo","Elche",
      "Espanyol (de Barcelona)","Getafe","Girona","Levante","Mallorca","Osasuna","Rayo Vallecano",
      "Real Betis","Real Madrid","Real Oviedo","Real Sociedad","Sevilla","Valencia","Villarreal"
    ]
  },
  {
    "pais": "Inglaterra",
    "equipos": [
      "Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace",
      "Everton","Fulham","Leeds","Liverpool","Manchester City","Manchester United","Newcastle",
      "Nottingham Forest","Sunderland","Tottenham","West Ham","Wolverhampton"
    ]
  },
  {
    "pais": "Alemania",
    "equipos": [
      "Augsburg","Union Berlín","Werder Bremen","Borussia Dortmund","Eintracht Frankfurt","Freiburg","Hamburgo",
      "Heidenheim","Hoffenheim","Colonia","RB Leipzig","Bayer Leverkusen","Mainx","Borussia Mönchengladbach",
      "Bayern Múnich","St. Pauli","Stuttgart","Wolfsburgo"
    ]
  },
  {
    "pais": "Francia",
    "equipos": [
      "París Saint-Germain","Marsella","Estrasburgo","Lyon","Mónaco","Lens","Lille","Brest","Niza","Nantes",
      "Rennes","Lorient","Le Havre","Auxerre","Metz","Angers"
    ]
  },
  {
    "pais": "Portugal",
    "equipos": [
      "Porto","Sporting de Lisboa","Benfica","Braga","Gil Vicente","Moreirense","Famalicão","Vitória Guimarães",
      "Nacional","Alverca","Arouca","Río Ave","Santa Clara","Casa Pia","Estrela","Estoril","Tondela","AVS"
    ]
  },
  {
    "pais": "Brasil",
    "equipos": [
      "Flamengo","Palmeiras","Bragantino","Fluminense","Ceará","Cruzeiro","Corinthians","Bahía","Internacional",
      "Botafogo","San Pablo","Vasco da Gama","Juventud","Mirassol","Fortaleza","Atlético Mineiro","Vitória",
      "Gremio","Santos","Sport Recife"
    ]
  }
];

/* ====== Estado ====== */
const state = {
  data: [],            // [{pais, equipos:[...]}]
  pool: [],            // [{pais, nombre, normalized, chars[]}]
  current: null,
  masked: [],
  guessed: new Set(),
  lives: 6,
  score: 0,
  streak: 0
};

/* ====== Elementos ====== */
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
  ball: null,
  netRect: null
};

/* ====== Audio & Voz ====== */
let audioCtx;
function beep(freq=880, dur=0.08, type="square", vol=0.03){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol; o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }catch{}
}
const sfx = {
  good(){ beep(940, .06, "square", .05); },
  bad(){ beep(240, .10, "sawtooth", .06); },
  win(){ [880,990,1180].forEach((f,i)=>setTimeout(()=>beep(f,.10,"triangle",.06), i*120)); },
  lose(){ [300,220,180].forEach((f,i)=>setTimeout(()=>beep(f,.14,"sawtooth",.07), i*140)); }
};

// SpeechSynthesis (opcional)
let voices = [];
function setupVoices(){ try{ voices = window.speechSynthesis.getVoices(); }catch{} }
if("speechSynthesis" in window){
  setupVoices();
  window.speechSynthesis.onvoiceschanged = setupVoices;
}
function speak(text){
  try{
    if(!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find(v => /es(-|_)?(AR|ES|MX|CL|UY)?/i.test(v.lang)) || voices[0];
    if(v) u.voice = v;
    u.rate = 0.95; u.pitch = 0.95; u.volume = 1;
    window.speechSynthesis.cancel();  // evita superposición si ya estaba hablando
    window.speechSynthesis.speak(u);
  }catch{}
}

/* ====== Confetti ====== */
const FORTIN = 1905;           // guiño inocuo
const FORTIN_BLUE = "#0038a8"; // azul Vélez
function throwConfetti(){
  els.confetti.innerHTML = "";
  const colors = ["#22c55e","#16a34a","#34d399","#86efac","#facc15","#fb7185","#60a5fa"];
  // confetti base
  for(let i=0;i<140;i++){
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = (Math.random()*96+2)+"%";
    d.style.top = (Math.random()*10)+"%";
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDelay = (Math.random()*0.4)+"s";
    d.style.transform = `translateY(-${Math.random()*60}px) rotate(${Math.random()*180}deg)`;
    els.confetti.appendChild(d);
  }
  // guiño: 3 papeles azules extra (Vélez)
  for(let k=0;k<3;k++){
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = (Math.random()*96+2)+"%";
    d.style.top = (Math.random()*10)+"%";
    d.style.background = FORTIN_BLUE;
    d.style.animationDelay = (Math.random()*0.4)+"s";
    d.style.transform = `translateY(-${Math.random()*60}px) rotate(${Math.random()*180}deg)`;
    els.confetti.appendChild(d);
  }
  setTimeout(()=>els.confetti.innerHTML="", 2200 + (FORTIN % 5)); // (1905%5==0) → sin efecto
}

/* ====== UI helpers ====== */
let toastTimer=null;
function say(msg){
  els.toast.textContent = msg;
  els.toast.style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> els.toast.style.opacity = 0, 1600);
}
function loadPersist(){
  try{
    const saved = JSON.parse(localStorage.getItem("ahorcabol")||"{}");
    if(Number.isFinite(saved.score)) state.score = saved.score;
    if(Number.isFinite(saved.streak)) state.streak = saved.streak;
  }catch{}
}
function savePersist(){
  localStorage.setItem("ahorcabol", JSON.stringify({score:state.score, streak:state.streak}));
}
function renderStats(){
  bump(els.score, state.score);
  bump(els.streak, state.streak);
  bump(els.lives, state.lives);
}
function bump(el, val){
  el.textContent = val;
  el.classList.remove("bump");
  void el.offsetWidth; // reflow para reiniciar anim
  el.classList.add("bump");
}

/* ====== Teclado virtual ====== */
function buildKeyboard(){
  els.keyboard.innerHTML = "";
  KB_ROWS.forEach(row=>{
    [...row].forEach(ch=>{
      const b = document.createElement("button");
      b.className = "key";
      b.textContent = ch;
      b.dataset.k = ch;
      b.addEventListener("click", ()=> onGuess(ch));
      els.keyboard.appendChild(b);
    });
  });
}
function markKey(ch, good){
  const k = [...els.keyboard.querySelectorAll(".key")].find(k=>k.dataset.k===ch);
  if(!k) return;
  k.classList.add("used");
  k.classList.add(good ? "good" : "bad");
}

/* ====== Arco según vidas ====== */
function updateGoalGraphics(){
  const misses = 6 - state.lives; // 0..6
  for(let i=1;i<=6;i++){
    els.goal.querySelectorAll(`.s${i}`).forEach(n=>{
      n.classList.toggle("show", misses>=i);
    });
  }
  els.redCard.classList.toggle("show", state.lives<=0);
}

/* ====== Animaciones pelota ====== */
function setBallAnim(name){ // 'idle'|'tap'|'post'|'kick'|null
  const cls = ["idle","tap","post","kick"];
  cls.forEach(c => els.ball.classList.remove(c));
  void els.ball.offsetWidth;         // reset de anim
  if(name) els.ball.classList.add(name);
}
function goalShake(){ els.goal.classList.add("shake"); setTimeout(()=>els.goal.classList.remove("shake"), 320); }

/* ====== Pool & palabra ====== */
function rebuildPool(){
  const selected = els.country.value;
  const pool = [];
  for(const group of state.data){
    if(selected!=="TODOS" && group.pais!==selected) continue;
    for(const name of group.equipos){
      const normalized = normalize(name);
      const chars = [...name];
      pool.push({ pais: group.pais, nombre: name, normalized, chars });
    }
  }
  state.pool = pool;
}
function pickWord(){
  if(!state.pool.length){ say("No hay equipos en este filtro"); return null; }
  const idx = Math.floor(Math.random()*state.pool.length);
  return state.pool[idx];
}
function setupMasked(){
  const tiles = [];
  for(const ch of state.current.chars){
    if(/\p{L}/u.test(ch)){
      tiles.push({char:ch, shown:false});
    }else{
      tiles.push({char:ch, shown:true});
    }
  }
  state.masked = tiles;
  renderMasked();
}
function renderMasked(){
  els.masked.innerHTML = "";
  for(const t of state.masked){
    const div = document.createElement("div");
    const isSpace = t.char===" " || t.char==="\u00A0";
    div.className = "tile " + (t.shown ? "revealed" : "") + (isSpace ? " space":"");
    div.textContent = t.shown ? t.char : "—";
    els.masked.appendChild(div);
  }
}
function reveal(letter){
  let hits = 0;
  for(const t of state.masked){
    if(!t.shown && /\p{L}/u.test(t.char)){
      if(normalizeChar(t.char) === letter){
        t.shown = true;
        hits++;
      }
    }
  }
  if(hits>0) renderMasked();
  return hits;
}
function isSolved(){ return state.masked.every(t => t.shown); }

/* ====== Pista ====== */
function useHint(){
  if(state.lives<=1){ say("No da para más pistas…"); return; }
  const hiddenIdxs = state.masked
    .map((t,i)=>({t,i}))
    .filter(o => !o.t.shown && /\p{L}/u.test(o.t.char));
  if(!hiddenIdxs.length){ say("¡Ya está todo revelado!"); return; }
  const pick = hiddenIdxs[Math.floor(Math.random()*hiddenIdxs.length)];
  const n = normalizeChar(pick.t.char);
  state.lives--; renderStats(); updateGoalGraphics();
  markKey(pick.t.char.toUpperCase()==="Ñ" ? "Ñ" : n, true);
  state.guessed.add(n);     // para que no sume puntos si luego la tocan
  reveal(n);
  say("Te tiro una bocha…");
  sfx.good();
  setBallAnim("tap");
  if(isSolved()) handleWin();
}

/* ====== Rendir ====== */
function giveUp(){
  state.lives = 0; renderStats(); updateGoalGraphics();
  for(const t of state.masked){ t.shown = true; }
  renderMasked();
  say(`Era: ${state.current.nombre}`);
  sfx.lose();
  state.streak = 0;
  savePersist();
}

/* ====== Guess ====== */
function onGuess(rawCh){
  const ch = normalizeChar(rawCh);
  if(!ch) return;
  if(state.guessed.has(ch)) return;
  state.guessed.add(ch);

  const keyLabel = rawCh.toUpperCase();
  const hits = reveal(ch);

  if(hits>0){
    markKey(keyLabel, true);
    state.score += 100 * hits;
    renderStats();
    say("¡Goool!");
    speak("¡Gooooool!");
    sfx.good();
    setBallAnim("tap");
    if(isSolved()){
      handleWin();
    }
  }else{
    markKey(keyLabel, false);
    state.lives--;
    renderStats();
    updateGoalGraphics();
    say("¡Fuera!");
    speak("¡Fuera!");
    sfx.bad();
    goalShake();
    setBallAnim("post");
    if(state.lives<=0){
      say(`Game over. Era: ${state.current.nombre}`);
      sfx.lose();
      state.streak = 0;
      for(const t of state.masked){ t.shown = true; }
      renderMasked();
      savePersist();
    }
  }
}

/* ====== Win ====== */
function handleWin(){
  say("¡GOLAZO! 🎉");
  speak("¡GOLAZO!");
  sfx.win();
  throwConfetti();
  setBallAnim("kick");
  if(els.netRect){
    els.netRect.classList.remove("ripple"); void els.netRect.offsetWidth; els.netRect.classList.add("ripple");
  }
  state.score += 500 + state.lives*50;
  state.streak += 1;
  renderStats();
  savePersist();
}

/* ====== Teclado físico ====== */
function onKeydown(e){
  const k = e.key;
  if(/^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ]$/.test(k)){
    onGuess(k);
  }else if(k==="Enter"){
    newGame();
  }
}

/* ====== Nuevo partido ====== */
function newGame(){
  state.lives = 6;
  state.guessed.clear();
  renderStats();
  els.keyboard.querySelectorAll(".key").forEach(k=>k.classList.remove("used","good","bad"));
  updateGoalGraphics();
  setBallAnim("idle");
  state.current = pickWord();
  if(!state.current) return;
  setupMasked();
  say(`Rival: ${state.current.pais}`);
}

/* ====== Cargar datos ====== */
async function loadData(){
  try{
    const r = await fetch("teamlist.json", {cache:"no-cache"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if(!Array.isArray(j)) throw new Error("Formato inesperado");
    state.data = j;
  }catch(err){
    console.warn("No se pudo leer teamlist.json. Usando fallback completo.", err);
    state.data = FULL_FALLBACK;  // incluye los 7 países
  }
}

/* ====== Países → select (TODOS + todos los del JSON, orden alfabético) ====== */
function fillCountrySelect(){
  const countries = Array.from(new Set(state.data.map(d=>d.pais))).sort((a,b)=>a.localeCompare(b,"es"));
  const currentValue = els.country.value || "TODOS";
  els.country.innerHTML =
    `<option value="TODOS">Todos</option>` +
    countries.map(p=>`<option value="${p}">${p}</option>`).join("");
  if(currentValue && (currentValue==="TODOS" || countries.includes(currentValue))){
    els.country.value = currentValue;
  }
}

/* ====== INIT ====== */
(async function init(){
  loadPersist();
  renderStats();
  buildKeyboard();
  await loadData();                 // carga JSON o fallback completo
  els.ball = document.getElementById("ball");
  els.netRect = document.querySelector(".net-rect");
  fillCountrySelect();              // verás Argentina, España, Inglaterra, Alemania, Francia, Portugal, Brasil
  rebuildPool();
  newGame();

  els.country.addEventListener("change", ()=>{ rebuildPool(); newGame(); });
  els.newGame.addEventListener("click", newGame);
  els.hint.addEventListener("click", useHint);
  els.giveUp.addEventListener("click", giveUp);
  window.addEventListener("keydown", onKeydown);
})();
