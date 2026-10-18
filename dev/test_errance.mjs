// Marcher sans carte (js/travel/errance.js) : un voisin par côté de carte (dans sa direction, sur une vraie sortie),
// cellules alignées sur la marche, sorties réciproques, impasses, traces, règles de carte. node dev/test_errance.mjs
import assert from 'node:assert/strict';
import { nouvellePartie, G } from '../js/core/state.js';
import { lieu, chargerNiveau } from '../js/game/donnees.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { FIN } from '../js/carte/catalogue.js';
import { LIEUX_GEO } from '../js/data/lieux.js';
import { TRACES } from '../js/data/troncons.js';
import { reseau, departs, departPar, voisin, decoder, idCellule, idImpasse, reel, coteLateral, cap, carteEnMain, peutPlanifier, estCellule, OPP } from '../js/travel/errance.js';

const g = reseau();
const cellules = [];
for (const e of g.aretes.values()) { for (let k = 0; k < e.n; k++) cellules.push(idCellule(e, k)); cellules.push(idImpasse(e)); }
assert.ok(g.aretes.size > 0 && g.aretes.size <= 80, `réseau fini : ${g.aretes.size} tronçons`);
assert.ok(cellules.length <= 200, `cellules bornées : ${cellules.length}`);

// chaque lieu de la carte a au moins un départ à pied (jamais coincé sans carte), au plus un par côté, chacun sur un
// côté où sa carte a vraiment une sortie et vers un voisin situé dans cette direction
const cote = (niv, s) => { const E = niv.etages[niv.etageIdx[s.etage]], w = E.w / FIN, h = E.h / FIN; return [['o', s.cx], ['e', w - s.cx], ['n', s.cy], ['s', h - s.cy]].sort((a, b) => a[1] - b[1])[0][0]; };
const ANG = { e: 0, n: 90, o: 180, s: -90 };
for (const [id, geo] of Object.entries(LIEUX_GEO)) {
  if (!Number.isFinite(geo.lat)) continue;
  const D = departs(id);
  assert.ok(D.length >= 1, `départ depuis ${id}`);
  assert.equal(new Set(D.map(d => d.cote)).size, D.length, `${id} : un voisin par côté`);
  const niv = parserNiveau(await chargerNiveau(id)), bords = new Set(niv.sorties.map(s => cote(niv, s)));
  for (const d of D) {
    assert.ok(bords.has(d.cote), `${id} : une sortie au ${d.cote} pour aller à ${d.vers}`);
    const b = LIEUX_GEO[d.vers], ang = Math.atan2(b.lat - geo.lat, (b.lon - geo.lon) * Math.cos(geo.lat * Math.PI / 180)) * 180 / Math.PI;
    assert.ok(Math.abs(((ang - ANG[d.cote] + 540) % 360) - 180) <= 70, `${id} → ${d.vers} est bien vers ${d.cote}`);
    assert.equal(departPar(d.vers, OPP[d.cote]).vers, id, `${d.vers} revient vers ${id} par le côté opposé`);
  }
}

// un seul réseau : depuis le cimetière (le départ du jeu), on rejoint à pied tous les lieux de la carte, et l'on en revient
{
  const vus = new Set(['cimetiere']), file = ['cimetiere'];
  while (file.length) { const id = file.shift(); for (const d of departs(id)) if (!vus.has(d.vers)) { vus.add(d.vers); file.push(d.vers); } }
  const tous = Object.entries(LIEUX_GEO).filter(([, g]) => Number.isFinite(g.lat)).map(([id]) => id);
  assert.deepEqual(tous.filter(id => !vus.has(id)), [], 'tous les lieux atteignables à pied depuis le cimetière');
  for (const e of g.aretes.values()) assert.ok(departs(e.a).some(d => d.e === e) && departs(e.b).some(d => d.e === e), `${e.id} praticable dans les deux sens`);
}

// chaque cellule : lieu et plan lisibles par les mêmes fonctions que les autres lieux, sorties et entrées présentes ;
// la rue va tout droit : on entre d'un côté, la suite est en face, dans la direction de a vers b
const sorties = (c) => c.impasse ? [reel(c.e, true, 'o')] : [reel(c.e, false, 'o'), reel(c.e, false, 'e'), coteLateral(c.e)];
const docs = new Map();
for (const id of cellules) {
  assert.ok(estCellule(id));
  const L = lieu(id); assert.ok(L && L.nom && L.danger > 0 && !Number.isFinite(L.lat), `lieu ${id} (sans place sur la carte)`);
  const def = await chargerNiveau(id); assert.ok(def, `plan ${id}`);
  const niv = parserNiveau(def);
  assert.deepEqual(niv.avertissements, [], `plan ${id} sans avertissement`);
  const c = decoder(id);
  const attendus = sorties(c);
  if (!c.impasse) assert.equal(reel(c.e, false, 'e'), c.e.cote[c.e.a], `${id} : la suite est dans la direction de la marche`);
  if (!c.impasse) assert.equal(reel(c.e, false, 'o'), OPP[reel(c.e, false, 'e')], `${id} : tout droit`);
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
  for (const s of sorties(c)) {
    const v = voisin(id, s);
    assert.ok(v, `${id} par ${s}`);
    if (v.lieu) { assert.ok([c.e.a, c.e.b].includes(v.lieu)); continue; }
    const retour = v.impasse ? voisin(v.cellule, v.entree, { cellule: id, cote: s }) : voisin(v.cellule, v.entree);
    assert.deepEqual([retour.cellule, retour.entree], [id, s], `aller-retour ${id} par ${s}`);
  }
}
// un cul-de-sac sans mémoire (vieille sauvegarde) renvoie quand même dans le tronçon
{ const e = [...g.aretes.values()][0]; const v = voisin(idImpasse(e), reel(e, true, 'o'), null); assert.ok(decoder(v.cellule) && !decoder(v.cellule).impasse); }

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

console.log(JSON.stringify({ ok: true, troncons: g.aretes.size, cellules: cellules.length }));
