"use strict";

// Original synthesized cues. No samples, downloads or build step are required.
(function createAudioController(host) {
  const AudioContextClass = host.AudioContext || host.webkitAudioContext;
  const OfflineContextClass = host.OfflineAudioContext || host.webkitOfflineAudioContext;
  const MAX_SOURCES = 12;
  const MAX_EVENT_AGE_MS = 150;
  const FADE_SECONDS = 0.008;
  const cues = {
    correct: [[740, 0, 0.11, "triangle", 0.055], [1110, 0.025, 0.09, "sine", 0.018]],
    incorrect: [[170, 0, 0.14, "sine", 0.08], [360, 0, 0.065, "triangle", 0.025]],
    hint: [[620, 0, 0.09, "sine", 0.06], [830, 0.075, 0.10, "triangle", 0.045]],
    win: [[523.25, 0, 0.14, "triangle", 0.055], [659.25, 0.11, 0.14, "triangle", 0.055],
      [783.99, 0.22, 0.16, "triangle", 0.05], [1046.5, 0.34, 0.23, "sine", 0.06]],
    lose: [[392, 0, 0.16, "triangle", 0.05], [329.63, 0.13, 0.17, "sine", 0.065],
      [261.63, 0.27, 0.22, "sine", 0.065]]
  };
  let context = null;
  let resumeTask = null;
  let suspendTask = null;
  let sfxBus = null;
  let enabled = true;
  let paused = false;
  let generation = 0;
  let pending = null;
  let status = AudioContextClass ? "idle" : "unavailable";
  const sources = new Set();
  const musicSources = new Set();
  let musicEnabled = false;
  let musicRequested = false;
  let musicBuffer = null;
  let renderTask = null;
  let musicEntry = null;
  let musicBus = null;
  let musicStatus = AudioContextClass && OfflineContextClass ? "idle" : "unavailable";
  let speechActive = false;
  let speechDeadline = null;
  let terminalUntil = 0;
  const now = () => host.performance?.now() ?? Date.now();

  function setStatus(value) {
    if (status === value) return;
    status = value;
    try { controller.onStatusChange?.(); } catch { /* UI cannot break audio cleanup. */ }
  }

  function setMusicStatus(value) {
    if (musicStatus === value) return;
    musicStatus = value;
    try { controller.onStatusChange?.(); } catch { /* Optional UI feedback. */ }
  }

  // Original eight-bar 112 BPM score, under the project license.
  // Every voice reaches zero before the exact loop boundary: no truncated tails.
  function renderMusic() {
    const rate = 32000;
    const frames = Math.round(rate * 32 * 60 / 112);
    const offline = new OfflineContextClass(1, frames, rate);
    const beat = frames / rate / 32;
    const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
    function tone(midi, at, duration, peak, type = "sine", kick = false) {
      const oscillator = offline.createOscillator();
      const gain = offline.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(kick ? 125 : frequency(midi), at);
      if (kick) oscillator.frequency.exponentialRampToValueAtTime(48, at + duration);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(peak, at + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration - 0.008);
      gain.gain.linearRampToValueAtTime(0, at + duration);
      oscillator.connect(gain);
      gain.connect(offline.destination);
      oscillator.start(at);
      oscillator.stop(at + duration);
    }
    // A tiny deterministic noise buffer supplies soft hats/claps, never recordings.
    const noise = offline.createBuffer(1, 3200, rate);
    const samples = noise.getChannelData(0);
    let seed = 73;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      samples[i] = seed / 2147483648;
    }
    function percussion(at, clap) {
      const node = offline.createBufferSource();
      const filter = offline.createBiquadFilter();
      const gain = offline.createGain();
      const duration = clap ? 0.09 : 0.035;
      node.buffer = noise;
      filter.type = 'bandpass';
      filter.frequency.value = clap ? 1300 : 4200;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(clap ? 0.065 : 0.025, at + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration - 0.004);
      gain.gain.linearRampToValueAtTime(0, at + duration);
      node.connect(filter); filter.connect(gain); gain.connect(offline.destination);
      node.start(at); node.stop(at + duration);
    }
    const roots = [48, 45, 41, 43, 48, 45, 41, 43];
    const melody = [[72, 76, 79, 76], [72, 76, 81, 79], [77, 76, 72, 69], [71, 74, 79, 74],
      [76, 79, 84, 79], [81, 79, 76, 72], [77, 81, 79, 77], [74, 71, 67, 71]];
    roots.forEach((root, bar) => {
      const start = bar * 4 * beat;
      [0, 1.5, 2, 3.5].forEach((offset, i) =>
        tone(root + (i === 3 ? 7 : 0), start + offset * beat, beat * 0.4, 0.10, 'triangle'));
      [0.5, 1.25, 2.5, 3.25].forEach((offset, i) =>
        tone(melody[bar][i], start + offset * beat, beat * 0.45, 0.065, 'sine'));
      [0, 2].forEach(offset => tone(0, start + offset * beat, 0.14, 0.17, 'sine', true));
      [1, 3].forEach(offset => percussion(start + offset * beat, true));
      [0.5, 1.5, 2.5, 3.5].forEach(offset => percussion(start + offset * beat, false));
    });
    return offline.startRendering();
  }

  function stopMusic(fade = true) {
    musicRequested = false;
    [...musicSources].forEach(entry => stop(entry, fade));
    musicEntry = null;
    if (musicStatus !== "error" && musicStatus !== "unavailable") setMusicStatus("idle");
  }

  function updateMusicLevel() {
    if (!musicBus || context?.state !== "running") return;
    const time = context.currentTime;
    const param = musicBus.gain;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(time);
    else { param.cancelScheduledValues(time); param.setValueAtTime(param.value, time); }
    const ducked = speechActive || terminalUntil > time;
    param.linearRampToValueAtTime(ducked ? 0.075 : 0.28, time + 0.035);
    if (!speechActive && terminalUntil > time) {
      param.setValueAtTime(0.075, terminalUntil);
      param.linearRampToValueAtTime(0.28, terminalUntil + 0.18);
    }
  }

  function startMusicIfReady() {
    if (!musicRequested || !musicEnabled || paused || !musicBuffer || musicEntry || resumeTask ||
        context?.state !== "running" || musicStatus === "error") return;
    try {
      // Rapid off/on replaces the fading source instead of stacking loops.
      [...musicSources].forEach(entry => stop(entry, false));
      musicBus = musicBus || context.createGain();
      musicBus.disconnect();
      musicBus.connect(context.destination);
      updateMusicLevel();
      const oscillator = context.createBufferSource();
      const gain = context.createGain();
      const entry = { context, oscillator, gain, stopping: false, cleanupTimer: null };
      musicSources.add(entry);
      musicEntry = entry;
      oscillator.buffer = musicBuffer;
      oscillator.loop = true;
      oscillator.loopStart = 0;
      oscillator.loopEnd = musicBuffer.duration;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.04);
      oscillator.connect(gain); gain.connect(musicBus);
      oscillator.onended = () => dispose(entry);
      oscillator.start();
      setMusicStatus("playing");
    } catch {
      stopMusic(false);
      setMusicStatus("error");
      suspendIfIdle();
    }
  }

  function requestMusic() {
    if (!musicEnabled || paused || !OfflineContextClass || musicStatus === "error" ||
        musicStatus === "unavailable") return;
    musicRequested = true;
    if (musicBuffer) return;
    setMusicStatus("pending");
    if (renderTask) return;
    // Resume within the gesture before constructing the offline graph.
    renderTask = Promise.resolve().then(renderMusic).then(buffer => {
      musicBuffer = buffer;
      if (musicRequested && musicEnabled && !paused) {
        setMusicStatus(context?.state === "running" ? "idle" : "blocked");
        startMusicIfReady();
      }
    }, () => {
      stopMusic(false);
      setMusicStatus("error");
      suspendIfIdle();
    }).finally(() => { renderTask = null; });
  }

  function suspendIfIdle() {
    if (sources.size || musicSources.size || ((enabled || (musicEnabled && musicRequested)) && !paused) || context?.state !== "running") return;
    if (suspendTask) return;
    try {
      const task = Promise.resolve(context.suspend());
      suspendTask = task;
      task.catch(() => {}).finally(() => {
        if (suspendTask === task) suspendTask = null;
      });
    } catch { /* Optional audio. */ }
  }

  function dispose(entry) {
    host.clearTimeout(entry.cleanupTimer);
    entry.oscillator.onended = null;
    try { entry.oscillator.disconnect(); } catch { /* Already disconnected. */ }
    try { entry.gain.disconnect(); } catch { /* Already disconnected. */ }
    sources.delete(entry);
    musicSources.delete(entry);
    if (musicEntry === entry) musicEntry = null;
    suspendIfIdle();
  }

  function stop(entry, fade = true) {
    if (entry.stopping) { if (!fade) dispose(entry); return; }
    entry.stopping = true;
    const time = entry.context.currentTime;
    const duration = fade && entry.context.state === "running" ? FADE_SECONDS : 0;
    try {
      const param = entry.gain.gain;
      if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(time);
      else {
        const value = param.value;
        param.cancelScheduledValues(time);
        param.setValueAtTime(value, time);
      }
      param.linearRampToValueAtTime(0, time + duration);
      entry.oscillator.stop(time + duration);
    } catch { /* Teardown must also work after context failure. */ }
    if (!duration) dispose(entry);
    else {
      // A cleanup deadline also handles backends that never deliver onended.
      entry.cleanupTimer = host.setTimeout(() => dispose(entry), 30);
    }
  }

  function clear() {
    generation += 1;
    pending = null;
    terminalUntil = 0;
    updateMusicLevel();
    [...sources].forEach(entry => stop(entry));
  }

  function getContext() {
    if (context?.state === "closed") {
      [...sources].forEach(entry => stop(entry, false));
      [...musicSources].forEach(entry => stop(entry, false));
      musicBus = null;
      context = null;
      resumeTask = null;
      suspendTask = null;
      sfxBus = null;
    }
    if (context) return context;
    context = new AudioContextClass();
    const created = context;
    try {
      sfxBus = created.createGain();
      sfxBus.gain.value = 0.7;
      sfxBus.connect(created.destination);
    } catch (error) {
      try { Promise.resolve(created.close()).catch(() => {}); } catch { /* Optional audio. */ }
      context = null;
      sfxBus = null;
      throw error;
    }
    created.onstatechange = () => {
      if (context !== created) return;
      if (created.state === "running") {
        setStatus("ready");
        suspendIfIdle();
      } else {
        // A queued suspend followed by a gesture resume must retain the new cue.
        if (created.state !== "suspended" || !resumeTask) clear();
        // The audio clock is stopped, so don't wait for scheduled fade/end events.
        [...sources].forEach(dispose);
        if (created.state !== "suspended" || !resumeTask) stopMusic(false);
        else [...musicSources].forEach(entry => stop(entry, false));
        if (musicEnabled && musicStatus !== "error" && musicStatus !== "unavailable") {
          setMusicStatus(paused ? "idle" : "blocked");
        }
        setStatus(paused || !enabled ? "idle" : "blocked");
      }
    };
    return context;
  }

  function note(audioContext, noteData, start) {
    while (sources.size >= MAX_SOURCES) {
      const oldest = sources.values().next().value;
      stop(oldest, false);
    }
    const [frequency, offset, duration, type, peak] = noteData;
    const oscillator = audioContext.createOscillator();
    let gain;
    try { gain = audioContext.createGain(); }
    catch (error) { oscillator.disconnect(); throw error; }
    const entry = { context: audioContext, oscillator, gain, stopping: false, cleanupTimer: null };
    sources.add(entry);
    try {
      const time = start + offset;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.012);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      oscillator.connect(gain);
      gain.connect(sfxBus);
      oscillator.onended = () => dispose(entry);
      oscillator.start(time);
      oscillator.stop(time + duration);
    } catch (error) {
      stop(entry, false);
      throw error;
    }
  }

  function playPending(audioContext) {
    const event = pending;
    pending = null;
    if (!event || !enabled || paused || event.generation !== generation ||
        context !== audioContext || audioContext.state !== "running" ||
        now() - event.created > MAX_EVENT_AGE_MS) return;
    try {
      // The audio clock, not JS callback timing, owns the whole cue.
      const start = audioContext.currentTime + 0.005;
      if (event.kind === "win" || event.kind === "lose") {
        terminalUntil = start + 0.7;
        updateMusicLevel();
      }
      cues[event.kind].forEach(data => note(audioContext, data, start));
      setStatus("ready");
    } catch {
      clear();
      setStatus("error");
    }
  }

  function activate() {
    if (paused || !AudioContextClass || (!enabled && (!musicEnabled || !OfflineContextClass || musicStatus === "error"))) return;
    try {
      const audioContext = getContext();
      requestMusic();
      if (audioContext.state === "running" && !resumeTask && !suspendTask) {
        playPending(audioContext);
        startMusicIfReady();
        return;
      }
      if (resumeTask) return;
      setStatus("blocked");
      // Called synchronously from a handled pointer/keyboard action.
      const task = Promise.resolve(audioContext.resume());
      resumeTask = task;
      task.then(() => {
        if (context !== audioContext || resumeTask !== task) return;
        resumeTask = null;
        if (audioContext.state === "running") {
          setStatus(paused || !enabled ? "idle" : "ready");
          playPending(audioContext);
          startMusicIfReady();
          suspendIfIdle();
        } else {
          pending = null;
          stopMusic(false);
          if (musicEnabled && musicStatus !== "error") setMusicStatus("blocked");
          setStatus(paused || !enabled ? "idle" : "blocked");
        }
      }, () => {
        if (context !== audioContext || resumeTask !== task) return;
        pending = null;
        stopMusic(false);
        if (musicEnabled && musicStatus !== "error") setMusicStatus("blocked");
        setStatus(paused || !enabled ? "idle" : "blocked");
      }).finally(() => {
        if (resumeTask === task) resumeTask = null;
      });
    } catch {
      clear();
      stopMusic(false);
      setStatus("error");
      if (musicEnabled) setMusicStatus("error");
    }
  }

  function play(kind) {
    if (paused || !AudioContextClass || !Object.hasOwn(cues, kind)) return;
    if (enabled) {
      if (kind === "win" || kind === "lose") clear();
      else if (pending?.kind === "win" || pending?.kind === "lose") return;
      pending = { kind, created: now(), generation };
    }
    activate();
  }

  const controller = {
    onStatusChange: null,
    getStatus: () => status,
    supported: Boolean(AudioContextClass),
    musicSupported: Boolean(AudioContextClass && OfflineContextClass),
    getMusicStatus: () => musicStatus,
    activate,
    setMusicEnabled(value) {
      musicEnabled = Boolean(value);
      if (!musicEnabled) { stopMusic(); suspendIfIdle(); }
      // Loading a preference never unlocks or renders music.
    },
    setSpeechActive(value) {
      host.clearTimeout(speechDeadline);
      speechDeadline = null;
      speechActive = Boolean(value);
      updateMusicLevel();
      if (speechActive) {
        // Short game announcements must not leave music ducked if an event is lost.
        speechDeadline = host.setTimeout(() => controller.setSpeechActive(false), 8000);
      }
    },
    play,
    clear,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        clear();
        suspendIfIdle();
      }
    },
    setPaused(value) {
      paused = Boolean(value);
      if (paused) {
        stopMusic();
        controller.setSpeechActive(false);
        clear();
        suspendIfIdle();
      }
      // Becoming visible does not unlock or replay audio.
    }
  };
  host.AHORCABOL_AUDIO = controller;
})(window);
