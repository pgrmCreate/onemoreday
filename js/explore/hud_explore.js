// ============ Exploration — HUD de l'écran (DOM, mis à jour sans innerHTML à 60 Hz) ============
// Nom du lieu, message court, invite d'interaction, VITAUX (vie + endurance, lisibles en un coup d'œil), lampe,
// barre d'action, fenêtre de butin, mains (ce qu'on tient), « Dégage-toi ! », voile rouge, guide d'objectif,
// coéquipier (où il est, s'il est à terre), aide des commandes (premières minutes, rappel avec H).
import { G } from '../core/state.js';
import { el } from '../core/util.js';
import { pref, setPref } from '../core/prefs.js';
import { objet } from '../game/donnees.js';
import { REGLAGES } from '../data/reglages.js';

const RX = REGLAGES.exploration;

export function creerHud(racine, { arene = false } = {}) {
  const h = {
    lieu: el('div', { class: 'ex-lieu' }),
    msg: el('div', { class: 'ex-msg' }),
    invite: el('div', { class: 'ex-invite' }),
    choix: el('div', { class: 'ex-choix cache', role: 'menu', 'aria-label': 'Actions possibles' }),
    zoom: el('button', { class: 'ex-zoom', type: 'button', 'aria-label': 'Zoom', title: 'Zoom' }, el('i'), el('i'), el('i')),
    // le plan du lieu (ce qu'on a exploré), au-dessus du zoom
    plan: el('button', { class: 'ex-plan-btn' + (arene ? ' cache' : ''), type: 'button', 'aria-label': 'Plan du lieu (Tab ou M)', title: 'Plan du lieu (Tab ou M)',
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20" opacity=".6"/></svg>' }),
    etat: el('div', { class: 'ex-etat' }),
    butin: el('div', { class: 'ex-butin cache' }),
    barre: el('div', { class: 'ex-action cache' }, el('div', { class: 'ex-action-l' }), el('div', { class: 'ex-action-b' }, el('i'))),
    mains: el('div', { class: 'ex-mains' }),
    degage: el('div', { class: 'ex-degage cache' }),
    sang: el('div', { class: 'ex-sang' }),
    route: el('button', { class: 'ex-route cache', type: 'button' }, 'Reprendre la route'),
    guide: el('div', { class: 'ex-guide cache' }, el('i', { class: 'ex-guide-ico' }), el('span')),
    coop: el('div', { class: 'ex-coop cache' }),
    aide: el('div', { class: 'ex-aide cache' }),
  };
  // vitaux : vie (rouge) et endurance (crème), avec le chiffre
  const barre = (cls, nom) => el('div', { class: 'ex-vital ' + cls }, el('b', {}, nom), el('div', { class: 'ex-vital-b' }, el('i'), el('s')), el('em'));
  h.pv = barre('pv', 'Vie'); h.sta = barre('sta', 'Souffle');
  h.lampe = el('div', { class: 'ex-lampe' }, el('span', {}, 'Lampe'), el('b', {}, el('i')));
  h.etat.append(h.pv, h.sta, h.lampe);
  // aide des commandes (PC) — les touches, regroupées par usage
  const ligne = (k, t) => el('div', {}, el('kbd', {}, k), ' ', t);
  h.aide.append(
    el('div', { class: 'ex-aide-t' }, 'Commandes', el('small', {}, ' — H pour afficher / masquer')),
    el('div', { class: 'ex-aide-g' },
      el('div', {}, el('h4', {}, 'Bouger'), ligne('ZQSD', 'se déplacer'), ligne('Maj', 'courir'), ligne('C', 'accroupi (discret : coups silencieux mais moins forts)'), ligne('Souris', 'regarder / viser')),
      el('div', {}, el('h4', {}, 'Se battre'), ligne('Clic', 'frapper — 3 clics en rythme : enchaînement'), ligne('Clic maintenu', 'coup chargé'), ligne('Clic droit · Espace', 'repousser'), ligne('Arme à feu', 'clic droit maintenu : viser, clic : tirer — sans viser : crosse')),
      el('div', {}, el('h4', {}, 'Construire'), ligne('Marteau', 'menu Construire'), ligne('Clic', 'placer puis bâtir'), ligne('T', 'tourner'), ligne('Échap', 'arrêter')),
      el('div', {}, el('h4', {}, 'Faire'), ligne('E', 'interagir / fouiller'), ligne('O', 'chercher par terre'), ligne('P', 'objets au sol autour'), ligne('G', 'autres actions ici'), ligne('F', 'lampe'), ligne('I', 'sac'), ligne('Tab / M', 'plan du lieu'), ligne('X / B', 'mains / dos'), ligne('1-4', 'ceinture (réappuyer : ranger)'))),
  );
  racine.append(h.sang, h.lieu, h.guide, h.coop, h.msg, h.invite, h.choix, h.etat, h.zoom, h.plan, h.barre, h.butin, h.mains, h.degage, h.route, h.aide);
  if (!arene && !pref('aideExploreVue')) { h.aide.classList.remove('cache'); setTimeout(() => h.aide.classList.add('cache'), 16000); setPref('aideExploreVue', true); }

  const cache = {};
  const fixer = (cle, v, f) => { if (cache[cle] !== v) { cache[cle] = v; f(v); } };
  return Object.assign(h, {
    basculerAide() { h.aide.classList.toggle('cache'); },
    // Menu des actions possibles ici (liste figée) : la première est celle de E / Interagir. null = fermer.
    montrerChoix(liste, choisir) {
      h.choix.textContent = '';
      h.choix.classList.toggle('cache', !liste);
      if (!liste) return;
      liste.forEach((a, i) => {
        const b = el('button', { class: 'ex-choix-b' + (a.principal ? ' principal' : ''), type: 'button', role: 'menuitem' }, el('kbd', {}, String(i + 1)), el('span', {}, a.libelle));
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); choisir(i); });
        h.choix.append(b);
      });
    },
    // Zoom à trois crans : le cran courant est allumé.
    majZoom(cran) { [...h.zoom.children].forEach((b, i) => b.classList.toggle('on', i <= cran)); h.zoom.dataset.cran = cran; },
    // Vie / endurance : toujours visibles en combat, discrètes sinon (on les voit quand elles comptent)
    majVitaux(enCombat) {
      const p = G.player, pvMax = p.pvMax || 100, staMax = p.staMax || 100;
      const fpv = Math.max(0, Math.min(1, (p.pv ?? pvMax) / pvMax)), fsta = Math.max(0, Math.min(1, (p.sta ?? staMax) / staMax));
      fixer('pv', Math.round(fpv * 200), () => { h.pv.querySelector('i').style.width = (fpv * 100).toFixed(1) + '%'; h.pv.lastChild.textContent = Math.ceil(p.pv ?? pvMax); });
      fixer('sta', Math.round(fsta * 200), () => { h.sta.querySelector('i').style.width = (fsta * 100).toFixed(1) + '%'; });
      // traînée blanche qui rattrape la vie perdue
      const s = h.pv.querySelector('s'); const tr = h._trainee ?? fpv; h._trainee = tr > fpv ? tr - 0.004 : fpv;
      fixer('trainee', Math.round(h._trainee * 400), () => { s.style.width = (h._trainee * 100).toFixed(1) + '%'; });
      h.pv.classList.toggle('bas', fpv < 0.3);
      h.sta.classList.toggle('bas', (p.sta ?? staMax) < RX.COURSE_STA_MIN * 2);
      const discret = !enCombat && fpv > 0.98 && fsta > 0.98;
      fixer('discret', discret, (v) => h.etat.classList.toggle('discret', v));
    },
    majLampe(la) {
      h.lampe.classList.toggle('on', !!la);
      if (la && la.frac != null) fixer('lampe', Math.round(la.frac * 100), (v) => { h.lampe.lastChild.firstChild.style.width = v + '%'; });
    },
    // Guide d'objectif (ligne discrète en haut) : vers où aller, ici et maintenant.
    majGuide(txt) {
      fixer('guide', txt || '', (v) => { h.guide.lastChild.textContent = v; h.guide.classList.toggle('cache', !v); if (v) { h.guide.classList.remove('neuf'); void h.guide.offsetWidth; h.guide.classList.add('neuf'); } });
    },
    // Coéquipier : nom, où il est (étage, lieu), à terre ?
    majCoop(info) {
      const txt = info ? info.texte : '';
      fixer('coop', txt + (info && info.alerte ? '!' : ''), () => {
        h.coop.classList.toggle('cache', !info);
        h.coop.classList.toggle('alerte', !!(info && info.alerte));
        h.coop.textContent = txt;
      });
    },
    majMains(V, inv) {
      if (!inv || !inv.mains) return;
      const m = inv.mains(G.player), p = G.player;
      V.equipVu = { droite: m.droite, gauche: m.gauche, deux: m.deux, dos: p.equip.dos || null };
      const nom = (id) => (id ? (objet(id) || {}).nom || id : 'Main nue');
      const usure = (slot) => { const e = p.equipEtat && p.equipEtat[slot]; return e && e.durMax ? Math.max(0, Math.min(1, e.dur / e.durMax)) : null; };
      const mm = h.mains; mm.textContent = '';
      const ligneM = (cls, data, titre, txt, u, extra) => {
        const b = el('button', { class: 'ex-main ' + cls, type: 'button', 'data-m': data, title: titre }, el('small', {}, titre), el('span', {}, txt));
        if (u != null) b.append(el('i', { class: 'ex-usure' + (u < 0.2 ? ' bas' : '') }, el('b', { style: { width: Math.round(u * 100) + '%' } })));
        if (extra) b.append(extra);
        return b;
      };
      const d = m.droite ? objet(m.droite) : null;
      const balles = d && d.tir ? el('em', {}, `${(p.equipEtat.arme && p.equipEtat.arme.balles) || 0}/${d.tir.capacite}`) : null;
      const orig = (p.equipOrigine || {}).arme;
      const versOu = !m.droite ? '' : orig === 'dos' && !p.equip.dos ? ' ↩ dos' : (p.accesRapide || []).includes(m.droite) ? ' ↩ ceinture' : ' ↩ sac';
      mm.append(ligneM('droite', 'droite', (m.deux ? 'Deux mains' : 'Main droite') + versOu, nom(m.droite) + (m.uneMainPenalite ? ' (1 main)' : ''), usure('arme'), balles));
      if (!m.deux && m.gauche) mm.append(ligneM('gauche', 'echanger', 'Main gauche ⇄', nom(m.gauche), p.equip.mainG ? usure('mainG') : null));
      // le dos reste visible tant qu'on peut y remettre ce qu'on tient
      const peutDos = m.droite && inv.peutDos && inv.peutDos(m.droite);
      if (p.equip.dos) mm.append(ligneM('dos', 'dos', 'Dans le dos', nom(p.equip.dos), null));
      else if (peutDos) mm.append(ligneM('dos vide', 'dos', 'Dos libre', 'Mettre au dos', null));
      // ceinture : chaque case sort l'objet en main, ou l'y remet
      const ar = p.accesRapide || [];
      if (ar.length) {
        const ceint = el('div', { class: 'ex-ceinture', title: 'Ceinture (1-4)' });
        ar.forEach((id, i) => {
          const tenu = p.equip.arme === id || p.equip.mainG === id;
          ceint.append(el('button', { class: 'ex-ceint' + (tenu ? ' tenu' : ''), type: 'button', 'data-m': 'rapide' + i, title: (tenu ? 'Remettre à la ceinture : ' : 'Sortir : ') + nom(id) },
            el('kbd', {}, String(i + 1)), el('span', {}, nom(id))));
        });
        mm.append(ceint);
      }
    },
    majDegage(r) {
      if (!r) { if (!h.degage.classList.contains('cache')) h.degage.classList.add('cache'); return; }
      h.degage.classList.remove('cache');
      const txt = `Dégage-toi ! ${Math.floor(r.taps)} / ${r.requis}`;
      if (h.degage.textContent !== txt) h.degage.textContent = txt;
    },
  });
}
