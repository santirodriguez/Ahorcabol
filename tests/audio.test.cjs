'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'audio.js'), 'utf8');
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

// A controlled clock/backend tests lifecycle races, not browser audio quality.
function fixture(options = {}) {
  let clock = 0;
  let timerId = 0;
  const timers = new Map();
  const contexts = [];
  const nodes = [];
  const gains = [];
  const renders = [];
  const offlineContexts = [];
  const resumes = [];
  const suspends = [];
  const settings = { initial: 'running', ...options };
  const parameter = () => ({
    value: 0, events: [],
    setValueAtTime(value, at) { this.value = value; this.events.push(['set', value, at]); },
    linearRampToValueAtTime(value, at) { this.events.push(['linear', value, at]); },
    exponentialRampToValueAtTime(value, at) { this.events.push(['exponential', value, at]); },
    cancelAndHoldAtTime(at) { this.events.push(['hold', at]); },
    cancelScheduledValues(at) { this.events.push(['cancel', at]); }
  });
  function state(context, value) { context.state = value; context.onstatechange?.(); }
  class Context {
    constructor() {
      if (settings.constructorThrows) throw Error('constructor');
      this.state = settings.initial;
      this.currentTime = 10;
      this.destination = {};
      this.resumeCalls = 0;
      this.suspendCalls = 0;
      contexts.push(this);
    }
    resume() {
      this.resumeCalls++;
      if (settings.resumeThrows) throw Error('resume');
      if (settings.rejectResume) return Promise.reject(Error('blocked'));
      if (settings.deferResume) return new Promise((resolve, reject) => {
        resumes.push({ resolve: () => { state(this, 'running'); resolve(); }, reject });
      });
      state(this, 'running');
      return Promise.resolve();
    }
    suspend() {
      this.suspendCalls++;
      if (settings.deferSuspend) return new Promise(resolve => suspends.push(() => { state(this, 'suspended'); resolve(); }));
      state(this, 'suspended');
      return Promise.resolve();
    }
    close() { state(this, 'closed'); return Promise.resolve(); }
    createOscillator() {
      if (settings.oscillatorThrows) throw Error('oscillator');
      const node = {
        context: this, frequency: parameter(), starts: [], stops: [], connected: false,
        connect() { this.connected = true; }, disconnect() { this.connected = false; },
        start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); },
        end() { this.onended?.(); }
      };
      nodes.push(node);
      return node;
    }
    createGain() {
      if (settings.gainThrows) throw Error('gain');
      const gain = { context: this, gain: parameter(), connect() {}, disconnect() {} };
      gains.push(gain);
      return gain;
    }
  }
  Context.prototype.createBufferSource = function() {
    if (settings.bufferSourceThrows && !this.offline) throw Error('buffer source');
    return this.createOscillator();
  };
  class OfflineContext extends Context {
    constructor(channels, frames, rate) {
      super(); contexts.pop();
      this.offline = true;
      this.frames = frames; this.rate = rate; this.channels = channels;
      offlineContexts.push(this);
      if (settings.offlineThrows) throw Error('offline');
    }
    createBuffer(channels, frames, rate) {
      const samples = new Float32Array(frames);
      return { duration: frames / rate, length: frames, numberOfChannels: channels, getChannelData: () => samples };
    }
    createBiquadFilter() { return { frequency: parameter(), Q: parameter(), connect() {} }; }
    startRendering() {
      const buffer = this.createBuffer(this.channels, this.frames, this.rate);
      if (settings.rejectRender) return Promise.reject(Error('render'));
      if (settings.deferRender) return new Promise((resolve, reject) => renders.push({ resolve: () => resolve(buffer), reject }));
      return Promise.resolve(buffer);
    }
  }
  const host = {
    performance: { now: () => clock },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  };
  if (!options.unsupported) host.AudioContext = Context;
  if (!options.noOffline) host.OfflineAudioContext = OfflineContext;
  vm.runInNewContext(source, { window: host, Date });
  return {
    audio: host.AHORCABOL_AUDIO, contexts, nodes, gains, renders, offlineContexts, resumes, suspends, timers, settings, state,
    advance(ms) { clock += ms; },
    cleanup() { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } },
    endAll() { nodes.forEach(node => node.end()); },
    live: () => nodes.filter(node => node.connected && !node.context.offline)
  };
}

test('idle/settings changes never create a context; unsupported audio is a no-op', () => {
  const f = fixture();
  f.audio.setEnabled(false); f.audio.setEnabled(true); f.audio.setPaused(true); f.audio.setPaused(false);
  assert.equal(f.contexts.length, 0);
  assert.equal(f.audio.getStatus(), 'idle');
  const missing = fixture({ unsupported: true });
  missing.audio.play('win');
  assert.equal(missing.audio.supported, false);
  assert.equal(missing.audio.getStatus(), 'unavailable');
  assert.equal(missing.nodes.length, 0);
});

test('one context schedules a whole fanfare on the audio clock, without musical timers', () => {
  const f = fixture();
  f.audio.play('win');
  assert.equal(f.contexts.length, 1);
  assert.equal(f.nodes.length, 4);
  assert.equal(f.timers.size, 0);
  assert.deepEqual(f.nodes.map(node => Number((node.starts[0] - 10).toFixed(3))), [0.005, 0.115, 0.225, 0.345]);
  f.endAll(); f.audio.play('hint');
  assert.equal(f.contexts.length, 1);
  assert.equal(f.nodes.length, 6);
});

test('mute cancels future fanfare notes; off/on cannot resurrect them', () => {
  const f = fixture();
  f.audio.play('lose');
  const old = [...f.nodes];
  f.audio.setEnabled(false);
  for (const node of old) assert.equal(node.stops.at(-1), 10.008);
  f.audio.setEnabled(true); f.audio.play('correct'); f.cleanup();
  assert.ok(old.every(node => !node.connected));
  assert.equal(f.live().length, 2);
  assert.equal(f.nodes.length, 5);
});

test('muting releases nodes and suspends hardware even if onended never arrives', async () => {
  const f = fixture();
  f.audio.play('correct'); f.audio.setEnabled(false); f.cleanup(); await flush();
  assert.equal(f.live().length, 0);
  assert.equal(f.timers.size, 0);
  assert.equal(f.contexts[0].state, 'suspended');
});

test('clear invalidates pending resume before a different round', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true });
  f.audio.play('win'); f.audio.clear(); f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 0);
});

test('delayed resume drops old events and coalesces pending requests', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true });
  for (let i = 0; i < 100; i++) f.audio.play('correct');
  assert.equal(f.contexts[0].resumeCalls, 1);
  f.advance(151); f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 0);
  f.audio.play('incorrect');
  assert.equal(f.nodes.length, 2);
});

test('terminal cue wins over pending ordinary feedback', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true });
  f.audio.play('correct'); f.audio.play('win'); f.audio.play('incorrect');
  f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 4);
  assert.equal(f.nodes[0].frequency.value, 523.25);
});

test('rejected resume is recoverable on a later action without replaying the old cue', async () => {
  const f = fixture({ initial: 'suspended', rejectResume: true });
  f.audio.play('win'); await flush();
  assert.equal(f.audio.getStatus(), 'blocked');
  assert.equal(f.nodes.length, 0);
  f.settings.rejectResume = false;
  f.audio.play('hint'); await flush();
  assert.equal(f.nodes.length, 2);
  assert.equal(f.nodes[0].frequency.value, 620);
  assert.equal(f.audio.getStatus(), 'ready');
});

test('hidden pages cancel active/pending sound and visible pages do not autoplay', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true });
  f.audio.play('win'); f.audio.setPaused(true); f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 0);
  assert.equal(f.contexts[0].state, 'suspended');
  f.audio.setPaused(false); await flush();
  assert.equal(f.nodes.length, 0);
  f.settings.deferResume = false; f.audio.play('correct'); await flush();
  assert.equal(f.nodes.length, 2);
  f.audio.setPaused(true); f.cleanup(); await flush();
  assert.equal(f.live().length, 0);
});

test('pending mute/off/on resumes only the newest cue', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true });
  f.audio.play('win'); f.audio.setEnabled(false); f.audio.setEnabled(true); f.audio.play('hint');
  f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 2);
  assert.equal(f.nodes[0].frequency.value, 620);
});

test('a queued suspend followed by a new gesture does not discard that gesture', async () => {
  const f = fixture({ deferSuspend: true, deferResume: true });
  f.audio.play('correct'); f.endAll(); f.audio.setEnabled(false);
  f.audio.setEnabled(true); f.audio.play('hint');
  f.suspends[0](); f.resumes[0].resolve(); await flush();
  assert.equal(f.nodes.length, 4);
  assert.equal(f.nodes[2].frequency.value, 620);
});

test('interruptions clear stale nodes and can recover; a closed context is recreated', async () => {
  const f = fixture();
  f.audio.play('win'); f.state(f.contexts[0], 'interrupted');
  assert.equal(f.live().length, 0);
  assert.equal(f.audio.getStatus(), 'blocked');
  f.audio.play('hint'); await flush();
  assert.equal(f.live().length, 2);
  f.state(f.contexts[0], 'closed'); f.audio.play('correct');
  assert.equal(f.contexts.length, 2);
  assert.equal(f.live().length, 2);
});

test('constructor, graph and synchronous resume failures are contained and retryable', async () => {
  for (const key of ['constructorThrows', 'gainThrows', 'oscillatorThrows', 'resumeThrows']) {
    const f = fixture({ [key]: true, initial: key === 'resumeThrows' ? 'suspended' : 'running' });
    assert.doesNotThrow(() => f.audio.play('win'));
    assert.equal(f.audio.getStatus(), 'error', key);
    f.settings[key] = false; f.audio.play('hint'); await flush();
    assert.equal(f.audio.getStatus(), 'ready', key);
    assert.equal(f.live().length, 2, key);
  }
});

test('rapid input and repeated round transitions have bounded nodes and teardown timers', () => {
  const f = fixture();
  for (let i = 0; i < 200; i++) {
    f.audio.play(i % 5 ? 'correct' : 'win');
    assert.ok(f.live().length <= 12);
    assert.ok(f.timers.size <= 12);
  }
  f.audio.clear(); f.cleanup(); f.endAll();
  assert.equal(f.live().length, 0);
  assert.equal(f.timers.size, 0);
  assert.equal(f.contexts.length, 1);
});

test('unknown cues and disabled/paused play do not allocate nodes', () => {
  const f = fixture();
  f.audio.play('toString'); f.audio.setEnabled(false); f.audio.play('win');
  f.audio.setEnabled(true); f.audio.setPaused(true); f.audio.play('win');
  assert.equal(f.contexts.length, 0);
});

test('music stays silent and unrendered at load, then caches one exact mono loop', async () => {
  const f = fixture();
  f.audio.setMusicEnabled(true);
  await flush();
  assert.equal(f.contexts.length, 0);
  assert.equal(f.offlineContexts.length, 0);
  f.audio.activate(); await flush();
  assert.equal(f.audio.getMusicStatus(), 'playing');
  assert.equal(f.contexts.length, 1);
  assert.equal(f.offlineContexts.length, 1);
  const loop = f.live().find(n => n.loop);
  assert.equal(loop.buffer.numberOfChannels, 1);
  assert.equal(loop.buffer.length, Math.round(32000 * 32 * 60 / 112));
  assert.ok(loop.buffer.length * 4 < 4 * 1024 * 1024);
  assert.equal(loop.loopEnd, loop.buffer.duration);
  for (let i = 0; i < 30; i++) { f.audio.clear(); f.audio.activate(); }
  assert.equal(f.live().filter(n => n.loop).length, 1);
  assert.equal(f.offlineContexts.length, 1);
  assert.equal(f.timers.size, 0);
  assert.equal(f.live().find(n => n.loop), loop);
});

test('unresolved render ON/OFF/ON uses one render and starts only the latest intent', async () => {
  const f = fixture({ deferRender: true });
  f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
  assert.equal(f.audio.getMusicStatus(), 'pending');
  f.audio.setMusicEnabled(false); f.audio.setMusicEnabled(true); f.audio.activate();
  assert.equal(f.renders.length, 1);
  f.renders[0].resolve(); await flush();
  assert.equal(f.live().filter(n => n.loop).length, 1);
  f.audio.setMusicEnabled(false); f.audio.setMusicEnabled(true); f.audio.activate();
  await flush(); f.cleanup();
  assert.equal(f.live().filter(n => n.loop).length, 1);
  assert.equal(f.offlineContexts.length, 1);
});

test('render completion after off or hide never starts music on its own', async () => {
  for (const cancel of [a => a.setMusicEnabled(false), a => a.setPaused(true)]) {
    const f = fixture({ deferRender: true });
    f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
    cancel(f.audio); f.renders[0].resolve(); await flush();
    f.audio.setPaused(false); await flush();
    assert.equal(f.live().filter(n => n.loop).length, 0);
    assert.equal(f.audio.getMusicStatus(), 'idle');
    f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
    assert.equal(f.live().filter(n => n.loop).length, 1);
    assert.equal(f.offlineContexts.length, 1);
  }
});

test('music and effects are independent and all-off suspends after bounded cleanup', async () => {
  const f = fixture();
  f.audio.setEnabled(false); f.audio.setMusicEnabled(true);
  f.audio.play('correct'); await flush();
  assert.equal(f.live().length, 1);
  assert.equal(f.live()[0].loop, true);
  f.audio.setEnabled(true); f.audio.play('hint');
  assert.equal(f.live().length, 3);
  f.audio.setEnabled(false); f.cleanup();
  assert.equal(f.live().length, 1);
  assert.equal(f.contexts[0].state, 'running');
  f.audio.setMusicEnabled(false); f.cleanup(); await flush();
  assert.equal(f.live().length, 0);
  assert.equal(f.contexts[0].state, 'suspended');
});

test('music failures do not break effects or repeatedly render a broken backend', async () => {
  for (const settings of [{ noOffline: true }, { offlineThrows: true }, { rejectRender: true }, { bufferSourceThrows: true }]) {
    const f = fixture(settings);
    f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
    assert.ok(['error', 'unavailable'].includes(f.audio.getMusicStatus()));
    f.audio.play('correct'); await flush();
    assert.equal(f.live().length, 2);
    assert.equal(f.audio.getStatus(), 'ready');
    assert.ok(f.offlineContexts.length <= 1);
  }
});

test('music respects rejected resume and interruption until another eligible gesture', async () => {
  const f = fixture({ initial: 'suspended', rejectResume: true });
  f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
  assert.equal(f.live().length, 0);
  f.settings.rejectResume = false;
  f.audio.activate(); await flush();
  assert.equal(f.live().length, 1);
  f.state(f.contexts[0], 'interrupted');
  assert.equal(f.live().length, 0);
  f.state(f.contexts[0], 'running'); await flush();
  assert.equal(f.live().length, 0);
  f.audio.activate(); await flush();
  assert.equal(f.live().length, 1);
  assert.equal(f.offlineContexts.length, 1);
});

test('speech and terminal ducking restore the mix without restarting the loop', async () => {
  const f = fixture();
  f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
  const loop = f.live()[0];
  const bus = f.gains.find(g => !g.context.offline && g.gain.events.some(e => e[1] === 0.28));
  f.audio.setSpeechActive(true);
  assert.equal(bus.gain.events.at(-1)[1], 0.075);
  f.audio.play('win');
  assert.equal(bus.gain.events.at(-1)[1], 0.075);
  f.audio.setSpeechActive(false);
  assert.equal(bus.gain.events.at(-1)[1], 0.28);
  f.audio.clear(); f.cleanup();
  f.audio.setSpeechActive(true); f.cleanup();
  assert.equal(bus.gain.events.at(-1)[1], 0.28);
  assert.equal(f.timers.size, 0);
  assert.equal(f.live().find(n => n.loop), loop);
});

test('five simulated minutes of playback and toggles retain one buffer and bounded sources', async () => {
  const f = fixture();
  f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
  const buffer = f.live()[0].buffer;
  for (let second = 0; second < 300; second++) {
    f.advance(1000); f.contexts[0].currentTime++;
    if (second % 5 === 0) { f.audio.setMusicEnabled(false); f.audio.setMusicEnabled(true); f.audio.activate(); }
    if (second % 7 === 0) { f.audio.setPaused(true); f.cleanup(); f.audio.setPaused(false); f.audio.activate(); }
    await flush(); f.cleanup();
    assert.equal(f.live().length, 1);
    assert.equal(f.live()[0].buffer, buffer);
    assert.equal(f.timers.size, 0);
  }
  assert.equal(f.contexts.length, 1);
  assert.equal(f.offlineContexts.length, 1);
  f.audio.setPaused(true); f.cleanup(); await flush();
  assert.equal(f.live().length, 0);
  assert.equal(f.contexts[0].state, 'suspended');
});

test('render finishing before a delayed unlock cannot bypass pause or context invalidation', async () => {
  const f = fixture({ initial: 'suspended', deferResume: true, deferRender: true });
  f.audio.setMusicEnabled(true); f.audio.activate(); await flush();
  f.renders[0].resolve(); await flush();
  assert.equal(f.live().length, 0);
  f.audio.setPaused(true); f.resumes[0].resolve(); await flush();
  assert.equal(f.live().length, 0);
  f.audio.setPaused(false); f.audio.activate();
  f.resumes[1].resolve(); await flush();
  assert.equal(f.live().length, 1);
  const buffer = f.live()[0].buffer;
  f.state(f.contexts[0], 'closed');
  assert.equal(f.live().length, 0);
  f.audio.activate(); f.resumes[2].resolve(); await flush();
  assert.equal(f.live().length, 1);
  assert.equal(f.live()[0].buffer, buffer);
  assert.equal(f.offlineContexts.length, 1);
});
