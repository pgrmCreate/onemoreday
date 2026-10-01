// ============ Rendu canvas de l'exploration ============
// Tuiles statiques pré-rendues par blocs (tuiles.js), dynamique par-dessus, puis une COUCHE D'OMBRE composée :
// un petit ImageData (2×2 échantillons par case) où chaque pixel dit l'obscurité (non vu = noir, déjà vu = gris
// sombre, vu = selon la lumière et la lampe), agrandi avec lissage → bords doux. Puis ondes, « ? », grain, vignette.
// Aucune allocation dans la boucle (hors blocs rendus la première fois).
import { TS, CHUNK, rendreChunk, dessinerPorte, dessinerPersonnage, dessinerMort, dessinerCorps, dessinerObjetSol } from './tuiles.js';
import { lumiereLampe } from './vision.js';
import { K } from './niveau.js';

const SUB = 2;                 // échantillons d'ombre par case (par axe)

export function creerRendu(canvas, niveau) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let W = 0, H = 0, dpr = 1;
  const cam = { x: 0, y: 0, zoom: 1, pxc: 40, init: false };
  const chunks = new Map();
  let masque = null, mctx = null, mdata = null, mw = 0, mh = 0;
  let grain = null, vignette = null;
  let carteCv = null, carteT = 0, premier = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    vignette = null;
    majEchelle();
  }
  function majEchelle() {
    const base = Math.max(24, Math.min(W / 22, H / 12.5));
    cam.pxc = base * cam.zoom;
    const cols = Math.ceil(W / cam.pxc) + 3, rows = Math.ceil(H / cam.pxc) + 3;
    if (!masque || cols * SUB > mw || rows * SUB > mh) {
      mw = cols * SUB; mh = rows * SUB;
      masque = document.createElement('canvas'); masque.width = mw; masque.height = mh;
      mctx = masque.getContext('2d');
      mdata = mctx.createImageData(mw, mh);
    }
  }
  function setZoom(z) { cam.zoom = Math.max(0.55, Math.min(2, z)); majEchelle(); }

  function preparerGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const g = c.getContext('2d'); const d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
    grain = ctx.createPattern(c, 'repeat');
  }
  function preparerVignette() {
    const c = document.createElement('canvas'); c.width = Math.round(W); c.height = Math.round(H);
    const g = c.getContext('2d');
    const rad = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.72);
    rad.addColorStop(0, 'rgba(0,0,0,0)'); rad.addColorStop(1, 'rgba(0,0,0,0.78)');
    g.fillStyle = rad; g.fillRect(0, 0, W, H);
    vignette = c;
  }

  function chunk(E, cx, cy, forcer) {
    const k = E.idx * 100000 + cy * 1000 + cx;
    let c = chunks.get(k);
    if (!c && forcer) { c = rendreChunk(niveau, E, cx * CHUNK, cy * CHUNK); chunks.set(k, c); }
    return c;
  }

  const ecranX = (x) => (x - cam.x) * cam.pxc + W / 2;
  const ecranY = (y) => (y - cam.y) * cam.pxc + H / 2;
  function ecranVersMonde(sx, sy) {
    const r = canvas.getBoundingClientRect();
    return { x: (sx - r.left - W / 2) / cam.pxc + cam.x, y: (sy - r.top - H / 2) / cam.pxc + cam.y };
  }
  function suivre(x, y, dt, avanceX = 0, avanceY = 0) {
    const tx = x + avanceX, ty = y + avanceY;
    if (!cam.init) { cam.x = tx; cam.y = ty; cam.init = true; return; }
    const k = 1 - Math.exp(-dt / 180);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  }
  function recaler() { cam.init = false; premier = false; }

  // ---------- Image ----------
  // S : { E, C (champ), jour, t, joueur, pairs[], zombies[], portes{}, sol[], cadavres[], cible, fouille, ondes[], lampes[], nLampes, carte }
  function dessiner(S) {
    if (!W) resize();
    const t0 = performance.now();
    const E = S.E, C = S.C, pxc = cam.pxc;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    const vx0 = cam.x - W / 2 / pxc, vy0 = cam.y - H / 2 / pxc;
    const vx1 = cam.x + W / 2 / pxc, vy1 = cam.y + H / 2 / pxc;
    // 1) blocs statiques
    const cx0 = Math.max(0, Math.floor(vx0 / CHUNK)), cy0 = Math.max(0, Math.floor(vy0 / CHUNK));
    const cx1 = Math.min(Math.ceil(E.w / CHUNK) - 1, Math.floor(vx1 / CHUNK)), cy1 = Math.min(Math.ceil(E.h / CHUNK) - 1, Math.floor(vy1 / CHUNK));
    let nouveaux = 0;
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      let c = chunk(E, cx, cy, false);
      if (!c && (nouveaux < 2 || !premier)) { c = chunk(E, cx, cy, true); nouveaux++; }
      if (!c) continue;
      const s = CHUNK * pxc;
      ctx.drawImage(c, Math.floor(ecranX(cx * CHUNK)), Math.floor(ecranY(cy * CHUNK)), Math.ceil(s) + 1, Math.ceil(s) + 1);
    }
    premier = true;
    // 2) dynamique en coordonnées monde (1 unité = TS px de tuile)
    const k = pxc / TS;
    ctx.save();
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (W / 2 - cam.x * pxc), dpr * (H / 2 - cam.y * pxc));
    const visCase = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 0 || cy < 0 || cx >= E.w || cy >= E.h) return 0; const i = cy * E.w + cx; return C.los[i] === C.stamp ? C.vis[i] : 0; };
    const vuCase = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 0 || cy < 0 || cx >= E.w || cy >= E.h) return 0; return C.vu[cy * E.w + cx]; };
    for (const cd of S.cadavres) {
      if (cd.etage !== E.id || !vuCase(cd.x, cd.y)) continue;
      dessinerCorps(ctx, cd.x * TS, cd.y * TS, cd.dir + Math.PI, rngCd(cd.uid), true, '#7d8070', '#3b3128');
    }
    for (const o of S.sol) {
      if (o.etage !== E.id || !vuCase(o.x, o.y)) continue;
      dessinerObjetSol(ctx, o.x * TS, o.y * TS, !!o.doc, S.t);
    }
    for (const p of niveau.portes) {
      if (p.etage !== E.id || p.x < vx0 - 1 || p.x > vx1 + 1 || p.y < vy0 - 1 || p.y > vy1 + 1) continue;
      const s = S.portes[p.cle]; if (!s) continue;
      dessinerPorte(ctx, p, s, S.t);
    }
    for (const n of S.pnj) {
      if (n.etage !== E.id || visCase(n.x, n.y) < 0.2) continue;
      dessinerPersonnage(ctx, n.x * TS, n.y * TS, n.dir || Math.PI / 2, STYLE_PNJ, S.t, 0);
    }
    for (const z of S.zombies) {
      if (z.etage !== E.id) continue;
      const v = visCase(z.x, z.y);
      z._vu = v > 0.3 && (z.type !== 'rampant' || Math.hypot(z.x - S.joueur.x, z.y - S.joueur.y) <= 3 || z._eclaire);
      if (!z._vu) continue;
      dessinerMort(ctx, z.x * TS, z.y * TS, z, S.t, Math.min(1, (z.vitesse || 0) / 1.5));
    }
    for (const p of S.pairs) {
      if (p.etage !== E.id || visCase(p.x, p.y) < 0.15) continue;
      dessinerPersonnage(ctx, p.x * TS, p.y * TS, p.dir, p.lampe ? STYLE_PAIR_L : STYLE_PAIR, S.t, p.marche || 0, p.allure);
    }
    const J = S.joueur;
    dessinerPersonnage(ctx, J.x * TS, J.y * TS, J.dir, J.lampe ? STYLE_JOUEUR_L : STYLE_JOUEUR, S.t, J.marche, J.allure);
    ctx.restore();

    // 3) couche d'ombre
    const rx0 = Math.floor(vx0) - 1, ry0 = Math.floor(vy0) - 1;
    const cols = Math.min(mw / SUB, Math.ceil(vx1) - rx0 + 2), rows = Math.min(mh / SUB, Math.ceil(vy1) - ry0 + 2);
    const d = mdata.data, lampes = S.lampes, nL = S.nLampes, jour = S.jour;
    const stride = mw * 4;
    for (let cy = 0; cy < rows; cy++) {
      const y = ry0 + cy;
      for (let cx = 0; cx < cols; cx++) {
        const x = rx0 + cx;
        let enLos = false, vis = 0, vu = 0, base = 0, i = -1;
        if (x >= 0 && y >= 0 && x < E.w && y < E.h) {
          i = y * E.w + x;
          enLos = C.los[i] === C.stamp; vis = enLos ? C.vis[i] : 0; vu = C.vu[i];
          base = E.lumBase[i] * jour;
        }
        for (let sy = 0; sy < SUB; sy++) for (let sx = 0; sx < SUB; sx++) {
          const o = (cy * SUB + sy) * stride + (cx * SUB + sx) * 4;
          if (vis > 0.01) {
            const px = x + (sx + 0.5) / SUB, py = y + (sy + 0.5) / SUB;
            let l = base, chaud = 0;
            for (let q = 0; q < nL; q++) {
              const L = lampes[q];
              if (L.sec && C.los2[i] !== C.stamp2) continue;
              const c = lumiereLampe(L, px, py);
              if (c > 0) { l = l + c * (1 - l * 0.5); chaud += c; }
            }
            if (l > 1) l = 1;
            let b = vis * (0.1 + 0.9 * Math.pow(l, 0.75));
            if (vu && b < 0.14) b = 0.14;
            const a = 1 - b;
            const w = chaud > 1 ? 1 : chaud;
            d[o] = 40 * w; d[o + 1] = 24 * w; d[o + 2] = 4 * w; d[o + 3] = a * 255;
          } else if (vu) { d[o] = 9; d[o + 1] = 10; d[o + 2] = 13; d[o + 3] = 222; }
          else { d[o] = 0; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 255; }
        }
      }
    }
    mctx.putImageData(mdata, 0, 0, 0, 0, cols * SUB, rows * SUB);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(masque, 0, 0, cols * SUB, rows * SUB, ecranX(rx0), ecranY(ry0), cols * pxc, rows * pxc);

    // lueur chaude de la lampe (soft-light : noir reste noir)
    for (let q = 0; q < nL; q++) {
      const L = lampes[q];
      const gx = ecranX(L.x), gy = ecranY(L.y), R = (L.portee + 1) * pxc;
      const g = ctx.createRadialGradient(gx, gy, pxc * 0.3, gx, gy, R);
      g.addColorStop(0, 'rgba(255,200,120,0.5)'); g.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g;
      ctx.beginPath();
      if (L.forme === 'halo') ctx.arc(gx, gy, R, 0, 7);
      else { const dm = (L.angle || 60) * Math.PI / 360 + 0.15; ctx.moveTo(gx, gy); ctx.arc(gx, gy, R, L.dir - dm, L.dir + dm); ctx.closePath(); }
      ctx.fill(); ctx.restore();
    }

    // 4) superpositions lisibles
    // cible d'interaction
    if (S.cible && S.cible.etage === E.id) {
      const c = S.cible;
      ctx.strokeStyle = 'rgba(201,162,39,0.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.strokeRect(ecranX(c.x0) + 1, ecranY(c.y0) + 1, (c.x1 - c.x0) * pxc - 2, (c.y1 - c.y0) * pxc - 2);
      ctx.setLineDash([]);
    }
    // repérage « ? »
    for (const z of S.zombies) {
      if (!z._vu || z.etage !== E.id) continue;
      if (z.etat === 'chasse') { marque(ecranX(z.x), ecranY(z.y) - pxc * 0.75, 1, true); continue; }
      if (z.alerte > 0.02) marque(ecranX(z.x), ecranY(z.y) - pxc * 0.75, z.alerte, false);
    }
    // ondes (ce qu'on entend)
    for (let q = 0; q < S.ondes.length; q++) {
      const o = S.ondes[q];
      if (o.etage !== E.id) continue;
      const a = 1 - o.age / o.duree; if (a <= 0) continue;
      let ox = ecranX(o.x), oy = ecranY(o.y);
      const marge = 26;
      const dehors = ox < marge || oy < marge || ox > W - marge || oy > H - marge;
      if (dehors) { ox = Math.max(marge, Math.min(W - marge, ox)); oy = Math.max(marge, Math.min(H - marge, oy)); }
      ctx.strokeStyle = o.danger ? `rgba(214,48,62,${0.55 * a})` : `rgba(230,223,204,${0.45 * a})`;
      ctx.lineWidth = 2;
      for (let r = 0; r < 2; r++) { const rr = ((o.age / 600 + r * 0.5) % 1) * (dehors ? 18 : pxc * 0.9) + 4; ctx.beginPath(); ctx.arc(ox, oy, rr, 0, 7); ctx.stroke(); }
    }
    // barre de fouille
    if (S.fouilleOn) {
      const f = S.fouille, bx = ecranX(f.x) - pxc * 0.7, by = ecranY(f.y) - pxc * 0.9, bw = pxc * 1.4;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 9);
      ctx.fillStyle = '#c9a227'; ctx.fillRect(bx, by, bw * f.frac, 5);
      ctx.fillStyle = 'rgba(230,223,204,0.8)';
      for (let n = 0; n < f.n; n++) { const fx = bx + bw * (n + 1) / (f.n + 1); ctx.fillRect(fx - 0.5, by - 1, 1, 7); }
    }
    // grain + vignette
    if (!grain) preparerGrain();
    if (!vignette) preparerVignette();
    ctx.drawImage(vignette, 0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-((S.t * 0.37) % 160) | 0, -((S.t * 0.61) % 160) | 0);
    ctx.fillStyle = grain; ctx.fillRect(0, 0, W + 160, H + 160);
    ctx.restore();
    // carte du lieu
    if (S.carte) dessinerCarte(S);
    // pré-rendu des blocs restants quand il reste du temps
    if (performance.now() - t0 < 7) {
      for (let cy = 0; cy < Math.ceil(E.h / CHUNK); cy++) for (let cx = 0; cx < Math.ceil(E.w / CHUNK); cx++) {
        if (!chunk(E, cx, cy, false)) { chunk(E, cx, cy, true); return; }
      }
    }
  }
  function marque(x, y, f, plein) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill();
    ctx.strokeStyle = plein ? '#d6303e' : '#c9a227'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
    ctx.fillStyle = plein ? '#d6303e' : '#e6dfcc'; ctx.font = 'bold 12px Oswald, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(plein ? '!' : '?', x, y + 0.5);
  }
  function dessinerCarte(S) {
    const E = S.E, C = S.C;
    if (!carteCv || S.t - carteT > 500 || carteCv._e !== E.id) {
      carteT = S.t;
      carteCv = carteCv && carteCv._e === E.id ? carteCv : document.createElement('canvas');
      carteCv._e = E.id; carteCv.width = E.w; carteCv.height = E.h;
      const g = carteCv.getContext('2d'); const im = g.createImageData(E.w, E.h);
      for (let i = 0; i < E.w * E.h; i++) {
        const o = i * 4; if (!C.vu[i]) { im.data[o + 3] = 0; continue; }
        const k = E.code[i];
        const v = k === K.MUR || k === K.FENETRE ? 200 : k === K.MEUBLE ? 110 : k === K.PORTE ? 170 : k === K.SORTIE ? 240 : 60;
        im.data[o] = k === K.SORTIE ? 201 : v; im.data[o + 1] = k === K.SORTIE ? 162 : v * 0.96; im.data[o + 2] = k === K.SORTIE ? 39 : v * 0.85; im.data[o + 3] = 230;
      }
      g.putImageData(im, 0, 0);
    }
    const s = Math.min((W * 0.7) / E.w, (H * 0.75) / E.h);
    const x = (W - E.w * s) / 2, y = (H - E.h * s) / 2;
    ctx.fillStyle = 'rgba(8,8,9,0.88)'; ctx.fillRect(x - 14, y - 34, E.w * s + 28, E.h * s + 48);
    ctx.fillStyle = '#e6dfcc'; ctx.font = '600 15px Oswald, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${niveau.nom} — ${E.nom}`, x, y - 12);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(carteCv, x, y, E.w * s, E.h * s);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.arc(x + S.joueur.x * s, y + S.joueur.y * s, Math.max(3, s * 0.6), 0, 7); ctx.fill();
  }

  resize();
  return {
    cam, resize, dessiner, ecranVersMonde, suivre, recaler, setZoom,
    zoom: () => cam.zoom, taille: () => ({ W, H }),
    viderCache() { chunks.clear(); },
    fermer() { chunks.clear(); masque = null; grain = null; vignette = null; carteCv = null; },
  };
}

const STYLE_JOUEUR = { manteau: '#3a3d33', cheveux: '#241a12', peau: '#b89378', lampe: false };
const STYLE_JOUEUR_L = { ...STYLE_JOUEUR, lampe: true };
const STYLE_PAIR = { manteau: '#2f3a4a', cheveux: '#3a2a1a', peau: '#a88468', lampe: false };
const STYLE_PAIR_L = { ...STYLE_PAIR, lampe: true };
const STYLE_PNJ = { manteau: '#5a4636', cheveux: '#5a5048', peau: '#b39276', lampe: false };
// Générateur réutilisé (réinitialisé par cadavre) : pas d'allocation par image.
let rs = 0;
const rsuiv = () => { rs = (rs * 1103515245 + 12345) | 0; return ((rs >>> 8) & 0xffff) / 65536; };
function rngCd(uid) {
  const u = String(uid); let s = 0;
  for (let i = 0; i < u.length; i++) s = (s * 31 + u.charCodeAt(i)) | 0;
  rs = s; return rsuiv;
}
