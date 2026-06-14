// ============ Moteur audio — tout est synthétisé via Web Audio API ============
// La BANQUE DE SONS : chaque lieu a sa scène sonore (js/data/soundscapes.js) —
// un lit continu (vent + drones), des bruits ponctuels qui surgissent au hasard
// (corbeau, ferraille, gémissement au bout du couloir…), et de la MUSIQUE :
// soit un motif génératif rare propre à l'endroit, soit un THÈME COMPOSÉ
// (partitions dans js/data/musiques.js, jouées par le mini-séquenceur).
// La nuit a ses propres bruits et ses propres couleurs musicales.
// Fichiers optionnels : si audio/manifest.json existe, les fichiers déclarés
// remplacent la synthèse pour les thèmes/ambiances concernés (repli synthèse).
// Interface stable : playAmbiance, startCombatMusic, stopCombatMusic, sfx,
// setMuted, setHeartbeat — et setTension(0..1) pour la nappe « zombie proche ».
import { G, estNuit } from './state.js';
import { CARTE_SCENE, SCENES_LEGACY, SCENES_SONORES } from './data/soundscapes.js';
import { THEMES } from './data/musiques.js';

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
let lieuCourantId = null;    // dernier id de lieu passé à playAmbiance (pour relancer après un combat)
let echo = null;             // delay partagé (musique, sons lointains)
let seq = null;              // état du mini-séquenceur (thème composé en cours)
let seqNotes = [];           // notes déjà planifiées par le séquenceur (arrêt propre)
let tension = null;          // nappe de tension temps réel (zombie proche)
let tensionTimer = null;     // démontage différé de la nappe quand elle retombe à 0
let tensionMus = null;       // playlist d'action lancée quand un zombie approche (carte)
let tensionMusTimer = null;  // coupure différée de cette playlist quand la menace s'éloigne
let fichiers = { themes: {}, ambiances: {} }; // themes:[{buffer,gain}] (playlists) — ambiances:{buffer,gain}
let bufferTheme = null;      // playlist de thème en cours (remplace la synthèse) — voir creerPlaylist
let combatBuf = null;        // playlist d'action de combat en cours

// La musique (fichiers) est abaissée d'un cran pour laisser l'ambiance passer
// devant : −40 %. Un seul réglage pour toute la musique de fond.
const MUSIQUE_GAIN = 0.6;

// ---------- Banque de sons fichier (dossier audio/) ----------
// Ces fichiers REMPLACENT la synthèse pour les noms concernés. Tout échec (404,
// décodage) retombe en silence sur la synthèse. La NORMALISATION ramène chaque
// fichier à un même niveau de crête avant d'appliquer son volume cible : c'est ce
// qui rééquilibre automatiquement les fichiers trop forts. Plusieurs fichiers pour
// un même nom : on en tire un au sort à chaque jeu (pas, douleur, râle…).
const BANQUE_SFX = {
  pas:              { f: ['effect/step-wood-simple.mp3'], vol: 0.4 }, // un pas bref et net (0,6 s)
  pas_craque:       { f: ['effect/step-wood-creaks-calm.mp3'], vol: 0.55 }, // craquement appuyé, occasionnel, qui fait du bruit
  porte:            { f: ['effect/door-wood-opening.mp3'], vol: 0.7 },
  porte_coup:       { f: ['effect/door-wood-hitting.mp3'], vol: 0.7 },
  porte_casse:      { f: ['effect/door-wood-break.mp3'], vol: 0.85 },
  coup:             { f: ['effect/hit-with-hand.mp3'], vol: 0.8 },
  coup_critique:    { f: ['effect/small-knife-hit.mp3'], vol: 0.9 },
  manger:           { f: ['action/eat-crunshy.mp3'], vol: 0.7 },
  degats:           { f: ['action/medium-pain.mp3', 'action/medium-pain-2.mp3', 'action/light-pain-male.mp3', 'action/femal-light-pain.mp3'], vol: 0.7 },
  mort:             { f: ['action/terrible-pain-agony.mp3'], vol: 0.85 },
  zombie:           { f: ['monster/zombie-alone-growl.mp3'], vol: 0.7 },
  zombie_loin:      { f: ['monster/zombie-alone-calm-growl.mp3'], vol: 0.45 },
  hurlement:        { f: ['monster/zombie-agonie.mp3', 'monster/zombie-alone-agony-2.mp3'], vol: 0.8 },
  alerte_infection: { f: ['effect/little-horror-suspence.mp3'], vol: 0.55 },
};
// Chaque thème est une PLAYLIST (liste de fichiers). Le lecteur enchaîne les
// morceaux en variant l'ordre — jamais deux fois le même de suite : fini la
// boucle d'un seul fichier à l'infini. Le 'vol' est relatif (1.0 = niveau de
// référence) ; la sonie absolue est égalisée à l'écoute (RMS) puis abaissée par
// MUSIQUE_GAIN. Déposez d'autres fichiers : la rotation les prend tout seuls.
const BANQUE_THEMES = {
  titre:       { f: ['musique/intro-horror.mp3'], vol: 1.0 },
  exploration: { f: ['musique/empty-city.mp3'], vol: 0.9 },
  train:       { f: ['musique/on-the-road.mp3'], vol: 1.0 },
  refuge:      { f: ['musique/suspence-calm.mp3'], vol: 1.0 },
  // Combat : une vraie playlist d'action qui tourne en continu (crossfade),
  // sans jamais rejouer le même morceau deux fois de suite.
  combat: { f: [
    'musique/action-suspence-music.mp3',
    'musique/action-suspence-music-2.mp3',
    'musique/action-suspence-music-3.mp3',
    'musique/action-suspence-music-4.mp3',
    'musique/bandit-tribut-action-music.mp3',
    'musique/epic-musique-action.mp3',
  ], vol: 1.0 },
  // Tension : quand un zombie approche sur la carte, un sous-ensemble plus
  // sombre et en retrait monte sous la nappe dissonante.
  tension: { f: [
    'musique/dark-action-deep.mp3',
    'musique/action-suspence-music-3.mp3',
    'musique/action-suspence-music-2.mp3',
  ], vol: 0.85 },
  // Réservée : une fin épique. Déclarée (chargée, équilibrée) mais pas encore
  // branchée dans le jeu — prête pour une future scène de fin.
  fin: { f: ['musique/epic-end-music.mp3'], vol: 1.0 },
};
const FICHIER_CHRONO = 'effect/chrono.mp3';
const FICHIERS_PLUIE = { legere: 'environnement/light-rain-background.mp3', forte: 'environnement/rain-hard-background.mp3' };
const SCENES_EXTERIEURES = new Set(['rue', 'region', 'village', 'triage', 'gare']);
let sons = {};         // nom sfx -> [{buffer, gain}]
let chronoBuf = null;  // tampon du tic-tac (barre d'attente)
let chronoNode = null; // boucle chrono en cours
let pluieBuf = {};     // tampons de pluie (legere/forte)
let pluieNode = null;  // averse en cours
let pluieTimer = null;

function crete(buffer) {
  let p = 0;
  const ch = Math.min(buffer.numberOfChannels, 2);
  for (let c = 0; c < ch; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i += 64) { const a = Math.abs(d[i]); if (a > p) p = a; }
  }
  return p || 1;
}
// Crête ramenée à ~0,9, puis volume cible : un fichier deux fois trop fort est
// automatiquement divisé par deux. On borne pour ne pas trop pousser un son faible.
// (Bon pour les SFX, brefs : la crête suffit.)
function gainNormalise(buffer, vol) { return Math.min(vol * (0.9 / crete(buffer)), vol * 4); }
// Sonie perçue (RMS) : deux morceaux masterisés différemment (l'un compressé/fort,
// l'autre dynamique/faible) ont la même crête mais des volumes ressentis très
// différents. Pour la MUSIQUE on égalise donc le RMS, pas la crête — c'est ce qui
// rééquilibre vraiment des pistes d'origines différentes.
function rms(buffer) {
  let s = 0, n = 0;
  const ch = Math.min(buffer.numberOfChannels, 2);
  for (let c = 0; c < ch; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i += 32) { s += d[i] * d[i]; n++; }
  }
  return Math.sqrt(s / Math.max(1, n)) || 0.05;
}
// Ramène chaque morceau à une même sonie cible (RMS), applique son 'vol' relatif
// et l'abaissement global MUSIQUE_GAIN, avec un garde-fou de crête anti-saturation.
const RMS_CIBLE = 0.18;
function gainMusique(buffer, vol) {
  let g = vol * MUSIQUE_GAIN * (RMS_CIBLE / rms(buffer));
  const cretePost = crete(buffer) * g;
  if (cretePost > 0.97) g *= 0.97 / cretePost; // jamais d'écrêtage, même sur un morceau dense
  return Math.min(g, vol * 4); // garde-fou : un fichier quasi-muet n'est pas amplifié à l'absurde
}
async function decoder(chemin) {
  const r = await fetch('audio/' + chemin);
  if (!r.ok) throw new Error('404');
  return ctx.decodeAudioData(await r.arrayBuffer());
}
async function chargerBanque() {
  for (const [nom, def] of Object.entries(BANQUE_SFX)) {
    const liste = [];
    for (const f of def.f) { try { const b = await decoder(f); liste.push({ buffer: b, gain: gainNormalise(b, def.vol) }); } catch (e) {} }
    if (liste.length) sons[nom] = liste;
  }
  for (const [nom, def] of Object.entries(BANQUE_THEMES)) {
    const liste = [];
    for (const f of def.f) { try { const b = await decoder(f); liste.push({ buffer: b, gain: gainMusique(b, def.vol) }); } catch (e) {} }
    if (liste.length) fichiers.themes[nom] = liste; // playlist (1 fichier ou plus)
  }
  // Chrono + pluie : on garde un facteur de normalisation (certains de ces fichiers
  // sont enregistrés très bas — la pluie a une crête à ~0,08 : il faut la remonter).
  try { const b = await decoder(FICHIER_CHRONO); chronoBuf = { buffer: b, norm: Math.min(0.9 / crete(b), 12) }; } catch (e) {}
  for (const [k, f] of Object.entries(FICHIERS_PLUIE)) { try { const b = await decoder(f); pluieBuf[k] = { buffer: b, norm: Math.min(0.9 / crete(b), 12) }; } catch (e) {} }
}
// Banque d'abord, puis le manifest utilisateur (qui peut tout remplacer).
async function chargerSons() {
  try { await chargerBanque(); } catch (e) {}
  try { await chargerManifest(); } catch (e) {}
}
function jouerSonFichier(entree) {
  if (!entree || !ctx) return;
  const src = ctx.createBufferSource(); src.buffer = entree.buffer;
  const g = ctx.createGain(); g.gain.value = entree.gain;
  src.connect(g); g.connect(master);
  src.start();
  src.onended = () => { try { src.disconnect(); g.disconnect(); } catch (e) {} };
}

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
    // Banque de sons fichier (audio/) + manifest optionnel : ils remplacent la
    // synthèse pour les sons concernés. Tout échec retombe en silence sur la synthèse.
    chargerSons();
    // Le séquenceur se met en pause quand l'onglet est caché : on le réveille au retour.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reprendreSeq(); });
  } catch (e) { console.warn('Audio indisponible', e); }
}
export function audioPret() { return !!ctx; }
export function isMuted() { return muted; }
export function setMuted(b) {
  muted = b; localStorage.setItem('omd_muted', b ? '1' : '0');
  if (master) master.gain.linearRampToValueAtTime(b ? 0 : volume, ctx.currentTime + 0.2);
  if (!b) reprendreSeq(); // le séquenceur s'était mis en pause pendant le silence
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
  arreterSequenceur();
  arreterPlaylist(bufferTheme); bufferTheme = null;
  arreterTensionMusique(); // change de scène / mort : la tension ne déborde pas sur le lieu suivant
  arreterPluie();
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
  lieuCourantId = id; // mémorisé pour relancer le lit du lieu à la fin d'un combat
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
  g.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2.5); // lit d'ambiance un cran devant (musique baissée)
  ambNodes.push(g);

  if (fichiers.ambiances[sid]) {
    // Un fichier fourni par l'utilisateur remplace le lit synthétisé
    // (vent + drones + rails). Les bruits ponctuels du lieu restent.
    const e = fichiers.ambiances[sid];
    const src = ctx.createBufferSource();
    src.buffer = e.buffer; src.loop = true;
    const ag = ctx.createGain(); ag.gain.value = e.gain;
    src.connect(ag); ag.connect(g); src.start();
    ambNodes.push(src, ag);
  } else {
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
  }

  // Bruits ponctuels : le monde respire, grince, appelle.
  planifierStinger(sc, nuit, cle);
  // Et parfois, la musique du lieu se lève : thème composé ou motif génératif.
  planifierMusique(sc, cle, nuit);
  // Couche météo : sur les scènes à découvert, une averse occasionnelle (fichiers).
  if (SCENES_EXTERIEURES.has(sid)) planifierPluie(cle); else arreterPluie();
}

// ---------- Couche météo : averses occasionnelles (fichiers environnement/) ----------
function planifierPluie(cle) {
  if (pluieTimer) clearTimeout(pluieTimer);
  const delai = (60 + Math.random() * 180) * 1000; // 1 à 4 min de répit avant l'averse
  pluieTimer = setTimeout(() => {
    if (ambianceCourante !== cle || !ctx) return;
    demarrerPluie(Math.random() < 0.4 ? 'forte' : 'legere', cle);
  }, delai);
}
function demarrerPluie(type, cle) {
  const ent = pluieBuf[type] || pluieBuf.legere;
  if (!ent) { planifierPluie(cle); return; }
  arreterPluie(true);
  const src = ctx.createBufferSource(); src.buffer = ent.buffer; src.loop = true;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  const cible = (type === 'forte' ? 0.22 : 0.13) * ent.norm; // normalisé (la pluie est faible)
  g.gain.linearRampToValueAtTime(cible, ctx.currentTime + 6); // l'averse arrive en fondu
  src.connect(g); g.connect(master); src.start();
  pluieNode = { src, g };
  const duree = (90 + Math.random() * 150) * 1000; // elle dure 1,5 à 4 min
  pluieTimer = setTimeout(() => {
    if (!ctx) return;
    const t = ctx.currentTime;
    try { g.gain.cancelScheduledValues(t); g.gain.linearRampToValueAtTime(0.0001, t + 6); src.stop(t + 6.3); } catch (e) {}
    pluieNode = null;
    if (ambianceCourante === cle) planifierPluie(cle);
  }, duree);
}
function arreterPluie(douxEnchaine = false) {
  if (pluieTimer && !douxEnchaine) { clearTimeout(pluieTimer); pluieTimer = null; }
  if (pluieNode && ctx) {
    const t = ctx.currentTime;
    try { pluieNode.g.gain.cancelScheduledValues(t); pluieNode.g.gain.setTargetAtTime(0.0001, t, 0.4); pluieNode.src.stop(t + 1.2); } catch (e) {}
    pluieNode = null;
  }
}

function poolStingers(sc, nuit) {
  const pool = [...(sc.stingers || [])];
  if (nuit) pool.push(...(sc.stingersNuit || []));
  else pool.push(...(sc.stingersJour || [])); // cigales, fontaine… : le plein jour seulement
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
function planifierMusique(sc, cle, nuit) {
  const m = sc.musique;
  if (!m) return;
  // Thème composé ? Le séquenceur prend la place du motif génératif.
  if (m.theme) { demarrerTheme(m.theme, nuit, cle); return; }
  musiqueTimer = setTimeout(() => {
    if (ambianceCourante !== cle || !ctx) return;
    if (Math.random() < m.p) jouerMotif(m, nuit);
    planifierMusique(sc, cle, nuit);
  }, 12000 + Math.random() * 22000); // un peu plus présent qu'avant, mais rare quand même
}

function jouerMotif(m, nuit) {
  const t0 = ctx.currentTime + 0.1;
  // Plusieurs gammes possibles par lieu : on en tire une au sort.
  const gamme = m.gammes ? m.gammes[Math.floor(Math.random() * m.gammes.length)] : m.gamme;
  // La nuit, la phrase descend d'un demi-ton, s'étire, et le timbre se feutre.
  const racine = m.base * RACINES[Math.floor(Math.random() * RACINES.length)] * (nuit ? 0.944 : 1);
  const timbre = nuit ? 'sine' : (m.timbre || 'sine');
  const lent = nuit ? 1.2 : 1;
  const nNotes = 3 + Math.floor(Math.random() * 4);
  let t = t0;
  let deg = Math.floor(Math.random() * gamme.length);
  for (let i = 0; i < nNotes; i++) {
    // la mélodie marche par pas, avec un saut de temps en temps
    deg = Math.max(0, Math.min(gamme.length - 1, deg + (Math.random() < 0.3 ? 2 : 1) * (Math.random() < 0.5 ? -1 : 1)));
    const oct = Math.random() < 0.3 ? 4 : 2;
    const f = racine * Math.pow(2, gamme[deg] / 12) * oct;
    const dur = ((m.doux ? 1.1 : 0.85) + Math.random() * 0.7) * lent;
    const o = ctx.createOscillator(); o.type = timbre; o.frequency.value = f;
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
  // Une fois sur deux, un bourdon grave tient la tonique sous toute la phrase.
  if (Math.random() < 0.5) {
    const fin = (t - t0) + 0.8;
    const b = ctx.createOscillator(); b.type = 'sine'; b.frequency.value = racine;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, t0);
    bg.gain.linearRampToValueAtTime(nuit ? 0.034 : 0.028, t0 + 1);
    bg.gain.exponentialRampToValueAtTime(0.0001, t0 + fin);
    b.connect(bg); bg.connect(master);
    b.start(t0); b.stop(t0 + fin + 0.1);
  }
}

// ---------- Mini-séquenceur : les thèmes composés de js/data/musiques.js ----------
// Planification par anticipation (lookahead) sur ctx.currentTime : un réveil
// régulier pose les notes des prochains instants, puis se rendort. Quand le son
// est coupé ou l'onglet caché, le séquenceur se met en pause (aucun timer ne
// tourne) et repart au début de la partition au retour.
const SEQ_AVANCE = 0.8;   // horizon de planification (secondes)
const SEQ_TICK_MS = 200;  // cadence du réveil

function demarrerTheme(nom, nuit, cle) {
  let part = THEMES[nom];
  if (!part) return;
  let nomEffectif = nom;
  if (nuit && part.nuit && THEMES[part.nuit]) { nomEffectif = part.nuit; part = THEMES[part.nuit]; }
  // Fichiers (banque ou manifest) ? Ils remplacent la synthèse de ce thème
  // (la variante de nuit peut avoir sa propre playlist, sinon celle du jour).
  const liste = fichiers.themes[nomEffectif] || fichiers.themes[nom];
  if (liste && liste.length) {
    // Thème d'ambiance : on respire entre les morceaux (le survival doit se taire).
    bufferTheme = creerPlaylist(liste, { fondu: 1.6, repos: [7, 16] });
    return;
  }
  seq = {
    cle, part,
    voix: part.voix.map(v => ({ def: v, idx: 0, t: 0 })),
    timer: null,
    enPause: false,
  };
  const t0 = ctx.currentTime + 1.5; // la musique n'arrive jamais brutalement
  seq.voix.forEach(vs => { vs.t = t0; });
  seqTick();
}

function seqTick() {
  if (!seq || !ctx) return;
  if (seq.cle !== ambianceCourante) { arreterSequenceur(); return; }
  // Pause : son coupé ou onglet caché. On ne replanifie rien ; la reprise
  // (setMuted / visibilitychange) relancera la partition depuis le début.
  if (muted || document.hidden) { seq.enPause = true; seq.timer = null; return; }
  const part = seq.part;
  const limite = ctx.currentTime + SEQ_AVANCE;
  const battement = (60 / part.tempo) * (part.etire || 1);
  let tousFinis = true;
  for (const vs of seq.voix) {
    while (vs.idx < vs.def.notes.length && vs.t < limite) {
      const [st, dur] = vs.def.notes[vs.idx];
      const durSec = dur * battement;
      if (st !== null) jouerNoteSeq(part, vs.def, st, vs.t, durSec);
      vs.t += durSec; vs.idx++;
    }
    if (vs.idx < vs.def.notes.length) tousFinis = false;
  }
  let prochainTick = SEQ_TICK_MS;
  if (tousFinis) {
    // Reprise après un silence de respiration — la musique doit savoir se taire.
    const fin = Math.max(...seq.voix.map(vs => vs.t));
    const [rMin, rMax] = part.respiration || [8, 16];
    const t0 = fin + rMin + Math.random() * (rMax - rMin);
    seq.voix.forEach(vs => { vs.idx = 0; vs.t = t0; });
    // Pendant le silence, on dort presque jusqu'à la reprise au lieu de tourner à vide.
    prochainTick = Math.max(SEQ_TICK_MS, (t0 - ctx.currentTime - SEQ_AVANCE) * 1000);
  }
  seq.timer = setTimeout(seqTick, prochainTick);
}

function jouerNoteSeq(part, v, st, t, durSec) {
  const trans = (part.transpose || 0) + (v.transpose || 0);
  const f = part.fondamentale * Math.pow(2, (st + trans) / 12) * Math.pow(2, v.octave || 0);
  const o = ctx.createOscillator(); o.type = v.timbre || 'sine'; o.frequency.value = f;
  const oscs = [o];
  if (v.detune) { // un 2e oscillateur à peine désaccordé : la note respire
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = v.detune;
    oscs.push(o2);
  }
  const g = ctx.createGain();
  const a = Math.min(v.attaque || 0.05, durSec * 0.5);
  const rel = v.relache || 0.3;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v.gain || 0.04, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durSec + rel);
  if (v.filtre) {
    const fil = ctx.createBiquadFilter(); fil.type = 'lowpass'; fil.frequency.value = v.filtre;
    oscs.forEach(os => os.connect(fil)); fil.connect(g);
  } else {
    oscs.forEach(os => os.connect(g));
  }
  g.connect(master);
  if (v.echo) g.connect(echo);
  const fin = t + durSec + rel + 0.05;
  oscs.forEach(os => { os.start(t); os.stop(fin); });
  seqNotes.push({ g, oscs, fin });
  // On ne garde que les notes encore vivantes (la liste sert à l'arrêt propre).
  if (seqNotes.length > 64) seqNotes = seqNotes.filter(n => n.fin > ctx.currentTime);
}

function arreterSequenceur() {
  if (seq && seq.timer) clearTimeout(seq.timer);
  seq = null;
  if (!ctx) { seqNotes = []; return; }
  // Étouffe les notes déjà posées dans le futur : pas de notes orphelines.
  // (le gain est coupé tout de suite ; les oscillateurs ont déjà leur stop
  // planifié à la création, on ne tente pas de le re-planifier)
  const t = ctx.currentTime;
  seqNotes.forEach(n => {
    try {
      n.g.gain.cancelScheduledValues(t);
      n.g.gain.setTargetAtTime(0.0001, t, 0.08);
    } catch (e) {}
  });
  seqNotes = [];
}

// Réveille le séquenceur s'il s'était mis en pause (mute ou onglet caché).
function reprendreSeq() {
  if (!ctx || !seq || !seq.enPause) return;
  if (muted || document.hidden) return;
  seq.enPause = false;
  const t0 = ctx.currentTime + 1;
  seq.voix.forEach(vs => { vs.idx = 0; vs.t = t0; });
  seqTick();
}

// ---------- Fichiers audio optionnels (audio/manifest.json) ----------
// Si l'utilisateur dépose de vrais fichiers dans audio/, ils remplacent la
// synthèse pour les thèmes et ambiances déclarés. Tout échec est silencieux :
// pas de manifest (404), JSON invalide, fichier manquant → repli synthèse.
async function chargerManifest() {
  try {
    const rep = await fetch('audio/manifest.json');
    if (!rep.ok) return;
    const man = await rep.json();
    // Le manifest a la priorité sur la banque. Un thème peut désormais déclarer
    // PLUSIEURS fichiers (tableau) → ils tournent en playlist. Une chaîne seule
    // reste acceptée (rétrocompatible). Les ambiances restent un seul fichier.
    for (const [nom, val] of Object.entries(man.themes || {})) {
      const fs = Array.isArray(val) ? val : [val];
      const liste = [];
      for (const ff of fs) {
        try {
          const r = await fetch('audio/' + ff);
          if (!r.ok) continue;
          const b = await ctx.decodeAudioData(await r.arrayBuffer());
          liste.push({ buffer: b, gain: gainMusique(b, 1.0) }); // sonie égalisée comme la banque
        } catch (e) { /* fichier illisible : ignoré */ }
      }
      if (liste.length) fichiers.themes[nom] = liste;
    }
    for (const [nom, val] of Object.entries(man.ambiances || {})) {
      const ff = Array.isArray(val) ? val[0] : val;
      try {
        const r = await fetch('audio/' + ff);
        if (!r.ok) continue;
        const b = await ctx.decodeAudioData(await r.arrayBuffer());
        fichiers.ambiances[nom] = { buffer: b, gain: gainNormalise(b, 0.5) };
      } catch (e) { /* fichier illisible : on garde la synthèse */ }
    }
  } catch (e) { /* pas de manifest : cas normal, silence total */ }
}

// ---------- Lecteur de playlist musicale ----------
// Enchaîne des morceaux (fichiers) en variant l'ordre : JAMAIS le même deux
// fois de suite. Fondu d'entrée/sortie sur chaque piste ; entre deux morceaux,
// soit un silence de respiration (repos > 0, façon survival), soit un
// chevauchement (repos = 0 → vrai crossfade, pour le combat continu).
// Remplace l'ancienne boucle d'un unique fichier qui tournait à l'infini.
function creerPlaylist(entrees, opts = {}) {
  if (!ctx || !entrees || !entrees.length) return null;
  const etat = { entrees, opts, idx: -1, src: null, g: null, timer: null, vivant: true };
  enchainerPiste(etat, true);
  return etat;
}
function prochaineIdx(etat) {
  const n = etat.entrees.length;
  if (n <= 1) return 0;
  let i; do { i = Math.floor(Math.random() * n); } while (i === etat.idx); // pas de répétition immédiate
  return i;
}
function enchainerPiste(etat, premier) {
  if (!etat.vivant || !ctx) return;
  etat.idx = prochaineIdx(etat);
  const ent = etat.entrees[etat.idx];
  const dur = ent.buffer.duration;
  const fondu = Math.min(etat.opts.fondu || 1.4, dur / 3);
  const t0 = ctx.currentTime + 0.02;
  const src = ctx.createBufferSource(); src.buffer = ent.buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(ent.gain, t0 + (premier ? Math.min(2, fondu * 1.5) : fondu));
  g.gain.setValueAtTime(ent.gain, t0 + Math.max(0.1, dur - fondu));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // fondu de sortie : pas de coupure sèche
  src.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.1);
  etat.src = src; etat.g = g;
  // Planifie la piste suivante. repos = silence entre morceaux ; repos = 0 →
  // on avance du temps d'un fondu pour chevaucher la fin (crossfade).
  const [rMin, rMax] = etat.opts.repos || [0, 0];
  const repos = rMin + Math.random() * (rMax - rMin);
  const avance = (rMin === 0 && rMax === 0) ? fondu : 0;
  const attente = Math.max(0.2, dur - avance + repos);
  etat.timer = setTimeout(() => enchainerPiste(etat, false), attente * 1000);
}

function arreterPlaylist(etat, douxMs = 700) {
  if (!etat) return;
  etat.vivant = false;
  if (etat.timer) { clearTimeout(etat.timer); etat.timer = null; }
  if (etat.g && etat.src && ctx) {
    try {
      const t = ctx.currentTime;
      etat.g.gain.cancelScheduledValues(t);
      etat.g.gain.setValueAtTime(Math.max(0.0001, etat.g.gain.value), t);
      etat.g.gain.setTargetAtTime(0.0001, t, douxMs / 3000);
      etat.src.stop(t + douxMs / 1000 + 0.2);
    } catch (e) {}
  }
}

// ---------- Musique d'action sur l'approche (carte) ----------
// Au-delà d'un seuil de tension, une playlist d'action sombre monte SOUS la
// nappe dissonante ; elle se coupe quand la menace s'éloigne pour de bon.
// Hystérésis (deux seuils + répit) pour ne pas la rallumer/éteindre sans cesse.
// L'entrée en combat la coupe net (arreterTensionMusique dans startCombatMusic) :
// la simple retombée à 0 est différée de 5 s et laisserait un doublon transitoire.
const TENS_MUS_ON = 0.55, TENS_MUS_OFF = 0.2;
function majTensionMusique(niveau) {
  const liste = fichiers.themes.tension;
  if (!liste || !liste.length) return;
  if (niveau >= TENS_MUS_ON) {
    if (tensionMusTimer) { clearTimeout(tensionMusTimer); tensionMusTimer = null; } // menace de retour
    if (!tensionMus) tensionMus = creerPlaylist(liste, { fondu: 2.5, repos: [5, 12] });
    return;
  }
  if (!tensionMus) return;
  if (niveau <= TENS_MUS_OFF) {
    // Sous le seuil bas : on programme une coupure, mais on laisse un répit
    // (la menace peut juste s'être éloignée d'une case).
    if (!tensionMusTimer) tensionMusTimer = setTimeout(() => {
      tensionMusTimer = null;
      arreterPlaylist(tensionMus, 1400); tensionMus = null;
    }, 5000);
  } else if (tensionMusTimer) {
    // Entre les deux seuils alors qu'une coupure était prévue : on l'annule.
    clearTimeout(tensionMusTimer); tensionMusTimer = null;
  }
}
// Coupe IMMÉDIATEMENT la musique de tension (et annule la coupure différée).
// Indispensable aux transitions dures, où la simple retombée à 0 ne suffit pas :
// la coupure normale est différée de 5 s, donc sans ça la playlist déborderait
// sur la scène suivante (changement de lieu, mort) ou doublerait la musique de
// combat (entrée en combat). Idempotente.
function arreterTensionMusique(douxMs = 700) {
  if (tensionMusTimer) { clearTimeout(tensionMusTimer); tensionMusTimer = null; }
  if (tensionMus) { arreterPlaylist(tensionMus, douxMs); tensionMus = null; }
}

// ---------- Tension temps réel : un zombie approche sur la carte ----------
// setTension(0) = rien, setTension(1) = il est tout près. La nappe dissonante
// monte et descend en fondu (~2 s). À 0, les oscillateurs sont démontés.
export function setTension(niveau) {
  if (!ctx) return;
  niveau = Math.max(0, Math.min(1, niveau || 0));
  majTensionMusique(niveau); // un zombie approche → une vraie musique d'action monte
  const t = ctx.currentTime;
  if (niveau > 0 && !tension) {
    // Deux dents de scie à la seconde mineure (ça frotte), un sinus sous-jacent,
    // et un LFO qui fait dériver l'accord : le malaise sans le vacarme.
    const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(master);
    const fil = ctx.createBiquadFilter(); fil.type = 'lowpass'; fil.frequency.value = 850; fil.connect(g);
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 110;
    const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 116.5;
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = 55;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    const lg = ctx.createGain(); lg.gain.value = 2.5;
    lfo.connect(lg); lg.connect(o2.frequency);
    [o1, o2, o3].forEach(o => {
      const og = ctx.createGain(); og.gain.value = o === o3 ? 0.5 : 0.3;
      o.connect(og); og.connect(fil); o.start();
    });
    lfo.start();
    tension = { oscs: [o1, o2, o3, lfo], g };
  }
  if (!tension) return;
  if (tensionTimer) { clearTimeout(tensionTimer); tensionTimer = null; }
  tension.g.gain.cancelScheduledValues(t);
  tension.g.gain.setValueAtTime(Math.max(tension.g.gain.value, 0.0001), t);
  tension.g.gain.linearRampToValueAtTime(Math.max(niveau * 0.085, 0.0001), t + 2);
  if (niveau <= 0) {
    // Une fois le fondu terminé, on démonte tout (rien ne tourne à vide).
    tensionTimer = setTimeout(() => {
      tensionTimer = null;
      if (!tension) return;
      tension.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
      try { tension.g.disconnect(); } catch (e) {}
      tension = null;
    }, 2400);
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

  // --- Le Sud : cigales en plein jour, mistral, eau de la Fontaine Moussue ---
  cigales(t) {
    const dur = 1.4 + Math.random() * 1.3;
    const s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur + 0.2); s.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4200 + Math.random() * 900; bp.Q.value = 6;
    const trem = ctx.createGain(); trem.gain.value = 0.5; // base du crépitement
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.5);
    g.gain.setValueAtTime(0.02, t + dur - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lfo = ctx.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 42 + Math.random() * 16;
    const lg = ctx.createGain(); lg.gain.value = 0.5; // ±0.5 : le rythme sec de la cigale
    lfo.connect(lg); lg.connect(trem.gain);
    s.connect(bp); bp.connect(trem); trem.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.2);
    lfo.start(t); lfo.stop(t + dur + 0.2);
  },
  mistral(t) {
    const dur = 2.8 + Math.random() * 1.6;
    const s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur + 0.2); s.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(280, t);
    lp.frequency.linearRampToValueAtTime(950, t + dur * 0.4);
    lp.frequency.linearRampToValueAtTime(240, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + dur * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(lp); lp.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.2);
  },
  fontaine(t) {
    burstAt(t, 1.6, 'bandpass', 1300, 0.028, 3, true);
    for (let i = 0; i < 7; i++) tonAt(t + Math.random() * 1.4, 1200 + Math.random() * 900, 700, 0.06, 'sine', 0.028, { a: 0.003, echo: true });
  },
  tole(t) {
    tonAt(t, 180, 90, 0.5, 'sawtooth', 0.045, { filtre: 500, q: 4, a: 0.02, vib: 7, vibAmp: 30 });
    burstAt(t + 0.05, 0.3, 'bandpass', 600, 0.03, 5, true);
  },
  branche(t) {
    burstAt(t, 0.04, 'highpass', 2400, 0.06);
    tonAt(t, 140, 70, 0.08, 'square', 0.04, { filtre: 500, a: 0.002 });
    for (let i = 0; i < 2; i++) burstAt(t + 0.05 + i * 0.04, 0.03, 'highpass', 1800, 0.03);
  },
  klaxon_loin(t) {
    const dur = 1.2 + Math.random() * 1.4;
    [330, 392].forEach(f => tonAt(t, f, f, dur, 'sawtooth', 0.02, { filtre: 900, a: 0.06, echo: true }));
  },
  effondrement(t) {
    burstAt(t, 0.9, 'lowpass', 220, 0.12);
    tonAt(t, 70, 35, 1.0, 'sine', 0.11, { a: 0.02 });
    for (let i = 0; i < 6; i++) burstAt(t + 0.3 + Math.random() * 0.7, 0.06, 'bandpass', 700 + Math.random() * 500, 0.03, 4, true);
  },
  rideau_fer(t) {
    for (let i = 0; i < 8; i++) burstAt(t + i * 0.045, 0.035, 'bandpass', 1400 - i * 60, 0.04, 6, i % 2 === 0);
  },

  // --- Nouveaux sons d'environnement : le monde mort a mille petits bruits ---
  rat(t) { // des griffes pressées qui filent le long d'une plinthe
    const n = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) burstAt(t + i * (0.032 + Math.random() * 0.03), 0.022, 'highpass', 3200 + Math.random() * 1300, 0.03);
  },
  gouttiere(t) { // gouttes pesantes dans une gouttière de zinc, l'écho les étire
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) tonAt(t + i * (0.25 + Math.random() * 0.22), 740 + Math.random() * 300, 360, 0.12, 'sine', 0.04, { a: 0.002, echo: true });
  },
  bourrasque_sifflante(t) { // le vent qui siffle par un interstice, montée puis chute
    const dur = 1.6 + Math.random() * 1.4;
    tonAt(t, 720, 1180, dur * 0.6, 'sine', 0.022, { a: 0.4, vib: 5, vibAmp: 40, echo: true });
    burstAt(t, dur, 'bandpass', 1400, 0.05, 2, true);
  },
  metal_dilate(t) { // une structure métallique qui se contracte : « ping… ping »
    [0, 0.45 + Math.random() * 0.6].forEach((dt, i) => tonAt(t + dt, 1700 - i * 320 + Math.random() * 200, 1450 - i * 320, 0.5, 'sine', 0.03, { a: 0.002, echo: true }));
  },
  insectes_nuit(t) { // grillons épars, plus graves et plus lents que les cigales
    const dur = 1.6 + Math.random() * 1.6;
    const s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur + 0.2); s.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 600; bp.Q.value = 8;
    const trem = ctx.createGain(); trem.gain.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.014, t + 0.6);
    g.gain.setValueAtTime(0.014, t + dur - 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 5.5 + Math.random() * 3;
    const lg = ctx.createGain(); lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(trem.gain);
    s.connect(bp); bp.connect(trem); trem.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.2); lfo.start(t); lfo.stop(t + dur + 0.2);
  },
  porte_lointaine(t) { // une porte claque, loin ; l'écho la déforme
    burstAt(t, 0.2, 'lowpass', 240, 0.16, 1, true);
    tonAt(t, 90, 48, 0.18, 'sine', 0.11, { a: 0.003, echo: true });
  },
  chute_gravats(t) { // des gravats qui dégringolent et roulent
    burstAt(t, 0.18, 'lowpass', 500, 0.1);
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) burstAt(t + 0.1 + i * (0.05 + Math.random() * 0.06), 0.04, 'bandpass', 600 + Math.random() * 420, 0.05, 3, true);
  },
  oiseau_isole(t) { // un oiseau seul, deux notes, très loin (le jour)
    [0, 0.22].forEach((dt, i) => tonAt(t + dt, 2100 + i * 320 + Math.random() * 200, 1700, 0.1, 'sine', 0.028, { a: 0.004, echo: true }));
  },
  bois_travaille(t) { // une charpente qui travaille : longue plainte basse
    tonAt(t, 120, 80, 1.4, 'sawtooth', 0.04, { filtre: 280, q: 5, a: 0.4, vib: 4, vibAmp: 8, echo: true });
  },
  souffle_couloir(t) { // un souffle d'air creux au bout d'un couloir
    burstAt(t, 1.8, 'bandpass', 480, 0.06, 1.5, true);
    tonAt(t + 0.2, 180, 140, 1.4, 'sine', 0.02, { a: 0.5, echo: true });
  },
  eau_egout(t) { // l'eau qui glougloute dans une bouche d'égout
    burstAt(t, 0.6, 'lowpass', 700, 0.04, 1, true);
    for (let i = 0; i < 4; i++) tonAt(t + Math.random() * 0.8, 300 + Math.random() * 220, 200, 0.1, 'sine', 0.03, { a: 0.01, echo: true });
  },
};

function jouerStinger(nom) {
  const fn = STINGERS[nom];
  if (fn) fn(ctx.currentTime + 0.02);
}

// ---------- Musique de combat : pulsation, riff dissonant, montée quand PV bas ----------
export function startCombatMusic() {
  if (!ctx || combatTimer || combatBuf) return;
  arreterTensionMusique(400); // l'éventuelle musique de tension cède la place au combat (pas de doublon)
  // Le combat PREND LA MAIN sur le lit sonore du lieu : sans ça, l'ambiance (drones,
  // musique de lieu, stingers) continuait SOUS la musique de combat et on n'entendait
  // pas le changement. On coupe l'ambiance et on remet `ambianceCourante` à zéro pour
  // qu'elle puisse repartir à la fin du combat.
  stopAmbiance();
  ambianceCourante = null;
  // Fichiers fournis ? Une playlist d'action en continu remplace la boucle
  // procédurale : crossfade entre morceaux, jamais le même deux fois de suite.
  if (fichiers.themes.combat && fichiers.themes.combat.length) {
    combatBuf = creerPlaylist(fichiers.themes.combat, { fondu: 1.8, repos: [0, 0] });
    return;
  }
  let beat = 0;
  const tick = () => {
    if (!ctx || !combatTimer) return;
    // PV bas : le cœur bat déjà (setHeartbeat) — la musique presse le pas.
    const pvBas = !!heartbeatTimer;
    const pas = pvBas ? 350 : 430; // ms par temps
    // Son coupé ou onglet caché : on ne fabrique rien, on attend.
    if (muted || document.hidden) { combatTimer = setTimeout(tick, 400); return; }
    const t = ctx.currentTime;
    // grosse caisse
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(og); og.connect(master);
    o.start(t); o.stop(t + 0.25);
    // charley métallique sur le contretemps — la percussion respire
    burstAt(t + pas / 2000, 0.03, 'highpass', 5200, pvBas ? 0.05 : 0.032);
    // nappe dissonante un temps sur quatre
    if (beat % 4 === 2) {
      const d = ctx.createOscillator(); d.type = 'sawtooth';
      d.frequency.value = beat % 8 === 2 ? 92.5 : 98;
      const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 500;
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0.001, t); dg.gain.linearRampToValueAtTime(pvBas ? 0.1 : 0.07, t + 0.1);
      dg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      d.connect(df); df.connect(dg); dg.connect(master);
      d.start(t); d.stop(t + 0.9);
    }
    // riff de trois notes dissonantes toutes les deux mesures :
    // tonique, seconde mineure, triton — ça grince exprès
    if (beat % 8 === 4) {
      [0, 1, -6].forEach((st, i) => {
        const f = 98 * Math.pow(2, st / 12);
        tonAt(t + i * (pas / 2000), f, f, 0.22, 'sawtooth', pvBas ? 0.085 : 0.055, { filtre: 700, q: 2, a: 0.01 });
      });
    }
    beat++;
    combatTimer = setTimeout(tick, pas);
  };
  combatTimer = setTimeout(tick, 10);
}
export function stopCombatMusic() {
  if (combatTimer) { clearTimeout(combatTimer); combatTimer = null; }
  arreterPlaylist(combatBuf, 900); combatBuf = null;
  // Le combat est fini : on relance le lit sonore du lieu (le rendu de la carte le
  // referait, mais on l'assure ici pour ne pas laisser de silence si un chemin de code
  // ne repasse pas par renderLieu). playAmbiance se garde lui-même contre le doublon.
  if (lieuCourantId != null) playAmbiance(lieuCourantId);
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

// ---------- Tic-tac de la barre d'attente (actions longues) ----------
// Joué en boucle pendant qu'une action immersive se déroule (fichier chrono.mp3).
export function setChrono(on) {
  if (!ctx || !chronoBuf) return;
  if (on && !chronoNode) {
    const src = ctx.createBufferSource(); src.buffer = chronoBuf.buffer; src.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    g.gain.linearRampToValueAtTime(0.12 * chronoBuf.norm, ctx.currentTime + 0.25);
    src.connect(g); g.connect(master); src.start();
    chronoNode = { src, g };
  } else if (!on && chronoNode) {
    const t = ctx.currentTime;
    try { chronoNode.g.gain.cancelScheduledValues(t); chronoNode.g.gain.setTargetAtTime(0.0001, t, 0.05); chronoNode.src.stop(t + 0.2); } catch (e) {}
    chronoNode = null;
  }
}

// ---------- Effets sonores ----------
export function sfx(nom) {
  if (!ctx) return;
  // Un fichier de la banque pour ce nom ? Il remplace la synthèse (tirage au sort
  // s'il y en a plusieurs : pas, douleur, râle…).
  const banque = sons[nom];
  if (banque && banque.length) { jouerSonFichier(banque[Math.floor(Math.random() * banque.length)]); return; }
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
    case 'alerte_infection': { // deux notes descendantes étouffées — quelque chose ne va pas
      tonAt(t, 460, 425, 0.18, 'triangle', 0.055, { filtre: 600, a: 0.012, vib: 9, vibAmp: 6 });
      tonAt(t + 0.22, 348, 305, 0.26, 'triangle', 0.048, { filtre: 500, a: 0.012, vib: 9, vibAmp: 6 });
      break;
    }
    case 'porte_coup': { // coup sourd sur une porte en bois, avec un petit rebond
      burst(0.14, 'lowpass', 230, 0.5);
      tonAt(t, 85, 50, 0.13, 'sine', 0.3, { a: 0.004 });
      burstAt(t + 0.09, 0.05, 'lowpass', 300, 0.1);
      break;
    }
    case 'alerte_contact': { // tic d'alerte sec et court — un signal, pas un sursaut
      tonAt(t, 1320, 1320, 0.045, 'square', 0.07, { a: 0.002, filtre: 2600 });
      break;
    }
    case 'eau_verse': { // éclaboussure et glouglou bref
      burst(0.28, 'bandpass', 950, 0.06);
      [0, 0.09, 0.19, 0.28].forEach((dt, i) => {
        tonAt(t + dt + Math.random() * 0.02, 320 + i * 70 + Math.random() * 90, 260 + i * 60, 0.07, 'sine', 0.05, { a: 0.004 });
      });
      break;
    }
    case 'tissu_dechire': { // déchirure sèche : rafale de bruit qui monte dans l'aigu
      for (let i = 0; i < 6; i++) burstAt(t + i * 0.034, 0.03, 'highpass', 1700 + i * 380, 0.075 - i * 0.006);
      break;
    }
    // Nom inconnu : on ne fait rien — les appels venus d'ailleurs ne cassent jamais.
    default: break;
  }
}
