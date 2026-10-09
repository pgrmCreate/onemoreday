// ============ Panneau Inventaire — Sac / Équipement / Au sol ============
// Objets groupés par catégorie ; au toucher : fiche + actions contextuelles ; jauges poids / VOLUME (litres) ; paper-doll
// avec les MAINS (droite, gauche, deux mains) et le DOS (un gros objet sanglé, 25 % plus léger).
import { G } from '../../core/state.js';
import { emit } from '../../core/bus.js';
import { REGLAGES } from '../../data/reglages.js';
import { ITEMS } from '../../data/items.js';
import { CLOTHES, SLOTS } from '../../data/clothing.js';
import * as inv from '../../game/inventory.js';
import * as surv from '../../game/survival.js';
import * as craft from '../../game/crafting.js';
import { iconeObjet } from '../icons.js';
import { el, icoEl, onglets, jauge, bouton, avecScroll, vide, fmtKg, fmtL, pct, g } from './commun.js';

const ONGLET_KEY = 'inv';
let etat = { onglet: 'sac', sel: null, cat: 'tout' }; // sel : { zone: 'sac'|'slot'|'sol', ref } ; cat : filtre du sac

export function monter(racine, opts = {}, api) {
  if (opts.onglet) etat.onglet = opts.onglet;
  else if (inv.listeATrier().length) etat.onglet = 'tri';
  etat.sel = null;
  const rendre = () => avecScroll(racine, () => dessiner(racine, api));
  rendre();
  // Fermer le sac avec des affaires encore « à trier » : elles restent sur place.
  return { maj: rendre, demonter: () => annoncerLaisses(inv.finirTri()) };
}
function annoncerLaisses(laisses) {
  if (laisses.length) emit('toast', { texte: `Laissé ici : ${laisses.map(x => inv.nomObjet(x.id) + (x.qty > 1 ? ' ×' + x.qty : '')).join(', ')}.`, type: 'info' });
}

function dessiner(racine, api) {
  const p = G.player; racine.textContent = '';
  const nSol = inv.objetsAuSol().length, nTri = inv.listeATrier().length;
  if (etat.onglet === 'tri' && !nTri) etat.onglet = 'sac';
  const barre = el('div', { class: 'pn-barre' },
    onglets([
      ...(nTri ? [{ id: 'tri', label: 'À trier', icone: 'ramasser', badge: nTri }] : []),
      { id: 'sac', label: 'Sac', icone: 'sac' },
      { id: 'equip', label: 'Équipement', icone: 'equiper' },
      { id: 'sol', label: 'Au sol', icone: 'poser', badge: nSol || null },
    ], etat.onglet, (id) => { etat.onglet = id; etat.sel = null; dessiner(racine, api); }),
    jaugesCharge(p));
  racine.append(barre);
  if (etat.onglet === 'tri') {
    const col = el('div', { class: 'pn-col-liste', 'data-scroll': 'liste-tri' });
    listeTri(col, p, racine, api);
    racine.append(el('div', { class: 'pn-grille pn-grille-seule' }, col));
    return;
  }
  // Sac : les types d'objets en COLONNE à gauche (comme Fabriquer), la liste au milieu, la fiche à droite.
  const cats = etat.onglet === 'sac' && p.inventaire.length ? colonneTypes(p, racine, api) : null;
  const grille = el('div', { class: 'pn-grille' + (etat.sel ? ' avec-fiche' : '') + (cats ? ' avec-types' : '') });
  const gauche = el('div', { class: 'pn-col-liste', 'data-scroll': 'liste-' + etat.onglet });
  if (etat.onglet === 'sac') listeSac(gauche, p, racine, api);
  else if (etat.onglet === 'equip') poupee(gauche, p, racine, api);
  else listeSol(gauche, p, racine, api);
  const fiche = el('aside', { class: 'pn-fiche', 'data-scroll': 'fiche' });
  remplirFiche(fiche, p, racine, api);
  if (cats) grille.append(cats);
  grille.append(gauche, fiche);
  racine.append(grille);
}

function jaugesCharge(p) {
  const b = inv.bilan(p);
  const vp = b.kg / b.plafond, repere = b.max / b.plafond;
  const cls = b.bloque ? 'rouge' : b.f > 0 ? 'ambre' : '';
  return el('div', { class: 'inv-charge' },
    jauge({ label: 'Poids', icone: 'poids', v: vp, repere, texte: `${fmtKg(b.kg)} / ${fmtKg(b.max)}`, cls: `mini ${cls}`, titre: `Au-delà de ${fmtKg(b.max)} : surpoids. Au-delà de ${fmtKg(b.plafond)} : impossible de bouger.` }),
    jauge({ label: 'Volume', icone: 'encombrement', v: b.volumeMax ? b.volume / b.volumeMax : 1, texte: `${fmtL(b.volume)} / ${fmtL(b.volumeMax)}`, cls: `mini ${b.volume >= b.volumeMax - 0.3 ? 'ambre' : ''}`, titre: 'Poches (petits objets ≤ 1 L) + sac. Une pile ou un briquet : quelques centilitres ; une conserve : 0,45 L ; une planche (6 L, longue) se porte en main ou dans le dos.' }));
}

// ---------- Onglet Sac ----------
function metaObjet(it, d) {
  const bits = [];
  const kg = (d.poids || 0) * (it.reste ?? 1) * it.qty + (it.eau ? it.eau.L : 0);
  bits.push(fmtKg(kg));
  const v = inv.volumeDe(it.id) * it.qty;
  if (v >= 0.05) bits.push(fmtL(Math.round(v * 10) / 10));
  return bits.join(' · ');
}
function ligneObjet({ index, it, def: d }, p, actif, onclick) {
  const b = el('button', { type: 'button', class: `inv-ligne cat-${inv.categorie(it.id)}${actif ? ' actif' : ''}`, onclick });
  const ic = el('span', { class: 'inv-ic' }, icoEl(iconeObjet(it.id)));
  const nom = el('span', { class: 'inv-nom' }, d ? d.nom : it.id);
  if (it.qty > 1) nom.append(el('em', { class: 'inv-qty' }, `×${it.qty}`));
  if (it.reste != null) nom.append(el('em', { class: 'inv-qty' }, surv.aTourne(it) ? ' (entamé, a tourné)' : ' (entamé)'));
  const sous = el('span', { class: 'inv-meta' }, metaObjet(it, d || {}));
  const txt = el('span', { class: 'inv-txt' }, nom, sous);
  b.append(ic, txt);
  const u = inv.etatUsure(it);
  if (u != null) b.append(el('span', { class: 'inv-usure' + (u < 0.2 ? ' bas' : ''), title: `État ${pct(u)}` }, el('i', { style: { width: pct(u) } })));
  if (it.eau) b.append(el('span', { class: `inv-eau ${it.eau.q}`, title: `${fmtL(it.eau.L)} ${it.eau.q === 'propre' ? 'd\'eau propre' : 'd\'eau croupie'}` }, el('i', { style: { height: pct(it.eau.L / (inv.contenance(it.id) || 1)) } })));
  if (p.accesRapide.includes(it.id)) b.append(el('span', { class: 'inv-tag', title: 'À la ceinture (accès rapide)' }, icoEl('ceinture')));
  return b;
}
// Le sac porté, en PETIT (une pastille en tête de la liste) : la place va à la liste des objets.
// Toucher la pastille ouvre l'emplacement « Sac » de l'équipement.
function enteteSac(p, racine, api) {
  const sac = inv.sacPorte(p);
  const b = inv.bilan(p);
  const titre = sac
    ? `${sac.nom} — sac : ${fmtL(b.sac.utilise)} / ${fmtL(b.sac.max)} · poches : ${fmtL(b.poches.utilise)} / ${fmtL(b.poches.max)} · +${sac.portage} kg portables`
    : `Pas de sac : tes poches seulement (${fmtL(b.poches.utilise)} / ${fmtL(b.poches.max)}), et seulement les petits objets.`;
  return el('button', { type: 'button', class: 'inv-sac-mini' + (sac ? '' : ' sans'), title: titre, 'aria-label': titre,
    onclick: () => { etat.onglet = 'equip'; etat.sel = { zone: 'slot', ref: 'sac' }; dessiner(racine, api); } },
    icoEl('sac'),
    el('span', {}, el('strong', {}, sac ? sac.nom : 'Pas de sac'),
      el('em', {}, sac ? `${fmtL(b.sac.utilise)} / ${fmtL(b.sac.max)}` : `poches ${fmtL(b.poches.utilise)} / ${fmtL(b.poches.max)}`)));
}
// Les types d'objets du sac (Tout, Soins, Nourriture…) : une colonne verticale à gauche, qui défile de haut en bas
// (une rangée horizontale se cassait sous le doigt). Le choix est gardé d'une ouverture à l'autre.
function colonneTypes(p, racine, api) {
  const groupes = inv.sacParCategorie(p);
  if (etat.cat !== 'tout' && !groupes.some(gr => gr.cat === etat.cat)) etat.cat = 'tout';   // plus rien de ce type
  const total = (gr) => gr.items.reduce((s, x) => s + x.it.qty, 0);
  const puce = (cat, nom, icone, n) => el('button', { type: 'button', class: `inv-puce cat-${cat}${etat.cat === cat ? ' actif' : ''}`, title: nom, 'aria-label': nom, 'aria-pressed': etat.cat === cat ? 'true' : 'false',
    onclick: () => { etat.cat = etat.cat === cat ? 'tout' : cat; etat.sel = null; dessiner(racine, api); } }, icoEl(icone), el('span', { class: 'inv-puce-nom' }, nom), el('em', {}, String(n)));
  return el('nav', { class: 'inv-types', 'data-scroll': 'types', 'aria-label': 'Trier par type' },
    puce('tout', 'Tout', 'tout', groupes.reduce((s, gr) => s + total(gr), 0)),
    ...groupes.map(gr => puce(gr.cat, gr.nom, gr.cat, total(gr))));
}
function listeSac(col, p, racine, api) {
  const groupes = inv.sacParCategorie(p);
  if (!groupes.length) { col.append(el('div', { class: 'inv-filtre' }, enteteSac(p, racine, api)), vide('Ton sac est vide. Fouille les meubles, les voitures, les morts.', 'sac')); return; }
  const total = (gr) => gr.items.reduce((s, x) => s + x.it.qty, 0);
  const liste = el('div', { class: 'inv-liste' });
  for (const gr of groupes) {
    if (etat.cat !== 'tout' && gr.cat !== etat.cat) continue;
    liste.append(el('h3', { class: 'pn-section' }, gr.nom, el('em', {}, String(total(gr)))));
    for (const x of gr.items) {
      const actif = etat.sel && etat.sel.zone === 'sac' && etat.sel.ref === x.index;
      liste.append(ligneObjet(x, p, actif, () => { etat.sel = { zone: 'sac', ref: x.index, id: x.it.id }; dessiner(racine, api); }));
    }
  }
  col.append(el('div', { class: 'inv-filtre' }, enteteSac(p, racine, api)), liste);
}

// ---------- Onglet À trier ----------
// Ce qu'une scène t'a donné et qui ne rentrait pas. On prend, on laisse des affaires de son sac pour faire de la place ;
// « Terminé » (ou fermer le sac) abandonne le reste sur place.
function listeTri(col, p, racine, api) {
  const apres = (r) => { if (r && r.ok === false && r.raison) emit('toast', { texte: r.raison, type: 'alerte' }); dessiner(racine, api); };
  const ligne = (it, boutons) => el('div', { class: `tri-ligne cat-${inv.categorie(it.id)}` },
    el('span', { class: 'inv-ic' }, icoEl(iconeObjet(it.id))),
    el('span', { class: 'inv-txt' }, el('span', { class: 'inv-nom' }, inv.nomObjet(it.id), it.qty > 1 ? el('em', { class: 'inv-qty' }, `×${it.qty}`) : null), el('span', { class: 'inv-meta' }, metaObjet(it, inv.def(it.id) || {}))),
    el('span', { class: 'tri-btns' }, ...boutons.filter(Boolean)));
  col.append(el('p', { class: 'tri-intro' }, 'Tu n’as pas la place de tout emporter. Prends ce que tu veux garder. Pour faire de la place, laisse des affaires de ton sac. Ce qui reste ici sera abandonné.'));
  col.append(el('h3', { class: 'pn-section' }, 'Trouvé', el('em', {}, String(inv.listeATrier().length))));
  inv.listeATrier().forEach((it, i) => {
    const tient = inv.combienTient(it.id, 1) >= 1, ou = inv.ouPorter(it.id);
    col.append(ligne(it, [
      ou ? bouton({ label: { vetement: 'Porter', lampe: 'Équiper', main: 'En main', dos: 'Dans le dos', deux: 'À deux mains' }[ou] || 'Porter', cls: 'second mini', onclick: () => apres(inv.porterATrier(i)) }) : null,
      bouton({ label: tient ? 'Prendre' : 'Pas de place', cls: tient ? 'principal mini' : 'second mini', disabled: !tient, titre: tient ? null : inv.raisonPlace(it.id), onclick: () => apres(inv.prendreATrier(i)) }),
    ]));
  });
  col.append(el('h3', { class: 'pn-section' }, 'Ton sac', el('em', {}, String(p.inventaire.length))));
  if (!p.inventaire.length) col.append(vide('Ton sac est vide.', 'sac'));
  p.inventaire.forEach((it, i) => col.append(ligne(it, [
    it.qty > 1 ? bouton({ label: 'Laisser 1', cls: 'second mini', onclick: () => { inv.laisserPourTri(i, 1); dessiner(racine, api); } }) : null,
    bouton({ label: it.qty > 1 ? 'Tout laisser' : 'Laisser', cls: 'second mini', onclick: () => { inv.laisserPourTri(i); dessiner(racine, api); } }),
  ])));
  col.append(el('div', { class: 'tri-fin' }, bouton({ label: 'Terminé : laisser le reste ici', icone: 'poser', cls: 'principal', onclick: () => {
    annoncerLaisses(inv.finirTri());
    etat.onglet = 'sac'; dessiner(racine, api);
  } })));
}

// ---------- Onglet Équipement (paper-doll) ----------
const GAUCHE = ['tete', 'haut', 'torse', 'veste', 'mains', 'jambes', 'pieds'];
const DROITE = ['arme', 'mainG', 'dos', 'lampe', 'sac', 'ceinture', 'holster'];
const ICONE_SLOT = { tete: 'tete', haut: 'torse', torse: 'torse', veste: 'torse', mains: 'mains', jambes: 'jambes', pieds: 'pieds', arme: 'main_arme', mainG: 'main_arme', dos: 'sac', lampe: 'lampe', sac: 'sac', ceinture: 'ceinture', holster: 'holster' };
function caseSlot(slot, p, racine, api) {
  const m = inv.mains(p);
  let id = p.equip[slot];
  if (slot === 'mainG' && !id && inv.lampeTenue(p.equip.lampe)) id = p.equip.lampe;   // la lampe tenue occupe la main gauche
  const d = id ? inv.def(id) : null;
  const actif = etat.sel && etat.sel.zone === 'slot' && etat.sel.ref === slot;
  const b = el('button', { type: 'button', class: `eq-slot${id ? ' plein' : ''}${actif ? ' actif' : ''}`, onclick: () => { etat.sel = { zone: 'slot', ref: slot }; dessiner(racine, api); } });
  b.append(el('span', { class: 'eq-ic' }, icoEl(id ? iconeObjet(id) : ICONE_SLOT[slot])));
  const vide = slot === 'arme' ? 'Main nue' : slot === 'mainG' && m.deux ? '(tient l\'arme à deux mains)' : '—';
  const titre = slot === 'arme' && m.deux ? 'Deux mains' : inv.NOMS_SLOTS[slot];
  const t = el('span', { class: 'eq-txt' }, el('small', {}, titre), el('span', {}, d ? d.nom + (slot === 'arme' && m.uneMainPenalite ? ' (une main)' : '') : vide));
  b.append(t);
  if (inv.SLOTS_TENUS.includes(slot) && p.equipEtat[slot] && p.equipEtat[slot].durMax) {
    const u = p.equipEtat[slot].dur / p.equipEtat[slot].durMax;
    b.append(el('span', { class: 'inv-usure' + (u < 0.2 ? ' bas' : '') }, el('i', { style: { width: pct(u) } })));
  }
  if (slot === 'lampe' && id) {
    const l = inv.lampe(p);
    b.append(el('span', { class: 'eq-lampe' + (l.allumee ? ' on' : '') }, el('i', { style: { width: pct(l.frac) } })));
  }
  return b;
}
function silhouette(p) {
  const couleur = (slot) => (slot === 'torse' ? ['haut', 'torse', 'veste'].some(s => p.equip[s]) : p.equip[slot]) ? 'porte' : '';
  return el('div', { class: 'eq-silhouette', html: `<svg viewBox="0 0 120 220" aria-hidden="true">
    <g class="eq-corps">
      <ellipse class="${couleur('tete')}" cx="60" cy="24" rx="15" ry="17"/>
      <path class="${couleur('torse')}" d="M40 50 Q60 44 80 50 L88 58 L84 112 Q60 118 36 112 L32 58 Z"/>
      <path class="${couleur('torse')}" d="M32 58 L22 100 L26 104 L38 70 Z M88 58 L98 100 L94 104 L82 70 Z"/>
      <path class="${couleur('mains')}" d="M22 102 L14 132 L22 134 L28 106 Z M98 102 L106 132 L98 134 L92 106 Z"/>
      <path class="${couleur('jambes')}" d="M37 112 Q60 118 83 112 L80 176 L64 176 L60 130 L56 176 L40 176 Z"/>
      <path class="${couleur('pieds')}" d="M40 178 L56 178 L57 204 L36 206 Z M64 178 L80 178 L84 206 L63 204 Z"/>
      ${p.equip.sac ? '<path class="porte sac" d="M84 60 L100 66 L100 108 L86 110 Z"/>' : ''}
      ${p.equip.ceinture ? '<path class="porte ceint" d="M36 106 Q60 112 84 106 L84 112 Q60 118 36 112 Z"/>' : ''}
    </g></svg>` });
}
function poupee(col, p, racine, api) {
  const wrap = el('div', { class: 'eq-poupee' });
  const g1 = el('div', { class: 'eq-col' }), g2 = el('div', { class: 'eq-col' });
  GAUCHE.forEach(s => g1.append(caseSlot(s, p, racine, api)));
  DROITE.forEach(s => g2.append(caseSlot(s, p, racine, api)));
  wrap.append(g1, silhouette(p), g2);
  col.append(wrap);
  // Accès rapide
  const max = inv.accesRapideMax(p);
  const ar = el('div', { class: 'eq-rapide' }, el('h3', { class: 'pn-section' }, 'Accès rapide', el('em', {}, `${p.accesRapide.length}/${max}`)));
  const rang = el('div', { class: 'eq-rapide-cases' });
  for (let i = 0; i < Math.max(max, 1); i++) {
    const id = p.accesRapide[i];
    if (max === 0) { rang.append(el('div', { class: 'eq-rapide-case vide verrou' }, icoEl('verrou'), el('span', {}, 'Sans ceinture, rien en combat.'))); break; }
    const c = el('button', { type: 'button', class: 'eq-rapide-case' + (id ? '' : ' vide'), onclick: id ? () => { etat.sel = { zone: 'sac', ref: p.inventaire.findIndex(x => x.id === id), id }; dessiner(racine, api); } : null });
    c.append(icoEl(id ? iconeObjet(id) : 'plus'), el('span', {}, id ? inv.nomObjet(id) : 'Libre'));
    rang.append(c);
  }
  ar.append(rang); col.append(ar);
  // Bilan
  const ch = inv.chaleurVetements(p), besoin = surv.besoinChaleur(p);
  let agi = 0; for (const s of inv.SLOTS_VETEMENT) { const c = CLOTHES[p.equip[s]]; if (c && c.agilite) agi += c.agilite; }
  col.append(el('div', { class: 'eq-bilan' },
    el('span', {}, icoEl('temperature'), `Chaleur ${ch} / besoin ${Math.max(0, besoin)}`),
    el('span', {}, icoEl('corps'), `Agilité ${agi >= 0 ? '+' : ''}${agi}`),
    el('span', {}, icoEl('sac'), `Portage +${fmtKg(inv.chargeMax(p) - REGLAGES.inventaire.POIDS_BASE)}`)));
}

// ---------- Onglet Au sol ----------
function listeSol(col, p, racine, api) {
  const s = inv.objetsAuSol();
  if (!s.length) { col.append(vide('Rien au sol, ici.', 'poser')); return; }
  col.append(el('div', { class: 'pn-actions-liste' }, bouton({ label: 'Tout ramasser', icone: 'ramasser', cls: 'second', onclick: () => {
    for (let i = inv.objetsAuSol().length - 1; i >= 0; i--) { const r = inv.ramasser(i, p); if (r.auSol) break; }
    etat.sel = null; dessiner(racine, api);
  } })));
  s.forEach((it, i) => {
    const d = inv.def(it.id);
    const actif = etat.sel && etat.sel.zone === 'sol' && etat.sel.ref === i;
    col.append(ligneObjet({ index: i, it, def: d }, p, actif, () => { etat.sel = { zone: 'sol', ref: i, id: it.id }; dessiner(racine, api); }));
  });
}

// ---------- Fiche + actions ----------
function statsObjet(id, it, p) {
  const d = inv.def(id) || {}; const rows = [];
  if (d.type === 'arme') {
    rows.push(['Dégâts', `${d.dmg[0]}–${d.dmg[1]}`], ['Vitesse', `${d.vitesse} ms`], ['Endurance', `${d.sta} / coup`], ['Allonge', ['courte', 'moyenne', 'longue'][d.allonge || 0]]);
    if (d.tir) rows.push(['Munition', inv.nomObjet(d.tir.munition)], ['Chargeur', String(d.tir.capacite)]);
    rows.push(['Bruit', ['muet', 'sourd', 'résonne', 'détonation'][d.bruit || 0]]);
    if (d.deux_mains) rows.push(['Mains', 'deux mains']);
  }
  if (CLOTHES[id]) {
    const c = CLOTHES[id];
    if (c.protection) rows.push(['Protection', `${c.protection}`]);
    if (c.chaleur) rows.push(['Chaleur', `+${c.chaleur}`]);
    if (c.slot === 'sac') rows.push(['Contenance', fmtL(inv.contenanceSac(id))]);
    else if (c.espace) rows.push(['Poches', `+${fmtL(c.espace)}`]);
    if (c.portage) rows.push(['Portage', `+${fmtKg(c.portage)}`]);
    if (c.accesRapide) rows.push(['Accès rapide', `+${c.accesRapide}`]);
    if (c.agilite) rows.push(['Agilité', `${c.agilite > 0 ? '+' : ''}${c.agilite}`]);
  }
  if (d.type === 'nourriture' || d.type === 'boisson') {
    const reste = it && it.reste != null ? it.reste : 1;
    if (d.kcal) rows.push(['Ça cale', `${surv.motPortion(id, reste)}${d.cru ? ' (cru : mal digéré)' : ''}`], ['Calories', `≈ ${Math.round(d.kcal * reste / 10) * 10} kcal`]);
    if (it && it.reste != null) rows.push(['Entamé', `il en reste ${reste >= 0.6 ? 'plus de la moitié' : reste >= 0.35 ? 'à peu près la moitié' : 'un fond'}`]);
    if (it && it.ouvert != null && d.perissable) rows.push(['Ouvert', surv.aTourne(it) ? 'depuis trop longtemps : ça a tourné' : `il se garde ${d.perissable} h une fois ouvert`]);
    if (d.soif > 0) rows.push(['Soif', d.soif >= 15 ? 'désaltère bien' : 'désaltère un peu']);
    else if (d.soif < 0) rows.push(['Soif', 'donne soif']);
    if (d.fatigue) rows.push(['Fatigue', 'te réveille un peu']);
    if (d.risque) rows.push(['Risque', d.risque.p >= 0.5 ? 'gros risque d\'intoxication' : 'risque d\'intoxication']);
  }
  if (d.contenance) rows.push(['Contenance', fmtL(d.contenance)]);
  if (it && it.eau) rows.push(['Contenu', `${fmtL(it.eau.L)} ${it.eau.q === 'propre' ? 'propre' : 'croupie'}`]);
  if (REGLAGES.lumiere.SOURCES[id] && ITEMS[id]) { const s = REGLAGES.lumiere.SOURCES[id]; rows.push(['Portée', `${s.portee} cases`], ['Autonomie', `${Math.round(s.minParCharge / 60 * 10) / 10} h / ${s.charge ? inv.nomObjet(s.charge).toLowerCase() : 'charge'}`]); }
  if (d.type === 'livre') rows.push(['Lecture', `${d.lecture} min`], ['Lu', p.livresLus.includes(id) ? 'oui' : 'non']);
  rows.push(['Poids', fmtKg((d.poids || 0) * (it && it.reste != null ? it.reste : 1) + (it && it.eau ? it.eau.L : 0))]);
  const v = inv.volumeDe(id);
  rows.push(['Volume', `${fmtL(v)}${inv.estPetit(id) ? ' (tient en poche)' : ''}`]);
  if (inv.peutDos(id)) rows.push(['Dans le dos', `oui (pèse ${Math.round(REGLAGES.inventaire.DOS_POIDS * 100)} %)`]);
  if ((inv.def(id) || {}).melee) rows.push(['En main', 'arme improvisée']);
  return rows;
}
function actionsSac(index, it, p, racine, api) {
  const d = inv.def(it.id) || {}; const a = [];
  const apres = () => { if (!p.inventaire[index] || p.inventaire[index].id !== it.id) etat.sel = null; dessiner(racine, api); };
  const res = (r) => { if (r && r.ok === false && r.raison) api && import('../toast.js').then(m => m.toast(r.raison, 'alerte')); apres(); };
  if (d.type === 'nourriture') {
    // manger prend du temps : le panneau se ferme et le repas se joue dans le monde (voir demanderRepas)
    const v = surv.peutConsommer(it, p), forcer = !v.ok && !!v.peutForcer;
    const manger = () => demanderRepas({ prendre: () => inv.removeIndex(index, 1, p), rendre: (e) => inv.addItem(e.id, 1, etatDe(e), p), forcer, fermer: api && api.fermer },
      () => res(surv.manger(index, p, { forcer })));
    const repu = surv.placeEstomac(p) < REGLAGES.survie.REPAS.BOUCHEE;
    if (v.ok) a.push({ label: 'Manger', icone: 'manger', principal: true, f: manger });
    else if (forcer) a.push({ label: repu ? g('Manger quand même (tu es repu{|e})') : 'Manger quand même (tu n\'as plus faim)', icone: 'manger', f: manger });
    else a.push({ label: 'Manger', icone: 'manger', disabled: true, raison: v.raison, f: () => {} });
  }
  if (d.type === 'boisson') a.push({ label: 'Boire', icone: 'boire', principal: true, f: () => res(surv.boire(it.id)) });
  if (it.eau && it.eau.L > 0) a.push({ label: 'Boire une gorgée', icone: 'boire', principal: true, f: () => res(surv.boire(index)) });
  if (d.contenance) {
    const src = surv.contexteSurvie().sourceEau;
    if (src) a.push({ label: `Remplir (${src === 'propre' ? 'eau propre' : 'eau croupie'})`, icone: 'remplir', f: () => import('../../explore/construction.js').then(m => m.remplirAuPointEau(index)).then(res) });
    if (it.eau) a.push({ label: 'Vider', icone: 'vider', f: () => { inv.vider(index); apres(); } });
  }
  if (d.type === 'soin') {
    const act = surv.actionSoin(it.id);
    if (['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'].includes(act)) a.push({ label: 'Prendre', icone: 'soin', principal: true, f: () => res(surv.soigner(p, -1, it.id)) });
    else a.push({ label: p.blessures.length ? 'Soigner une plaie' : 'Aucune plaie à soigner', icone: 'soin', principal: !!p.blessures.length, disabled: !p.blessures.length, f: () => api.ouvrir('corps') });
  }
  if (d.type === 'livre') a.push({ label: p.livresLus.includes(it.id) ? 'Relire' : 'Lire', icone: 'lire', principal: true, f: () => res(craft.lire(index)) });
  const slot = inv.slotDe(it.id);
  if (slot === 'lampe') a.push({ label: 'Équiper la lampe', icone: 'lampe', principal: true, f: () => res(inv.equiper(index)) });
  else if (slot && slot !== 'arme') a.push({ label: 'Porter', icone: 'equiper', principal: true, f: () => res(inv.equiper(index)) });
  if (!CLOTHES[it.id] && (d.type === 'arme' || d.melee || inv.peutDos(it.id) || inv.volumeDe(it.id) >= 1.5)) {
    const arme = d.type === 'arme' || d.melee;
    a.push({ label: d.deux_mains ? 'À deux mains' : 'Main droite', icone: 'main_arme', principal: !!arme && !slot || slot === 'arme', f: () => res(inv.tenir(index, d.deux_mains ? 'deux' : 'droite')) });
    if (d.deux_mains) a.push({ label: 'Main droite seule', icone: 'main_arme', f: () => res(inv.tenir(index, 'droite')) });
    a.push({ label: 'Main gauche', icone: 'main_arme', f: () => res(inv.tenir(index, 'gauche')) });
    if (inv.peutDos(it.id)) a.push({ label: 'Dans le dos', icone: 'sac', f: () => res(inv.mettreDos(index)) });
  }
  if (it.id === 'piles' || it.id === 'huile_olive') {
    const l = inv.lampe(p); if (l && l.recharge === it.id) a.push({ label: 'Recharger la lampe', icone: 'recharger', f: () => res(inv.rechargerLampe()) });
  }
  if (['arme', 'soin', 'munition', 'jet'].includes(d.type) || d.jet) {
    if (p.accesRapide.includes(it.id)) a.push({ label: 'Retirer de la ceinture', icone: 'ceinture', f: () => { inv.retirerAccesRapide(it.id); apres(); } });
    else { const max = inv.accesRapideMax(p); a.push({ label: 'Mettre à la ceinture', icone: 'ceinture', disabled: max === 0 || p.accesRapide.length >= max, raison: max === 0 ? 'Pas de ceinture' : 'Plein', f: () => res(inv.mettreAccesRapide(it.id)) }); }
  }
  if (d.reparation && it.dur != null && it.dur < it.durMax) a.push({ label: 'Réparer…', icone: 'reparer', f: () => api.ouvrir('fabrication', { cat: 'reparation' }) });
  if (CLOTHES[it.id] && CLOTHES[it.id].tissu) a.push({ label: `Déchirer (${CLOTHES[it.id].tissu} chiffon${CLOTHES[it.id].tissu > 1 ? 's' : ''})`, icone: 'dechirer', f: () => res(inv.dechirer(index)) });
  a.push({ label: it.qty > 1 ? 'Poser 1' : 'Poser', icone: 'poser', f: () => { inv.poser(index, 1); apres(); } });
  if (it.qty > 1) a.push({ label: `Poser tout (${it.qty})`, icone: 'poser', f: () => { inv.poser(index, it.qty); etat.sel = null; dessiner(racine, api); } });
  return a;
}
function actionsSlot(slot, p, racine, api) {
  const id = p.equip[slot]; const a = []; if (!id) return a;
  const apres = () => dessiner(racine, api);
  const res = (r) => { if (r && r.ok === false && r.raison) import('../toast.js').then(m => m.toast(r.raison, 'alerte')); apres(); };
  if (slot === 'lampe') {
    const l = inv.lampe(p);
    a.push({ label: l.allumee ? 'Éteindre' : 'Allumer', icone: l.allumee ? 'eteindre' : 'allumer', principal: true, f: () => res(inv.allumerLampe(!l.allumee)) });
    if (l.recharge && l.frac < 1) a.push({ label: `${l.recharge === 'piles' ? 'Changer les piles' : 'Recharger'} (${inv.nomObjet(l.recharge)} : ${inv.countItem(REGLAGES.lumiere.SOURCES[id].charge)})`, icone: 'recharger', disabled: !inv.hasItem(REGLAGES.lumiere.SOURCES[id].charge), f: () => res(inv.rechargerLampe()) });
  }
  if (slot === 'arme' || slot === 'mainG') {
    a.push({ label: 'Échanger les mains', icone: 'main_arme', f: () => res(inv.echangerMains()) });
    if (slot === 'arme') a.push({ label: p.deuxMains ? 'Tenir d\'une main' : 'Tenir à deux mains', icone: 'main_arme', f: () => res(inv.basculerDeuxMains()) });
    if (inv.peutDos(id)) a.push({ label: 'Mettre dans le dos', icone: 'sac', f: () => res(inv.mainVersDos(slot)) });
  }
  if (slot === 'dos') a.push({ label: 'Prendre en main', icone: 'main_arme', principal: true, f: () => res(inv.dosVersMain()) });
  const tient = !inv.SLOTS_TENUS.includes(slot) || inv.combienTient(id, 1) >= 1;
  a.push({ label: inv.SLOTS_TENUS.includes(slot) ? (tient ? 'Ranger dans le sac' : 'Poser au sol (trop gros)') : 'Retirer', icone: 'retirer', principal: slot !== 'lampe' && slot !== 'dos',
    f: () => { inv.desequiper(slot); apres(); } });
  return a;
}
function remplirFiche(f, p, racine, api) {
  const s = etat.sel;
  if (!s) { f.append(vide(etat.onglet === 'equip' ? 'Touche un emplacement pour voir ce que tu portes.' : 'Touche un objet pour le regarder de plus près.', 'info')); return; }
  let id, it = null, acts = [];
  if (s.zone === 'sac') { it = p.inventaire[s.ref]; if (!it) { etat.sel = null; f.append(vide('—')); return; } id = it.id; acts = actionsSac(s.ref, it, p, racine, api); }
  else if (s.zone === 'slot') {
    id = p.equip[s.ref];
    if (!id && s.ref === 'mainG' && inv.lampeTenue(p.equip.lampe)) { etat.sel = { zone: 'slot', ref: 'lampe' }; return remplirFiche(f, p, racine, api); }
    if (!id) {
      f.append(el('div', { class: 'fi-tete' }, el('span', { class: 'fi-ic' }, icoEl(ICONE_SLOT[s.ref])), el('div', {}, el('h2', {}, inv.NOMS_SLOTS[s.ref]), el('p', { class: 'fi-type' }, 'Emplacement libre'))));
      const filtre = s.ref === 'arme' || s.ref === 'mainG' ? (x) => !CLOTHES[x.id] && (inv.def(x.id) || {}).type !== 'munition' && ((inv.def(x.id) || {}).type === 'arme' || (inv.def(x.id) || {}).melee || !inv.estPetit(x.id))
        : s.ref === 'dos' ? (x) => inv.peutDos(x.id) : (x) => inv.slotDe(x.id) === s.ref;
      const cands = p.inventaire.map((x, i) => ({ x, i })).filter(({ x }) => filtre(x));
      if (!cands.length) f.append(el('p', { class: 'fi-desc' }, s.ref === 'arme' ? 'Tu te bats à mains nues. Trouve de quoi frapper.' : s.ref === 'dos' ? 'Rien d\'assez long pour se sangler dans le dos (pelle, planche, fusil…).' : 'Rien dans ton sac pour cet emplacement.'));
      else {
        f.append(el('h3', { class: 'pn-section' }, 'Dans ton sac')); const l = el('div', { class: 'fi-actions' });
        const prendre = (i) => s.ref === 'dos' ? inv.mettreDos(i) : s.ref === 'mainG' ? inv.tenir(i, 'gauche') : s.ref === 'arme' ? inv.tenir(i, (inv.def(p.inventaire[i].id) || {}).deux_mains ? 'deux' : 'droite') : inv.equiper(i);
        cands.forEach(({ x, i }) => l.append(bouton({ label: inv.nomObjet(x.id), icone: iconeObjet(x.id), cls: 'second', onclick: () => { const r = prendre(i); if (r && r.ok === false && r.raison) emit('toast', { texte: r.raison }); etat.sel = { zone: 'slot', ref: s.ref }; dessiner(racine, api); } })));
        f.append(l);
      }
      return;
    }
    it = inv.SLOTS_TENUS.includes(s.ref) ? { id, qty: 1, ...(p.equipEtat[s.ref] || {}) } : { id, qty: 1 };
    acts = actionsSlot(s.ref, p, racine, api);
  } else {
    it = inv.objetsAuSol()[s.ref]; if (!it) { etat.sel = null; f.append(vide('—')); return; } id = it.id;
    acts = [];
    const ou = inv.ouPorter(it.id);
    if (ou) acts.push({ label: { vetement: 'Porter', lampe: 'Prendre la lampe', main: 'Prendre en main', dos: 'Dans le dos', deux: 'Porter à deux mains' }[ou], icone: 'equiper', principal: true,
      f: () => { const r = inv.equiperDepuisSol(s.ref, p, ou); if (!r.ok && r.raison) emit('toast', { texte: r.raison }); etat.sel = null; dessiner(racine, api); } });
    if (ou === 'dos' || (ou === 'main' && inv.peutDos(it.id) && !p.equip.dos)) {
      if (ou === 'dos') acts.push({ label: 'Prendre en main', icone: 'main_arme', f: () => { const r = inv.equiperDepuisSol(s.ref, p, 'main'); if (!r.ok && r.raison) emit('toast', { texte: r.raison }); etat.sel = null; dessiner(racine, api); } });
      else acts.push({ label: 'Dans le dos', icone: 'sac', f: () => { const r = inv.equiperDepuisSol(s.ref, p, 'dos'); if (!r.ok && r.raison) emit('toast', { texte: r.raison }); etat.sel = null; dessiner(racine, api); } });
    }
    const lib = surv.libelleConsommer(it.id);
    if (lib) {
      const v = surv.peutConsommer(it, p);
      const forcer = !v.ok && v.peutForcer;
      acts.push({ label: forcer ? `${lib} quand même` : lib, icone: ({ Manger: 'manger', Boire: 'boire' })[lib] || 'soin', principal: v.ok && !acts.length, disabled: !v.ok && !forcer, raison: v.ok || forcer ? null : v.raison,
        f: () => { consommerAuSol(s.ref, p, { forcer }); etat.sel = null; dessiner(racine, api); } });
    }
    const tient = inv.combienTient(it.id, it.qty || 1) >= 1;
    acts.push({ label: tient ? 'Ramasser' : (inv.estPetit(it.id) ? 'Sac plein' : 'Trop gros pour le sac'), icone: 'ramasser', principal: !acts.length, disabled: !tient, raison: tient ? null : inv.raisonPlace(it.id),
      f: () => { if (!tient) return; inv.ramasser(s.ref); etat.sel = null; dessiner(racine, api); } });
  }
  const d = inv.def(id) || { nom: id };
  const fermer = el('button', { type: 'button', class: 'fi-fermer', 'aria-label': 'Fermer la fiche', onclick: () => { etat.sel = null; dessiner(racine, api); } }, icoEl('fermer'));
  f.append(fermer, el('div', { class: `fi-tete cat-${inv.categorie(id)}` },
    el('span', { class: 'fi-ic' }, icoEl(iconeObjet(id))),
    el('div', {}, el('h2', {}, d.nom, it && it.qty > 1 ? el('em', {}, ` ×${it.qty}`) : null), el('p', { class: 'fi-type' }, typeLisible(id, d)))));
  const u = inv.etatUsure(it);
  if (u != null) f.append(jauge({ label: 'État', v: u, texte: `${it.dur} / ${it.durMax}`, cls: `mini ${u < 0.2 ? 'rouge' : u < 0.5 ? 'ambre' : 'vert'}` }));
  if (s.zone === 'slot' && s.ref === 'lampe') { const l = inv.lampe(p); f.append(jauge({ label: l.allumee ? 'Allumée' : 'Éteinte', v: l.frac, texte: `${Math.round(l.charge)} min`, cls: `mini ${l.allumee ? 'ambre' : ''}` })); }
  const acDiv = el('div', { class: 'fi-actions' });
  for (const a of acts) acDiv.append(bouton({ label: a.label, icone: a.icone, cls: a.principal ? 'principal' : 'second', disabled: a.disabled, raison: a.raison, onclick: a.f }));
  f.append(acDiv);
  if (d.desc) f.append(el('p', { class: 'fi-desc' }, g(d.desc)));
  const tb = el('dl', { class: 'fi-stats' });
  for (const [k, v] of statsObjet(id, it, p)) tb.append(el('dt', {}, k), el('dd', {}, v));
  f.append(tb);
}
// Un repas demandé depuis le panneau : l'exploration le joue dans le monde (barre, mastication, interruption) ;
// ailleurs (carte, voyage), on mange d'un coup et quelques minutes passent.
function demanderRepas(d, repli) {
  emit('repas:demande', d);
  if (d.pris) return;
  repli();
  if (G && G.mode === 'solo') import('../../core/clock.js').then(c => c.avancer(REGLAGES.survie.REPAS.MIN_HORS_EXPLORATION)).catch(() => {});
}
// Consommer un objet du sol sans le ramasser ; ce qui reste (boîte entamée, gourde) est gardé dans le sac.
function consommerAuSol(i, p, opts) {
  const s0 = inv.objetsAuSol()[i];
  if (s0 && (inv.def(s0.id) || {}).type === 'nourriture') {
    demanderRepas({ prendre: () => inv.prendreUnAuSol(i), rendre: (e) => inv.addItem(e.id, 1, etatDe(e), p), forcer: !!(opts && opts.forcer), fermer: null },
      () => consommerAuSolDirect(i, p, opts));
    return;
  }
  consommerAuSolDirect(i, p, opts);
}
function consommerAuSolDirect(i, p, opts) {
  const it = inv.prendreUnAuSol(i); if (!it) return;
  const r = surv.consommer(it, p, opts);
  if (!r.ok) { inv.addItem(it.id, 1, etatDe(it), p); if (r.raison) emit('toast', { texte: r.raison }); return; }
  if (!r.fini) inv.addItem(it.id, 1, { ...etatDe(it), ...(r.reste != null ? { reste: r.reste, ouvert: r.ouvert } : {}), ...(r.eau ? { eau: r.eau } : {}) }, p);
  if (r.rend) inv.addItem(r.rend, 1, {}, p);
}
const etatDe = (it) => { const { id: _i, qty: _q, ...e } = it; return e; };
function typeLisible(id, d) {
  if (CLOTHES[id]) return `Vêtement — ${SLOTS[CLOTHES[id].slot] || ''}`;
  return ({ arme: d.tir ? 'Arme de tir' : 'Arme de mêlée', munition: 'Munition', jet: 'À lancer', nourriture: 'Nourriture', boisson: 'Boisson', soin: 'Soin', outil: 'Outil', materiau: 'Matériau', recipient: 'Contenant', livre: 'Livre', lore: 'Souvenir', quete: 'Objet important' })[d.type] || 'Objet';
}
