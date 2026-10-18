// Marcher sans carte (js/travel/errance.js) : réseau fini, cellules valides, sorties réciproques, impasses, traces,
// règles de carte et d'indications. node dev/test_errance.mjs
import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { lieu, chargerNiveau } from '../js/game/donnees.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { FIN } from '../js/carte/catalogue.js';
import { LIEUX_GEO } from '../js/data/lieux.js';
import { TRACES } from '../js/data/troncons.js';
import { reseau, departs, voisin, decoder, idCellule, idImpasse, suiteCote, impasseCote, cap, carteEnMain, peutPlanifier, indications, estCellule } from '../js/travel/errance.js';

const g = reseau();
const cellules = [];
for (const e of g.aretes.values()) { for (let k = 0; k < e.n; k++) cellules.push(idCellule(e, k)); cellules.push(idImpasse(e)); }
assert.ok(g.aretes.size > 0 && g.aretes.size <= 80, `réseau fini : ${g.aretes.size} tronçons`);
assert.ok(cellules.length <= 200, `cellules bornées : ${cellules.length}`);

// chaque lieu de la carte a au moins un départ à pied (jamais coincé sans carte)
for (const [id, geo] of Object.entries(LIEUX_GEO)) if (Number.isFinite(geo.lat)) assert.ok(departs(id).length >= 1, `départ depuis ${id}`);

// un seul réseau : depuis le cimetière (le départ du jeu), on rejoint à pied tous les lieux de la carte, et l'on en revient
{
  const vus = new Set(['cimetiere']), file = ['cimetiere'];
  while (file.length) { const id = file.shift(); for (const d of departs(id)) if (!vus.has(d.vers)) { vus.add(d.vers); file.push(d.vers); } }
  const tous = Object.entries(LIEUX_GEO).filter(([, g]) => Number.isFinite(g.lat)).map(([id]) => id);
  assert.deepEqual(tous.filter(id => !vus.has(id)), [], 'tous les lieux atteignables à pied depuis le cimetière');
  for (const e of g.aretes.values()) assert.ok(departs(e.a).some(d => d.e === e) && departs(e.b).some(d => d.e === e), `${e.id} praticable dans les deux sens`);
}

// chaque cellule : lieu et plan lisibles par les mêmes fonctions que les autres lieux, sorties et entrées présentes
const cote = (niv, s) => { const E = niv.etages[niv.etageIdx[s.etage]], w = E.w / FIN, h = E.h / FIN; return [['o', s.cx], ['e', w - s.cx], ['n', s.cy], ['s', h - s.cy]].sort((a, b) => a[1] - b[1])[0][0]; };
const docs = new Map();
for (const id of cellules) {
  assert.ok(estCellule(id));
  const L = lieu(id); assert.ok(L && L.nom && L.danger > 0 && !Number.isFinite(L.lat), `lieu ${id} (sans place sur la carte)`);
  const def = await chargerNiveau(id); assert.ok(def, `plan ${id}`);
  const niv = parserNiveau(def);
  assert.deepEqual(niv.avertissements, [], `plan ${id} sans avertissement`);
  const c = decoder(id);
  const attendus = c.impasse ? ['o'] : ['o', suiteCote(c.e, c.k), impasseCote(c.e, c.k)];
  const vus = [...new Set(niv.sorties.map(s => cote(niv, s)))].sort();
  assert.deepEqual(vus, [...attendus].sort(), `sorties de ${id}`);
  for (const s of attendus) assert.ok(niv.entrees[s], `entrée ${s} de ${id}`);
  for (const m of niv.etages[0].solItems || []) if (m.doc) docs.set(m.doc, (docs.get(m.doc) || 0) + 1);
  for (const E of niv.etages) for (const it of E.sol || []) if (it.doc) docs.set(it.doc, (docs.get(it.doc) || 0) + 1);
  for (const it of niv.sol || []) if (it.doc) docs.set(it.doc, (docs.get(it.doc) || 0) + 1);
}
for (const t of TRACES) assert.equal(docs.get(t.doc), 1, `trace ${t.doc} posée une fois`);

// sorties réciproques : sortir par un côté puis revenir par le côté d'arrivée ramène au départ
for (const id of cellules) {
  const c = decoder(id); if (c.impasse) continue;
  for (const s of ['o', suiteCote(c.e, c.k), impasseCote(c.e, c.k)]) {
    const v = voisin(id, s);
    assert.ok(v, `${id} par ${s}`);
    if (v.lieu) { assert.ok([c.e.a, c.e.b].includes(v.lieu)); continue; }
    const retour = v.impasse ? voisin(v.cellule, 'o', { cellule: id, cote: s }) : voisin(v.cellule, v.entree);
    assert.deepEqual([retour.cellule, retour.entree], [id, s], `aller-retour ${id} par ${s}`);
  }
}
// un cul-de-sac sans mémoire (vieille sauvegarde) renvoie quand même dans le tronçon
{ const e = [...g.aretes.values()][0]; const v = voisin(idImpasse(e), 'o', null); assert.ok(decoder(v.cellule) && !decoder(v.cellule).impasse); }

// en suivant toujours la bonne rue, on arrive au bout ; dans l'autre sens aussi
for (const e of g.aretes.values()) {
  for (const d of departs(e.a).filter(x => x.e === e).concat(departs(e.b).filter(x => x.e === e))) {
    let cel = d.cellule, ent = d.entree, pasN = 0, fin = null;
    while (!fin && pasN++ < 10) {
      const k = cap(cel, ent); const v = voisin(cel, k.sortie);
      if (v.lieu) fin = v.lieu; else { cel = v.cellule; ent = v.entree; }
    }
    assert.equal(fin, d.vers, `${e.id} : on arrive à ${d.vers}`);
  }
}

// la carte : il faut l'avoir EN CE MOMENT (le brouillard actif) ; une partie sans brouillard garde l'ancienne carte
nouvellePartie({ seed: 7 });
G.world.brouillard = true;
G.player.inventaire = G.player.inventaire.filter(it => !['plan_salon', 'carte_routiere'].includes(it.id));
G.world.flags.pro_plan_pris = true;           // l'avoir eue un jour ne suffit plus pour choisir sa route
assert.equal(carteEnMain('salon'), false);
assert.equal(carteEnMain('region'), false);
G.player.inventaire.push({ id: 'plan_salon', qty: 1 });
assert.equal(carteEnMain('salon'), true);
assert.equal(carteEnMain('region'), false);
G.player.inventaire.push({ id: 'carte_routiere', qty: 1 });
assert.equal(carteEnMain('region'), true);
// planifier : la feuille du trajet (ville ↔ pays passe par la feuille du pays)
G.player.inventaire = [{ id: 'plan_salon', qty: 1 }];
assert.equal(peutPlanifier('tour_horloge', 'emperi'), true);
assert.equal(peutPlanifier('tour_horloge', 'pelissanne'), false, 'le plan de Salon ne mène pas à Pélissanne');
assert.equal(peutPlanifier('pelissanne', 'grans'), false);
G.player.inventaire.push({ id: 'carte_routiere', qty: 1 });
assert.equal(peutPlanifier('tour_horloge', 'pelissanne'), true);
// une partie sans brouillard voit tout, mais ne planifie qu'avec une carte en poche
delete G.world.brouillard;
G.player.inventaire = [];
assert.equal(carteEnMain('salon'), false, 'sans brouillard, toujours pas de carte sans carte');

// indications : lieux désignés par l'histoire, pas encore visités
G.world.lieux = { emperi: { decouvert: true, indique: true }, gare: { decouvert: true }, hopital: { decouvert: true, indique: true, visite: true } };
assert.deepEqual(indications('tour_horloge'), ['emperi']);

console.log(JSON.stringify({ ok: true, troncons: g.aretes.size, cellules: cellules.length }));
