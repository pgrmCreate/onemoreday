// ============ Moteur audio — tout est synthétisé via Web Audio API ============
// La BANQUE DE SONS : chaque lieu a sa scène sonore (js/data/soundscapes.js) —
// un lit continu (vent + drones), des bruits ponctuels qui surgissent au hasard
// (corbeau, ferraille, gémissement au bout du couloir…), et un motif musical
// génératif, rare, propre à l'endroit. La nuit a ses propres bruits.
// Interface stable : playAmbiance, startCombatMusic, stopCombatMusic, sfx, setMuted.
import { G, estNuit } from './state.js';
import { CARTE_SCENE, SCENES_LEGACY, SCENES_SONORES } from './data/soundscapes.js';

let ctx = null;
let master = null;
let ambNodes = [];
let stingerTimer = null;
let musiqueTimer = null;
let combatTimer = null;
let heartbeatTimer = null;
let muted = localStorage.getItem('omd_muted') === '1';
let volume = parseFloat(localStorage.getItem('omd_volume') || '0.6');
let ambianceCourante = null; // 'scene:j' | 'scene:n'
let echo = null;             // delay partagé (musique, sons lointains)

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
    // L'écho du monde vide : un delay discret pour la musique et les sons lointains.
    echo = ctx.createDelay(1.2);
    echo.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const wet = ctx.createGain(); wet.gain.value = 0.3;
    echo.connect(fb); fb.connect(echo);
    echo.connect(wet); wet.connect(master);
  } catch (e) { console.warn('Audio indisponible', e); }
}
export function audioPret() { return !!ctx; }
export function isMuted() { return muted; }
export function setMuted(b) {
  muted = b; localStorage.setItem('omd_muted', b ? '1' : '0');
  if (master) master.gain.linearRampToValueAtTime(b ? 0 : volume, ctx.currentTime + 0.2);
}
export function getVolume() { return volume; }
export function setVolume(v) {
  volume = v; localStorage.setItem('omd_volume', String(v));
  if (master && !muted) master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
}

function noiseBuffer(dur = 2) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { // bruit "brun" : vent
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

function stopAmbiance() {
  ambNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
  ambNodes = [];
  if (stingerTimer) { clearTimeout(stingerTimer); stingerTimer = null; }
  if (musiqueTimer) { clearTimeout(musiqueTimer); musiqueTimer = null; }
}

// ---------- Scène sonore d'un lieu ----------
// Accepte un id de carte (int_hotel…), un type hérité (calme/rue/sombre/train)
// ou directement un id de scène sonore.
function resoudreScene(id) {
  const sid = CARTE_SCENE[id] || SCENES_LEGACY[id] || (SCENES_SONORES[id] ? id : 'interieur');
  return sid;
}

export function playAmbiance(id) {
  if (!ctx) return;
  const sid = resoudreScene(id);
  const nuit = !!(G && estNuit());
  const cle = sid + (nuit ? ':n' : ':j');
  if (ambianceCourante === cle) return;
  ambianceCourante = cle;
  stopAmbiance();
  const sc = SCENES_SONORES[sid];
  if (!sc) return;

  const g = ctx.createGain(); g.gain.value = 0;
  g.connect(master);
  g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
  ambNodes.push(g);

  // Vent — toutes les scènes en ont un, plus ou moins fort.
  const [vf, vg, vlfo] = sc.vent;
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuffer(4); wind.loop = true;
  const wfil = ctx.createBiquadFilter(); wfil.type = 'lowpass'; wfil.frequency.value = vf;
  const wgain = ctx.createGain(); wgain.gain.value = vg * (nuit ? 0.85 : 1);
  wind.connect(wfil); wfil.connect(wgain); wgain.connect(g);
  wind.start();
  ambNodes.push(wind);
  const lfo = ctx.createOscillator(); lfo.frequency.value = vlfo;
  const lfoG = ctx.createGain(); lfoG.gain.value = sc.rail ? 120 : 160;
  lfo.connect(lfoG); lfoG.connect(wfil.frequency);
  lfo.start();
  ambNodes.push(lfo);

  // Drones graves — la nuit les tire d'un demi-ton vers le bas, imperceptiblement plus lourd.
  sc.drones.forEach(([f, type, gain], i) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = nuit ? f * 0.972 : f;
    o.detune.value = i * 6;
    const og = ctx.createGain(); og.gain.value = gain * (nuit ? 1.15 : 1);
    o.connect(og); og.connect(g);
    o.start();
    ambNodes.push(o);
  });

  // Train : rythme des rails (clac-clac régulier)
  if (sc.rail) {
    const railG = ctx.createGain(); railG.gain.value = 0.0; railG.connect(g);
    ambNodes.push(railG);
    const railOsc = ctx.createOscillator(); railOsc.type = 'square'; railOsc.frequency.value = 38;
    railOsc.connect(railG); railOsc.start();
    ambNodes.push(railOsc);
    const railLfo = ctx.createOscillator(); railLfo.type = 'square'; railLfo.frequency.value = 2.1;
    const railLfoG = ctx.createGain(); railLfoG.gain.value = 0.05;
    railLfo.connect(railLfoG); railLfoG.connect(railG.gain);
    railLfo.start();
    ambNodes.push(railLfo);
  }

  // Bruits ponctuels : le monde respire, grince, appelle.
  planifierStinger(sc, nuit, cle);
  // Et parfois, la musique du lieu se lève.
  planifierMusique(sc, cle);
}

function poolStingers(sc, nuit) {
  const pool = [...(sc.stingers || [])];
  if (nuit) pool.push(...(sc.stingersNuit || []));
  return pool;
}

function planifierStinger(sc, nuit, cle) {
  const [mn, mx] = sc.intervalle || [9, 22];
  const delai = (mn + Math.random() * (mx - mn)) * 1000;
  stingerTimer = setTimeout(() => {
    if (ambianceCourante !== cle || !ctx) return;
    const pool = poolStingers(sc, nuit);
    const total = pool.reduce((s, [, p]) => s + p, 0);
    let t = Math.random() * total;
    for (const [nom, p] of pool) { t -= p; if (t <= 0) { jouerStinger(nom); break; } }
    planifierStinger(sc, nuit, cle);
  }, delai);
}

// ---------- Musique générative : quelques notes, puis le silence ----------
const RACINES = [1, 1.5, 0.75]; // tonique, quinte, quarte basse — la phrase se promène
function planifierMusique(sc, cle) {
  const m = sc.musique;
  if (!m) return;
  musiqueTimer = setTimeout(() => {
    if (ambianceCourante !== cle || !ctx) return;
    if (Math.random() < m.p) jouerMotif(m);
    planifierMusique(sc, cle);
  }, 16000 + Math.random() * 26000);
}

function jouerMotif(m) {
  const t0 = ctx.currentTime + 0.1;
  const racine = m.base * RACINES[Math.floor(Math.random() * RACINES.length)];
  const nNotes = 3 + Math.floor(Math.random() * 4);
  let t = t0;
  let deg = Math.floor(Math.random() * m.gamme.length);
  for (let i = 0; i < nNotes; i++) {
    // la mélodie marche par pas, avec un saut de temps en temps
    deg = Math.max(0, Math.min(m.gamme.length - 1, deg + (Math.random() < 0.3 ? 2 : 1) * (Math.random() < 0.5 ? -1 : 1)));
    const oct = Math.random() < 0.3 ? 4 : 2;
    const f = racine * Math.pow(2, m.gamme[deg] / 12) * oct;
    const dur = (m.doux ? 1.1 : 0.85) + Math.random() * 0.7;
    const o = ctx.createOscillator(); o.type = m.timbre || 'sine'; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = 7;
    const og = ctx.createGain();
    const peak = m.doux ? 0.045 : 0.038;
    og.gain.setValueAtTime(0.0001, t);
    og.gain.linearRampToValueAtTime(peak, t + 0.25);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(og); o2.connect(og);
    og.connect(master); og.connect(echo);
    o.start(t); o.stop(t + dur + 0.05);
    o2.start(t); o2.stop(t + dur + 0.05);
    t += dur * (0.55 + Math.random() * 0.4);
  }
}

// ---------- Les bruits ponctuels (stingers) ----------
function env(gn, t, a, peak, dur) {
  gn.gain.setValueAtTime(0.0001, t);
  gn.gain.linearRampToValueAtTime(peak, t + a);
  gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function burstAt(t, dur, fType, fFreq, peak, q = 1, versEcho = false) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur + 0.1);
  const f = ctx.createBiquadFilter(); f.type = fType; f.frequency.value = fFreq; f.Q.value = q;
  const gn = ctx.createGain(); env(gn, t, 0.005, peak, dur);
  s.connect(f); f.connect(gn); gn.connect(master);
  if (versEcho) gn.connect(echo);
  s.start(t); s.stop(t + dur + 0.1);
}
function tonAt(t, f0, f1, dur, type, peak, opts = {}) {
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency[opts.lin ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'](Math.max(1, f1), t + dur);
  const gn = ctx.createGain(); env(gn, t, opts.a || 0.01, peak, dur);
  let tete = o;
  if (opts.filtre) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.filtre; f.Q.value = opts.q || 1;
    o.connect(f); tete = f;
  }
  tete.connect(gn); gn.connect(master);
  if (opts.echo) gn.connect(echo);
  if (opts.vib) {
    const lfo = ctx.createOscillator(); lfo.frequency.value = opts.vib;
    const lg = ctx.createGain(); lg.gain.value = opts.vibAmp || 12;
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.1);
  }
  o.start(t); o.stop(t + dur + 0.1);
}

// Chaque nom de la banque → sa recette de synthèse. Tous discrets : ce sont
// des bruits d'ambiance, pas des jump scares (le gain reste bas).
const STINGERS = {
  craquement(t) { tonAt(t, 90 + Math.random() * 60, 55, 0.16, 'square', 0.05, { filtre: 320, a: 0.004 }); burstAt(t + 0.02, 0.08, 'lowpass', 500, 0.05); },
  grattement(t) { for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) burstAt(t + i * (0.09 + Math.random() * 0.05), 0.05, 'highpass', 2600, 0.035); },
  gemissement(t) { tonAt(t, 110 + Math.random() * 30, 70, 1.6, 'sawtooth', 0.045, { filtre: 260, q: 3, a: 0.5, vib: 6, vibAmp: 9, echo: true }); },
  corbeau(t) {
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const tt = t + i * 0.24;
      tonAt(tt, 620 + Math.random() * 120, 380, 0.14, 'square', 0.05, { filtre: 1600, q: 2, a: 0.01, echo: true });
      burstAt(tt, 0.1, 'bandpass', 1500, 0.04, 4);
    }
  },
  volet(t) { burstAt(t, 0.12, 'lowpass', 320, 0.16); burstAt(t + 0.16, 0.07, 'lowpass', 420, 0.08); },
  verre(t) { [0, 0.07, 0.18].forEach((dt, i) => tonAt(t + dt, 2200 + i * 700 + Math.random() * 400, 1800, 0.12, 'sine', 0.035, { a: 0.002 })); },
  ferraille(t) {
    [0, 0.1, 0.26, 0.4].forEach((dt, i) => burstAt(t + dt, 0.09, 'bandpass', 900 - i * 140, 0.07 - i * 0.012, 5, true));
  },
  goutte(t) { tonAt(t, 1400 + Math.random() * 600, 700, 0.09, 'sine', 0.05, { a: 0.002, echo: true }); },
  vent_rafale(t) { burstAt(t, 2.2, 'lowpass', 600, 0.12); },
  chien(t) { [0, 0.3].forEach(dt => tonAt(t + dt, 330, 240, 0.16, 'square', 0.028, { filtre: 700, q: 2, a: 0.015, echo: true })); },
  cloche_morte(t) {
    [1, 2.76, 5.4].forEach((h, i) => tonAt(t, 196 * h, 196 * h, 3.2 - i * 0.7, 'sine', 0.035 / (i + 1), { a: 0.005, echo: true }));
  },
  neon(t) { for (let i = 0; i < 4; i++) burstAt(t + i * (0.06 + Math.random() * 0.09), 0.04, 'highpass', 4200, 0.025); },
  radio_statique(t) { burstAt(t, 0.5, 'highpass', 1800, 0.04); tonAt(t + 0.55, 900, 900, 0.05, 'sine', 0.02, {}); },
  pigeons(t) { for (let i = 0; i < 7; i++) burstAt(t + i * 0.05, 0.035, 'bandpass', 600 + (i % 2) * 300, 0.04, 3); },
  pages(t) { for (let i = 0; i < 3; i++) burstAt(t + i * 0.13, 0.07, 'highpass', 3200, 0.022); },
  mouches(t) { tonAt(t, 190, 230, 1.8, 'sawtooth', 0.014, { filtre: 600, a: 0.6, vib: 22, vibAmp: 28 }); },
  hibou(t) { [0, 0.45].forEach(dt => tonAt(t + dt, 350, 320, 0.32, 'sine', 0.035, { a: 0.05, vib: 5, vibAmp: 6, echo: true })); },
  chariot(t) { burstAt(t, 0.7, 'bandpass', 700, 0.035, 4); tonAt(t + 0.3, 1200, 900, 0.12, 'sine', 0.02, {}); },
  feu_crepite(t) { for (let i = 0; i < 3; i++) burstAt(t + Math.random() * 0.7, 0.03, 'highpass', 2400, 0.03); },
  murmures(t) { tonAt(t, 160, 140, 1.4, 'sawtooth', 0.012, { filtre: 380, q: 6, a: 0.5, vib: 3.5, vibAmp: 30, echo: true }); },
  rapace(t) { tonAt(t, 1150, 700, 0.7, 'sine', 0.03, { a: 0.04, echo: true }); },
  train_loin(t) { tonAt(t, 60, 52, 2.4, 'triangle', 0.035, { a: 0.8, filtre: 200 }); burstAt(t + 0.5, 1.2, 'bandpass', 320, 0.025, 3, true); },
};

function jouerStinger(nom) {
  const fn = STINGERS[nom];
  if (fn) fn(ctx.currentTime + 0.02);
}

// ---------- Musique de combat : pulsation + nappes dissonantes ----------
export function startCombatMusic() {
  if (!ctx || combatTimer) return;
  let beat = 0;
  const bpmMs = 430;
  combatTimer = setInterval(() => {
    if (!ctx) return;
    const t = ctx.currentTime;
    // grosse caisse
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(og); og.connect(master);
    o.start(t); o.stop(t + 0.25);
    // nappe dissonante un temps sur quatre
    if (beat % 4 === 2) {
      const d = ctx.createOscillator(); d.type = 'sawtooth';
      d.frequency.value = beat % 8 === 2 ? 92.5 : 98;
      const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 500;
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0.001, t); dg.gain.linearRampToValueAtTime(0.07, t + 0.1);
      dg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      d.connect(df); df.connect(dg); dg.connect(master);
      d.start(t); d.stop(t + 0.9);
    }
    beat++;
  }, bpmMs);
}
export function stopCombatMusic() {
  if (combatTimer) { clearInterval(combatTimer); combatTimer = null; }
}

// ---------- Battement de cœur (PV bas) ----------
export function setHeartbeat(on) {
  if (!ctx) return;
  if (on && !heartbeatTimer) {
    heartbeatTimer = setInterval(() => {
      const t = ctx.currentTime;
      [0, 0.22].forEach((dt, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = i ? 48 : 55;
        const g = ctx.createGain();
        g.gain.setValueAtTime(i ? 0.22 : 0.3, t + dt);
        g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.16);
        o.connect(g); g.connect(master);
        o.start(t + dt); o.stop(t + dt + 0.2);
      });
    }, 1100);
  } else if (!on && heartbeatTimer) {
    clearInterval(heartbeatTimer); heartbeatTimer = null;
  }
}

// ---------- Effets sonores ----------
export function sfx(nom) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const burst = (dur, fType, fFreq, peak) => burstAt(t, dur, fType, fFreq, peak);
  switch (nom) {
    case 'clic': {
      tonAt(t, 900, 900, 0.05, 'square', 0.06, { a: 0.002 });
      break;
    }
    case 'pas': burstAt(t, 0.05, 'lowpass', 360, 0.09); break;
    case 'coup': burst(0.12, 'lowpass', 900, 0.5); break;
    case 'coup_critique': {
      burst(0.2, 'lowpass', 600, 0.65);
      tonAt(t, 220, 60, 0.25, 'sine', 0.3, {});
      break;
    }
    case 'puissance_charge': {
      tonAt(t, 70, 240, 0.85, 'sawtooth', 0.07, { filtre: 600, a: 0.1, lin: true });
      break;
    }
    case 'puissance': {
      burst(0.3, 'lowpass', 420, 0.8);
      tonAt(t, 180, 40, 0.4, 'sine', 0.4, {});
      burstAt(t + 0.06, 0.16, 'bandpass', 1100, 0.18, 3);
      break;
    }
    case 'esquive': {
      const s = ctx.createBufferSource(); s.buffer = noiseBuffer(0.4);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
      f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.22);
      const gn = ctx.createGain(); env(gn, t, 0.01, 0.22, 0.26);
      s.connect(f); f.connect(gn); gn.connect(master);
      s.start(t); s.stop(t + 0.3);
      break;
    }
    case 'alerte': {
      tonAt(t, 1180, 1180, 0.07, 'square', 0.09, { a: 0.003 });
      tonAt(t + 0.09, 1480, 1480, 0.09, 'square', 0.09, { a: 0.003 });
      break;
    }
    case 'rate': burst(0.1, 'highpass', 2200, 0.12); break;
    case 'degats': { // le joueur encaisse
      burst(0.25, 'lowpass', 400, 0.6);
      tonAt(t, 140, 50, 0.35, 'sawtooth', 0.22, {});
      break;
    }
    case 'zombie': { // grognement
      tonAt(t, 95, 70, 0.8, 'sawtooth', 0.28, { filtre: 350, q: 4, a: 0.08, vib: 13, vibAmp: 22, lin: true });
      break;
    }
    case 'zombie_loin': { // un râle, quelque part — on le VOIT sur la carte
      tonAt(t, 100, 72, 1.1, 'sawtooth', 0.05, { filtre: 240, q: 3, a: 0.3, vib: 7, vibAmp: 10, echo: true });
      break;
    }
    case 'hurlement': {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(300, t);
      o.frequency.linearRampToValueAtTime(840, t + 0.4);
      o.frequency.linearRampToValueAtTime(500, t + 1.0);
      const g = ctx.createGain(); env(g, t, 0.06, 0.2, 1.1);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.2);
      break;
    }
    case 'tir': {
      burst(0.18, 'lowpass', 2500, 0.8);
      burst(0.4, 'lowpass', 500, 0.4);
      break;
    }
    case 'manger': burst(0.15, 'bandpass', 1200, 0.12); break;
    case 'boire': {
      [0, 0.18, 0.36].forEach(dt => tonAt(t + dt, 420 + dt * 300, 420 + dt * 300, 0.13, 'sine', 0.08, { a: 0.01 }));
      break;
    }
    case 'soin': burst(0.3, 'highpass', 1000, 0.08); break;
    case 'craft': {
      [0, 0.15].forEach(() => burst(0.06, 'highpass', 1800, 0.18));
      break;
    }
    case 'loot': {
      tonAt(t, 520, 520, 0.1, 'triangle', 0.1, { a: 0.005 });
      tonAt(t + 0.09, 700, 700, 0.12, 'triangle', 0.1, { a: 0.005 });
      break;
    }
    case 'mort': {
      tonAt(t, 110, 28, 2.6, 'sawtooth', 0.35, { filtre: 300, a: 0.1 });
      break;
    }
    case 'explosion': {
      burst(0.8, 'lowpass', 250, 0.8);
      break;
    }
    case 'porte': burst(0.3, 'lowpass', 180, 0.4); break;
    case 'cloche': STINGERS.cloche_morte(t); break;
  }
}
