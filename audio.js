"use strict";

// Original synthesized cues. No samples, downloads or build step are required.
(function createAudioController(host) {
  const AudioContextClass = host.AudioContext || host.webkitAudioContext;
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
  const now = () => host.performance?.now() ?? Date.now();

  function setStatus(value) {
    if (status === value) return;
    status = value;
    try { controller.onStatusChange?.(); } catch { /* UI cannot break audio cleanup. */ }
  }

  function suspendIfIdle() {
    if (sources.size || (enabled && !paused) || context?.state !== "running") return;
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
    suspendIfIdle();
  }

  function stop(entry, fade = true) {
    if (entry.stopping) return;
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
    [...sources].forEach(entry => stop(entry));
  }

  function getContext() {
    if (context?.state === "closed") {
      [...sources].forEach(entry => stop(entry, false));
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
        setStatus(paused || !enabled ? "idle" : "blocked");
      }
    };
    return context;
  }

  function note(audioContext, noteData, start) {
    while (sources.size >= MAX_SOURCES) {
      const oldest = sources.values().next().value;
      stop(oldest, false);
      dispose(oldest);
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
      cues[event.kind].forEach(data => note(audioContext, data, start));
      setStatus("ready");
    } catch {
      clear();
      setStatus("error");
    }
  }

  function play(kind) {
    if (!enabled || paused || !AudioContextClass || !Object.hasOwn(cues, kind)) return;
    if (kind === "win" || kind === "lose") clear();
    else if (pending?.kind === "win" || pending?.kind === "lose") return;
    pending = { kind, created: now(), generation };
    try {
      const audioContext = getContext();
      if (audioContext.state === "running" && !resumeTask && !suspendTask) {
        playPending(audioContext);
        return;
      }
      if (resumeTask) return;
      setStatus("blocked");
      // Called directly from a handled pointer/keyboard action, before any await.
      const task = Promise.resolve(audioContext.resume());
      resumeTask = task;
      task.then(() => {
        if (context !== audioContext || resumeTask !== task) return;
        if (audioContext.state === "running") {
          setStatus(paused || !enabled ? "idle" : "ready");
          playPending(audioContext);
          suspendIfIdle();
        } else {
          pending = null;
          setStatus(paused || !enabled ? "idle" : "blocked");
        }
      }, () => {
        if (context !== audioContext || resumeTask !== task) return;
        pending = null;
        setStatus(paused || !enabled ? "idle" : "blocked");
      }).finally(() => {
        if (resumeTask === task) resumeTask = null;
      });
    } catch {
      clear();
      setStatus("error");
    }
  }

  const controller = {
    onStatusChange: null,
    getStatus: () => status,
    supported: Boolean(AudioContextClass),
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
        clear();
        suspendIfIdle();
      }
      // Becoming visible does not unlock or replay audio.
    }
  };
  host.AHORCABOL_AUDIO = controller;
})(window);
