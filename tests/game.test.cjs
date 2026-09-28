'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

// A minimal DOM boundary lets Node exercise the real runtime without a build
// step or third-party dependencies. It does not validate browser layout.
function game({ saved = null, data, storageBlocked = false, audioController, missingAudio = false, speech } = {}) {
  const elements = new Map();
  const timers = new Map();
  let timerId = 0;
  let persisted = saved;
  let reloads = 0;
  const document = { documentElement: {}, activeElement: null, title: '', hidden: false, listeners: {},
    addEventListener(name, callback) { this.listeners[name] = callback; } };
  class Element {
    constructor(tag = 'div') {
      this.tag = tag;
      this.children = [];
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.style = { setProperty() {} };
      this.hidden = false;
      this.disabled = false;
      this.textContent = '';
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach(n => classes.add(n)),
        remove: (...names) => names.forEach(n => classes.delete(n)),
        contains: n => classes.has(n),
        toggle: (n, force = !classes.has(n)) => force ? classes.add(n) : classes.delete(n)
      };
      Object.defineProperty(this, 'className', { set(value) { classes.clear(); value.split(' ').forEach(n => classes.add(n)); } });
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    appendChild(node) { this.children.push(node); node.parent = this; return node; }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    focus() { document.activeElement = this; }
    querySelectorAll(selector) {
      return this.children.flatMap(child => [
        ...(selector.startsWith('.') && child.classList.contains(selector.slice(1)) ? [child] : []),
        ...child.querySelectorAll(selector)
      ]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  document.getElementById = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  document.querySelector = () => new Element();
  document.querySelectorAll = () => [];
  document.createElement = tag => new Element(tag);
  document.createDocumentFragment = () => new Element();
  const window = {
    matchMedia: () => ({ matches: true }),
    setTimeout: callback => { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
    listeners: {},
    addEventListener(name, callback) { this.listeners[name] = callback; },
    location: { reload() { reloads++; } }
  };
  if (speech) window.speechSynthesis = speech;
  const context = vm.createContext({ window, document, SpeechSynthesisUtterance: function(text) { this.text = text; }, console: { warn() {} }, localStorage: {
    getItem() { if (storageBlocked) throw Error('blocked'); return persisted; },
    setItem(_key, value) { if (storageBlocked) throw Error('blocked'); persisted = value; }
  } });
  vm.runInContext(fs.readFileSync(path.join(root, 'teamlist.js'), 'utf8'), context);
  if (data !== undefined) window.AHORCABOL_TEAM_DATA = data;
  if (!missingAudio) vm.runInContext(fs.readFileSync(path.join(root, 'audio.js'), 'utf8'), context);
  if (audioController) window.AHORCABOL_AUDIO = audioController;
  vm.runInContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), context);
  const run = code => vm.runInContext(code, context);
  const state = run('state');
  return { run, state, elements, document, window, timers, persisted: () => persisted, reloads: () => reloads };
}
const clubs = [{ pais: 'Argentina', equipos: ['Boca', 'River', 'Vélez'] }];
const single = name => [{ pais: 'Argentina', equipos: [name] }];
const snapshot = (round = {}, values = {}) => JSON.stringify({
  version: 2, score: 100, streak: 1, bestStreak: 2, country: 'ALL',
  round: { team: 'Boca', teamCountry: 'Argentina', status: 'playing', lives: 5, guessed: ['B', 'Z'], roundStartScore: 0, ...round }, ...values
});

test('all bundled clubs are playable and each league has unique entries', () => {
  const g = game();
  assert.equal(g.state.data.length, 8);
  assert.equal(g.state.pool.length, 174);
  for (const team of g.state.pool) {
    g.state.current = team;
    g.state.guessed.clear();
    g.run('setupMasked();');
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ') g.run(`reveal('${letter}')`);
    assert.equal(g.run('isSolved()'), true, team.nombre);
  }
});

test('normalization preserves Ñ, composed accents and rejects unsupported input', () => {
  const g = game();
  for (const [input, expected] of [['ñ', 'Ñ'], ['n\u0303', 'Ñ'], ['ü', 'U'], ['ç', 'C'], ['é', 'E'], ['ø', ''], ['ß', ''], ['ArrowUp', ''], ['1', '']]) {
    assert.equal(g.run(`normalizeLetter(${JSON.stringify(input)})`), expected);
  }
});

test('correct repeated letters score once and a repeated guess costs nothing', () => {
  const g = game({ data: single('Banana') });
  g.run("onGuess('á')");
  assert.equal(g.state.score, 300);
  assert.equal(g.state.lives, 6);
  g.run("onGuess('A')");
  assert.equal(g.state.score, 300);
  g.run("onGuess('Z'); onGuess('Z')");
  assert.equal(g.state.lives, 5);
});

test('win awards one bonus and locks the round', () => {
  const g = game({ data: single('Boca') });
  g.run("['B','O','C','A'].forEach(onGuess); handleWin(); onGuess('Z')");
  assert.equal(g.state.score, 1200);
  assert.equal(g.state.streak, 1);
  assert.equal(g.state.bestStreak, 1);
  assert.equal(g.state.roundStatus, 'won');
  assert.equal(g.document.activeElement, g.elements.get('nextGameBtn'));
});

test('six misses lose; the answer is revealed and controls are locked', () => {
  const g = game({ data: single('Boca') });
  g.run("['D','E','F','G','H','I'].forEach(onGuess)");
  assert.equal(g.state.roundStatus, 'lost');
  assert.equal(g.state.lives, 0);
  assert.ok(g.state.masked.every(item => item.shown));
  assert.equal(g.elements.get('hintBtn').disabled, true);
});

test('hints cost one life, reveal all occurrences and never earn letter points', () => {
  const g = game({ data: single('AAA') });
  g.run('useHint()');
  assert.equal(g.state.lives, 5);
  assert.equal(g.state.score, 750);
  assert.equal(g.state.roundStatus, 'won');
});

test('hints cannot consume the last life', () => {
  const g = game({ data: single('Boca') });
  g.run("['D','E','F','G','H'].forEach(onGuess); useHint()");
  assert.equal(g.state.lives, 1);
  assert.equal(g.state.guessed.size, 5);
});

test('language changes preserve current team, score, guesses and bag order', () => {
  const g = game({ data: clubs });
  g.run("onGuess('E')");
  const before = JSON.stringify([g.state.current, g.state.score, [...g.state.guessed], g.state.bag]);
  for (const language of ['en-US', 'ca', 'es-AR']) g.run(`applyLanguage('${language}')`);
  assert.equal(JSON.stringify([g.state.current, g.state.score, [...g.state.guessed], g.state.bag]), before);
});

test('completed messages and keyboard labels are translated on language change', () => {
  const g = game({ data: single('Boca') });
  g.run("onGuess('B'); giveUp(); applyLanguage('en-US')");
  assert.equal(g.elements.get('toast').textContent, 'It was Boca.');
  const key = g.elements.get('keyboard').querySelectorAll('.key').find(k => k.dataset.key === 'B');
  assert.equal(key.attributes['aria-label'], 'B: Correct');
  assert.equal(key.disabled, true);
});

test('shuffle visits each club once and avoids immediate repeats across bags', () => {
  const g = game({ data: clubs });
  const names = [g.state.current.nombre];
  for (let i = 0; i < 2; i++) { g.run('giveUp(); startRound()'); names.push(g.state.current.nombre); }
  assert.equal(new Set(names).size, 3);
  const previous = g.state.current.nombre;
  g.run('giveUp(); startRound()');
  assert.notEqual(g.state.current.nombre, previous);
});

test('storage corruption and denied storage never prevent startup', () => {
  for (const saved of ['null', '[]', 'true', '1', '"text"', '{broken', '{"score":1.5,"streak":-1}']) {
    const g = game({ saved, data: clubs });
    assert.equal(g.state.roundStatus, 'playing');
    assert.equal(g.state.score, 0);
  }
  assert.equal(game({ data: clubs, storageBlocked: true }).state.roundStatus, 'playing');
});

test('old storage preserves valid statistics and preferences', () => {
  const g = game({ data: clubs, saved: JSON.stringify({ score: 500, streak: 2, bestStreak: 1, language: 'ca' }) });
  assert.equal(g.state.score, 500);
  assert.equal(g.state.bestStreak, 2);
  assert.equal(g.state.language, 'ca');
});

test('reload restores active round, hints, lives, points and used keys', () => {
  const first = game({ data: single('Banana') });
  first.run("onGuess('A'); onGuess('Z'); useHint()");
  const second = game({ data: single('Banana'), saved: first.persisted() });
  assert.equal(JSON.stringify(second.run('currentRoundSnapshot()')), JSON.stringify(first.run('currentRoundSnapshot()')));
  assert.equal(second.state.score, first.state.score);
  assert.equal(second.elements.get('keyboard').querySelectorAll('.used').length, first.state.guessed.size);
});

test('reload restores all terminal outcomes without granting points twice', () => {
  for (const action of ["['B','O','C','A'].forEach(onGuess)", "['D','E','F','G','H','I'].forEach(onGuess)", 'giveUp()']) {
    const first = game({ data: single('Boca') }); first.run(action);
    const second = game({ data: single('Boca'), saved: first.persisted() });
    assert.equal(second.state.roundStatus, first.state.roundStatus);
    assert.equal(second.state.score, first.state.score);
    assert.notEqual(second.elements.get('toast').textContent, 'Buscando rival…');
  }
});

test('invalid saved rounds are discarded instead of resuming an unwinnable game', () => {
  for (const round of [{ lives: 0 }, { lives: 6 }, { guessed: ['B', 'B'] }, { guessed: ['ArrowUp'] }, { guessed: [null] }, { guessed: ['B','O','C','A'] }, { team: 'Missing' }, { status: 'won' }, { status: 'lost', lives: 2 }, { roundStartScore: 1000 }]) {
    const g = game({ data: single('Boca'), saved: snapshot(round) });
    assert.equal(g.state.roundStatus, 'playing');
    assert.equal(g.state.lives, 6);
    assert.equal(g.state.guessed.size, 0);
  }
});

test('physical letters work with button focus but respect editing, shortcuts and composition', () => {
  const g = game({ data: single('Boca') });
  const event = (key, extra = {}) => ({ key, target: { closest: selector => selector === 'button, a, summary' ? {} : null }, preventDefault() {}, ...extra });
  g.run('onKeydown')(event('B'));
  assert.equal(g.state.score, 100);
  for (const extra of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true }, { isComposing: true }, { target: { isContentEditable: true } }, { target: { closest: () => ({}) } }]) g.run('onKeydown')(event('Z', extra));
  assert.equal(g.state.lives, 6);
});

test('Enter does not hijack a focused control; moving to next round clears effects', () => {
  const g = game({ data: single('Boca') });
  g.run('giveUp()');
  g.run('onKeydown')({ key: 'Enter', target: { closest: selector => selector === 'button, a, summary' ? {} : null }, preventDefault() {} });
  assert.equal(g.state.roundStatus, 'given-up');
  g.run('startRound()');
  assert.equal(g.run('effectTimers.size'), 0);
  assert.equal(g.state.roundStatus, 'playing');
});

test('changing league abandons the active round and persists the new selection', () => {
  const g = game({ data: [...clubs, { pais: 'MLS', equipos: ['Austin FC'] }], saved: JSON.stringify({ score: 400, streak: 3 }) });
  g.elements.get('countrySelect').value = 'MLS';
  g.elements.get('countrySelect').listeners.change();
  assert.equal(g.state.streak, 0);
  assert.equal(g.state.score, 400);
  assert.equal(JSON.parse(g.persisted()).round.team, 'Austin FC');
});

test('data errors disable play; retry reloads the missing script with the page', () => {
  const g = game({ data: [] });
  assert.equal(g.state.roundStatus, 'error');
  assert.equal(g.elements.get('countrySelect').disabled, true);
  g.elements.get('retryDataBtn').listeners.click();
  assert.equal(g.reloads(), 1);
});

test('catalog rejects duplicates, empty and unguessable names', () => {
  const g = game();
  for (const names of [['123'], ['øø'], ['Boca', 'boca'], ['Boca', 'Boca'], ['']]) {
    assert.throws(() => g.run('validateTeamData')([{ pais: 'Argentina', equipos: names }]));
  }
});

test('all three dictionaries cover the same keys and HTML translation hooks', () => {
  const g = game();
  const dictionaries = g.run('I18N');
  const keys = Object.keys(dictionaries['es-AR']).sort();
  for (const dictionary of Object.values(dictionaries)) assert.deepEqual(Object.keys(dictionary).sort(), keys);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(keys.includes(key), key);
  assert.match(html, /aria-label="Español"/);
  assert.doesNotMatch(html, /Español argentino/i);
});

test('voice controls reflect localized voices and preserve the saved preference', () => {
  const g = game({ saved: JSON.stringify({ voiceEnabled: true }) });
  g.run('voices = [{ lang: "en-US", localService: true }]; window.speechSynthesis = { cancel() {} }; applyLanguage("ca")');
  assert.equal(g.elements.get('voiceToggle').disabled, true);
  assert.equal(g.elements.get('voiceToggle').attributes['aria-pressed'], 'false');
  assert.equal(g.state.voiceEnabled, true);
  g.run('applyLanguage("en-US")');
  assert.equal(g.elements.get('voiceToggle').disabled, false);
  assert.equal(g.elements.get('voiceToggle').attributes['aria-pressed'], 'true');
});

test('language and audio settings during a data error preserve a pending saved round', () => {
  const g = game({ data: [], saved: snapshot() });
  g.run('applyLanguage("ca")');
  assert.deepEqual(JSON.parse(g.persisted()).round, JSON.parse(snapshot()).round);
});

test('local language flags keep the selected countries and contain complete artwork', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /data-lang="es-AR"[\s\S]*?src="assets\/branding\/argentina.svg"/);
  assert.match(html, /data-lang="en-US"[\s\S]*?src="assets\/branding\/usa.svg"/);
  assert.match(html, /data-lang="ca"[\s\S]*?src="assets\/branding\/senyera.svg"/);
  const usa = fs.readFileSync(path.join(root, 'assets/branding/usa.svg'), 'utf8');
  assert.equal((usa.match(/<polygon /g) || []).length, 50);
  assert.match(usa, /viewBox="0 0 190 100"/);
  const argentina = fs.readFileSync(path.join(root, 'assets/branding/argentina.svg'), 'utf8');
  assert.equal((argentina.match(/<polygon /g) || []).length, 32);
});

function audioSpy() {
  const calls = [];
  return { calls, supported: true, status: 'idle', getStatus() { return this.status; },
    play(kind) { calls.push(kind); }, clear() { calls.push('clear'); },
    setEnabled(value) { calls.push(`enabled:${value}`); },
    setPaused(value) { calls.push(`paused:${value}`); },
    setSpeechActive(value) { calls.push(`speech:${value}`); } };
}

test('guesses play one semantic cue and terminal guesses never double up', () => {
  const audio = audioSpy();
  const g = game({ data: single('AB'), audioController: audio });
  audio.calls.length = 0;
  g.run("onGuess('A'); onGuess('A'); onGuess('Z'); onGuess('B')");
  assert.deepEqual(audio.calls.filter(c => !c.startsWith('speech:')), ['correct', 'incorrect', 'win']);
  assert.equal(g.state.score, 950);
  const losing = game({ data: single('AB'), audioController: audio });
  audio.calls.length = 0;
  losing.run("state.lives = 1; onGuess('Z')");
  assert.deepEqual(audio.calls, ['speech:false', 'lose']);
  assert.equal(losing.state.roundStatus, 'lost');
});

test('hints have their own cue and a solving hint plays only the win cue', () => {
  const audio = audioSpy();
  const g = game({ data: single('AB'), audioController: audio });
  audio.calls.length = 0;
  g.run('useHint(); useHint()');
  assert.deepEqual(audio.calls, ['hint', 'win']);
  assert.equal(g.state.lives, 4);
  assert.equal(g.state.score, 700);
});

test('missing optional audio preserves intent and leaves the game playable', () => {
  const g = game({ data: single('AA'), missingAudio: true, saved: JSON.stringify({ sfxEnabled: true }) });
  assert.equal(g.state.sfxEnabled, true);
  assert.equal(g.elements.get('sfxToggle').disabled, true);
  g.run("onGuess('A')");
  assert.equal(g.state.roundStatus, 'won');
  assert.equal(JSON.parse(g.persisted()).sfxEnabled, true);
});

test('blocked audio is visible without discarding the saved preference', () => {
  const audio = audioSpy();
  const g = game({ audioController: audio });
  audio.status = 'blocked';
  audio.onStatusChange();
  assert.equal(g.elements.get('audioStatus').hidden, false);
  assert.equal(g.elements.get('sfxToggle').classList.contains('active'), false);
  assert.equal(g.elements.get('sfxToggle').attributes['aria-pressed'], 'true');
  assert.equal(g.state.sfxEnabled, true);
  audio.status = 'ready';
  audio.onStatusChange();
  assert.equal(g.elements.get('audioStatus').hidden, true);
  assert.equal(g.elements.get('sfxToggle').classList.contains('active'), true);
});

test('lifecycle cancels speech and pauses audio without replay on return', () => {
  const audio = audioSpy();
  let cancellations = 0;
  const g = game({ audioController: audio, speech: { getVoices: () => [], cancel() { cancellations++; } } });
  audio.calls.length = 0;
  cancellations = 0;
  g.document.hidden = true;
  g.document.listeners.visibilitychange();
  g.window.listeners.pagehide();
  g.document.hidden = false;
  g.window.listeners.pageshow();
  g.document.listeners.visibilitychange();
  assert.deepEqual(audio.calls, ['paused:true', 'speech:false', 'paused:true', 'speech:false', 'paused:false', 'paused:false']);
  assert.equal(cancellations, 2);
  audio.calls.length = 0;
  g.run('startRound()');
  assert.ok(audio.calls.includes('clear'));
  assert.ok(!audio.calls.includes('correct'));
});

test('superseded speech callbacks cannot change the new utterance or survive give-up', () => {
  const audio = audioSpy();
  const utterances = [];
  const g = game({ data: single('ABC'), audioController: audio, saved: JSON.stringify({ voiceEnabled: true }),
    speech: { getVoices: () => [{ lang: 'es-AR', localService: true }], cancel() {}, speak(u) { utterances.push(u); } } });
  g.run("onGuess('A'); onGuess('B')");
  assert.equal(utterances.length, 2);
  audio.calls.length = 0;
  utterances[1].onstart();
  utterances[0].onend();
  assert.deepEqual(audio.calls, ['speech:true']);
  g.run('giveUp()');
  utterances[1].onstart();
  utterances[1].onend();
  assert.deepEqual(audio.calls, ['speech:true', 'speech:false', 'lose']);
});
