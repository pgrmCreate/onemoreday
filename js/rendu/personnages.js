// ============ Personnages vus de dessus, animés : vivants (joueur, coéquipier, PNJ) et morts ============
// Squelette procédural : ombre, jambes (cycle de marche), torse, sac, bras (pose selon l'arme et le geste), tête.
// Tout est dessiné dans le repère du personnage (il regarde vers +x), à l'échelle du monde (1 case = TS px).
//   dessinerHumain(c, x, y, dir, P, A)   P = apparence, A = animation (voir plus bas)
//   dessinerMort(c, x, y, z, t)          z = mort interpolé (type, sexe, dir, vitesse, etat, atk, vac, terre, touche, _phase, uid)
//   dessinerCadavre(c, cd, t, frais)     cd = { uid, type, sexe, x, y, dir }
import { TS, rr, cercle, ellipse, teinte, hash, graine, rng, clamp } from './outils.js';

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
const LONGUEUR = { couteau: 11, machette: 22, batte: 28, hache: 26, pelle: 32, masse: 28, marteau: 15, lance: 40, barre: 26, pistolet: 10, fusil: 30, lampe: 9, objet: 10 };

function dessinerArme(c, forme, L) {
  c.lineCap = 'round';
  switch (forme) {
    case 'couteau': c.fillStyle = '#2a1e14'; rr(c, -2, -1.6, 5, 3.2, 1); c.fill(); c.fillStyle = '#c8ccd0'; c.beginPath(); c.moveTo(3, -1.4); c.lineTo(L, 0); c.lineTo(3, 1.4); c.closePath(); c.fill(); break;
    case 'machette': c.fillStyle = '#2a1e14'; rr(c, -3, -1.8, 7, 3.6, 1); c.fill(); c.fillStyle = '#9aa0a4'; c.beginPath(); c.moveTo(4, -1.6); c.lineTo(L, -2.6); c.quadraticCurveTo(L + 2, 0, L - 2, 2.4); c.lineTo(4, 1.8); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(6, -1.4, L - 8, 0.8); break;
    case 'batte': c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L * 0.5, 0); c.stroke(); c.lineWidth = 5.5; c.strokeStyle = '#8a6a3e'; c.beginPath(); c.moveTo(L * 0.45, 0); c.lineTo(L, 0); c.stroke(); break;
    case 'hache': c.strokeStyle = '#5a3e24'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L, 0); c.stroke(); c.fillStyle = '#9a1e1e'; c.beginPath(); c.moveTo(L - 7, -1.5); c.lineTo(L - 2, -9); c.lineTo(L + 3, -7); c.lineTo(L, -1.5); c.closePath(); c.fill(); c.fillStyle = '#c0c4c8'; c.fillRect(L - 3, -9, 4, 2); break;
    case 'pelle': c.strokeStyle = '#6a4a2a'; c.lineWidth = 2.8; c.beginPath(); c.moveTo(-4, 0); c.lineTo(L - 8, 0); c.stroke(); c.fillStyle = '#5a5e60'; c.beginPath(); c.moveTo(L - 9, -5); c.lineTo(L + 2, -6); c.quadraticCurveTo(L + 6, 0, L + 2, 6); c.lineTo(L - 9, 5); c.closePath(); c.fill(); break;
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

// ---------- Bras : segment épaule → main ----------
function bras(c, sx, sy, hx, hy, manche, peau, ep = 5) {
  const mx = (sx + hx) / 2 - (hy - sy) * 0.12, my = (sy + hy) / 2 + (hx - sx) * 0.12; // léger coude
  c.strokeStyle = manche; c.lineWidth = ep; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
  c.fillStyle = peau; cercle(c, hx, hy, ep * 0.55); c.fill();
}

// ---------- Sacs : chacun se voit comme il se porte ----------
// port : 'dos' (sac à dos), 'cube' (sac de livreur), 'hotte' (osier), 'gilet' (trail : flasques sur la poitrine),
//        'bandouliere' (sur la hanche, sangle en travers du torse), 'epaule' (sac de sport, de voyage, tote bag),
//        'main' (cabas, cartable), 'valise' (tirée derrière soi), 'banane' (sur le ventre).
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
    case 'bandouliere': {
      const y = -13 - S.p / 2 + sw * 0.5, x = -2 - sw;
      c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, x - S.l / 2 + 1, y - S.p / 2 + 1.2, S.l, S.p, 2.5); c.fill();
      c.fillStyle = S.coul; rr(c, x - S.l / 2, y - S.p / 2, S.l, S.p, 2.5); c.fill();
      c.fillStyle = teinte(S.coul, 0.7); rr(c, x - S.l / 2, y - S.p / 2, S.l * 0.55, S.p, 2.5); c.fill();       // rabat
      if (S.bande) { c.fillStyle = S.bande; c.fillRect(x - S.l / 2 + 1, y - 0.6, S.l * 0.5, 1.2); }
      if (S.frange) { c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 0.8; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x - S.l / 2 + 2 + k * 2, y - S.p / 2); c.lineTo(x - S.l / 2 + 2 + k * 2, y - S.p / 2 - 2.2); c.stroke(); } }
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
    case 'bandouliere': {
      c.strokeStyle = teinte(S.coul, 0.65); c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-2 - sw, -13); c.quadraticCurveTo(2, -2, -3, 11); c.stroke();
      break;
    }
    case 'epaule': {
      const y = -15 - S.p / 2 + sw * 0.4, x = -2 - sw * 1.2;
      c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - S.l * 0.3, y + S.p / 2); c.quadraticCurveTo(x, -9, x + S.l * 0.3, y + S.p / 2); c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, x - S.l / 2 + 1, y - S.p / 2 + 1.2, S.l, S.p, S.p / 2); c.fill();
      const g = c.createLinearGradient(0, y - S.p / 2, 0, y + S.p / 2); g.addColorStop(0, teinte(S.coul, 1.2)); g.addColorStop(1, teinte(S.coul, 0.75));
      c.fillStyle = g; rr(c, x - S.l / 2, y - S.p / 2, S.l, S.p, Math.min(S.p / 2, 4)); c.fill();
      if (S.bande) { c.fillStyle = S.bande; c.fillRect(x - S.l / 2 + 2, y - 0.7, S.l - 4, 1.4); }
      break;
    }
    case 'main': {
      const x = 1 + sw * 2, y = -19;
      c.strokeStyle = teinte(S.coul, 0.6); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 2, y + S.p / 2 - 1); c.quadraticCurveTo(x, y + S.p / 2 + 3, x + 2, y + S.p / 2 - 1); c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, x - S.l / 2 + 1, y - S.p / 2 + 1.2, S.l, S.p, 1.5); c.fill();
      c.fillStyle = S.coul; rr(c, x - S.l / 2, y - S.p / 2, S.l, S.p, 1.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - S.l / 2 + 1, y - S.p / 2 + 0.6, S.l - 2, 1);
      break;
    }
    case 'banane': {
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, -8); c.quadraticCurveTo(9, 0, 6, 8); c.stroke();
      c.fillStyle = S.coul; rr(c, 6, -S.l / 2, S.p, S.l, 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(6.6, -S.l / 2 + 1, 0.9, S.l - 2);
      break;
    }
    default: break;
  }
  c.restore();
}

// ---------- Vivants ----------
// P = { manteau, pantalon, chaussures, peau, cheveux, coiffure: 'court'|'long'|'chauve'|'capuche', sac: id du sac porté
//       (SACS) | true (sac à dos) | false, taille, contour }
// A = { t, marche (0..1), phase (rad), allure, geste: { type, p, combo }, charge (0..1), vise, empoigne, arme (id),
//       lampe (bool), mainG (id), flash (0..1), fantome (bool), aTerre (bool), agonie (bool) }
export function dessinerHumain(c, x, y, dir, P, A) {
  const s = (P.taille || 1);
  c.save();
  c.translate(x, y); c.rotate(dir); c.scale(s, s);
  if (A.fantome) c.globalAlpha = 0.55;
  if (A.agonie || A.aTerre) { couche(c, P, A); c.restore(); return; }
  const m = A.marche || 0, ph = A.phase || 0;
  const pas = Math.sin(ph) * 7 * m, bal = Math.sin(ph * 2) * 0.8 * m;
  const accroupi = A.allure === 'accroupi', course = A.allure === 'course';
  // ombre
  if (!A.fantome) { c.fillStyle = 'rgba(0,0,0,0.4)'; ellipse(c, 2.5, 3.5, 14, 12); c.fill(); }
  // contour (coéquipier) : un halo net, visible même dans le noir
  if (P.contour) {
    c.strokeStyle = P.contour; c.lineWidth = 3;
    ellipse(c, -1, 0, 10.5, 15.5); c.stroke(); cercle(c, 2, 0, 9); c.stroke();
    if (A.fantome) { c.restore(); return; }
  }
  // jambes
  const jb = P.pantalon || '#2a2a2e', ch = P.chaussures || '#18140f';
  c.strokeStyle = jb; c.lineWidth = 5.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-1, -4.5); c.lineTo(pas * 0.9 + (accroupi ? 4 : 0), -5.5); c.moveTo(-1, 4.5); c.lineTo(-pas * 0.9 + (accroupi ? 4 : 0), 5.5); c.stroke();
  c.fillStyle = ch; ellipse(c, pas + 1.5 + (accroupi ? 4 : 0), -5.5, 4.6, 3); c.fill(); ellipse(c, -pas + 1.5 + (accroupi ? 4 : 0), 5.5, 4.6, 3); c.fill();
  // sac (derrière le torse : dos, hanche, valise)
  const sac = sacDe(P.sac);
  if (sac) sacArriere(c, sac, bal, m, ph);
  // torse (manteau) avec ombrage
  const tx = course ? 2 : accroupi ? 1 : 0;
  const g = c.createLinearGradient(-6, -12, 6, 12);
  g.addColorStop(0, teinte(P.manteau, 1.28)); g.addColorStop(1, teinte(P.manteau, 0.72));
  c.fillStyle = g; ellipse(c, -1 + tx, bal, 9.5, accroupi ? 13 : 14.5); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = teinte(P.manteau, 0.6); ellipse(c, 2.5 + tx, bal, 3.5, 6.5); c.fill(); // col
  if (sac) sacAvant(c, sac, bal, m, ph);
  // bras
  const peau = P.peau || '#b89378', manche = teinte(P.manteau, 0.92);
  const pose = poseBras(A);
  // arme dans la main droite (côté +y)
  const Ld = LONGUEUR[pose.forme] || 10;
  if (pose.armeAvant === false) dessinerTenue(c, pose, Ld);
  bras(c, 1 + tx, -12 + bal, pose.gx, pose.gy, manche, peau);
  bras(c, 1 + tx, 12 + bal, pose.dx, pose.dy, manche, peau);
  if (pose.armeAvant !== false) dessinerTenue(c, pose, Ld);
  // lampe à la main gauche
  if (pose.lampeG) { c.save(); c.translate(pose.gx, pose.gy); c.rotate(pose.lampeG); dessinerArme(c, 'lampe', 9); c.restore(); }
  // tête
  const hx = 2.5 + tx + (course ? 1.5 : 0);
  c.fillStyle = peau; cercle(c, hx, bal * 0.5, 7.2); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.18)'; cercle(c, hx + 2, bal * 0.5 + 1.5, 4); c.fill();
  const che = P.cheveux || '#241a12';
  c.fillStyle = che;
  const coif = P.coiffure || 'court';
  if (coif === 'capuche') { c.fillStyle = teinte(P.manteau, 0.85); c.beginPath(); c.arc(hx, bal * 0.5, 8.2, PI * 0.35, PI * 1.65); c.closePath(); c.fill(); }
  else if (coif !== 'chauve') {
    c.beginPath(); c.arc(hx - 0.5, bal * 0.5, 7.4, PI * 0.42, PI * 1.58); c.closePath(); c.fill();
    if (coif === 'long') { ellipse(c, hx - 6.5, bal * 0.5, 4.5, 6.5); c.fill(); }
    c.fillStyle = 'rgba(255,240,220,0.08)'; cercle(c, hx - 2.5, bal * 0.5 - 2.5, 3); c.fill();
  }
  // lampe frontale
  if (A.frontale) { c.fillStyle = '#2a2a2c'; rr(c, hx + 4, -2, 3, 4, 1); c.fill(); c.fillStyle = '#f8ecc0'; c.fillRect(hx + 6.5, -1.4, 1.2, 2.8); }
  // éclair de coup reçu
  if (A.flash > 0.02) { c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,60,60,${0.5 * A.flash})`; ellipse(c, 0, 0, 12, 16); c.fill(); }
  c.restore();
}
function dessinerTenue(c, pose, L) {
  if (!pose.forme) return;
  c.save(); c.translate(pose.dx, pose.dy); c.rotate(pose.angle); dessinerArme(c, pose.forme, L); c.restore();
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
// Allongé (à terre, agonie) : on rampe sur le dos.
function couche(c, P, A) {
  const t = A.t || 0;
  c.fillStyle = 'rgba(0,0,0,0.35)'; ellipse(c, 0, 2, 20, 12); c.fill();
  if (P.contour) { c.strokeStyle = P.contour; c.lineWidth = 3; ellipse(c, 0, 0, 20, 11); c.stroke(); }
  c.strokeStyle = P.pantalon || '#2a2a2e'; c.lineWidth = 5.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-6, -4); c.lineTo(-20, -6 + Math.sin(t / 300) * 2); c.moveTo(-6, 4); c.lineTo(-20, 7); c.stroke();
  c.fillStyle = teinte(P.manteau, 1); ellipse(c, 0, 0, 11, 9.5); c.fill();
  bras(c, 4, -8, 12 + Math.sin(t / 250) * 3, -14, teinte(P.manteau, 0.9), P.peau || '#b89378');
  bras(c, 4, 8, 14, 12, teinte(P.manteau, 0.9), P.peau || '#b89378');
  c.fillStyle = P.peau || '#b89378'; cercle(c, 12, 0, 7); c.fill();
  c.fillStyle = P.cheveux || '#241a12'; c.beginPath(); c.arc(11.5, 0, 7.2, PI * 0.42, PI * 1.58); c.closePath(); c.fill();
  if (A.agonie) { c.fillStyle = 'rgba(80,8,10,0.75)'; ellipse(c, -2, 4, 14, 9); c.fill(); }
}

// ---------- Morts ----------
// Apparence tirée de l'uid (même tirage chez les deux joueurs).
const apparences = new Map();
export function apparenceMort(uid, type, sexe, allure) {
  const cle = uid + ':' + type;
  let a = apparences.get(cle);
  if (a) return a;
  const r = rng(graine(cle));
  const A = allure || {};
  const peaux = A.peau || ['#7d8070', '#86836f', '#737a6c'];
  const vets = A.vetements || ['#3b3128', '#2e3136', '#463a36', '#3a4048'];
  a = {
    peau: peaux[Math.floor(r() * peaux.length)], manteau: vets[Math.floor(r() * vets.length)],
    pantalon: ['#2a2a2e', '#232a36', '#3a3226', '#1e1e20'][Math.floor(r() * 4)],
    cheveux: ['#1e1612', '#3a2a1a', '#5a5048', '#2a2420', '#7a6a5a'][Math.floor(r() * 5)],
    coiffure: sexe === 'f' ? (r() < 0.75 ? 'long' : 'court') : (r() < 0.25 ? 'chauve' : 'court'),
    taches: Array.from({ length: 2 + Math.floor(r() * 3) }, () => ({ x: -6 + r() * 10, y: -12 + r() * 24, r: 2.5 + r() * 4 })),
    brasMort: r() < 0.18 ? (r() < 0.5 ? -1 : 1) : 0,     // un bras ballant
    tete: (r() - 0.5) * 3,                                // tête penchée
    boite: r() < 0.5 ? 1 : -1,                            // jambe qui traîne
    taille: (A.taille || 1) * (0.95 + r() * 0.1), carrure: A.carrure || 1,
  };
  apparences.set(cle, a);
  return a;
}

export function dessinerMort(c, x, y, z, t, def) {
  const ap = apparenceMort(z.uid, z.type, z.sexe, def && def.allure);
  const s = ap.taille, car = ap.carrure;
  c.save();
  c.translate(x, y); c.rotate(z.dir || 0); c.scale(s, s);
  if (z.terre) { corpsAuSol(c, ap, t, true, z.uid); c.restore(); return; }
  const v = Math.min(1, (z.vitesse || 0) / 1.2), ph = z._phase || 0;
  const coureur = z.type === 'coureur', rampant = z.type === 'rampant', hurleur = z.type === 'hurleur', colosse = z.type === 'colosse';
  // télégraphie : il arme son coup (bras en arrière), puis se fend vers l'avant
  let fente = 0, armer = 0;
  if (z.atk) { const p = z.atk.p || 0; if (p < 0.85) armer = easeOut(p / 0.85); else fente = (p - 0.85) / 0.15; }
  if (z.fente != null) { fente = 1 - Math.abs(z.fente - 0.5) * 0.6; armer = 0; }
  const avance = fente * 7 - armer * 2.5;
  const jit = z.vac ? Math.sin(t / 25 + x) * 2.2 : 0;
  c.translate(avance + jit, jit * 0.5);
  // ombre
  c.fillStyle = 'rgba(0,0,0,0.42)'; ellipse(c, 2.5, 3.5, rampant ? 20 : 14 * car, 12 * car); c.fill();
  if (rampant) { rampe(c, ap, z, t, armer, fente); c.restore(); return; }
  // jambes : pas traînant (errant), course (coureur)
  const pas = Math.sin(ph) * (coureur ? 8 : 5) * v;
  c.strokeStyle = ap.pantalon; c.lineWidth = 5.5 * car; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-1, -4.5 * car); c.lineTo(pas * (ap.boite > 0 ? 0.5 : 1), -5.5 * car); c.moveTo(-1, 4.5 * car); c.lineTo(-pas * (ap.boite < 0 ? 0.5 : 1), 5.5 * car); c.stroke();
  c.fillStyle = '#16120e'; ellipse(c, pas + 1.5, -5.5 * car, 4.4, 2.8); c.fill(); ellipse(c, -pas + 1.5, 5.5 * car, 4.4, 2.8); c.fill();
  // torse déchiré (contour irrégulier), taches de sang
  const bal = Math.sin(ph * 0.5) * 2.2 * (coureur ? 0.4 : 1);
  const lean = coureur ? 3 : colosse ? 0 : 1;
  c.save(); c.translate(lean, bal);
  c.fillStyle = ap.manteau; c.beginPath();
  for (let k = 0; k <= 14; k++) { const a = k / 14 * PI * 2; const rr2 = 1 - (hash(k, z.uid.length, 3) - 0.5) * 0.14; c.lineTo(Math.cos(a) * 9.5 * car * rr2 - 1, Math.sin(a) * 14.5 * car * rr2); }
  c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)'; ellipse(c, -3, 0, 6 * car, 12 * car); c.fill();
  for (const tc of ap.taches) { c.fillStyle = 'rgba(70,6,8,0.8)'; cercle(c, tc.x * car, tc.y * car, tc.r); c.fill(); }
  if (colosse) { c.fillStyle = teinte(ap.peau, 0.85); ellipse(c, 2, 0, 5, 9); c.fill(); }
  c.restore();
  // bras tendus vers la proie
  const peau = ap.peau, manche = teinte(ap.manteau, 0.9);
  const tw = Math.sin(t / 140 + z.uid.length) * 1.5;
  const tend = 13 + v * 2;
  let gx = tend + tw - armer * 18 + fente * 9, gy = -9 * car - armer * 3, dx = tend - tw - armer * 18 + fente * 9, dy = 9 * car + armer * 3;
  if (coureur && v > 0.5 && !z.atk) { gx = -6 + Math.sin(ph + PI) * 6; gy = -15; dx = -6 + Math.sin(ph) * 6; dy = 15; }
  if (ap.brasMort < 0 && !z.atk) { gx = 2; gy = -16; }
  if (ap.brasMort > 0 && !z.atk) { dx = 2; dy = 16; }
  if (z.vac) { gx = 4 + Math.sin(t / 35) * 6; gy = -16; dx = 2 - Math.sin(t / 30) * 6; dy = 17; }
  bras(c, 1 + lean, -12 * car + bal, gx + lean, gy + bal, manche, peau, 5 * car);
  bras(c, 1 + lean, 12 * car + bal, dx + lean, dy + bal, manche, peau, 5 * car);
  // tête
  const hx = 3 + lean + (coureur ? 2 : 0), hy = bal * 0.6 + ap.tete;
  c.fillStyle = peau; cercle(c, hx, hy, 7 * (colosse ? 1.1 : 1)); c.fill();
  c.fillStyle = 'rgba(30,40,30,0.35)'; cercle(c, hx + 1.5, hy + 2, 4.5); c.fill();
  if (ap.coiffure !== 'chauve') {
    c.fillStyle = ap.cheveux; c.beginPath(); c.arc(hx - 0.5, hy, 7.2, PI * 0.5, PI * 1.5); c.closePath(); c.fill();
    if (ap.coiffure === 'long') { ellipse(c, hx - 6, hy + 1, 4.5, 7); c.fill(); }
  } else { c.fillStyle = 'rgba(60,40,40,0.4)'; cercle(c, hx - 2, hy - 2, 2.5); c.fill(); }
  // yeux laiteux, bouche
  c.fillStyle = 'rgba(220,214,180,0.85)'; cercle(c, hx + 5, hy - 2.4, 1.1); c.fill(); cercle(c, hx + 5, hy + 2.4, 1.1); c.fill();
  const hurle = hurleur && (z.etat === 'chasse') && Math.sin(t / 400 + z.uid.length) > 0.3;
  if (hurle || z.atk) { c.fillStyle = '#1a0606'; ellipse(c, hx + 6, hy, hurle ? 2.6 : 1.8, hurle ? 3 : 2); c.fill(); }
  // éclair blanc quand il encaisse
  if (z.tTouche && t - z.tTouche < 140) { c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,240,230,${0.55 * (1 - (t - z.tTouche) / 140)})`; ellipse(c, 0, 0, 12 * car, 16 * car); c.fill(); }
  c.restore();
}
function rampe(c, ap, z, t, armer, fente) {
  const ph = z._phase || 0;
  // le bas du corps manque : traînée sombre
  c.fillStyle = 'rgba(50,6,8,0.6)'; ellipse(c, -16, 0, 9, 5); c.fill();
  c.fillStyle = ap.manteau; ellipse(c, -6, 0, 11, 9); c.fill();
  for (const tc of ap.taches.slice(0, 2)) { c.fillStyle = 'rgba(70,6,8,0.8)'; cercle(c, tc.x - 6, tc.y * 0.6, tc.r); c.fill(); }
  c.fillStyle = 'rgba(70,40,40,0.8)'; ellipse(c, -16, 0, 3, 6); c.fill(); // la plaie
  const tire = Math.sin(ph) * 6;
  bras(c, 0, -7, 13 + tire - armer * 10 + fente * 8, -11, teinte(ap.manteau, 0.9), ap.peau, 4.6);
  bras(c, 0, 7, 13 - tire - armer * 10 + fente * 8, 11, teinte(ap.manteau, 0.9), ap.peau, 4.6);
  c.fillStyle = ap.peau; cercle(c, 5, 0, 6.5); c.fill();
  c.fillStyle = ap.cheveux; c.beginPath(); c.arc(4.5, 0, 6.7, PI * 0.5, PI * 1.5); c.closePath(); c.fill();
  c.fillStyle = 'rgba(220,214,180,0.85)'; cercle(c, 9.5, -2.2, 1); c.fill(); cercle(c, 9.5, 2.2, 1); c.fill();
  if (z.tTouche && t - z.tTouche < 140) { c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,230,0.5)'; ellipse(c, -2, 0, 14, 10); c.fill(); }
}
// Corps étendu (mort à terre qui se relève, ou cadavre).
function corpsAuSol(c, ap, t, bouge, uid) {
  const r = rng(graine(String(uid)));
  const tw = bouge ? Math.sin(t / 160) * 3 : 0;
  c.strokeStyle = ap.pantalon; c.lineWidth = 5.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-6, -4); c.lineTo(-21, -7 + r() * 6); c.moveTo(-6, 4); c.lineTo(-21, 7 - r() * 6); c.stroke();
  c.fillStyle = ap.manteau; ellipse(c, 0, 0, 11.5, 10); c.fill();
  for (const tc of ap.taches) { c.fillStyle = 'rgba(70,6,8,0.8)'; cercle(c, tc.x * 0.8, tc.y * 0.6, tc.r); c.fill(); }
  bras(c, 3, -9, 10 + r() * 6 + tw, -17 + r() * 4, teinte(ap.manteau, 0.9), ap.peau);
  bras(c, 3, 9, 8 + r() * 8 - tw, 17 - r() * 4, teinte(ap.manteau, 0.9), ap.peau);
  c.fillStyle = ap.peau; cercle(c, 13, 0, 6.8); c.fill();
  if (ap.coiffure !== 'chauve') { c.fillStyle = ap.cheveux; c.beginPath(); c.arc(12.5, 0, 7, PI * 0.5, PI * 1.5); c.closePath(); c.fill(); }
}

// Cadavre : flaque qui s'étend les premières secondes (frais = ms depuis la mort, ou null).
export function dessinerCadavre(c, cd, t, frais, def) {
  const ap = apparenceMort(cd.uid, cd.type, cd.sexe, def && def.allure);
  const r = rng(graine('cad' + cd.uid));
  const k = frais == null ? 1 : clamp(frais / 2500, 0, 1);
  c.save();
  c.translate(cd.x * TS, cd.y * TS); c.rotate((cd.dir || 0) + PI + (r() - 0.5) * 0.8);
  // flaque de sang
  c.fillStyle = 'rgba(48,4,6,0.78)';
  ellipse(c, 4, 0, (10 + 14 * k) * (0.8 + r() * 0.4), (8 + 9 * k) * (0.8 + r() * 0.4), r()); c.fill();
  c.fillStyle = 'rgba(100,14,16,0.22)'; ellipse(c, 2, -2, 6 + 6 * k, 4 + 3 * k, r()); c.fill();
  const chute = frais == null ? 1 : easeOut(clamp(frais / 380, 0, 1));
  c.scale(0.75 + 0.25 * chute, 1);
  corpsAuSol(c, ap, t, false, cd.uid);
  c.restore();
}

// Fondu de contour d'une silhouette pour le marquage d'une cible (PC : survol / tactile : visée auto).
export function apparenceJoueur(p, couleurs) {
  return { ...couleurs, sac: (p && p.equip && p.equip.sac) || false };
}

void hash; void ease;
