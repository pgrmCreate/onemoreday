// ============ Exploration — la nature : chercher par terre, abattre un arbre, couper un buisson, cueillir ============
// Recherche au sol (façon Project Zomboid) : touche O ou la loupe. On avance lentement les yeux au sol ; toutes les
// RECHERCHE.PERIODE_MS une case proche et visible est examinée — ce qu'on y trouve dépend de la matière du sol, du mois,
// de la pluie, de la lumière et du niveau de la compétence « Recherche » (js/data/recherche.js) : débutant, on trouve
// rarement, et du rebut ; un coin où l'on vient de trouver quelque chose s'épuise. Ce qu'on trouve est posé au sol,
// signalé d'une onde dorée : on le ramasse avec E. Une case examinée ne redonne rien avant quelques jours
// (G.world.solFouille) ; les trouvailles récentes sont dans G.world.trouvailles.
// Arbres et buissons (js/data/construction.js, RECOLTES) : abattre (hache EN MAIN), couper (lame en main ou mains vides,
// plus lent ; geste secondaire), cueillir (mûres, figues, pignons… en saison, une fois tous les 3 jours). L'arbre abattu
// laisse une souche.
import { G } from '../core/state.js';
import { REGLAGES } from '../data/reglages.js';
import { SOLS_IDS, FIN } from '../carte/catalogue.js';
import { RECOLTES } from '../data/construction.js';
import { RECHERCHE, CATEGORIE_SOL, TABLES_RECHERCHE } from '../data/recherche.js';
import { meteoCourante } from '../travel/rencontres_voyage.js';
import { mod, sfx, message, niv, nomObjet } from './commun.js';
import { lancerAction } from './interactions.js';

let V = null;
export function lierNature(v) { V = v; if (v) { v.recherche = false; v.tRecherche = 0; } }

const minutes = () => (G ? G.world.minutes : 0);
const nomMin = (id) => { const n = nomObjet(id); return n.charAt(0).toLowerCase() + n.slice(1); };
// Le jour 1 est le mercredi 23 septembre : mois (1-12) du jour de jeu.
export function moisJeu(m = minutes()) { const d = new Date(2026, 8, 23 + Math.floor(m / 1440)); return d.getMonth() + 1; }
function aPluRecemment() {
  const t1 = minutes();
  for (let t = t1; t > t1 - 2 * 1440; t -= 60) { const w = meteoCourante(t); if (w === 'pluie' || w === 'orage') return true; }
  return false;
}
const memoire = () => { const w = G.world; w.solFouille = w.solFouille || {}; return (w.solFouille[V.lieuId] = w.solFouille[V.lieuId] || {}); };
const memCueillette = () => { const w = G.world; w.cueilli = w.cueilli || {}; return w.cueilli; };
// Trouvailles récentes de ce lieu : [{ e: étage, x, y, m: minute }] (épuisement d'un coin).
function memTrouvailles() {
  const w = G.world; w.trouvailles = w.trouvailles || {};
  const m = minutes(), l = (w.trouvailles[V.lieuId] || []).filter(t => m - t.m < RECHERCHE.REPOUSSE);
  return (w.trouvailles[V.lieuId] = l);
}

// ---------- Recherche au sol ----------
export const enRecherche = () => !!(V && V.recherche);
export function basculerRecherche(on) {
  if (!V) return false;
  V.recherche = on == null ? !V.recherche : !!on;
  V.tRecherche = RECHERCHE.PERIODE_MS * 0.6;
  message(V.recherche ? 'Tu cherches par terre : avance doucement, regarde où tu poses les pieds.' : 'Tu relèves la tête.', 1800);
  if (V.entrees.setBouton) V.entrees.setBouton('recherche', { actif: V.recherche });
  return V.recherche;
}
// Vitesse de marche quand on cherche (× sur la vitesse normale).
export const vitesseRecherche = () => (enRecherche() ? RECHERCHE.VITESSE : 1);

// Tire un objet de la table ; un objet d'un rang au-dessus du niveau devient très rare.
function tirer(table, rnd, n) {
  const mois = moisJeu(), pluie = table.some(x => x[3] && x[3].pluie) ? aPluRecemment() : false;
  const ok = table.filter(([, , , c]) => !c || ((!c.mois || c.mois.includes(mois)) && (!c.pluie || pluie)));
  const poids = (x) => x[1] * Math.pow(RECHERCHE.HORS_NIVEAU, Math.max(0, ((x[3] && x[3].rang) || 0) - n));
  let tot = 0; for (const x of ok) tot += poids(x);
  let r = rnd() * tot;
  for (const x of ok) { r -= poids(x); if (r <= 0) return x; }
  return ok[ok.length - 1];
}
export function majRecherche(dt) {
  if (!V || !V.recherche) return;
  if (V.occupe || V.action || V.fouille || V.enPause) return;
  V.tRecherche -= dt;
  if (V.tRecherche > 0) return;
  V.tRecherche = RECHERCHE.PERIODE_MS * (0.8 + Math.random() * 0.4);
  const j = V.j, E = V.E, C = V.C, R = RECHERCHE.RAYON;
  // une case au hasard autour de soi, en vue, sur un sol (pas un mur, pas un meuble)
  let x = -1, y = -1, i = -1;
  for (let essai = 0; essai < 8; essai++) {
    const a = Math.random() * Math.PI * 2, d = 0.4 + Math.sqrt(Math.random()) * R;
    const xx = Math.floor((j.x + Math.cos(a) * d) * FIN), yy = Math.floor((j.y + Math.sin(a) * d) * FIN);

    if (xx < 0 || yy < 0 || xx >= E.w || yy >= E.h) continue;
    const ii = yy * E.w + xx;
    if (C.los[ii] !== C.stamp || E.bloque[ii] || E.code[ii] !== 2) continue;
    x = xx; y = yy; i = ii; break;
  }
  if (i < 0) return;
  const cle = `${E.id}:${x}:${y}`, mem = memoire(), m = minutes();
  if (mem[cle] != null && m - mem[cle] < RECHERCHE.REPOUSSE) return;
  mem[cle] = m;
  // on apprend à regarder, même bredouille
  V.xpRecherche = (V.xpRecherche || 0) + RECHERCHE.XP_EXAMEN;
  if (V.xpRecherche >= 1) { const g = Math.floor(V.xpRecherche); V.xpRecherche -= g; try { mod.player && mod.player.gagnerXp && mod.player.gagnerXp('recherche', g); } catch (e) {} }
  const cat = CATEGORIE_SOL[SOLS_IDS[E.sol[i]]] || 'ville';
  const table = TABLES_RECHERCHE[cat]; if (!table) return;
  const lv = niv('recherche');
  let p = RECHERCHE.CHANCE * (1 + RECHERCHE.PAR_NIVEAU * lv) * (RECHERCHE.SOL[cat] ?? 1);
  const vis = C.vis ? C.vis[i] : 1;
  if (vis < 0.3) p *= RECHERCHE.NUIT;
  p *= j.allure === 'accroupi' ? RECHERCHE.ACCROUPI : j.allure === 'immobile' ? RECHERCHE.IMMOBILE : RECHERCHE.MARCHE;
  // le coin s'épuise : chaque trouvaille récente tout près divise les chances
  const tr = memTrouvailles(), ux = (x + 0.5) / FIN, uy = (y + 0.5) / FIN;
  let k = 0; for (const t of tr) if (t.e === E.id && Math.hypot(t.x - ux, t.y - uy) < RECHERCHE.ZONE) k++;
  p *= Math.pow(Math.min(0.9, RECHERCHE.EPUISE + RECHERCHE.EPUISE_PAR_NIVEAU * lv), k);
  if (Math.random() >= p) return;
  const [id, , qty = 1] = tirer(table, Math.random, lv);
  const n = qty > 1 && lv >= RECHERCHE.QTE_NIVEAU ? 1 + Math.floor(Math.random() * Math.min(qty, lv)) : 1;
  tr.push({ e: E.id, x: Math.round(ux * 10) / 10, y: Math.round(uy * 10) / 10, m });
  const pos = { etage: E.id, x: (x + 0.25 + Math.random() * 0.5) / FIN, y: (y + 0.25 + Math.random() * 0.5) / FIN };
  Promise.resolve(V.canal.deposer(pos, { id, qty: n })).catch(() => {});
  if (V.ondes.length < 24) V.ondes.push({ x: pos.x, y: pos.y, etage: E.id, age: 0, duree: 2600, trouve: true });
  sfx('loot', { volume: 0.25 });
  message(`Tu repères : ${nomMin(id)}${n > 1 ? ' ×' + n : ''}.`, 1600);
  try { mod.player && mod.player.gagnerXp && mod.player.gagnerXp('recherche', RECHERCHE.XP); } catch (e) {}
}

// ---------- Arbres et buissons ----------
// Ce qu'on propose devant un arbre ou un buisson (on en croise partout : pas question de proposer de tout couper) :
//  - cueillir, en saison : geste principal (comme ramasser) ;
//  - abattre un arbre : seulement HACHE EN MAIN — alors c'est le geste principal ;
//  - couper un buisson : geste secondaire (menu des autres actions), lame en main ou mains vides (lent) ;
//  - sinon : rien (l'arbre n'est même pas une cible).
export const recoltable = (m) => !!(m && RECOLTES[m.type]);
// Un objet tenu en main (droite ou gauche) qui sait faire ce geste ('abattre', 'elaguer'…).
export function enMain(tag) {
  const e = G && G.player && G.player.equip; if (!e) return false;
  return [e.arme, e.mainG].some(id => { const d = id && mod.inv && mod.inv.def && mod.inv.def(id); return !!(d && (d.usage || []).includes(tag)); });
}
const mainsVides = () => { const e = G && G.player && G.player.equip; return !!e && !e.arme; };
function cueillettePossible(m) {
  const R = RECOLTES[m.type]; if (!R || !R.cueillette) return false;
  if (!R.cueillette.mois.includes(moisJeu())) return false;
  const t = memCueillette()[V.lieuId + ':' + m.cle];
  return t == null || minutes() - t >= 3 * 1440;
}
// Le geste de coupe possible avec ce qu'on a en main (null : rien en main qui convienne). principal : abattre à la hache.
function gesteNature(m) {
  const R = RECOLTES[m.type]; if (!R) return null;
  const nom = m.nom || 'l\'arbre';
  if (enMain(R.outil) || (R.outil === 'elaguer' && enMain('couper'))) return { libelle: `${R.geste} ${nom}`, f: () => recolter(m, 1), principal: R.outil === 'abattre' };
  if (R.mainsNues && mainsVides()) return { libelle: `${R.geste} ${nom} à la main (lent)`, f: () => recolter(m, R.mainsNues), principal: false };
  return null;
}
// Ce que propose cet arbre / ce buisson : null (ne pas le cibler), { principal: true } (geste sur E) ou
// { principal: false } (seulement dans le menu des autres actions).
export function propositionNature(m) {
  if (!recoltable(m)) return null;
  if (cueillettePossible(m)) return { principal: true };
  const g = gesteNature(m);
  return g ? { principal: !!g.principal } : null;
}
// Libellé du geste principal (cueillir si c'est la saison, sinon abattre / couper).
export function libelleNature(m) {
  const R = RECOLTES[m.type];
  if (cueillettePossible(m)) return `Cueillir : ${nomMin(R.cueillette.id)}`;
  const g = gesteNature(m);
  return g ? g.libelle : (m.nom || 'Arbre');
}
// Geste secondaire : la coupe quand on pourrait cueillir.
export function secondaireNature(m) { return cueillettePossible(m) ? gesteNature(m) : null; }
export function agirNature(m) {
  if (cueillettePossible(m)) return cueillir(m);
  const g = gesteNature(m);
  if (g) return g.f();
}
function cueillir(m) {
  const R = RECOLTES[m.type], c = R.cueillette;
  lancerAction(`Cueillir…`, 2600, (m.x0 + m.x1 + 1) / 2, (m.y0 + m.y1 + 1) / 2, () => {
    memCueillette()[V.lieuId + ':' + m.cle] = minutes();
    const n = c.qty + (Math.random() < 0.3 * (1 + 0.2 * niv('chasse')) ? 1 : 0);
    mod.inv.addItem(c.id, n);
    sfx('loot');
    message(`Cueilli : ${nomMin(c.id)} ×${n}.`, 1800);
    try { mod.player && mod.player.gagnerXp && mod.player.gagnerXp('chasse', 2); } catch (e) {}
  });
}
function recolter(m, lenteur) {
  const R = RECOLTES[m.type];
  const ms = R.ms * lenteur * Math.max(0.55, 1 - 0.07 * niv('force'));
  lancerAction(`${R.geste} ${m.nom}…`, ms, (m.x0 + m.x1 + 1) / 2, (m.y0 + m.y1 + 1) / 2, async () => {
    const r = await V.canal.demonterMeuble(m.cle);
    if (!r || !r.ok) { message('Impossible.'); return; }
    for (const x of r.rendu || []) if (x.qty > 0) mod.inv.addItem(x.id, x.qty);
    sfx(R.souche ? 'porte_coup' : 'loot');
    message(`${R.souche ? 'L\'arbre tombe' : 'Coupé'}. Récupéré : ${(r.rendu || []).map(x => `${nomMin(x.id)} ×${x.qty}`).join(', ')}.`, 2600);
    try { mod.player && mod.player.gagnerXp && (mod.player.gagnerXp('force', R.souche ? 6 : 2), mod.player.gagnerXp('construction', 1)); } catch (e) {}
    // la hache s'use sur le bois
    try { if (R.souche && mod.inv.userArme && G.player.equip.arme && mod.inv.def(G.player.equip.arme).usage?.includes('abattre')) mod.inv.userArme(4); } catch (e) {}
  }, R.bruit || 0);
}
// Pour le rendu : un type d'objet retiré laisse-t-il une souche ?
export const laisseSouche = (type) => !!(RECOLTES[type] && RECOLTES[type].souche);
void REGLAGES;
