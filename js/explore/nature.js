// ============ Exploration — la nature : chercher par terre, abattre un arbre, couper un buisson, cueillir ============
// Recherche au sol (façon Project Zomboid) : touche O ou la loupe. On avance lentement les yeux au sol ; toutes les
// RECHERCHE.PERIODE_MS une case proche et visible est examinée — ce qu'on y trouve dépend de la matière du sol, du mois,
// de la pluie, de la lumière (js/data/recherche.js). Ce qu'on trouve est posé au sol, signalé d'une onde dorée : on le
// ramasse avec E. Une case examinée ne redonne rien avant quelques jours (G.world.solFouille).
// Arbres et buissons (js/data/construction.js, RECOLTES) : abattre (hache), couper (lame ou à mains nues, plus lent),
// cueillir (mûres, figues, pignons… en saison, une fois tous les 3 jours). L'arbre abattu laisse une souche.
import { G } from '../core/state.js';
import { REGLAGES } from '../data/reglages.js';
import { SOLS_IDS } from '../carte/catalogue.js';
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

function tirer(table, rnd) {
  const mois = moisJeu(), pluie = table.some(x => x[3] && x[3].pluie) ? aPluRecemment() : false;
  const ok = table.filter(([, , , c]) => !c || ((!c.mois || c.mois.includes(mois)) && (!c.pluie || pluie)));
  let tot = 0; for (const x of ok) tot += x[1];
  let r = rnd() * tot;
  for (const x of ok) { r -= x[1]; if (r <= 0) return x; }
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
    const xx = Math.floor(j.x + Math.cos(a) * d), yy = Math.floor(j.y + Math.sin(a) * d);
    if (xx < 0 || yy < 0 || xx >= E.w || yy >= E.h) continue;
    const ii = yy * E.w + xx;
    if (C.los[ii] !== C.stamp || E.bloque[ii] || E.code[ii] !== 2) continue;
    x = xx; y = yy; i = ii; break;
  }
  if (i < 0) return;
  const cle = `${E.id}:${x}:${y}`, mem = memoire(), m = minutes();
  if (mem[cle] != null && m - mem[cle] < RECHERCHE.REPOUSSE) return;
  mem[cle] = m;
  const cat = CATEGORIE_SOL[SOLS_IDS[E.sol[i]]] || 'ville';
  const table = TABLES_RECHERCHE[cat]; if (!table) return;
  let p = RECHERCHE.CHANCE * (1 + RECHERCHE.PAR_NIVEAU * niv('chasse'));
  const vis = C.vis ? C.vis[i] : 1;
  if (vis < 0.3) p *= RECHERCHE.NUIT;
  p *= j.allure === 'accroupi' ? RECHERCHE.ACCROUPI : j.allure === 'immobile' ? RECHERCHE.IMMOBILE : RECHERCHE.MARCHE;
  if (Math.random() >= p) return;
  const [id, , qty = 1] = tirer(table, Math.random);
  const n = qty > 1 ? 1 + Math.floor(Math.random() * qty) : 1;
  const pos = { etage: E.id, x: x + 0.3 + Math.random() * 0.4, y: y + 0.3 + Math.random() * 0.4 };
  Promise.resolve(V.canal.deposer(pos, { id, qty: n })).catch(() => {});
  if (V.ondes.length < 24) V.ondes.push({ x: pos.x, y: pos.y, etage: E.id, age: 0, duree: 2600, trouve: true });
  sfx('loot', { volume: 0.25 });
  message(`Tu repères : ${nomMin(id)}${n > 1 ? ' ×' + n : ''}.`, 1600);
  try { mod.player && mod.player.gagnerXp && mod.player.gagnerXp('chasse', RECHERCHE.XP); } catch (e) {}
}

// ---------- Arbres et buissons ----------
export const recoltable = (m) => !!(m && RECOLTES[m.type]);
const outilOk = (tag) => !!(tag && mod.inv && mod.inv.hasTag && mod.inv.hasTag(tag));
function cueillettePossible(m) {
  const R = RECOLTES[m.type]; if (!R || !R.cueillette) return false;
  if (!R.cueillette.mois.includes(moisJeu())) return false;
  const t = memCueillette()[V.lieuId + ':' + m.cle];
  return t == null || minutes() - t >= 3 * 1440;
}
// Libellé du geste principal (cueillir si c'est la saison, sinon abattre / couper).
export function libelleNature(m) {
  const R = RECOLTES[m.type];
  if (cueillettePossible(m)) return `Cueillir : ${nomMin(R.cueillette.id)}`;
  return gesteNature(m).libelle;
}
function gesteNature(m) {
  const R = RECOLTES[m.type];
  const nom = m.nom || 'l\'arbre';
  if (outilOk(R.outil) || (R.outil === 'elaguer' && outilOk('couper'))) return { libelle: `${R.geste} ${nom}`, f: () => recolter(m, 1) };
  if (R.mainsNues) return { libelle: `${R.geste} ${nom} à la main (lent)`, f: () => recolter(m, R.mainsNues) };
  return { libelle: `${R.geste} ${nom} (il faut une hache)`, f: () => message('Il faut une hache ou une hachette pour l\'abattre.') };
}
// Geste secondaire : l'autre des deux (abattre quand on pourrait cueillir).
export function secondaireNature(m) { return cueillettePossible(m) ? gesteNature(m) : null; }
export function agirNature(m) {
  if (cueillettePossible(m)) return cueillir(m);
  return gesteNature(m).f();
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
