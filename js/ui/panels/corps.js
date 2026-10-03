// ============ Panneau Corps — silhouette (face / dos), blessures et soins, jauges, compétences ============
import { G } from '../../core/state.js';
import { REGLAGES } from '../../data/reglages.js';
import { ITEMS } from '../../data/items.js';
import * as surv from '../../game/survival.js';
import * as player from '../../game/player.js';
import * as inv from '../../game/inventory.js';
import { toast } from '../toast.js';
import { ouvrirSommeil } from '../../game/sommeil.js';
import { el, icoEl, onglets, jauge, bouton, avecScroll, vide, g } from './commun.js';

let etat = { onglet: 'etat', zone: null };

export function monter(racine, opts = {}) {
  if (opts.onglet) etat.onglet = opts.onglet;
  etat.zone = opts.zone || null;
  const rendre = () => avecScroll(racine, () => dessiner(racine));
  rendre();
  // Le minuteur du réflexe (10 min) doit défiler même horloge en pause : rafraîchi par 'minute' (co-op) ou par les soins.
  return { maj: rendre };
}

function dessiner(racine) {
  const p = G.player; racine.textContent = '';
  racine.append(el('div', { class: 'pn-barre' }, onglets([
    { id: 'etat', label: 'État', icone: 'corps', badge: p.blessures.length || null },
    { id: 'competences', label: 'Compétences', icone: 'competences' },
  ], etat.onglet, (id) => { etat.onglet = id; dessiner(racine); }), resumeVital(p),
    el('button', { class: 'pn-btn co-dormir', type: 'button', onclick: async () => { const pn = await import('./index.js'); pn.fermerPanneau(); ouvrirSommeil(); } }, icoEl('dormir'), 'Dormir')));
  if (etat.onglet === 'competences') return competences(racine, p);
  const grille = el('div', { class: 'co-grille' });
  const gauche = el('div', { class: 'co-gauche' }, silhouette(p, racine), prisesGlobales(p, racine));
  const milieu = el('div', { class: 'co-blessures', 'data-scroll': 'blessures' });
  listeBlessures(milieu, p, racine);
  const droite = el('div', { class: 'co-jauges', 'data-scroll': 'jauges' }, ...jauges(p));
  grille.append(gauche, milieu, droite);
  racine.append(grille);
}

function resumeVital(p) {
  return el('div', { class: 'co-vital' },
    jauge({ label: 'Santé', icone: 'pv', v: p.pv / p.pvMax, texte: `${Math.round(p.pv)}`, cls: `mini ${p.pv < 30 ? 'rouge' : p.pv < 60 ? 'ambre' : 'sang'}` }),
    jauge({ label: 'Endurance', icone: 'endurance', v: p.sta / 100, repere: p.staMax / 100, texte: `${Math.round(p.sta)} / ${p.staMax}`, cls: 'mini' }));
}

// ---------- Silhouette ----------
// Zones : [zone, vue ('f' face / 'd' dos / 'fd' les deux), forme SVG (repère 0..100 × 0..210, décalée de +110 pour le dos)]
const FORMES = [
  ['à la tête', 'fd', 'M38 8 Q50 -2 62 8 L62 17 L38 17 Z'],
  ['au visage', 'f', 'M38 17 L62 17 Q62 34 50 36 Q38 34 38 17 Z'],
  ['au cou', 'fd', 'M44 36 L56 36 L57 45 L43 45 Z'],
  ['à l\'épaule', 'fd', 'M27 47 Q34 44 42 45 L40 56 L25 58 Z M73 47 Q66 44 58 45 L60 56 L75 58 Z'],
  ['au torse', 'f', 'M40 50 L60 50 L64 76 L36 76 Z'],
  ['au flanc', 'f', 'M33 58 L40 56 L36 94 L31 92 Z M67 58 L60 56 L64 94 L69 92 Z'],
  ['au ventre', 'f', 'M36 76 L64 76 L64 100 L36 100 Z'],
  ['dans le dos', 'd', 'M36 50 L64 50 L66 100 L34 100 Z'],
  ['au bras', 'fd', 'M25 58 L32 58 L29 86 L21 85 Z M75 58 L68 58 L71 86 L79 85 Z'],
  ['à l\'avant-bras', 'fd', 'M21 86 L29 87 L26 112 L18 110 Z M79 86 L71 87 L74 112 L82 110 Z'],
  ['à la main', 'fd', 'M18 111 L26 113 L25 124 L15 122 Z M82 111 L74 113 L75 124 L85 122 Z'],
  ['à la cuisse', 'fd', 'M35 101 L49 101 L48 138 L36 138 Z M65 101 L51 101 L52 138 L64 138 Z'],
  ['au genou', 'fd', 'M36 139 L48 139 L48 150 L36 150 Z M64 139 L52 139 L52 150 L64 150 Z'],
  ['au mollet', 'fd', 'M36 151 L48 151 L47 182 L38 182 Z M64 151 L52 151 L53 182 L62 182 Z'],
  ['à la cheville', 'fd', 'M38 183 L47 183 L47 191 L38 191 Z M62 183 L53 183 L53 191 L62 191 Z'],
  ['au pied', 'fd', 'M37 192 L48 192 L49 202 L33 202 Z M63 192 L52 192 L51 202 L67 202 Z'],
];
function classeZone(p, zone) {
  const w = p.blessures.filter(b => b.zone === zone); if (!w.length) return '';
  if (w.some(b => b.infecte)) return 'z-infecte';
  if (w.some(b => b.saigne)) return 'z-saigne';
  if (w.every(b => b.bandee || b.suturee || b.attelle)) return 'z-soigne';
  return 'z-blesse';
}
function silhouette(p, racine) {
  let s = '';
  for (const [vue, dx, titre] of [['f', 0, 'Face'], ['d', 110, 'Dos']]) {
    s += `<g transform="translate(${dx} 8)"><text class="co-vue" x="50" y="214">${titre}</text>`;
    for (const [zone, v, d] of FORMES) {
      if (!v.includes(vue)) continue;
      const c = classeZone(p, zone);
      s += `<path class="co-zone ${c}${etat.zone === zone ? ' sel' : ''}" data-zone="${zone.replace(/"/g, '')}" d="${d}"><title>${zone}</title></path>`;
    }
    s += '</g>';
  }
  const n = el('div', { class: 'co-silhouette', html: `<svg viewBox="0 0 210 228" role="img" aria-label="Silhouette : touche une zone blessée">${s}</svg>` });
  n.addEventListener('click', (e) => {
    const z = e.target.closest('[data-zone]'); if (!z) return;
    const zone = z.dataset.zone;
    etat.zone = etat.zone === zone ? null : zone; dessiner(racine);
  });
  return n;
}

// ---------- Blessures ----------
const NOM_ACTION_ICONE = { bander: 'bander', desinfecter: 'desinfecter', nettoyer: 'soin', suturer: 'suturer', attelle: 'attelle', onguent: 'soin', cauteriser: 'cauteriser' };
function listeBlessures(col, p, racine) {
  const B = REGLAGES.survie.BLESSURES;
  let liste = p.blessures.map((b, i) => ({ b, i }));
  col.append(el('h3', { class: 'pn-section' }, etat.zone ? `Blessures ${etat.zone}` : 'Blessures', el('em', {}, String(p.blessures.length))));
  if (etat.zone) {
    liste = liste.filter(x => x.b.zone === etat.zone);
    col.append(bouton({ label: 'Tout voir', icone: 'retour', cls: 'lien', onclick: () => { etat.zone = null; dessiner(racine); } }));
  }
  if (!liste.length) { col.append(vide(p.blessures.length ? 'Rien à cet endroit.' : 'Aucune blessure. Pour l\'instant.', 'coche')); return; }
  liste.sort((a, b) => (b.b.saigne - a.b.saigne) || (b.b.infecte - a.b.infecte) || (b.b.gravite - a.b.gravite));
  for (const { b, i } of liste) {
    const T = B[b.type] || { nom: b.type };
    const carte = el('article', { class: `co-plaie g${b.gravite}${b.saigne ? ' saigne' : ''}${b.infecte ? ' infecte' : ''}` });
    const etats = el('div', { class: 'co-etats' });
    const tag = (txt, cls, ic) => etats.append(el('span', { class: `co-tag ${cls}` }, ic ? icoEl(ic) : null, txt));
    if (b.saigne) tag('Saigne', 'rouge', 'saignement');
    if (b.infecte) tag('Infectée', 'vert', 'infection');
    if (b.souillee && !b.infecte) tag('Souillée', 'vert');
    if (b.bandee) tag(b.bandage === 'sale' ? 'Bandage sale' : b.bandage === 'miel' ? 'Pansement au miel' : 'Bandée', 'ambre');
    if (b.suturee) tag('Recousue', 'ambre');
    if (b.attelle) tag('Attelle', 'ambre');
    if (b.desinfJusqua > G.world.minutes) tag('Désinfectée', 'bleu');
    else if (b.nettoyee) tag('Lavée', 'bleu');
    if (T.suture && !b.suturee) tag('À recoudre', 'rouge');
    if (b.type === 'fracture' && !b.attelle) tag('Attelle nécessaire', 'rouge');
    carte.append(el('header', {},
      el('span', { class: 'co-crans', title: `Gravité ${b.gravite}/4` }, ...[1, 2, 3, 4].map(k => el('b', { class: k <= b.gravite ? 'on' : '' }))),
      el('div', {}, el('h4', {}, T.nom), el('small', {}, b.zone))), etats);
    const ref = surv.minuteurReflexe(b);
    if (ref) carte.append(el('div', { class: 'co-reflexe' }, icoEl('sablier'),
      el('span', {}, ref.action === 'cauteriser' ? `Cautériser dans ${ref.reste} min : le mal ÷ 2` : `Désinfecter dans ${ref.reste} min : le mal ne passe pas`)));
    carte.append(el('div', { class: 'co-guerison', title: `Guérison ${Math.round((b.guerison || 0) * 100)} %` }, el('i', { style: { width: `${(b.guerison || 0) * 100}%` } })));
    const acts = el('div', { class: 'co-soins' });
    for (const s of surv.soinsPossibles(p, i)) {
      const lab = s.objet ? `${s.label} — ${inv.nomObjet(s.objet)}` : s.label;
      acts.append(bouton({ label: lab, icone: NOM_ACTION_ICONE[s.action] || 'soin', cls: s.urgent && s.ok ? 'principal' : 'second', disabled: !s.ok, raison: s.raison,
        onclick: () => { const r = surv.soigner(p, i, s.objet || 'cauteriser'); if (!r.ok) toast(r.raison, 'alerte'); dessiner(racine); } }));
    }
    carte.append(acts);
    col.append(carte);
  }
}
function prisesGlobales(p, racine) {
  const ids = [...new Set(p.inventaire.map(x => x.id))].filter(id => ['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'].includes(surv.actionSoin(id)));
  if (!ids.length) return el('div');
  const n = el('div', { class: 'co-prises' }, el('h3', { class: 'pn-section' }, 'Prendre'));
  for (const id of ids) n.append(bouton({ label: `${ITEMS[id].nom} (${inv.countItem(id)})`, icone: 'calme', cls: 'second', onclick: () => { const r = surv.soigner(p, -1, id); if (!r.ok) toast(r.raison, 'alerte'); dessiner(racine); } }));
  return n;
}

// ---------- Jauges ----------
function jauges(p) {
  const cl = (v, gene, grave) => v < grave ? 'rouge' : v < gene ? 'ambre' : '';
  const SE = REGLAGES.survie.SEUILS;
  const dl = surv.douleur(p), def = surv.deficitFroid(p), besoin = surv.besoinChaleur(p), ch = inv.chaleurVetements(p);
  const r = [el('h3', { class: 'pn-section' }, 'Besoins'),
    jauge({ label: 'Faim', icone: 'faim', v: p.faim / 100, texte: `${Math.round(p.faim)}`, cls: cl(p.faim, SE.faim.gene, SE.faim.grave) }),
    jauge({ label: 'Soif', icone: 'soif', v: p.soif / 100, texte: `${Math.round(p.soif)}`, cls: cl(p.soif, SE.soif.gene, SE.soif.grave) }),
    jauge({ label: 'Repos', icone: 'fatigue', v: p.fatigue / 100, texte: `${Math.round(p.fatigue)}`, cls: cl(p.fatigue, SE.fatigue.gene, SE.fatigue.grave) }),
    jauge({ label: 'Douleur', icone: 'douleur', v: dl / 100, texte: `${dl}`, cls: dl > 60 ? 'rouge' : dl > 30 ? 'ambre' : 'gris' }),
    jauge({ label: 'Chaleur', icone: 'temperature', v: Math.min(1, ch / Math.max(1, besoin + 2)), repere: Math.max(0, Math.min(1, besoin / Math.max(1, besoin + 2))), texte: def > 0 ? `froid −${def}` : `${ch} / ${Math.max(0, besoin)}`, cls: def >= 2 ? 'bleu' : def ? 'ambre' : '' }),
  ];
  const mal = p.mal || 0, M = REGLAGES.survie.CONTAMINATION.SEUILS;
  if (mal > 0) r.push(el('div', { class: 'co-mal' },
    jauge({ label: 'Le mal', icone: 'mal', v: mal / 100, texte: `${Math.round(mal)} / 100`, cls: 'mal', repere: M.noirceur / 100 }),
    el('p', {}, mal >= M.delire ? 'Délire. Tu entends des pas qui n\'existent pas.' : mal >= M.fievre_noire ? 'Fièvre noire : tu ne guéris plus.' : mal >= M.noirceur ? 'Des veines noires courent autour des plaies.' : 'Il reflue, lentement. Dormir aide.')));
  const mx = [];
  if (p.maladies.intoxication) mx.push('Intoxication'); if (p.maladies.fievre) mx.push('Fièvre'); if (p.maladies.rhume) mx.push('Rhume');
  if (mx.length) r.push(el('p', { class: 'co-maladies' }, icoEl('malade'), mx.join(' · ')));
  return r;
}

// ---------- Compétences ----------
function competences(racine, p) {
  const box = el('div', { class: 'co-competences', 'data-scroll': 'comp' });
  for (const s of player.COMPETENCES()) {
    const pr = player.progression(s, p); const L = REGLAGES.competences.LISTE[s];
    box.append(el('article', { class: 'co-comp' + (pr.niveau ? '' : ' zero') },
      el('header', {}, el('h4', {}, L.nom), el('span', { class: 'co-niv' }, ...[1, 2, 3, 4, 5].map(k => el('b', { class: k <= pr.niveau ? 'on' : '' })))),
      el('div', { class: 'co-xp' }, el('i', { style: { width: `${pr.frac * 100}%` } })),
      el('p', {}, L.desc, el('small', {}, pr.max ? 'Maîtrise.' : ` ${Math.round(pr.xp)} / ${pr.haut} XP`))));
  }
  racine.append(box);
}
