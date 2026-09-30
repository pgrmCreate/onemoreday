// Test headless de la simulation de combat : node dev/sim_test.mjs [n=200]
// Simule n combats par configuration avec deux « bots » (naïf : frappe sans se défendre ;
// habile : lit la télégraphie, esquive au dernier moment, souffle) et affiche les stats.
import { creerCombat } from '../js/combat/sim.js';
import { statsCombat } from '../js/combat/stats.js';

const N = +(process.argv[2] || 200);

function joueurTest(arme, extra = {}) {
  return {
    pv: 100, pvMax: 100, sta: 100, staMax: 100, faim: 80, fatigue: 85,
    skillXp: {}, inventaire: extra.inventaire || [], accesRapide: [],
    equip: { arme: arme ? { id: arme, ...(extra.inst || {}) } : null, torse: 'tshirt', jambes: 'jean', pieds: 'baskets' },
    blessures: [],
  };
}

function bot(style) {
  let prochainTap = 0, chargeFin = 0;
  return (sim, jid, t) => {
    const e = sim.etat();
    const moi = e.participants.find(p => p.id === jid);
    if (!moi || moi.issue) return;
    if (moi.empoignade && style === 'passif') return;
    if (moi.empoignade) { if (t >= prochainTap) { sim.action(jid, { type: 'frapper', appui: true }); sim.action(jid, { type: 'frapper', appui: false }); prochainTap = t + 160; } return; }
    const z = e.zombies.find(x => x.uid === moi.actif);
    if ((style === 'habile' || style === 'humain') && z && z.etat === 'telegraphe' && !z.esquivee) {
      if (style === 'humain' && z.telRestant > 300) return;
      if (z.telRestant <= 180 && !moi.aBout && moi.esquiveCd === 0) { sim.action(jid, { type: 'esquive' }); return; }
      if (moi.aBout && z.ruee === 'coup' && !moi.garde) { sim.action(jid, { type: 'garde', appui: true }); return; }
      return;
    }
    if (moi.garde && (!z || z.etat !== 'telegraphe')) sim.action(jid, { type: 'garde', appui: false });
    if (style === 'passif' || style === 'passif_tape') return;
    if (moi.occupe) return;
    if (style === 'humain' && t < prochainTap) return;
    if (style === 'humain') prochainTap = t + 900;
    if (style === 'lourd') {
      if (moi.charge == null) { sim.action(jid, { type: 'frapper', appui: true }); chargeFin = t + 2000; }
      else if (moi.charge >= 1 || t >= chargeFin) sim.action(jid, { type: 'frapper', appui: false });
      return;
    }
    if (style === 'habile' && moi.sta < 20 && moi.contre === 0) return;          // souffler
    sim.action(jid, { type: 'frapper', appui: true });
    sim.action(jid, { type: 'frapper', appui: false });
  };
}

function simuler({ zombies, arme, style, seed, inst, inventaire }) {
  const st = statsCombat(joueurTest(arme, { inst, inventaire }));
  const sim = creerCombat({ id: 'test', participants: [{ id: 'j1', nom: 'Test', stats: st }], zombies, seed, surprise: 'normal' });
  const b = bot(style);
  const cps = { coups: 0, parMort: {}, doublons: 0 };
  const vus = new Set();
  let t = 0;
  while (!sim.fini() && t < 300000) {
    b(sim, 'j1', t);
    const ev = sim.tick(50); t += 50;
    for (const x of ev) {
      if (vus.has(x.n)) cps.doublons++; vus.add(x.n);
      if (x.type === 'coup' || x.type === 'rate') { cps.coups++; cps.parMort[x.zombie] = (cps.parMort[x.zombie] || 0) + 1; }
    }
  }
  const r = sim.resultat('j1');
  return { r, cps, t };
}

function campagne(label, cfg) {
  let v = 0, f = 0, m = 0, dur = 0, pvPerdus = 0, coupsParMort = 0, nMorts = 0, doublons = 0, morsures = 0, mal = 0;
  for (let i = 0; i < N; i++) {
    const { r, cps, t } = simuler({ ...cfg, seed: 1000 + i });
    if (r.issue === 'victoire') v++; else if (r.issue === 'fuite') f++; else m++;
    dur += t; pvPerdus += r.degatsRecus; doublons += cps.doublons; mal += r.mal;
    morsures += r.blessures.filter(b => b.type === 'morsure').length;
    for (const uid of r.tues) { coupsParMort += cps.parMort[uid] || 0; nMorts++; }
  }
  console.log(`${label.padEnd(44)} victoire ${(100 * v / N).toFixed(0).padStart(3)} %  durée ${(dur / N / 1000).toFixed(1).padStart(5)} s  coups/mort ${(coupsParMort / Math.max(1, nMorts)).toFixed(1).padStart(4)}  PV perdus ${(pvPerdus / N).toFixed(1).padStart(5)}  morsures/combat ${(morsures / N).toFixed(2)}  mal ${(mal / N).toFixed(1)}${doublons ? '  DOUBLONS ' + doublons : ''}`);
}

console.log(`--- ${N} combats par ligne (compétences 0, t-shirt + jean + baskets) ---`);
for (const style of ['naif', 'habile']) {
  campagne(`errant · mains nues · ${style}`, { zombies: ['errant'], arme: null, style });
  campagne(`errant · couteau de cuisine · ${style}`, { zombies: ['errant'], arme: 'couteau_cuisine', style });
  campagne(`errant · batte · ${style}`, { zombies: ['errant'], arme: 'batte_baseball', style });
  campagne(`errant · machette · ${style}`, { zombies: ['errant'], arme: 'machette', style });
  campagne(`coureur · couteau · ${style}`, { zombies: ['coureur'], arme: 'couteau_cuisine', style });
  campagne(`enrage · pied-de-biche · ${style}`, { zombies: ['enrage'], arme: 'pied_de_biche', style });
  campagne(`colosse · hache · ${style}`, { zombies: ['colosse'], arme: 'hache_pompier', style });
  campagne(`horde 3 errants · couteau · ${style}`, { zombies: ['errant', 'errant', 'errant'], arme: 'couteau_cuisine', style });
  campagne(`gonflé · couteau · ${style}`, { zombies: ['gonfleur'], arme: 'couteau_cuisine', style });
  campagne(`hurleur+errant · couteau · ${style}`, { zombies: ['hurleur', 'errant'], arme: 'couteau_cuisine', style });
}
campagne('errant · hache · coup chargé plein', { zombies: ['errant'], arme: 'hache_pompier', style: 'lourd' });
campagne('errant · pistolet (15 balles) · naif', { zombies: ['errant'], arme: 'pistolet_9mm', style: 'naif', inst: { balles: 15 } });

campagne('errant · passif (ne fait rien)', { zombies: ['errant'], arme: null, style: 'passif' });
campagne('errant · passif mais martèle', { zombies: ['errant'], arme: null, style: 'passif_tape' });
campagne('coureur · passif mais martèle', { zombies: ['coureur'], arme: null, style: 'passif_tape' });
campagne('horde 3 errants · mains nues · humain', { zombies: ['errant', 'errant', 'errant'], arme: null, style: 'humain' });
campagne('horde 3 errants · couteau · humain', { zombies: ['errant', 'errant', 'errant'], arme: 'couteau_cuisine', style: 'humain' });
campagne('enragé · couteau · humain', { zombies: ['enrage'], arme: 'couteau_cuisine', style: 'humain' });
campagne('colosse · batte · humain', { zombies: ['colosse'], arme: 'batte_baseball', style: 'humain' });
// Déterminisme : même graine → même résultat
const a = simuler({ zombies: ['errant', 'coureur'], arme: 'couteau_cuisine', style: 'habile', seed: 42 });
const b = simuler({ zombies: ['errant', 'coureur'], arme: 'couteau_cuisine', style: 'habile', seed: 42 });
console.log('déterminisme :', JSON.stringify(a.r) === JSON.stringify(b.r) && a.t === b.t ? 'OK' : 'ÉCHEC');

// ---- Co-op : 2 joueurs, 4 errants, un troisième rejoint ; chaque événement une seule fois ----
{
  const { appliquerResultat } = await import('../js/combat/stats.js');
  const sim = creerCombat({ id: 'coop', seed: 5, participants: [
    { id: 'a', nom: 'A', stats: statsCombat(joueurTest('couteau_cuisine')) },
    { id: 'b', nom: 'B', stats: statsCombat(joueurTest('batte_baseball')) }],
    zombies: ['errant', 'errant', 'errant', 'errant'].map((type, i) => ({ uid: 'z' + i, type })) });
  const e0 = sim.etat();
  const actifs = e0.participants.map(p => p.actif);
  let flanc = 0, n = new Set(), doublons = 0, t = 0;
  sim.action('b', { type: 'cible', cible: actifs[0] });                 // B aide A (bonus de flanc)
  while (!sim.fini() && t < 60000) {
    if (t === 1000) sim.ajouterParticipant({ id: 'c', nom: 'C', stats: statsCombat(joueurTest('machette')) });
    for (const jid of ['a', 'b', 'c']) if (t % 450 === 0) { sim.action(jid, { type: 'frapper', appui: true }); sim.action(jid, { type: 'frapper', appui: false }); }
    for (const e of sim.tick(50)) { if (n.has(e.n)) doublons++; n.add(e.n); if (e.type === 'coup' && e.flanc) flanc++; }
    t += 50;
  }
  const r = ['a', 'b', 'c'].map(j => sim.resultat(j).issue);
  console.log(`co-op : fronts distincts ${actifs[0] !== actifs[1] ? 'OK' : 'ÉCHEC'} · coups de flanc ${flanc} · issues ${r.join('/')} · ${(t / 1000).toFixed(1)} s · doublons ${doublons}`);

  // ---- Modèle js/game (equip.arme = id, equipEtat, accesRapide = ids) : échange d'arme et usure ----
  const p = { pv: 100, sta: 100, skillXp: {}, equip: { arme: 'couteau_cuisine', ceinture: 'ceinture_cuir' },
    equipEtat: { arme: { dur: 40, durMax: 40 } }, inventaire: [{ id: 'batte_baseball', qty: 1, dur: 30, durMax: 45 }, { id: 'bandage', qty: 2 }],
    accesRapide: ['batte_baseball', 'bandage'], blessures: [] };
  const s2 = creerCombat({ id: 'mod', seed: 9, participants: [{ id: 'p', stats: statsCombat(p) }], zombies: ['errant'] });
  s2.action('p', { type: 'rapide', index: 0 });
  let t2 = 0;
  while (!s2.fini() && t2 < 30000) { if (t2 > 700 && t2 % 700 === 0) { s2.action('p', { type: 'frapper', appui: true }); s2.action('p', { type: 'frapper', appui: false }); } s2.tick(50); t2 += 50; }
  const res = s2.resultat('p');
  appliquerResultat(p, res);
  const ok = p.equip.arme === 'batte_baseball' && p.equipEtat.arme.dur < 30 && p.inventaire.some(i => i.id === 'couteau_cuisine' && i.dur === 40)
    && p.accesRapide.includes('couteau_cuisine') && !p.accesRapide.includes('batte_baseball');
  console.log(`modèle js/game : échange + usure ${ok ? 'OK' : 'ÉCHEC ' + JSON.stringify({ equip: p.equip.arme, etat: p.equipEtat, inv: p.inventaire, ar: p.accesRapide })}`);
}
