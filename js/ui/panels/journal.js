// ============ Panneau Journal — Objectifs / Récit / Documents / Les morts ============
import { G, genrer } from '../../core/state.js';
import { QUETES } from '../../data/histoire/quetes.js';
import { MISSIONS } from '../../data/histoire/missions.js';
import { avancee as avanceeMission } from '../../game/missions.js';
import { DOCUMENTS } from '../../data/histoire/documents.js';
import { ZOMBIES } from '../../data/zombies.js';
import { lieu as lieuDe } from '../../game/donnees.js';
import { dateTexte } from '../../core/clock.js';
import { el, icoEl, onglets, avecScroll, vide, g } from './commun.js';

let etat = { onglet: 'objectifs', doc: null };

export function monter(racine, opts = {}) {
  if (opts.onglet) etat.onglet = opts.onglet;
  if (opts.doc) { etat.onglet = 'documents'; etat.doc = opts.doc; }
  const rendre = () => avecScroll(racine, () => dessiner(racine));
  rendre();
  return { maj: rendre };
}

function dessiner(racine) {
  racine.textContent = '';
  racine.append(el('div', { class: 'pn-barre' }, onglets([
    { id: 'objectifs', label: 'Objectifs', icone: 'objectif' },
    { id: 'recit', label: 'Récit', icone: 'recit' },
    { id: 'documents', label: 'Documents', icone: 'document', badge: (G.documents || []).length || null },
    { id: 'morts', label: 'Les morts', icone: 'crane' },
  ], etat.onglet, (id) => { etat.onglet = id; dessiner(racine); })));
  const zone = el('div', { class: `jo-zone jo-${etat.onglet}`, 'data-scroll': 'jo-' + etat.onglet });
  ({ objectifs, recit, documents, morts })[etat.onglet](zone, racine);
  racine.append(zone);
}

// ---------- Objectifs ----------
function objectifs(zone) {
  const qs = Object.entries(QUETES).filter(([id]) => G.world.quetes && G.world.quetes[id])
    .sort(([, a], [, b]) => (b.principale - a.principale) || ((b.chapitre || 0) - (a.chapitre || 0)));
  const ms = missionsVues();
  if (!qs.length && !ms.length) { zone.append(vide('Aucun objectif pour l\'instant. Survis.', 'objectif')); return; }
  if (ms.length) { missions(zone, ms); if (qs.length) zone.append(el('h3', { class: 'pn-section' }, 'Histoire')); }
  for (const [id, q] of qs) {
    const e = G.world.quetes[id]; const cles = Object.keys(q.etapes); const k = cles.indexOf(e.etape);
    const art = el('article', { class: `jo-quete${q.principale ? ' principale' : ''}${e.faite ? ' faite' : ''}` },
      el('header', {}, el('small', {}, q.principale ? `Chapitre ${q.chapitre}` : 'Quête secondaire'), el('h3', {}, q.titre)));
    const ul = el('ol', { class: 'jo-etapes' });
    cles.forEach((c, i) => {
      if (i > k && !e.faite) return;
      const et = q.etapes[c]; const l = et.lieu && lieuDe(et.lieu);
      ul.append(el('li', { class: i < k || e.faite ? 'fait' : 'courant' }, icoEl(i < k || e.faite ? 'coche' : 'objectif'),
        el('span', {}, genrer(et.objectif)), l && i === k && !e.faite ? el('small', {}, icoEl('lieu'), l.court || l.nom) : null));
    });
    art.append(ul); zone.append(art);
  }
}

// ---------- Missions (js/data/histoire/missions.js) : en cours d'abord, puis réussies et échouées ----------
const ORDRE_MISSION = { active: 0, proposee: 1, reussie: 2, echouee: 3 };
function missionsVues() {
  const W = G.world.missions || {};
  return Object.entries(MISSIONS).filter(([id]) => W[id] && W[id].etat in ORDRE_MISSION)
    .sort(([a], [b]) => ORDRE_MISSION[W[a].etat] - ORDRE_MISSION[W[b].etat] || (W[b].depuis || 0) - (W[a].depuis || 0));
}
function missions(zone, ms) {
  const W = G.world.missions;
  zone.append(el('h3', { class: 'pn-section' }, 'Missions'));
  for (const [id, m] of ms) {
    const s = W[id], fini = s.etat === 'reussie' || s.etat === 'echouee';
    const sous = { active: 'En cours', proposee: 'Proposée — tu peux y retourner', reussie: 'Accomplie', echouee: 'Échouée' }[s.etat];
    const art = el('article', { class: `jo-quete jo-mission m-${s.etat}${fini ? ' faite' : ''}` },
      el('header', {}, el('small', {}, sous), el('h3', {}, m.titre)), el('p', { class: 'jo-mission-resume' }, genrer(m.resume || '')));
    const ul = el('ol', { class: 'jo-etapes' });
    m.etapes.forEach((e, i) => {
      if (s.etat === 'proposee' || (!fini && i > s.i) || (s.etat === 'echouee' && i > s.i)) return;
      const fait = s.etat === 'reussie' || i < s.i, rate = s.etat === 'echouee' && i === s.i;
      const l = e.lieu && lieuDe(e.lieu);
      const av = !fini && i === s.i ? avanceeMission(id) : '';
      ul.append(el('li', { class: fait ? 'fait' : rate ? 'rate' : 'courant' }, icoEl(fait ? 'coche' : rate ? 'alerte' : 'objectif'),
        el('span', {}, genrer(e.texte), av ? el('em', { class: 'jo-avancee' }, ' — ' + genrer(av)) : null),
        l && !fait && !rate ? el('small', {}, icoEl('lieu'), l.court || l.nom) : null));
    });
    if (s.etat === 'proposee' && m.offre) { const l = lieuDe(m.offre.lieu); ul.append(el('li', { class: 'courant' }, icoEl('lieu'), el('span', {}, `Retourner voir : ${l ? l.court || l.nom : m.offre.lieu}`))); }
    art.append(ul); zone.append(art);
  }
}

// ---------- Récit ----------
function recit(zone) {
  const j = [...(G.journal || [])].reverse();
  if (!j.length) { zone.append(vide('Rien d\'écrit encore.', 'recit')); return; }
  let jour = null;
  for (const e of j) {
    const d = Math.floor(e.m / 1440) + 1;
    if (d !== jour) { jour = d; zone.append(el('h3', { class: 'jo-jour' }, `Jour ${d} — ${dateTexte(d, 'long')}`)); }
    const h = `${String(Math.floor(e.m % 1440 / 60)).padStart(2, '0')}:${String(e.m % 60).padStart(2, '0')}`;
    zone.append(el('p', { class: `jo-entree t-${e.type || 'recit'}` }, el('time', {}, h), el('span', {}, e.texte)));
  }
}

// ---------- Documents ----------
function documents(zone, racine) {
  const ids = (G.documents || []).filter(id => DOCUMENTS[id]);
  if (!ids.length) { zone.append(vide('Aucun document. Les morts laissent des mots, parfois.', 'document')); return; }
  if (!etat.doc || !ids.includes(etat.doc)) etat.doc = ids[ids.length - 1];
  const liste = el('nav', { class: 'jo-docs' });
  const ICONES = { sms: 'sms', manuscrit: 'recit', carnet: 'livre', tape: 'document', imprime: 'document' };
  for (const id of [...ids].reverse()) {
    const d = DOCUMENTS[id];
    liste.append(el('button', { type: 'button', class: 'jo-doc' + (etat.doc === id ? ' actif' : ''), onclick: () => { etat.doc = id; dessiner(racine); } },
      icoEl(ICONES[d.style] || 'document'), el('span', {}, d.titre)));
  }
  const d = DOCUMENTS[etat.doc];
  const lecteur = el('div', { class: 'jo-lecteur', 'data-scroll': 'doc-' + etat.doc }, papier(d));
  zone.append(liste, lecteur);
}
function papier(d) {
  const style = d.style || 'imprime';
  const p = el('article', { class: `doc doc-${style}` }, el('h2', {}, d.titre));
  const texte = g(d.texte || '');
  if (style === 'sms') {
    const fil = el('div', { class: 'doc-fil' });
    for (const ligne of texte.split('\n').filter(Boolean)) {
      const m = ligne.match(/^([^:]{1,60}?) ?: (.*)$/);
      const exp = m ? m[1] : '';
      const moi = /→|^(TOI|MOI)\b/i.test(exp);         // messages envoyés : à droite
      fil.append(el('p', { class: 'bulle' + (moi ? ' moi' : '') }, exp ? el('b', {}, exp) : null, m ? m[2] : ligne));
    }
    p.append(fil);
  } else for (const para of texte.split(/\n{2,}/)) p.append(el('p', {}, ...para.split('\n').flatMap((l, i) => i ? [el('br'), l] : [l])));
  return p;
}

// ---------- Les morts ----------
function morts(zone) {
  const s = G.player.stats || {}; const t = s.tuesParType || {};
  zone.append(el('div', { class: 'jo-bilan' },
    el('div', {}, el('b', {}, String(s.morts || 0)), el('span', {}, 'morts abattus')),
    el('div', {}, el('b', {}, String(s.joursSurvecus || Math.floor(G.world.minutes / 1440))), el('span', {}, 'jours survécus')),
    el('div', {}, el('b', {}, `${((s.distance || 0) / 1000).toFixed(1).replace('.', ',')} km`), el('span', {}, 'parcourus')),
    el('div', {}, el('b', {}, String(s.fouilles || 0)), el('span', {}, 'meubles fouillés'))));
  const grille = el('div', { class: 'jo-bestiaire' });
  for (const [id, z] of Object.entries(ZOMBIES)) {
    const n = t[id] || 0; const vu = n > 0;
    grille.append(el('article', { class: 'jo-bete' + (vu ? '' : ' inconnue') },
      el('span', { class: 'jo-bete-ic' }, icoEl(vu ? 'crane' : 'inconnu')),
      el('div', {}, el('h4', {}, vu ? z.nom : '???'), el('small', {}, vu ? `${n} abattu${n > 1 ? 's' : ''}` : 'Pas encore rencontré'),
        vu && z.desc ? el('p', {}, g(z.desc)) : null)));
  }
  zone.append(el('h3', { class: 'pn-section' }, 'Ce que tu as croisé'), grille);
}
