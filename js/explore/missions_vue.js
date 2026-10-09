// ============ Exploration — les missions sur place (moteur : js/game/missions.js, contenu : js/data/histoire/missions.js) ============
// Ce qui ne se voit qu'ici : les morts qui restent (nettoyer, dit en mots, jamais en nombre), la pièce atteinte, être
// repéré·e (discrétion), le geste à faire (agir), les vagues (tenir, protéger, après un vacarme), le PNJ qui prend des coups,
// les offres faites en arrivant dans un lieu ou en entrant dans une pièce. Tourne chez qui tient le monde (solo, hôte).
import { G, genrer } from '../core/state.js';
import { FIN, icase } from '../carte/catalogue.js';
import * as M from '../game/missions.js';
import { message, sfx, sfxA, vib, caseLibrePres } from './commun.js';
import { lancerAction, jouerScene } from './interactions.js';
import { overlayOuvert } from '../game/flow.js';

let V = null, tMaj = 0, tOffre = 0;
const tenant = () => !!G && G.mode !== 'invite';

export function lierMissions(v) {
  V = v; tMaj = 0; tOffre = 1600;   // les offres attendent que l'arrivée (et ses scènes d'histoire) soit passée
  if (!v || v.arene) return;
  v.missions = { repere: false, tVague: {}, tBruit: 0, tCri: 0, t0: {} };
  // un mort qui te prend en chasse : tu es repéré·e (missions de discrétion)
  v.off.push(v.canal.on('zombie', (e) => { if (e && e.etat === 'chasse' && V && V.missions) V.missions.repere = true; }));
}

// ---------- Lieux du plan ----------
// La pièce nommée d'un niveau (les noms s'écrivent avec ’ ou ') → { etage, x0, y0, x1, y1, cx, cy } en unités.
const cachePieces = new WeakMap();
export function pieceNommee(niveau, nom) {
  if (!nom) return null;
  let c = cachePieces.get(niveau); if (!c) { c = new Map(); cachePieces.set(niveau, c); }
  const k = M.normNom(nom); if (c.has(k)) return c.get(k);
  const P = niveau.pieces.find(p => p.nom && M.normNom(p.nom) === k);
  const r = P ? { etage: P.etage, x0: P.x0 / FIN, y0: P.y0 / FIN, x1: (P.x1 + 1) / FIN, y1: (P.y1 + 1) / FIN, cx: (P.x0 + P.x1 + 1) / 2 / FIN, cy: (P.y0 + P.y1 + 1) / 2 / FIN } : null;
  if (!P) console.warn(`[missions] pièce « ${nom} » introuvable dans ${V && V.lieuId}`);
  c.set(k, r);
  return r;
}
const dansPiece = (r, x, y, etage, marge = 0) => !!r && etage === r.etage && x >= r.x0 - marge && x <= r.x1 + marge && y >= r.y0 - marge && y <= r.y1 + marge;

// ---------- Les PNJ des missions (ajoutés à V.pnj par interactions.majPnj) ----------
const placesPnj = new Map();   // lieu:id → position trouvée (stable pendant la visite)
export function pnjsMissions() {
  if (!V || V.arene) return [];
  const out = [];
  for (const { id, pnj } of M.pnjsDuLieu(V.lieuId)) {
    const cle = V.lieuId + ':' + id;
    let pos = placesPnj.get(cle);
    if (!pos) {
      const r = pieceNommee(V.niveau, pnj.piece);
      const base = r ? { etage: r.etage, x: Math.floor(r.cx), y: Math.floor(r.cy) } : V.niveau.entrees.defaut;
      const c = caseLibrePres(V.niveau, base) || base;
      pos = { etage: c.etage, x: c.x + 0.5, y: c.y + 0.5 };
      placesPnj.set(cle, pos);
    }
    out.push({ id: 'mission:' + id, mission: id, nom: pnj.nom, etage: pos.etage, x: pos.x, y: pos.y, dir: Math.PI / 2, style: pnj.style || null,
      parler: () => parlerPnj(id) });
  }
  return out;
}
function parlerPnj(id) {
  const r = M.parlerPnj(id);
  if (r.scene) return jouerScene(r.scene);
  if (r.message) message(genrer(r.message), 4200);
}

// ---------- Les cibles d'interaction (étape « agir ») ----------
export function ciblesMissions(proposer) {
  if (!V || V.arene || !tenant()) return;
  const j = V.j;
  for (const { id, e, s } of M.ici(V.lieuId)) {
    if (e.type !== 'agir') continue;
    const r = pieceNommee(V.niveau, e.piece); if (!r || r.etage !== j.etage) continue;
    if (!dansPiece(r, j.x, j.y, j.etage, 0.6)) continue;
    const d = Math.max(0, Math.hypot(r.cx - j.x, r.cy - j.y) - 1.5);
    proposer({ type: 'mission', lib: e.libelle, etage: r.etage, x0: r.cx - 0.5, y0: r.cy - 0.5, x1: r.cx + 0.5, y1: r.cy + 0.5, cx: r.cx, cy: r.cy,
      f: () => agir(id, e, s) }, Math.min(d, 0.5), 0.6);
  }
}
function agir(id, e) {
  lancerAction(`${e.libelle}…`, e.ms || 4000, V.j.x, V.j.y, () => {
    if (!V) return;
    if (e.bruit) V.canal.bruit({ etage: V.j.etage, x: V.j.x, y: V.j.y, rayon: e.bruit });
    if (e.reveil) reveiller(e.reveil);
    if (e.annonce) { message(genrer(e.annonce), 4200); sfx('alerte'); vib(120); }
    M.reussirEtape(id);
  }, e.bruitAction || 0, 'clouer', 1800);
}

// ---------- Le pas (appelé par la boucle de la vue) ----------
export function majMissions(dt) {
  if (!V || V.arene || !V.missions || !tenant() || V.enPause) return;
  tOffre -= dt;
  if (tOffre <= 0) { tOffre = 900; offres(); }
  tMaj -= dt; if (tMaj > 0) return;
  const pas = 250 + tMaj; tMaj = 250;
  const VM = V.missions, j = V.j, snap = V.snap;
  for (const { id, m, s, e } of M.ici(V.lieuId)) {
    // une étape qui commence ici : sa mise en scène (morts endormis…), son vacarme, sa vague
    if (!s.d.prepare) {
      s.d.prepare = true;
      if (e.preparer) { const r = pieceNommee(V.niveau, e.preparer.piece); V.canal.preparerMission && V.canal.preparerMission({ zone: r ? { etage: r.etage, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 } : null, n: e.preparer.n || 0, etat: e.preparer.etat || 'dort', types: e.preparer.types }); }
      if (e.annonce && !e.libelle) { message(genrer(e.annonce), 4600); sfx('alerte'); vib(120); }
      if (e.debut) {
        if (e.debut.bruit) V.canal.bruit({ etage: j.etage, x: j.x, y: j.y, rayon: e.debut.bruit });
        if (e.debut.vagues) vague(e.debut.vagues, { etage: j.etage, x: j.x, y: j.y });
      }
      if (e.discret) VM.repere = false;
    }
    switch (e.type) {
      case 'eliminer': {
        const r = e.piece ? pieceNommee(V.niveau, e.piece) : null;
        let n = 0; for (const z of snap.zombies) if (!r || dansPiece(r, z.x, z.y, z.etage)) n++;
        const mots = n === 0 ? 'plus un seul mort' : n === 1 ? 'il en reste un, quelque part' : n <= 3 ? 'il en reste encore quelques-uns' : n <= 8 ? 'il en reste encore pas mal' : 'le lieu grouille encore de morts';
        if (s.d.mots !== mots) {
          const avant = s.d.mots; s.d.mots = mots;
          if (avant && n > 0 && n <= 3) message(`${m.titre} : ${mots}.`, 2600);   // l'avancée, dite au moment où elle compte
        }
        // (un lieu sans morts dès l'arrivée : on laisse quelques secondes au premier instantané)
        if (n === 0 && (s.d.vuMorts || performance.now() - (VM.t0[id] || (VM.t0[id] = performance.now())) > 4000)) M.reussirEtape(id);
        if (n > 0) s.d.vuMorts = true;
        break;
      }
      case 'atteindre': {
        if (e.discret && VM.repere && !s.d.repere) {
          s.d.repere = true;
          M.annoncer('echec', 'Repéré{|e} !', (e.siRepere && e.siRepere.texte) || 'Ils t’ont vu{|e}.');
          if (e.siRepere && e.siRepere.bruit) V.canal.bruit({ etage: j.etage, x: j.x, y: j.y, rayon: e.siRepere.bruit });
          if (e.siRepere && e.siRepere.reveil) reveiller(e.siRepere.reveil);
          vib(160);
        }
        if (!e.piece) break;
        const r = pieceNommee(V.niveau, e.piece);
        if (dansPiece(r, j.x, j.y, j.etage, 1.2)) M.reussirEtape(id);
        break;
      }
      case 'proteger': proteger(id, m, s, e, pas); break;
      case 'tenir': {
        const v = e.vagues; if (!v) break;
        if (v.nuit && !estNuit()) break;
        if (prochaineVague(id, v)) { vague(v, { etage: j.etage, x: j.x, y: j.y }); message('Des morts montent vers toi.', 2400); }
        break;
      }
      default: break;
    }
  }
}
// Tout le monde se réveille dans la pièce (ou le lieu) et vient vers toi.
function reveiller(rv) {
  const r = rv && rv.piece ? pieceNommee(V.niveau, rv.piece) : null;
  if (V.canal.reveillerZone) V.canal.reveillerZone({ zone: r ? { etage: r.etage, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 } : null, cible: { etage: V.j.etage, x: V.j.x, y: V.j.y } });
}
const estNuit = () => { const h = (G.world.minutes % 1440) / 60; return h >= 20 || h < 6; };
// Une vague toutes les `chaqueMin` minutes de jeu (la première peu après le début).
function prochaineVague(id, v) {
  const VM = V.missions, now = G.world.minutes;
  if (VM.tVague[id] == null) { VM.tVague[id] = now + Math.max(2, Math.round(v.chaqueMin * 0.35)); return false; }
  if (now < VM.tVague[id]) return false;
  VM.tVague[id] = now + v.chaqueMin;
  return true;
}
function vague(v, cible) {
  const [a, b] = v.n || [2, 3];
  const n = a + Math.floor(Math.random() * (b - a + 1));
  if (V.canal.appelerMorts) V.canal.appelerMorts(n, cible, { types: v.types });
}
// Protéger : le PNJ attire les morts (il fait du bruit en fouillant), les vagues marchent vers lui, et chaque mort
// collé à lui le blesse. On l'entend crier quand il est touché.
function proteger(id, m, s, e, pas) {
  const q = V.pnj.find(p => p.mission === id); if (!q) return;
  const VM = V.missions, cible = { etage: q.etage, x: q.x, y: q.y };
  if (e.vagues && prochaineVague(id, e.vagues)) { vague(e.vagues, cible); message(`Des morts arrivent : ils ont entendu ${m.pnj.nom}.`, 2600); }
  VM.tBruit -= pas; if (VM.tBruit <= 0) { VM.tBruit = 5000; V.canal.bruit({ etage: q.etage, x: q.x, y: q.y, rayon: 7, source: 'pnj' }); }
  let n = 0;
  for (const z of V.snap.zombies) if (z.etage === q.etage && Math.hypot(z.x - q.x, z.y - q.y) < 1.15 && !z.terre) n++;
  if (!n) return;
  const pv = M.blesserPnj(id, n * 6 * pas / 1000);
  VM.tCri -= pas;
  if (VM.tCri <= 0 && pv > 0) { VM.tCri = 2600; sfxA('degats', q.x, q.y, q.etage); message(`${m.pnj.nom} crie ! Les morts l’ont atteinte.`, 1800); }
}

// ---------- Les offres : en arrivant dans le lieu, ou en entrant dans une pièce ----------
function offres() {
  if (V.occupe || V.action || V.butin || overlayOuvert() || (V.cbt && V.cbt.etat && V.cbt.etat.empoigne)) return;   // une scène à l'écran : on attend
  if (V.zListe.some(z => z.etage === V.j.etage && z.etat === 'chasse' && Math.hypot(z.x - V.j.x, z.y - V.j.y) < 12)) return;   // pas en plein combat
  let id = M.aProposer(V.lieuId, null);
  if (!id) {
    const i = icase(V.E, V.j.x, V.j.y), p = i >= 0 ? V.E.piece[i] : -1;
    const P = p >= 0 ? V.niveau.pieces[p] : null;
    if (P && P.nom) id = M.aProposer(V.lieuId, P.nom);
  }
  if (id) jouerScene(M.sceneOffre(id));
}

// ---------- Le guide (ligne discrète en haut) ----------
export function guideMission() { return V && !V.arene ? M.guide(V.lieuId) : ''; }
