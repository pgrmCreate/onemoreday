// ============ Panneau Inventaire — Sac / Équipement / Au sol ============
// Objets groupés par catégorie ; au toucher : fiche + actions contextuelles ; jauges poids / encombrement ; paper-doll.
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
let etat = { onglet: 'sac', sel: null }; // sel : { zone: 'sac'|'slot'|'sol', ref }

export function monter(racine, opts = {}, api) {
  if (opts.onglet) etat.onglet = opts.onglet;
  etat.sel = null;
  const rendre = () => avecScroll(racine, () => dessiner(racine, api));
  rendre();
  return { maj: rendre };
}

function dessiner(racine, api) {
  const p = G.player; racine.textContent = '';
  const nSol = inv.objetsAuSol().length;
  const barre = el('div', { class: 'pn-barre' },
    onglets([
      { id: 'sac', label: 'Sac', icone: 'sac' },
      { id: 'equip', label: 'Équipement', icone: 'equiper' },
      { id: 'sol', label: 'Au sol', icone: 'poser', badge: nSol || null },
    ], etat.onglet, (id) => { etat.onglet = id; etat.sel = null; dessiner(racine, api); }),
    jaugesCharge(p));
  racine.append(barre);
  const grille = el('div', { class: 'pn-grille' + (etat.sel ? ' avec-fiche' : '') });
  const gauche = el('div', { class: 'pn-col-liste', 'data-scroll': 'liste-' + etat.onglet });
  if (etat.onglet === 'sac') listeSac(gauche, p, racine, api);
  else if (etat.onglet === 'equip') poupee(gauche, p, racine, api);
  else listeSol(gauche, p, racine, api);
  const fiche = el('aside', { class: 'pn-fiche', 'data-scroll': 'fiche' });
  remplirFiche(fiche, p, racine, api);
  grille.append(gauche, fiche);
  racine.append(grille);
}

function jaugesCharge(p) {
  const b = inv.bilan(p);
  const vp = b.kg / b.plafond, repere = b.max / b.plafond;
  const cls = b.bloque ? 'rouge' : b.f > 0 ? 'ambre' : '';
  return el('div', { class: 'inv-charge' },
    jauge({ label: 'Poids', icone: 'poids', v: vp, repere, texte: `${fmtKg(b.kg)} / ${fmtKg(b.max)}`, cls: `mini ${cls}`, titre: `Au-delà de ${fmtKg(b.max)} : surpoids. Au-delà de ${fmtKg(b.plafond)} : impossible de bouger.` }),
    jauge({ label: 'Place', icone: 'encombrement', v: b.espaceMax ? b.espace / b.espaceMax : 1, texte: `${b.espace} / ${b.espaceMax}`, cls: `mini ${b.espace >= b.espaceMax ? 'ambre' : ''}`, titre: 'Emplacements : poches, vêtements et sac. Les petits objets ne comptent pas.' }));
}

// ---------- Onglet Sac ----------
function metaObjet(it, d) {
  const bits = [];
  const kg = (d.poids || 0) * it.qty + (it.eau ? it.eau.L : 0);
  bits.push(fmtKg(kg));
  const e = inv.espaceDe(it.id);
  if (e) bits.push(`${e * it.qty} pl.`);
  return bits.join(' · ');
}
function ligneObjet({ index, it, def: d }, p, actif, onclick) {
  const b = el('button', { type: 'button', class: `inv-ligne cat-${inv.categorie(it.id)}${actif ? ' actif' : ''}`, onclick });
  const ic = el('span', { class: 'inv-ic' }, icoEl(iconeObjet(it.id)));
  const nom = el('span', { class: 'inv-nom' }, d ? d.nom : it.id);
  if (it.qty > 1) nom.append(el('em', { class: 'inv-qty' }, `×${it.qty}`));
  const sous = el('span', { class: 'inv-meta' }, metaObjet(it, d || {}));
  const txt = el('span', { class: 'inv-txt' }, nom, sous);
  b.append(ic, txt);
  const u = inv.etatUsure(it);
  if (u != null) b.append(el('span', { class: 'inv-usure' + (u < 0.2 ? ' bas' : ''), title: `État ${pct(u)}` }, el('i', { style: { width: pct(u) } })));
  if (it.eau) b.append(el('span', { class: `inv-eau ${it.eau.q}`, title: `${fmtL(it.eau.L)} ${it.eau.q === 'propre' ? 'd\'eau propre' : 'd\'eau croupie'}` }, el('i', { style: { height: pct(it.eau.L / (inv.contenance(it.id) || 1)) } })));
  if (p.accesRapide.includes(it.id)) b.append(el('span', { class: 'inv-tag', title: 'À la ceinture (accès rapide)' }, icoEl('ceinture')));
  return b;
}
function enteteSac(p) {
  const sac = inv.sacPorte(p);
  const b = inv.bilan(p);
  return el('div', { class: 'inv-sac-porte' + (sac ? '' : ' sans') },
    el('span', { class: 'isp-ic' }, icoEl('sac')),
    el('div', {},
      el('strong', {}, sac ? sac.nom : 'Pas de sac'),
      el('p', {}, sac
        ? `+${sac.espace} places, +${sac.portage} kg portables. ${b.espaceMax - b.espace} place${b.espaceMax - b.espace > 1 ? 's' : ''} libre${b.espaceMax - b.espace > 1 ? 's' : ''} sur ${b.espaceMax}.`
        : `Seulement tes poches et tes vêtements : ${b.espaceMax} places. Trouve un sac pour porter plus (cabas +3, sac à dos +6, sac de randonnée +10, sac militaire +12).`)));
}
function listeSac(col, p, racine, api) {
  col.append(enteteSac(p));
  const groupes = inv.sacParCategorie(p);
  if (!groupes.length) { col.append(vide('Ton sac est vide. Fouille les meubles, les voitures, les morts.', 'sac')); return; }
  for (const gr of groupes) {
    col.append(el('h3', { class: 'pn-section' }, gr.nom, el('em', {}, String(gr.items.reduce((s, x) => s + x.it.qty, 0)))));
    for (const x of gr.items) {
      const actif = etat.sel && etat.sel.zone === 'sac' && etat.sel.ref === x.index;
      col.append(ligneObjet(x, p, actif, () => { etat.sel = { zone: 'sac', ref: x.index, id: x.it.id }; dessiner(racine, api); }));
    }
  }
}

// ---------- Onglet Équipement (paper-doll) ----------
const GAUCHE = ['tete', 'torse', 'mains', 'jambes', 'pieds'];
const DROITE = ['arme', 'lampe', 'sac', 'ceinture', 'holster'];
const ICONE_SLOT = { tete: 'tete', torse: 'torse', mains: 'mains', jambes: 'jambes', pieds: 'pieds', arme: 'main_arme', lampe: 'lampe', sac: 'sac', ceinture: 'ceinture', holster: 'holster' };
function caseSlot(slot, p, racine, api) {
  const id = p.equip[slot]; const d = id ? inv.def(id) : null;
  const actif = etat.sel && etat.sel.zone === 'slot' && etat.sel.ref === slot;
  const b = el('button', { type: 'button', class: `eq-slot${id ? ' plein' : ''}${actif ? ' actif' : ''}`, onclick: () => { etat.sel = { zone: 'slot', ref: slot }; dessiner(racine, api); } });
  b.append(el('span', { class: 'eq-ic' }, icoEl(id ? iconeObjet(id) : ICONE_SLOT[slot])));
  const t = el('span', { class: 'eq-txt' }, el('small', {}, inv.NOMS_SLOTS[slot]), el('span', {}, d ? d.nom : (slot === 'arme' ? 'Mains nues' : '—')));
  b.append(t);
  if (slot === 'arme' && p.equipEtat.arme && p.equipEtat.arme.durMax) {
    const u = p.equipEtat.arme.dur / p.equipEtat.arme.durMax;
    b.append(el('span', { class: 'inv-usure' + (u < 0.2 ? ' bas' : '') }, el('i', { style: { width: pct(u) } })));
  }
  if (slot === 'lampe' && id) {
    const l = inv.lampe(p);
    b.append(el('span', { class: 'eq-lampe' + (l.allumee ? ' on' : '') }, el('i', { style: { width: pct(l.frac) } })));
  }
  return b;
}
function silhouette(p) {
  const couleur = (slot) => p.equip[slot] ? 'porte' : '';
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
    if (c.espace) rows.push(['Place offerte', `+${c.espace}`]);
    if (c.portage) rows.push(['Portage', `+${fmtKg(c.portage)}`]);
    if (c.accesRapide) rows.push(['Accès rapide', `+${c.accesRapide}`]);
    if (c.agilite) rows.push(['Agilité', `${c.agilite > 0 ? '+' : ''}${c.agilite}`]);
  }
  if (d.type === 'nourriture' || d.type === 'boisson') {
    if (d.faim) rows.push(['Faim', `${d.faim > 0 ? '+' : ''}${d.faim}`]);
    if (d.soif) rows.push(['Soif', `${d.soif > 0 ? '+' : ''}${d.soif}`]);
    if (d.fatigue) rows.push(['Fatigue', `+${d.fatigue}`]);
    if (d.risque) rows.push(['Risque', `intoxication ${Math.round(d.risque.p * 100)} %`]);
  }
  if (d.contenance) rows.push(['Contenance', fmtL(d.contenance)]);
  if (it && it.eau) rows.push(['Contenu', `${fmtL(it.eau.L)} ${it.eau.q === 'propre' ? 'propre' : 'croupie'}`]);
  if (REGLAGES.lumiere.SOURCES[id] && ITEMS[id]) { const s = REGLAGES.lumiere.SOURCES[id]; rows.push(['Portée', `${s.portee} cases`], ['Autonomie', `${Math.round(s.minParCharge / 60 * 10) / 10} h / ${s.charge ? inv.nomObjet(s.charge).toLowerCase() : 'charge'}`]); }
  if (d.type === 'livre') rows.push(['Lecture', `${d.lecture} min`], ['Lu', p.livresLus.includes(id) ? 'oui' : 'non']);
  rows.push(['Poids', fmtKg((d.poids || 0) + (it && it.eau ? it.eau.L : 0))]);
  const e = inv.espaceDe(id); rows.push(['Place', e ? `${e}` : 'poche']);
  return rows;
}
function actionsSac(index, it, p, racine, api) {
  const d = inv.def(it.id) || {}; const a = [];
  const apres = () => { if (!p.inventaire[index] || p.inventaire[index].id !== it.id) etat.sel = null; dessiner(racine, api); };
  const res = (r) => { if (r && r.ok === false && r.raison) api && import('../toast.js').then(m => m.toast(r.raison, 'alerte')); apres(); };
  if (d.type === 'nourriture') a.push({ label: 'Manger', icone: 'manger', principal: true, f: () => res(surv.manger(it.id)) });
  if (d.type === 'boisson') a.push({ label: 'Boire', icone: 'boire', principal: true, f: () => res(surv.boire(it.id)) });
  if (it.eau && it.eau.L > 0) a.push({ label: 'Boire une gorgée', icone: 'boire', principal: true, f: () => res(surv.boire(index)) });
  if (d.contenance) {
    const src = surv.contexteSurvie().sourceEau;
    if (src) a.push({ label: `Remplir (${src === 'propre' ? 'eau propre' : 'eau croupie'})`, icone: 'remplir', f: () => res(inv.remplir(index, src)) });
    if (it.eau) a.push({ label: 'Vider', icone: 'vider', f: () => { inv.vider(index); apres(); } });
  }
  if (d.type === 'soin') {
    const act = surv.actionSoin(it.id);
    if (['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'].includes(act)) a.push({ label: 'Prendre', icone: 'soin', principal: true, f: () => res(surv.soigner(p, -1, it.id)) });
    else a.push({ label: p.blessures.length ? 'Soigner une plaie' : 'Aucune plaie à soigner', icone: 'soin', principal: !!p.blessures.length, disabled: !p.blessures.length, f: () => api.ouvrir('corps') });
  }
  if (d.type === 'livre') a.push({ label: p.livresLus.includes(it.id) ? 'Relire' : 'Lire', icone: 'lire', principal: true, f: () => res(craft.lire(index)) });
  const slot = inv.slotDe(it.id);
  if (slot === 'arme') a.push({ label: 'Prendre en main', icone: 'main_arme', principal: !d.tir || true, f: () => res(inv.equiper(index)) });
  else if (slot === 'lampe') a.push({ label: 'Équiper la lampe', icone: 'lampe', principal: true, f: () => res(inv.equiper(index)) });
  else if (slot) a.push({ label: 'Porter', icone: 'equiper', principal: true, f: () => res(inv.equiper(index)) });
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
  a.push({ label: slot === 'arme' ? 'Ranger dans le sac' : 'Retirer', icone: 'retirer', principal: slot !== 'lampe', f: () => { inv.desequiper(slot); apres(); } });
  return a;
}
function remplirFiche(f, p, racine, api) {
  const s = etat.sel;
  if (!s) { f.append(vide(etat.onglet === 'equip' ? 'Touche un emplacement pour voir ce que tu portes.' : 'Touche un objet pour le regarder de plus près.', 'info')); return; }
  let id, it = null, acts = [];
  if (s.zone === 'sac') { it = p.inventaire[s.ref]; if (!it) { etat.sel = null; f.append(vide('—')); return; } id = it.id; acts = actionsSac(s.ref, it, p, racine, api); }
  else if (s.zone === 'slot') {
    id = p.equip[s.ref];
    if (!id) {
      f.append(el('div', { class: 'fi-tete' }, el('span', { class: 'fi-ic' }, icoEl(ICONE_SLOT[s.ref])), el('div', {}, el('h2', {}, inv.NOMS_SLOTS[s.ref]), el('p', { class: 'fi-type' }, 'Emplacement libre'))));
      const cands = p.inventaire.map((x, i) => ({ x, i })).filter(({ x }) => inv.slotDe(x.id) === s.ref);
      if (!cands.length) f.append(el('p', { class: 'fi-desc' }, s.ref === 'arme' ? 'Tu te bats à mains nues. Trouve de quoi frapper.' : 'Rien dans ton sac pour cet emplacement.'));
      else { f.append(el('h3', { class: 'pn-section' }, 'Dans ton sac')); const l = el('div', { class: 'fi-actions' }); cands.forEach(({ x, i }) => l.append(bouton({ label: inv.nomObjet(x.id), icone: iconeObjet(x.id), cls: 'second', onclick: () => { inv.equiper(i); etat.sel = { zone: 'slot', ref: s.ref }; dessiner(racine, api); } }))); f.append(l); }
      return;
    }
    it = s.ref === 'arme' ? { id, qty: 1, ...(p.equipEtat.arme || {}) } : { id, qty: 1 };
    acts = actionsSlot(s.ref, p, racine, api);
  } else {
    it = inv.objetsAuSol()[s.ref]; if (!it) { etat.sel = null; f.append(vide('—')); return; } id = it.id;
    acts = [];
    if (inv.slotDe(it.id)) acts.push({ label: inv.slotDe(it.id) === 'arme' ? 'Prendre en main' : inv.slotDe(it.id) === 'lampe' ? 'Prendre la lampe' : 'Porter', icone: 'equiper', principal: true,
      f: () => { const r = inv.equiperDepuisSol(s.ref); if (!r.ok && r.raison) emit('toast', { texte: r.raison }); etat.sel = null; dessiner(racine, api); } });
    const tient = inv.combienTient(it.id, it.qty || 1) >= 1;
    acts.push({ label: tient ? 'Ramasser' : 'Sac plein', icone: 'ramasser', principal: !acts.length, disabled: !tient, raison: tient ? null : 'Plus de place',
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
function typeLisible(id, d) {
  if (CLOTHES[id]) return `Vêtement — ${SLOTS[CLOTHES[id].slot] || ''}`;
  return ({ arme: d.tir ? 'Arme de tir' : 'Arme de mêlée', munition: 'Munition', jet: 'À lancer', nourriture: 'Nourriture', boisson: 'Boisson', soin: 'Soin', outil: 'Outil', materiau: 'Matériau', recipient: 'Contenant', livre: 'Livre', lore: 'Souvenir', quete: 'Objet important' })[d.type] || 'Objet';
}
