// ============ Panneau Corps — silhouette (face / dos), blessures et soins, jauges, compétences ============
import { G } from '../../core/state.js';
import { REGLAGES } from '../../data/reglages.js';
import { ITEMS } from '../../data/items.js';
import * as surv from '../../game/survival.js';
import * as player from '../../game/player.js';
import * as inv from '../../game/inventory.js';
import { toast } from '../toast.js';
import { ouvrirSommeil } from '../../game/sommeil.js';
import { el, icoEl, onglets, jauge, bouton, avecScroll, vide, g, paire, demanderGeste } from './commun.js';

let etat = { onglet: 'etat', zone: null };
// Se soigner prend le temps du geste : 1 min de jeu = 1,2 s réelle (une suture : 18 s), jamais moins de 1,5 s.
const dureeGeste = (action, p) => Math.max(1500, Math.min(REGLAGES.craft.BARRE_MAX_MS, surv.dureeSoin(action, p) * REGLAGES.temps.MS_PAR_MINUTE / REGLAGES.temps.FABRICATION_ACCELERE));

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
// Les membres ne sont tracés qu'à gauche : paire() en fait le côté droit, et les deux bras sont forcément identiques.
const P = (d) => paire(d, 50);
const FORMES = [
  ['à la tête', 'f', 'M37 13 Q37 0 50 0 Q63 0 63 13 L63 16 L37 16 Z'],
  ['à la tête', 'd', 'M37 13 Q37 0 50 0 Q63 0 63 13 L63 16 Q63 30 56 35 Q50 38 44 35 Q37 30 37 16 Z'],
  ['au visage', 'f', 'M37 16 L63 16 Q63 30 56 35 Q50 38 44 35 Q37 30 37 16 Z'],
  ['au cou', 'fd', 'M45 36 Q50 39 55 36 L56 44 L44 44 Z'],
  ['à l\'épaule', 'fd', P('M44 44.5 L41 45 Q31 46 27 54 L26.5 60 L38 60 L38 46 Z')],
  ['au torse', 'f', 'M38 46 L44 45 L56 45 L62 46 L63 74 L37 74 Z'],
  ['au flanc', 'f', P('M32 60 L38 60 L37 74 L38 98 L34 98 Q33 80 32 60 Z')],
  ['au ventre', 'f', 'M37 74 L63 74 L62 98 L38 98 Z'],
  ['dans le dos', 'd', 'M38 46 L44 45 L56 45 L62 46 L62 60 L68 60 L67 80 L66 98 L34 98 L33 80 L32 60 L38 60 Z'],
  ['au bras', 'fd', P('M26.5 60.5 L31.5 60.5 L29 86 L21.5 85 Z')],
  ['à l\'avant-bras', 'fd', P('M21.5 86 L29 87 L25.5 111 L18.5 110 Z')],
  ['à la main', 'fd', P('M18.5 111 L25.5 112 L25 120 Q23 126 19 125 Q15 123 16 116 Z')],
  ['à la cuisse', 'fd', P('M34 99 L49 99 L48 138 L36.5 138 Q34 120 34 99 Z')],
  ['au genou', 'fd', P('M36.5 139 L48 139 L47.5 150 L37 150 Z')],
  ['au mollet', 'fd', P('M37 151 L47.5 151 L46.5 182 L39 182 Q35.5 165 37 151 Z')],
  ['à la cheville', 'fd', P('M39 183 L46.5 183 L46.5 191 L39 191 Z')],
  ['au pied', 'fd', P('M39 192 L46.5 192 L48 200 Q47 203 44 203 L35 203 Q33 200 39 192 Z')],
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
        onclick: () => demanderGeste(`${s.label}…`, dureeGeste(s.action, p), () => {
          const k = p.blessures.indexOf(b), r = k < 0 ? { ok: false, raison: 'Cette plaie a changé.' } : surv.soigner(p, k, s.objet || 'cauteriser');
          if (!r.ok) toast(r.raison, 'alerte'); else if (r.texte) toast(r.texte, 'info');
          if (racine.isConnected) dessiner(racine);
        }, { son: 'soin' }) }));
    }
    carte.append(acts);
    col.append(carte);
  }
}
function prisesGlobales(p, racine) {
  const ids = [...new Set(p.inventaire.map(x => x.id))].filter(id => ['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'].includes(surv.actionSoin(id)));
  if (!ids.length) return el('div');
  const n = el('div', { class: 'co-prises' }, el('h3', { class: 'pn-section' }, 'Prendre'));
  for (const id of ids) n.append(bouton({ label: `${ITEMS[id].nom} (${inv.countItem(id)})`, icone: 'calme', cls: 'second', onclick: () => demanderGeste(`${ITEMS[id].nom}…`, dureeGeste(surv.actionSoin(id), p), () => {
    const r = surv.soigner(p, -1, id); if (!r.ok) toast(r.raison, 'alerte'); else if (r.texte) toast(r.texte, 'info');
    if (racine.isConnected) dessiner(racine);
  }) }));
  return n;
}

// ---------- Jauges ----------
function jauges(p) {
  const cl = (v, gene, grave) => v < grave ? 'rouge' : v < gene ? 'ambre' : '';
  const SE = REGLAGES.survie.SEUILS;
  const dl = surv.douleur(p), def = surv.deficitFroid(p), besoin = surv.besoinChaleur(p), ch = inv.chaleurVetements(p);
  const r = [el('h3', { class: 'pn-section' }, 'Besoins'),
    jauge({ label: 'Faim', icone: 'faim', v: p.faim / 100, texte: surv.motFaim(p), cls: cl(p.faim, SE.faim.gene, SE.faim.grave) }),
    jaugeEstomac(p), jaugePoids(p),
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

// L'estomac : on ne se gave pas d'un coup, il se vide en digérant.
function jaugeEstomac(p) {
  const R = REGLAGES.survie.REPAS, f = Math.min(1, (p.estomac || 0) / R.ESTOMAC_MAX);
  const mot = f >= R.REPU ? g('plein : repu{|e}') : f >= 0.45 ? 'bien rempli' : f > 0.1 ? 'un peu' : 'vide';
  return jauge({ label: 'Estomac', icone: 'faim', v: f, texte: mot, cls: 'gris' });
}
// Le poids du corps et sa tendance (↑ on en prend, ↓ on en perd), comme dans Project Zomboid.
function jaugePoids(p) {
  const co = surv.corpulence(p), C = REGLAGES.survie.CORPS, t = surv.tendancePoids(p);
  const v = Math.max(0, Math.min(1, (co.ratio - C.BORNES[0]) / (C.BORNES[1] - C.BORNES[0])));
  const kg = (Math.round(co.kg * 10) / 10).toString().replace('.', ',');
  return jauge({ label: co.niveau ? co.label : 'Poids', icone: 'corps', v, repere: (1 - C.BORNES[0]) / (C.BORNES[1] - C.BORNES[0]),
    texte: `${kg} kg${t > 0 ? ' ↑' : t < 0 ? ' ↓' : ''}`, cls: co.niveau >= 3 ? 'rouge' : co.niveau ? 'ambre' : '' });
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
