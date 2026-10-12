// ============ Personnages vus de dessus, animés : vivants (joueur, coéquipier, PNJ) et morts ============
// Vivants : torse (vêtement du dessus et ses détails), tête (coiffure mèche à mèche, capuche), mains et chaussures peints
// une fois en sprites (./corps.js) ; à chaque image : ombre, jambes (cycle de marche), sac, bras à coude, arme, lampe.
// Tout est dessiné dans le repère du personnage (il regarde vers +x), à l'échelle du monde (1 case = TS px).
//   dessinerHumain(c, x, y, dir, P, A)   P = apparence, A = animation (voir plus bas)
//   dessinerMort, dessinerCadavre        les morts : voir ./morts.js (réexportés ici)
import { TS, rr, cercle, ellipse, teinte, hash, graine, rng, clamp, hex as hexRgb } from './outils.js';
import { mul as mulC, css as rgbC, mix as mixC, entre, TAU, volume, contourTorse, coude, sprite, dessinerOmbre } from './corps.js';

const PI = Math.PI;
const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ---------- Armes : forme dessinée selon l'objet tenu ----------
export function formeArme(id) {
  if (!id) return null;
  if (/pistolet|revolver/.test(id)) return 'pistolet';
  if (/fusil|carabine|arbalete/.test(id)) return 'fusil';
  if (/couteau|tournevis|poignard|ciseaux/.test(id)) return 'couteau';
  if (/machette|sabre/.test(id)) return 'machette';
  if (/batte/.test(id)) return 'batte';
  if (/hache/.test(id)) return 'hache';
  if (/pelle/.test(id)) return 'pelle';
  if (/masse|marteau_lourd/.test(id)) return 'masse';
  if (/marteau|cle_a_molette|tonfa/.test(id)) return 'marteau';
  if (/lance/.test(id)) return 'lance';
  if (/pied_de_biche|tuyau|barre|matraque|canne/.test(id)) return 'barre';
  if (/lampe/.test(id)) return 'lampe';
  return 'objet';
}
const DEUX_MAINS = new Set(['batte', 'hache', 'pelle', 'masse', 'lance', 'fusil']);
const LONGUEUR = { couteau: 11, machette: 22, batte: 28, hache: 26, pelle: 25, masse: 28, marteau: 15, lance: 40, barre: 26, pistolet: 10, fusil: 30, lampe: 9, objet: 10 };

function dessinerArme(c, forme, L) {
  c.lineCap = 'round';
  switch (forme) {
    case 'couteau': c.fillStyle = '#2a1e14'; rr(c, -2, -1.6, 5, 3.2, 1); c.fill(); c.fillStyle = '#c8ccd0'; c.beginPath(); c.moveTo(3, -1.4); c.lineTo(L, 0); c.lineTo(3, 1.4); c.closePath(); c.fill(); break;
    case 'machette': c.fillStyle = '#2a1e14'; rr(c, -3, -1.8, 7, 3.6, 1); c.fill(); c.fillStyle = '#9aa0a4'; c.beginPath(); c.moveTo(4, -1.6); c.lineTo(L, -2.6); c.quadraticCurveTo(L + 2, 0, L - 2, 2.4); c.lineTo(4, 1.8); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(6, -1.4, L - 8, 0.8); break;
    case 'batte': c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L * 0.5, 0); c.stroke(); c.lineWidth = 5.5; c.strokeStyle = '#8a6a3e'; c.beginPath(); c.moveTo(L * 0.45, 0); c.lineTo(L, 0); c.stroke(); break;
    case 'hache': c.strokeStyle = '#5a3e24'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L, 0); c.stroke(); c.fillStyle = '#9a1e1e'; c.beginPath(); c.moveTo(L - 7, -1.5); c.lineTo(L - 2, -9); c.lineTo(L + 3, -7); c.lineTo(L, -1.5); c.closePath(); c.fill(); c.fillStyle = '#c0c4c8'; c.fillRect(L - 3, -9, 4, 2); break;
    case 'pelle': {
      // manche clair cerné de sombre, poignée en D, lame d'acier claire avec son reflet : lisible sur tous les sols
      // (dessinée à l'échelle d'une vraie pelle : lame ≈ 22 cm de large, poignée en D)
      c.strokeStyle = 'rgba(20,14,8,0.85)'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L - 6, 0); c.stroke();
      c.strokeStyle = '#b08a52'; c.lineWidth = 2.1; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L - 6, 0); c.stroke();
      c.strokeStyle = '#2a2a2c'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(-5.6, 0, 1.9, 2.5, 0, 0, PI * 2); c.stroke();
      c.beginPath(); c.moveTo(L - 8, -4.6); c.lineTo(L + 1.8, -5.1); c.quadraticCurveTo(L + 5.4, 0, L + 1.8, 5.1); c.lineTo(L - 8, 4.6); c.quadraticCurveTo(L - 9.4, 0, L - 8, -4.6); c.closePath();
      c.fillStyle = '#a9b1b5'; c.fill(); c.strokeStyle = '#1c1e20'; c.lineWidth = 0.9; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(L - 6, -3.6, 6, 1.2);
      c.fillStyle = '#5a5e62'; rr(c, L - 9.5, -1.5, 3.8, 3, 0.8); c.fill();
      break;
    }
    case 'masse': c.strokeStyle = '#5a3e24'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L, 0); c.stroke(); c.fillStyle = '#4a4e52'; rr(c, L - 3, -6, 8, 12, 1.5); c.fill(); break;
    case 'marteau': c.strokeStyle = '#5a3e24'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-3, 0); c.lineTo(L, 0); c.stroke(); c.fillStyle = '#5a5e62'; rr(c, L - 2, -4.5, 5, 9, 1); c.fill(); break;
    case 'lance': c.strokeStyle = '#6a5034'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-8, 0); c.lineTo(L, 0); c.stroke(); c.fillStyle = '#b8bcc0'; c.beginPath(); c.moveTo(L - 2, -2.4); c.lineTo(L + 7, 0); c.lineTo(L - 2, 2.4); c.closePath(); c.fill(); break;
    case 'barre': c.strokeStyle = '#5e6266'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L, 0); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -1); c.lineTo(L, -1); c.stroke(); if (L > 20) { c.strokeStyle = '#5e6266'; c.lineWidth = 3; c.beginPath(); c.moveTo(L, 0); c.lineTo(L + 3, 4); c.stroke(); } break;
    case 'pistolet': c.fillStyle = '#18181a'; rr(c, -1, -2.6, L + 2, 5.2, 1.2); c.fill(); c.fillStyle = '#2c2c30'; c.fillRect(-2, 1, 4, 4); break;
    case 'fusil': c.fillStyle = '#4a3220'; rr(c, -10, -2.6, 14, 5.2, 2); c.fill(); c.fillStyle = '#1c1c1e'; c.fillRect(2, -1.8, L, 3.6); break;
    case 'lampe': c.fillStyle = '#2a2a2c'; rr(c, -2, -2.4, L, 4.8, 1.5); c.fill(); c.fillStyle = '#f2e6b8'; c.fillRect(L - 2, -2, 2, 4); break;
    default: c.fillStyle = '#6a5a4a'; rr(c, -2, -2, L, 4, 1.5); c.fill();
  }
}

// ---------- Sacs : chacun se voit comme il se porte — TOUJOURS dans le dos ----------
// port : 'dos' (sac à dos), 'cube' (sac de livreur), 'hotte' (osier), 'gilet' (trail : flasques sur la poitrine),
//        'bandouliere' (dans le dos, à peine sur le côté, sangle en travers du torse), 'epaule' (sac de sport, de voyage,
//        tote bag : passé à l'épaule, il pend dans le dos, un peu de côté), 'main' (cabas, cartable : portés en bandoulière,
//        dans le dos, un peu de côté), 'valise' (tirée derrière soi), 'banane' (passée dans le dos, ceinture devant).
// l : largeur (le long des épaules), p : épaisseur, coul, détails (rabat, poches, molle, matelas, cadre, corde, bande, motif).
export const SACS = {
  sac_a_dos: { port: 'dos', l: 15, p: 7, coul: '#34465e', rabat: 1 },
  sac_enfant: { port: 'dos', l: 11, p: 5, coul: '#c2503a', rabat: 1, motif: '#e8c84a' },
  sac_randonnee: { port: 'dos', l: 17, p: 10, coul: '#4f6030', rabat: 1, poches: 1, matelas: '#2e6a8a' },
  sac_militaire: { port: 'dos', l: 18, p: 10, coul: '#4b5236', molle: 1, poches: 1 },
  sac_alpinisme: { port: 'dos', l: 15, p: 12, coul: '#b0402a', rabat: 1, corde: '#d8c050' },
  sac_expedition: { port: 'dos', l: 19, p: 13, coul: '#cc7420', poches: 1, matelas: '#3a3a3a', cadre: 1 },
  sac_police: { port: 'dos', l: 17, p: 9, coul: '#1e2430', molle: 1, bande: '#c8ccd2' },
  sac_samu: { port: 'dos', l: 17, p: 9, coul: '#b8322a', bande: '#e0e0d4', poches: 1 },
  sac_jute: { port: 'dos', l: 16, p: 11, coul: '#9a7e52', informe: 1 },
  sac_fortune: { port: 'dos', l: 13, p: 8, coul: '#5a5248', informe: 1 },
  sac_livreur: { port: 'cube', l: 20, p: 17, coul: '#25a39a' },
  hotte_vendange: { port: 'hotte', l: 17, p: 14, coul: '#8a6a3a' },
  sac_trail: { port: 'gilet', l: 12, p: 4, coul: '#2a6a9a' },
  sacoche: { port: 'bandouliere', l: 10, p: 6, coul: '#5a3e28' },
  musette: { port: 'bandouliere', l: 11, p: 7, coul: '#5a5e3a' },
  gibeciere: { port: 'bandouliere', l: 12, p: 7, coul: '#6a4a2a', frange: 1 },
  sacoche_facteur: { port: 'bandouliere', l: 13, p: 7, coul: '#2e4a7a', bande: '#d8b030' },
  sac_photo: { port: 'bandouliere', l: 10, p: 8, coul: '#262628' },
  sac_ordinateur: { port: 'bandouliere', l: 14, p: 4, coul: '#2c2e32' },
  sac_isotherme: { port: 'bandouliere', l: 12, p: 8, coul: '#2a5a8a' },
  sac_main: { port: 'epaule', l: 9, p: 5, coul: '#6a2a2a' },
  tote_bag: { port: 'epaule', l: 11, p: 3, coul: '#d6cab0' },
  sac_sport: { port: 'epaule', l: 16, p: 8, coul: '#1e1e22', bande: '#c02a2a' },
  sac_voyage: { port: 'epaule', l: 18, p: 9, coul: '#4a3a2a' },
  cabas_courses: { port: 'main', l: 12, p: 6, coul: '#3a7a4a' },
  cartable_cuir: { port: 'main', l: 13, p: 4, coul: '#6a3e1e' },
  valise_cabine: { port: 'valise', l: 14, p: 9, coul: '#2a3a4a' },
  sac_banane: { port: 'banane', l: 9, p: 4, coul: '#2a2a2a' },
};
const sacDe = (s) => (!s ? null : s === true ? SACS.sac_a_dos : SACS[s] || (/sac|sacoche/.test(s) ? SACS.sac_a_dos : null));
// Ce qui passe DERRIÈRE le torse (dos, hanche, valise)
function sacArriere(c, S, bal, m, ph) {
  const sw = Math.sin(ph) * 0.8 * m;     // le sac ballotte un peu en marchant
  c.save(); c.translate(0, bal * 0.6);
  switch (S.port) {
    case 'dos': case 'cube': case 'hotte': {
      const x1 = -6, x0 = x1 - 4 - S.p, y0 = -S.l / 2 + sw * 0.4;
      if (S.matelas) { c.fillStyle = teinte(S.matelas, 0.9); rr(c, x0 - 4, y0 - 2.5, 5, S.l + 5, 2.5); c.fill(); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x0 - 3.5, y0 - 2, 1.2, S.l + 4); }
      if (S.cadre) { c.strokeStyle = '#5a5e62'; c.lineWidth = 1.4; c.strokeRect(x0 - 1.5, y0 - 1.5, S.p + 5, S.l + 3); }
      if (S.port === 'hotte') {
        // hotte d'osier : vannerie, ouverture sombre, quelques grappes
        c.fillStyle = S.coul; rr(c, x0, y0, x1 - x0, S.l, 5); c.fill();
        c.strokeStyle = 'rgba(40,24,10,0.55)'; c.lineWidth = 0.8;
        for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x0, y0 + S.l * k / 5); c.lineTo(x1, y0 + S.l * k / 5); c.stroke(); }
        for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + (x1 - x0) * k / 4, y0); c.lineTo(x0 + (x1 - x0) * k / 4, y0 + S.l); c.stroke(); }
        c.fillStyle = 'rgba(20,12,6,0.75)'; ellipse(c, x0 + (x1 - x0) * 0.45, 0, (x1 - x0) * 0.32, S.l * 0.36); c.fill();
        c.fillStyle = '#4a2048'; for (let k = 0; k < 5; k++) { cercle(c, x0 + (x1 - x0) * (0.3 + (k % 2) * 0.2), (k - 2) * 2.2, 1.6); c.fill(); }
        break;
      }
      const g = c.createLinearGradient(x0, y0, x1, y0 + S.l);
      g.addColorStop(0, teinte(S.coul, 1.25)); g.addColorStop(1, teinte(S.coul, 0.75));
      c.fillStyle = g;
      if (S.informe) { ellipse(c, (x0 + x1) / 2, sw * 0.4, (x1 - x0) / 2 + 1, S.l / 2 + 1); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x0 + 2, -3); c.quadraticCurveTo((x0 + x1) / 2, 1, x1 - 2, -2); c.stroke(); }
      else { rr(c, x0, y0, x1 - x0, S.l, S.port === 'cube' ? 1.5 : 4); c.fill(); }
      c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.9; if (!S.informe) { rr(c, x0, y0, x1 - x0, S.l, S.port === 'cube' ? 1.5 : 4); c.stroke(); }
      if (S.port === 'cube') { c.fillStyle = 'rgba(255,255,255,0.85)'; rr(c, x0 + S.p * 0.3, -3.5, S.p * 0.4, 7, 1.5); c.fill(); }
      if (S.rabat) { c.fillStyle = teinte(S.coul, 0.7); rr(c, x0 + 1, y0 + 2, (x1 - x0) * 0.45, S.l - 4, 3); c.fill(); c.fillStyle = 'rgba(200,190,170,0.6)'; c.fillRect(x0 + (x1 - x0) * 0.45, -0.8, 1.6, 1.6); }
      if (S.poches) { c.fillStyle = teinte(S.coul, 0.82); rr(c, x0 + 1.5, y0 - 1.6, x1 - x0 - 4, 2.6, 1); c.fill(); rr(c, x0 + 1.5, y0 + S.l - 1, x1 - x0 - 4, 2.6, 1); c.fill(); }
      if (S.molle) { c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.8; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + (x1 - x0) * k / 4, y0 + 2); c.lineTo(x0 + (x1 - x0) * k / 4, y0 + S.l - 2); c.stroke(); } }
      if (S.bande) { c.fillStyle = S.bande; c.fillRect(x0 + (x1 - x0) * 0.55, y0 + 1, 1.8, S.l - 2); }
      if (S.motif) { c.fillStyle = S.motif; cercle(c, x0 + (x1 - x0) * 0.35, -2, 1.4); c.fill(); cercle(c, x0 + (x1 - x0) * 0.6, 2.5, 1.2); c.fill(); }
      if (S.corde) { c.strokeStyle = S.corde; c.lineWidth = 1.3; c.beginPath(); c.arc(x0 + 2, 0, 4, PI * 0.5, PI * 1.5); c.stroke(); }
      break;
    }
    case 'gilet': { c.fillStyle = teinte(S.coul, 0.9); rr(c, -10, -S.l / 2, 4, S.l, 2); c.fill(); break; }
    case 'bandouliere': case 'epaule': case 'main': case 'banane': {
      // dans le dos, à peine décalé du côté gauche (−y) : un peu plus pour un sac passé à l'épaule ou un cabas
      const cote = { bandouliere: -2.5, epaule: -4, main: -4.5, banane: 0 }[S.port];
      const ep = S.port === 'banane' ? S.p : Math.max(4, S.p * 0.8);   // l'épaisseur vue de dessus
      const x1 = -6, x0 = x1 - 3.5 - ep, y0 = cote - S.l / 2 + sw * 0.5;
      const rayon = S.port === 'epaule' ? Math.min(ep / 2, 4) : 2.5;
      c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, x0 - 1, y0 + 1.2, x1 - x0, S.l, rayon); c.fill();
      const g = c.createLinearGradient(x0, y0, x1, y0 + S.l); g.addColorStop(0, teinte(S.coul, 1.2)); g.addColorStop(1, teinte(S.coul, 0.75));
      c.fillStyle = g; rr(c, x0, y0, x1 - x0, S.l, rayon); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 0.8; rr(c, x0, y0, x1 - x0, S.l, rayon); c.stroke();
      if (S.port === 'bandouliere') { c.fillStyle = teinte(S.coul, 0.7); rr(c, x0, y0, (x1 - x0) * 0.55, S.l, 2.5); c.fill(); }   // rabat
      if (S.port === 'main') {   // les anses du cabas / la poignée du cartable, au-dessus du sac
        c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 1.1;
        c.beginPath(); c.moveTo(x1 - 0.5, y0 + S.l * 0.3); c.quadraticCurveTo(x1 + 2.5, y0 + S.l / 2, x1 - 0.5, y0 + S.l * 0.7); c.stroke();
      }
      if (S.bande) { c.fillStyle = S.bande; c.fillRect((x0 + x1) / 2 - 0.6, y0 + 1, 1.2, S.l - 2); }
      if (S.frange) { c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 0.8; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x0, y0 + 2 + k * 2); c.lineTo(x0 - 2.2, y0 + 2 + k * 2); c.stroke(); } }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x0 + 0.8, y0 + 1, 1, S.l - 2);
      break;
    }
    case 'valise': {
      const x0 = -27 - S.p, y0 = -15 - S.l / 2;
      c.strokeStyle = '#18181a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x0 + S.p, y0 + S.l / 2); c.lineTo(-6, -12); c.stroke();   // la poignée tirée
      c.fillStyle = 'rgba(0,0,0,0.35)'; rr(c, x0 + 1.5, y0 + 1.5, S.p, S.l, 2); c.fill();
      c.fillStyle = S.coul; rr(c, x0, y0, S.p, S.l, 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 0.8; for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(x0 + 1, y0 + S.l * k / 3); c.lineTo(x0 + S.p - 1, y0 + S.l * k / 3); c.stroke(); }
      c.fillStyle = '#111'; cercle(c, x0 + 1.5, y0 + 2, 1.3); c.fill(); cercle(c, x0 + 1.5, y0 + S.l - 2, 1.3); c.fill();
      break;
    }
    default: break;
  }
  c.restore();
}
// Ce qui passe DEVANT le torse : bretelles, sangle en travers, sac porté à l'épaule ou à la main, banane, flasques.
function sacAvant(c, S, bal, m, ph) {
  const sw = Math.sin(ph) * 0.8 * m;
  c.save(); c.translate(0, bal * 0.6);
  c.lineCap = 'round';
  switch (S.port) {
    case 'dos': case 'cube': case 'hotte': case 'gilet': {
      // bretelles par-dessus les épaules
      c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 2.2;
      c.beginPath(); c.moveTo(-7, -7); c.quadraticCurveTo(-1, -9.5, 4, -6.5); c.moveTo(-7, 7); c.quadraticCurveTo(-1, 9.5, 4, 6.5); c.stroke();
      if (S.port === 'gilet') { c.fillStyle = '#9ad0f0'; rr(c, 3, -7.5, 5, 3, 1.2); c.fill(); rr(c, 3, 4.5, 5, 3, 1.2); c.fill(); c.fillStyle = '#20384a'; c.fillRect(7.2, -7, 1, 2); c.fillRect(7.2, 5, 1, 2); }
      if (S.p >= 9 && S.port === 'dos') { c.strokeStyle = 'rgba(20,20,20,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(4, -6); c.lineTo(4, 6); c.stroke(); }  // sangle de poitrine
      break;
    }
    case 'bandouliere': case 'main': {
      // la sangle en travers du torse (épaule droite → hanche gauche, où pend le sac)
      c.strokeStyle = teinte(S.coul, 0.65); c.lineWidth = S.port === 'main' ? 1.4 : 1.8;
      c.beginPath(); c.moveTo(-6, 9 + sw * 0.3); c.quadraticCurveTo(3, 1, -5, -9 - sw); c.stroke();
      break;
    }
    case 'epaule': {
      // la anse passée sur l'épaule gauche
      c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-6, -10 - sw * 0.5); c.quadraticCurveTo(1, -12, -4, -5); c.stroke();
      break;
    }
    case 'banane': {
      // la ceinture du sac banane autour de la taille
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-6, -9); c.quadraticCurveTo(7, 0, -6, 9); c.stroke();
      break;
    }
    default: break;
  }
  c.restore();
}

// ---------- L'objet sanglé dans le dos (pelle, fusil, planche…) ----------
// En travers du dos, derrière les épaules (vu de dessus, presque d'une épaule à l'autre) : ses deux bouts dépassent du corps.
// Par-dessus un sac à dos, il est sanglé sur le sac.
// L'objet sanglé dans le dos, en bandoulière, EN BIAIS : un bout dépasse au-dessus d'une épaule, l'autre sous la hanche
// opposée, le milieu est caché sous le sac et la carrure (dessiné AVANT eux). Sans sac : la sangle en travers du torse.
function objetDos(c, id, sac, bal) {
  const forme = formeArme(id) || 'objet';
  const L = forme === 'objet' ? 22 : Math.min(30, (LONGUEUR[forme] || 12) * 0.9);
  c.save();
  c.translate(-4.5, bal * 0.6); c.rotate(-PI / 2 + 0.78);
  const l = Math.max(L, forme === 'pelle' ? 24 : 28); c.translate(-l / 2 + 1, 0);
  if (forme === 'objet') { c.fillStyle = '#7a6448'; rr(c, -3, -2.6, l + 2, 5.2, 1.2); c.fill(); c.strokeStyle = 'rgba(30,20,10,0.7)'; c.lineWidth = 0.8; rr(c, -3, -2.6, l + 2, 5.2, 1.2); c.stroke(); }
  else dessinerArme(c, forme, l);
  c.restore();
  if (!sac) {
    c.strokeStyle = 'rgba(28,24,20,0.9)'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6, 10 + bal * 0.6); c.quadraticCurveTo(3, 0, -5, -10 + bal * 0.6); c.stroke();
  }
}

// ---------- Vivants ----------
// P = { manteau, col (couleur de la couche de dessous), bras (manches courtes : couleur de peau), pantalon, chaussures, peau,
//       cheveux, coiffure: 'court'|'long'|'chauve'|'capuche', vet (id du vêtement du dessus : sa forme et ses détails),
//       carrure, sac: id du sac porté (SACS) | true (sac à dos) | false, dos: id de l'objet sanglé dans le dos, taille, contour }
// A = { t, marche (0..1), phase (rad), allure, geste: { type, p, combo }, charge (0..1), vise, empoigne, arme (id),
//       lampe (bool), mainG (id), flash (0..1), fantome (bool), aTerre (bool), agonie (bool), frontale (bool) }
// Comme les morts (./morts.js) : le torse, la tête, les mains et les chaussures sont peints UNE fois (sprites, ./corps.js)
// d'après l'apparence ; à chaque image : l'ombre, les jambes, les bras à coude, l'arme, la lampe, le balancement.
const hexA = (h, d = [90, 90, 80]) => { try { return h ? hexRgb(h) : d; } catch (e) { return d; } };
// L'apparence d'un vivant, une fois par combinaison de vêtements (P change d'objet quand on se change).
const apparencesV = new Map();
function apparenceVivant(P) {
  const cle = `${P.manteau}|${P.col || ''}|${P.bras || ''}|${P.pantalon || ''}|${P.chaussures || ''}|${P.peau || ''}|${P.cheveux || ''}|${P.coiffure || ''}|${P.vet || ''}|${P.carrure || 1}`;
  let a = apparencesV.get(cle);
  if (a) return a;
  const vet = P.vet || '';
  const famille = /debardeur/.test(vet) ? 'debardeur' : /chemise/.test(vet) ? 'chemise' : /tshirt|maillot_thermique/.test(vet) ? 'tshirt'
    : /sweat|capuche/.test(vet) ? 'sweat' : /pull|polaire|gilet_laine/.test(vet) ? 'pull' : /doudoune/.test(vet) ? 'doudoune'
    : /gilet_tactique/.test(vet) ? 'tactique' : /pompier/.test(vet) ? 'pompier' : /blouse/.test(vet) ? 'blouse' : /poncho/.test(vet) ? 'poncho'
    : /cuir|blouson|moto/.test(vet) ? 'cuir' : vet ? 'veste' : 'veste';
  a = {
    cle, seed: graine(cle), famille,
    vet: hexA(P.manteau, [74, 74, 58]), col: P.col ? hexA(P.col) : null, peau: hexA(P.peau, [184, 147, 120]),
    brasNus: !!P.bras, pantalon: hexA(P.pantalon, [42, 44, 48]), chaussures: hexA(P.chaussures, [24, 20, 15]),
    cheveux: hexA(P.cheveux, [36, 26, 18]), coiffure: P.coiffure || 'court', carrure: P.carrure || 1,
  };
  a.peauSombre = mulC(a.peau, 0.7);
  a.K = { manche: rgbC(mulC(a.vet, 0.9)), peau: rgbC(a.peau), jambe: rgbC(a.pantalon), poignet: rgbC(mulC(a.vet, 0.62)) };
  apparencesV.set(cle, a);
  if (apparencesV.size > 120) apparencesV.delete(apparencesV.keys().next().value);
  return a;
}
// Le torse d'un vivant : épaules, vêtement du dessus et ses détails, la couche de dessous au col, plis, volume.
function peindreTorseV(c, a) {
  const r = rng(a.seed ^ 0x3131), car = a.carrure, SW = 12.3 * car, V = a.vet, F = a.famille;
  const large = F === 'doudoune' ? 1.06 : F === 'poncho' ? 1.12 : 1;
  const forme = () => { c.save(); c.scale(1, large); contourTorse(c, car, F === 'doudoune' ? 1.2 : 0); c.restore(); };
  c.fillStyle = rgbC(F === 'debardeur' ? a.peau : V); forme(); c.fill();
  c.save(); forme(); c.clip();
  if (F === 'debardeur') { c.fillStyle = rgbC(V); ellipse(c, -0.4, 0, 8.4 * car, SW * 0.6); c.fill(); }
  if (F === 'pull') { c.strokeStyle = rgbC(mulC(V, 0.8), 0.45); c.lineWidth = 0.45; c.beginPath(); for (let x = -7; x < 7; x += 1.15) { c.moveTo(x, -SW); c.lineTo(x + 0.4, SW); } c.stroke(); }
  if (F === 'doudoune') for (let x = -6.5 * car; x < 7 * car; x += 3 * car) {
    const g = c.createLinearGradient(x, 0, x + 3 * car, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.45, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0.28)');
    c.fillStyle = g; c.fillRect(x, -SW - 2, 3 * car, 2 * SW + 4);
  }
  if (F === 'tactique') {   // gilet tactique : poches sanglées sur la poitrine, bretelles larges
    c.fillStyle = rgbC(mulC(V, 0.78)); for (const y of [-6, -2.2, 2.2, 6]) { rr(c, 2.2, y - 1.6, 3.6, 3.2, 0.6); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.4; c.beginPath(); for (let x = -6; x < 2; x += 1.6) { c.moveTo(x, -SW); c.lineTo(x, SW); } c.stroke();
  }
  if (F === 'pompier') { c.fillStyle = 'rgba(214,200,60,0.9)'; for (const s of [-1, 1]) c.fillRect(-7 * car, s * 7.6 * car - 0.9, 13 * car, 1.8); c.fillStyle = 'rgba(220,220,214,0.6)'; for (const s of [-1, 1]) c.fillRect(-7 * car, s * 7.6 * car - 0.3, 13 * car, 0.6); }
  if (F === 'blouse') { c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(6, 0); c.lineTo(-7, 0); c.stroke(); }
  if (F === 'poncho') { c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k < 6; k++) { const y = entre(r, -SW, SW); c.moveTo(-7, y); c.lineTo(6, y * 0.9); } c.stroke(); }
  if (F === 'cuir') { c.fillStyle = 'rgba(255,255,255,0.08)'; ellipse(c, -1.6, -6.4 * car, 3.2, 2.2); c.fill(); ellipse(c, -1.6, 6.4 * car, 3.2, 2.2); c.fill(); }
  // plis : du col vers les épaules (ombre, lumière)
  for (const [coul, n, lw] of [['rgba(0,0,0,0.2)', 6, 0.7], ['rgba(255,245,230,0.11)', 4, 0.55]]) {
    c.strokeStyle = coul; c.lineWidth = lw; c.beginPath();
    for (let k = 0; k < n; k++) { const s = r() < 0.5 ? -1 : 1, y0 = s * entre(r, 2.5, 5), y1 = s * entre(r, 7, SW - 1); c.moveTo(entre(r, -3, 2), y0); c.quadraticCurveTo(entre(r, -5, 4), (y0 + y1) / 2, entre(r, -4, 3), y1); }
    c.stroke();
  }
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 0.55;   // coutures des épaules, creux du dos
  c.beginPath(); c.moveTo(-0.8, -4); c.quadraticCurveTo(-1.2, -SW * 0.7, -0.6, -SW); c.moveTo(-0.8, 4); c.quadraticCurveTo(-1.2, SW * 0.7, -0.6, SW); c.stroke();
  c.lineWidth = 1.3; c.strokeStyle = 'rgba(0,0,0,0.14)'; c.beginPath(); c.moveTo(-7 * car, 0); c.lineTo(-3.4 * car, 0); c.stroke();
  // un peu d'usure : trois semaines dans les mêmes vêtements
  { const l = []; for (let k = 0; k < 26; k++) l.push([entre(r, -7, 6), entre(r, -SW, SW), entre(r, 0.2, 0.7)]); c.fillStyle = 'rgba(60,46,30,0.18)'; c.beginPath(); for (const [x, y, rr] of l) { c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); } c.fill(); }
  c.restore();
  volume(c, forme, -0.6, 0, SW * 1.02, 0.16, 0.5);
  // le col : la couche de dessous s'y voit (t-shirt sous la veste…), chaque vêtement le sien
  c.save(); forme(); c.clip();
  const sous = a.col || mulC(V, 0.62);
  if (F === 'chemise') {
    c.fillStyle = rgbC(mulC(V, 1.1)); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-3.2, s * 4.4); c.lineTo(4.6, s * 3.2); c.lineTo(3, s * 0.6); c.lineTo(-3.6, s * 2.4); c.closePath(); c.fill(); }
  } else if (F === 'sweat' || F === 'poncho') {
    c.fillStyle = rgbC(mulC(V, 0.9)); ellipse(c, -6.2 * car, 0, 4.2 * car, 5.4 * car); c.fill();       // la capuche dans le dos
    c.fillStyle = 'rgba(0,0,0,0.42)'; ellipse(c, -5.6 * car, 0, 2.4 * car, 3.6 * car); c.fill();
    c.strokeStyle = 'rgba(230,226,214,0.75)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(4.8, -1.6); c.lineTo(6.6, -1.9); c.moveTo(4.8, 1.6); c.lineTo(6.6, 1.9); c.stroke();
  } else if (F === 'tshirt' || F === 'debardeur' || F === 'pull' || F === 'blouse') {
    c.strokeStyle = rgbC(mulC(V, 0.72)); c.lineWidth = 1.1; c.beginPath(); c.ellipse(0.8, 0, 4.4, 5.2, 0, 0, TAU); c.stroke();
    if (a.col) { c.fillStyle = rgbC(sous); ellipse(c, 2.4, 0, 2.6, 4); c.fill(); }
  } else {
    // vestes, blousons, doudounes : col montant, fermeture éclair, le dessous au col
    if (a.col) { c.fillStyle = rgbC(sous); ellipse(c, 2.6, 0, 3, 4.4); c.fill(); }
    c.strokeStyle = rgbC(mulC(V, 0.62)); c.lineWidth = 2.2; c.beginPath(); c.ellipse(0.6, 0, 4.7, 6.1, 0, PI * 0.3, PI * 1.7); c.stroke();
    c.strokeStyle = 'rgba(205,200,190,0.55)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(5.2, 0); c.lineTo(6.6 * car, 0); c.stroke();
  }
  c.restore();
  c.strokeStyle = 'rgba(8,6,4,0.6)'; c.lineWidth = 0.75; forme(); c.stroke();
}
// La tête d'un vivant : peau chaude, oreilles, coiffure mèche à mèche (ou capuche relevée), nez au bord avant.
function peindreTeteV(c, a) {
  const r = rng(a.seed ^ 0x7171), P = a.peau, H = a.cheveux, coif = a.coiffure;
  for (const s of [-1, 1]) { c.fillStyle = rgbC(mulC(P, 0.9)); ellipse(c, 0.8, s * 5.1, 1.7, 1.15); c.fill(); c.fillStyle = rgbC(mulC(P, 0.66)); ellipse(c, 0.7, s * 5.25, 0.8, 0.5); c.fill(); }
  c.fillStyle = rgbC(P); c.beginPath(); c.ellipse(0, 0, 6.2, 5.2, 0, 0, TAU); c.fill();
  // le nez, l'arcade
  c.fillStyle = rgbC(mulC(P, 0.95)); c.beginPath(); c.moveTo(5.4, -1); c.quadraticCurveTo(7.4, -0.5, 7.4, 0); c.quadraticCurveTo(7.4, 0.5, 5.4, 1); c.closePath(); c.fill();
  c.fillStyle = rgbC(mulC(P, 0.72), 0.7); ellipse(c, 4.8, -2.2, 1, 0.75); c.fill(); ellipse(c, 4.8, 2.2, 1, 0.75); c.fill();
  if (coif === 'capuche') {
    // capuche relevée : le tissu couvre le crâne, l'ouverture laisse voir le front et le nez
    c.fillStyle = rgbC(mulC(a.vet, 0.88)); c.beginPath(); c.ellipse(-0.8, 0, 7.4, 6.3, 0, PI * 0.3, PI * 1.7); c.quadraticCurveTo(5.6, 0, 5.4, 5.9); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-6.5, 0); c.lineTo(3, 0); c.stroke();
    c.strokeStyle = rgbC(mulC(a.vet, 0.6)); c.lineWidth = 1; c.beginPath(); c.ellipse(-0.8, 0, 7.4, 6.3, 0, PI * 0.3, PI * 1.7); c.stroke();
  } else if (coif !== 'chauve') {
    const front = 3.4;
    const masse = () => { c.beginPath(); c.moveTo(front, -4.4); c.bezierCurveTo(front + 1.6, -1.6, front + 1.6, 1.6, front, 4.4); c.ellipse(-0.2, 0, 6.45, 5.55, 0, PI * 0.36, PI * 1.64); c.closePath(); };
    if (coif === 'long') {
      c.fillStyle = rgbC(mulC(H, 0.85)); c.beginPath(); c.moveTo(-1, -5.6); c.bezierCurveTo(-7, -7.4, -12, -5, -12.3, 0); c.bezierCurveTo(-12, 5, -7, 7.4, -1, 5.6); c.closePath(); c.fill();
      c.strokeStyle = rgbC(mulC(H, 0.6), 0.7); c.lineWidth = 0.35; c.beginPath();
      for (let k = 0; k < 26; k++) { const y = entre(r, -5.4, 5.4); c.moveTo(-2, y * 0.8); c.quadraticCurveTo(-7, y * 1.2 + entre(r, -1, 1), entre(r, -12, -9.5), y * entre(r, 0.85, 1.12)); }
      c.stroke();
    }
    c.fillStyle = rgbC(H); masse(); c.fill();
    c.save(); masse(); c.clip();
    for (const [coul, n, lw] of [[rgbC(mulC(H, 0.62), 0.55), 55, 0.34], [rgbC(mixC(H, [230, 220, 200], 0.28), 0.4), 40, 0.27]]) {
      c.strokeStyle = coul; c.lineWidth = lw; c.beginPath();
      for (let k = 0; k < n; k++) { const t = entre(r, -PI, PI), l = entre(r, 3, 7); c.moveTo(-1.6 + Math.cos(t) * 0.6, Math.sin(t) * 0.6); c.quadraticCurveTo(-1.6 + Math.cos(t + 0.3) * l * 0.6, Math.sin(t + 0.3) * l * 0.6, -1.6 + Math.cos(t + 0.15) * l, Math.sin(t + 0.15) * l); }
      c.stroke();
    }
    c.restore();
  }
  volume(c, () => { c.beginPath(); c.ellipse(0, 0, 6.6, 5.6, 0, 0, TAU); }, -0.8, -0.2, 7, 0.2, 0.45);
  c.strokeStyle = 'rgba(8,6,4,0.5)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(0, 0, 6.2, 5.2, 0, 0, TAU); c.stroke();
}
// La main d'un vivant : un poing (elle tient quelque chose) ou une main ouverte, doigts serrés.
function peindreMainV(c, a, s, ouverte) {
  const P = a.peau;
  c.fillStyle = 'rgba(8,6,4,0.55)'; ellipse(c, 0.6, 0, ouverte ? 3 : 2.5, 2.25); c.fill();
  c.fillStyle = rgbC(mulC(P, 0.95)); ellipse(c, 0.5, 0, ouverte ? 2.55 : 2.05, 1.85); c.fill();
  if (ouverte) { c.strokeStyle = rgbC(mulC(P, 0.7)); c.lineWidth = 0.35; c.beginPath(); for (const y of [-0.9, 0, 0.9]) { c.moveTo(1.4, y); c.lineTo(3, y); } c.stroke(); }
  else { c.fillStyle = rgbC(mulC(P, 0.78)); for (const y of [-1.1, -0.35, 0.4, 1.15]) { cercle(c, 2.1, y, 0.42); c.fill(); } }   // les jointures
  c.fillStyle = rgbC(mulC(P, 0.9)); ellipse(c, 0.2, -s * 1.6, 1.1, 0.7, -s * 0.5); c.fill();                                  // le pouce
  c.fillStyle = 'rgba(255,246,230,0.16)'; ellipse(c, 0.1, -0.5, 1.1, 0.7); c.fill();
}
function peindreChaussureV(c, a) {
  const C = a.chaussures;
  c.fillStyle = 'rgba(8,6,4,0.6)'; ellipse(c, 0.8, 0, 4.9, 2.75); c.fill();
  c.fillStyle = rgbC(C); ellipse(c, 0.6, 0, 4.4, 2.3); c.fill();
  c.fillStyle = 'rgba(255,246,230,0.14)'; ellipse(c, 0.2, -0.4, 2.8, 1); c.fill();
  c.strokeStyle = rgbC(mixC(C, [200, 196, 186], 0.45), 0.55); c.lineWidth = 0.35; c.beginPath(); for (let q = 0; q < 3; q++) { c.moveTo(0.4 + q * 0.9, -0.7); c.lineTo(0.4 + q * 0.9, 0.7); } c.stroke();
}
const posee = (c, s) => c.drawImage(s.cv, -s.hx, -s.hy, 2 * s.hx, 2 * s.hy);
// Un bras de vivant : épaule → coude → main (le coude calculé, raccourci quand le bras pend), la manche, la main.
function brasV(c, a, sx, sy, hx, hy, s) {
  const car = a.carrure, ep = 5.2 * car;
  let ex, ey;
  [ex, ey, hx, hy] = coude(sx, sy, hx, hy, 9 * car, 8.6 * car, s, 0.8);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = 'rgba(8,6,4,0.55)'; c.lineWidth = ep + 1.3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = a.brasNus ? a.K.peau : a.K.manche; c.lineWidth = ep * 0.86; c.beginPath(); c.moveTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  // manches courtes : la manche s'arrête avant le coude ; longues : le poignet de la manche
  const mx = a.brasNus ? sx + (ex - sx) * 0.6 : ex, my = a.brasNus ? sy + (ey - sy) * 0.6 : ey;
  if (a.brasNus) { c.strokeStyle = a.K.peau; c.lineWidth = ep * 0.9; c.beginPath(); c.moveTo(mx, my); c.lineTo(ex, ey); c.stroke(); }
  c.strokeStyle = a.K.manche; c.lineWidth = ep; c.beginPath(); c.moveTo(sx, sy); c.lineTo(mx, my); c.stroke();
  if (!a.brasNus) { const px = hx - (hx - ex) * 0.2, py = hy - (hy - ey) * 0.2; c.strokeStyle = a.K.poignet; c.lineWidth = ep * 0.9; c.beginPath(); c.moveTo(px, py); c.lineTo(px + (hx - ex) * 0.04, py + (hy - ey) * 0.04); c.stroke(); }
  return Math.atan2(hy - ey, hx - ex);
}
function mainV(c, a, x, y, ang, s, ouverte) {
  const M = sprite(`vm:${a.seed}:${s}:${ouverte ? 1 : 0}`, 4.5, 3.6, (cc) => peindreMainV(cc, a, s, ouverte));
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(a.carrure, a.carrure);
  if (M) posee(c, M); else { c.fillStyle = a.K.peau; ellipse(c, 0.5, 0, 2.2, 1.9); c.fill(); }
  c.restore();
}

export function dessinerHumain(c, x, y, dir, P, A) {
  const s = (P.taille || 1);
  const a = apparenceVivant(P), car = a.carrure;
  if (!A.fantome && !(A.agonie || A.aTerre)) dessinerOmbre(c, x, y, dir, 15 * car * s, 12 * car * s, s);
  c.save();
  c.translate(x, y); c.rotate(dir); c.scale(s, s);
  if (A.fantome) c.globalAlpha = 0.55;
  if (A.agonie || A.aTerre) { couche(c, P, A, a); c.restore(); return; }
  const m = A.marche || 0, ph = A.phase || 0;
  const pas = Math.sin(ph) * 7 * m, bal = Math.sin(ph * 2) * 0.8 * m;
  const accroupi = A.allure === 'accroupi', course = A.allure === 'course';
  // contour (coéquipier) : un halo net, visible même dans le noir
  if (P.contour) {
    c.strokeStyle = P.contour; c.lineWidth = 3;
    contourTorse(c, car * 1.08, 0); c.stroke(); cercle(c, 2, 0, 8.4); c.stroke();
    if (A.fantome) { c.restore(); return; }
  }
  // jambes et chaussures (accroupi : genoux devant, pieds sous soi)
  c.lineCap = 'round';
  const Ch = sprite(`vp:${a.seed}`, 6, 3.6, (cc) => peindreChaussureV(cc, a));
  for (const sd of [-1, 1]) {
    const fx = (sd < 0 ? pas : -pas) * 0.95 + 1.2 + (accroupi ? 4 : 0), fy = sd * 5.4 * car;
    c.strokeStyle = 'rgba(8,6,4,0.5)'; c.lineWidth = 6.4 * car; c.beginPath(); c.moveTo(-1.5, sd * 4.3 * car); c.lineTo(fx - 1, fy); c.stroke();
    c.strokeStyle = a.K.jambe; c.lineWidth = 5.4 * car; c.stroke();
    c.save(); c.translate(fx, fy); if (Ch) posee(c, Ch); else { c.fillStyle = rgbC(a.chaussures); ellipse(c, 0.6, 0, 4.4, 2.3); c.fill(); } c.restore();
  }
  // sac (derrière le torse : dos, hanche, valise), objet sanglé dans le dos
  const sac = sacDe(P.sac);
  if (P.dos) objetDos(c, P.dos, sac, bal);
  if (sac) sacArriere(c, sac, bal, m, ph);
  // bras, arme, torse, mains : la racine des bras passe sous la carrure ; l'arme est tenue (la main par-dessus le manche)
  const tx = course ? 2 : accroupi ? 1 : 0;
  const pose = poseBras(A);
  const Ld = LONGUEUR[pose.forme] || 10;
  const SWb = 12.3 * car - 1.8;
  if (pose.armeAvant === false) dessinerTenue(c, pose, Ld);
  const angG = brasV(c, a, 0.6 + tx, -SWb + bal, pose.gx, pose.gy, -1);
  const angD = brasV(c, a, 0.6 + tx, SWb + bal, pose.dx, pose.dy, 1);
  c.save(); c.translate(tx * 0.5, bal); if (accroupi) c.scale(0.94, 1);
  const T = sprite(`vt:${a.seed}`, 12 * car * 1.12 + 3, 13.5 * car * 1.12 + 2, (cc) => peindreTorseV(cc, a));
  if (T) posee(c, T); else { c.fillStyle = rgbC(a.vet); contourTorse(c, car, 0); c.fill(); }
  c.restore();
  if (sac) sacAvant(c, sac, bal, m, ph);
  if (pose.armeAvant !== false) dessinerTenue(c, pose, Ld);
  if (pose.lampeG) { c.save(); c.translate(pose.gx, pose.gy); c.rotate(pose.lampeG); dessinerArme(c, 'lampe', 9); c.restore(); }
  const tient = !!pose.forme;
  mainV(c, a, pose.gx, pose.gy, angG, -1, !(tient && DEUX_MAINS.has(pose.forme)) && !pose.lampeG);
  mainV(c, a, pose.dx, pose.dy, tient ? pose.angle : angD, 1, !tient);
  // tête
  const hx = 2 + tx + (course ? 1.5 : 0) + (accroupi ? 0.8 : 0);
  c.save(); c.translate(hx, bal * 0.5);
  const H = sprite(`vh:${a.seed}`, 13, 8, (cc) => peindreTeteV(cc, a));
  if (H) posee(c, H); else { c.fillStyle = a.K.peau; cercle(c, 0, 0, 6.5); c.fill(); }
  if (A.frontale) { c.fillStyle = '#2a2a2c'; rr(c, 3.4, -2, 3, 4, 1); c.fill(); c.fillStyle = '#f8ecc0'; c.fillRect(5.9, -1.4, 1.2, 2.8); c.strokeStyle = 'rgba(30,30,32,0.9)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(0, 0, 6.3, 5.3, 0, -PI * 0.42, PI * 0.42); c.stroke(); }
  c.restore();
  // éclair de coup reçu
  if (A.flash > 0.02) { c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,60,60,${0.5 * A.flash})`; ellipse(c, 0, 0, 12, 15); c.fill(); }
  c.restore();
}
// L'arme en main : un peu plus grande que nature et cernée de noir, pour qu'elle se lise sur tous les sols.
function dessinerTenue(c, pose, L) {
  if (!pose.forme) return;
  c.save(); c.translate(pose.dx, pose.dy); c.rotate(pose.angle); c.scale(1.22, 1.22);
  c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 2.2; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
  dessinerArme(c, pose.forme, L); dessinerArme(c, pose.forme, L);
  c.restore();
}
// Pose des bras selon l'arme, le geste en cours (coup rapide / lourd / poussée / tir), la charge, l'empoignade.
function poseBras(A) {
  const m = A.marche || 0, ph = A.phase || 0, t = A.t || 0;
  const forme = formeArme(A.arme), deux = forme && DEUX_MAINS.has(forme);
  const balG = Math.sin(ph + PI) * 5 * m, balD = Math.sin(ph) * 5 * m;
  let P = { gx: 3 + balG, gy: -14, dx: 3 + balD, dy: 14, forme, angle: 0.25, armeAvant: true, lampeG: null };
  if (forme) {
    if (deux) Object.assign(P, { gx: 8, gy: -4, dx: 5, dy: 9, angle: -0.55 });
    else if (forme === 'pistolet' || forme === 'fusil') Object.assign(P, { dx: 15, dy: 3, angle: 0, gx: forme === 'fusil' ? 9 : 12, gy: forme === 'fusil' ? -1 : -3 });
    else Object.assign(P, { dx: 8 + balD * 0.5, dy: 12, angle: 0.5 });
  }
  if (A.lampe && !deux) { P.gx = 12; P.gy = -7; P.lampeG = -0.1; }
  const G = A.geste;
  if (A.empoigne) { const tr = Math.sin(t / 40) * 2; Object.assign(P, { gx: 13 + tr, gy: -6, dx: 13 - tr, dy: 6, angle: -1.2, armeAvant: false }); return P; }
  if (A.charge > 0 && !A.vise) {
    // on arme le coup : bras ramené en arrière, tremblement à pleine charge
    const k = easeOut(clamp(A.charge, 0, 1)), tr = A.charge >= 0.98 ? Math.sin(t / 30) * 1.2 : 0;
    const a0 = deux ? 1.9 : 1.6;
    const a = 0.4 + (a0 - 0.4) * k;
    const R = deux ? 13 : 15;
    Object.assign(P, { dx: Math.cos(a) * R * 0.6 + tr, dy: Math.sin(a) * R + tr, angle: a + 0.4 });
    if (deux) { P.gx = P.dx + 3; P.gy = P.dy - 6; }
    return P;
  }
  if (G && G.p < 1) {
    const p = G.p;
    if (G.type === 'rapide' || G.type === 'lourd') {
      // balayage : de la droite (+y) vers la gauche (−y) ; les coups alternent de sens dans un enchaînement
      const lourd = G.type === 'lourd';
      const sens = (G.combo || 0) % 2 === 1 ? -1 : 1;
      const a0 = lourd ? 1.9 : 1.35, a1 = lourd ? -1.1 : -0.9;
      const k = lourd ? (p < 0.35 ? 0 : easeOut((p - 0.35) / 0.65)) : easeOut(Math.min(1, p / 0.7));
      const a = sens * (a0 + (a1 - a0) * k);
      const R = deux ? 14 : 15;
      Object.assign(P, { dx: Math.cos(a) * R + 3, dy: Math.sin(a) * R, angle: a + (deux ? 0.1 : 0.15) });
      if (deux) { P.gx = P.dx - Math.cos(a) * 6; P.gy = P.dy - Math.sin(a) * 6; }
      if (!forme) { P.angle = 0; const poing = Math.sin(p * PI); if (sens > 0) { P.dx = 6 + poing * 12; P.dy = 10 - poing * 6; } else { P.gx = 6 + poing * 12; P.gy = -10 + poing * 6; } }
      P.armeAvant = true;
      return P;
    }
    if (G.type === 'poussee') { const k = p < 0.4 ? easeOut(p / 0.4) : 1 - (p - 0.4) / 0.6; Object.assign(P, { gx: 6 + k * 12, gy: -8, dx: 6 + k * 12, dy: 8, armeAvant: false, angle: 1.2 }); return P; }
    if (G.type === 'tir') { const k = 1 - p; P.dx -= k * 4; P.gx -= k * 3; return P; }
    if (G.type === 'esquive') { Object.assign(P, { gx: -2, gy: -15, dx: -2, dy: 15 }); return P; }
  }
  if (A.vise) { P.dx = 16; P.dy = 2; P.angle = 0; }
  return P;
}
// Allongé (à terre, agonie) : sur le dos, il rampe en tirant sur ses coudes ; à l'agonie, il saigne.
function couche(c, P, A, a) {
  const t = A.t || 0, car = a.carrure;
  if (A.agonie) { c.fillStyle = 'rgba(46,4,6,0.75)'; ellipse(c, -2, 3, 15, 10); c.fill(); c.fillStyle = 'rgba(120,20,22,0.22)'; ellipse(c, 0, 0, 7, 4); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,0.3)'; ellipse(c, 1, 2, 21, 12); c.fill();
  if (P.contour) { c.strokeStyle = P.contour; c.lineWidth = 3; ellipse(c, -2, 0, 21, 11.5); c.stroke(); }
  // jambes étendues, l'une qui pousse
  const k = Math.sin(t / 300) * 2;
  c.lineCap = 'round';
  for (const [y0, y1] of [[-4, -6 + k], [4, 7]]) {
    c.strokeStyle = 'rgba(8,6,4,0.5)'; c.lineWidth = 7 * car; c.beginPath(); c.moveTo(-6, y0); c.lineTo(-21, y1); c.stroke();
    c.strokeStyle = a.K.jambe; c.lineWidth = 6 * car; c.stroke();
    c.fillStyle = rgbC(a.chaussures); ellipse(c, -22.5, y1, 2.6, 2.3); c.fill();
  }
  // le corps, couché sur le dos : le torse vu de face, le col
  c.fillStyle = 'rgba(8,6,4,0.55)'; ellipse(c, 0, 0, 11.8, 10.6); c.fill();
  c.fillStyle = rgbC(a.vet); ellipse(c, 0, 0, 11, 9.8); c.fill();
  volume(c, () => { c.beginPath(); c.ellipse(0, 0, 11, 9.8, 0, 0, TAU); }, 1, 0, 11.5, 0.16, 0.5);
  if (a.col) { c.fillStyle = rgbC(a.col); ellipse(c, 8.4, 0, 2.6, 3.6); c.fill(); }
  // les bras : l'un tire sur le sol, l'autre se tient le flanc
  const angG = brasV(c, a, 6, -8.5, 15 + Math.sin(t / 250) * 3, -14, -1);
  const angD = brasV(c, a, 6, 8.5, 4, 6, 1);
  mainV(c, a, 15 + Math.sin(t / 250) * 3, -14, angG, -1, true);
  mainV(c, a, 4, 6, angD, 1, false);
  // la tête, le visage vers le ciel
  c.save(); c.translate(13, 0);
  const H = sprite(`vh:${a.seed}`, 13, 8, (cc) => peindreTeteV(cc, a));
  if (H) posee(c, H); else { c.fillStyle = a.K.peau; cercle(c, 0, 0, 6.5); c.fill(); }
  c.restore();
}

// ---------- Morts ----------
// Leur rendu (vêtements, plaies, mains à doigts, têtes, corps couchés, sprites en cache) vit dans ./morts.js.
export { dessinerMort, dessinerCadavre, apparenceMort } from './morts.js';

// Fondu de contour d'une silhouette pour le marquage d'une cible (PC : survol / tactile : visée auto).
export function apparenceJoueur(p, couleurs) {
  return { ...couleurs, sac: (p && p.equip && p.equip.sac) || false };
}

void hash; void ease;
