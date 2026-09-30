// ============ Les cours de Salon — briques communes ============
// salon_marche, salon_mercredi, salon_mistral_vide, cours_troupeau et cours_nuit partagent la même rue
// (mêmes graines : mêmes façades, mêmes platanes) sous des lumières différentes. Repère : H = 1000,
// trottoir du fond à y = 700, alignement des platanes à y = 800, étals à y = 885, premier plan à y ≈ 1000.
import { tourHorloge, alea, ciel, halo, nuages, rangee, emperi, voute, platane, rayons, brume, sol, mix, sombre, clair, r1, etoiles, lune, H } from '../lib.js';

// Palette « matin de marché » par défaut ; chaque décor en surcharge une partie.
export const MATIN = {
  ciel: [[0, '#6f9fc8'], [0.45, '#a9c9de'], [0.8, '#e5e0cc'], [1, '#f1e4c4']],
  soleil: [0.18, 120, '#fff4d6', 0.55],
  nuages: '#ffffff', nuagesO: 0.35,
  lointain: '#9fb0bb', rocher: '#b3b7ae',
  tonalite: null, nuit: 0, lumiere: 0,
  voileFond: ['#e9e2cf', 0.22],
  feuille: ['#3e5226', '#5d7532', '#8aa64c'], tronc: '#a59c80', taches: ['#6f6a55', '#d6cfb0', '#857d63'],
  sol: [[0, '#cdbd9c'], [0.25, '#a99a80'], [1, '#6e6456']],
  rayons: '#fff2c8', tachesSol: '#f6e3b4', trous: '#d8e6ea',
  enseignes: true,
};

export function coucheCiel(P, graine = 'cours') {
  return (L) => {
    let s = ciel(L, P.ciel);
    if (P.etoiles) s += etoiles(L, 520, Math.round(L / 9), graine + 'e');
    if (P.lune) s += lune(P.lune[0] * L, P.lune[1], P.lune[2] || 26);
    if (P.soleil) s += halo(P.soleil[0] * L, P.soleil[1], 900, 520, P.soleil[2], P.soleil[3]);
    if (P.nuages) s += nuages(L, 60, 330, Math.round(L / 260), graine + 'n', P.nuages, P.nuagesO, P.ventreNuages || null, 'nuages-ciel');
    // Collines lointaines et rocher de l'Empéri au-dessus des toits.
    s += `<path d="M-20 520Q${L * 0.2} 470 ${L * 0.4} 505T${L * 0.8} 490T${L + 20} 510V700H-20Z" fill="${P.lointain}" opacity="0.65"/>`;
    s += emperi(L * (P.uEmperi || 0.62), 470, 560, { roc: P.rocher, mur: mix(P.rocher, P.lointain, 0.2), fenetreAllumee: P.fenetreEmperi, graine });
    if (P.torches) {
      for (const dx of [-0.36, -0.2, 0.05, 0.3, 0.42]) s += `<g class="torche-emperi">${halo(L * (P.uEmperi || 0.62) + dx * 560, 330 + Math.abs(dx) * 60, 40, 40, '#f4a23c', 0.8)}<circle cx="${r1(L * (P.uEmperi || 0.62) + dx * 560)}" cy="${r1(330 + Math.abs(dx) * 60)}" r="4" fill="#ffd98a"/></g>`;
    }
    s += brume(L, 380, 720, P.voileFond[0], 0, P.voileFond[1] * 1.2, P.voileFond[1] * 0.4);
    return s;
  };
}

export function coucheFacades(P, graine = 'cours') {
  return (L) => {
    const rnd = alea(graine + 'fac');
    const ens = P.enseignes ? [
      { u: 0.12, txt: 'CAFÉ DES ARTS', o: { store: ['#7a2a22', '#e9dfc8'] } },
      { u: 0.33, txt: 'TABAC', o: { couleurEnseigne: '#d24a3a' } },
      { u: 0.52, txt: 'PHARMACIE', o: { croix: true, croixAllumee: P.croixAllumee } },
      { u: 0.74, txt: 'BOULANGERIE', o: {} },
      { u: 0.9, txt: 'PRESSE', o: {} },
    ] : [];
    let s = sol(L, 690, P.sol);
    s += rangee(L, 705, rnd, { enseignes: ens, nuit: P.nuit, lumiere: P.lumiere, tonalite: P.tonalite, hMin: 330, hMax: 470, vitrineAllumee: P.vitrines, couleurLumiere: P.couleurLumiere });
    // Trottoir du fond et bordure.
    s += `<rect x="-5" y="703" width="${L + 10}" height="16" fill="${sombre(P.sol[0][1], 0.18)}"/><rect x="-5" y="719" width="${L + 10}" height="5" fill="${clair(P.sol[0][1], 0.15)}"/>`;
    if (P.tour) s += tourHorloge(L * P.tour, 712, 760, { pierre: P.pierreTour || '#c9b28a', cadran: P.cadran || '#ece6d2' });
    if (P.voileFond) s += `<rect x="-5" y="200" width="${L + 10}" height="530" fill="${P.voileFond[0]}" opacity="${P.voileFond[1]}"/>`;
    return s;
  };
}

// Platanes : troncs à y = 800, voûte en haut du cadre. Rend aussi les puits de lumière.
export function couchePlatanes(P, graine = 'cours', { nu = false, voute: avecVoute = true } = {}) {
  return (L) => {
    const rnd = alea(graine + 'pla');
    let s = '';
    if (P.rayons) s += rayons(L, rnd, Math.round(L / 420), P.rayons, P.rayonsO || 0.13, 0.32, 0, 900);
    const fe = P.feuille;
    for (let x = 120 + rnd() * 100; x < L + 100; x += 480 + rnd() * 120) {
      s += `<g class="arbre" data-x="${r1(x)}" data-y="800">` + platane(x, 800, 1150 + rnd() * 150, rnd, { tronc: P.tronc, taches: P.taches, feuille: fe, fut: 0.5, large: 0.45, nu }) + '</g>';
    }
    if (!nu && avecVoute) s += `<g class="voute-g">${voute(L, P.vouteH || 250, rnd, [fe[0], fe[1], P.voutePercee || fe[2]], { trous: P.trous })}</g>`;
    // Taches de soleil au sol.
    if (P.tachesSol) {
      let d = '';
      for (let i = 0; i < L / 90; i++) { const x = rnd() * L, y = 790 + rnd() * 70, w = 30 + rnd() * 90; d += `M${r1(x)} ${r1(y)}a${r1(w)} ${r1(w * 0.18)} 0 1 0 0.1 0z`; }
      s += `<path class="taches-sol" d="${d}" fill="${P.tachesSol}" opacity="0.33"/>`;
    }
    return s;
  };
}
// La voûte seule (à mettre dans sa propre couche nommée 'voute', même profondeur que les platanes).
export function coucheVoute(P, graine = 'cours') {
  return (L) => { const rnd = alea(graine + 'vou'); const fe = P.feuille; return `<g class="voute-g">${voute(L, P.vouteH || 250, rnd, [fe[0], fe[1], P.voutePercee || fe[2]], { trous: P.trous })}</g>`; };
}
export { H };
