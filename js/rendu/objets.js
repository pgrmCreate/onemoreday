// ============ Couche OBJETS : meubles et décor dessinés à la main (vue de dessus, lumière venant du haut-gauche) ============
// dessinerObjet(c, R) : R = { type, x, y, w, h, rot, variante, couleur, cases? } en cases ; c en coordonnées monde.
// Les houppiers d'arbres, têtes de lampadaires (partie « haut ») sont dessinés à part, AU-DESSUS des personnages
// (spriteHaut), pour qu'on passe dessous.
import { TS, TF, rng, canvas, rr, cercle, ellipse, avecOmbre, boite, teinte, hex, rgb } from './outils.js';

const BOIS = '#5d4128', BOIS_C = '#7a5838', BOIS_F = '#3b2819', METAL = '#6e7272', BLANC = '#c9c4b6', DRAP = '#b9b2a0';
const pick = (r, a) => a[Math.floor(r() * a.length)];

// ---------- Sprites photoréalistes (rendus dans Blender : tools/blender/omd_assets.py → img/objets) ----------
// img/objets/objets.json : { type: { n (variantes), m (marge, cases), h (hauteur, m), c? ([couleurs] des variantes), plat? } }.
// Chaque sprite couvre l'empreinte de l'objet + la marge, vu de dessus, sans ombre : l'ombre portée est dessinée ici d'après
// la silhouette (toujours vers le bas-droite, quelle que soit la rotation), plus longue pour un meuble haut.
// Tant qu'un sprite n'est pas arrivé, le dessin procédural (DESSINS) sert ; à l'arrivée, le moteur refait ses blocs.
const SP = { meta: null, img: new Map(), surPret: new Set(), lance: false, t: 0 };
const BASE_OBJ = typeof document !== 'undefined' ? new URL('../../img/objets/', import.meta.url) : null;
export function chargerObjetsPhoto() {
  if (SP.lance || !BASE_OBJ || typeof Image === 'undefined') return; SP.lance = true;
  fetch(new URL('objets.json', BASE_OBJ)).then(r => (r.ok ? r.json() : null)).then(m => {
    if (!m) return; SP.meta = m;
    // préchargement en tâche de fond : les blocs sont refaits au fil des arrivées (au plus 2 fois par seconde)
    for (const [type, d] of Object.entries(m)) for (let v = 0; v < (d.n || 1); v++) imageObjet(type, v);
  }).catch(() => {});
}
export function surObjetsPrets(fn) { SP.surPret.add(fn); return () => SP.surPret.delete(fn); }
function signalerPret() {
  if (SP.t) return;
  SP.t = setTimeout(() => { SP.t = 0; for (const f of SP.surPret) { try { f(); } catch (e) {} } }, 450);
}
function imageObjet(type, v) {
  const cle = type + '_' + v;
  let im = SP.img.get(cle);
  if (!im) { im = new Image(); im.decoding = 'async'; im.onload = signalerPret; im.src = new URL(`${type}_${v}.webp`, BASE_OBJ).href; SP.img.set(cle, im); }
  return im.complete && im.naturalWidth ? im : null;
}
const hexRgb = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
function spriteObjet(R) {
  if (!SP.meta) return null;
  const nom = (R.vide && SP.meta[R.type + '_vide']) ? R.type + '_vide' : R.type;
  const m = SP.meta[nom]; if (!m) return null;
  let v = Math.abs(R.variante || 0) % (m.n || 1);
  // une couleur imposée par la carte (voiture noire, couverture rouge…) : la variante la plus proche
  if (R.couleur && m.c) { const a = hexRgb(R.couleur); let bd = Infinity; m.c.forEach((c, i) => { const b = hexRgb(c); const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; if (d < bd) { bd = d; v = i; } }); }
  const im = imageObjet(nom, v);
  return im ? { im, m } : null;
}
// Retouches dynamiques par-dessus un sprite (feu qui danse, usure d'une construction…).
const PAR_DESSUS = {
  feu_camp: (c, W, H, r, R) => flammes(c, W, H, R, 0.24), feu_branches: (c, W, H, r, R) => flammes(c, W, H, R, 0.22),
  brasero: (c, W, H, r, R) => flammes(c, W, H, { c: { feuJusqua: 1 }, minutes: 0 }, 0.2), four_pierre: (c, W, H, r, R) => flammes(c, W, H, R, 0.1),
  torche_murale: (c, W, H, r, R) => flammes(c, W, H, R, 0.12),
};
function flammes(c, W, H, R, k) {
  const allume = R && R.c && (R.c.feuJusqua || 0) > (R.minutes || 0);
  if (!allume) return;
  const t = performance.now() / 120, f = 0.85 + 0.15 * Math.sin(t) * Math.sin(t * 1.7), rr2 = Math.min(W, H) * k * f;
  const g = c.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, rr2); g.addColorStop(0, 'rgba(255,225,130,0.95)'); g.addColorStop(0.5, 'rgba(255,140,50,0.75)'); g.addColorStop(1, 'rgba(160,40,10,0)');
  c.fillStyle = g; cercle(c, W / 2, H / 2, rr2); c.fill();
}
function dessinerSprite(c, R, S, W, H, r) {
  const mg = (S.m.m ?? 0.12) * TS;
  // une carte qui pose l'objet sur une empreinte d'une autre forme (housse sur une seule case…) : on garde ses proportions
  if (S.m.t && Math.abs((W / H) / (S.m.t[0] / S.m.t[1]) - 1) > 0.15) {
    const k = Math.min(W / S.m.t[0], H / S.m.t[1]), w2 = S.m.t[0] * k, h2 = S.m.t[1] * k;
    c.save(); c.translate((W - w2) / 2, (H - h2) / 2); dessinerSprite(c, R, { ...S, m: { ...S.m, t: null, m: (S.m.m ?? 0.12) * k / TS } }, w2, h2, r); c.restore();
    return;
  }
  const h = S.m.h ?? 0.5;
  if (S.m.tourne) { c.translate(W / 2, H / 2); c.rotate((r() - 0.5) * 2 * S.m.tourne); c.translate(-W / 2, -H / 2); }
  // ombre portée : plus le meuble est haut, plus elle s'allonge vers le bas-droite (lumière du haut-gauche)
  if (!S.m.plat) {
    c.save();
    c.shadowColor = `rgba(0,0,0,${Math.min(0.62, 0.36 + h * 0.12).toFixed(2)})`;
    c.shadowBlur = Math.min(16, 3 + h * 6); const o = Math.min(14, 1.5 + h * 6.5);
    c.shadowOffsetX = o; c.shadowOffsetY = o;
    c.drawImage(S.im, -mg, -mg, W + 2 * mg, H + 2 * mg);
    c.restore();
  } else c.drawImage(S.im, -mg, -mg, W + 2 * mg, H + 2 * mg);
  const P = PAR_DESSUS[R.type]; if (P) P(c, W, H, r, R);
  if (R.c) usure(c, W, H, R);
}

export function dessinerObjet(c, R) {
  const D = DESSINS[R.type] || DESSINS._defaut;
  const r = rng((R.variante || 0) * 7919 + R.x * 131 + R.y * 977 + 1);
  const S = spriteObjet(R);
  if (S && !R.irregulier) {
    const rot = R.rot || 0, quart = rot % 2 === 1;
    const W = (quart ? R.h : R.w) * TS, H = (quart ? R.w : R.h) * TS;
    c.save();
    c.translate((R.x + R.w / 2) * TS, (R.y + R.h / 2) * TS);
    if (rot) c.rotate(rot * Math.PI / 2);
    c.translate(-W / 2, -H / 2);
    dessinerSprite(c, R, S, W, H, r);
    c.restore();
    return;
  }
  if (R.irregulier) {
    // forme irrégulière (ancien format) : une boîte par case, du type de l'objet
    // (cases : petites cases de la grille fine, TF px)
    const w = R.E_w;
    for (const j of R.cases) { const x = (j % w) * TF, y = ((j / w) | 0) * TF; c.save(); c.translate(x, y); D(c, TF, TF, r, R); c.restore(); }
    return;
  }
  const rot = R.rot || 0, quart = rot % 2 === 1;
  const W = (quart ? R.h : R.w) * TS, H = (quart ? R.w : R.h) * TS;
  c.save();
  c.translate((R.x + R.w / 2) * TS, (R.y + R.h / 2) * TS);
  if (rot) c.rotate(rot * Math.PI / 2);
  c.translate(-W / 2, -H / 2);
  D(c, W, H, r, R);
  c.restore();
}

// ---------- Aides ----------
function grainBois(c, x, y, w, h, r, n = 4, a = 0.22) {
  c.strokeStyle = `rgba(25,14,6,${a})`; c.lineWidth = 0.8;
  const horiz = w >= h;
  for (let k = 0; k < n; k++) {
    c.beginPath();
    if (horiz) { const yy = y + 2 + r() * (h - 4); c.moveTo(x + 2, yy); c.bezierCurveTo(x + w / 3, yy + r() * 2 - 1, x + 2 * w / 3, yy + r() * 2 - 1, x + w - 2, yy); }
    else { const xx = x + 2 + r() * (w - 4); c.moveTo(xx, y + 2); c.bezierCurveTo(xx + r() * 2 - 1, y + h / 3, xx + r() * 2 - 1, y + 2 * h / 3, xx, y + h - 2); }
    c.stroke();
  }
}
function objetsSurTable(c, x, y, w, h, r, n = 3) {
  for (let k = 0; k < n; k++) {
    const t = r();
    const ox = x + 6 + r() * (w - 12), oy = y + 6 + r() * (h - 12);
    if (t < 0.25) { c.fillStyle = '#d8d2c2'; cercle(c, ox, oy, 5); c.fill(); c.fillStyle = 'rgba(0,0,0,0.12)'; cercle(c, ox, oy, 3); c.fill(); }          // assiette
    else if (t < 0.45) { c.fillStyle = 'rgba(40,70,40,0.9)'; cercle(c, ox, oy, 2.6); c.fill(); c.fillStyle = 'rgba(200,240,200,0.4)'; cercle(c, ox - 0.8, oy - 0.8, 0.9); c.fill(); } // bouteille
    else if (t < 0.7) { c.save(); c.translate(ox, oy); c.rotate(r() * 3); c.fillStyle = '#d6cfba'; c.fillRect(-5, -4, 10, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-4, -2, 7, 0.8); c.fillRect(-4, 0, 6, 0.8); c.restore(); } // papier
    else if (t < 0.85) { c.fillStyle = '#e8e2d2'; cercle(c, ox, oy, 3); c.fill(); c.fillStyle = '#3a2412'; cercle(c, ox, oy, 2); c.fill(); }        // tasse
    else { c.fillStyle = pick(r, ['#8a2a2a', '#2a4a6a', '#3a3a3a']); c.save(); c.translate(ox, oy); c.rotate(r()); rr(c, -6, -4, 12, 8, 1); c.fill(); c.restore(); } // livre
  }
}
// Construction abîmée : fissures et éclats selon les PV restants.
function usure(c, W, H, R) {
  const e = R && R.c && R.c.pvMax ? R.c.pv / R.c.pvMax : 1; if (e > 0.85) return;
  c.strokeStyle = `rgba(20,12,6,${0.5 + 0.4 * (1 - e)})`; c.lineWidth = 1.2;
  const n = Math.ceil((1 - e) * 6);
  for (let k = 0; k < n; k++) { const x = (k * 37 % 100) / 100 * W, y = (k * 53 % 100) / 100 * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6 - k, y + 5); c.lineTo(x + 2, y + 10); c.stroke(); }
}
function pieds(c, x, y, w, h, coul = '#20160c') { c.fillStyle = coul; const d = 3; for (const [px, py] of [[x + d, y + d], [x + w - d, y + d], [x + d, y + h - d], [x + w - d, y + h - d]]) { cercle(c, px, py, 1.6); c.fill(); } }
// Étagère pillée : planches nues, poussière, un emballage déchiré ou une boîte renversée de temps en temps.
function etagereVidee(c, x, y, w, h, r) {
  c.fillStyle = 'rgba(120,110,95,0.10)'; c.fillRect(x, y, w, h);
  const rangs = Math.max(1, Math.round(h / 12)), hh = h / rangs;
  c.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 1; k < rangs; k++) c.fillRect(x, y + k * hh - 0.5, w, 1);
  const n = 1 + Math.floor(r() * 3);
  for (let k = 0; k < n; k++) {
    const ox = x + 3 + r() * (w - 8), oy = y + 2 + r() * (h - 6);
    if (r() < 0.5) { c.fillStyle = pick(r, ['#b8b0a0', '#8a3a2a', '#c8a032']); c.save(); c.translate(ox, oy); c.rotate(r() * 3); c.fillRect(-2.5, -1.5, 5, 3); c.restore(); }
    else { c.fillStyle = 'rgba(210,200,180,0.35)'; c.fillRect(ox, oy, 4 + r() * 4, 1); }
  }
}
function articlesEtagere(c, x, y, w, h, r, vide = 0.25) {
  const rangs = Math.max(1, Math.round(h / 12)); const hh = h / rangs;
  for (let k = 0; k < rangs; k++) {
    let xx = x + 3;
    while (xx < x + w - 5) {
      const ww = 3 + r() * 7;
      if (r() > vide) {
        const t = r();
        c.fillStyle = t < 0.3 ? pick(r, ['#8a3a2a', '#2a5a7a', '#c8a032', '#5a7a3a', '#d8d0c0', '#6a2a5a']) : t < 0.6 ? pick(r, ['#a8a090', '#7a7266', '#b8b4a8']) : pick(r, ['#6a4a2a', '#4a3a2a', '#8a6a3a']);
        if (t < 0.3) { cercle(c, xx + ww / 2, y + k * hh + hh / 2, Math.min(ww, hh) * 0.4); c.fill(); }
        else { c.fillRect(xx, y + k * hh + 2, ww - 1, hh - 4); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(xx, y + k * hh + 2, ww - 1, 1.2); }
      }
      xx += ww + 1;
    }
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 1, y + (k + 1) * hh - 1.2, w - 2, 1.2);
  }
}
function vitre(c, x, y, w, h) {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#1a2a34'); g.addColorStop(0.45, '#3a5868'); g.addColorStop(1, '#111c22');
  c.fillStyle = g; rr(c, x, y, w, h, 3); c.fill();
  c.fillStyle = 'rgba(220,240,255,0.14)'; c.beginPath(); c.moveTo(x + w * 0.15, y + 2); c.lineTo(x + w * 0.45, y + 2); c.lineTo(x + w * 0.25, y + h - 2); c.lineTo(x + w * 0.05, y + h - 2); c.closePath(); c.fill();
}

// ---------- Les dessins ----------
// Chaque dessin reçoit (c, W, H, r, R) : il dessine dans [0..W] × [0..H] (orientation de base = horizontale).
const DESSINS = {
  _defaut(c, W, H) { boite(c, 4, 4, W - 8, H - 8, '#5a4a3a'); },

  table(c, W, H, r) {
    const ronde = W === H && r() < 0.4;
    if (ronde) { avecOmbre(c, 8, 3, 5, 0.6, () => { c.fillStyle = BOIS; cercle(c, W / 2, H / 2, W / 2 - 5); c.fill(); }); c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2; c.stroke(); grainBois(c, 8, 8, W - 16, H - 16, r, 3); }
    else { boite(c, 4, 5, W - 8, H - 10, teinte(BOIS, 0.85 + r() * 0.3), { r: 4 }); grainBois(c, 6, 7, W - 12, H - 14, r, 5); }
    objetsSurTable(c, 4, 5, W - 8, H - 10, r, 1 + Math.floor(r() * 3));
  },
  table_ronde(c, W, H, r) { avecOmbre(c, 8, 3, 5, 0.6, () => { c.fillStyle = BOIS; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 5); c.fill(); }); grainBois(c, 10, 10, W - 20, H - 20, r, 2); objetsSurTable(c, 10, 10, W - 20, H - 20, r, 2); },
  chaise(c, W, H, r) {
    c.save(); c.translate(W / 2, H / 2); c.rotate((r() - 0.5) * 1.2 + (r() < 0.2 ? Math.PI / 2 : 0));
    const s = TS * 0.42;
    boite(c, -s / 2, -s / 2, s, s, teinte(BOIS, 0.9 + r() * 0.3), { r: 3, flou: 5, dx: 2, dy: 3 });
    c.fillStyle = BOIS_F; rr(c, -s / 2, -s / 2 - 3, s, 5, 2); c.fill();
    if (r() < 0.25) { c.fillStyle = '#6a2a2a'; rr(c, -s / 2 + 3, -s / 2 + 4, s - 6, s - 7, 2); c.fill(); }
    c.restore();
  },
  comptoir(c, W, H, r) {
    boite(c, 2, 3, W - 4, H - 6, '#4a3626', { r: 2 });
    c.fillStyle = '#7a6a52'; rr(c, 4, 5, W - 8, H - 12, 2); c.fill();
    c.fillStyle = 'rgba(255,240,220,0.12)'; c.fillRect(5, 6, W - 10, 1.5);
    objetsSurTable(c, 4, 5, W - 8, H - 12, r, Math.ceil(W / TS));
  },
  cuisine(c, W, H, r) {
    boite(c, 2, 2, W - 4, H - 4, '#5a554c', { r: 2 });
    c.fillStyle = '#8a857a'; rr(c, 4, 4, W - 8, H - 10, 2); c.fill();
    const n = Math.max(1, Math.round(W / TS));
    for (let k = 0; k < n; k++) {
      const x = k * W / n, t = (k + Math.floor(r() * 3)) % 3;
      if (t === 0) { c.fillStyle = '#2a2a2a'; rr(c, x + 7, 7, W / n - 14, H - 16, 2); c.fill(); c.strokeStyle = '#555'; c.lineWidth = 1.5; for (const [ox, oy] of [[0.3, 0.33], [0.7, 0.33], [0.3, 0.7], [0.7, 0.7]]) { cercle(c, x + W / n * ox, 4 + (H - 10) * oy, 4.5); c.stroke(); } }
      else if (t === 1) { c.fillStyle = '#9aa0a2'; rr(c, x + 8, 7, W / n - 16, H - 16, 4); c.fill(); c.fillStyle = '#5a6064'; rr(c, x + 11, 9, W / n - 22, H - 20, 3); c.fill(); c.fillStyle = '#c0c4c4'; cercle(c, x + W / n / 2, 7, 2); c.fill(); }
      else objetsSurTable(c, x + 4, 4, W / n - 8, H - 10, r, 2);
    }
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(4, H - 6, W - 8, 2);
  },
  etagere(c, W, H, r, R) {
    boite(c, 2, 4, W - 4, H - 8, BOIS_F, { r: 2 });
    c.fillStyle = '#2a1e12'; c.fillRect(5, 7, W - 10, H - 14);
    if (R && R.vide) etagereVidee(c, 5, 7, W - 10, H - 14, r);
    else articlesEtagere(c, 5, 7, W - 10, H - 14, r, 0.12);
  },
  rayonnage(c, W, H, r, R) {
    boite(c, 2, 4, W - 4, H - 8, '#5a5e60', { r: 1 });
    c.fillStyle = '#2a2c2e'; c.fillRect(4, 6, W - 8, H - 12);
    if (R && R.vide) etagereVidee(c, 4, 6, W - 8, H - 12, r);
    else articlesEtagere(c, 4, 6, W - 8, H - 12, r, 0.15);
    c.fillStyle = 'rgba(200,60,40,0.7)'; for (let x = 10; x < W - 10; x += TS) c.fillRect(x, H - 7, 10, 2);
  },
  armoire(c, W, H, r) {
    boite(c, 2, 3, W - 4, H - 6, teinte(BOIS, 0.75 + r() * 0.25), { r: 2, ombre: 0.7, flou: 10 });
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.2; rr(c, 6, 6, W - 12, H - 12, 2); c.stroke();
    grainBois(c, 6, 6, W - 12, H - 12, r, 4);
    c.fillStyle = 'rgba(255,230,190,0.08)'; c.fillRect(6, 6, W - 12, 2);
    if (r() < 0.3) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(W / 2 - 1, H - 3, 2, 3); } // porte entrouverte
  },
  commode(c, W, H, r) { DESSINS.armoire(c, W, H, r); objetsSurTable(c, 6, 6, W - 12, H - 12, r, 2); },
  casier(c, W, H, r) {
    boite(c, 2, 3, W - 4, H - 6, pick(r, ['#5a6a72', '#6a6e5a', '#7a5a4a']), { r: 1, ombre: 0.7 });
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 8; y < H - 6; y += 4) c.fillRect(8, y, W - 16, 1.2);
  },
  classeur(c, W, H, r) { boite(c, 4, 4, W - 8, H - 8, '#6a6e70', { r: 1 }); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(8, H / 2 - 1, W - 16, 2); objetsSurTable(c, 6, 6, W - 12, H - 12, r, 1); },
  frigo(c, W, H, r) {
    boite(c, 3, 3, W - 6, H - 6, '#c4c2b8', { r: 4, clair: 0.3, ombre: 0.65 });
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 9; x < W - 9; x += 4) c.fillRect(x, H - 9, 2, 4);
    if (r() < 0.4) { c.fillStyle = pick(r, ['#c84a2a', '#2a6ac8', '#e8c040']); cercle(c, W * 0.3, H * 0.35, 2.2); c.fill(); }
  },
  vitrine_frigo(c, W, H) { boite(c, 2, 3, W - 4, H - 6, '#b8bcbc', { r: 2 }); vitre(c, 5, 6, W - 10, H - 12); },
  bureau(c, W, H, r) {
    boite(c, 3, 4, W - 6, H - 8, teinte('#4e3826', 0.9 + r() * 0.2), { r: 2 });
    grainBois(c, 5, 6, W - 10, H - 12, r, 3);
    const t = r();
    if (t < 0.55) { c.fillStyle = '#18191a'; rr(c, W * 0.35, 7, W * 0.3, H * 0.28, 2); c.fill(); c.fillStyle = '#2c3a44'; rr(c, W * 0.37, 8, W * 0.26, H * 0.22, 1); c.fill(); c.fillStyle = '#222'; rr(c, W * 0.32, H * 0.5, W * 0.36, H * 0.18, 2); c.fill(); }
    else { c.fillStyle = '#2a2a2c'; c.save(); c.translate(W * 0.5, H * 0.5); c.rotate((r() - 0.5) * 0.6); rr(c, -11, -8, 22, 15, 2); c.fill(); c.fillStyle = '#3a4a54'; rr(c, -9, -7, 18, 9, 1); c.fill(); c.restore(); }
    objetsSurTable(c, 5, 6, W - 10, H - 12, r, 2);
  },
  caisse(c, W, H, r) {
    boite(c, 5, 5, W - 10, H - 10, teinte('#7a5a36', 0.8 + r() * 0.3), { r: 1 });
    c.strokeStyle = 'rgba(30,18,8,0.6)'; c.lineWidth = 1.2;
    for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(5, 5 + k * (H - 10) / 4); c.lineTo(W - 5, 5 + k * (H - 10) / 4); c.stroke(); }
    c.beginPath(); c.moveTo(6, 6); c.lineTo(W - 6, H - 6); c.stroke();
    c.fillStyle = '#2a2a2a'; for (const [x, y] of [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8]]) { cercle(c, x, y, 1); c.fill(); }
  },
  caisson(c, W, H, r) { DESSINS.caisse(c, W, H, r); },
  caisse_enreg(c, W, H) { boite(c, 6, 8, W - 12, H - 14, '#2c2c2e', { r: 3 }); c.fillStyle = '#1c3a2a'; rr(c, 10, 10, W - 20, 8, 1); c.fill(); c.fillStyle = '#8a8a8a'; for (let k = 0; k < 9; k++) { c.fillRect(11 + (k % 3) * 6, 22 + Math.floor(k / 3) * 4, 4, 2.4); } },
  palette(c, W, H, r) {
    avecOmbre(c, 4, 2, 3, 0.5, () => { c.fillStyle = '#7a6040'; for (let k = 0; k < 5; k++) c.fillRect(4, 4 + k * (H - 8) / 4.4, W - 8, (H - 8) / 7); });
    if (r() < 0.6) DESSINS.caisse(c, W, H, r);
  },
  poubelle(c, W, H, r) {
    const coul = pick(r, ['#2a4a2a', '#3a3a3c', '#4a3a2a', '#2a3a4a']);
    avecOmbre(c, 6, 3, 4, 0.6, () => { c.fillStyle = coul; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 7); c.fill(); });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.5; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 7); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.08)'; cercle(c, W / 2 - 3, H / 2 - 3, Math.min(W, H) / 2 - 12); c.fill();
    if (r() < 0.5) { c.fillStyle = '#c8c0a8'; c.fillRect(W / 2 + 6, H / 2 + 8, 6, 4); }
  },
  benne(c, W, H, r) { boite(c, 2, 4, W - 4, H - 8, '#2c4a2e', { r: 3, ombre: 0.7 }); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(W / 2 - 1, 6, 2, H - 12); c.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 8; x < W - 8; x += 8) c.fillRect(x, 6, 1.5, H - 12); void r; },
  machine(c, W, H, r) {
    const t = r();
    if (t < 0.5) { boite(c, 3, 3, W - 6, H - 6, '#c8c4b8', { r: 4, clair: 0.25 }); c.strokeStyle = '#555'; c.lineWidth = 2; cercle(c, W / 2, H / 2 + 2, Math.min(W, H) * 0.26); c.stroke(); c.fillStyle = '#2a3a44'; cercle(c, W / 2, H / 2 + 2, Math.min(W, H) * 0.2); c.fill(); }
    else { boite(c, 3, 3, W - 6, H - 6, pick(r, ['#8a2a22', '#22428a', '#2a2a2a']), { r: 2 }); c.fillStyle = '#1a2a32'; rr(c, 7, 7, W * 0.55, H - 14, 2); c.fill(); c.fillStyle = 'rgba(160,200,220,0.25)'; rr(c, 8, 8, W * 0.25, H - 16, 2); c.fill(); }
  },
  televiseur(c, W, H) { boite(c, 4, H / 2 - 6, W - 8, 12, '#151515', { r: 2 }); c.fillStyle = '#222a30'; c.fillRect(6, H / 2 - 5, W - 12, 4); },
  lit(c, W, H, r, R) {
    const simple = W < TS * 1.6;
    boite(c, 3, 3, W - 6, H - 6, teinte(BOIS_F, 0.9 + r() * 0.2), { r: 3 });
    c.fillStyle = '#d8d2c2'; rr(c, 6, 6, W - 12, H - 12, 3); c.fill();
    // oreillers
    const no = simple ? 1 : 2;
    for (let k = 0; k < no; k++) { c.fillStyle = '#ece6d6'; rr(c, 9 + k * (W - 18) / no, 8, (W - 18) / no - 3, H * 0.16, 5); c.fill(); c.fillStyle = 'rgba(0,0,0,0.08)'; rr(c, 9 + k * (W - 18) / no, 8 + H * 0.1, (W - 18) / no - 3, H * 0.06, 3); c.fill(); }
    // couverture
    const coul = R.couleur || pick(r, ['#6a2a2a', '#2a3a5a', '#4a5a3a', '#7a6a4a', '#5a3a5a', '#3a4a4a']);
    const g = c.createLinearGradient(0, H * 0.3, W, H);
    g.addColorStop(0, teinte(coul, 1.2)); g.addColorStop(1, teinte(coul, 0.7));
    c.fillStyle = g; c.beginPath(); c.moveTo(6, H * 0.32); c.bezierCurveTo(W * 0.3, H * 0.28 + r() * 6, W * 0.7, H * 0.36, W - 6, H * 0.3); c.lineTo(W - 6, H - 6); c.lineTo(6, H - 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { c.beginPath(); const yy = H * (0.45 + 0.15 * k); c.moveTo(8, yy); c.bezierCurveTo(W * 0.4, yy + 5 * (r() - 0.5), W * 0.6, yy + 5 * (r() - 0.5), W - 8, yy); c.stroke(); }
    if (r() < 0.25) { c.fillStyle = 'rgba(70,8,10,0.75)'; ellipse(c, W * (0.3 + r() * 0.4), H * (0.45 + r() * 0.3), 8 + r() * 8, 5 + r() * 6, r()); c.fill(); }
  },
  lit_simple(c, W, H, r, R) { DESSINS.lit(c, W, H, r, R); },
  lit_hopital(c, W, H, r) {
    boite(c, 3, 3, W - 6, H - 6, '#9aa2a4', { r: 3 });
    c.fillStyle = '#e4e8e6'; rr(c, 6, 6, W - 12, H - 12, 3); c.fill();
    c.fillStyle = '#f2f4f2'; rr(c, 9, 8, W - 18, H * 0.14, 5); c.fill();
    c.fillStyle = '#9ab4c0'; rr(c, 6, H * 0.36, W - 12, H * 0.6, 3); c.fill();
    if (r() < 0.4) { c.fillStyle = 'rgba(70,8,10,0.7)'; ellipse(c, W / 2, H * 0.55, 9, 7, r()); c.fill(); }
    c.fillStyle = '#5a6264'; c.fillRect(3, 2, W - 6, 3);
  },
  brancard(c, W, H, r) { c.fillStyle = '#6e7474'; c.fillRect(2, 4, 2.5, H - 8); c.fillRect(W - 4.5, 4, 2.5, H - 8); boite(c, 5, 6, W - 10, H - 12, '#3a4a5a', { r: 2 }); if (r() < 0.5) { c.fillStyle = '#d8d2c2'; rr(c, 7, 8, W - 14, H * 0.5, 4); c.fill(); } },
  canape(c, W, H, r, R) {
    const coul = R.couleur || pick(r, ['#4a3a32', '#2a3a4a', '#5a2a2a', '#3a4a3a', '#6a5a4a']);
    boite(c, 2, 3, W - 4, H - 6, teinte(coul, 0.8), { r: 7 });
    c.fillStyle = teinte(coul, 0.7); rr(c, 4, 4, W - 8, H * 0.32, 5); c.fill();
    const n = Math.max(1, Math.round(W / TS));
    for (let k = 0; k < n; k++) { c.fillStyle = teinte(coul, 1.05 + r() * 0.1); rr(c, 8 + k * (W - 16) / n, H * 0.38, (W - 16) / n - 2, H * 0.5, 5); c.fill(); }
    c.fillStyle = teinte(coul, 0.65); rr(c, 3, 4, 7, H - 8, 4); c.fill(); rr(c, W - 10, 4, 7, H - 8, 4); c.fill();
  },
  fauteuil(c, W, H, r, R) { DESSINS.canape(c, W, H, r, R); },
  banc(c, W, H, r) {
    c.fillStyle = '#1e1e1e'; c.fillRect(6, H * 0.3, 3, H * 0.4); c.fillRect(W - 9, H * 0.3, 3, H * 0.4);
    avecOmbre(c, 4, 2, 3, 0.5, () => { for (let k = 0; k < 4; k++) { c.fillStyle = teinte(BOIS_C, 0.8 + r() * 0.3); c.fillRect(3, H * 0.22 + k * H * 0.15, W - 6, H * 0.11); } });
  },
  lavabo(c, W, H) { boite(c, 6, 4, W - 12, H - 12, BLANC, { r: 6, clair: 0.3 }); c.fillStyle = '#9aa0a0'; ellipse(c, W / 2, H / 2 - 1, W * 0.24, H * 0.18); c.fill(); c.fillStyle = '#c0c4c4'; c.fillRect(W / 2 - 1.2, 5, 2.4, 6); },
  wc(c, W, H) { avecOmbre(c, 5, 2, 3, 0.55, () => { c.fillStyle = BLANC; rr(c, W * 0.25, 4, W * 0.5, H * 0.24, 3); c.fill(); ellipse(c, W / 2, H * 0.58, W * 0.24, H * 0.3); c.fill(); }); c.fillStyle = '#8a9494'; ellipse(c, W / 2, H * 0.6, W * 0.14, H * 0.18); c.fill(); },
  baignoire(c, W, H) { boite(c, 3, 3, W - 6, H - 6, BLANC, { r: 10, clair: 0.3 }); c.fillStyle = '#a9b0b0'; rr(c, 7, 7, W - 14, H - 14, 9); c.fill(); c.fillStyle = 'rgba(40,60,70,0.25)'; rr(c, 9, H * 0.4, W - 18, H * 0.5, 8); c.fill(); c.fillStyle = '#5a5e5e'; cercle(c, W / 2, H - 12, 2); c.fill(); },
  tapis(c, W, H, r, R) {
    const coul = R.couleur || pick(r, ['#6a2a2a', '#2a3a5a', '#5a4a2a', '#4a2a3a']);
    c.fillStyle = teinte(coul, 0.75); rr(c, 2, 2, W - 4, H - 4, 2); c.fill();
    c.fillStyle = coul; rr(c, 7, 7, W - 14, H - 14, 2); c.fill();
    c.strokeStyle = teinte(coul, 1.4); c.lineWidth = 1.5; rr(c, 11, 11, W - 22, H - 22, 2); c.stroke();
    c.strokeStyle = 'rgba(230,210,170,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(W / 2, 12); c.lineTo(W - 14, H / 2); c.lineTo(W / 2, H - 12); c.lineTo(14, H / 2); c.closePath(); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.15)'; ellipse(c, W * (0.3 + r() * 0.4), H * (0.3 + r() * 0.4), W * 0.2, H * 0.15, r()); c.fill();
  },
  piano(c, W, H) { boite(c, 2, 3, W - 4, H - 6, '#141212', { r: 3, clair: 0.25 }); c.fillStyle = '#e8e2d2'; c.fillRect(6, H - 14, W - 12, 6); c.fillStyle = '#111'; for (let x = 8; x < W - 8; x += 4) c.fillRect(x, H - 14, 1.6, 4); },
  cheminee(c, W, H) { boite(c, 2, 2, W - 4, H - 4, '#6a6253', { r: 2 }); c.fillStyle = '#141210'; rr(c, 8, H * 0.35, W - 16, H * 0.55, 3); c.fill(); c.fillStyle = 'rgba(120,110,100,0.5)'; for (let k = 0; k < 8; k++) { cercle(c, 12 + k * (W - 24) / 8, H * 0.7, 2); c.fill(); } },
  // ---------- extérieur ----------
  voiture(c, W, H, r, R) { vehicule(c, W, H, r, R, R.couleur || pick(r, ['#5a1e1e', '#1e2e4a', '#3a3a3a', '#b8b4a8', '#2a4a3a', '#6a5a3a', '#8a8a86', '#1a1a1a']), 'voiture'); },
  camionnette(c, W, H, r, R) { vehicule(c, W, H, r, R, R.couleur || pick(r, ['#c8c4b8', '#3a4a5a', '#7a2a1a']), 'camionnette'); },
  ambulance(c, W, H, r, R) { vehicule(c, W, H, r, R, '#d8d6cc', 'ambulance'); },
  camion_mil(c, W, H, r, R) { vehicule(c, W, H, r, R, '#3e4630', 'militaire'); },
  gravats(c, W, H, r) {
    for (let k = 0; k < 18; k++) {
      const x = 4 + r() * (W - 8), y = 4 + r() * (H - 8), t = 3 + r() * 8, f = 0.55 + r() * 0.5;
      avecOmbre(c, 3, 1.5, 2, 0.5, () => { c.fillStyle = rgb([118 * f, 112 * f, 100 * f]); c.save(); c.translate(x, y); c.rotate(r() * 3); c.beginPath(); c.moveTo(-t, -t * 0.4); c.lineTo(t * 0.3, -t * 0.7); c.lineTo(t, t * 0.2); c.lineTo(-t * 0.2, t * 0.6); c.closePath(); c.fill(); c.restore(); });
    }
    if (r() < 0.5) { c.strokeStyle = '#5a3a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(6, H - 8); c.lineTo(W - 10, 10); c.stroke(); }
  },
  arbre(c, W, H, r) { tronc(c, W, H, r, 7); },
  platane(c, W, H, r) { tronc(c, W, H, r, 8, '#7a7466'); },
  pin(c, W, H, r) { tronc(c, W, H, r, 6, '#4a3424'); },
  olivier(c, W, H, r) { tronc(c, W, H, r, 6, '#5a5446'); },
  figuier(c, W, H, r) { tronc(c, W, H, r, 6, '#8a8678'); },
  amandier(c, W, H, r) { tronc(c, W, H, r, 5, '#4a3a30'); },
  cypres(c, W, H, r) { tronc(c, W, H, r, 4); },
  buisson(c, W, H, r) {
    avecOmbre(c, 8, 4, 6, 0.55, () => { c.fillStyle = '#1e2c16'; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 2); c.fill(); });
    for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * W * 0.32, t = 5 + r() * 7, f = 0.6 + r() * 0.6; c.fillStyle = rgb([38 * f, 58 * f, 28 * f]); cercle(c, W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, t); c.fill(); }
  },
  lampadaire(c, W, H) { avecOmbre(c, 3, 2, 3, 0.6, () => { c.fillStyle = '#1c1c1e'; cercle(c, W / 2, H / 2, 5); c.fill(); }); c.fillStyle = '#3a3a3c'; cercle(c, W / 2 - 1, H / 2 - 1, 2.4); c.fill(); },
  poteau(c, W, H) { avecOmbre(c, 3, 2, 3, 0.6, () => { c.fillStyle = '#2a2a2a'; cercle(c, W / 2, H / 2, 4); c.fill(); }); },
  borne(c, W, H) { avecOmbre(c, 3, 2, 3, 0.6, () => { c.fillStyle = '#3a3a3c'; cercle(c, W / 2, H / 2, 5); c.fill(); }); c.fillStyle = '#c8c0a8'; c.fillRect(W / 2 - 4, H / 2 - 1, 8, 2); },
  barriere(c, W, H, r) {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(3, H / 2 + 2, W - 6, 4);
    c.fillStyle = '#9a9a96'; c.fillRect(3, H / 2 - 2, W - 6, 3);
    for (let x = 6; x < W - 4; x += 6) { c.fillStyle = r() < 0.5 ? '#c8c4b8' : '#a8a49a'; c.fillRect(x, H / 2 - 6, 1.6, 10); }
    c.fillStyle = '#6a6a66'; c.fillRect(3, H / 2 - 7, 3, 14); c.fillRect(W - 6, H / 2 - 7, 3, 14);
  },
  sacs_sable(c, W, H, r) {
    const n = Math.max(2, Math.round(W / 14));
    for (let row = 0; row < 2; row++) for (let k = 0; k < n; k++) {
      const x = 4 + k * (W - 8) / n + (row ? 6 : 0), y = H * 0.25 + row * H * 0.28;
      avecOmbre(c, 4, 2, 3, 0.5, () => { c.fillStyle = teinte('#8a7a56', 0.85 + r() * 0.25); rr(c, x, y, (W - 8) / n - 1, H * 0.3, 6); c.fill(); });
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, y + H * 0.15); c.lineTo(x + (W - 8) / n - 5, y + H * 0.15); c.stroke();
    }
  },
  fut(c, W, H, r) {
    const coul = pick(r, ['#2a4a6a', '#6a3a1a', '#3a4a2a', '#5a5a5a']);
    avecOmbre(c, 6, 3, 4, 0.6, () => { c.fillStyle = coul; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 6); c.fill(); });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 9); c.stroke();
    c.fillStyle = 'rgba(120,60,20,0.35)'; ellipse(c, W / 2 + 4, H / 2 + 3, 6, 4); c.fill();
  },
  brasero(c, W, H) {
    avecOmbre(c, 6, 3, 4, 0.6, () => { c.fillStyle = '#3a2c22'; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 6); c.fill(); });
    c.fillStyle = '#140a06'; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 10); c.fill();
    const g = c.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, Math.min(W, H) / 2 - 10);
    g.addColorStop(0, '#ffcf6a'); g.addColorStop(0.4, '#e0601a'); g.addColorStop(1, 'rgba(90,20,6,0.8)');
    c.fillStyle = g; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 11); c.fill();
  },
  feu_camp(c, W, H, r, R) {
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28; c.fillStyle = teinte('#6a645a', 0.7 + r() * 0.5); cercle(c, W / 2 + Math.cos(a) * W * 0.3, H / 2 + Math.sin(a) * H * 0.3, 4); c.fill(); }
    c.fillStyle = '#1a120c'; cercle(c, W / 2, H / 2, W * 0.22); c.fill();
    c.strokeStyle = '#4a3020'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { const a = r() * 6.28; c.beginPath(); c.moveTo(W / 2 - Math.cos(a) * 9, H / 2 - Math.sin(a) * 9); c.lineTo(W / 2 + Math.cos(a) * 9, H / 2 + Math.sin(a) * 9); c.stroke(); }
    // construit : éteint = cendres ; allumé = flammes qui dansent
    const eteint = R && R.c && !((R.c.feuJusqua || 0) > (R.minutes || 0));
    if (eteint) { c.fillStyle = 'rgba(120,115,105,0.6)'; cercle(c, W / 2, H / 2, W * 0.16); c.fill(); return; }
    const t = R && R.c ? performance.now() / 120 : 0, f = 0.85 + 0.15 * Math.sin(t) * Math.sin(t * 1.7);
    const g = c.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, W * 0.24 * f); g.addColorStop(0, 'rgba(255,220,120,0.95)'); g.addColorStop(0.5, 'rgba(255,140,50,0.8)'); g.addColorStop(1, 'rgba(160,40,10,0)'); c.fillStyle = g; cercle(c, W / 2, H / 2, W * 0.24 * f); c.fill();
    if (R && R.c) for (let k = 0; k < 4; k++) { const a = t * 0.4 + k * 1.6; c.fillStyle = `rgba(255,${150 + 60 * Math.sin(t + k) | 0},60,0.8)`; ellipse(c, W / 2 + Math.cos(a) * 3, H / 2 + Math.sin(a) * 3 - 2, 3, 6 * f, a); c.fill(); }
  },
  // ─────────── Nature ───────────
  souche(c, W, H, r) {
    const m = Math.min(W, H) / 2;
    avecOmbre(c, 3, 2, 3, 0.5, () => { c.fillStyle = '#4a3422'; cercle(c, W / 2, H / 2, m * 0.42); c.fill(); });
    c.fillStyle = '#b89668'; cercle(c, W / 2, H / 2, m * 0.34); c.fill();
    c.strokeStyle = 'rgba(90,60,30,0.55)'; c.lineWidth = 0.8; for (let k = 1; k < 5; k++) { cercle(c, W / 2 + r() - 0.5, H / 2 + r() - 0.5, m * 0.34 * k / 5); c.stroke(); }
    c.fillStyle = 'rgba(220,200,160,0.7)'; for (let k = 0; k < 7; k++) { const a = r() * 6.28; c.fillRect(W / 2 + Math.cos(a) * m * 0.6, H / 2 + Math.sin(a) * m * 0.6, 3, 1.4); }
  },
  roncier(c, W, H, r) {
    for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * W * 0.32; c.fillStyle = teinte('#2e3a1e', 0.7 + r() * 0.6); cercle(c, W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 5 + r() * 6); c.fill(); }
    c.strokeStyle = 'rgba(90,40,50,0.7)'; c.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = r() * 6.28; c.beginPath(); c.moveTo(W / 2, H / 2); c.quadraticCurveTo(W / 2 + Math.cos(a + 0.6) * W * 0.3, H / 2 + Math.sin(a + 0.6) * H * 0.3, W / 2 + Math.cos(a) * W * 0.46, H / 2 + Math.sin(a) * H * 0.46); c.stroke(); }
    c.fillStyle = '#1a0e1c'; for (let k = 0; k < 9; k++) { cercle(c, 6 + r() * (W - 12), 6 + r() * (H - 12), 1.6); c.fill(); }
  },
  cannier(c, W, H, r) {
    for (let k = 0; k < 26; k++) { const x = 4 + r() * (W - 8), y = 4 + r() * (H - 8); c.fillStyle = teinte('#8a8a52', 0.75 + r() * 0.5); cercle(c, x, y, 1.8); c.fill(); }
    c.strokeStyle = 'rgba(120,140,70,0.85)'; c.lineWidth = 1.6; for (let k = 0; k < 16; k++) { const x = r() * W, y = r() * H, a = r() * 6.28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.stroke(); }
  },
  // ─────────── Constructions (js/data/construction.js) ───────────
  mur_rondins(c, W, H, r, R) {
    for (let k = 0; k < 2; k++) {
      const y = 3 + k * (H - 6) / 2, h = (H - 6) / 2 - 1;
      avecOmbre(c, 4, 3, 4, 0.55, () => { c.fillStyle = teinte('#6a4a2c', 0.85 + r() * 0.3); rr(c, 1, y, W - 2, h, h / 2); c.fill(); });
      c.fillStyle = 'rgba(255,230,190,0.12)'; c.fillRect(4, y + 2, W - 8, 2);
      c.fillStyle = '#b89668'; ellipse(c, 3, y + h / 2, 2.5, h / 2 - 1); c.fill(); ellipse(c, W - 3, y + h / 2, 2.5, h / 2 - 1); c.fill();
    }
    usure(c, W, H, R);
  },
  cloture_branches(c, W, H, r, R) {
    c.lineCap = 'round';
    for (let k = 0; k < 9; k++) { c.strokeStyle = teinte('#5a4430', 0.7 + r() * 0.5); c.lineWidth = 2 + r() * 2; const y = 6 + r() * (H - 12); c.beginPath(); c.moveTo(1, y + (r() - 0.5) * 10); c.lineTo(W - 1, y + (r() - 0.5) * 10); c.stroke(); }
    c.fillStyle = '#3a2a1a'; cercle(c, 4, H / 2, 3); c.fill(); cercle(c, W - 4, H / 2, 3); c.fill();
    usure(c, W, H, R);
  },
  palissade_cannes(c, W, H, r, R) {
    avecOmbre(c, 3, 2, 3, 0.5, () => { c.fillStyle = '#9a9460'; c.fillRect(1, H * 0.3, W - 2, H * 0.4); });
    for (let x = 2; x < W - 2; x += 3) { c.fillStyle = teinte('#b8b07a', 0.75 + r() * 0.4); c.fillRect(x, H * 0.3, 2.2, H * 0.4); c.fillStyle = 'rgba(60,50,20,0.5)'; c.fillRect(x, H * 0.3 + r() * H * 0.4, 2.2, 0.8); }
    c.fillStyle = '#5a5a5a'; c.fillRect(1, H * 0.42, W - 2, 1); c.fillRect(1, H * 0.58, W - 2, 1);
    usure(c, W, H, R);
  },
  mur_sacs(c, W, H, r, R) {
    for (let k = 0; k < 2; k++) for (let i = 0; i < 2; i++) {
      const x = 2 + i * (W - 4) / 2 + (k ? (W - 4) / 4 : 0) - (k ? 2 : 0), y = 4 + k * (H - 8) / 2, w = (W - 4) / 2 - 1, h = (H - 8) / 2 - 1;
      if (x + w > W) continue;
      avecOmbre(c, 3, 2, 3, 0.5, () => { c.fillStyle = teinte('#a8946a', 0.85 + r() * 0.25); rr(c, x, y, w, h, 5); c.fill(); });
      c.strokeStyle = 'rgba(60,45,25,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 4, y + h / 2); c.lineTo(x + w - 4, y + h / 2); c.stroke();
    }
    usure(c, W, H, R);
  },
  muret_pierres(c, W, H, r, R) {
    for (let k = 0; k < 16; k++) { const x = 3 + r() * (W - 6), y = H * 0.25 + r() * H * 0.5; avecOmbre(c, 2, 2, 2, 0.45, () => { c.fillStyle = teinte('#a39a88', 0.75 + r() * 0.45); ellipse(c, x, y, 3 + r() * 4, 2.5 + r() * 3, r() * 3); c.fill(); }); }
    usure(c, W, H, R);
  },
  portail_bois(c, W, H, r, R) {
    const ouverte = R && R.c && R.c.ouverte;
    c.fillStyle = BOIS_F; c.fillRect(0, 0, 4, H); c.fillRect(W - 4, 0, 4, H);
    if (ouverte) { for (const [x, a] of [[4, 1.3], [W - 4, Math.PI - 1.3]]) { c.save(); c.translate(x, H / 2); c.rotate(a); c.fillStyle = BOIS_C; c.fillRect(0, -3, W / 2 - 6, 6); c.restore(); } return; }
    avecOmbre(c, 4, 3, 4, 0.5, () => { c.fillStyle = BOIS_C; c.fillRect(4, 3, W - 8, H - 6); });
    grainBois(c, 4, 3, W - 8, H - 6, r, 6);
    c.fillStyle = BOIS_F; c.fillRect(W / 2 - 1, 3, 2, H - 6);
    c.fillStyle = '#7a7a7a'; c.fillRect(W / 2 - 6, H / 2 - 1.5, 12, 3);
    usure(c, W, H, R);
  },
  barbeles(c, W, H, r) {
    c.fillStyle = '#4a3a2a'; cercle(c, 4, H / 2, 2.5); c.fill(); cercle(c, W - 4, H / 2, 2.5); c.fill();
    c.strokeStyle = 'rgba(150,150,145,0.85)'; c.lineWidth = 0.9;
    for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 3; x <= W - 3; x += 2) { const y = H / 2 + Math.sin(x / 3 + k * 2) * (5 + k * 3); x === 3 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(180,180,175,0.9)'; for (let k = 0; k < 10; k++) c.fillRect(4 + r() * (W - 8), H / 2 - 9 + r() * 18, 1.6, 1.6);
  },
  alarme_conserves(c, W, H, r) {
    c.strokeStyle = 'rgba(160,160,155,0.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(1, H / 2); c.lineTo(W - 1, H / 2); c.stroke();
    for (let k = 0; k < 4; k++) { const x = 6 + k * (W - 12) / 3; avecOmbre(c, 1.5, 1.5, 2, 0.45, () => { c.fillStyle = teinte('#b0aca2', 0.8 + r() * 0.3); cercle(c, x, H / 2 + 3, 2.6); c.fill(); }); c.fillStyle = 'rgba(60,60,60,0.6)'; cercle(c, x, H / 2 + 3, 1.4); c.fill(); }
  },
  fosse(c, W, H, r) {
    c.fillStyle = 'rgba(60,44,28,0.55)'; rr(c, 3, 3, W - 6, H - 6, 6); c.fill();
    c.strokeStyle = 'rgba(80,60,40,0.8)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { const y = 5 + r() * (H - 10); c.beginPath(); c.moveTo(4, y); c.lineTo(W - 4, y + (r() - 0.5) * 8); c.stroke(); }
    c.fillStyle = 'rgba(120,100,70,0.35)'; for (let k = 0; k < 12; k++) { cercle(c, 6 + r() * (W - 12), 6 + r() * (H - 12), 2 + r() * 2); c.fill(); }
  },
  chevaux_frise(c, W, H, r, R) {
    avecOmbre(c, 4, 3, 4, 0.55, () => { c.fillStyle = '#5a4026'; c.fillRect(2, H / 2 - 3, W - 4, 6); });
    c.strokeStyle = '#7a5838'; c.lineWidth = 2.5; c.lineCap = 'round';
    for (let x = 6; x < W - 4; x += 8) { c.beginPath(); c.moveTo(x - 6, 3); c.lineTo(x + 6, H - 3); c.moveTo(x + 6, 3); c.lineTo(x - 6, H - 3); c.stroke(); }
    usure(c, W, H, R);
  },
  coffre(c, W, H, r, R) {
    avecOmbre(c, 5, 3, 4, 0.55, () => { boite(c, 2, 4, W - 4, H - 8, teinte(BOIS, 1.08), { r: 2 }); });
    grainBois(c, 3, 5, W - 6, H - 10, r, 5, 0.3);
    c.fillStyle = '#3a3a3a'; c.fillRect(2, H / 2 - 1, W - 4, 2); c.fillStyle = '#9a8a5a'; c.fillRect(W / 2 - 3, H / 2 - 3, 6, 6);
    if (R && R.c && R.c.n) { c.fillStyle = 'rgba(255,230,160,0.5)'; cercle(c, W - 7, 8, 2.5); c.fill(); }
  },
  etagere_bois(c, W, H, r, R) {
    avecOmbre(c, 4, 3, 4, 0.5, () => { c.fillStyle = BOIS; c.fillRect(2, 3, W - 4, H - 6); });
    c.fillStyle = BOIS_C; c.fillRect(3, 4, W - 6, H - 8);
    c.fillStyle = BOIS_F; for (let k = 1; k < 3; k++) c.fillRect(3, 4 + k * (H - 8) / 3, W - 6, 1.2);
    if (R && R.c && R.c.n) for (let k = 0; k < Math.min(8, R.c.n * 2); k++) { c.fillStyle = pick(r, ['#8a3a2a', '#c8a032', '#5a7a3a', '#d8d0c0', '#6a6a6a']); c.fillRect(5 + r() * (W - 14), 6 + r() * (H - 14), 4, 3); }
  },
  table_bois(c, W, H, r) { avecOmbre(c, 5, 3, 4, 0.5, () => { c.fillStyle = BOIS_C; rr(c, 3, 4, W - 6, H - 8, 2); c.fill(); }); grainBois(c, 3, 4, W - 6, H - 8, r, 5); for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(3, 4 + (k + 1) * (H - 8) / 4, W - 6, 0.8); } },
  chaise_bois(c, W, H, r) { avecOmbre(c, 3, 2, 3, 0.45, () => { c.fillStyle = BOIS_C; c.fillRect(W * 0.28, H * 0.3, W * 0.44, H * 0.44); }); c.fillStyle = BOIS_F; c.fillRect(W * 0.28, H * 0.26, W * 0.44, 3); grainBois(c, W * 0.28, H * 0.3, W * 0.44, H * 0.44, r, 2); },
  torche_murale(c, W, H, r, R) {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ellipse(c, W / 2 + 3, H / 2 + 3, 5, 3); c.fill();
    c.fillStyle = '#4a3020'; cercle(c, W / 2, H / 2, 3.2); c.fill();
    const allume = R && R.c && (R.c.feuJusqua || 0) > (R.minutes || 0);
    c.fillStyle = allume ? 'rgba(255,190,90,0.95)' : '#2a2420'; cercle(c, W / 2, H / 2, 2.2); c.fill();
    if (allume) { const g = c.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, 9); g.addColorStop(0, 'rgba(255,200,110,0.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; cercle(c, W / 2, H / 2, 9); c.fill(); }
  },
  four_pierre(c, W, H, r, R) {
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; avecOmbre(c, 2, 2, 2, 0.45, () => { c.fillStyle = teinte('#8e867a', 0.75 + r() * 0.4); cercle(c, W / 2 + Math.cos(a) * W * 0.32, H / 2 + Math.sin(a) * H * 0.32, 4.5); c.fill(); }); }
    c.fillStyle = teinte('#7a7266', 0.9); cercle(c, W / 2, H / 2, W * 0.24); c.fill();
    const allume = R && R.c && (R.c.feuJusqua || 0) > (R.minutes || 0);
    c.fillStyle = allume ? 'rgba(255,120,40,0.85)' : '#1a1410'; ellipse(c, W / 2, H * 0.78, W * 0.12, 3); c.fill();
  },
  fumoir(c, W, H, r, R) {
    avecOmbre(c, 5, 3, 4, 0.55, () => { c.fillStyle = '#5d4128'; c.fillRect(4, 4, W - 8, H - 8); });
    c.fillStyle = '#3a4a3a'; c.fillRect(5, 5, W - 10, H - 10);
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, H / 2); c.lineTo(W - 5, H / 2); c.stroke();
    const allume = R && R.c && (R.c.feuJusqua || 0) > (R.minutes || 0);
    if (allume) { c.fillStyle = 'rgba(200,200,200,0.25)'; cercle(c, W / 2 + 2, H / 2 - 4, 7); c.fill(); }
  },
  tonneau(c, W, H, r) {
    avecOmbre(c, 4, 3, 4, 0.55, () => { c.fillStyle = '#6a4a2c'; cercle(c, W / 2, H / 2, W * 0.38); c.fill(); });
    c.fillStyle = '#2a3a4a'; cercle(c, W / 2, H / 2, W * 0.3); c.fill();
    c.strokeStyle = '#8a8a8a'; c.lineWidth = 1.5; cercle(c, W / 2, H / 2, W * 0.36); c.stroke();
    c.fillStyle = 'rgba(200,220,240,0.15)'; cercle(c, W / 2 - 3, H / 2 - 3, W * 0.12); c.fill();
  },
  abri_branches(c, W, H, r, R) {
    avecOmbre(c, 7, 5, 6, 0.55, () => { c.fillStyle = '#3e4a30'; rr(c, 4, 6, W - 8, H - 12, 8); c.fill(); });
    c.fillStyle = '#4a5a6a'; c.fillRect(8, 10, W - 16, H - 20);
    c.strokeStyle = '#5a4430'; c.lineCap = 'round'; for (let k = 0; k < 14; k++) { c.lineWidth = 2 + r() * 2; const x = 6 + r() * (W - 12); c.beginPath(); c.moveTo(x, 6); c.lineTo(x + (r() - 0.5) * 14, H - 6); c.stroke(); }
    c.fillStyle = BOIS_F; c.fillRect(W / 2 - 1.5, 4, 3, H - 8);
    for (let k = 0; k < 20; k++) { c.fillStyle = teinte('#4e5e30', 0.7 + r() * 0.6); cercle(c, 6 + r() * (W - 12), 6 + r() * (H - 12), 2 + r() * 2.5); c.fill(); }
    usure(c, W, H, R);
  },
  mur_planches(c, W, H, r, R) {
    avecOmbre(c, 5, 3, 4, 0.55, () => { c.fillStyle = BOIS; c.fillRect(1, 1, W - 2, H - 2); });
    const n = 4; for (let k = 0; k < n; k++) { const y = 2 + k * (H - 4) / n; c.fillStyle = teinte(BOIS_C, 0.8 + r() * 0.35); c.fillRect(2, y, W - 4, (H - 4) / n - 1.5); }
    grainBois(c, 2, 2, W - 4, H - 4, r, 5);
    c.fillStyle = '#9a9a9a'; for (let k = 0; k < n; k++) { const y = 2 + k * (H - 4) / n + (H - 4) / n / 2 - 1; cercle(c, 6, y, 1.3); c.fill(); cercle(c, W - 6, y, 1.3); c.fill(); }
    usure(c, W, H, R);
  },
  mur_renforce(c, W, H, r, R) {
    DESSINS.mur_planches(c, W, H, r, null);
    c.strokeStyle = teinte(BOIS_F, 1.1); c.lineWidth = 4; c.beginPath(); c.moveTo(4, 4); c.lineTo(W - 4, H - 4); c.moveTo(W - 4, 4); c.lineTo(4, H - 4); c.stroke();
    c.strokeStyle = 'rgba(170,170,165,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(2, H / 2 - 4); c.lineTo(W - 2, H / 2 - 3); c.moveTo(2, H / 2 + 4); c.lineTo(W - 2, H / 2 + 5); c.stroke();
    usure(c, W, H, R);
  },
  palissade(c, W, H, r, R) {
    const n = 4;
    for (let k = 0; k < n; k++) {
      const x = 3 + k * (W - 6) / n, w = (W - 6) / n - 2;
      avecOmbre(c, 3, 2, 3, 0.5, () => { c.fillStyle = teinte(BOIS_C, 0.75 + r() * 0.4); rr(c, x, 6, w, H - 12, 1); c.fill(); });
      c.fillStyle = teinte(BOIS_C, 1.15); c.beginPath(); c.moveTo(x, 6); c.lineTo(x + w / 2, 1); c.lineTo(x + w, 6); c.fill();
    }
    c.fillStyle = BOIS_F; c.fillRect(2, H / 2 - 2, W - 4, 3);
    usure(c, W, H, R);
  },
  porte_planches(c, W, H, r, R) {
    const ouverte = R && R.c && R.c.ouverte;
    c.fillStyle = BOIS_F; c.fillRect(0, 0, 4, H); c.fillRect(W - 4, 0, 4, H);
    if (ouverte) { avecOmbre(c, 3, 2, 3, 0.5, () => { c.fillStyle = BOIS_C; c.save(); c.translate(4, 4); c.rotate(1.2); c.fillRect(0, -3, W - 8, 6); c.restore(); }); return; }
    avecOmbre(c, 4, 3, 4, 0.5, () => { c.fillStyle = BOIS_C; c.fillRect(4, 3, W - 8, H - 6); });
    grainBois(c, 4, 3, W - 8, H - 6, r, 4);
    c.strokeStyle = BOIS_F; c.lineWidth = 3; c.beginPath(); c.moveTo(6, 6); c.lineTo(W - 6, H - 6); c.stroke();
    c.fillStyle = '#8a8a8a'; cercle(c, W - 9, H / 2, 2); c.fill();
    usure(c, W, H, R);
  },
  barricade_fenetre(c, W, H, r, R) {
    c.save(); c.translate(W / 2, H / 2);
    for (const a of [0.55, -0.55]) { c.save(); c.rotate(a); avecOmbre(c, 3, 2, 3, 0.55, () => { c.fillStyle = teinte(BOIS_C, 0.85 + r() * 0.3); c.fillRect(-W * 0.62, -4, W * 1.24, 8); }); c.fillStyle = '#a0a0a0'; cercle(c, -W * 0.5, 0, 1.3); c.fill(); cercle(c, W * 0.5, 0, 1.3); c.fill(); c.restore(); }
    c.restore(); usure(c, W, H, R);
  },
  pieux(c, W, H, r) {
    for (let k = 0; k < 6; k++) {
      const x = 6 + r() * (W - 12), y = 6 + r() * (H - 12), a = r() * 6.28;
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-1, -1, 14, 4);
      c.fillStyle = teinte(BOIS_C, 0.8 + r() * 0.4); c.beginPath(); c.moveTo(-2, -2); c.lineTo(10, -2); c.lineTo(15, 0); c.lineTo(10, 2); c.lineTo(-2, 2); c.fill();
      c.restore();
    }
  },
  caisse_bois(c, W, H, r, R) {
    DESSINS.caisse(c, W, H, r);
    c.strokeStyle = 'rgba(30,20,10,0.6)'; c.lineWidth = 1.5; c.strokeRect(7, 7, W - 14, H - 14);
    if (R && R.c && R.c.n) { c.fillStyle = 'rgba(255,230,160,0.5)'; cercle(c, W - 9, 9, 2.5); c.fill(); }
  },
  etabli(c, W, H, r) {
    avecOmbre(c, 6, 3, 5, 0.55, () => { boite(c, 3, 4, W - 6, H - 8, teinte(BOIS, 1.05), { r: 2 }); });
    grainBois(c, 4, 5, W - 8, H - 10, r, 6, 0.3);
    c.fillStyle = METAL; c.fillRect(W - 18, 6, 10, 7); c.fillStyle = '#4a4a4a'; c.fillRect(W - 15, 13, 4, 6);    // étau
    c.fillStyle = '#7a7a7a'; c.save(); c.translate(W * 0.35, H / 2); c.rotate(0.4); c.fillRect(-9, -1.5, 14, 3); c.fillStyle = '#3a2a1a'; c.fillRect(5, -2, 8, 4); c.restore();   // marteau
    c.fillStyle = 'rgba(210,200,170,0.5)'; for (let k = 0; k < 5; k++) c.fillRect(8 + r() * (W * 0.4), 6 + r() * (H - 14), 2, 1);   // copeaux
  },
  lit_fortune(c, W, H, r) {
    avecOmbre(c, 5, 3, 4, 0.5, () => { c.fillStyle = BOIS; c.fillRect(3, 3, W - 6, H - 6); });
    c.fillStyle = DRAP; rr(c, 5, 5, W - 10, H - 10, 4); c.fill();
    c.fillStyle = teinte(DRAP, 0.8); for (let k = 0; k < 4; k++) { c.fillRect(6, 10 + k * (H - 20) / 4, W - 12, 1.5); }
    c.fillStyle = '#e4ddcc'; rr(c, 7, 7, W - 14, H * 0.14, 5); c.fill();
  },
  recuperateur(c, W, H, r, R) {
    avecOmbre(c, 5, 3, 4, 0.55, () => { c.fillStyle = '#2a4a6a'; rr(c, W * 0.25, H * 0.3, W * 0.5, H * 0.55, 3); c.fill(); });
    c.fillStyle = 'rgba(140,170,190,0.55)'; c.beginPath(); c.moveTo(3, 3); c.lineTo(W - 3, 3); c.lineTo(W * 0.58, H * 0.5); c.lineTo(W * 0.42, H * 0.5); c.closePath(); c.fill();
    c.strokeStyle = BOIS_F; c.lineWidth = 2; c.strokeRect(3, 3, W - 6, 2);
    const plein = R && R.c && R.d && R.d.eau ? Math.min(1, (R.c.eau || 0) / R.d.eau.cap) : 0;
    if (plein > 0.02) { c.fillStyle = 'rgba(90,150,200,0.85)'; c.fillRect(W * 0.3, H * 0.82 - H * 0.45 * plein, W * 0.4, H * 0.45 * plein); }
  },
  potager(c, W, H, r, R) {
    c.fillStyle = '#4a3220'; c.fillRect(2, 2, W - 4, H - 4);
    c.strokeStyle = BOIS_C; c.lineWidth = 4; c.strokeRect(3, 3, W - 6, H - 6);
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 1; k < 4; k++) c.fillRect(6, k * H / 4, W - 12, 2);
    const p = R && R.c && R.d && R.c.plante != null ? Math.min(1, ((R.minutes || 0) - R.c.plante) / (R.d.potager.jours * 1440)) : 0;
    if (p > 0) for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) {
      const x = 10 + i * (W - 20) / 5, y = (k + 0.6) * H / 4 + 2, s = 1.5 + p * 6;
      c.fillStyle = p >= 1 ? '#4a8a2a' : '#5a7a2a'; cercle(c, x, y, s); c.fill();
      if (p >= 1 && (i + k) % 2) { c.fillStyle = '#b8302a'; cercle(c, x + 2, y + 1, 2); c.fill(); }
    }
  },
  fontaine(c, W, H) {
    avecOmbre(c, 8, 4, 6, 0.6, () => { c.fillStyle = '#8a8272'; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 3); c.fill(); });
    c.fillStyle = '#1c2a30'; cercle(c, W / 2, H / 2, Math.min(W, H) / 2 - 9); c.fill();
    c.fillStyle = 'rgba(150,180,190,0.15)'; ellipse(c, W / 2 - 8, H / 2 - 8, 14, 6, -0.6); c.fill();
    c.fillStyle = '#9a9282'; cercle(c, W / 2, H / 2, 8); c.fill(); c.fillStyle = '#6a6252'; cercle(c, W / 2, H / 2, 4); c.fill();
  },
  statue(c, W, H) { boite(c, 4, 4, W - 8, H - 8, '#8a8476', { r: 2 }); avecOmbre(c, 6, 4, 5, 0.6, () => { c.fillStyle = '#a8a294'; ellipse(c, W / 2, H / 2, 9, 7); c.fill(); cercle(c, W / 2 + 2, H / 2 - 1, 4.5); c.fill(); }); },
  tente(c, W, H, r) {
    avecOmbre(c, 10, 5, 7, 0.6, () => { c.fillStyle = '#3e4632'; rr(c, 4, 4, W - 8, H - 8, 4); c.fill(); });
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#4a543a'); g.addColorStop(0.5, '#2e3424'); g.addColorStop(1, '#4a543a');
    c.fillStyle = g; rr(c, 6, 6, W - 12, H - 12, 3); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2, 6); c.lineTo(W / 2, H - 6); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.06)'; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(6, k * H / 4); c.lineTo(W - 6, k * H / 4); c.stroke(); }
    // croix rouge NRBC / sanitaire
    c.fillStyle = '#d8d0c0'; rr(c, W / 2 - 9, H / 2 - 9, 18, 18, 2); c.fill(); c.fillStyle = '#9a1e1e'; c.fillRect(W / 2 - 2.5, H / 2 - 7, 5, 14); c.fillRect(W / 2 - 7, H / 2 - 2.5, 14, 5);
    if (r() < 0.5) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.moveTo(W - 6, H * 0.6); c.lineTo(W - 22, H - 6); c.lineTo(W - 6, H - 6); c.closePath(); c.fill(); }
  },
  generateur(c, W, H) { boite(c, 4, 6, W - 8, H - 12, '#5a5a2a', { r: 3 }); c.fillStyle = '#2a2a2a'; for (let x = 10; x < W - 14; x += 5) c.fillRect(x, 10, 2.5, H - 20); c.fillStyle = '#1a1a1a'; cercle(c, W - 12, H / 2, 4); c.fill(); c.fillStyle = '#c8a032'; c.fillRect(8, H - 10, 10, 2); },
  conteneur(c, W, H, r) {
    boite(c, 2, 2, W - 4, H - 4, '#c8c6bc', { r: 2, ombre: 0.75, flou: 12, clair: 0.25 });
    for (let x = 8; x < W - 8; x += 6) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, 4, 2.5, H - 8); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 2.5, 4, 1, H - 8); }
    c.fillStyle = 'rgba(90,60,30,0.3)'; ellipse(c, W * (0.2 + r() * 0.6), H * 0.6, 20, 10); c.fill();
    c.fillStyle = '#3a3a3a'; c.fillRect(W - 10, 6, 6, H - 12);
    c.fillStyle = '#2a4a8a'; c.fillRect(12, H / 2 - 3, 30, 6);
  },
  // ---------- cimetière ----------
  tombe(c, W, H, r) {
    const pierre = pick(r, ['#5a5852', '#6e6a62', '#2c2c2e', '#8a8478', '#a29c90']);
    avecOmbre(c, 6, 3, 5, 0.6, () => { c.fillStyle = teinte(pierre, 0.8); rr(c, 4, 3, W - 8, H - 6, 3); c.fill(); });
    c.fillStyle = pierre; rr(c, 6, 5, W - 12, H - 10, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(7, 6, W - 14, 2);
    // stèle en tête
    c.fillStyle = teinte(pierre, 1.15); rr(c, 6, 4, W - 12, H * 0.22, 4); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 3; k++) c.fillRect(W * 0.3, 7 + k * 3, W * 0.4, 1);
    if (r() < 0.5) { const col = pick(r, ['#8a2a3a', '#c8b04a', '#d8d0c0', '#6a3a7a']); for (let k = 0; k < 4; k++) { c.fillStyle = '#2a3a1a'; cercle(c, W * 0.35 + r() * W * 0.3, H * 0.6 + r() * H * 0.2, 3); c.fill(); c.fillStyle = col; cercle(c, W * 0.35 + r() * W * 0.3, H * 0.6 + r() * H * 0.2, 2); c.fill(); } }
    if (r() < 0.25) { c.strokeStyle = 'rgba(10,10,10,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(8, H * 0.4); c.lineTo(W * 0.6, H * 0.55); c.lineTo(W - 8, H * 0.5); c.stroke(); } // fendue
    if (r() < 0.12) { c.fillStyle = '#1a1612'; rr(c, 7, H * 0.32, W - 14, H * 0.5, 2); c.fill(); c.fillStyle = 'rgba(80,60,40,0.6)'; c.fillRect(8, H * 0.34, W - 16, H * 0.46); } // ouverte, terre retournée
  },
  tombe_croix(c, W, H, r) { DESSINS.tombe(c, W, H, r); c.fillStyle = '#2a2a2a'; c.fillRect(W / 2 - 1.5, 2, 3, H * 0.3); c.fillRect(W / 2 - 6, 6, 12, 3); },
  stele(c, W, H, r) { avecOmbre(c, 5, 3, 4, 0.6, () => { c.fillStyle = pick(r, ['#6e6a62', '#8a8478']); rr(c, W * 0.2, H * 0.35, W * 0.6, H * 0.3, 4); c.fill(); }); },
  caveau(c, W, H, r) {
    boite(c, 2, 2, W - 4, H - 4, '#7a7466', { r: 2, ombre: 0.75, flou: 12 });
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#8e887a'); g.addColorStop(0.5, '#6a6456'); g.addColorStop(1, '#8e887a');
    c.fillStyle = g; c.fillRect(6, 6, W - 12, H - 12);
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(W / 2, 6); c.lineTo(W / 2, H - 6); c.stroke();
    c.fillStyle = '#3a3630'; c.fillRect(W / 2 - 1.5, 9, 3, 14); c.fillRect(W / 2 - 5, 13, 10, 3);
    c.fillStyle = 'rgba(60,70,40,0.35)'; ellipse(c, W * 0.3, H * 0.7, 10, 6); c.fill(); void r;
  },
  cercueil(c, W, H, r) {
    avecOmbre(c, 6, 3, 4, 0.6, () => { c.fillStyle = teinte('#5a3a22', 0.85 + r() * 0.3); c.beginPath(); c.moveTo(W * 0.3, 3); c.lineTo(W * 0.7, 3); c.lineTo(W - 4, H * 0.28); c.lineTo(W * 0.72, H - 3); c.lineTo(W * 0.28, H - 3); c.lineTo(4, H * 0.28); c.closePath(); c.fill(); });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#c8a032'; c.fillRect(W / 2 - 1, H * 0.25, 2, 10); c.fillRect(W / 2 - 4, H * 0.3, 8, 2);
  },
  housse(c, W, H, r) {
    avecOmbre(c, 5, 2, 3, 0.5, () => { c.fillStyle = pick(r, ['#d8d4c8', '#cfcabc', '#2a2c2e']); ellipse(c, W / 2, H / 2, W * 0.36, H * 0.44); c.fill(); });
    c.fillStyle = 'rgba(0,0,0,0.15)'; ellipse(c, W / 2, H * 0.22, W * 0.24, H * 0.12); c.fill();
    c.strokeStyle = 'rgba(40,40,40,0.6)'; c.lineWidth = 1.2; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(W / 2, H * 0.1); c.lineTo(W / 2, H * 0.9); c.stroke(); c.setLineDash([]);
    if (r() < 0.4) { c.fillStyle = 'rgba(80,10,12,0.55)'; ellipse(c, W / 2 + 3, H * 0.5, 6, 9); c.fill(); }
    c.fillStyle = '#c8a032'; c.fillRect(W / 2 - 3, H * 0.86, 6, 3);
  },
  autel(c, W, H) { boite(c, 2, 4, W - 4, H - 8, '#8a8476', { r: 2 }); c.fillStyle = '#d8d0c0'; c.fillRect(6, 6, W - 12, H - 12); c.fillStyle = '#c8a032'; c.fillRect(W / 2 - 1.5, 7, 3, H - 14); c.fillRect(W / 2 - 5, H / 2 - 1.5, 10, 3); },
  prie_dieu(c, W, H, r) { DESSINS.banc(c, W, H, r); },
  cloche(c, W, H) { avecOmbre(c, 8, 4, 6, 0.6, () => { const g = c.createRadialGradient(W / 2 - 6, H / 2 - 6, 2, W / 2, H / 2, W / 2 - 4); g.addColorStop(0, '#c8a052'); g.addColorStop(1, '#4a3a1a'); c.fillStyle = g; cercle(c, W / 2, H / 2, W / 2 - 5); c.fill(); }); c.fillStyle = '#2a1a0a'; cercle(c, W / 2, H / 2, 5); c.fill(); },
  pilier(c, W, H) { boite(c, 4, 4, W - 8, H - 8, '#7a7466', { r: 3, ombre: 0.7, flou: 10 }); },
  cadavre(c, W, H, r, R) { corpsDecor(c, W, H, r, R); },
  debris(c, W, H, r) {
    for (let k = 0; k < 9; k++) { const x = r() * W, y = r() * H, t = 1.5 + r() * 4, f = 0.6 + r() * 0.5; c.fillStyle = rgb([122 * f, 116 * f, 104 * f]); c.save(); c.translate(x, y); c.rotate(r() * 3); c.fillRect(-t / 2, -t / 2, t, t * 0.7); c.restore(); }
    for (let k = 0; k < 6; k++) { c.fillStyle = `rgba(170,200,210,${0.3 + r() * 0.3})`; const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y + 1); c.lineTo(x + 1, y + 3); c.closePath(); c.fill(); }
  },
  haie(c, W, H, r) { for (let k = 0; k < 14; k++) { const x = r() * W, y = r() * H, t = 5 + r() * 7, f = 0.6 + r() * 0.6; c.fillStyle = rgb([34 * f, 54 * f, 26 * f]); cercle(c, x, y, t); c.fill(); } },
  grille(c, W, H) { c.strokeStyle = '#141414'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke(); for (let k = 0; k < 4; k++) { c.fillStyle = '#222'; cercle(c, (k + 0.5) * W / 4, H / 2, 2); c.fill(); } },
};

// ---------- Véhicules ----------
function vehicule(c, W, H, r, R, coul, genre) {
  const L = W, l = H;
  avecOmbre(c, 12, 5, 8, 0.7, () => { c.fillStyle = teinte(coul, 0.85); rr(c, 3, l * 0.1, L - 6, l * 0.8, l * 0.28); c.fill(); });
  const g = c.createLinearGradient(0, l * 0.1, 0, l * 0.9);
  g.addColorStop(0, teinte(coul, 1.25)); g.addColorStop(0.5, coul); g.addColorStop(1, teinte(coul, 0.7));
  c.fillStyle = g; rr(c, 3, l * 0.1, L - 6, l * 0.8, l * 0.28); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2; rr(c, 3, l * 0.1, L - 6, l * 0.8, l * 0.28); c.stroke();
  // capot à gauche (avant), coffre à droite
  const av = genre === 'voiture' ? 0.24 : 0.2;
  if (genre === 'militaire') {
    c.fillStyle = '#4a5238'; rr(c, L * 0.32, l * 0.14, L * 0.64, l * 0.72, 4); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)'; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(L * 0.32 + k * L * 0.128, l * 0.14); c.lineTo(L * 0.32 + k * L * 0.128, l * 0.86); c.stroke(); }
    vitre(c, L * 0.14, l * 0.2, L * 0.1, l * 0.6);
  } else if (genre === 'ambulance' || genre === 'camionnette') {
    vitre(c, L * av, l * 0.18, L * 0.1, l * 0.64);
    c.fillStyle = teinte(coul, 1.08); rr(c, L * 0.34, l * 0.16, L * 0.6, l * 0.68, 4); c.fill();
    if (genre === 'ambulance') {
      c.fillStyle = '#c86a1a'; c.fillRect(L * 0.34, l * 0.16, L * 0.6, 3); c.fillRect(L * 0.34, l * 0.84 - 3, L * 0.6, 3);
      c.fillStyle = '#2a5ab8'; c.fillRect(L * 0.38, l * 0.42, L * 0.5, l * 0.16);
      c.fillStyle = '#b81e1e'; rr(c, L * 0.27, l * 0.36, 6, l * 0.28, 2); c.fill();
      c.fillStyle = '#d82a2a'; c.fillRect(L * 0.6, l * 0.44, 3, l * 0.12); c.fillRect(L * 0.6 - l * 0.06 + 1.5, l * 0.5 - 1.5, l * 0.12, 3);
    }
  } else {
    vitre(c, L * av, l * 0.17, L * 0.15, l * 0.66);           // pare-brise
    c.fillStyle = teinte(coul, 1.12); rr(c, L * (av + 0.16), l * 0.2, L * 0.3, l * 0.6, 5); c.fill(); // toit
    vitre(c, L * (av + 0.47), l * 0.2, L * 0.1, l * 0.6);     // lunette arrière
    // rétroviseurs
    c.fillStyle = teinte(coul, 0.6); c.fillRect(L * (av + 0.02), l * 0.04, 5, l * 0.08); c.fillRect(L * (av + 0.02), l * 0.88, 5, l * 0.08);
  }
  // phares / feux
  c.fillStyle = 'rgba(230,225,200,0.75)'; rr(c, 4, l * 0.18, 4, l * 0.14, 1.5); c.fill(); rr(c, 4, l * 0.68, 4, l * 0.14, 1.5); c.fill();
  c.fillStyle = 'rgba(160,20,20,0.85)'; c.fillRect(L - 7, l * 0.18, 3, l * 0.12); c.fillRect(L - 7, l * 0.7, 3, l * 0.12);
  // usure : vitre brisée, sang, rouille, porte ouverte
  if (r() < 0.4) { c.fillStyle = 'rgba(200,220,230,0.35)'; for (let k = 0; k < 8; k++) { const x = L * (av + 0.02) + r() * L * 0.13, y = l * 0.2 + r() * l * 0.6; c.fillRect(x, y, 1.2, 1.2); } }
  if (r() < 0.3) { c.fillStyle = 'rgba(70,8,10,0.6)'; ellipse(c, L * (0.4 + r() * 0.3), l * (0.3 + r() * 0.4), 8, 5, r()); c.fill(); }
  if (r() < 0.35) { c.fillStyle = 'rgba(110,60,30,0.3)'; ellipse(c, L * r(), l * 0.8, 10, 4); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.1)'; rr(c, L * 0.1, l * 0.14, L * 0.7, 2, 1); c.fill();
  void R; void hex;
}

function tronc(c, W, H, r, t, coul = '#3a2a1c') {
  avecOmbre(c, 4, 3, 4, 0.6, () => { c.fillStyle = coul; cercle(c, W / 2, H / 2, t); c.fill(); });
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; cercle(c, W / 2, H / 2, t * 0.6); c.stroke();
  // racines
  c.strokeStyle = coul; c.lineWidth = 3; c.lineCap = 'round';
  for (let k = 0; k < 4; k++) { const a = r() * 6.28; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * t * 0.8, H / 2 + Math.sin(a) * t * 0.8); c.lineTo(W / 2 + Math.cos(a) * (t + 5), H / 2 + Math.sin(a) * (t + 5)); c.stroke(); }
}

function corpsDecor(c, W, H, r, R) {
  c.save(); c.translate(W / 2, H / 2); c.rotate(r() * 6.28);
  c.fillStyle = 'rgba(54,6,8,0.72)'; ellipse(c, 2, 2, W * 0.42, H * 0.3, r()); c.fill();
  const peau = pick(r, ['#8a7a66', '#7a6a58', '#6a5e50']), habit = pick(r, ['#3b3128', '#2e3136', '#463a36', '#3a4048', '#5a2a2a']);
  c.strokeStyle = habit; c.lineCap = 'round'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(-4, -3); c.lineTo(-15, -9 + r() * 6); c.moveTo(-4, 3); c.lineTo(-15, 9 - r() * 6); c.stroke(); // jambes
  c.fillStyle = habit; ellipse(c, 1, 0, 9, 7); c.fill();
  c.lineWidth = 3.6; c.beginPath(); c.moveTo(4, -6); c.lineTo(8 + r() * 6, -13); c.moveTo(4, 6); c.lineTo(10, 12 - r() * 4); c.stroke(); // bras
  c.fillStyle = peau; cercle(c, 12, 0, 4.6); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.3)'; cercle(c, 13.5, 0, 2); c.fill();
  c.restore();
  void R;
}

// ---------- Partie haute (au-dessus des personnages) : houppiers, têtes de lampadaires ----------
// Pré-rendue en sprite par (type, variante) ; renvoie { cv, ox, oy, r } (centre du sprite au centre de l'objet).
const sprites = new Map();
// Houppier photoréaliste (img/objets/haut_<type>_<n>.webp) s'il est arrivé : même format { cv, S, rayon }.
const HAUT_SPRITE = { arbre: 'houppier', houppier: 'houppier', platane: 'platane', pin: 'pin', olivier: 'olivier', cypres: 'cypres', figuier: 'figuier', amandier: 'amandier' };
function spriteHautPhoto(R) {
  const nom = HAUT_SPRITE[R.haut]; if (!nom || !SP.meta) return null;
  const m = SP.meta['haut_' + nom]; if (!m) return null;
  const v = Math.abs(R.variante || 0) % (m.n || 1);
  const im = imageObjet('haut_' + nom, v); if (!im) return null;
  const rayon = (m.d || 3) * TS / 2;
  const S = Math.ceil(rayon * 2 + 24), cv = canvas(S, S), c = cv.getContext('2d');
  // ombre du feuillage au sol, décalée vers le bas-droite (le soleil est haut-gauche)
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 10; c.shadowOffsetX = 9; c.shadowOffsetY = 9;
  c.translate(S / 2, S / 2); c.rotate(((R.variante || 0) % 4) * Math.PI / 2);
  c.drawImage(im, -rayon, -rayon, rayon * 2, rayon * 2); c.restore();
  return { cv, S, rayon };
}
export function spriteHaut(R) {
  const cle = R.haut + ':' + (R.variante % 8);
  let s = sprites.get(cle);
  if (s) return s;
  s = spriteHautPhoto(R);
  if (s) { sprites.set(cle, s); return s; }
  const r = rng((R.variante % 8) * 101 + R.haut.length * 7);
  let rayon;
  switch (R.haut) {
    case 'platane': rayon = TS * 2.3; break;
    case 'pin': rayon = TS * 2.1; break;
    case 'olivier': rayon = TS * 1.4; break;
    case 'figuier': rayon = TS * 1.5; break;
    case 'amandier': rayon = TS * 1.35; break;
    case 'cypres': rayon = TS * 0.75; break;
    case 'lampadaire': rayon = TS * 0.6; break;
    default: rayon = TS * 1.7;
  }
  const S = Math.ceil(rayon * 2 + 16);
  const cv = canvas(S, S), c = cv.getContext('2d'), m = S / 2;
  if (R.haut === 'lampadaire') {
    c.strokeStyle = '#1c1c1e'; c.lineWidth = 3; c.beginPath(); c.moveTo(m, m); c.lineTo(m + rayon * 0.7, m); c.stroke();
    c.fillStyle = '#2a2a2c'; ellipse(c, m + rayon * 0.7, m, 7, 4.5); c.fill();
    c.fillStyle = '#f2e2b0'; ellipse(c, m + rayon * 0.7, m, 4, 2.4); c.fill();
  } else if (R.haut === 'cypres') {
    avecOmbre(c, 10, 6, 9, 0.55, () => { c.fillStyle = '#16210f'; ellipse(c, m, m, rayon, rayon * 0.92); c.fill(); });
    for (let k = 0; k < 26; k++) { const a = r() * 6.28, d = r() * rayon * 0.7, t = 4 + r() * 6, f = 0.6 + r() * 0.7; c.fillStyle = rgb([28 * f, 46 * f, 22 * f]); cercle(c, m + Math.cos(a) * d, m + Math.sin(a) * d, t); c.fill(); }
    c.fillStyle = 'rgba(160,200,120,0.08)'; cercle(c, m - rayon * 0.25, m - rayon * 0.25, rayon * 0.5); c.fill();
  } else {
    const base = R.haut === 'pin' ? [28, 44, 26] : R.haut === 'olivier' ? [70, 80, 58] : R.haut === 'figuier' ? [44, 74, 30] : R.haut === 'amandier' ? [64, 82, 44] : R.haut === 'platane' ? [52, 70, 34] : [36, 54, 28];
    const touffes = R.haut === 'pin' ? 9 : R.haut === 'olivier' ? 7 : 11;
    avecOmbre(c, 14, 10, 14, 0.5, () => {
      c.fillStyle = rgb(base.map(v => v * 0.7));
      for (let k = 0; k < touffes; k++) { const a = k / touffes * 6.28 + r() * 0.5, d = rayon * (0.35 + r() * 0.3); cercle(c, m + Math.cos(a) * d, m + Math.sin(a) * d, rayon * (0.38 + r() * 0.18)); c.fill(); }
      cercle(c, m, m, rayon * 0.55); c.fill();
    });
    // feuillage en touffes, éclairé en haut à gauche
    for (let k = 0; k < 90; k++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * rayon * 0.85, t = rayon * (0.08 + r() * 0.12), f = 0.7 + r() * 0.6;
      const x = m + Math.cos(a) * d, y = m + Math.sin(a) * d;
      const lum = 1 + 0.35 * (-(x - m) - (y - m)) / rayon;
      c.fillStyle = rgb(base.map(v => v * f * lum));
      if (R.haut === 'pin') { c.save(); c.translate(x, y); c.rotate(a); ellipse(c, 0, 0, t * 1.4, t * 0.7); c.fill(); c.restore(); }
      else { cercle(c, x, y, t); c.fill(); }
    }
    c.fillStyle = 'rgba(0,0,0,0.22)'; for (let k = 0; k < 10; k++) { const a = r() * 6.28, d = r() * rayon * 0.6; cercle(c, m + Math.cos(a) * d, m + Math.sin(a) * d, rayon * 0.06); c.fill(); }
    if (R.haut === 'platane') { c.strokeStyle = 'rgba(200,190,160,0.25)'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { const a = r() * 6.28; c.beginPath(); c.moveTo(m, m); c.lineTo(m + Math.cos(a) * rayon * 0.5, m + Math.sin(a) * rayon * 0.5); c.stroke(); } }
  }
  s = { cv, S, rayon };
  sprites.set(cle, s);
  return s;
}
export function viderSprites() { sprites.clear(); }
