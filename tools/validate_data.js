// ============ Validateur de données (outil de développement) ============
// Usage : node tools/run_validate.mjs  (ou import direct en module ES)
// Vérifie : graphe des scènes, ids d'objets/zombies/compétences, schéma des effets,
// cartes du monde (liens inter-cartes, connexité, tables de fouille), recettes.
import { SCENES } from '../js/data/story.js';
import { EVENTS } from '../js/data/events.js';
import { ITEMS } from '../js/data/items.js';
import { CLOTHES } from '../js/data/clothing.js';
import { ZOMBIES } from '../js/data/zombies.js';
import { CARTES, DEPART, DEPART_CH2 } from '../js/data/world.js';
import { RECIPES } from '../js/data/recipes.js';
import { SKILLS } from '../js/state.js';

const err = [];
const itemOk = (id) => !!(ITEMS[id] || CLOTHES[id]);
const BLESSURES_OK = ['egratignure', 'entaille', 'profonde', 'plaie'];
// blessure : soit 'entaille', soit { type: 'entaille', zones: [...] }
const blessureOk = (b) => typeof b === 'string' ? BLESSURES_OK.includes(b) : !!b && BLESSURES_OK.includes(b.type);
const EFFETS_OK = new Set(['pv', 'sta', 'faim', 'soif', 'items', 'retire', 'blessure', 'combat', 'tempsMin', 'xp', 'flag', 'maladie', 'volNourriture', 'bruit']);

function checkEffets(e, ctx) {
  if (!e) return;
  for (const k of Object.keys(e)) if (!EFFETS_OK.has(k)) err.push(`${ctx} : clé d'effet inconnue '${k}'`);
  for (const it of e.items || []) if (!itemOk(it.id)) err.push(`${ctx} : item inconnu '${it.id}'`);
  for (const it of e.retire || []) if (!itemOk(it.id)) err.push(`${ctx} : retire un item inconnu '${it.id}'`);
  if (e.blessure && !blessureOk(e.blessure)) err.push(`${ctx} : blessure invalide '${JSON.stringify(e.blessure)}'`);
  for (const z of e.combat ? (Array.isArray(e.combat) ? e.combat : [e.combat]) : []) {
    if (!ZOMBIES[z]) err.push(`${ctx} : zombie inconnu '${z}'`);
  }
  for (const sk of Object.keys(e.xp || {})) if (!SKILLS[sk]) err.push(`${ctx} : compétence xp inconnue '${sk}'`);
  if (e.maladie && e.maladie !== 'intoxication') err.push(`${ctx} : maladie invalide '${e.maladie}'`);
}
function checkBesoin(b, ctx) {
  if (!b) return;
  if (b.item && !itemOk(b.item)) err.push(`${ctx} : besoin.item inconnu '${b.item}'`);
  for (const sk of Object.keys(b.skill || {})) if (!SKILLS[sk]) err.push(`${ctx} : besoin.skill inconnue '${sk}'`);
}

// ---------- Scènes ----------
const cibles = new Set([...Object.keys(SCENES), '#retour', '#mort', '#arrivee', '#chapitre2']);
for (const [id, sc] of Object.entries(SCENES)) {
  const cc = (c, ctx) => { if (c !== undefined && c !== null && !cibles.has(c)) err.push(`scène ${id} : cible inconnue '${c}' (${ctx})`); };
  if (sc.auto) cc(sc.auto.suivant, 'auto');
  if (sc.timeout) { cc(sc.timeout.suivant, 'timeout'); checkEffets(sc.timeout.effets, `scène ${id}/timeout`); }
  if (sc.timerMs && !sc.timeout) err.push(`scène ${id} : timerMs sans timeout`);
  for (const ch of sc.choix || []) {
    cc(ch.suivant, 'choix');
    checkEffets(ch.effets, `scène ${id}/choix`);
    checkBesoin(ch.besoin, `scène ${id}`);
    if (ch.test) {
      if (!SKILLS[ch.test.skill]) err.push(`scène ${id} : test.skill inconnue '${ch.test.skill}'`);
      if (!ch.reussite || !ch.echec) err.push(`scène ${id} : test sans branches reussite/echec`);
    }
    if (ch.reussite) { cc(ch.reussite.suivant ?? ch.suivant, 'reussite'); checkEffets(ch.reussite.effets, `scène ${id}/reussite`); }
    if (ch.echec) { cc(ch.echec.suivant ?? ch.suivant, 'echec'); checkEffets(ch.echec.effets, `scène ${id}/echec`); }
  }
  if (!sc.auto && !(sc.choix && sc.choix.length)) err.push(`scène ${id} : ni auto ni choix (cul-de-sac)`);
}
for (const requis of ['intro_reveil', 'loco_demarrage', 'train_depart', 'fin_arrivee', 'ch2_intro_1']) {
  if (!SCENES[requis]) err.push(`scène requise manquante : ${requis}`);
}

// ---------- Événements ----------
const ids = new Set();
for (const ev of EVENTS) {
  if (ids.has(ev.id)) err.push(`événement en double : ${ev.id}`);
  ids.add(ev.id);
  if (!ev.choix || !ev.choix.length) err.push(`événement ${ev.id} : aucun choix`);
  if (ev.condition?.item && !itemOk(ev.condition.item)) err.push(`événement ${ev.id} : condition.item inconnu`);
  for (const ch of ev.choix || []) {
    checkEffets(ch.effets, `événement ${ev.id}`);
    checkBesoin(ch.besoin, `événement ${ev.id}`);
    if (ch.test) {
      if (!SKILLS[ch.test.skill]) err.push(`événement ${ev.id} : test.skill inconnue '${ch.test.skill}'`);
      if (!ch.reussite || !ch.echec) err.push(`événement ${ev.id} : test sans branches`);
      checkEffets(ch.reussite?.effets, `événement ${ev.id}/reussite`);
      checkEffets(ch.echec?.effets, `événement ${ev.id}/echec`);
    }
  }
}

// ---------- Cartes du monde ----------
const ECHELLES_OK = ['interieur', 'quartier', 'ville', 'region'];
const TERRAINS_OK = ['rue', 'place', 'parc', 'rail', 'porte', 'batiment', 'route', 'autoroute',
  'village', 'ville', 'nature', 'site', 'piece', 'couloir', 'escalier', 'eau', 'mur'];
const SPECIALS_OK = ['fontaine', 'siphon', 'peche', 'chasse', 'cloches', 'cellules', 'conducteur', 'batterie', 'locomotive'];
// À garder en phase avec MOB dans js/map.js (mobilier dessiné sur le plan)
const MOBS_OK = ['lit', 'lits', 'comptoir', 'rayonnages', 'etageres', 'table', 'bureau', 'bancs',
  'fauteuils', 'casiers', 'cuisine', 'etabli', 'voiture', 'barreaux', 'tiroirs', 'ratelier',
  'palettes', 'plantes', 'machines', 'debris'];
const CIRCULATION = new Set(['couloir', 'escalier', 'porte']);

function checkVerrou(v, ctx) {
  if (!v.options || !v.options.length) { err.push(`${ctx} : verrou sans options`); return; }
  for (const o of v.options) {
    if (o.outil && !itemOk(o.outil)) err.push(`${ctx} : outil de verrou inconnu '${o.outil}'`);
    if (o.item && !itemOk(o.item)) err.push(`${ctx} : item de verrou inconnu '${o.item}'`);
    if (o.skill && !SKILLS[o.skill]) err.push(`${ctx} : compétence de verrou inconnue '${o.skill}'`);
    if (o.risque && !blessureOk(o.risque.blessure)) err.push(`${ctx} : blessure de verrou invalide`);
  }
}

for (const [cid, C] of Object.entries(CARTES)) {
  if (!ECHELLES_OK.includes(C.echelle)) err.push(`carte ${cid} : échelle invalide '${C.echelle}'`);
  if (!C.tempsParCase) err.push(`carte ${cid} : tempsParCase manquant`);
  for (const z of C.zombiesPool || []) if (!ZOMBIES[z]) err.push(`carte ${cid} : zombie inconnu '${z}'`);
  const walkable = [];
  for (const [pos, cd] of Object.entries(C.cases || {})) {
    const ctx = `carte ${cid}/${pos}`;
    const [x, y] = pos.split(',').map(Number);
    if (Number.isNaN(x) || Number.isNaN(y) || x < 0 || y < 0 || x >= C.largeur || y >= C.hauteur) {
      err.push(`${ctx} : coordonnées hors grille (${C.largeur}×${C.hauteur})`);
    }
    if (!TERRAINS_OK.includes(cd.t)) err.push(`${ctx} : terrain inconnu '${cd.t}'`);
    if (cd.t !== 'eau' && cd.t !== 'mur') walkable.push(pos);
    if (cd.special && !SPECIALS_OK.includes(cd.special)) err.push(`${ctx} : special inconnu '${cd.special}'`);
    if (cd.sombre !== undefined && cd.sombre !== true && cd.sombre !== 1 && cd.sombre !== 2) {
      err.push(`${ctx} : sombre invalide '${cd.sombre}' (attendu : 1, 2 ou true)`);
    }
    if (cd.mob !== undefined && cd.mob !== null && !MOBS_OK.includes(cd.mob)) {
      err.push(`${ctx} : mobilier inconnu '${cd.mob}'`);
    }
    for (const z of cd.zombies || []) if (!ZOMBIES[z]) err.push(`${ctx} : zombie inconnu '${z}'`);
    if (cd.fouille) {
      if (!cd.fouille.max) err.push(`${ctx} : fouille sans max`);
      for (const lt of cd.fouille.table || []) {
        if (!itemOk(lt.id)) err.push(`${ctx} : loot inconnu '${lt.id}'`);
        if (!lt.q || lt.q.length !== 2) err.push(`${ctx} : loot '${lt.id}' sans fourchette q`);
        if (lt.p === undefined) err.push(`${ctx} : loot '${lt.id}' sans probabilité p`);
      }
    }
    if (cd.verrou) checkVerrou(cd.verrou, ctx);
    if (cd.vers) {
      const cible = CARTES[cd.vers.carte];
      if (!cible) err.push(`${ctx} : vers une carte inconnue '${cd.vers.carte}'`);
      else if (!cible.cases[`${cd.vers.x},${cd.vers.y}`]) {
        err.push(`${ctx} : vers ${cd.vers.carte} (${cd.vers.x},${cd.vers.y}) — case cible inexistante`);
      }
    }
  }
  // Passages et murs déclarés : cases existantes, adjacentes, marqueur connu
  const adjacentes = (p, q) => {
    const [ax, ay] = p.split(',').map(Number);
    const [bx, by] = q.split(',').map(Number);
    return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
  };
  for (const [nomListe, liste] of [['passages', C.passages], ['murs', C.murs]]) {
    for (const lien of liste || []) {
      const [p, q, marque] = lien;
      if (!C.cases[p] || !C.cases[q]) err.push(`carte ${cid} : ${nomListe} ${p}↔${q} — case inexistante`);
      else if (!adjacentes(p, q)) err.push(`carte ${cid} : ${nomListe} ${p}↔${q} — cases non adjacentes`);
      if (nomListe === 'passages' && marque !== undefined && marque !== 'ouvert') {
        err.push(`carte ${cid} : passage ${p}↔${q} — marqueur inconnu '${marque}'`);
      }
    }
  }
  // Connexité : toutes les cases franchissables doivent se rejoindre à pied.
  // En intérieur, on tient compte des MURS : deux pièces voisines ne communiquent
  // que par un passage déclaré, ou si l'une des deux est couloir/escalier/porte.
  if (walkable.length > 1) {
    const lieDans = (liste, k1, k2) => (liste || []).some(([p, q]) => (p === k1 && q === k2) || (p === k2 && q === k1));
    const passe = (k1, k2) => {
      if (C.echelle !== 'interieur') return true;
      if (lieDans(C.murs, k1, k2)) return false;
      if (C.ouvert) return true;
      const a = C.cases[k1], b = C.cases[k2];
      if (CIRCULATION.has(a.t) || CIRCULATION.has(b.t)) return true;
      return lieDans(C.passages, k1, k2);
    };
    const set = new Set(walkable);
    const vus = new Set([walkable[0]]);
    const file = [walkable[0]];
    while (file.length) {
      const cur = file.pop();
      const [x, y] = cur.split(',').map(Number);
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const k = `${x + dx},${y + dy}`;
        if (set.has(k) && !vus.has(k) && passe(cur, k)) { vus.add(k); file.push(k); }
      }
    }
    if (vus.size !== set.size) {
      const isolees = walkable.filter(p => !vus.has(p));
      err.push(`carte ${cid} : cases injoignables à pied (murs compris) : ${isolees.join(' ; ')}`);
    }
  }
}
// Points de départ (chapitre 1 et 2)
if (!CARTES[DEPART.carte]) err.push(`DEPART : carte inconnue '${DEPART.carte}'`);
else if (!CARTES[DEPART.carte].cases[`${DEPART.x},${DEPART.y}`]) err.push(`DEPART : case (${DEPART.x},${DEPART.y}) inexistante`);
if (!CARTES[DEPART_CH2.carte]) err.push(`DEPART_CH2 : carte inconnue '${DEPART_CH2.carte}'`);
else if (!CARTES[DEPART_CH2.carte].cases[`${DEPART_CH2.x},${DEPART_CH2.y}`]) err.push(`DEPART_CH2 : case (${DEPART_CH2.x},${DEPART_CH2.y}) inexistante`);
// La quête principale a besoin de ces specials quelque part dans le monde
for (const requis of ['conducteur', 'locomotive', 'batterie', 'siphon']) {
  const present = Object.values(CARTES).some(C => Object.values(C.cases).some(cd => cd.special === requis));
  if (!present) err.push(`monde : aucun special '${requis}' — la quête principale est cassée`);
}

// ---------- Recettes ----------
for (const r of RECIPES) {
  for (const ing of r.ingredients) if (!itemOk(ing.id)) err.push(`recette ${r.id} : ingrédient inconnu '${ing.id}'`);
  if (r.resultat && !itemOk(r.resultat.id)) err.push(`recette ${r.id} : résultat inconnu '${r.resultat.id}'`);
  for (const o of r.outils) if (o !== 'feu' && o !== 'casserole' && !itemOk(o)) err.push(`recette ${r.id} : outil inconnu '${o}'`);
  if (r.skill && !SKILLS[r.skill.id]) err.push(`recette ${r.id} : compétence inconnue '${r.skill.id}'`);
}

const nCases = Object.values(CARTES).reduce((s, C) => s + Object.keys(C.cases).length, 0);
if (err.length) {
  console.log(`ERREURS (${err.length}) :\n` + err.map(e => '  - ' + e).join('\n'));
  process.exit(1);
} else {
  console.log(`OK — données valides (${Object.keys(SCENES).length} scènes, ${EVENTS.length} événements, ${Object.keys(CARTES).length} cartes / ${nCases} cases, ${Object.keys(ITEMS).length} objets, ${Object.keys(ZOMBIES).length} zombies, ${RECIPES.length} recettes)`);
}
