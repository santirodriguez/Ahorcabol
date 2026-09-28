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
        frequency: parameter(), starts: [], stops: [], connected: false,
        connect() { this.connected = true; }, disconnect() { this.connected = false; },
        start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); },
        end() { this.onended?.(); }
      };
      nodes.push(node);
      return node;
    }
    createGain() {
      if (settings.gainThrows) throw Error('gain');
      return { gain: parameter(), connect() {}, disconnect() {} };
    }
  }
  const host = {
    performance: { now: () => clock },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  };
  if (!options.unsupported) host.AudioContext = Context;
  vm.runInNewContext(source, { window: host, Date });
  return {
    audio: host.AHORCABOL_AUDIO, contexts, nodes, resumes, suspends, timers, settings, state,
    advance(ms) { clock += ms; },
    cleanup() { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } },
    endAll() { nodes.forEach(node => node.end()); },
    live: () => nodes.filter(node => node.connected)
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
