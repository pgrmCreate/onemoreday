// ============ La vie des personnages (PNJ) : ils marchent, travaillent, s'assoient, dorment — et ça s'entend ============
// docs/RETOURS_JOUEUR.md #63 : au début, les personnages restaient plantés là, « stoïques ». Un PNJ du plan peut porter une
// VIE (plan.js : pnj(id, x, y, { vie })) : ce qu'il fait de ses journées, en quelques moments joués au hasard (ou dans
// l'ordre), et où il dort. Il marche d'un endroit à l'autre par un chemin qui contourne les arbres et les meubles, se
// retourne vers toi quand tu t'approches, s'arrête pour te laisser passer, et quand tu lui parles il te regarde.
//   vie = {
//     moments: [moment, …]   joués au hasard (poids) ; ordre: true → dans l'ordre, en boucle
//     nuit: moment            de 22 h à 6 h (pose 'dort' : il dort ; sans nuit, il continue)
//     vitesse: 2.2            unités par seconde en marchant (René et sa canne : 1.1 ; un enfant : 2.8)
//     canne: true             il marche appuyé sur une canne (et la canne tape le sol)
//   }
//   moment = {
//     a: [x, y] | 'pnjId'     où aller d'abord (unités ; le centre d'une case = x + 0,5) ; près d'un autre PNJ : 'pnjId'
//     par: [[x, y], …]        passer d'abord par ces points (une ronde)
//     errer: rayon            un point au hasard dans ce rayon autour de « a » (ou de sa place dans le plan)
//     dir | regard: [x, y] | 'pnjId' | 'joueur'   vers où il se tourne une fois arrivé (regard : il suit des yeux)
//     pose: 'debout' | 'accroupi' | 'assis' | 'assis_tendu' (jambes allongées) | 'allonge' | 'dort'
//     geste: 'meca' | 'fouille' | 'gratter' | 'lancer' | 'jambe' | 'tete' | 'verifier' | 'bras' | 'compter' | null
//     outil: 'cle' | 'baton' | 'marteau' …   ce qu'il tient dans la main droite pendant le geste
//     ms: [min, max]          combien de temps (réel) il y reste
//     sons: { n: [noms], chaque: [min, max], vol, portee }   le bruit de ce qu'il fait, situé dans le lieu (js/audio.js)
//     son: nom                un son, une fois, en arrivant (le démarreur du fourgon)
//     bulle: ['…']            une phrase marmonnée au-dessus de lui, si l'on est assez près pour l'entendre
//     couverture: '#couleur'  une couverture sous lui (assis) ou sur lui (couché) ; tremble: true (la fièvre, la peur)
//     poids: 1, si: CONDITION
//   }
// Chaque client fait vivre ses PNJ chez lui : en co-op, ils ne sont pas forcément au même pas chez l'un et chez l'autre.
// C'est du décor vivant : parler, les scènes et les missions ne dépendent pas de leur position exacte.
import { G } from '../core/state.js';
import { FIN, icase } from '../carte/catalogue.js';
import { ligneLibre } from './physique.js';
import { verifier } from '../game/conditions.js';
import { sfxA } from './commun.js';

const TAU = Math.PI * 2;
const hasard = (a, b) => a + Math.random() * (b - a);
const duree = (ms) => (Array.isArray(ms) ? hasard(ms[0], ms[1]) : ms || 6000);
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const estNuit = () => { const h = ((G.world.minutes % 1440) + 1440) % 1440 / 60; return h >= 22 || h < 6; };

// ---------- La grille où l'on peut marcher, avec un peu de marge autour des obstacles ----------
let marge = null, margeSrc = null, margeT = 0, margeE = null;
function grilleMarge(E, bloque) {
  const t = performance.now();
  if (marge && margeSrc === bloque && margeE === E.id && t - margeT < 1500) return marge;
  const w = E.w, h = E.h, n = w * h;
  if (!marge || marge.length !== n) marge = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (bloque[i]) { marge[i] = 1; continue; }
    const x = i % w, y = (i / w) | 0;
    marge[i] = (x > 0 && bloque[i - 1]) || (x < w - 1 && bloque[i + 1]) || (y > 0 && bloque[i - w]) || (y < h - 1 && bloque[i + w]) ? 2 : 0;
  }
  margeSrc = bloque; margeT = t; margeE = E.id;
  return marge;
}
// Un chemin (liste de points en unités) de (x0, y0) à (x1, y1) : en largeur d'abord sur la grille fine, en évitant les
// abords des obstacles quand c'est possible, puis lissé (on coupe en ligne droite dès que la voie est libre).
let bfs = null;
function chemin(E, bloque, x0, y0, x1, y1) {
  const w = E.w, h = E.h, M = grilleMarge(E, bloque);
  const s = icase(E, x0, y0), cible = icase(E, x1, y1);
  if (s < 0 || cible < 0) return null;
  if (!bfs || bfs.prev.length !== w * h) bfs = { prev: new Int32Array(w * h), vu: new Uint32Array(w * h), file: new Int32Array(w * h), st: 0 };
  for (const stricte of [true, false]) {
    const B = bfs; B.st++;
    const ok = (i) => (stricte ? M[i] === 0 : !bloque[i]);
    let a = 0, b = 0; B.file[b++] = s; B.vu[s] = B.st; B.prev[s] = -1;
    const tx = cible % w, ty = (cible / w) | 0;
    let meilleur = s, md = Infinity, trouve = -1;
    while (a < b && a < 60000) {
      const i = B.file[a++];
      if (i === cible) { trouve = i; break; }
      const x = i % w, y = (i / w) | 0, dd = (x - tx) * (x - tx) + (y - ty) * (y - ty);
      if (dd < md) { md = dd; meilleur = i; }
      for (let k = 0; k < 8; k++) {
        const dx = [1, -1, 0, 0, 1, 1, -1, -1][k], dy = [0, 0, 1, -1, 1, -1, 1, -1][k];
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (B.vu[j] === B.st) continue;
        if (!ok(j) && j !== cible) continue;
        if (j === cible && bloque[j] && Math.abs(dx) + Math.abs(dy) > 1) continue;
        if (k >= 4 && (bloque[y * w + nx] || bloque[ny * w + x])) continue;
        B.vu[j] = B.st; B.prev[j] = i; B.file[b++] = j;
      }
    }
    if (trouve < 0 && md > 9) continue;          // trop loin de la cible : on retente sans la marge
    const fin = trouve >= 0 ? trouve : meilleur;
    const cases = [];
    for (let i = fin; i >= 0 && i !== s; i = B.prev[i]) cases.push(i);
    cases.reverse();
    const pts = cases.map(i => [(i % w + 0.5) / FIN, (((i / w) | 0) + 0.5) / FIN]);
    if (!bloque[cible]) pts.push([x1, y1]);       // le dernier pas : exactement là où il va (s'asseoir sur la souche)
    // lissage
    const out = []; let px = x0, py = y0, k = 0;
    while (k < pts.length) {
      let far = k;
      for (let m = pts.length - 1; m > k; m--) if (ligneLibre(w, h, bloque, px, py, pts[m][0], pts[m][1])) { far = m; break; }
      out.push(pts[far]); px = pts[far][0]; py = pts[far][1]; k = far + 1;
    }
    return out;
  }
  return [[x1, y1]];
}

// ---------- L'état de chacun (gardé d'une image à l'autre : V.pnj est refait toutes les 800 ms) ----------
function etatDe(V, q) {
  const m = V.viePnj || (V.viePnj = new Map());
  let S = m.get(q.id);
  if (!S) {
    S = { x: q.x, y: q.y, dir: q.dir ?? Math.PI / 2, x0: q.x, y0: q.y, vie: null, m: null, etape: null, ch: null, t: 0, tSon: 0,
      ecoute: 0, attente: 0, marche: 0, pose: null, geste: null, tete: 0, bulle: null, tBulle: 4000 + Math.random() * 6000, tPas: 0, i: -1, nuit: null };
    m.set(q.id, S);
  }
  return S;
}
// pour qu'on te regarde quand tu parles (js/explore/interactions.js parler)
export function ecouter(V, id, ms = 5000) { const S = V && V.viePnj && V.viePnj.get(id); if (S) { S.ecoute = ms; S.bulle = null; } }

function pnjPar(V, id) { const S = V.viePnj && V.viePnj.get(id); if (S) return S; const q = V.pnj.find(o => o.id === id); return q || null; }
function point(V, S, v) {
  if (!v) return null;
  if (v === 'joueur') return [V.j.x, V.j.y];
  if (typeof v === 'string') { const o = pnjPar(V, v); return o ? [o.x, o.y] : null; }
  return v;
}
function choisir(V, q, S, vie) {
  if (S.nuit && vie.nuit) return vie.nuit;
  const l = (vie.moments || []).filter(m => !m.si || verifier(m.si));
  if (!l.length) return null;
  if (vie.ordre) { S.i = (S.i + 1) % l.length; return l[S.i]; }
  let tot = 0; for (const m of l) tot += m.poids ?? 1;
  let r = Math.random() * tot;
  for (const m of l) { r -= m.poids ?? 1; if (r <= 0 && m !== S.dernier) return m; }
  return l[0] === S.dernier && l.length > 1 ? l[1] : l[0];
}
function commencer(V, q, S, m, E, bloque) {
  S.m = m; S.dernier = m; S.etape = 'aller'; S.attente = 0;
  let but = null;
  if (typeof m.a === 'string') {   // près de quelqu'un : un endroit libre à un pas de lui
    const o = pnjPar(V, m.a), M = grilleMarge(E, bloque);
    if (o) for (let k = 0, a0 = Math.random() * TAU; k < 8; k++) { const a = a0 + k * TAU / 8, x = o.x + Math.cos(a) * 1.2, y = o.y + Math.sin(a) * 1.2, i = icase(E, x, y); if (i >= 0 && !M[i]) { but = [x, y]; break; } }
  }
  else if (m.a) but = m.a;
  if (m.errer) {
    const c = but || [S.x0, S.y0];
    for (let k = 0; k < 10; k++) {
      const a = Math.random() * TAU, d = Math.random() * m.errer, x = c[0] + Math.cos(a) * d, y = c[1] + Math.sin(a) * d, i = icase(E, x, y);
      if (i >= 0 && !grilleMarge(E, bloque)[i]) { but = [x, y]; break; }
    }
  }
  const etapes = [...(m.par || []), ...(but ? [but] : [])];
  S.ch = [];
  let px = S.x, py = S.y;
  for (const [x, y] of etapes) { const c = chemin(E, bloque, px, py, x, y) || [[x, y]]; S.ch.push(...c); px = x; py = y; }
  if (!S.ch.length) S.ch = null;
  if (S.pose === 'dort' || S.pose === 'allonge' || S.pose === 'assis' || S.pose === 'assis_tendu') S.leve = 600;   // le temps de se lever
}
function arriver(V, q, S, m) {
  S.etape = 'faire'; S.t = duree(m.ms); S.tSon = hasard(300, 1500);
  S.pose = m.pose || null; S.geste = m.geste || null;
  if (m.son) sfxA(m.son, S.x, S.y, q.etage, m.portee || 16);
  if (m.bulle && m.bulle.length && S.tBulle <= 0 && Math.random() < 0.75) dire(S, m.bulle);
}
function dire(S, l) { S.bulle = { txt: l[Math.floor(Math.random() * l.length)], t: 0, duree: 3600 }; S.tBulle = hasard(14000, 26000); }

// ---------- À chaque image ----------
// bloque : la grille fine de l'étage (portes fermées comprises) ; dt en ms.
export function animerPnj(V, dt, bloque) {
  const E = V.E, j = V.j; if (!E || !V.pnj) return;
  const nuit = estNuit();
  for (const q of V.pnj) {
    if (q.etage !== E.id) continue;
    const S = etatDe(V, q);
    const vie = q.vie;
    // sans vie : il reste où le jeu le met (un personnage de mission peut bouger), mais il tourne la tête vers toi
    if (!vie) { S.x = q.x; S.y = q.y; regarderJoueur(V, q, S, dt, q.dir ?? Math.PI / 2); q.tete = S.tete; continue; }
    if (S.vie !== vie) { S.vie = vie; S.m = null; S.i = -1; }
    if (S.nuit !== nuit) { S.nuit = nuit; if (S.ecoute <= 0) S.m = null; }
    S.tBulle -= dt;
    if (S.bulle) { S.bulle.t += dt; if (S.bulle.t > S.bulle.duree) S.bulle = null; }
    // on lui parle : il s'arrête et il te regarde (assis, il reste assis ; endormi, il dort)
    if (S.ecoute > 0) {
      S.ecoute -= dt; S.marche = Math.max(0, S.marche - dt / 200);
      if (S.pose !== 'dort') { tourner(S, Math.atan2(j.y - S.y, j.x - S.x), dt, 5); S.geste = null; }
      if (S.ecoute <= 0 && S.m && S.etape === 'faire') S.geste = S.m.geste || null;
      ecrire(q, S, dt); continue;
    }
    if (!S.m) { const m = choisir(V, q, S, vie); if (!m) { ecrire(q, S, dt); continue; } commencer(V, q, S, m, E, bloque); }
    const m = S.m;
    if (S.etape === 'aller') {
      if (S.leve > 0) { S.leve -= dt; ecrire(q, S, dt); continue; }
      S.pose = null; S.geste = null;
      const but = S.ch && S.ch[0];
      if (!but) { arriver(V, q, S, m); ecrire(q, S, dt); continue; }
      const dx = but[0] - S.x, dy = but[1] - S.y, d = Math.hypot(dx, dy);
      const v = (vie.vitesse || 2.2) * (m.vite || 1), pas = v * dt / 1000;
      // quelqu'un devant (toi) : il s'arrête, te regarde, et reprend quand tu t'es écarté·e
      const nx = S.x + (dx / (d || 1)) * Math.min(pas * 8, 0.9), ny = S.y + (dy / (d || 1)) * Math.min(pas * 8, 0.9);
      if (Math.hypot(j.x - nx, j.y - ny) < 0.75 && Math.hypot(j.x - S.x, j.y - S.y) < 1.6) {
        S.attente += dt; S.marche = Math.max(0, S.marche - dt / 180);
        tourner(S, Math.atan2(j.y - S.y, j.x - S.x), dt, 4);
        if (S.attente > 4000) { S.attente = 0; S.m = null; }
        ecrire(q, S, dt); continue;
      }
      S.attente = 0;
      if (d <= pas) { S.x = but[0]; S.y = but[1]; S.ch.shift(); if (!S.ch.length) arriver(V, q, S, m); }
      else { S.x += dx / d * pas; S.y += dy / d * pas; tourner(S, Math.atan2(dy, dx), dt, 7); }
      S.marche = Math.min(1, S.marche + dt / 160);
      // les pas (et la canne), à peine, quand on est près
      S.tPas -= dt * v / 2.2;
      if (S.tPas <= 0) { S.tPas = vie.canne ? 760 : 520; if (Math.hypot(j.x - S.x, j.y - S.y) < 7) sfxA(vie.canne && Math.random() < 0.5 ? 'canne' : 'pas_gravier', S.x, S.y, q.etage, 8, 0.4); }
      ecrire(q, S, dt); continue;
    }
    // il fait ce qu'il est venu faire
    S.marche = Math.max(0, S.marche - dt / 220);
    const reg = m.regard ? point(V, S, m.regard) : null;
    let visee = reg ? Math.atan2(reg[1] - S.y, reg[0] - S.x) : m.dir ?? S.dir;
    if (S.pose !== 'dort' && S.pose !== 'allonge') tourner(S, visee, dt, 3.5);
    if (m.sons && (S.tSon -= dt) <= 0) {
      const s = m.sons; S.tSon = duree(s.chaque || [1500, 4000]);
      sfxA(s.n[Math.floor(Math.random() * s.n.length)], S.x, S.y, q.etage, s.portee || 13, s.vol ?? 0.7);
    }
    if (m.bulle && m.bulle.length && !S.bulle && S.tBulle <= 0 && Math.hypot(j.x - S.x, j.y - S.y) < 7 && Math.random() < dt / 9000) dire(S, m.bulle);
    if ((S.t -= dt) <= 0) S.m = null;
    regarderJoueur(V, q, S, dt, null);
    ecrire(q, S, dt);
  }
}
function tourner(S, but, dt, vitesse) { const d = angle(but - S.dir), k = Math.min(1, vitesse * dt / 1000); S.dir = angle(S.dir + d * k); }
// la tête se tourne vers toi quand tu es tout près (s'il n'a pas les mains prises, et pas en dormant)
function regarderJoueur(V, q, S, dt, dirFixe) {
  if (dirFixe != null) S.dir = dirFixe;
  const j = V.j, d = Math.hypot(j.x - S.x, j.y - S.y);
  let but = 0;
  if (d < 3 && S.pose !== 'dort' && S.geste !== 'meca') but = Math.max(-1.1, Math.min(1.1, angle(Math.atan2(j.y - S.y, j.x - S.x) - S.dir)));
  S.tete += (but - S.tete) * Math.min(1, dt / 250);
}
function ecrire(q, S, dt) {
  q.x = S.x; q.y = S.y; q.dir = S.dir;
  q.marche = S.marche; q.pose = S.pose; q.geste = S.ecoute > 0 ? null : S.geste;
  q.allure = S.pose === 'accroupi' ? 'accroupi' : null;
  const m = S.m;
  q.outil = q.geste && m && m.outil ? m.outil : null;
  q.tete = S.tete;
  q.canne = !!(q.vie && q.vie.canne);
  q.couverture = (S.pose && m && m.couverture) || null;
  q.tremble = !!(m && m.tremble && S.etape === 'faire');
  q.bulle = S.bulle ? S.bulle.txt : null;
  q.bulleA = S.bulle ? Math.min(1, S.bulle.t / 250, (S.bulle.duree - S.bulle.t) / 400) : 0;
}
