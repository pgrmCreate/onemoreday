// ============ Simulation d'un lieu (HEADLESS, aucun DOM) — REFONTE §12.3 ============
// Tenue par une seule machine (solo, ou hôte en co-op). Gère N joueurs, les morts (IA temps réel),
// les portes (PV, verrous, drapeaux), les conteneurs (butin tiré une seule fois, graine du lieu),
// le sol, les cadavres, les bruits, la persistance (sauver()) et le repeuplement.
//
// creerSimLieu({ lieuId, niveau, etat, seed, danger, pool, …options }) → sim
// Options en plus du contrat (toutes facultatives) : minutes (horloge de jeu), typeButin, mortsN [min,max],
// repeuplement (morts/jour), coop (bool), difficulte (preset reglages.difficulte), jour, mult (× butin),
// getFlag(k) (drapeaux du monde : portes à drapeau), rng (graine des tirages non persistants).
import { REGLAGES, paramsJour } from '../data/reglages.js';
import { ZOMBIES } from '../data/zombies.js';
import { tirerButin, tirerButinTable, tirerLignes } from '../data/butin.js';
import { seedRng } from '../core/rng.js';
import { K, parserNiveau, cleCase, MATIERES } from './niveau.js';
import { deplacer, ligneLibre, obstaclesSon } from './physique.js';

const RX = REGLAGES.exploration, RP = RX.PERCEPTION, RF = REGLAGES.fouille;
const RAYON_JOUEUR = 0.3, RAYON_MORT = 0.3;
const DEG = Math.PI / 180;
const angDiff = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };

export function creerSimLieu(opts) {
  const {
    lieuId, seed = 1, danger = 0.3, minutes = 480, coop = false, getFlag = () => undefined,
  } = opts;
  const niveau = opts.niveau && opts.niveau.etages && opts.niveau.etages[0] && opts.niveau.etages[0].code ? opts.niveau : parserNiveau(opts.niveau || {});
  const pool = (opts.pool && opts.pool.length ? opts.pool : niveau.pool) || ['errant'];
  const typeButin = opts.typeButin || niveau.typeButin || 'defaut';
  const mortsN = opts.mortsN || (niveau.morts && niveau.morts.n) || [0, 0];
  const diff = opts.difficulte || REGLAGES.difficulte.PRESETS[REGLAGES.difficulte.DEFAUT];
  const jour = opts.jour || Math.floor(minutes / 1440) + 1;
  const multButin = (opts.mult || 1) * (diff.butin || 1);
  const rngSim = opts.rng || seedRng(`${seed}:sim:${lieuId}:${minutes}`);

  // --- grilles dynamiques (portes) ---
  const dyn = niveau.etages.map(E => ({ bloque: Uint8Array.from(E.bloque), opaque: Uint8Array.from(E.opaque) }));
  const EI = (id) => niveau.etageIdx[id];

  // --- état ---
  const portes = {};                 // cle → { etat, pv, pvMax, barricadee }
  const conteneurs = {};             // cle → { items: [...]|null, progres }
  let sol = [];                      // { uid, etage, x, y, id, qty } | { uid, etage, x, y, doc }
  let cadavres = [];                 // { uid, type, etage, x, y, dir }
  let zombies = [];
  let joues = [];                    // déclencheurs de zone joués (index)
  let uidSeq = 1;
  const joueurs = new Map();
  const bruits = [];                 // file de bruits à traiter au prochain tick
  let evts = [];
  let tFlag = 0;

  for (const p of niveau.portes) {
    const pvMax = p.exterieure ? RX.PORTES.PV_EXTERIEURE : RX.PORTES.PV;
    portes[p.cle] = { etat: p.etat, pv: pvMax, pvMax, barricadee: false };
  }

  // ---------- Création / restauration ----------
  const etat = opts.etat && opts.etat.v ? opts.etat : null;
  if (etat) {
    uidSeq = etat.uid || 1;
    for (const [cle, s] of Object.entries(etat.portes || {})) if (portes[cle]) Object.assign(portes[cle], s);
    for (const [cle, c] of Object.entries(etat.conteneurs || {})) conteneurs[cle] = { items: c.items, progres: c.progres || 0 };
    sol = (etat.sol || []).slice();
    cadavres = (etat.cadavres || []).slice();
    joues = (etat.joues || []).slice();
    for (const z of etat.zombies || []) { const zz = nouveauMort(z.type, z.etage, z.x, z.y, z.etat, z); if (zz) zombies.push(zz); }
    repeupler(etat.minutes);
  } else {
    // 1re visite : morts du plan + procéduraux, objets posés
    const r = seedRng(`${seed}:peuplement:${lieuId}`);
    for (const s of niveau.spawns) {
      const type = s.type || pool[Math.floor(r() * pool.length)];
      const z = nouveauMort(type, s.etage, s.x + 0.5, s.y + 0.5, s.etat || etatDepart(type, r), { hp: s.hp, dir: s.dir != null ? s.dir : r() * Math.PI * 2, plan: true });
      if (z) zombies.push(z);
    }
    const mult = (paramsJour(jour).mortsMult || 1) * (diff.mortsLieux || 1) * (coop ? REGLAGES.coop.MORTS_MULT : 1);
    const n = Math.round((mortsN[0] + Math.floor(r() * (mortsN[1] - mortsN[0] + 1))) * mult);
    placerProceduraux(n, r);
    for (const o of niveau.sol) sol.push({ uid: uidSeq++, etage: o.etage, x: o.x + 0.5, y: o.y + 0.5, ...(o.doc ? { doc: o.doc } : { id: o.id, qty: o.qty }) });
  }
  majPortesDyn();

  function etatDepart(type, r) {
    const d = ZOMBIES[type]; const e = (d && d.etats) || { erre: 0.5, immobile: 0.3, dort: 0.2 };
    let v = r(); for (const k in e) { v -= e[k]; if (v <= 0) return k; }
    return 'erre';
  }
  function nouveauMort(type, etage, x, y, et, extra = {}) {
    const def = ZOMBIES[type];
    if (!def || EI(etage) == null) { if (!def) console.warn(`[explore] mort inconnu « ${type} »`); return null; }
    const hpMax = Math.round((def.hp || 30) * (diff.pvMorts || 1));
    const base = et === 'alerte' || et === 'chasse' ? 'erre' : (et || 'erre');
    return {
      uid: extra.uid || `z${uidSeq++}`, type, def, etage, ei: EI(etage), x, y, dir: extra.dir || 0,
      etat: et || 'erre', base: extra.base || base, hp: extra.hp || hpMax, hpMax,
      alerte: 0, cible: null, chemin: [], ci: 0, tChemin: 0, tEtat: 0, joueur: null, derniere: null, memoire: 0,
      enCombat: null, etourdi: 0, tCogne: 0, porte: null, bloqueT: 0, lx: x, ly: y, charge: 0, tCharge: 0, cri: false,
      proc: !!extra.proc, vitesse: 0,
    };
  }
  // Cases candidates pour un mort procédural : marchables, loin des entrées, pièces sombres d'abord.
  function casesLibres(r) {
    const out = [];
    // loin des entrées ET des arrivées d'escalier (on ne tombe pas nez à nez en changeant d'étage)
    const entrees = Object.values(niveau.entrees).concat(niveau.escaliers.filter(s => s.arrivee).map(s => s.arrivee));
    niveau.etages.forEach((E) => {
      for (let i = 0; i < E.w * E.h; i++) {
        if (E.code[i] !== K.SOL || E.bloque[i] || E.piece[i] < 0) continue;
        const x = i % E.w + 0.5, y = ((i / E.w) | 0) + 0.5;
        let loin = true;
        for (const e of entrees) if (e.etage === E.id && Math.hypot(e.x + 0.5 - x, e.y + 0.5 - y) < 6) loin = false;
        if (!loin) continue;
        const P = niveau.pieces[E.piece[i]];
        const sombre = P.exterieur ? 0 : (P.sombre != null ? P.sombre : 1);
        out.push({ etage: E.id, x, y, poids: 1 + sombre * 2 + r() * 2 });
      }
    });
    out.sort((a, b) => b.poids - a.poids);
    return out;
  }
  function placerProceduraux(n, r) {
    if (n <= 0) return 0;
    const libres = casesLibres(r);
    let k = 0;
    for (let a = 0; a < libres.length && k < n; a++) {
      const c = libres[Math.floor(r() * Math.min(libres.length, 30 + n * 12))];
      if (!c || zombies.some(z => z.etage === c.etage && Math.hypot(z.x - c.x, z.y - c.y) < 3)) continue;
      const type = pool[Math.floor(r() * pool.length)];
      const z = nouveauMort(type, c.etage, c.x, c.y, etatDepart(type, r), { proc: true, dir: r() * Math.PI * 2 });
      if (z) { zombies.push(z); k++; }
    }
    return k;
  }
  function repeupler(avant) {
    if (avant == null) return;
    const R = RX.REPEUPLEMENT;
    const absMin = minutes - avant;
    if (absMin < R.DELAI_MIN_H * 60) return;
    const h = (minutes % 1440) / 60, H = REGLAGES.temps.HEURES;
    const nuit = h >= H.NUIT || h < H.AUBE;
    const r = seedRng(`${seed}:repeuplement:${lieuId}:${Math.floor(minutes / 60)}`);
    const taux = (opts.repeuplement ?? 0.3) * (absMin / 1440) * (nuit ? R.NUIT : 1) * (diff.repeuplement || 1) * (coop ? REGLAGES.coop.REPEUPLEMENT_MULT : 1);
    let n = Math.floor(taux + r());
    const vivantsProc = zombies.filter(z => z.proc).length;
    n = Math.min(n, Math.max(0, (mortsN[1] || 0) - vivantsProc));
    placerProceduraux(n, r);
  }

  // ---------- Portes ----------
  function majPortesDyn() {
    for (const p of niveau.portes) {
      const s = portes[p.cle]; const E = niveau.etages[EI(p.etage)]; const i = p.y * E.w + p.x;
      const ferme = s.etat === 'fermee' || s.etat === 'verrouillee';
      dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = ferme ? 1 : 0;
    }
  }
  function setPorte(cle, etatN, action, source) {
    const s = portes[cle]; const p = niveau.porteParCle[cle];
    s.etat = etatN;
    const E = niveau.etages[EI(p.etage)]; const i = p.y * E.w + p.x;
    const ferme = etatN === 'fermee' || etatN === 'verrouillee';
    dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = ferme ? 1 : 0;
    evts.push({ type: 'porte', cle, etat: etatN, pv: s.pv, pvMax: s.pvMax, action, source: source || null });
  }
  function caseOccupee(etage, x, y) {
    for (const j of joueurs.values()) if (j.etage === etage && Math.floor(j.x) === x && Math.floor(j.y) === y) return true;
    for (const j of joueurs.values()) if (j.etage === etage && Math.hypot(j.x - x - 0.5, j.y - y - 0.5) < 0.75) return true;
    for (const z of zombies) if (z.etage === etage && Math.hypot(z.x - x - 0.5, z.y - y - 0.5) < 0.75) return true;
    return false;
  }
  function flagOk(v) { return v && v.flag && !!getFlag(v.flag); }

  // ---------- Bruit ----------
  function bruit(b) {
    if (!b || EI(b.etage) == null || !(b.rayon > 0)) return;
    bruits.push({ etage: b.etage, x: b.x, y: b.y, rayon: b.rayon, source: b.source || null });
  }
  const tmpObs = { murs: 0, portes: 0 };
  function traiterBruits() {
    for (const b of bruits) {
      evts.push({ type: 'bruit', etage: b.etage, x: b.x, y: b.y, rayon: b.rayon, source: b.source });
      const E = niveau.etages[EI(b.etage)], D = dyn[E.idx];
      for (const z of zombies) {
        if (z.etage !== b.etage || z.enCombat || z.etat === 'fait_le_mort') continue;
        if (b.source === z.uid) continue;
        const d = Math.hypot(z.x - b.x, z.y - b.y);
        const ouie = z.def.ouie || 1;
        let r = b.rayon * ouie;
        if (d > r) continue;
        obstaclesSon(E, D.bloque, b.x, b.y, z.x, z.y, tmpObs);
        r *= Math.pow(RX.ATTENUATION.mur, tmpObs.murs) * Math.pow(RX.ATTENUATION.porte_fermee, tmpObs.portes);
        if (z.etat === 'dort') r *= 0.5;
        if (d > r) continue;
        entendre(z, b);
      }
    }
    bruits.length = 0;
  }
  function entendre(z, b) {
    const j = b.source && joueurs.get(b.source);
    if (z.etat === 'chasse') { if (j && z.joueur === j.id) { z.derniere = { x: b.x, y: b.y }; z.memoire = RP.MEMOIRE_MS; } return; }
    if (z.base === 'cogne' && z.etat === 'cogne') return;     // ils cognent, ils n'écoutent plus
    changerEtat(z, 'alerte');
    z.cible = { x: b.x, y: b.y }; z.tEtat = RP.ALERTE_MS; z.chemin = []; z.tChemin = 0;
    if (j) z.alerte = Math.max(z.alerte, 0.35);
  }
  function changerEtat(z, e) {
    if (z.etat === e) return;
    const ancien = z.etat; z.etat = e;
    evts.push({ type: 'zombie', uid: z.uid, etat: e, ancien });
    if (e === 'chasse' && z.def.special === 'hurle' && !z.cri) {
      z.cri = true;
      bruit({ etage: z.etage, x: z.x, y: z.y, rayon: 30, source: z.uid });
      evts.push({ type: 'hurlement', uid: z.uid, etage: z.etage, x: z.x, y: z.y });
    }
  }

  // ---------- Perception ----------
  function lumiereCat(j) { const S = REGLAGES.lumiere.SEUILS; return j.lumiere < S.penombre ? 'noir' : j.lumiere < S.eclaire ? 'penombre' : 'eclaire'; }
  // Portée à laquelle ce mort voit ce joueur (0 si hors cône et pas de lampe…)
  function porteeVue(z, j, d, dansCone) {
    const V = z.def.vue || 8;
    let R = V * RP.VUE_LUMIERE[lumiereCat(j)];
    if (j.allure === 'accroupi') R *= RP.ACCROUPI;
    R *= Math.max(0.3, 1 - RP.DISCRETION_VUE * (j.discretion || 0));
    if (j.lampe) {
      R = Math.max(R, V * RP.LAMPE_ALLUMEE);
      // mort dans le faisceau ?
      const a = Math.atan2(z.y - j.y, z.x - j.x);
      const S = REGLAGES.lumiere.SOURCES[j.lampeSource] || REGLAGES.lumiere.SOURCES.lampe_torche;
      if (S.forme === 'halo' ? d <= S.portee : (Math.abs(angDiff(a, j.dir)) <= (S.angle || 60) * DEG / 2 && d <= S.portee + 1)) R = Math.max(R, V * RP.FAISCEAU_VU);
    }
    return dansCone ? R : 0;
  }
  function percevoir(z, dt) {
    if (z.etat === 'dort' || z.enCombat || z.etourdi > 0) return null;
    const E = niveau.etages[z.ei], D = dyn[z.ei];
    let vu = null, dVu = Infinity, Rvu = 0;
    for (const j of joueurs.values()) {
      if (j.etage !== z.etage || j.enCombat || j.aTerre) continue;
      const d = Math.hypot(j.x - z.x, j.y - z.y);
      if (z.etat === 'fait_le_mort') { if (d <= 1.5) { vu = j; dVu = d; Rvu = 2; } continue; }
      if (d > 30) continue;
      const a = Math.atan2(j.y - z.y, j.x - z.x);
      const chasse = z.etat === 'chasse' && z.joueur === j.id;
      const dansCone = chasse || Math.abs(angDiff(a, z.dir)) <= RP.CONE_DEG * DEG / 2 || d < 1.1;
      let R = porteeVue(z, j, d, dansCone);
      if (chasse) R = Math.max(R, 6);
      if (d > R) continue;
      if (!ligneLibre(E.w, E.h, D.opaque, z.x, z.y, j.x, j.y)) continue;
      if (d < dVu) { vu = j; dVu = d; Rvu = R; }
    }
    if (vu) {
      if (z.etat === 'fait_le_mort') { z.alerte = 1; }
      else if (z.etat !== 'chasse') {
        const T = RP.DETECTION_MS.pres + (RP.DETECTION_MS.loin - RP.DETECTION_MS.pres) * Math.min(1, dVu / Math.max(1, Rvu));
        z.alerte = Math.min(1, z.alerte + dt / T);
        // il se tourne vers ce qui l'intrigue
        if (z.alerte > 0.25) tourner(z, Math.atan2(vu.y - z.y, vu.x - z.x), dt, 3);
      }
      if (z.alerte >= 1 || z.etat === 'chasse') {
        z.alerte = 1;
        if (z.etat !== 'chasse') { changerEtat(z, 'chasse'); z.chemin = []; z.tChemin = 0; }
        z.joueur = vu.id; z.derniere = { x: vu.x, y: vu.y }; z.memoire = RP.MEMOIRE_MS;
      }
    } else if (z.etat !== 'chasse') {
      z.alerte = Math.max(0, z.alerte - RP.DETECTION_OUBLI_S * dt / 1000);
    }
    return vu;
  }
  function tourner(z, cible, dt, vit) {
    const d = angDiff(cible, z.dir);
    const m = vit * dt / 1000;
    z.dir += Math.abs(d) <= m ? d : Math.sign(d) * m;
  }

  // ---------- Chemins (BFS 8 directions sans couper les coins ; portes fermées traversables = on cogne) ----------
  const bfsBuf = niveau.etages.map(E => ({ vu: new Uint32Array(E.w * E.h), prev: new Int32Array(E.w * E.h), file: new Int32Array(E.w * E.h), stamp: 0 }));
  const D8X = [1, -1, 0, 0, 1, 1, -1, -1], D8Y = [0, 0, 1, -1, 1, -1, 1, -1];
  function passable(E, D, i) { return !D.bloque[i] || (E.code[i] === K.PORTE && portes[niveau.portes[E.porte[i]].cle].etat !== 'ouverte'); }
  function chemin(z, tx, ty, maxProf = 60, aleatoire = false) {
    const E = niveau.etages[z.ei], D = dyn[z.ei], B = bfsBuf[z.ei];
    const w = E.w, h = E.h;
    const s = Math.floor(z.y) * w + Math.floor(z.x);
    const t = (tx >= 0 && ty >= 0 && tx < w && ty < h) ? ty * w + tx : -1;
    B.stamp++; const st = B.stamp;
    let a = 0, b = 0;
    B.file[b++] = s; B.vu[s] = st; B.prev[s] = -1;
    let trouve = -1, prof = 0, finNiv = b;
    const cands = aleatoire ? [] : null;
    while (a < b) {
      if (a === finNiv) { prof++; finNiv = b; if (prof > maxProf) break; }
      const i = B.file[a++];
      if (i === t) { trouve = i; break; }
      if (cands && i !== s && !D.bloque[i]) cands.push(i);
      const x = i % w, y = (i / w) | 0;
      for (let k = 0; k < 8; k++) {
        const nx = x + D8X[k], ny = y + D8Y[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (B.vu[j] === st) continue;
        if (k >= 4 && (D.bloque[y * w + nx] || D.bloque[ny * w + x] || D.bloque[j])) continue;
        if (!passable(E, D, j)) continue;
        B.vu[j] = st; B.prev[j] = i; B.file[b++] = j;
      }
    }
    if (cands) { if (!cands.length) return null; trouve = cands[Math.floor(rngSim() * cands.length)]; }
    if (trouve < 0) return null;
    const out = [];
    for (let i = trouve; i !== s && i >= 0; i = B.prev[i]) out.push(i);
    out.reverse();
    return out;
  }

  // ---------- IA des morts ----------
  const posTmp = { x: 0, y: 0 };
  function avancerVers(z, tx, ty, v, dt) {
    const E = niveau.etages[z.ei], D = dyn[z.ei];
    const dx = tx - z.x, dy = ty - z.y, d = Math.hypot(dx, dy);
    if (d < 1e-3) return true;
    const pas = Math.min(d, v * dt / 1000);
    tourner(z, Math.atan2(dy, dx), dt, 6);
    posTmp.x = z.x; posTmp.y = z.y;
    deplacer(E.w, E.h, D.bloque, posTmp, dx / d * pas, dy / d * pas, RAYON_MORT);
    z.x = posTmp.x; z.y = posTmp.y;
    return d - pas < 0.12;
  }
  // Suit z.chemin ; renvoie 'fini' | 'porte' | 'marche'
  function suivreChemin(z, v, dt) {
    const E = niveau.etages[z.ei];
    if (z.ci >= z.chemin.length) return 'fini';
    const i = z.chemin[z.ci];
    if (E.code[i] === K.PORTE) {
      const p = niveau.portes[E.porte[i]]; const s = portes[p.cle];
      if (s.etat === 'fermee' || s.etat === 'verrouillee') {
        const d = Math.hypot(p.x + 0.5 - z.x, p.y + 0.5 - z.y);
        if (d > 1.05) { avancerVers(z, p.x + 0.5, p.y + 0.5, v, dt); return 'marche'; }
        z.porte = p.cle; tourner(z, Math.atan2(p.y + 0.5 - z.y, p.x + 0.5 - z.x), dt, 6);
        return 'porte';
      }
    }
    z.porte = null;
    if (avancerVers(z, i % E.w + 0.5, ((i / E.w) | 0) + 0.5, v, dt)) z.ci++;
    return 'marche';
  }
  function cogner(z, dt, degats) {
    const s = portes[z.porte]; if (!s) return;
    z.tCogne += dt;
    if (z.tCogne < RX.PORTES.COGNE_PERIODE_MS) return;
    z.tCogne = 0;
    const p = niveau.porteParCle[z.porte];
    bruit({ etage: p.etage, x: p.x + 0.5, y: p.y + 0.5, rayon: RX.BRUIT.porte, source: z.uid });
    if (!degats) { evts.push({ type: 'porte', cle: z.porte, etat: s.etat, pv: s.pv, pvMax: s.pvMax, action: 'coup', source: z.uid }); return; }
    s.pv = Math.max(0, s.pv - (z.def.cogne || 4));
    if (s.pv <= 0) { setPorte(z.porte, 'cassee', 'casse', z.uid); z.porte = null; z.chemin = []; }
    else evts.push({ type: 'porte', cle: z.porte, etat: s.etat, pv: s.pv, pvMax: s.pvMax, action: 'coup', source: z.uid });
  }
  function majMort(z, dt) {
    if (z.enCombat) return;
    if (z.etourdi > 0) { z.etourdi -= dt; return; }
    const vu = percevoir(z, dt);
    const def = z.def;
    z.vitesse = 0;
    switch (z.etat) {
      case 'dort': case 'fait_le_mort': return;
      case 'immobile': {
        z.tEtat -= dt;
        if (z.tEtat <= 0) { z.tEtat = 3000 + rngSim() * 6000; z.dirVisee = z.dir + (rngSim() - 0.5) * 1.6; }
        if (z.alerte < 0.25 && z.dirVisee != null) tourner(z, z.dirVisee, dt, 0.8);
        return;
      }
      case 'cogne': {
        if (!z.porte) { // cherche la porte la plus proche (≤ 2 cases)
          let best = null, bd = 2.2;
          for (const p of niveau.portes) if (p.etage === z.etage) { const d = Math.hypot(p.x + 0.5 - z.x, p.y + 0.5 - z.y); if (d < bd && portes[p.cle].etat !== 'ouverte' && portes[p.cle].etat !== 'cassee') { bd = d; best = p; } }
          if (best) z.porte = best.cle; else { z.etat = 'immobile'; z.base = 'immobile'; return; }
        }
        const s = portes[z.porte];
        if (s.etat === 'ouverte' || s.etat === 'cassee') { z.porte = null; z.base = 'erre'; changerEtat(z, 'alerte'); z.cible = null; z.tEtat = RP.ALERTE_MS; return; }
        const p = niveau.porteParCle[z.porte];
        tourner(z, Math.atan2(p.y + 0.5 - z.y, p.x + 0.5 - z.x), dt, 4);
        cogner(z, dt, false);
        return;
      }
      case 'erre': {
        const v = def.vitesse || 0.5;
        if (z.tEtat > 0) { z.tEtat -= dt; return; }
        if (!z.chemin.length || z.ci >= z.chemin.length) {
          const c = chemin(z, -1, -1, 6, true);
          if (c && c.length) { z.chemin = c; z.ci = 0; } else { z.tEtat = 2000; return; }
        }
        const r = suivreChemin(z, v, dt);
        z.vitesse = v;
        if (r === 'fini' || r === 'porte') { z.chemin = []; z.tEtat = 2000 + rngSim() * 5000; }
        return;
      }
      case 'alerte': {
        z.tEtat -= dt;
        if (z.tEtat <= 0) { retourBase(z); return; }
        if (!z.cible) return;
        const v = ((def.vitesse || 0.5) + (def.vitesseChasse || 1.8)) / 2;
        z.tChemin -= dt;
        if (z.tChemin <= 0 && (!z.chemin.length || z.ci >= z.chemin.length)) {
          z.tChemin = 800;
          const c = chemin(z, Math.floor(z.cible.x), Math.floor(z.cible.y), 50);
          z.chemin = c || []; z.ci = 0;
        }
        const r = suivreChemin(z, v, dt);
        z.vitesse = r === 'marche' ? v : 0;
        if (r === 'porte') cogner(z, dt, false);
        if (r === 'fini' && Math.hypot(z.cible.x - z.x, z.cible.y - z.y) < 1.5) { z.cible = null; z.tEtat = Math.min(z.tEtat, RP.ALERTE_MS * 0.6); }
        return;
      }
      case 'chasse': {
        const j = joueurs.get(z.joueur);
        const vC = (def.vitesseChasse || 1.8);
        // charge (colosse, fauve, sanglier)
        if (def.special === 'charge' && def.params) {
          const P = def.params;
          z.tCharge -= dt;
          if (z.charge > 0) {
            z.charge -= dt;
            const E = niveau.etages[z.ei], D = dyn[z.ei];
            const pas = P.vitesse * dt / 1000;
            const nx = z.x + Math.cos(z.dir) * pas, ny = z.y + Math.sin(z.dir) * pas;
            const ci = Math.floor(ny) * E.w + Math.floor(nx);
            if (P.porte === 'enfonce' && E.code[ci] === K.PORTE && D.bloque[ci]) {
              const p = niveau.portes[E.porte[ci]]; portes[p.cle].pv = 0; setPorte(p.cle, 'cassee', 'enfoncee', z.uid);
              bruit({ etage: z.etage, x: nx, y: ny, rayon: RX.BRUIT.porte_forcee, source: z.uid });
            }
            posTmp.x = z.x; posTmp.y = z.y;
            deplacer(E.w, E.h, D.bloque, posTmp, Math.cos(z.dir) * pas, Math.sin(z.dir) * pas, RAYON_MORT);
            z.x = posTmp.x; z.y = posTmp.y; z.vitesse = P.vitesse;
            return;
          }
          if (vu && j && z.tCharge <= 0 && Math.hypot(j.x - z.x, j.y - z.y) <= (P.declenche || 5)) {
            z.dir = Math.atan2(j.y - z.y, j.x - z.x); z.charge = P.dureeMs || 1000; z.tCharge = 6000;
            evts.push({ type: 'charge', uid: z.uid });
            return;
          }
        }
        if (!vu) {
          z.memoire -= dt;
          if (z.memoire <= 0 || !z.derniere) { changerEtat(z, 'alerte'); z.cible = z.derniere ? { x: z.derniere.x + (rngSim() - 0.5) * 4, y: z.derniere.y + (rngSim() - 0.5) * 4 } : null; z.tEtat = RP.ALERTE_MS * 0.5; z.alerte = 0.5; z.chemin = []; return; }
        }
        const cx = vu && j ? j.x : z.derniere.x, cy = vu && j ? j.y : z.derniere.y;
        z.tChemin -= dt;
        const dCible = Math.hypot(cx - z.x, cy - z.y);
        if (dCible < 1.2 && vu) { avancerVers(z, cx, cy, vC, dt); z.vitesse = vC; return; }
        if (z.tChemin <= 0 || z.ci >= z.chemin.length) {
          z.tChemin = 400;
          const c = chemin(z, Math.floor(cx), Math.floor(cy), 70);
          if (c) { z.chemin = c; z.ci = 0; }
          else { z.chemin = []; avancerVers(z, cx, cy, vC, dt); z.vitesse = vC; return; }
        }
        const r = suivreChemin(z, vC, dt);
        z.vitesse = r === 'marche' ? vC : 0;
        if (r === 'porte') cogner(z, dt, true);
        if (r === 'fini' && !vu && dCible < 1.2) z.memoire = Math.min(z.memoire, 2500);
        return;
      }
    }
  }
  function retourBase(z) {
    z.cible = null; z.chemin = []; z.alerte = Math.min(z.alerte, 0.2);
    const b = z.base === 'dort' || z.base === 'fait_le_mort' || z.base === 'cogne' ? 'immobile' : z.base;
    changerEtat(z, b || 'erre'); z.tEtat = 1500;
  }
  function separer(dt) {
    for (let a = 0; a < zombies.length; a++) {
      const A = zombies[a];
      for (let b = a + 1; b < zombies.length; b++) {
        const B = zombies[b];
        if (A.etage !== B.etage) continue;
        const dx = B.x - A.x, dy = B.y - A.y, d2 = dx * dx + dy * dy;
        if (d2 >= 0.36 || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), p = (0.6 - d) * 0.5;
        const E = niveau.etages[A.ei], D = dyn[A.ei];
        if (!A.enCombat && A.etat !== 'dort') { posTmp.x = A.x; posTmp.y = A.y; deplacer(E.w, E.h, D.bloque, posTmp, -dx / d * p, -dy / d * p, RAYON_MORT); A.x = posTmp.x; A.y = posTmp.y; }
        if (!B.enCombat && B.etat !== 'dort') { posTmp.x = B.x; posTmp.y = B.y; deplacer(E.w, E.h, D.bloque, posTmp, dx / d * p, dy / d * p, RAYON_MORT); B.x = posTmp.x; B.y = posTmp.y; }
      }
    }
  }

  // ---------- Contacts ----------
  function contacts() {
    for (const j of joueurs.values()) {
      if (j.aTerre) continue;
      let proche = null, dp = Infinity;
      for (const z of zombies) {
        if (z.etage !== j.etage || z.enCombat || z.etourdi > 0) continue;
        const d = Math.hypot(z.x - j.x, z.y - j.y);
        // se cogner à un mort endormi le réveille
        if ((z.etat === 'dort' || z.etat === 'immobile' || z.etat === 'erre') && d < 0.8) { changerEtat(z, 'chasse'); z.alerte = 1; z.joueur = j.id; z.derniere = { x: j.x, y: j.y }; z.memoire = RP.MEMOIRE_MS; }
        if (z.etat !== 'chasse' && z.etat !== 'alerte') continue;
        if (z.etat === 'alerte' && z.alerte < 0.5) continue;
        if (d <= RP.CONTACT_CASES + 0.02 && d < dp) { dp = d; proche = z; }
      }
      if (!proche) continue;
      if (j.enCombat) { // renfort : le combat attire
        if (RP.RENFORT_PENDANT_COMBAT) { proche.enCombat = j.id; evts.push({ type: 'renfort', joueur: j.id, zombies: [descMort(proche)] }); }
        continue;
      }
      const groupe = [proche];
      for (const z of zombies) {
        if (z === proche || z.etage !== j.etage || z.enCombat || z.etat !== 'chasse') continue;
        if (Math.hypot(z.x - j.x, z.y - j.y) <= RP.REJOINDRE_CASES) groupe.push(z);
      }
      const a = Math.atan2(proche.y - j.y, proche.x - j.x);
      const surprise = Math.abs(angDiff(a, j.dir)) > 100 * DEG ? 'surpris' : 'normal';
      engager(j, groupe);
      evts.push({ type: 'contact', joueur: j.id, zombies: groupe.map(descMort), surprise, lieuId });
    }
  }
  function engager(j, groupe) {
    j.enCombat = true;
    for (const z of groupe) { z.enCombat = j.id; z.chemin = []; z.charge = 0; if (z.etat !== 'chasse') changerEtat(z, 'chasse'); z.joueur = j.id; }
  }
  const descMort = (z) => ({ uid: z.uid, type: z.type, hp: z.hp });

  // ---------- Joueurs ----------
  function tickJoueurs(dt) {
    for (const j of joueurs.values()) {
      const dd = Math.hypot(j.x - j.px, j.y - j.py);
      j.px = j.x; j.py = j.y;
      if (j.enCombat) continue;
      // pas
      if (dd > 0.02 && j.allure !== 'immobile') {
        j.tPas += dt;
        const periode = j.allure === 'course' ? 300 : j.allure === 'accroupi' ? 700 : 450;
        if (j.tPas >= periode) {
          j.tPas = 0;
          const E = niveau.etages[j.ei];
          const i = Math.floor(j.y) * E.w + Math.floor(j.x);
          let mat = MATIERES[E.sol[i]] || 'beton';
          if (E.deco[i] === 3) mat = 'debris';
          const kSol = RX.BRUIT_SOL[mat] ?? 1;
          const kDis = Math.max(0.5, 1 - RX.BRUIT_DISCRETION * (j.discretion || 0));
          const r = (RX.BRUIT[j.allure] ?? RX.BRUIT.marche) * kSol * kDis * (j.bruitPas || 1);
          bruit({ etage: j.etage, x: j.x, y: j.y, rayon: r, source: j.id });
        }
      }
      // fouille : un bruit par seconde
      if (j.fouille) {
        j.fouille.t += dt;
        if (j.fouille.t >= 1000) {
          j.fouille.t -= 1000;
          const m = niveau.meubleParCle[j.fouille.cle];
          const cat = m ? m.cat : 'defaut';
          const kDis = Math.max(0.5, 1 - RX.BRUIT_DISCRETION * (j.discretion || 0));
          bruit({ etage: j.etage, x: j.x, y: j.y, rayon: (RF.BRUIT[cat] ?? RF.BRUIT.defaut) * kDis, source: j.id });
        }
      }
    }
  }

  // ---------- API ----------
  function ajouterJoueur(id, pos = {}, info = {}) {
    const e = pos.etage && EI(pos.etage) != null ? pos.etage : niveau.entrees.defaut.etage;
    const j = {
      id, nom: info.nom || id, etage: e, ei: EI(e), x: pos.x ?? niveau.entrees.defaut.x + 0.5, y: pos.y ?? niveau.entrees.defaut.y + 0.5,
      dir: pos.dir || 0, allure: 'immobile', lumiere: 1, lampe: false, lampeSource: null, discretion: info.discretion || 0,
      bruitPas: info.bruitPas || 1, enCombat: false, aTerre: false, fouille: null, tPas: 0, px: 0, py: 0,
    };
    j.px = j.x; j.py = j.y;
    joueurs.set(id, j);
    return j;
  }
  function majJoueur(id, p) {
    const j = joueurs.get(id); if (!j || !p) return;
    if (p.etage != null && p.etage !== j.etage && EI(p.etage) != null) { j.etage = p.etage; j.ei = EI(p.etage); j.px = p.x ?? j.x; j.py = p.y ?? j.y; if (j.fouille) j.fouille = null; }
    if (p.x != null) j.x = p.x; if (p.y != null) j.y = p.y;
    if (p.dir != null) j.dir = p.dir;
    if (p.allure) j.allure = p.allure;
    if (p.lumiere != null) j.lumiere = p.lumiere;
    if (p.lampe != null) j.lampe = !!p.lampe;
    if (p.lampeSource !== undefined) j.lampeSource = p.lampeSource;
    if (p.discretion != null) j.discretion = p.discretion;
    if (p.bruitPas != null) j.bruitPas = p.bruitPas;
    if (p.nom) j.nom = p.nom;
    if (p.aTerre != null) j.aTerre = !!p.aTerre;
  }
  function retirerJoueur(id) {
    joueurs.delete(id);
    for (const z of zombies) if (z.joueur === id) { z.joueur = null; if (z.etat === 'chasse') { changerEtat(z, 'alerte'); z.tEtat = RP.ALERTE_MS * 0.5; } if (z.enCombat === id) z.enCombat = null; }
  }

  function porte(cle, action = 'basculer', joueurId = null) {
    const p = niveau.porteParCle[cle], s = portes[cle];
    if (!p) return { ok: false, raison: 'inconnue' };
    const j = joueurId && joueurs.get(joueurId);
    const bx = p.x + 0.5, by = p.y + 0.5;
    if (s.etat === 'cassee') return { ok: false, raison: 'cassee' };
    if (action === 'basculer') action = s.etat === 'ouverte' ? 'fermer' : 'ouvrir';
    if (s.etat === 'verrouillee' && p.verrou && flagOk(p.verrou)) { s.etat = 'fermee'; p._flagOuvert = true; }
    switch (action) {
      case 'ouvrir':
        if (s.etat === 'verrouillee') {
          const v = p.verrou || {};
          return { ok: false, raison: v.flag && !v.cle && !v.forcer ? 'flag' : 'verrouillee', verrou: v };
        }
        if (s.etat === 'ouverte') return { ok: true };
        setPorte(cle, 'ouverte', 'ouvre', joueurId);
        bruit({ etage: p.etage, x: bx, y: by, rayon: RX.BRUIT.porte * (s.barricadee ? 1.5 : 1), source: joueurId });
        return { ok: true };
      case 'fermer': case 'claquer':
        if (s.etat !== 'ouverte') return { ok: true };
        if (caseOccupee(p.etage, p.x, p.y)) return { ok: false, raison: 'occupee' };
        setPorte(cle, 'fermee', 'ferme', joueurId);
        bruit({ etage: p.etage, x: bx, y: by, rayon: action === 'claquer' || (j && j.allure === 'course') ? RX.BRUIT.porte_claque : RX.BRUIT.porte, source: joueurId });
        return { ok: true };
      case 'deverrouiller': // clé : l'appelant a vérifié l'inventaire
        if (s.etat !== 'verrouillee') return { ok: true };
        s.etat = 'fermee'; setPorte(cle, 'ouverte', 'deverrouille', joueurId);
        bruit({ etage: p.etage, x: bx, y: by, rayon: 1, source: joueurId });
        return { ok: true };
      case 'crocheter':
        if (s.etat !== 'verrouillee') return { ok: true };
        setPorte(cle, 'ouverte', 'crochete', joueurId);
        bruit({ etage: p.etage, x: bx, y: by, rayon: 1, source: joueurId });
        return { ok: true };
      case 'forcer':
        if (s.etat !== 'verrouillee' && s.etat !== 'fermee') return { ok: true };
        s.pv = Math.max(1, Math.round(s.pv * 0.6));
        setPorte(cle, 'ouverte', 'force', joueurId);
        bruit({ etage: p.etage, x: bx, y: by, rayon: RX.BRUIT.porte_forcee, source: joueurId });
        return { ok: true };
      case 'barricader':
        if (s.etat === 'ouverte') { if (caseOccupee(p.etage, p.x, p.y)) return { ok: false, raison: 'occupee' }; setPorte(cle, 'fermee', 'ferme', joueurId); }
        s.barricadee = true; s.pv = s.pvMax = RX.PORTES.PV_BARRICADEE;
        evts.push({ type: 'porte', cle, etat: s.etat, pv: s.pv, pvMax: s.pvMax, action: 'barricade', source: joueurId });
        return { ok: true };
    }
    return { ok: false, raison: 'action' };
  }

  function sansLumiere(j) { return j && !j.lampe && j.lumiere < REGLAGES.lumiere.SEUILS.penombre; }
  function tirer(cle, j) {
    const c = conteneurs[cle];
    if (c && c.items) return c;
    const m = niveau.meubleParCle[cle];
    let items = [];
    const r = seedRng(`${seed}:butin:${lieuId}:${cle.replace(':', ':')}`);
    const optsB = { taille: m ? m.taille : 1, danger, jour, coop, sansLumiere: sansLumiere(j), mult: multButin };
    if (m) {
      if (m.items) items = m.items.map(i => ({ ...i }));
      if (m.table === undefined) items = items.concat(tirerButin(typeButin, m.cat, r, optsB));
      else if (m.table) items = items.concat(tirerButinTable(m.table, Math.min(RF.TIRAGES_MAX, Math.ceil(RF.TIRAGES + RF.TIRAGES_PAR_CASE * (m.taille - 1))), r, optsB));
    } else if (cle.startsWith('cad:')) {
      const cad = cadavres.find(c2 => 'cad:' + c2.uid === cle);
      const def = cad && ZOMBIES[cad.type];
      if (def && def.butin) items = tirerLignes(def.butin, r, { ...optsB, passes: 1 });
    }
    return (conteneurs[cle] = { items, progres: 0 });
  }
  function fouiller(joueurId, cle) {
    const j = joueurs.get(joueurId);
    const m = niveau.meubleParCle[cle];
    const estCad = cle.startsWith('cad:');
    if ((!m || !m.conteneur) && !estCad) return { items: [], dureeMs: 0, progres: 1, erreur: 'pas un conteneur' };
    const c = tirer(cle, j);
    let s;
    if (estCad) s = 2;
    else s = (RF.DUREE_S[m.cat] ?? RF.DUREE_S.defaut) + RF.PAR_CASE_S * Math.max(0, m.taille - 1);
    if (sansLumiere(j)) s *= RF.SANS_LUMIERE.duree;
    let aide = false;
    for (const o of joueurs.values()) if (o !== j && o.fouille && o.fouille.cle === cle) aide = true;
    if (aide) s /= RF.AIDE_COOP;
    if (j) j.fouille = { cle, t: 0 };
    return { items: c.items.map(i => ({ ...i })), dureeMs: Math.round(s * 1000), progres: c.progres || 0, nom: m ? m.nom : 'le corps' };
  }
  function arreterFouille(joueurId, progres) {
    const j = joueurs.get(joueurId);
    if (!j || !j.fouille) return;
    const c = conteneurs[j.fouille.cle];
    if (c && progres != null) c.progres = Math.max(c.progres || 0, Math.min(1, progres));
    j.fouille = null;
  }
  function prendre(joueurId, cle, index) {
    if (cle.startsWith('#sol:')) { // objet posé par terre (« #sol:uid ») — pas un meuble de l'étage « sol »
      const uid = +cle.slice(5);
      const k = sol.findIndex(o => o.uid === uid);
      if (k < 0) return null;
      const o = sol.splice(k, 1)[0];
      evts.push({ type: 'sol', action: 'pris', uid, joueur: joueurId });
      return o.doc ? { doc: o.doc } : { id: o.id, qty: o.qty };
    }
    const c = conteneurs[cle];
    if (!c || !c.items || index < 0 || index >= c.items.length) return null;
    const it = c.items.splice(index, 1)[0];
    evts.push({ type: 'conteneur', cle, reste: c.items.length, joueur: joueurId });
    return it;
  }
  function deposer(joueurId, pos, item) {
    const j = joueurs.get(joueurId);
    const e = (pos && pos.etage) || (j && j.etage);
    if (!item || EI(e) == null) return null;
    const o = { uid: uidSeq++, etage: e, x: pos && pos.x != null ? pos.x : j.x, y: pos && pos.y != null ? pos.y : j.y, ...(item.doc ? { doc: item.doc } : { id: item.id, qty: item.qty || 1 }) };
    sol.push(o);
    evts.push({ type: 'sol', action: 'pose', uid: o.uid, joueur: joueurId });
    return o;
  }
  function retirerZombies(uids, { tues = false } = {}) {
    const set = new Set(uids || []);
    const restants = [];
    for (const z of zombies) {
      if (!set.has(z.uid)) { restants.push(z); continue; }
      if (tues) cadavres.push({ uid: z.uid, type: z.type, etage: z.etage, x: z.x, y: z.y, dir: z.dir });
    }
    zombies = restants;
    libererJoueurs();
  }
  function repousserZombies(uids, depuis) {
    const set = new Set(uids || []);
    const RC = REGLAGES.combat.FUITE || {};
    for (const z of zombies) {
      if (!set.has(z.uid)) continue;
      const E = niveau.etages[z.ei], D = dyn[z.ei];
      const ox = depuis && depuis.x != null ? depuis.x : z.x - Math.cos(z.dir), oy = depuis && depuis.y != null ? depuis.y : z.y - Math.sin(z.dir);
      let a = Math.atan2(z.y - oy, z.x - ox);
      if (!isFinite(a)) a = rngSim() * Math.PI * 2;
      posTmp.x = z.x; posTmp.y = z.y;
      deplacer(E.w, E.h, D.bloque, posTmp, Math.cos(a) * (RC.REPOUSSE_CASES || 4), Math.sin(a) * (RC.REPOUSSE_CASES || 4), RAYON_MORT);
      z.x = posTmp.x; z.y = posTmp.y;
      z.enCombat = null; z.etourdi = RC.ETOURDI_MS || 3000; z.chemin = []; z.alerte = 1;
      if (z.etat !== 'chasse') changerEtat(z, 'chasse');
      z.memoire = RP.MEMOIRE_MS;
    }
    libererJoueurs();
  }
  function libererJoueurs() {
    for (const j of joueurs.values()) if (j.enCombat && !zombies.some(z => z.enCombat === j.id)) j.enCombat = false;
  }
  function finCombat(joueurId) {
    const j = joueurs.get(joueurId); if (j) j.enCombat = false;
    for (const z of zombies) if (z.enCombat === joueurId) { z.enCombat = null; z.etourdi = 1000; }
  }
  // Attaque au contact (touche Interagir face à un mort) : { ok, furtif, dos, zombie, groupe }.
  // Marque le groupe « en combat » ; l'appelant résout (mise à mort silencieuse → retirerZombies + finCombat,
  // sinon flow.combattre avec surprise 'engage').
  function attaquer(joueurId, uid) {
    const j = joueurs.get(joueurId); const z = zombies.find(q => q.uid === uid);
    if (!j || !z || z.enCombat || j.enCombat || z.etage !== j.etage) return { ok: false };
    if (Math.hypot(z.x - j.x, z.y - j.y) > RX.INTERACTION_CASES + 0.3) return { ok: false, raison: 'loin' };
    const nonAlerte = z.etat === 'dort' || z.etat === 'immobile' || z.etat === 'erre' || z.etat === 'fait_le_mort' || z.etat === 'cogne' || (z.etat === 'alerte' && z.alerte < 0.5);
    const aJ = Math.atan2(j.y - z.y, j.x - z.x);
    const dos = Math.abs(angDiff(aJ, z.dir)) > RX.FURTIF.DOS_DEG * DEG || z.etat === 'dort';
    const groupe = [z];
    for (const o of zombies) if (o !== z && o.etage === j.etage && !o.enCombat && o.etat === 'chasse' && Math.hypot(o.x - j.x, o.y - j.y) <= RP.REJOINDRE_CASES) groupe.push(o);
    engager(j, groupe);
    return { ok: true, furtif: nonAlerte && dos, dos, nonAlerte, zombie: descMort(z), groupe: groupe.map(descMort) };
  }
  function blesserZombie(uid, degats) { const z = zombies.find(q => q.uid === uid); if (z) z.hp = Math.max(0, z.hp - degats); return z ? z.hp : 0; }

  let cache = null;
  function instantane() {
    if (cache) return cache;
    const pp = {};
    for (const k in portes) { const s = portes[k]; pp[k] = { etat: s.etat, pv: s.pv, pvMax: s.pvMax, barricadee: s.barricadee }; }
    const cc = {};
    for (const k in conteneurs) cc[k] = { tire: !!conteneurs[k].items, reste: conteneurs[k].items ? conteneurs[k].items.length : null, progres: conteneurs[k].progres };
    cache = {
      zombies: zombies.map(z => ({ uid: z.uid, type: z.type, x: z.x, y: z.y, etage: z.etage, dir: z.dir, etat: z.etat, alerte: z.alerte, hp: z.hp, enCombat: z.enCombat, vitesse: z.vitesse, etourdi: z.etourdi > 0 })),
      portes: pp, conteneurs: cc,
      sol: sol.map(o => ({ ...o })), cadavres: cadavres.map(c => ({ ...c })),
      joueurs: [...joueurs.values()].map(j => ({ id: j.id, nom: j.nom, x: j.x, y: j.y, etage: j.etage, dir: j.dir, enCombat: j.enCombat, lampe: j.lampe, lampeSource: j.lampeSource, allure: j.allure })),
      joues: joues.slice(),
    };
    return cache;
  }
  function sauver(m = minutes) {
    const pp = {};
    for (const p of niveau.portes) { const s = portes[p.cle]; if (s.etat !== p.etat || s.pv !== s.pvMax || s.barricadee) pp[p.cle] = { etat: s.etat, pv: s.pv, pvMax: s.pvMax, barricadee: s.barricadee }; }
    const cc = {};
    for (const k in conteneurs) cc[k] = { items: conteneurs[k].items, progres: conteneurs[k].progres };
    return {
      v: 1, minutes: m, uid: uidSeq,
      zombies: zombies.map(z => ({ uid: z.uid, type: z.type, etage: z.etage, x: +z.x.toFixed(2), y: +z.y.toFixed(2), dir: +z.dir.toFixed(2),
        etat: z.etat === 'chasse' || z.etat === 'alerte' ? 'erre' : z.etat, base: z.base, hp: z.hp, proc: z.proc })),
      portes: pp, conteneurs: cc, sol: sol.map(o => ({ ...o })), cadavres: cadavres.map(c => ({ ...c })), joues: joues.slice(),
    };
  }

  function tick(dtMs) {
    evts = [];
    cache = null;
    let reste = Math.min(Math.max(0, dtMs || 0), 500);
    while (reste > 0) {
      const dt = Math.min(reste, 100); reste -= dt;
      tFlag -= dt;
      if (tFlag <= 0) {
        tFlag = 1000;
        for (const p of niveau.portes) {
          const s = portes[p.cle];
          if (s.etat === 'verrouillee' && p.verrou && p.verrou.flag && flagOk(p.verrou)) { s.etat = 'fermee'; setPorte(p.cle, 'fermee', 'flag', null); }
        }
      }
      tickJoueurs(dt);
      traiterBruits();
      for (const z of zombies) majMort(z, dt);
      separer(dt);
      contacts();
    }
    return evts;
  }

  return {
    lieuId, niveau, seed,
    ajouterJoueur, majJoueur, retirerJoueur, bruit, porte, fouiller, arreterFouille, prendre, deposer,
    retirerZombies, repousserZombies, finCombat, attaquer, blesserZombie, tick, instantane, sauver,
    // accès pratiques (hôte / vue locale)
    grilles: (etage) => dyn[EI(etage)],
    joueur: (id) => joueurs.get(id) || null,
    joueurs: () => [...joueurs.values()],
    marquerJoue: (i) => { if (!joues.includes(i)) joues.push(i); },
    estJoue: (i) => joues.includes(i),
    zombies: () => zombies,
  };
}
