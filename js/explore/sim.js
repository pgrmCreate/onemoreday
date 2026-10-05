// ============ Simulation d'un lieu (HEADLESS, aucun DOM) — REFONTE §12.3 ============
// Tenue par une seule machine (solo, ou hôte en co-op). Gère N joueurs, les morts (IA temps réel),
// les portes (PV, verrous, drapeaux), les conteneurs (butin tiré une seule fois, graine du lieu),
// le sol, les cadavres, les bruits, la persistance (sauver()) et le repeuplement.
//
// COMBAT : il se joue ICI, en temps réel (plus d'écran séparé). Les morts en chasse télégraphient puis frappent ;
// les joueurs agissent par sim.action(joueurId, { type: 'frapper'|'pousser'|'tirer'|'marteler', … }).
// Événements de combat : telegraphe, attaque, blessure, saisie, degage, coup, rate, coup_vide, mort_zombie,
//   poussee, tir, bouscule. (Pas d'esquive : on recule, on pousse, on frappe.) Les blessures sont APPLIQUÉES par le client du joueur visé (son corps).
//
// creerSimLieu({ lieuId, niveau, etat, seed, danger, pool, …options }) → sim
// Options en plus du contrat (toutes facultatives) : minutes (horloge de jeu), typeButin, mortsN [min,max],
// repeuplement (morts/jour), coop (bool), difficulte (preset reglages.difficulte), jour, mult (× butin),
// getFlag(k) (drapeaux du monde : portes à drapeau), rng (graine des tirages non persistants).
// Grilles FINES (petites cases, catalogue.js FIN) ; positions, distances et vitesses en UNITÉS (0,8 m).
import { REGLAGES, paramsJour } from '../data/reglages.js';
import { ZOMBIES, typeMort, sexeMort } from '../data/zombies.js';
import { tirerButin, tirerButinTable, tirerLignes } from '../data/butin.js';
import { seedRng } from '../core/rng.js';
import { K, parserNiveau, cleCase, MATIERES } from './niveau.js';
import { FIN, icase, cxCase, cyCase } from '../carte/catalogue.js';
import { deplacer, ligneLibre, obstaclesSon } from './physique.js';
import { profilMelee, geometrie, resoudreCoup, resoudreAttaque, tapsEmpoignade, bruitCoup } from './combat.js';
import { CONSTRUCTIONS, DEMONTABLES, RECOLTES, casesConstruction, casesFinesConstruction, appliquerConstructions, cassableC } from '../data/construction.js';

const RX = REGLAGES.exploration, RP = RX.PERCEPTION, RF = REGLAGES.fouille, RC = REGLAGES.combat;
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
  let vm = 1;                        // version du « monde statique » (portes, sol, cadavres, conteneurs) : réseau en différentiel
  const joueurs = new Map();
  const bruits = [];                 // file de bruits à traiter au prochain tick
  let evts = [];
  let tFlag = 0;
  let T = 0;                         // temps de simulation (ms) : horloge des télégraphies, empoignades
  let rngCbt = seedRng(`${seed}:combat:${lieuId}:${minutes}`);

  for (const p of niveau.portes) {
    const pvMax = p.exterieure ? RX.PORTES.PV_EXTERIEURE : RX.PORTES.PV;
    portes[p.cle] = { etat: p.etat, pv: pvMax, pvMax, barricadee: false };
  }

  // ---------- Constructions (js/data/construction.js) et meubles démontés ----------
  let constructions = [], consSeq = 1;
  const retires = new Set();                                   // clés des meubles démontés
  const consCase = niveau.etages.map(() => new Map());         // i → construction (index par case)
  function indexerC(c, ajout) {
    const ei = EI(c.etage); if (ei == null) return; const E = niveau.etages[ei];
    for (const i of casesFinesConstruction(E, c)) {
      if (ajout) consCase[ei].set(i, c); else if (consCase[ei].get(i) === c) consCase[ei].delete(i);
    }
  }
  // Grilles dynamiques recalculées : niveau → meubles démontés → portes → constructions.
  function recalculerDyn() {
    niveau.etages.forEach((E, k) => { dyn[k].bloque.set(E.bloque); dyn[k].opaque.set(E.opaque); });
    for (const cle of retires) { const m = niveau.meubleParCle[cle]; if (!m) continue; const ei = EI(m.etage); for (const i of m.cases) { dyn[ei].bloque[i] = 0; dyn[ei].opaque[i] = 0; } }
    majPortesDyn();
    appliquerConstructions(niveau, dyn, constructions);
  }

  // ---------- Création / restauration ----------
  const etat = opts.etat && opts.etat.v ? opts.etat : null;
  if (etat) migrerAbords(etat, niveau.abords);
  if (etat) {
    uidSeq = etat.uid || 1;
    for (const [cle, s] of Object.entries(etat.portes || {})) if (portes[cle]) Object.assign(portes[cle], s);
    for (const [cle, c] of Object.entries(etat.conteneurs || {})) conteneurs[cle] = { items: c.items, progres: c.progres || 0 };
    sol = (etat.sol || []).slice();
    cadavres = (etat.cadavres || []).slice();
    joues = (etat.joues || []).slice();
    for (const c of etat.constructions || []) { const cc = { ...c, items: c.items ? c.items.map(i => ({ ...i })) : c.items }; constructions.push(cc); consSeq = Math.max(consSeq, (+String(c.uid).slice(1) || 0) + 1); }
    for (const cle of etat.retires || []) retires.add(cle);
    for (const z of etat.zombies || []) { const zz = nouveauMort(z.type, z.etage, z.x, z.y, z.etat, z); if (zz) zombies.push(zz); }
    // (les anciens types rangés sont convertis par nouveauMort → typeMort)
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
    const n = Math.round((mortsN[0] + Math.floor(r() * (mortsN[1] - mortsN[0] + 1))) * mult * ((niveau.abords && niveau.abords.mortsMult) || 1));
    placerProceduraux(n, r);
    for (const o of niveau.sol) sol.push({ uid: uidSeq++, etage: o.etage, x: o.x + 0.5, y: o.y + 0.5, ...(o.doc ? { doc: o.doc } : { id: o.id, qty: o.qty }) });
  }
  recalculerDyn();
  for (const c of constructions) indexerC(c, true);

  function etatDepart(type, r) {
    const d = ZOMBIES[type]; const e = (d && d.etats) || { erre: 0.5, immobile: 0.3, dort: 0.2 };
    let v = r(); for (const k in e) { v -= e[k]; if (v <= 0) return k; }
    return 'erre';
  }
  function nouveauMort(type0, etage, x, y, et, extra = {}) {
    if (!ZOMBIES[type0]) console.warn(`[explore] mort inconnu « ${type0} » : errant`);
    const type = typeMort(type0);
    const def = ZOMBIES[type];
    if (!def || EI(etage) == null) return null;
    const hpMax = Math.round((def.hp || 30) * (diff.pvMorts || 1));
    const base = et === 'alerte' || et === 'chasse' ? 'erre' : (et || 'erre');
    const uid = extra.uid || `z${uidSeq++}`;
    return {
      uid, type, def, etage, ei: EI(etage), x, y, dir: extra.dir || 0, sexe: extra.sexe || sexeMort(type, `${seed}:${lieuId}:${uid}`),
      etat: et || 'erre', base: extra.base || base, hp: extra.hp || hpMax, hpMax,
      alerte: 0, cible: null, chemin: [], ci: 0, tChemin: 0, tEtat: 0, joueur: null, derniere: null, memoire: 0,
      enCombat: null, etourdi: 0, tCogne: 0, porte: null, bloqueT: 0, lx: x, ly: y, charge: 0, tCharge: 0, cri: false, tCri: 0,
      proc: !!extra.proc, vitesse: 0,
      // combat
      atk: null, fente: null, recupJusqu: 0, contact: false, vacille: 0, aTerre: 0, kb: null, tTouche: -1e9, saisit: null, scene: extra.scene || null,
      equilibreMax: Math.round(hpMax * RC.EQUILIBRE.PAR_PV), equilibre: Math.round(hpMax * RC.EQUILIBRE.PAR_PV), tEquil: -1e9,
      sensTour: (uidSeq % 2) ? 1 : -1,
    };
  }
  // Cases candidates pour un mort procédural : marchables, loin des entrées, pièces sombres d'abord.
  function casesLibres(r) {
    const out = [];
    // loin des entrées ET des arrivées d'escalier (on ne tombe pas nez à nez en changeant d'étage)
    const entrees = Object.values(niveau.entrees).concat(niveau.escaliers.filter(s => s.arrivee).map(s => s.arrivee));
    niveau.etages.forEach((E) => {
      // une petite case sur FIN² (le coin d'une unité, unité entièrement libre) : autant de candidats qu'avant
      for (let i = 0; i < E.w * E.h; i++) {
        if ((i % E.w) % FIN || ((i / E.w) | 0) % FIN) continue;
        if (E.code[i] !== K.SOL || E.bloque[i] || E.piece[i] < 0) continue;
        if ((i % E.w) + 1 >= E.w || i + E.w + 1 >= E.w * E.h) continue;
        if ([i + 1, i + E.w, i + E.w + 1].some(j => E.code[j] !== K.SOL || E.bloque[j])) continue;
        const x = (i % E.w) / FIN + 0.5, y = ((i / E.w) | 0) / FIN + 0.5;
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
      const s = portes[p.cle]; const E = niveau.etages[EI(p.etage)];
      const ferme = s.etat === 'fermee' || s.etat === 'verrouillee';
      const op = ferme && !(p.style === 'grille' || p.style === 'vitree') ? 1 : 0;
      for (const i of p.cases) { dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = op; }
    }
  }
  function setPorte(cle, etatN, action, source) {
    const s = portes[cle]; const p = niveau.porteParCle[cle];
    s.etat = etatN;
    const E = niveau.etages[EI(p.etage)];
    const ferme = etatN === 'fermee' || etatN === 'verrouillee';
    const op = ferme && !(p.style === 'grille' || p.style === 'vitree') ? 1 : 0;
    for (const i of p.cases) { dyn[E.idx].bloque[i] = ferme ? 1 : 0; dyn[E.idx].opaque[i] = op; }
    evts.push({ type: 'porte', cle, etat: etatN, pv: s.pv, pvMax: s.pvMax, action, source: source || null }); vm++;
  }
  // (x + 0,5, y + 0,5) : centre de la porte ou de la case de construction (unités)
  function caseOccupee(etage, x, y) {
    for (const j of joueurs.values()) if (j.etage === etage && Math.abs(j.x - x - 0.5) < 0.62 && Math.abs(j.y - y - 0.5) < 0.62) return true;
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
        if (z.etage !== b.etage || z.etat === 'fait_le_mort') continue;
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
      z.cri = true; z.tCri = (z.def.params && z.def.params.relanceMs) || 9000;
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
    if (z.etat === 'dort' || z.etourdi > 0) return null;
    const E = niveau.etages[z.ei], D = dyn[z.ei];
    let vu = null, dVu = Infinity, Rvu = 0;
    for (const j of joueurs.values()) {
      if (j.etage !== z.etage || j.mort || j.aTerre) continue;
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
  // Sur la grille fine ; la cible (tx, ty) et la profondeur maxProf sont en UNITÉS.
  const bfsBuf = niveau.etages.map(E => ({ vu: new Uint32Array(E.w * E.h), prev: new Int32Array(E.w * E.h), file: new Int32Array(E.w * E.h), stamp: 0 }));
  const D8X = [1, -1, 0, 0, 1, 1, -1, -1], D8Y = [0, 0, 1, -1, 1, -1, 1, -1];
  function passable(E, D, i) {
    if (!D.bloque[i]) return true;
    if (E.code[i] === K.PORTE && portes[niveau.portes[E.porte[i]].cle].etat !== 'ouverte') return true;
    const c = consCase[E.idx].get(i); return !!(c && cassableC(c));
  }
  function chemin(z, tx, ty, maxProf = 60, aleatoire = false) {
    const E = niveau.etages[z.ei], D = dyn[z.ei], B = bfsBuf[z.ei];
    const w = E.w, h = E.h;
    const s = icase(E, z.x, z.y); if (s < 0) return null;
    const t = tx == null || tx < 0 ? -1 : icase(E, tx, ty);
    maxProf *= FIN;
    B.stamp++; const st = B.stamp;
    let a = 0, b = 0;
    B.file[b++] = s; B.vu[s] = st; B.prev[s] = -1;
    let trouve = -1, prof = 0, finNiv = b;
    const cands = aleatoire ? [] : null;
    while (a < b) {
      if (a === finNiv) { prof++; finNiv = b; if (prof > maxProf) break; }
      const i = B.file[a++];
      if (i === t) { trouve = i; break; }
      if (cands && i !== s && !D.bloque[i] && prof >= FIN) cands.push(i);
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
    const cc = consCase[z.ei].get(i);
    if (cc && cassableC(cc)) { // une construction lui barre la route : il cogne dessus
      const cx = cxCase(E, i), cy = cyCase(E, i), d = Math.hypot(cx - z.x, cy - z.y);
      if (d > 0.8) { avancerVers(z, cx, cy, v, dt); return 'marche'; }
      z.porte = null; z.cons = cc.uid; tourner(z, Math.atan2(cy - z.y, cx - z.x), dt, 6);
      return 'porte';
    }
    z.cons = null;
    if (E.code[i] === K.PORTE) {
      const p = niveau.portes[E.porte[i]]; const s = portes[p.cle];
      if (s.etat === 'fermee' || s.etat === 'verrouillee') {
        const d = Math.hypot(p.x + 0.5 - z.x, p.y + 0.5 - z.y);
        if (d > 0.85) { avancerVers(z, p.x + 0.5, p.y + 0.5, v, dt); return 'marche'; }
        z.porte = p.cle; tourner(z, Math.atan2(p.y + 0.5 - z.y, p.x + 0.5 - z.x), dt, 6);
        return 'porte';
      }
    }
    z.porte = null;
    if (avancerVers(z, cxCase(E, i), cyCase(E, i), v, dt)) z.ci++;
    return 'marche';
  }
  function cogner(z, dt, degats) {
    if (z.cons) return cognerConstruction(z, dt, degats);
    const s = portes[z.porte]; if (!s) return;
    z.tCogne += dt;
    if (z.tCogne < RX.PORTES.COGNE_PERIODE_MS) return;
    z.tCogne = 0;
    const p = niveau.porteParCle[z.porte];
    bruit({ etage: p.etage, x: p.x + 0.5, y: p.y + 0.5, rayon: RX.BRUIT.porte, source: z.uid });
    if (!degats) { evts.push({ type: 'porte', cle: z.porte, etat: s.etat, pv: s.pv, pvMax: s.pvMax, action: 'coup', source: z.uid }); return; }
    s.pv = Math.max(0, s.pv - (z.def.cogne || 4)); vm++;
    if (s.pv <= 0) { setPorte(z.porte, 'cassee', 'casse', z.uid); z.porte = null; z.chemin = []; }
    else evts.push({ type: 'porte', cle: z.porte, etat: s.etat, pv: s.pv, pvMax: s.pvMax, action: 'coup', source: z.uid });
  }
  function cognerConstruction(z, dt, degats) {
    const c = constructions.find(q => q.uid === z.cons); if (!c) { z.cons = null; return; }
    z.tCogne += dt;
    if (z.tCogne < RX.PORTES.COGNE_PERIODE_MS) return;
    z.tCogne = 0;
    bruit({ etage: c.etage, x: c.x + 0.5, y: c.y + 0.5, rayon: RX.BRUIT.porte, source: z.uid });
    if (!degats) { evts.push({ type: 'construction', action: 'coup', uid: c.uid, pv: c.pv, pvMax: c.pvMax }); return; }
    c.pv = Math.max(0, c.pv - (z.def.cogne || 4)); vm++; cache = null;
    if (c.pv <= 0) { retirerConstruction(c, 'detruite', z.uid); z.cons = null; z.chemin = []; }
    else evts.push({ type: 'construction', action: 'coup', uid: c.uid, pv: c.pv, pvMax: c.pvMax });
  }
  // Pieux : un mort qui marche dessus s'empale (dégâts, il vacille) ; le piège s'use.
  function pieges(z) {
    if (z.aTerre > 0 || z.etat === 'dort' || z.etat === 'fait_le_mort') return;
    const E = niveau.etages[z.ei], c = consCase[z.ei].get(icase(E, z.x, z.y));
    const d = c && CONSTRUCTIONS[c.type];
    if (!d || !d.piege || (z.tPiege && T - z.tPiege < 1200)) return;
    z.tPiege = T;
    const P = d.piege;
    // alarme (boîtes de conserve) : du bruit, pas de mal ; barbelés : il s'empêtre ; fosse : il tombe dedans
    if (P.alarme) bruit({ etage: z.etage, x: c.x + 0.5, y: c.y + 0.5, rayon: P.alarme });
    if (P.degats) { z.hp -= P.degats; z.vacille = Math.max(z.vacille, P.vacille ?? 700); z.atk = null; }
    if (P.empetre) { z.vacille = Math.max(z.vacille, P.empetre); z.atk = null; }
    if (P.chute) { z.aTerre = Math.max(z.aTerre || 0, P.chute); z.atk = null; }
    c.pv -= P.usure ?? 1; vm++; cache = null;
    evts.push({ type: 'construction', action: 'piege', uid: c.uid, zuid: z.uid, x: z.x, y: z.y, etage: z.etage, pv: c.pv });
    if (z.hp <= 0) { lacher(z); zombies = zombies.filter(q => q !== z); cadavres.push({ uid: z.uid, type: z.type, sexe: z.sexe, etage: z.etage, x: z.x, y: z.y, dir: z.dir }); evts.push({ type: 'mort_zombie', joueur: null, uid: z.uid, typeMort: z.type, sexe: z.sexe, x: z.x, y: z.y, etage: z.etage, piege: true }); }
    if (c.pv <= 0) retirerConstruction(c, 'detruite', z.uid);
  }
  function majMort(z, dt) {
    z.vitesse = 0;
    if (z.kb) { // recul d'un coup / d'une poussée
      const E = niveau.etages[z.ei], D = dyn[z.ei];
      const f = Math.min(dt, z.kb.t) / RC.RECUL_MS;
      posTmp.x = z.x; posTmp.y = z.y;
      deplacer(E.w, E.h, D.bloque, posTmp, z.kb.dx * f, z.kb.dy * f, RAYON_MORT);
      z.x = posTmp.x; z.y = posTmp.y;
      z.kb.t -= dt; if (z.kb.t <= 0) z.kb = null;
    }
    if (z.equilibre < z.equilibreMax && T - z.tEquil > 1500) z.equilibre = Math.min(z.equilibreMax, z.equilibre + z.equilibreMax * dt / 1000 / RC.EQUILIBRE.RECUP_S);
    if (z.aTerre > 0) { z.aTerre -= dt; z.atk = null; z.fente = null; return; }
    if (z.vacille > 0) { z.vacille -= dt; z.atk = null; z.fente = null; return; }
    if (z.etourdi > 0) { z.etourdi -= dt; return; }
    const vu = percevoir(z, dt);
    const def = z.def;
    if ((z.etat === 'chasse' || z.saisit) && corpsACorps(z, dt)) return;
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
          const c = chemin(z, z.cible.x, z.cible.y, 50);
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
            const ci = icase(E, nx, ny);
            if (P.porte === 'enfonce' && ci >= 0 && E.code[ci] === K.PORTE && D.bloque[ci]) {
              const p = niveau.portes[E.porte[ci]]; portes[p.cle].pv = 0; setPorte(p.cle, 'cassee', 'enfoncee', z.uid);
              bruit({ etage: z.etage, x: nx, y: ny, rayon: RX.BRUIT.porte_forcee, source: z.uid });
            }
            posTmp.x = z.x; posTmp.y = z.y;
            deplacer(E.w, E.h, D.bloque, posTmp, Math.cos(z.dir) * pas, Math.sin(z.dir) * pas, RAYON_MORT);
            z.x = posTmp.x; z.y = posTmp.y; z.vitesse = P.vitesse;
            // la charge percute un joueur : coup + il est projeté
            for (const o of joueurs.values()) {
              if (o.mort || o.etage !== z.etage || Math.hypot(o.x - z.x, o.y - z.y) > 0.8) continue;
              z.charge = 0;
              const r = resoudreAttaque({ def, type: z.type, stats: o.stats, rnd: rngCbt, diff });
              evts.push({ type: 'blessure', joueur: o.id, uid: z.uid, typeMort: z.type, sexe: z.sexe, ...r });
              evts.push({ type: 'bouscule', joueur: o.id, uid: z.uid, dx: Math.cos(z.dir) * RC.BOUSCULE.CASES, dy: Math.sin(z.dir) * RC.BOUSCULE.CASES });
              z.recupJusqu = T + (def.cadence || 1500);
              break;
            }
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
        // hurleur : il crie de nouveau tant qu'il te voit (un coup qui le fait vaciller lui coupe le souffle)
        if (vu && def.special === 'hurle' && z.cri) {
          z.tCri -= dt;
          if (z.tCri <= 0) { z.tCri = (def.params && def.params.relanceMs) || 9000; bruit({ etage: z.etage, x: z.x, y: z.y, rayon: (def.params && def.params.bruitExploration) || 30, source: z.uid }); evts.push({ type: 'hurlement', uid: z.uid, etage: z.etage, x: z.x, y: z.y }); }
        }
        const cx = vu && j ? j.x : z.derniere.x, cy = vu && j ? j.y : z.derniere.y;
        z.tChemin -= dt;
        const dCible = Math.hypot(cx - z.x, cy - z.y);
        if (dCible < 1.8 && vu) { // au contact : il s'arrête à bout de bras, face à toi
          // pas de jeton (déjà JETONS morts qui attaquent) : il attend son tour en tournant autour
          if (j && !jetonLibre(z, j) && !z.saisit) {
            const R = RC.TOURNE_CASES;
            const a = Math.atan2(z.y - cy, z.x - cx) + z.sensTour * 0.55 * dt / 1000;
            const tx = cx + Math.cos(a) * R, ty = cy + Math.sin(a) * R;
            if (Math.hypot(tx - z.x, ty - z.y) > 0.05) { avancerVers(z, tx, ty, vC * 0.45, dt); z.vitesse = vC * 0.45; }
            tourner(z, Math.atan2(cy - z.y, cx - z.x), dt, 8);
            return;
          }
          const arret = RC.ARRET_CASES;
          if (dCible > arret + 0.02) { const k = (dCible - arret) / dCible; avancerVers(z, z.x + (cx - z.x) * k, z.y + (cy - z.y) * k, vC, dt); z.vitesse = vC; }
          else tourner(z, Math.atan2(cy - z.y, cx - z.x), dt, 6);
          return;
        }
        if (z.tChemin <= 0 || z.ci >= z.chemin.length) {
          z.tChemin = 400;
          const c = chemin(z, cx, cy, 70);
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
  // Les morts ne traversent pas les joueurs : on les écarte à ARRET_CASES (les joueurs, eux, ne sont pas poussés).
  function separerJoueurs() {
    const m = RC.ARRET_CASES * 0.92;
    for (const j of joueurs.values()) {
      if (j.mort) continue;
      for (const z of zombies) {
        if (z.etage !== j.etage) continue;
        const dx = z.x - j.x, dy = z.y - j.y, d = Math.hypot(dx, dy);
        // se cogner à un mort endormi / immobile le réveille
        if (d < 0.8 && (z.etat === 'dort' || z.etat === 'immobile' || z.etat === 'erre') && !j.aTerre) reveiller(z, j);
        if (d >= m || d < 1e-4) continue;
        const E = niveau.etages[z.ei], D = dyn[z.ei];
        posTmp.x = z.x; posTmp.y = z.y;
        deplacer(E.w, E.h, D.bloque, posTmp, dx / d * (m - d), dy / d * (m - d), RAYON_MORT);
        z.x = posTmp.x; z.y = posTmp.y;
      }
    }
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
        if (A.etat !== 'dort') { posTmp.x = A.x; posTmp.y = A.y; deplacer(E.w, E.h, D.bloque, posTmp, -dx / d * p, -dy / d * p, RAYON_MORT); A.x = posTmp.x; A.y = posTmp.y; }
        if (B.etat !== 'dort') { posTmp.x = B.x; posTmp.y = B.y; deplacer(E.w, E.h, D.bloque, posTmp, dx / d * p, dy / d * p, RAYON_MORT); B.x = posTmp.x; B.y = posTmp.y; }
      }
    }
  }

  // ---------- Corps à corps : les morts ----------
  const E_ = RC.EMPOIGNADE;
  // Un mort en chasse au contact : télégraphie (il arme), fente (il se jette), coup jugé au bout de la fente, empoignade.
  // true = il ne se déplace pas normalement ce pas-ci.
  function jetonLibre(z, j) {
    let n = 0;
    for (const o of zombies) if (o !== z && ((o.atk && o.atk.cible === j.id) || (o.fente && o.fente.cible === j.id))) n++;
    return n < RC.JETONS;
  }
  function corpsACorps(z, dt) {
    const def = z.def;
    if (z.saisit) {
      const s = joueurs.get(z.saisit);
      if (!s || s.mort || !s.empoigne || s.empoigne.uid !== z.uid) { z.saisit = null; z.recupJusqu = T + (def.cadence || 1300); return false; }
      tourner(z, Math.atan2(s.y - z.y, s.x - z.x), dt, 6);
      if (T >= s.empoigne.fin) { // raté : il mord
        s.empoigne = null; z.saisit = null; z.recupJusqu = T + (def.cadence || 1300);
        const r = resoudreAttaque({ def, type: z.type, stats: s.stats, morsure: true, rnd: rngCbt, diff });
        evts.push({ type: 'blessure', joueur: s.id, uid: z.uid, typeMort: z.type, sexe: z.sexe, morsure: true, ...r });
      }
      return true;
    }
    const j = z.joueur && joueurs.get(z.joueur);
    if (!j || j.mort || j.aTerre || j.etage !== z.etage) { z.atk = null; z.fente = null; return false; }
    // la fente : il se jette dans la direction armée
    if (z.fente) {
      const F = RC.FENTE, f = z.fente;
      const E = niveau.etages[z.ei], D = dyn[z.ei];
      const pas = F.CASES * Math.min(dt, f.fin - (T - dt)) / F.MS;
      if (pas > 0) {
        posTmp.x = z.x; posTmp.y = z.y;
        deplacer(E.w, E.h, D.bloque, posTmp, Math.cos(f.dir) * pas, Math.sin(f.dir) * pas, RAYON_MORT);
        // il ne traverse pas sa cible : arrêt au contact
        const dj = Math.hypot(j.x - posTmp.x, j.y - posTmp.y);
        if (dj > RC.ARRET_CASES * 0.75) { z.x = posTmp.x; z.y = posTmp.y; }
      }
      if (T >= f.fin) { z.fente = null; resoudreAttaqueMort(z, f); }
      return true;
    }
    const d = Math.hypot(j.x - z.x, j.y - z.y);
    if (z.atk) {
      tourner(z, Math.atan2(j.y - z.y, j.x - z.x), dt, RC.PIVOT_TELEGRAPHE);
      if (T >= z.atk.fin) {
        z.fente = { t0: T, fin: T + RC.FENTE.MS, dir: z.dir, type: z.atk.type, cible: z.atk.cible };
        z.atk = null;
        evts.push({ type: 'fente', uid: z.uid, joueur: j.id, attaque: z.fente.type });
      }
      return true;
    }
    const portee = def.portee || 0.95;
    if (d > portee + 0.6) { z.contact = false; return false; }
    if (d <= portee + 0.15) {
      if (!z.contact) {
        z.contact = true;
        const surpris = Math.abs(angDiff(Math.atan2(z.y - j.y, z.x - j.x), j.dir)) > 100 * DEG;
        const P = RC.PREMIERE_ATTAQUE_MS;
        z.recupJusqu = Math.max(z.recupJusqu, T + (surpris ? RC.SURPRIS_MS : P[0] + rngCbt() * (P[1] - P[0])));
      }
      const occupe = j.empoigne && E_.AUTRES_ATTENDENT;
      if (T >= z.recupJusqu && !occupe && jetonLibre(z, j)) { debuterTelegraphe(z, j); return true; }
    }
    return false;
  }
  function debuterTelegraphe(z, j) {
    const def = z.def;
    const type = def.saisie > 0 && !j.empoigne && rngCbt() < def.saisie ? 'saisie' : 'coup';
    const duree = Math.max(RC.TELEGRAPHE_MIN_MS, (def.telegraphe || 800) * (diff.telegraphe || 1));
    z.atk = { type, t0: T, fin: T + duree, duree, cible: j.id };
    evts.push({ type: 'telegraphe', uid: z.uid, joueur: j.id, attaque: type, duree });
  }
  // Le coup est jugé au bout de la fente : encore à portée et devant lui (on l'évite en reculant ou en le poussant).
  function resoudreAttaqueMort(z, at) {
    const def = z.def;
    z.recupJusqu = T + (def.cadence || 1300);
    const j = joueurs.get(at.cible);
    if (!j || j.mort || j.etage !== z.etage) return;
    const d = Math.hypot(j.x - z.x, j.y - z.y);
    const a = Math.abs(angDiff(Math.atan2(j.y - z.y, j.x - z.x), z.dir));
    if (d > (def.portee || 0.95) + RC.TOLERANCE_PORTEE || a > RC.CONE_ATTAQUE_DEG * DEG / 2) {
      evts.push({ type: 'attaque', uid: z.uid, joueur: j.id, issue: 'vide', attaque: at.type }); return;
    }
    if (j.empoigne && j.empoigne.uid !== z.uid && E_.AUTRES_ATTENDENT) { // un autre le tient déjà : il attend son tour
      evts.push({ type: 'attaque', uid: z.uid, joueur: j.id, issue: 'retenue', attaque: at.type }); z.recupJusqu = T + 400; return;
    }
    if (at.type === 'saisie' && !j.empoigne) {
      const requis = tapsEmpoignade(def, j.stats);
      const duree = E_.MS + (j.stats && j.stats.tactile ? E_.MARGE_TACTILE_MS : 0);
      j.empoigne = { uid: z.uid, debut: T, fin: T + duree, duree, requis, taps: 0 };
      z.saisit = j.id;
      evts.push({ type: 'saisie', joueur: j.id, uid: z.uid, typeMort: z.type, sexe: z.sexe, requis, duree });
      return;
    }
    const r = resoudreAttaque({ def, type: z.type, stats: j.stats, rnd: rngCbt, diff });
    evts.push({ type: 'attaque', uid: z.uid, joueur: j.id, issue: 'touche', attaque: at.type });
    evts.push({ type: 'blessure', joueur: j.id, uid: z.uid, typeMort: z.type, sexe: z.sexe, dir: z.dir, ...r });
  }

  // ---------- Corps à corps : les joueurs ----------
  const nonAlerte = (z) => z.etat === 'dort' || z.etat === 'immobile' || z.etat === 'erre' || z.etat === 'fait_le_mort' || z.etat === 'cogne' || (z.etat === 'alerte' && z.alerte < 0.5);
  function reveiller(z, j) {
    if (z.etat !== 'chasse') changerEtat(z, 'chasse');
    z.alerte = 1; z.joueur = j.id; z.derniere = { x: j.x, y: j.y }; z.memoire = RP.MEMOIRE_MS; z.chemin = []; z.tChemin = 0;
  }
  function reculer(z, depuisX, depuisY, cases) {
    if (cases <= 0) return;
    let a = Math.atan2(z.y - depuisY, z.x - depuisX); if (!isFinite(a)) a = rngCbt() * Math.PI * 2;
    z.kb = { dx: Math.cos(a) * cases, dy: Math.sin(a) * cases, t: RC.RECUL_MS };
  }
  function lacher(z) { // il lâche le joueur qu'il tenait
    if (!z.saisit) return;
    const s = joueurs.get(z.saisit);
    if (s && s.empoigne && s.empoigne.uid === z.uid) { s.empoigne = null; evts.push({ type: 'degage', joueur: s.id, uid: z.uid, lache: true }); }
    z.saisit = null;
  }
  // Morts touchables devant le joueur : [{ z, d }] triés (ceux qui le menacent d'abord, puis le plus proche).
  function devant(j, portee, arc) {
    const D = dyn[j.ei], E = niveau.etages[j.ei], out = [];
    for (const z of zombies) {
      if (z.etage !== j.etage) continue;
      const d = Math.hypot(z.x - j.x, z.y - j.y);
      if (d > portee + RAYON_MORT) continue;
      const a = Math.abs(angDiff(Math.atan2(z.y - j.y, z.x - j.x), j.dir));
      if (a > arc / 2 && d > 0.55) continue;
      if (!ligneLibre(E.w, E.h, D.bloque, j.x, j.y, z.x, z.y)) continue;
      const menace = (z.atk && z.atk.cible === j.id) || z.saisit === j.id ? -0.6 : 0;
      out.push({ z, d, score: d + a * 0.3 + menace });
    }
    return out.sort((p, q) => p.score - q.score);
  }
  function tuerMort(z, j, o = {}) {
    lacher(z);
    zombies = zombies.filter(q => q !== z);
    cadavres.push({ uid: z.uid, type: z.type, sexe: z.sexe, etage: z.etage, x: z.x, y: z.y, dir: z.dir }); vm++;
    evts.push({ type: 'mort_zombie', joueur: j.id, uid: z.uid, typeMort: z.type, sexe: z.sexe, x: z.x, y: z.y, etage: z.etage, furtif: !!o.furtif, tir: !!o.tir });
  }
  // Applique un coup résolu à un mort : PV, équilibre (à 0 il vacille), recul, interruption, mise à terre.
  function encaisser(z, j, r, prof, c, o = {}) {
    z.hp -= r.degats; z.tTouche = T;
    const res = z.def.resistance || 0;
    const lourd = c >= RC.CHARGE.SEUIL_LOURD;
    z.equilibre -= r.equilibre || 0; z.tEquil = T;
    let vac = !!(r.vacille || r.interrompt);
    if (z.equilibre <= 0) { vac = true; z.equilibre = z.equilibreMax; }
    if (!o.tir) {
      const k = RC.COMBO.RECUL[r.combo || 0] || 1;
      reculer(z, j.x, j.y, (lourd ? RC.RECUL.lourd : RC.RECUL.rapide * k * (1 + c)) * (1 - res));
    }
    if (vac) { z.atk = null; z.fente = null; z.vacille = RC.VACILLER.MS; lacher(z); if (z.def.special === 'hurle') z.tCri = (z.def.params && z.def.params.relanceMs) || 9000; }
    else if (z.atk && !o.tir) z.atk.fin += RC.FLINCH_MS;            // il tressaille : son coup part plus tard
    let terre = false;
    if (r.terre && z.def.special !== 'rampe' && z.hp > 0) { z.aTerre = RC.A_TERRE.MS; z.vacille = 0; z.atk = null; z.fente = null; lacher(z); terre = true; }
    // à deux : frapper le mort qui tient ton coéquipier l'aide à se dégager
    if (z.saisit && z.saisit !== j.id) {
      const s = joueurs.get(z.saisit);
      if (s && s.empoigne && s.empoigne.uid === z.uid) { s.empoigne.taps += E_.AIDE_COOP || 2; if (s.empoigne.taps >= s.empoigne.requis) degager(s, z); }
    }
    const tue = z.hp <= 0;
    evts.push({ type: 'coup', joueur: j.id, uid: z.uid, typeMort: z.type, degats: r.degats, crit: r.crit, charge: Math.round(c * 100) / 100,
      vacille: vac, interrompt: !!r.interrompt, furtif: !!o.furtif, tir: !!o.tir, x: z.x, y: z.y, etage: z.etage, pv: Math.max(0, z.hp), pvMax: z.hpMax,
      tue, arme: prof.id || null, lourd, combo: r.combo || 0, achever: !!r.achever, terre, dir: Math.atan2(z.y - j.y, z.x - j.x) });
    if (tue) tuerMort(z, j, o);
    else reveiller(z, j);
    return tue;
  }
  function frapper(j, a) {
    const st = j.stats || {};
    const prof = profilMelee(st.arme);
    const geo = geometrie(prof);
    const c = Math.max(0, Math.min(1, a.charge || 0));
    const combo = Math.max(0, Math.min(2, a.combo | 0));
    // un mort à terre juste devant : coup de grâce (prioritaire)
    const auSol = devant(j, RC.ACHEVER.PORTEE, geo.arc + 0.6).find(({ z }) => z.aTerre > 0);
    const cibles = auSol ? [auSol] : devant(j, geo.portee + RC.TOLERANCE_ARC_CASES, geo.arc).slice(0, geo.cibles);
    j.geste = { type: c >= RC.CHARGE.SEUIL_LOURD ? 'lourd' : 'rapide', t: T, duree: prof.vitesse || 450, combo };
    let touches = 0, tues = 0, silencieux = true, critDonne = false;
    for (const { z } of cibles) {
      const dos = Math.abs(angDiff(Math.atan2(j.y - z.y, j.x - z.x), z.dir)) > RX.FURTIF.DOS_DEG * DEG;
      const furtif = nonAlerte(z) && (dos || z.etat === 'dort' || z.etat === 'fait_le_mort');
      const r = resoudreCoup({ stats: st, prof, def: z.def, c, combo, achever: !!(auSol && auSol.z === z), critForce: !!a.crit && !critDonne,
        aTerre: z.aTerre > 0, vacille: z.vacille > 0, telegraphie: !!(z.atk || z.fente), furtif, ess: !!a.ess, rnd: rngCbt });
      critDonne = true;
      touches++;
      const tue = encaisser(z, j, r, prof, c, { furtif });
      if (tue) tues++;
      if (!(furtif && tue)) silencieux = false;
    }
    if (!cibles.length) evts.push({ type: 'coup_vide', joueur: j.id, lourd: c >= RC.CHARGE.SEUIL_LOURD });
    if (touches) bruit({ etage: j.etage, x: j.x, y: j.y, rayon: silencieux ? 1 : bruitCoup(prof), source: j.id });
    return { ok: true, touches, tues, cibles: cibles.length };
  }
  function pousser(j) {
    const P = RC.POUSSEE, st = j.stats || {};
    j.geste = { type: 'poussee', t: T, duree: P.GESTE_MS };
    let n = 0, terre = 0, immobile = 0;
    for (const { z } of devant(j, P.PORTEE, P.ARC_DEG * DEG)) {
      const res = z.def.resistance || 0;
      reveiller(z, j);
      if (res >= P.RESISTANCE_BLOQUE) { immobile++; continue; }
      n++;
      reculer(z, j.x, j.y, P.RECUL * (1 - res));
      z.atk = null; z.fente = null; lacher(z);
      const pt = P.TERRE_BASE + P.TERRE_PAR_FORCE * (((st.niveaux || {}).force) || 0) - 0.5 * res;
      if (z.def.special !== 'rampe' && rngCbt() < pt) { z.aTerre = RC.A_TERRE.MS; z.vacille = 0; terre++; }
      else z.vacille = P.VACILLE_MS;
    }
    evts.push({ type: 'poussee', joueur: j.id, n, terre, immobile, x: j.x, y: j.y, dir: j.dir });
    if (n || immobile) bruit({ etage: j.etage, x: j.x, y: j.y, rayon: 2, source: j.id });
    return { ok: true, n, terre, immobile };
  }
  function degager(j, z) {
    j.empoigne = null;
    if (z) { z.saisit = null; z.aTerre = RC.A_TERRE.MS; z.atk = null; z.fente = null; z.recupJusqu = T + (z.def.cadence || 1300); reculer(z, j.x, j.y, 0.5); }
    evts.push({ type: 'degage', joueur: j.id, uid: z ? z.uid : null });
  }
  function marteler(j, a) {
    const e = j.empoigne; if (!e) return { ok: false };
    e.taps += a.ess ? 0.5 : 1;
    evts.push({ type: 'martele', joueur: j.id, uid: e.uid, taps: e.taps, requis: e.requis });
    if (e.taps >= e.requis) degager(j, zombies.find(q => q.uid === e.uid));
    return { ok: true };
  }
  function tirerArme(j, a) {
    const st = j.stats || {}, prof = st.arme;
    if (!prof || !prof.tir) return { ok: false, raison: 'pas_arme_tir' };
    const TI = RC.TIR;
    const portee = TI.PORTEE[Math.max(0, Math.min(2, prof.tir.portee || 0))];
    const cible = devant(j, portee, TI.CONE_DEG * DEG)[0];
    j.geste = { type: 'tir', t: T, duree: 250 };
    let touche = false;
    if (cible) {
      const r = resoudreCoup({ stats: st, prof, def: cible.z.def, tir: true, visee: a.visee || 0, critForce: !!a.crit, aTerre: cible.z.aTerre > 0, vacille: cible.z.vacille > 0, rnd: rngCbt });
      if (r.touche) { touche = true; encaisser(cible.z, j, r, prof, 0, { tir: true }); }
      else evts.push({ type: 'rate', joueur: j.id, uid: cible.z.uid, raison: r.raison, tir: true, x: cible.z.x, y: cible.z.y });
    }
    const fin = cible ? { x: cible.z.x, y: cible.z.y } : { x: j.x + Math.cos(j.dir) * portee, y: j.y + Math.sin(j.dir) * portee };
    evts.push({ type: 'tir', joueur: j.id, arme: prof.id, x: j.x, y: j.y, x2: fin.x, y2: fin.y, touche });
    bruit({ etage: j.etage, x: j.x, y: j.y, rayon: (prof.bruit || 0) >= 3 ? RX.BRUIT.tir : bruitCoup(prof), source: j.id });
    return { ok: true, touche };
  }
  // Une action de combat d'un joueur (le client a déjà payé l'endurance et joue l'animation).
  //   a = { type: 'frapper' { charge, combo, crit } | 'pousser' | 'tirer' { visee, crit } | 'marteler', x, y, dir, ess, stats? }
  function action(joueurId, a) {
    const j = joueurs.get(joueurId);
    if (!j || !a || j.mort) return { ok: false, raison: 'absent' };
    cache = null;
    if (a.x != null && a.y != null) { j.x = a.x; j.y = a.y; }
    if (a.dir != null) j.dir = a.dir;
    if (a.stats) j.stats = a.stats;
    if (j.aTerre && a.type !== 'marteler') return { ok: false, raison: 'a_terre' };
    switch (a.type) {
      case 'marteler': return marteler(j, a);
      case 'frapper': return j.empoigne ? marteler(j, a) : frapper(j, a);
      case 'pousser': return j.empoigne ? marteler(j, a) : pousser(j, a);
      case 'tirer': return j.empoigne ? marteler(j, a) : tirerArme(j, a);
      default: return { ok: false, raison: 'inconnue' };
    }
  }
  // Fait apparaître des morts autour d'un joueur, déjà en chasse (combat de scène, embuscade). → [uids]
  //   o = { joueurId, surprise: 'normal'|'surpris'|'engage', scene }
  function faireApparaitre(liste, o = {}) {
    const j = (o.joueurId && joueurs.get(o.joueurId)) || [...joueurs.values()][0];
    const etage = j ? j.etage : niveau.entrees.defaut.etage;
    const ei = EI(etage), E = niveau.etages[ei], D = dyn[ei];
    const jx = j ? j.x : niveau.entrees.defaut.x + 0.5, jy = j ? j.y : niveau.entrees.defaut.y + 0.5, jd = j ? j.dir : 0;
    const surpris = o.surprise === 'surpris';
    const uids = [];
    // un corps tient là : la petite case et ses voisines sont du sol libre
    const libre = (x, y) => {
      const cx = Math.floor(x * FIN), cy = Math.floor(y * FIN); if (cx < 2 || cy < 2 || cx >= E.w - 2 || cy >= E.h - 2) return false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const i = (cy + dy) * E.w + cx + dx; if (D.bloque[i] || E.code[i] !== K.SOL) return false; }
      return !zombies.some(q => q.etage === etage && Math.hypot(q.x - x, q.y - y) < 0.8);
    };
    const centre = (v) => (Math.floor(v * FIN) + 0.5) / FIN;
    (liste || []).forEach((sp, i) => {
      const type = typeof sp === 'string' ? sp : sp.type;
      let pos = null;
      for (let k = 0; k < 60 && !pos; k++) {
        const base = surpris ? jd + Math.PI : jd;
        const ang = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.32 + i * 0.9;
        const dist = (surpris ? 1.7 : 3.4) + (i % 3) * 0.7 + Math.floor(k / 12) * 0.8;
        const x = jx + Math.cos(ang) * dist, y = jy + Math.sin(ang) * dist;
        if (libre(x, y) && ligneLibre(E.w, E.h, D.bloque, jx, jy, x, y)) pos = { x: centre(x), y: centre(y) };
      }
      if (!pos) for (let k = 0; k < 400 && !pos; k++) { const x = jx + (rngCbt() - 0.5) * 16, y = jy + (rngCbt() - 0.5) * 16; if (libre(x, y)) pos = { x: centre(x), y: centre(y) }; }
      if (!pos) return;
      const z = nouveauMort(type, etage, pos.x, pos.y, 'chasse', { scene: o.scene || null, hp: typeof sp === 'object' ? sp.hp : undefined });
      if (!z) return;
      z.dir = Math.atan2(jy - z.y, jx - z.x);
      if (j) reveiller(z, j);
      zombies.push(z); uids.push(z.uid);
    });
    cache = null;
    return uids;
  }
  const descMort = (z) => ({ uid: z.uid, type: z.type, hp: z.hp });

  // ---------- Joueurs ----------
  function tickJoueurs(dt) {
    for (const j of joueurs.values()) {
      const dd = Math.hypot(j.x - j.px, j.y - j.py);
      j.px = j.x; j.py = j.y;
      if (j.mort) continue;
      if (j.empoigne && T >= j.empoigne.fin + 2000) j.empoigne = null; // sécurité : le mort a disparu
      // pas
      if (dd > 0.02 && j.allure !== 'immobile') {
        j.tPas += dt;
        const periode = j.allure === 'course' ? 300 : j.allure === 'accroupi' ? 700 : 450;
        if (j.tPas >= periode) {
          j.tPas = 0;
          const E = niveau.etages[j.ei];
          const i = Math.max(0, icase(E, j.x, j.y));
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
      mort: false, stats: info.stats || null, empoigne: null, geste: null, agonie: false, pv: null,
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
    if (p.agonie != null) { j.agonie = !!p.agonie; j.aTerre = j.agonie || !!p.aTerre; if (j.agonie) { j.empoigne = null; for (const z of zombies) if (z.saisit === j.id) z.saisit = null; } }
    if (p.pv != null) j.pv = p.pv;
    if (p.stats) j.stats = p.stats;
    if (p.mort != null) { j.mort = !!p.mort; if (j.mort) { j.empoigne = null; for (const z of zombies) if (z.saisit === j.id) z.saisit = null; } }
  }
  function retirerJoueur(id) {
    joueurs.delete(id);
    for (const z of zombies) {
      if (z.saisit === id) z.saisit = null;
      if (z.atk && z.atk.cible === id) z.atk = null;
      if (z.joueur === id) { z.joueur = null; if (z.etat === 'chasse') { changerEtat(z, 'alerte'); z.tEtat = RP.ALERTE_MS * 0.5; } }
    }
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
    vm++;
    return (conteneurs[cle] = { items, progres: 0 });
  }
  function fouiller(joueurId, cle) {
    const j = joueurs.get(joueurId);
    if (cle.startsWith('#c:')) { // caisse de rangement construite : on soulève le couvercle
      const c = constructions.find(q => q.uid === cle.slice(3));
      if (!c || !c.items) return { items: [], dureeMs: 0, progres: 1, erreur: 'pas un conteneur' };
      return { items: c.items.map(i => ({ ...i })), dureeMs: 350, progres: 1, nom: (CONSTRUCTIONS[c.type].nom || 'la caisse').toLowerCase() };
    }
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
    if (c && progres != null) { c.progres = Math.max(c.progres || 0, Math.min(1, progres)); vm++; }
    j.fouille = null;
  }
  // prendre(joueurId, cle, index, qty?) : toute la pile, ou seulement `qty` exemplaires (le reste reste en place).
  function prendre(joueurId, cle, index, qty) {
    if (cle.startsWith('#sol:')) { // objet posé par terre (« #sol:uid ») — pas un meuble de l'étage « sol »
      const uid = +cle.slice(5);
      const k = sol.findIndex(o => o.uid === uid);
      if (k < 0) return null;
      const o = sol[k];
      if (!o.doc && qty > 0 && qty < (o.qty || 1)) { o.qty -= qty; evts.push({ type: 'sol', action: 'pris', uid, joueur: joueurId }); vm++; return { ...etatObjet(o), qty }; }
      sol.splice(k, 1);
      evts.push({ type: 'sol', action: 'pris', uid, joueur: joueurId }); vm++;
      return o.doc ? { doc: o.doc } : etatObjet(o);
    }
    const c = cle.startsWith('#c:') ? constructions.find(q => q.uid === cle.slice(3)) : conteneurs[cle];
    if (!c || !c.items || index < 0 || index >= c.items.length) return null;
    const src = c.items[index];
    let it;
    if (qty > 0 && qty < (src.qty || 1)) { src.qty -= qty; it = { ...src, qty }; }
    else it = c.items.splice(index, 1)[0];
    evts.push({ type: 'conteneur', cle, reste: c.items.length, joueur: joueurId }); vm++;
    return it;
  }
  // Un objet du sol sans sa position (id, qty et son état : reste, ouvert, dur, eau…).
  function etatObjet(o) { const { uid: _u, etage: _e, x: _x, y: _y, doc: _d, ...r } = o; return r; }
  function deposer(joueurId, pos, item) {
    const j = joueurs.get(joueurId);
    const e = (pos && pos.etage) || (j && j.etage);
    if (!item || EI(e) == null) return null;
    const o = { uid: uidSeq++, etage: e, x: pos && pos.x != null ? pos.x : j.x, y: pos && pos.y != null ? pos.y : j.y, ...(item.doc ? { doc: item.doc } : { ...etatObjet(item), qty: item.qty || 1 }) };
    sol.push(o);
    evts.push({ type: 'sol', action: 'pose', uid: o.uid, joueur: joueurId }); vm++;
    return o;
  }
  function retirerZombies(uids, { tues = false } = {}) {
    const set = new Set(uids || []);
    const restants = [];
    for (const z of zombies) {
      if (!set.has(z.uid)) { restants.push(z); continue; }
      lacher(z);
      if (tues) { cadavres.push({ uid: z.uid, type: z.type, sexe: z.sexe, etage: z.etage, x: z.x, y: z.y, dir: z.dir }); vm++; }
    }
    zombies = restants;
    libererJoueurs();
  }
  function repousserZombies(uids, depuis) {
    const set = new Set(uids || []);
    const RF2 = REGLAGES.combat.FUITE || {};
    for (const z of zombies) {
      if (!set.has(z.uid)) continue;
      const E = niveau.etages[z.ei], D = dyn[z.ei];
      const ox = depuis && depuis.x != null ? depuis.x : z.x - Math.cos(z.dir), oy = depuis && depuis.y != null ? depuis.y : z.y - Math.sin(z.dir);
      let a = Math.atan2(z.y - oy, z.x - ox);
      if (!isFinite(a)) a = rngSim() * Math.PI * 2;
      posTmp.x = z.x; posTmp.y = z.y;
      deplacer(E.w, E.h, D.bloque, posTmp, Math.cos(a) * (RF2.REPOUSSE_CASES || 4), Math.sin(a) * (RF2.REPOUSSE_CASES || 4), RAYON_MORT);
      z.x = posTmp.x; z.y = posTmp.y;
      z.etourdi = (RC.FUITE && RC.FUITE.ETOURDI_MS) || 3000; z.chemin = []; z.alerte = 1; z.atk = null; lacher(z);
      if (z.etat !== 'chasse') changerEtat(z, 'chasse');
      z.memoire = RP.MEMOIRE_MS;
    }
    libererJoueurs();
  }
  function libererJoueurs() {}
  function finCombat() {}            // (ancien écran de combat — conservé pour les canaux existants)
  function blesserZombie(uid, degats) { const z = zombies.find(q => q.uid === uid); if (z) z.hp = Math.max(0, z.hp - degats); return z ? z.hp : 0; }

  let cache = null;
  function instantane() {
    if (cache) return cache;
    const pp = {};
    for (const k in portes) { const s = portes[k]; pp[k] = { etat: s.etat, pv: s.pv, pvMax: s.pvMax, barricadee: s.barricadee }; }
    const cc = {};
    for (const k in conteneurs) cc[k] = { tire: !!conteneurs[k].items, reste: conteneurs[k].items ? conteneurs[k].items.length : null, progres: conteneurs[k].progres };
    cache = {
      zombies: zombies.map(z => ({ uid: z.uid, type: z.type, sexe: z.sexe, x: z.x, y: z.y, etage: z.etage, dir: z.dir, etat: z.etat, alerte: z.alerte,
        hp: z.hp, hpMax: z.hpMax, vitesse: z.vitesse, etourdi: z.etourdi > 0,
        atk: z.atk ? { type: z.atk.type, p: Math.min(1, (T - z.atk.t0) / z.atk.duree), reste: Math.max(0, z.atk.fin - T), cible: z.atk.cible } : null,
        fente: z.fente ? Math.min(1, (T - z.fente.t0) / RC.FENTE.MS) : null, eq: z.equilibreMax ? Math.round(100 * z.equilibre / z.equilibreMax) / 100 : 1,
        saisit: z.saisit, vac: z.vacille > 0, terre: z.aTerre > 0, touche: T - z.tTouche < 160 })),
      portes: pp, conteneurs: cc,
      sol: sol.map(o => ({ ...o })), cadavres: cadavres.map(c => ({ ...c })),
      constructions: constructions.map(c => ({ ...c, items: undefined, n: c.items ? c.items.length : undefined })), retires: [...retires],
      joueurs: [...joueurs.values()].map(j => ({ id: j.id, nom: j.nom, x: j.x, y: j.y, etage: j.etage, dir: j.dir, lampe: j.lampe, lampeSource: j.lampeSource, allure: j.allure, mort: j.mort,
        aTerre: !!j.aTerre, agonie: !!j.agonie, pv: j.pv ?? null,
        geste: j.geste && T - j.geste.t < j.geste.duree ? { type: j.geste.type, p: (T - j.geste.t) / j.geste.duree, combo: j.geste.combo || 0 } : null,
        empoigne: j.empoigne ? { uid: j.empoigne.uid, p: (T - j.empoigne.debut) / j.empoigne.duree, taps: j.empoigne.taps, requis: j.empoigne.requis, reste: Math.max(0, j.empoigne.fin - T) } : null,
        arme: j.stats && j.stats.arme ? j.stats.arme.id : null })),
      t: T, vm,
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
      v: 1, minutes: m, uid: uidSeq, abords: niveau.abords ? { version: niveau.abords.version, dx: niveau.abords.dx, dy: niveau.abords.dy } : null,
      zombies: zombies.map(z => ({ uid: z.uid, type: z.type, sexe: z.sexe, etage: z.etage, x: +z.x.toFixed(2), y: +z.y.toFixed(2), dir: +z.dir.toFixed(2),
        etat: z.etat === 'chasse' || z.etat === 'alerte' ? 'erre' : z.etat, base: z.base, hp: z.hp, proc: z.proc })),
      portes: pp, conteneurs: cc, sol: sol.map(o => ({ ...o })), cadavres: cadavres.map(c => ({ ...c })), joues: joues.slice(),
      constructions: constructions.map(c => ({ ...c, items: c.items ? c.items.map(i => ({ ...i })) : undefined })), retires: [...retires],
    };
  }

  // construire(joueurId, { type, etage, x, y, rot, minutes }) → { ok, uid?, raison? }
  //   raison : 'inconnu' | 'hors' | 'occupe' | 'fenetre' | 'quelqu_un'. Les ingrédients sont payés par le client APRÈS { ok }.
  function construire(joueurId, o = {}) {
    const d = CONSTRUCTIONS[o.type], ei = EI(o.etage);
    if (!d || ei == null) return { ok: false, raison: 'inconnu' };
    const E = niveau.etages[ei], D = dyn[ei], x0 = o.x | 0, y0 = o.y | 0, rot = o.rot | 0;
    for (const [x, y] of casesConstruction(o.type, x0, y0, rot)) {
      if (x < 0 || y < 0 || x * FIN >= E.w || y * FIN >= E.h) return { ok: false, raison: 'hors' };
      const sous = [];
      for (let dy = 0; dy < FIN; dy++) for (let dx = 0; dx < FIN; dx++) sous.push((y * FIN + dy) * E.w + x * FIN + dx);
      if (sous.some(i => consCase[ei].has(i))) return { ok: false, raison: 'occupe' };
      if (d.pose === 'fenetre') { if (!sous.some(i => E.code[i] === K.FENETRE)) return { ok: false, raison: 'fenetre' }; continue; }
      if (sous.some(i => E.code[i] !== K.SOL || D.bloque[i])) return { ok: false, raison: 'occupe' };
      if (d.bloque && caseOccupee(o.etage, x, y)) return { ok: false, raison: 'quelqu_un' };
    }

    const m = o.minutes ?? minutes;
    const c = { uid: 'c' + (consSeq++), type: o.type, etage: o.etage, x: x0, y: y0, rot, pv: d.pv, pvMax: d.pv };
    if (d.contenance) c.items = [];
    if (d.porte) c.ouverte = false;
    if (d.feu) c.feuJusqua = m + d.feu.minutes;
    if (d.eau) { c.eau = 0; c.eauT = m; }
    if (d.potager) c.plante = m;
    constructions.push(c); indexerC(c, true); appliquerConstructions(niveau, dyn, [c]);
    evts.push({ type: 'construction', action: 'pose', c: { ...c }, joueur: joueurId }); vm++; cache = null;
    return { ok: true, uid: c.uid };
  }
  function retirerConstruction(c, action, source) {
    constructions = constructions.filter(q => q !== c); indexerC(c, false);
    for (const it of c.items || []) sol.push({ uid: uidSeq++, etage: c.etage, x: c.x + 0.5, y: c.y + 0.5, ...it });
    recalculerDyn();
    evts.push({ type: 'construction', action, uid: c.uid, source: source || null, x: c.x + 0.5, y: c.y + 0.5, etage: c.etage }); vm++; cache = null;
  }
  // agirConstruction(joueurId, uid, action, patch) : 'demonter' (→ rendu : la moitié des matériaux) | 'ouvrir' | 'fermer' |
  //   'maj' (patch : feuJusqua, eau, eauT, plante — calculés par le client, qui connaît l'heure et la météo).
  function agirConstruction(joueurId, uid, action, patch) {
    const c = constructions.find(q => q.uid === uid); if (!c) return { ok: false, raison: 'absente' };
    const d = CONSTRUCTIONS[c.type];
    if (action === 'demonter') {
      retirerConstruction(c, 'demontee', joueurId);
      const etat = c.pv / (c.pvMax || 1);
      const rendu = (d.ingredients || []).map(x => ({ id: x.id, qty: Math.floor(x.qty * 0.5 * (0.5 + 0.5 * etat)) })).filter(x => x.qty > 0 && x.id !== 'graines' && x.id !== 'journal_papier');
      return { ok: true, rendu };
    }
    if (action === 'ouvrir' || action === 'fermer') {
      if (!d.porte) return { ok: false, raison: 'pas une porte' };
      if (action === 'fermer' && caseOccupee(c.etage, c.x, c.y)) return { ok: false, raison: 'occupee' };
      c.ouverte = action === 'ouvrir'; recalculerDyn();
    } else if (action === 'maj') {
      for (const k of ['feuJusqua', 'eau', 'eauT', 'plante']) if (patch && k in patch) c[k] = patch[k];
    } else return { ok: false, raison: 'action' };
    evts.push({ type: 'construction', action: 'maj', c: { ...c, items: undefined }, joueur: joueurId }); vm++; cache = null;
    return { ok: true };
  }
  // ranger(joueurId, cle, item) : poser un objet dans une caisse construite ('#c:uid') ou un meuble déjà fouillé.
  function ranger(joueurId, cle, item) {
    if (!item || !item.id) return { ok: false };
    const c = cle.startsWith('#c:') ? constructions.find(q => q.uid === cle.slice(3)) : conteneurs[cle];
    if (!c || !c.items) return { ok: false, raison: 'pas un conteneur' };
    const etat = Object.keys(item).some(k => k !== 'id' && k !== 'qty');
    const pile = !etat && c.items.find(i => i.id === item.id && !Object.keys(i).some(k => k !== 'id' && k !== 'qty'));
    if (pile) pile.qty = (pile.qty || 1) + (item.qty || 1); else c.items.push({ ...item, qty: item.qty || 1 });
    evts.push({ type: 'conteneur', cle, reste: c.items.length, joueur: joueurId }); vm++; cache = null;
    return { ok: true };
  }
  // demonterMeuble(joueurId, cle) → { ok, rendu: [{ id, qty }] } : le meuble disparaît, son contenu tombe au sol.
  function demonterMeuble(joueurId, cle) {
    const m = niveau.meubleParCle[cle]; const D2 = m && (DEMONTABLES[m.type] || (RECOLTES[m.type] && RECOLTES[m.type].rendu));
    if (!m || !D2 || retires.has(cle)) return { ok: false, raison: 'impossible' };
    if (RECOLTES[m.type] && RECOLTES[m.type].souche) bruit({ etage: m.etage, x: (m.x0 + m.x1 + 1) / 2, y: (m.y0 + m.y1 + 1) / 2, rayon: 12 });
    retires.add(cle);
    const c = conteneurs[cle];
    if (c && c.items) for (const it of c.items) sol.push({ uid: uidSeq++, etage: m.etage, x: (m.x0 + m.x1 + 1) / 2, y: (m.y0 + m.y1 + 1) / 2, ...it });
    delete conteneurs[cle];
    recalculerDyn();
    evts.push({ type: 'meuble', action: 'demonte', cle, joueur: joueurId }); vm++; cache = null;
    return { ok: true, rendu: Object.entries(D2).filter(([k]) => k !== 'ms').map(([id, qty]) => ({ id, qty })) };
  }

  function tick(dtMs) {
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
      T += dt;
      tickJoueurs(dt);
      traiterBruits();
      for (const z of zombies) majMort(z, dt);
      if (constructions.length) for (const z of zombies.slice()) pieges(z);
      separer(dt);
      separerJoueurs();
    }
    const out = evts; evts = [];
    return out;
  }
  // Événements produits hors du pas (actions) : livrés tout de suite par le canal.
  function viderEvenements() { const out = evts; evts = []; return out; }

  return {
    lieuId, niveau, seed,
    ajouterJoueur, majJoueur, retirerJoueur, bruit, porte, fouiller, arreterFouille, prendre, deposer,
    construire, agirConstruction, ranger, demonterMeuble, constructions: () => constructions,
    retirerZombies, repousserZombies, finCombat, blesserZombie, tick, instantane, sauver,
    action, faireApparaitre, viderEvenements, temps: () => T,
    // accès pratiques (hôte / vue locale)
    grilles: (etage) => dyn[EI(etage)],
    joueur: (id) => joueurs.get(id) || null,
    joueurs: () => [...joueurs.values()],
    marquerJoue: (i) => { if (!joues.includes(i)) { joues.push(i); vm++; } },
    versionMonde: () => vm,
    estJoue: (i) => joues.includes(i),
    zombies: () => zombies,
  };
}

// Une sauvegarde faite avant les abords (ou avec un autre décalage) : tout ce qui a une position est décalé d'autant.
export function migrerAbords(etat, ab) {
  const avant = etat.abords || { dx: 0, dy: 0 };
  const dx = (ab ? ab.dx : 0) - (avant.dx || 0), dy = (ab ? ab.dy : 0) - (avant.dy || 0);
  if (!dx && !dy) return etat;
  const bouge = (o) => { if (o && o.x != null) { o.x += dx; o.y += dy; } };
  (etat.zombies || []).forEach(bouge); (etat.sol || []).forEach(bouge); (etat.cadavres || []).forEach(bouge); (etat.constructions || []).forEach(bouge);
  etat.retires = (etat.retires || []).map(k => { const m = /^(.*):(-?\d+),(-?\d+)$/.exec(k); return m ? `${m[1]}:${+m[2] + dx},${+m[3] + dy}` : k; });
  const cles = (obj) => { const out = {}; for (const [k, v] of Object.entries(obj || {})) { const m = /^(.*):(-?\d+),(-?\d+)$/.exec(k); out[m ? `${m[1]}:${+m[2] + dx},${+m[3] + dy}` : k] = v; } return out; };
  etat.portes = cles(etat.portes); etat.conteneurs = cles(etat.conteneurs);
  etat.abords = ab ? { version: ab.version, dx: ab.dx, dy: ab.dy } : null;
  return etat;
}
