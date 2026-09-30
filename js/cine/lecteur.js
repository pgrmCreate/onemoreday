// ============ Cinématiques — lecteur en parallaxe animée ============
//
// API
//   jouer(id, opts?)          → Promise<{ passe: boolean }>   joue CINEMATIQUES[id] (js/data/cinematiques.js)
//   jouerScript(def, opts?)   → Promise<{ passe: boolean }>   joue un script { musique?, plans: [...] } fourni tel quel
//   enCours()                 → boolean
//   arreter()                 → coupe la cinématique en cours (la promesse se résout avec { passe: true })
//   opts : { debut: { plan, t (ms) }, pause: bool (image figée, pour les captures), musique: bool (défaut true),
//            surFin: fn } — debut/pause servent au banc d'essai dev/cine.html.
//
// Format d'un plan (écrit par le scénariste) :
//   { decor, camera: { de: {x, y?, zoom}, vers: {x, y?, zoom} }, duree (ms), effets: [...], anim: [...],
//     texte, attendre (bouton « Continuer »), titre? (carton de titre) }
//   x, y ∈ [0,1] : position de la caméra dans la plage de défilement du décor (0 = bord gauche/haut) ;
//   zoom ≥ 1 : 1 = toute la hauteur du décor dans le cadre.
//
// Format d'un décor (js/cine/scenes/<id>.js) :
//   export default {
//     largeur: 2.4,                 // largeur du décor en cadres 2.39:1 (1 = plan fixe, pas de travelling)
//     fond: '#0b0b0c',              // couleur sous les couches
//     couches: [ { profondeur: 0..1, svg: (L, H) => '<g>…</g>' }, … ],   // du fond (0) au premier plan (1)
//     anims: { nom: (t, S) => { … } },   // t : secondes depuis l'apparition du décor
//     ambiance: ['nom', …],         // animations toujours actives (facultatif)
//     reglages: { fumee, braises, brouillard, lampe: [x,y], vent, … }   // teintes des effets globaux (facultatif)
//   }
//   Chaque couche est dessinée à SA largeur L (plus large quand elle est proche) et H = 1000 : un élément
//   placé à la fraction u de L s'aligne entre couches quand la caméra est en x = u. La parallaxe vient de là :
//   au même déplacement de caméra, une couche lointaine (étroite) glisse moins qu'une couche proche.
//   Au zoom, les couches lointaines grossissent moins que les proches (effet de travelling avant).
//   Une couche peut porter un `nom` : S.decaler(nom, dx, dy) la fait glisser d'un bloc (en unités du décor) sans
//   la redessiner — c'est le moyen le moins coûteux d'animer une foule, une voûte de feuillage, des nuages.
//   S (contexte d'animation) : { q(sel) → [éléments] (mis en cache), attr(el, nom, val), decaler(nom, dx, dy), p (avancement du plan),
//     tp (secondes depuis le début du plan), dt, plan, etat (objet libre, propre au décor), couches: [{ L, el }] }.
//
// Effets globaux (js/cine/effets.js) : grain, vignette_pulse, flash_rouge, fondu_noir, fondu_blanc, fumee, braises,
//   cendres, poussiere, mistral, chaleur, lueur_lampe, brouillard_bas, etoiles, secousse, pluie.

import { chargerDecor } from './scenes/index.js';
import { creerEffets } from './effets.js';
import { H, F, RATIO } from './lib.js';

let courant = null;
let genrerFn = t => t;
const genrerPret = import('../core/state.js').then(m => { if (m && typeof m.genrer === 'function') genrerFn = m.genrer; }).catch(() => {});

export function enCours() { return !!courant; }
export function arreter() { if (courant) courant.finir(true); }

export async function jouer(id, opts = {}) {
  let CINEMATIQUES = {};
  try { ({ CINEMATIQUES } = await import('../data/cinematiques.js')); } catch (e) { console.warn('[cine] scripts introuvables', e); }
  const def = CINEMATIQUES[id];
  if (!def || !Array.isArray(def.plans) || !def.plans.length) { console.warn('[cine] cinématique inconnue :', id); return { passe: true }; }
  return jouerScript(def, opts);
}

const easeCam = t => { t = Math.max(0, Math.min(1, t)); return t - Math.sin(2 * Math.PI * t) / (2 * Math.PI) * 0.72; };
const lerp = (a, b, t) => a + (b - a) * t;
const vitesse = p => (p <= 1 ? 0.07 + 0.93 * p : p);
const facteurZoom = p => 0.3 + 0.7 * Math.min(1.2, p);
function cameraPlan(plan) {
  const c = plan.camera || {}; const de = c.de || { x: 0.5, zoom: 1 }; const vers = c.vers || de;
  const n = o => ({ x: o.x ?? 0.5, y: o.y ?? 0.5, zoom: Math.max(1, o.zoom ?? 1) });
  return { de: n(de), vers: n(vers) };
}

// La feuille de style du lecteur est ajoutée d'office si la page ne l'a pas déjà liée.
function assurerStyle() {
  try {
    if (document.querySelector('link[data-cine], link[href$="css/cine.css"]')) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.cine = '1';
    l.href = new URL('../../css/cine.css', import.meta.url).href;
    document.head.appendChild(l);
  } catch (e) {}
}

export function jouerScript(def, opts = {}) {
  if (courant) courant.finir(true);
  assurerStyle();
  return new Promise(resolve => {
    const plans = def.plans.filter(p => p && typeof p === 'object');
    if (!plans.length) { resolve({ passe: true }); return; }

    // ---------- DOM ----------
    const racine = document.createElement('div');
    racine.className = 'cine-racine';
    racine.innerHTML = `
      <div class="cine-cadre">
        <div class="cine-monde"></div>
        <canvas class="cine-effets"></canvas>
        <div class="cine-vignette"></div>
        <div class="cine-teinte"></div>
        <div class="cine-voile"></div>
        <div class="cine-rideau"></div>
        <div class="cine-titre"><div class="cine-titre-sur"></div><div class="cine-titre-grand"></div></div>
      </div>
      <div class="cine-soustitre" aria-live="polite"></div>
      <button class="cine-passer" type="button" aria-label="Passer la cinématique"><span class="cine-passer-anneau"></span>Passer</button>
      <button class="cine-continuer" type="button">Continuer</button>
      <div class="cine-noir"></div>`;
    document.body.appendChild(racine);
    const $ = s => racine.querySelector(s);
    const cadre = $('.cine-cadre'), monde = $('.cine-monde'), canvas = $('.cine-effets');
    const rideau = $('.cine-rideau'), titre = $('.cine-titre'), sous = $('.cine-soustitre');
    const btnPasser = $('.cine-passer'), btnCont = $('.cine-continuer'), noir = $('.cine-noir');
    const effets = creerEffets({ canvas, vignette: $('.cine-vignette'), teinte: $('.cine-teinte'), voile: $('.cine-voile'), monde });

    // ---------- État ----------
    const decors = new Map(); // id → module de décor
    let fw = 0, fh = 0;
    let decorCourant = null; // { id, def, couches: [{ p, L, el, sMax }], cache, etat, t0 }
    let iPlan = -1, tPlan = 0, tDecor = 0, tGlobal = 0;
    let phase = 'charge'; // charge | jeu | attente | transition | fin
    let rideauO = 1, rideauCible = 1, rideauVitesse = 2;
    let transition = null; // { versPlan, etape }
    let mots = [], motsVisibles = 0, motPas = 0.12, texteT = 0;
    let titreT = -1, titreDef = null;
    let raf = 0, dernier = 0, fini = false;
    let appui = null;
    const pause = !!opts.pause;

    // ---------- Mise en page (letterbox 2.39:1) ----------
    function mettreEnPage() {
      const vw = racine.clientWidth || window.innerWidth, vh = racine.clientHeight || window.innerHeight;
      fw = Math.min(vw, vh * RATIO); fh = fw / RATIO;
      if (fh > vh) { fh = vh; fw = fh * RATIO; }
      fw = Math.round(fw); fh = Math.round(fh);
      const top = Math.round((vh - fh) / 2), left = Math.round((vw - fw) / 2);
      Object.assign(cadre.style, { width: fw + 'px', height: fh + 'px', top: top + 'px', left: left + 'px' });
      racine.style.setProperty('--cine-fh', fh + 'px');
      racine.style.setProperty('--cine-barre', top + 'px');
      racine.classList.toggle('cine-barres-larges', top >= 78);
      effets.taille(fw, fh);
      if (decorCourant) dimensionnerCouches(decorCourant);
    }
    function dimensionnerCouches(d) {
      const k = fh / H;
      for (const c of d.couches) {
        c.el.setAttribute('width', Math.ceil(c.L * k * c.sMax));
        c.el.setAttribute('height', Math.ceil(H * k * c.sMax));
      }
    }

    // ---------- Décors ----------
    function construireDecor(id) {
      const mod = decors.get(id);
      const largeur = Math.max(1, mod.largeur || 2.2);
      const Wd = largeur * F;
      const zMax = Math.max(1, ...plans.filter(p => p.decor === id).map(p => { const c = cameraPlan(p); return Math.max(c.de.zoom, c.vers.zoom); }));
      monde.textContent = '';
      monde.style.background = mod.fond || '#0b0b0c';
      const couches = [];
      for (const cd of mod.couches || []) {
        const p = Math.max(0, cd.profondeur ?? 0.5);
        const L = Math.round(F + (Wd - F) * vitesse(p));
        let contenu = '';
        try { contenu = cd.svg(L, H); } catch (e) { console.warn('[cine] couche en erreur dans', id, e); }
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        el.setAttribute('viewBox', `0 0 ${L} ${H}`);
        el.setAttribute('preserveAspectRatio', 'none');
        el.setAttribute('class', 'cine-couche');
        el.innerHTML = contenu;
        monde.appendChild(el);
        const sMax = 1 + (zMax * 1.04 - 1) * facteurZoom(p);
        couches.push({ p, L, el, sMax, nom: cd.nom || null, dx: 0, dy: 0 });
      }
      decorCourant = { id, def: mod, couches, cache: new Map(), etat: {}, erreurs: new Set() };
      dimensionnerCouches(decorCourant);
      tDecor = 0;
    }
    function contexte(d, dt, plan, p, tp) {
      return {
        q(sel) { let r = d.cache.get(sel); if (!r) { r = Array.from(monde.querySelectorAll(sel)); d.cache.set(sel, r); } return r; },
        // Décale une couche entière (par son nom ou son index) : transformation composée par le GPU, sans
        // redessiner le SVG — à préférer pour faire glisser une foule, une voûte, des nuages.
        decaler(nom, dx, dy = 0) { const c = typeof nom === 'number' ? d.couches[nom] : d.couches.find(k => k.nom === nom); if (c) { c.dx = dx; c.dy = dy; } },
        attr(el, n, v) { if (el.__a === undefined) el.__a = {}; if (el.__a[n] !== v) { el.__a[n] = v; el.setAttribute(n, v); } },
        p, tp, dt, plan, etat: d.etat, couches: d.couches,
      };
    }

    // ---------- Caméra ----------
    function placerCamera(plan, p, apres) {
      const d = decorCourant; if (!d) return;
      const c = cameraPlan(plan);
      const e = easeCam(p);
      let x = lerp(c.de.x, c.vers.x, e), y = lerp(c.de.y, c.vers.y, e), zoom = lerp(c.de.zoom, c.vers.zoom, e);
      // Après la fin du mouvement (plan « attendre ») : la caméra respire encore un peu.
      if (apres > 0) zoom *= 1 + 0.035 * (1 - Math.exp(-apres / 6));
      const k = fh / H;
      for (const cc of d.couches) {
        const s = 1 + (zoom - 1) * facteurZoom(cc.p);
        const lw = cc.L * k * s, lh = H * k * s;
        const ox = -(lw - fw) * Math.max(0, Math.min(1, x)) + cc.dx * k * s, oy = -(lh - fh) * Math.max(0, Math.min(1, y)) + cc.dy * k * s;
        cc.el.style.transform = `translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${(s / cc.sMax).toFixed(5)})`;
      }
      return { px: x * fw * 0.8 };
    }

    // ---------- Texte ----------
    function preparerTexte(texte, duree) {
      sous.classList.remove('visible');
      sous.textContent = '';
      mots = []; motsVisibles = 0; texteT = 0;
      if (!texte) return;
      const t = genrerFn(String(texte));
      const p = document.createElement('p');
      for (const m of t.split(/\s+/).filter(Boolean)) {
        const s = document.createElement('span'); s.className = 'cine-mot'; s.textContent = m;
        p.appendChild(s); p.appendChild(document.createTextNode(' '));
        mots.push(s);
      }
      sous.appendChild(p);
      sous.classList.add('visible');
      motPas = Math.max(0.07, Math.min(0.2, (duree / 1000) * 0.42 / Math.max(1, mots.length)));
    }
    function revelerTout() { for (let i = motsVisibles; i < mots.length; i++) mots[i].classList.add('vu'); motsVisibles = mots.length; }
    function avancerTexte(dt) {
      if (motsVisibles >= mots.length) return;
      texteT += dt;
      const delai = 0.55;
      while (motsVisibles < mots.length && texteT - delai > motsVisibles * motPas) { mots[motsVisibles].classList.add('vu'); motsVisibles++; }
    }
    function preparerTitre(t) {
      titreDef = t || null; titreT = t ? 0 : -1;
      titre.classList.remove('visible');
      if (!t) return;
      const txt = genrerFn(String(t));
      const [a, b] = txt.includes(' — ') ? txt.split(' — ') : ['', txt];
      $('.cine-titre-sur').textContent = a; $('.cine-titre-grand').textContent = b;
      titre.classList.toggle('principal', !a);
    }

    // ---------- Enchaînement des plans ----------
    function memeCadrage(a, b) {
      if (!a || !b || a.decor !== b.decor) return false;
      const ca = cameraPlan(a).vers, cb = cameraPlan(b).de;
      return Math.abs(ca.x - cb.x) < 0.03 && Math.abs(ca.y - cb.y) < 0.03 && Math.abs(ca.zoom - cb.zoom) < 0.04;
    }
    function demarrerPlan(i, tDebut = 0) {
      iPlan = i; tPlan = tDebut;
      const plan = plans[i];
      if (!decorCourant || decorCourant.id !== plan.decor) { construireDecor(plan.decor); effets.regler(plan.effets || [], decorCourant.def.reglages); effets.immediat(); }
      else effets.regler(plan.effets || [], decorCourant.def.reglages);
      preparerTexte(plan.texte, plan.duree || 6000);
      preparerTitre(plan.titre);
      btnCont.classList.remove('visible');
      phase = 'jeu';
      if (tDebut > 0) { texteT = tDebut / 1000; tDecor = tDebut / 1000; if (titreDef) titreT = tDebut / 1000; }
    }
    function planSuivant() {
      if (phase === 'transition' || phase === 'fin') return;
      const suivant = iPlan + 1;
      if (suivant >= plans.length) { terminer(false); return; }
      const a = plans[iPlan], b = plans[suivant];
      if (memeCadrage(a, b) && !(a.effets || []).includes('fondu_noir') && !(a.effets || []).includes('fondu_blanc')) { demarrerPlan(suivant); return; }
      // Fondu par le noir (ou le blanc si le plan finit dans le blanc).
      const blanc = (a.effets || []).includes('fondu_blanc');
      rideau.style.background = blanc ? '#f4f1ea' : '#000';
      const long = a.decor !== b.decor;
      phase = 'transition';
      transition = { versPlan: suivant, etape: 'sortie' };
      rideauCible = 1; rideauVitesse = long ? 1.9 : 3;
      sous.classList.remove('visible');
      titre.classList.remove('visible');
      btnCont.classList.remove('visible');
    }
    function terminer(passe) {
      if (fini) return;
      phase = 'fin'; fini = true;
      sous.classList.remove('visible'); titre.classList.remove('visible'); btnCont.classList.remove('visible');
      noir.classList.add('visible');
      setTimeout(() => nettoyer(passe), passe ? 380 : 900);
    }
    function nettoyer(passe) {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', mettreEnPage);
      window.removeEventListener('keydown', clavier, true);
      effets.detruire();
      racine.remove();
      courant = null;
      try { opts.surFin && opts.surFin({ passe }); } catch (e) {}
      resolve({ passe });
    }

    // ---------- Boucle ----------
    function boucle(now) {
      raf = requestAnimationFrame(boucle);
      let dt = dernier ? Math.min(0.05, (now - dernier) / 1000) : 0;
      dernier = now;
      if (pause) dt = 0;
      tGlobal += dt;
      if (phase === 'charge') return;
      const plan = plans[iPlan];
      const duree = Math.max(500, plan.duree || 6000);
      tPlan += dt * 1000; tDecor += dt;

      // Rideau (transitions).
      if (rideauO !== rideauCible) {
        rideauO = rideauCible > rideauO ? Math.min(rideauCible, rideauO + dt * rideauVitesse) : Math.max(rideauCible, rideauO - dt * rideauVitesse);
        rideau.style.opacity = rideauO.toFixed(3);
      }
      if (phase === 'transition' && transition) {
        if (transition.etape === 'sortie' && rideauO >= 1) {
          demarrerPlan(transition.versPlan);
          transition.etape = 'entree'; rideauCible = 0; rideauVitesse = 1.5;
          phase = 'transition';
        } else if (transition.etape === 'entree') { transition = null; phase = 'jeu'; }
      }

      const p = Math.min(1, tPlan / duree);
      const apres = Math.max(0, (tPlan - duree) / 1000);
      const cam = placerCamera(plan, p, apres);

      // Animations du décor.
      const d = decorCourant;
      if (d) {
        const noms = new Set([...(d.def.ambiance || []), ...(plan.anim || [])]);
        const S = contexte(d, dt, plan, p, tPlan / 1000);
        for (const n of noms) {
          const f = d.def.anims && d.def.anims[n];
          if (typeof f !== 'function' || d.erreurs.has(n)) continue;
          try { f(tDecor, S); } catch (e) { d.erreurs.add(n); console.warn('[cine] animation en erreur :', d.id, n, e); }
        }
      }
      effets.frame(dt, tGlobal, cam, p);

      if (phase !== 'transition' || (transition && transition.etape === 'entree')) avancerTexte(dt);
      if (titreDef && titreT >= 0) {
        titreT += dt;
        if (titreT > 0.8 && !titre.classList.contains('visible') && phase !== 'transition') titre.classList.add('visible');
        const tenue = plan.attendre && !plan.texte ? Infinity : Math.max(2.8, duree / 1000 * 0.55);
        if (titreT > tenue) { titre.classList.remove('visible'); titreT = -1; }
      }

      if (phase === 'jeu') {
        if (plan.attendre) {
          if (p >= 0.9 && !btnCont.classList.contains('visible')) { btnCont.classList.add('visible'); phase = 'attente'; revelerTout(); }
        } else if (tPlan >= duree) planSuivant();
      }
    }

    // ---------- Commandes ----------
    function continuer() {
      if (phase === 'attente') { btnCont.classList.remove('visible'); phase = 'jeu'; planSuivantForce(); }
      else if (phase === 'jeu' && motsVisibles < mots.length) revelerTout();
    }
    function planSuivantForce() { phase = 'jeu'; planSuivant(); }
    function clavier(e) {
      if (!courant) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); terminer(true); }
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); continuer(); }
    }
    btnPasser.addEventListener('click', e => { e.stopPropagation(); terminer(true); });
    btnCont.addEventListener('click', e => { e.stopPropagation(); continuer(); });
    // Toucher long (≈ 0,9 s) n'importe où : passer. Toucher court : révéler tout le sous-titre.
    racine.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      const debut = performance.now();
      const suivre = () => {
        if (!appui) return;
        const k = Math.min(1, (performance.now() - debut) / 900);
        btnPasser.style.setProperty('--appui', k.toFixed(3));
        if (k >= 1) { appui = null; terminer(true); return; }
        appui.raf = requestAnimationFrame(suivre);
      };
      appui = { raf: requestAnimationFrame(suivre), debut };
      btnPasser.classList.add('appui');
    });
    const relacher = () => {
      if (!appui) return;
      cancelAnimationFrame(appui.raf);
      const court = performance.now() - appui.debut < 300;
      appui = null; btnPasser.classList.remove('appui'); btnPasser.style.setProperty('--appui', '0');
      if (court && phase === 'jeu') revelerTout();
    };
    racine.addEventListener('pointerup', relacher);
    racine.addEventListener('pointercancel', relacher);
    racine.addEventListener('pointerleave', relacher);
    racine.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', clavier, true);
    window.addEventListener('resize', mettreEnPage);

    courant = { finir: passe => terminer(passe) };

    // ---------- Démarrage ----------
    mettreEnPage();
    if (opts.musique !== false && def.musique) {
      import('../audio.js').then(m => { try { m.playAmbiance && m.playAmbiance(def.musique); } catch (e) {} }).catch(() => {});
    }
    raf = requestAnimationFrame(boucle);
    const ids = [...new Set(plans.map(p => p.decor))];
    Promise.all([genrerPret, ...ids.map(id => chargerDecor(id).then(m => decors.set(id, m)))]).then(() => {
      if (fini) return;
      const debut = opts.debut || {};
      const i0 = Math.max(0, Math.min(plans.length - 1, debut.plan || 0));
      demarrerPlan(i0, debut.t || 0);
      if (pause) {
        rideauO = rideauCible = 0; rideau.style.opacity = '0';
        revelerTout();
        if (titreDef) titre.classList.add('visible');
        if (plans[i0].attendre && (debut.t || 0) >= (plans[i0].duree || 6000) * 0.9) btnCont.classList.add('visible');
      } else { rideauCible = 0; rideauVitesse = 1.2; }
    });
  });
}
