// ============ Exploration — les missions sur place (moteur : js/game/missions.js, contenu : js/data/histoire/missions.js) ============
// Ce qui ne se voit qu'ici : les morts qui restent (nettoyer, dit en mots, jamais en nombre), la pièce atteinte, être
// repéré·e (discrétion), le geste à faire (agir), les vagues (tenir, protéger, après un vacarme), le PNJ qui prend des coups,
// les offres faites en arrivant dans un lieu ou en entrant dans une pièce.
// Co-op : chacun joue les missions là où il est. Ce qui touche SON corps (pièce atteinte, repéré·e, geste) se joue chez
// chacun ; ce qui touche le LIEU (mise en scène, vagues, morts restants, PNJ qui prend des coups) se joue chez l'hôte s'il
// est là, sinon chez l'invité — jamais deux fois. Les décisions remontent à l'hôte (js/game/missions.js, relais).
import { G, genrer } from '../core/state.js';
import { on } from '../core/bus.js';
import { SCENES } from '../game/donnees.js';
import { hasTagDispo } from '../game/inventory.js';
import { pointsAliment } from '../game/survival.js';
import { FIN, icase } from '../carte/catalogue.js';
import * as M from '../game/missions.js';
import { message, sfx, sfxA, vib, caseLibrePres } from './commun.js';
import { lancerAction, jouerScene, couperAction } from './interactions.js';
import { overlayOuvert } from '../game/flow.js';

let V = null, tMaj = 0, tOffre = 0;
// Distance (unités) à laquelle on entend appeler la personne d'une mission : une dizaine de mètres.
const PORTEE_APPEL = 12;
const tenant = () => !!G && G.mode !== 'invite';
// Qui mène le LIEU ici : l'hôte (ou le solo) ; l'invité seulement quand l'hôte n'y est pas.
const meneLieu = () => tenant() || (!!G && G.mode === 'invite' && !!V && M.lieuAutre() !== V.lieuId);

export function lierMissions(v) {
  V = v; tMaj = 0; tOffre = 1600;   // les offres attendent que l'arrivée (et ses scènes d'histoire) soit passée
  if (!v || v.arene) return;
  v.missions = { repere: false, tVague: {}, tBruit: 0, tCri: 0, t0: {}, entendus: new Set() };
  // un mort qui te prend en chasse : tu es repéré·e (missions de discrétion)
  v.off.push(v.canal.on('zombie', (e) => { if (e && e.etat === 'chasse' && V && V.missions) V.missions.repere = true; }));
  // étape « agir » à choix : le geste choisi dans la scène, puis ce que l'hôte a accepté (vacarme, réveil, annonce)
  v.off.push(on('mission:agir', ({ id, variante }) => geste(id, variante)));
  v.off.push(on('mission:consequence', consequence));
  // le coéquipier a fini l'étape pendant mon geste : je m'arrête (rien ne sonne, rien n'est donné)
  v.off.push(on('mission:maj', () => { const a = V && V.action; if (a && a.mission && M.etapeDe(a.mission.id) !== a.mission.e) couperAction(genrer(a.mission.fait)); }));
}

// ---------- Lieux du plan ----------
// La pièce nommée d'un niveau (les noms s'écrivent avec ’ ou ') → { etage, x0, y0, x1, y1, cx, cy } en unités.
const cachePieces = new WeakMap();
export function pieceNommee(niveau, nom) {
  if (!nom) return null;
  let c = cachePieces.get(niveau); if (!c) { c = new Map(); cachePieces.set(niveau, c); }
  const k = M.normNom(nom); if (c.has(k)) return c.get(k);
  const P = niveau.pieces.find(p => p.nom && !p.genere && M.normNom(p.nom) === k);   // jamais une pièce d'une maison des abords
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
  if (!V || V.arene || !G) return;
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
  if (e.choix) return choisir(id, e);
  lancerAction(`${e.libelle}…`, e.ms || 4000, V.j.x, V.j.y, () => {
    if (!V) return;
    if (e.bruit) V.canal.bruit({ etage: V.j.etage, x: V.j.x, y: V.j.y, rayon: e.bruit });
    if (e.reveil) reveiller(e.reveil);
    if (e.annonce) { message(genrer(e.annonce), 4200); sfx('alerte'); vib(120); }
    M.reussirEtape(id);
  }, e.bruitAction || 0, 'clouer', 1800);
}

// ---------- Une étape « agir » à choix (le coffre du Leclerc) ----------
// Le choix dit d'avance le temps et le bruit de chaque façon de faire ; sans l'outil, la façon lente reste écrite avec
// sa raison. Le geste lui-même ne fait rien sonner : c'est la variante acceptée par l'hôte qui revient en conséquence
// (js/game/missions.js effetsEtape). Le geste lent s'interrompt sans alarme ni récompense, et reprend où il en était.
const secondes = (ms) => `${Math.round(ms / 1000)} secondes`;
function choisir(id, e) {
  const c = e.choix, outil = c.silence && hasTagDispo(c.silence.tag, G.player);
  const deja = (V.missions.fait && V.missions.fait[id]) || 0;
  const reste = c.silence ? Math.round(c.silence.ms * (1 - deja)) : 0;
  const choix = [{ label: `${c.vite.label} (${secondes(e.ms || 4000)}, ${c.vite.bruit})`, effets: { mission: ['agir', id, 'vite'] }, suivant: '#fin' }];
  if (outil) choix.push({ label: `${deja > 0 ? c.silence.reprendre : c.silence.label} (${secondes(reste)}, ${c.silence.bruit})`, effets: { mission: ['agir', id, 'silence'] }, suivant: '#fin' });
  choix.push({ label: 'Pas maintenant', suivant: '#fin' });
  const sid = `mission_choix_${id}`;
  SCENES[sid] = { illu: null, musique: null, texte: c.texte + (c.silence && !outil ? `

${c.silence.sansOutil}` : ''), choix };
  return jouerScene(sid);
}
function geste(id, variante) {
  if (!V || V.arene || V.action) return;
  const e = M.etapeDe(id);
  if (!e || e.type !== 'agir' || !e.choix || e.lieu !== V.lieuId) return;
  const r = pieceNommee(V.niveau, e.piece);
  if (!dansPiece(r, V.j.x, V.j.y, V.j.etage, 0.6)) { message('Tu n’es plus devant le coffre.'); return; }
  const c = e.choix, lent = variante === 'silence' && c.silence;
  if (lent && !hasTagDispo(c.silence.tag, G.player)) { message(c.silence.sansOutil); return; }
  const VM = V.missions; VM.fait = VM.fait || {};
  const deja = lent ? VM.fait[id] || 0 : 0, ms = lent ? Math.max(500, Math.round(c.silence.ms * (1 - deja))) : (e.ms || 4000);
  const finir = () => {
    if (!V) return;
    if (M.etapeDe(id) !== e) { message(genrer(c.fait)); return; }       // l'autre a fini entre-temps : rien ne sonne
    if (lent) delete VM.fait[id];
    M.reussirEtape(id, { variante: lent ? 'silence' : 'vite' });
  };
  // interrompu : rien ne sonne, rien n'est donné ; le boîtier à moitié démonté le reste
  const interrompre = lent ? (f) => { if (V && M.etapeDe(id) === e) { VM.fait[id] = Math.min(0.95, deja + (1 - deja) * f); message(c.silence.interrompu, 3200); } } : null;
  lancerAction(`${lent ? c.silence.libelle : e.libelleVite || e.libelle}…`, ms, V.j.x, V.j.y, finir, lent ? c.silence.bruitAction || 0 : e.bruitAction || 0, 'clouer', 1800, interrompre);
  if (V.action) V.action.mission = { id, e, fait: c.fait };
}
// Ce que l'hôte a accepté revient ici (chez celui qui a agi) : le vacarme, le réveil, l'annonce.
function consequence(v) {
  if (!V || !v || (v.lieu && v.lieu !== V.lieuId)) return;
  if (v.bruit) V.canal.bruit({ etage: V.j.etage, x: V.j.x, y: V.j.y, rayon: v.bruit });
  if (v.reveil) reveiller(v.reveil);
  if (v.annonce) { message(genrer(v.annonce), 4600); if (v.bruit) { sfx('alerte'); vib(120); } }
}

// ---------- Le pas (appelé par la boucle de la vue) ----------
export function majMissions(dt) {
  if (!V || V.arene || !V.missions || !G || V.enPause) return;
  const lieu = meneLieu();
  tOffre -= dt;
  if (tOffre <= 0) { tOffre = 900; if (lieu) offres(); }
  tMaj -= dt; if (tMaj > 0) return;
  const pas = 250 + tMaj; tMaj = 250;
  const VM = V.missions, j = V.j, snap = V.snap;
  for (const { id, m, s, e } of M.ici(V.lieuId)) {
    // une étape qui commence ici : sa mise en scène (morts endormis…), son vacarme, sa vague
    if (!s.d.prepare && lieu) {
      M.marquerPrepare(id);
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
        if (!lieu) break;
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
      case 'deposer': if (lieu) deposer(id, s, e); break;
      case 'prendre': if (lieu) prendre(id, e); break;
      case 'construire': {
        if (!lieu) break;
        const manque = M.constructionsManquantes(e, snap.constructions || []);
        if (s.d.manque !== manque.join('|')) { s.d.manque = manque.join('|'); M.majAvancee(id); }
        if (!manque.length) M.reussirEtape(id);
        break;
      }
      case 'proteger': if (lieu) proteger(id, m, s, e, pas); break;
      case 'tenir': {
        const v = e.vagues; if (!v || !lieu) break;
        if (v.nuit && !estNuit()) break;
        if (prochaineVague(id, v)) { vague(v, { etage: j.etage, x: j.x, y: j.y }); message('Des morts montent vers toi.', 2400); }
        break;
      }
      default: break;
    }
  }
}
// Déposer : ce qu'il y a dans un conteneur du plan (son marqueur), compté en points de faim. On ne « donne » rien à
// personne : on range ce qu'on rapporte dans la caisse, et l'étape se remplit quand la caisse est assez pleine.
// objets : { ids, n } — compté en objets (le tas de bois : n branches ou brindilles).
let lectureCaisse = false;
// Ce conteneur (clé de meuble) est-il celui où une mission en cours demande de ranger quelque chose ici ? → l'étape
// (la caisse du camp, le tas de bois) : on l'ouvre pour RANGER, même vide, et l'invite le dit (« Poser du bois sur le tas »).
export function depotIci(cle) {
  if (!V || !cle || !G) return null;
  for (const { e } of M.ici(V.lieuId)) {
    if (e.type !== 'deposer') continue;
    const mk = V.niveau.marqueurs[e.marqueur];
    if (mk && mk.meuble === cle) return e;
  }
  return null;
}
function deposer(id, s, e) {
  const mk = V.niveau.marqueurs[e.marqueur];
  if (!mk || !mk.meuble || lectureCaisse || !V.canal.contenu) return;
  lectureCaisse = true;
  V.canal.contenu(mk.meuble).then((items) => {
    lectureCaisse = false;
    if (!V || M.etapeDe(id) !== e) return;
    let pts = 0;
    if (e.objets) { for (const it of items || []) if (e.objets.ids.includes(it.id)) pts += it.qty || 1; }
    else for (const it of items || []) pts += (it.qty || 1) * pointsAliment(it.id, it.reste ?? 1);
    const f = Math.min(1, pts / ((e.objets ? e.objets.n : e.points) || 1));
    if (s.d.f !== f) { s.d.f = f; M.majAvancee(id); }
    if (f >= 1) M.reussirEtape(id);
  }, () => { lectureCaisse = false; });
}
// Prendre : on a les objets sur soi ; ou bien (à deux, l'autre a pu en prendre un) le conteneur est fouillé jusqu'au bout
// et ils n'y sont plus.
function prendre(id, e) {
  const p = G.player, surSoi = (x) => p.inventaire.some(it => it.id === x) || Object.values(p.equip).includes(x);
  if (e.ids.every(surSoi)) { M.reussirEtape(id); return; }
  const mk = V.niveau.marqueurs[e.marqueur], st = mk && mk.meuble && V.snap.conteneurs[mk.meuble];
  if (!st || (st.progres || 0) < 1 || lectureCaisse || !V.canal.contenu) return;
  lectureCaisse = true;
  V.canal.contenu(mk.meuble).then((items) => {
    lectureCaisse = false;
    if (V && M.etapeDe(id) === e && !(items || []).some(it => e.ids.includes(it.id))) M.reussirEtape(id);
  }, () => { lectureCaisse = false; });
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
  if (V.canal.appelerMorts) V.canal.appelerMorts(n, cible, { types: v.types, proche: !!v.proche });
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
  // en arrivant : on entend la personne d'une mission appeler (une fois par visite) — on va la voir, on lui parle
  // en approchant : on entend la personne d'une mission appeler (une fois par visite, quand on est assez près d'elle,
  // au même étage) — pas dès l'arrivée sur le lieu. On va la voir, on lui parle.
  for (const { id, pnj } of M.pnjsDuLieu(V.lieuId)) {
    if (!pnj.appel || V.missions.entendus.has(id)) continue;
    const s = M.etat(id); if (s && s.etat !== 'proposee') { V.missions.entendus.add(id); continue; }
    const q = V.pnj.find(p => p.mission === id);
    if (!q || q.etage !== V.j.etage || Math.hypot(q.x - V.j.x, q.y - V.j.y) > PORTEE_APPEL) continue;
    V.missions.entendus.add(id);
    message(genrer(pnj.appel), 5200);
    break;
  }
  if (V.occupe || V.action || V.butin || overlayOuvert() || (V.cbt && V.cbt.etat && V.cbt.etat.empoigne)) return;   // une scène à l'écran : on attend
  if (V.zListe.some(z => z.etage === V.j.etage && z.etat === 'chasse' && Math.hypot(z.x - V.j.x, z.y - V.j.y) < 12)) return;   // pas en plein combat
  const j = V.j;
  const id = M.aProposer(V.lieuId, (piece, pres) => dansPiece(pieceNommee(V.niveau, piece), j.x, j.y, j.etage, pres));
  if (id) jouerScene(M.sceneOffre(id));
}
// Les repères des personnages de mission (un cercle autour d'eux, une flèche au bord de l'écran s'ils sont hors de vue) :
// on sait qu'ils sont là (on les a entendus, ou on les protège), pas où sont les objets ni les lieux.
export function reperesMissions() {
  if (!V || V.arene) return null;
  const out = [];
  for (const q of V.pnj) {
    if (!q.mission) continue;
    const s = M.etat(q.mission), e = M.etapeDe(q.mission);
    if ((!s || s.etat === 'proposee') && V.missions && !V.missions.entendus.has(q.mission)) continue;   // pas encore entendue
    out.push({ etage: q.etage, x: q.x, y: q.y, nom: q.nom, danger: !!(e && e.type === 'proteger'), actif: !!(s && s.etat === 'active') });
  }
  return out;
}

// ---------- Le guide (ligne discrète en haut) ----------
export function guideMission() { return V && !V.arene ? M.guide(V.lieuId) : ''; }
