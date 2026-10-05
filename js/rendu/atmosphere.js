// ============ Atmosphère : le soleil, les nuages, la brume, le vent — selon l'heure, la météo et le biome ============
// Tout se dessine par-dessus les blocs pré-rendus, à chaque image, sans allocation lourde :
//   ombresSoleil  ombres portées des bâtiments, murs, arbres et véhicules, orientées et allongées selon l'heure
//                 (soleil à l'est le matin, au sud à midi, à l'ouest le soir ; longues à l'aube et au couchant) ;
//                 calque hors écran : union des ombres, moins l'emprise des bâtiments (jamais d'ombre DANS une maison)
//   nuages        ombres de nuages qui glissent au sol dans le sens du vent (dehors, le jour)
//   brume         voiles de brouillard qui dérivent (météo « brouillard », brume du matin à la campagne)
//   mouille       sol mouillé sous la pluie (plus sombre, plus froid)
//   vent          ce que le vent emporte selon le biome : poussière de la Crau, papiers en ville, feuilles ailleurs
//   poussieres    grains de poussière dans le faisceau de la lampe
// Biome : 'ville' | 'sec' | 'vert', d'après les sols autour du joueur (biomeAutour).
import { TS, canvas, bruit, clamp } from './outils.js';
import { K, FIN, SOLS_IDS, MURS, MURS_IDS, OBJETS } from '../carte/catalogue.js';

// ---------- Le soleil ----------
// Début octobre à Salon (43,6° N, heure d'été) : lever ~7 h 45, coucher ~19 h 20, midi solaire ~13 h 30, ~42° à midi.
const LEVER = 7.6, COUCHER = 19.35, MIDI = 13.45, ELEV_MAX = 42 * Math.PI / 180;
// → { dx, dy } (unités d'ombre par unité de hauteur, vers où tombe l'ombre), force 0..1
export function soleil(h) {
  if (h <= LEVER || h >= COUCHER) return null;
  const t = (h - LEVER) / (COUCHER - LEVER);
  const elev = Math.max(0.035, ELEV_MAX * Math.sin(Math.PI * t));
  const az = Math.PI * (0.55 + 0.9 * (h - LEVER) / (COUCHER - LEVER));   // azimut du soleil depuis le nord (≈ 100° → 260°)
  const L = Math.min(3.2, 1 / Math.tan(elev));
  // l'ombre part à l'opposé du soleil ; carte : x vers l'est, y vers le sud
  const ax = -Math.sin(az), ay = Math.cos(az);
  const force = clamp(Math.sin(Math.PI * t) * 2.2, 0, 1);
  return { dx: ax * L, dy: ay * L, force };
}
// Visibilité du soleil selon la météo.
const CIEL = { clair: 1, mistral: 0.95, couvert: 0.3, pluie: 0.12, brouillard: 0.1, orage: 0.08 };

// Hauteurs (unités de 0,8 m)
const H_TOIT = { tuiles: 8, ardoise: 6, zinc: 9, terrasse: 8, tole: 3.5, verriere: 4 };
const H_MUR = { pierre: 2.6, crepi: 3, brique: 3, beton: 3, bois: 2.4, tole: 2.4, platre: 3, haie: 2.2, muret: 0.9, rocher: 4 };
const H_ARBRE = { platane: 11, pin: 10, cypres: 9, olivier: 4.5, figuier: 4, amandier: 5, arbre: 7 };
const H_OBJET = { voiture: 1.8, camionnette: 2.6, ambulance: 3, camion_mil: 3.5, conteneur: 3.2, benne: 1.8, tente: 2, caveau: 3, statue: 3, cloche: 2, fontaine: 1.2 };

// Les « lanceurs d'ombre » d'un étage, calculés une fois : rectangles (unités) et cercles (houppiers).
function lanceurs(niveau, E) {
  if (E._ombres) return E._ombres;
  const rects = [], cercles = [], empreintes = [];
  for (const t of (E.rendu && E.rendu.toits) || []) {
    const h = H_TOIT[t.type] || 7;
    rects.push({ x: t.x + 0.15, y: t.y + 0.15, w: t.w - 0.3, h: t.h - 0.3, ht: h });
    empreintes.push({ x: t.x, y: t.y, w: t.w, h: t.h });
  }
  // murs extérieurs (enceintes, murets, haies) : plages horizontales de petites cases de murs qui touchent une pièce extérieure
  const w = E.w, exterieur = (i) => { const p = E.piece[i]; return p >= 0 && niveau.pieces[p].exterieur; };
  const enToit = new Uint8Array(E.w * E.h);
  for (const t of (E.rendu && E.rendu.toits) || []) for (let y = Math.max(0, Math.floor(t.y * FIN)); y < Math.min(E.h, Math.ceil((t.y + t.h) * FIN)); y++) for (let x = Math.max(0, Math.floor(t.x * FIN)); x < Math.min(E.w, Math.ceil((t.x + t.w) * FIN)); x++) enToit[y * w + x] = 1;
  for (let y = 0; y < E.h; y++) {
    let x = 0;
    while (x < w) {
      const i = y * w + x;
      const st = E.code[i] === K.MUR ? MURS_IDS[E.mur[i]] : null;
      const ht = st ? H_MUR[st] : 0;
      if (!ht || enToit[i] || !(exterieur(i - 1 >= 0 ? i - 1 : i) || exterieur(i + 1) || exterieur(i - w >= 0 ? i - w : i) || exterieur(i + w < E.w * E.h ? i + w : i))) { x++; continue; }
      let x2 = x;
      while (x2 + 1 < w && E.code[y * w + x2 + 1] === K.MUR && MURS_IDS[E.mur[y * w + x2 + 1]] === st && !enToit[y * w + x2 + 1]) x2++;
      rects.push({ x: x / FIN, y: y / FIN, w: (x2 - x + 1) / FIN, h: 1 / FIN, ht });
      x = x2 + 1;
    }
  }
  for (const R of (E.rendu && E.rendu.objets) || []) {
    const d = R.d || OBJETS[R.type] || {};
    if (d.haut && H_ARBRE[R.haut || d.haut] != null) {
      const ht = H_ARBRE[R.haut || d.haut];
      const col = (R.haut || d.haut) === 'cypres';
      cercles.push({ x: R.x + R.w / 2, y: R.y + R.h / 2, r: col ? 0.55 : (R.haut || d.haut) === 'olivier' ? 1.3 : 1.7, ht, colonne: col, objet: R });
    } else if (H_OBJET[R.type]) rects.push({ x: R.x + 0.1, y: R.y + 0.1, w: R.w - 0.2, h: R.h - 0.2, ht: H_OBJET[R.type], objet: R });
  }
  E._ombres = { rects, cercles, empreintes };
  return E._ombres;
}

// ---------- Textures de bruit (nuages, brume) : tuiles sans couture ----------
function textureNuages(seuil, k, coul) {
  const S = 160, c = canvas(S, S), g = c.getContext('2d'), im = g.createImageData(S, S), d = im.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let v = 0, a = 0.55, n = 3;
    for (let o = 0; o < 4; o++) { v += a * bruit(x / S * n, y / S * n, n, k + o * 13); a *= 0.5; n *= 2; }
    v /= 0.55 + 0.275 + 0.1375 + 0.06875;
    const t = clamp((v - seuil) / 0.22, 0, 1), o = (y * S + x) * 4;
    d[o] = coul[0]; d[o + 1] = coul[1]; d[o + 2] = coul[2]; d[o + 3] = Math.round(255 * t * t * (3 - 2 * t));
  }
  g.putImageData(im, 0, 0);
  return c;
}

export function creerAtmosphere() {
  let calque = null, cctx = null, cw = 0, ch = 0;
  const tex = {};
  const motif = (ctx, nom, fab) => { let m = tex[nom]; if (!m || m.ctx !== ctx) { m = tex[nom] = { ctx, p: ctx.createPattern(fab(), 'repeat') }; } return m.p; };

  // Ombres portées du soleil (ctx en coordonnées ÉCRAN ; ecranX/ecranY convertissent des unités ; pxc = px par unité).
  function ombresSoleil(ctx, S, niveau, E, W, H, ecranX, ecranY, pxc, vue, dpr) {
    const sol = soleil(S.heure ?? 12);
    if (!sol) return;
    const f = sol.force * (CIEL[S.meteo] ?? 1);
    if (f < 0.04) return;
    const L = lanceurs(niveau, E);
    if (!L.rects.length && !L.cercles.length) return;
    const k = 0.5;                                   // calque à demi-résolution (les ombres sont floues de toute façon)
    const lw = Math.max(1, Math.ceil(W * k)), lh = Math.max(1, Math.ceil(H * k));
    if (!calque || cw !== lw || ch !== lh) { calque = canvas(lw, lh); cctx = calque.getContext('2d'); cw = lw; ch = lh; }
    const c = cctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, lw, lh);
    c.setTransform(k * pxc, 0, 0, k * pxc, k * ecranX(0), k * ecranY(0));
    const [vx0, vy0, vx1, vy1] = vue, marge = 14;
    c.fillStyle = '#000';
    c.beginPath();
    for (const r of L.rects) {
      const ox = sol.dx * r.ht, oy = sol.dy * r.ht;
      if (r.objet && r.objet.retire) continue;
      if (Math.max(r.x + r.w, r.x + r.w + ox) < vx0 - 1 || Math.min(r.x, r.x + ox) > vx1 + 1 || Math.max(r.y + r.h, r.y + r.h + oy) < vy0 - 1 || Math.min(r.y, r.y + oy) > vy1 + 1) continue;
      balayage(c, r.x, r.y, r.w, r.h, ox, oy);
    }
    c.fill('nonzero');
    // arbres : le tronc (un trait) puis le houppier (une ellipse au bout) ; le cyprès, colonne, projette une longue
    // ombre effilée d'un seul tenant
    c.beginPath();
    for (const a of L.cercles) {
      if (a.objet && a.objet.retire) continue;
      const ox = sol.dx * a.ht, oy = sol.dy * a.ht;
      if (Math.max(a.x, a.x + ox) + a.r < vx0 - 1 || Math.min(a.x, a.x + ox) - a.r > vx1 + 1 || Math.max(a.y, a.y + oy) + a.r < vy0 - 1 || Math.min(a.y, a.y + oy) - a.r > vy1 + 1) continue;
      const ang = Math.atan2(oy, ox), long = Math.hypot(ox, oy);
      if (a.colonne) {
        // fuseau : de la base (étroite) au sommet (pointu), large au premier tiers
        const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, R = a.r;
        c.moveTo(a.x + nx * R * 0.5, a.y + ny * R * 0.5);
        c.quadraticCurveTo(a.x + ca * long * 0.35 + nx * R * 1.3, a.y + sa * long * 0.35 + ny * R * 1.3, a.x + ca * long, a.y + sa * long);
        c.quadraticCurveTo(a.x + ca * long * 0.35 - nx * R * 1.3, a.y + sa * long * 0.35 - ny * R * 1.3, a.x - nx * R * 0.5, a.y - ny * R * 0.5);
        c.closePath();
      } else {
        const cx = a.x + ox * 0.78, cy = a.y + oy * 0.78;
        c.moveTo(cx + a.r, cy); c.ellipse(cx, cy, a.r * (1 + Math.min(0.6, long / 30)), a.r * 0.85, ang, 0, Math.PI * 2);
      }
    }
    c.fill();
    c.lineCap = 'round'; c.lineWidth = 0.2; c.strokeStyle = '#000'; c.beginPath();
    for (const a of L.cercles) { if (a.colonne || (a.objet && a.objet.retire)) continue; c.moveTo(a.x, a.y); c.lineTo(a.x + sol.dx * a.ht * 0.6, a.y + sol.dy * a.ht * 0.6); }
    c.stroke();
    // jamais d'ombre DANS un bâtiment (son toit la porte quand on est dehors ; dedans, la pièce a sa propre lumière)
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    for (const e of L.empreintes) c.rect(e.x, e.y, e.w, e.h);
    c.fill();
    c.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 0.34 * f;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(calque, 0, 0, lw, lh, 0, 0, W, H);
    ctx.restore();
  }
  // Rectangle (x, y, w, h) balayé par la translation (ox, oy) : le rectangle, son image et les faces qui les relient.
  function balayage(c, x, y, w, h, ox, oy) {
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const sh = pts.map(([a, b]) => [a + ox, b + oy]);
    // enveloppe convexe des 8 points (sens horaire constant → union correcte en « nonzero »)
    const tous = pts.concat(sh).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const bas = [], haut = [];
    for (const p of tous) { while (bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop(); bas.push(p); }
    for (let i = tous.length - 1; i >= 0; i--) { const p = tous[i]; while (haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop(); haut.push(p); }
    const env = bas.slice(0, -1).concat(haut.slice(0, -1));
    c.moveTo(env[0][0], env[0][1]);
    for (let i = 1; i < env.length; i++) c.lineTo(env[i][0], env[i][1]);
    c.closePath();
  }

  // Ombres des nuages qui glissent au sol (dehors, le jour).
  function nuages(ctx, S, W, H, ecranX, ecranY, pxc, t, dpr) {
    if (!S.dehors) return;
    const j = S.jour ?? 1; if (j < 0.35) return;
    const m = S.meteo || 'clair';
    const force = { clair: 0.16, mistral: 0.13, couvert: 0.3, pluie: 0.22, brouillard: 0, orage: 0.3 }[m] ?? 0.15;
    if (!force) return;
    const p = motif(ctx, m === 'clair' || m === 'mistral' ? 'nuages_epars' : 'nuages_couverts',
      () => textureNuages(m === 'clair' || m === 'mistral' ? 0.56 : 0.4, 7, [8, 10, 16]));
    const ech = 34;                                    // une tuile de texture = 34 unités (≈ 27 m)
    const v = 0.0004 * (0.4 + 1.6 * (S.vent ?? 0.3));  // dérive (unités/ms), vers l'est-sud-est
    const ox = (t * v) % ech, oy = (t * v * 0.35) % ech;
    const s = pxc * ech / 160;
    ctx.save();
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ecranX(ox), dpr * ecranY(oy));
    ctx.globalAlpha = force * Math.min(1, (j - 0.35) / 0.4);
    ctx.fillStyle = p;
    const x0 = -ecranX(ox) / s, y0 = -ecranY(oy) / s;
    ctx.fillRect(x0 - 160, y0 - 160, W / s + 320, H / s + 320);
    ctx.restore();
  }

  // Brouillard : deux voiles qui dérivent à des vitesses différentes, plus épais loin du joueur.
  function brume(ctx, S, W, H, ecranX, ecranY, pxc, t, dpr) {
    const h = S.heure ?? 12;
    let force = S.meteo === 'brouillard' ? 0.62 : 0;
    if (!force && S.dehors && S.biome !== 'ville' && h > 5.5 && h < 9 && (S.meteo === 'clair' || S.meteo === 'couvert')) force = 0.22 * Math.sin(Math.PI * (h - 5.5) / 3.5);   // brume du matin
    force *= 0.25 + 0.75 * (S.jour ?? 1);          // la nuit, le brouillard ne s'éclaire plus : il éteint
    if (force < 0.02) return;
    const p = motif(ctx, 'brume', () => textureNuages(0.38, 23, [196, 200, 204]));
    ctx.save();
    for (const [ech, v, a] of [[26, 0.00035, 0.55], [11, 0.0007, 0.35]]) {
      const s = pxc * ech / 160, ox = (t * v) % ech, oy = (t * v * 0.2) % ech;
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ecranX(ox), dpr * ecranY(oy));
      ctx.globalAlpha = force * a;
      ctx.fillStyle = p;
      const x0 = -ecranX(ox) / s, y0 = -ecranY(oy) / s;
      ctx.fillRect(x0 - 160, y0 - 160, W / s + 320, H / s + 320);
    }
    // plus loin, plus blanc
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const jx = ecranX(S.joueur.x), jy = ecranY(S.joueur.y);
    const g = ctx.createRadialGradient(jx, jy, pxc * 2.5, jx, jy, Math.max(W, H) * 0.7);
    const nb = Math.round(60 + 116 * (S.jour ?? 1));
    g.addColorStop(0, `rgba(${nb},${nb + 6},${nb + 12},0)`); g.addColorStop(1, `rgba(${nb},${nb + 6},${nb + 12},${(0.75 * force).toFixed(3)})`);
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Sol mouillé sous la pluie : plus sombre, plus froid, une lueur qui luit sur le pavé.
  function mouille(ctx, S, W, H) {
    if (!(S.pluie > 0) || !S.dehors) return;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(150,165,185,${(0.35 * S.pluie).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Grains de poussière qui flottent dans le faisceau de la lampe (coordonnées monde, ctx en px monde).
  const grains = Array.from({ length: 26 }, (_, i) => ({ a: (i * 2.399) % 1, d: ((i * 0.618) % 1), p: i * 1.7 }));
  function poussieres(ctx, S, t) {
    if (!S.nLampes) return;
    const L = S.lampes[0]; if (!L || L.forme === 'halo' || L.sec) return;
    const demi = (L.angle || 60) * Math.PI / 360;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const g of grains) {
      const a = L.dir + (g.a - 0.5) * 2 * demi * 0.85 + Math.sin(t / 2100 + g.p) * 0.05;
      const d = 0.8 + g.d * (L.portee - 1.2) + Math.sin(t / 1700 + g.p * 3) * 0.25;
      const x = (L.x + Math.cos(a) * d) * TS, y = (L.y + Math.sin(a) * d) * TS;
      const fl = 0.5 + 0.5 * Math.sin(t / 380 + g.p * 5);
      ctx.fillStyle = `rgba(255,235,190,${(0.10 + 0.22 * fl) * (1 - g.d * 0.6)})`;
      ctx.fillRect(x, y, 1.3, 1.3);
    }
    ctx.restore();
  }

  return { ombresSoleil, nuages, brume, mouille, poussieres, oublier(E) { if (E) E._ombres = null; } };
}

// Biome autour du joueur, d'après les sols (rayon ~7 unités) : 'ville' (bitume, pavés, béton), 'sec' (Crau, terre, gravier,
// sable, herbe sèche), 'vert' (herbe, boue).
const CAT = (() => {
  const c = {};
  for (const id of ['bitume', 'paves', 'trottoir', 'beton', 'dalles', 'marbre', 'carrelage', 'carrelage_damier']) c[id] = 'ville';
  for (const id of ['terre', 'gravier', 'sable', 'herbe_seche', 'debris']) c[id] = 'sec';
  for (const id of ['herbe', 'boue']) c[id] = 'vert';
  return c;
})();
export function biomeAutour(E, x, y) {
  const n = { ville: 0, sec: 0, vert: 0 };
  const cx = Math.floor(x * FIN), cy = Math.floor(y * FIN), R = 7 * FIN;
  for (let dy = -R; dy <= R; dy += 2) for (let dx = -R; dx <= R; dx += 2) {
    const fx = cx + dx, fy = cy + dy; if (fx < 0 || fy < 0 || fx >= E.w || fy >= E.h) continue;
    const i = fy * E.w + fx; if (E.code[i] !== K.SOL) continue;
    const k = CAT[SOLS_IDS[E.sol[i]]]; if (k) n[k]++;
  }
  return n.sec > n.ville && n.sec >= n.vert ? 'sec' : n.vert > n.ville ? 'vert' : 'ville';
}
void MURS;
