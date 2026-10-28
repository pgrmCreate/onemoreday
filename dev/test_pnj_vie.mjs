// Test headless de LA VIE DES PNJ (js/explore/pnj_vie.js) au camp du bois de la Barben, et du tas de bois du premier soir.
// Les gens bougent vraiment (chacun a marché et fait au moins deux choses), ne traversent ni les pins ni le fourgon, ne
// restent jamais bloqués, dorment la nuit (René veille), s'arrêtent et regardent quand on leur parle ; tous les endroits
// où leur vie les envoie sont accessibles. Le tas de bois : cinq branches posées dessus remplissent l'étape du soir.
// Lancer : node dev/test_pnj_vie.mjs   (code ≠ 0 en cas d'échec)
import { nouvellePartie, G } from '../js/core/state.js';
import * as player from '../js/game/player.js';
import * as M from '../js/game/missions.js';
import * as quetes from '../js/game/quetes.js';
import { parserNiveau } from '../js/explore/niveau.js';
import { FIN, icase } from '../js/carte/catalogue.js';
import { animerPnj, ecouter } from '../js/explore/pnj_vie.js';
import BOIS from '../js/data/niveaux/bois_barben.js';
import { MISSIONS } from '../js/data/histoire/missions.js';

let echecs = 0, n = 0;
const ok = (cond, msg) => { n++; if (!cond) { echecs++; console.log('  ÉCHEC :', msg); } else console.log('  ok   :', msg); };
const titre = (t) => console.log('\n== ' + t);

nouvellePartie({ nom: 'Test', mode: 'solo', seed: 11 });
player.normaliserJoueur(G.player);
G.world.minutes = 18 * 60 + 30;      // jour 1, 18 h 30 : le soir de la panne
const niveau = parserNiveau(BOIS);
const E = niveau.etages[0];
const bloque = E.bloque;
const libre = (x, y) => { const i = icase(E, x, y); return i >= 0 && !bloque[i]; };

// les PNJ présents avant l'attaque (comme js/explore/interactions.js majPnj)
import { verifier } from '../js/game/conditions.js';
function lister() {
  return niveau.pnj.filter(q => verifier(q.si)).map(q => ({ id: q.id, nom: q.nom || q.id, etage: q.etage, x: q.x + 0.5, y: q.y + 0.5, dir: q.dir ?? Math.PI / 2, vie: q.vie }));
}
const V = { E, j: { x: 60, y: 40, etage: E.id }, pnj: lister() };

// ---------- 1. Les endroits de leur vie ----------
titre('Les endroits où leur vie les envoie');
for (const q of niveau.pnj) {
  if (!q.vie) continue;
  const pts = [];
  for (const m of [...(q.vie.moments || []), ...(q.vie.nuit ? [q.vie.nuit] : [])]) { if (Array.isArray(m.a)) pts.push(m.a); for (const p of m.par || []) pts.push(p); }
  const mauvais = pts.filter(([x, y]) => !libre(x, y));
  ok(!mauvais.length, q.id + ' : ' + pts.length + ' endroits, tous où l’on peut se tenir' + (mauvais.length ? ' — bloqués : ' + JSON.stringify(mauvais) : ''));
}

// ---------- 2. Dix minutes de vie, le jour ----------
titre('Dix minutes de vie au camp (le jour)');
const trace = new Map();
const pas = 50;
let dansObstacle = [];
for (let t = 0; t < 10 * 60 * 1000; t += pas) {
  animerPnj(V, pas, bloque);
  for (const q of V.pnj) {
    let T = trace.get(q.id); if (!T) trace.set(q.id, T = { dist: 0, x: q.x, y: q.y, geste: new Set(), pose: new Set(), immobileAller: 0, maxImmobile: 0, marche: 0 });
    const d = Math.hypot(q.x - T.x, q.y - T.y); T.dist += d; T.x = q.x; T.y = q.y;
    if (q.geste) T.geste.add(q.geste); if (q.pose) T.pose.add(q.pose);
    if (q.marche > 0.5) { T.marche++; if (d < 1e-4) T.immobileAller += pas; else T.immobileAller = 0; T.maxImmobile = Math.max(T.maxImmobile, T.immobileAller); }
    const S = V.viePnj.get(q.id);
    if (S && S.etape === 'aller' && !libre(q.x, q.y)) dansObstacle.push(q.id + '@' + q.x.toFixed(2) + ',' + q.y.toFixed(2));
  }
}
for (const [id, T] of trace) {
  const activites = T.geste.size + T.pose.size;
  ok(T.dist > 2, id + ' a bougé (' + T.dist.toFixed(1) + ' unités parcourues en dix minutes)');
  ok(activites >= 2, id + ' fait plusieurs choses : ' + [...T.geste, ...T.pose].join(', '));
  ok(T.maxImmobile < 3000, id + ' ne reste jamais coincé en marchant (au plus ' + T.maxImmobile + ' ms sur place)');
}
ok(!dansObstacle.length, 'personne ne marche à travers un pin, un buisson ou le fourgon' + (dansObstacle.length ? ' : ' + dansObstacle.slice(0, 5).join(' ') : ''));
const th = trace.get('bb_thierry');
ok(th && th.geste.has('meca'), 'Thierry cherche la panne sous le capot (geste « meca »)');
ok(trace.get('rene') && trace.get('rene').pose.has('assis'), 'René s’assoit sur sa souche pour veiller');

// ---------- 3. Quand on lui parle ----------
titre('Quand on lui parle');
const mathis = V.pnj.find(q => q.id === 'bb_mathis');
V.j.x = mathis.x + 1.2; V.j.y = mathis.y;
ecouter(V, 'bb_mathis', 3000);
const avant = { x: mathis.x, y: mathis.y };
for (let t = 0; t < 2000; t += pas) animerPnj(V, pas, bloque);
const m2 = V.pnj.find(q => q.id === 'bb_mathis');
ok(Math.hypot(m2.x - avant.x, m2.y - avant.y) < 0.3, 'il s’arrête');
ok(Math.abs(Math.atan2(Math.sin(Math.atan2(V.j.y - m2.y, V.j.x - m2.x) - m2.dir), Math.cos(Math.atan2(V.j.y - m2.y, V.j.x - m2.x) - m2.dir))) < 0.4, 'et il te regarde');
V.j.x = 60; V.j.y = 40;

// ---------- 4. La nuit ----------
titre('La nuit');
G.world.minutes = 23 * 60 + 30;
for (let t = 0; t < 90 * 1000; t += pas) animerPnj(V, pas, bloque);
const poses = Object.fromEntries(V.pnj.map(q => [q.id, q.pose]));
ok(['bb_martine', 'bb_sandrine', 'bb_mathis', 'laura'].every(id => poses[id] === 'dort'), 'Martine, Sandrine, Mathis et Laura dorment près du fourgon');
ok(poses.rene === 'assis', 'René veille, assis sur sa souche');
ok(poses.bb_thierry === 'assis', 'Thierry ne dort pas : assis sur le marchepied');

// ---------- 5. Le tas de bois du premier soir ----------
titre('Le tas de bois');
const e = MISSIONS.m_bois.etapes[0];
ok(niveau.marqueurs[e.marqueur] && niveau.marqueurs[e.marqueur].meuble, 'le tas de bois est un rangement du plan (marqueur ' + e.marqueur + ')');
const bois = niveau.sol.filter(o => e.objets.ids.includes(o.id)).reduce((s, o) => s + (o.qty || 1), 0);
ok(bois >= e.objets.n + 3, 'assez de bois mort par terre autour du camp (' + bois + ' pour ' + e.objets.n + ' demandés)');
quetes.avancer('q_debut', 'bois'); M.accepter('m_bois');
ok(M.etapeDe('m_bois') === e, 'la mission du soir commence avec la partie');
M.reussirEtape('m_bois');
ok(G.world.quetes.q_debut.etape === 'panne' && G.world.flags.bois_fait, 'le tas fait : l’objectif devient « te trouver un coin pour dormir »');
M.accepter('m_bois'); M.clore('m_bois');
ok(G.world.missions.m_bois.etat === 'close', 'le matin, un tas pas fait se clôt sans un mot');

console.log('\n' + (n - echecs) + '/' + n + ' vérifications réussies.');
process.exit(echecs ? 1 : 0);
