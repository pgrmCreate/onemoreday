// ============ Moteur de rendu de l'exploration — orchestre les couches ============
//   1. blocs pré-rendus (sol + transitions + décals + murs + objets bas), en cache LRU
//   2. calque de sang persistant, cadavres, objets au sol, portes animées, arcs d'attaque
//   3. personnages triés par profondeur (PNJ, morts, coéquipier, joueur), flammes, particules, traînées
//   4. houppiers et têtes de lampadaires (au-dessus des personnages, transparents près du joueur)
//   5. masque d'obscurité coloré (jour, sources fixes vacillantes, lampes) + halos
//   6. toits (vus de dehors), repères lisibles (cible, objectif, coéquipier, ondes, chiffres), météo, étalonnage, grain
// API conservée : creerRendu(canvas, niveau) → { cam, resize, dessiner(S), ecranVersMonde, mondeVersEcran, suivre,
//   recaler, setZoom, zoom, taille, viderCache, fermer, effets }
import { TS, TF, CHUNK, canvas, rng, graine, cercle, ellipse, rr, clamp, angDiff } from './outils.js';
import { peindreSol } from './sols.js';
import { peindreMurs, FACE, viderMotifsMur } from './murs.js';
import { dessinerObjet, spriteHaut, chargerObjetsPhoto, surObjetsPrets, viderSprites } from './objets.js';
import { dessinerHumain, dessinerMort, dessinerCadavre } from './personnages.js';
import { creerLumiere, ambiance, SUB } from './lumiere.js';
import { creerEffets } from './effets.js';
import { creerAtmosphere } from './atmosphere.js';
import { textureToit, chargerSolsPhoto, surSolsPrets } from './textures.js';
import { K, FIN, icase } from '../carte/catalogue.js';
import { CONSTRUCTIONS, tailleConstruction, RECOLTES } from '../data/construction.js';
import { ZOMBIES } from '../data/zombies.js';

const MAX_BLOCS = 40;

export function creerRendu(cv, niveau) {
  const ctx = cv.getContext('2d', { alpha: false });
  let W = 0, H = 0, dpr = 1;
  const cam = { x: 0, y: 0, zoom: 1, pxc: 40, init: false };
  const blocs = new Map();
  const lumiere = creerLumiere();
  const effets = creerEffets();
  const atmo = creerAtmosphere();
  let grain = null, vignette = null, premier = false;
  const anim = new Map();          // uid → { x, y, ph }
  const portesA = new Map();       // cle → { o (0..1), t }
  const cadavresVus = new Map();   // uid → t de première apparition (null = déjà là)
  let cadavresInit = false;
  const toitsCache = new Map();    // E.id:k → sprite
  const toitsA = new Map();        // E.id:k → alpha courant
  let sangTraite = 0;
  const rConstr = new Map();       // uid → objet de rendu d'une construction (graine stable)
  // sols photoréalistes : dès qu'ils arrivent, les blocs pré-rendus sont refaits
  const offSols = surSolsPrets(() => { viderMotifsMur(); blocs.clear(); toitsCache.clear(); });
  chargerSolsPhoto();
  // meubles et objets photoréalistes (Blender) : même principe
  const offObjets = surObjetsPrets(() => { blocs.clear(); viderSprites(); });
  chargerObjetsPhoto();

  function resize() {
    const r = cv.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    vignette = null;
    majEchelle();
  }
  // ≈ 27 cases de large : on voit plus loin, tout est plus petit (le cran de zoom le plus serré retrouve l’ancienne échelle)
  function majEchelle() { const base = Math.max(20, Math.min(W / 27, H / 15.5)); cam.pxc = base * cam.zoom; }
  function setZoom(z) { cam.zoom = Math.max(0.55, Math.min(2.5, z)); majEchelle(); }

  // ---------- Blocs pré-rendus ----------
  function bloc(E, bx, by, forcer) {
    const k = E.idx * 100000 + by * 1000 + bx;
    let b = blocs.get(k);
    if (b) { blocs.delete(k); blocs.set(k, b); return b; } // LRU : on remet en fin
    if (!forcer) return null;
    b = rendreBloc(E, bx, by);
    blocs.set(k, b);
    if (blocs.size > MAX_BLOCS) { const premierCle = blocs.keys().next().value; blocs.delete(premierCle); }
    return b;
  }
  function rendreBloc(E, bx, by) {
    const S = CHUNK * TS;
    const b = canvas(S, S), c = b.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, S, S);
    // le bloc couvre CHUNK unités = CHUNK × FIN petites cases
    const CF = CHUNK * FIN;
    const x0 = bx * CF, y0 = by * CF, x1 = Math.min(E.w - 1, x0 + CF - 1), y1 = Math.min(E.h - 1, y0 + CF - 1);
    const ux0 = bx * CHUNK, uy0 = by * CHUNK, ux1 = ux0 + CHUNK, uy1 = uy0 + CHUNK;
    c.save(); c.translate(-ux0 * TS, -uy0 * TS);
    peindreSol(c, niveau, E, x0, y0, x1, y1);
    const dans = (R) => R.x + R.w >= ux0 - 1 && R.x <= ux1 + 1 && R.y + R.h >= uy0 - 1 && R.y <= uy1 + 2;
    const objets = (E.rendu ? E.rendu.objets : []).filter(R => !R.retire && dans(R));
    // un arbre abattu laisse sa souche
    for (const R of (E.rendu ? E.rendu.objets : [])) if (R.retire && dans(R) && RECOLTES[R.type] && RECOLTES[R.type].souche) dessinerObjet(c, { ...R, type: 'souche', E_w: E.w });
    // décor plat (tapis, corps, débris, housses) sous les murs
    const plat = (R) => R.d && R.d.decor && !R.d.mural;
    for (const R of objets) if (plat(R)) { R.E_w = E.w; dessinerObjet(c, R); }
    peindreMurs(c, niveau, E, x0, y0, x1, y1);
    objets.filter(R => !plat(R)).sort((a, b2) => (a.y + a.h) - (b2.y + b2.h)).forEach(R => { R.E_w = E.w; dessinerObjet(c, R); });
    c.restore();
    return b;
  }

  // ---------- Caméra ----------
  let sx0 = 0, sy0 = 0;
  const ecranX = (x) => (x - cam.x) * cam.pxc + W / 2 + sx0;
  const ecranY = (y) => (y - cam.y) * cam.pxc + H / 2 + sy0;
  function ecranVersMonde(sx, sy) { const r = cv.getBoundingClientRect(); return { x: (sx - r.left - W / 2) / cam.pxc + cam.x, y: (sy - r.top - H / 2) / cam.pxc + cam.y }; }
  function mondeVersEcran(x, y) { return { x: ecranX(x), y: ecranY(y) }; }
  function suivre(x, y, dt, ax = 0, ay = 0) {
    const tx = x + ax, ty = y + ay;
    if (!cam.init) { cam.x = tx; cam.y = ty; cam.init = true; return; }
    const k = 1 - Math.exp(-dt / 180);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  }
  function recaler() { cam.init = false; premier = false; cadavresInit = false; }

  // Phase de marche : avance avec la distance parcourue (les jambes ne patinent pas).
  function phase(id, x, y, f = 2.4) {
    let a = anim.get(id);
    if (!a) { a = { x, y, ph: (graine(String(id)) % 628) / 100 }; anim.set(id, a); }
    const d = Math.hypot(x - a.x, y - a.y);
    if (d < 1.5) a.ph += d * f * Math.PI;
    a.x = x; a.y = y;
    return a.ph;
  }

  // ---------- Image ----------
  const tmpListe = [];
  function dessiner(S) {
    if (!W) resize();
    const t0 = performance.now();
    const E = S.E, C = S.C, pxc = cam.pxc, t = S.t;
    const sec = (S.joueur.cbt && S.joueur.cbt.secousse) || 0;
    sx0 = sec ? (Math.random() - 0.5) * 10 * sec : 0; sy0 = sec ? (Math.random() - 0.5) * 10 * sec : 0;
    const dt = Math.min(50, S.dt || 16);
    effets.maj(S.hitstop > 0 ? dt * 0.1 : dt);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    const vx0 = cam.x - W / 2 / pxc, vy0 = cam.y - H / 2 / pxc, vx1 = cam.x + W / 2 / pxc, vy1 = cam.y + H / 2 / pxc;
    // 1) blocs
    const bx0 = Math.max(0, Math.floor(vx0 / CHUNK)), by0 = Math.max(0, Math.floor(vy0 / CHUNK));
    const nbx = Math.ceil(E.w / FIN / CHUNK), nby = Math.ceil(E.h / FIN / CHUNK);
    const bx1 = Math.min(nbx - 1, Math.floor(vx1 / CHUNK)), by1 = Math.min(nby - 1, Math.floor(vy1 / CHUNK));
    let neufs = 0;
    for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) {
      let b = bloc(E, bx, by, false);
      if (!b && (neufs < 1 || !premier)) { b = bloc(E, bx, by, true); neufs++; }
      if (!b) continue;
      const s = CHUNK * pxc;
      ctx.drawImage(b, Math.floor(ecranX(bx * CHUNK)), Math.floor(ecranY(by * CHUNK)), Math.ceil(s) + 1, Math.ceil(s) + 1);
    }
    premier = true;
    // 1 bis) ombres du soleil (dehors, selon l'heure et le ciel) — sous les corps et les objets posés
    atmo.ombresSoleil(ctx, S, niveau, E, W, H, ecranX, ecranY, pxc, [vx0, vy0, vx1, vy1], dpr);
    // 2) monde dynamique en px monde
    const k = pxc / TS;
    ctx.save();
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (W / 2 + sx0 - cam.x * pxc), dpr * (H / 2 + sy0 - cam.y * pxc));
    const visCase = (x, y) => { const i = icase(E, x, y); if (i < 0) return 0; return C.los[i] === C.stamp ? C.vis[i] : 0; };
    const vuCase = (x, y) => { const i = icase(E, x, y); if (i < 0) return 0; return C.vu[i]; };
    // sang des combats (liste de l'ancien combat_vue) → calque persistant
    if (S.sang && S.sang.length) {
      if (sangTraite > S.sang.length) sangTraite = 0;
      for (let q = sangTraite; q < S.sang.length; q++) { const g = S.sang[q]; const Eg = niveau.etages[niveau.etageIdx[g.etage]]; if (Eg) effets.tache(Eg, g.x, g.y, g.r * 0.8, g.a); }
      sangTraite = S.sang.length;
    }
    effets.dessinerCalqueSang(ctx, E);
    // cadavres (chute + flaque qui s'étend)
    if (!cadavresInit) { for (const cd of S.cadavres) cadavresVus.set(cd.uid, null); cadavresInit = true; }
    for (const cd of S.cadavres) {
      if (cd.etage !== E.id || !vuCase(cd.x, cd.y)) continue;
      if (!cadavresVus.has(cd.uid)) cadavresVus.set(cd.uid, t);
      const t0 = cadavresVus.get(cd.uid);
      dessinerCadavre(ctx, cd, t, t0 == null ? null : t - t0, ZOMBIES[cd.type]);
    }
    // objets au sol
    for (const o of S.sol) { if (o.etage !== E.id || !vuCase(o.x, o.y)) continue; objetSol(ctx, o, t); }
    // portes animées
    for (const p of niveau.portes) {
      if (p.etage !== E.id || p.x < vx0 - 1 || p.x > vx1 + 1 || p.y < vy0 - 1 || p.y > vy1 + 1) continue;
      const s = S.portes[p.cle]; if (!s) continue;
      dessinerPorte(ctx, E, p, s, t, dt);
    }
    // constructions (murs, caisses, feux, potager…) et fantôme du placement
    for (const c of S.constructions || []) {
      if (c.etage !== E.id) continue;
      const d = CONSTRUCTIONS[c.type]; if (!d || d.toit) continue; // les toits : plus tard, au-dessus des personnages
      const [w, h] = tailleConstruction(c.type, c.rot);
      if (c.x + w < vx0 - 1 || c.x > vx1 + 1 || c.y + h < vy0 - 1 || c.y > vy1 + 1) continue;
      if (!vuCase(c.x + w / 2, c.y + h / 2)) continue;
      const R = rConstr.get(c.uid) || { variante: graine(String(c.uid)) % 1000 };
      Object.assign(R, { type: d.dessin, x: c.x, y: c.y, w, h, rot: 0, c, d, minutes: S.minutes });
      rConstr.set(c.uid, R);
      dessinerObjet(ctx, R);
    }
    if (S.placement && S.placement.etage === E.id) {
      // fantôme vert clair (rouge si impossible) ; pendant le chantier, il se remplit à mesure que l'on bâtit
      const P = S.placement, ch = P.chantier;
      const x0 = P.x * TS, y0 = P.y * TS, w = P.w * TS, h = P.h * TS;
      ctx.fillStyle = P.ok ? 'rgba(170,255,170,0.16)' : 'rgba(240,80,70,0.16)'; ctx.fillRect(x0, y0, w, h);
      if (ch != null) {
        ctx.globalAlpha = 0.3; dessinerObjet(ctx, { type: P.dessin, x: P.x, y: P.y, w: P.w, h: P.h, rot: 0, variante: 1 });
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 + h * (1 - ch), w, h * ch + 1); ctx.clip();
        ctx.globalAlpha = 0.92; dessinerObjet(ctx, { type: P.dessin, x: P.x, y: P.y, w: P.w, h: P.h, rot: 0, variante: 1 }); ctx.restore();
      } else { ctx.globalAlpha = 0.55; dessinerObjet(ctx, { type: P.dessin, x: P.x, y: P.y, w: P.w, h: P.h, rot: 0, variante: 1 }); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = P.ok ? 'rgba(175,255,175,0.95)' : 'rgba(240,80,70,0.95)'; ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t / 60; ctx.strokeRect(x0 + 1.5, y0 + 1.5, w - 3, h - 3); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    // arcs d'attaque des morts (au sol, sous les corps)
    for (const z of S.zombies) {
      if (z.etage !== E.id || !z.atk || !z._vu) continue;
      arcAttaque(ctx, z, t);
    }
    // personnages, triés par y
    tmpListe.length = 0;
    for (const n of S.pnj) if (n.etage === E.id && visCase(n.x, n.y) >= 0.2) tmpListe.push({ y: n.y, f: () => dessinerHumain(ctx, n.x * TS, n.y * TS, n.dir ?? Math.PI / 2, n.style ? (n._st || (n._st = { ...STYLE_PNJ, ...n.style })) : STYLE_PNJ, { t, marche: 0, phase: 0 }) });
    for (const z of S.zombies) {
      if (z.etage !== E.id) continue;
      const v = visCase(z.x, z.y);
      z._vu = v > 0.3 && (z.type !== 'rampant' || Math.hypot(z.x - S.joueur.x, z.y - S.joueur.y) <= 3 || z._eclaire);
      if (!z._vu) continue;
      z._phase = phase(z.uid, z.x, z.y, z.type === 'coureur' ? 1.8 : 1.4);
      tmpListe.push({ y: z.y, f: () => dessinerMort(ctx, z.x * TS, z.y * TS, z, t, ZOMBIES[z.type]) });
    }
    for (const p of S.pairs) {
      if (p.etage !== E.id) continue;
      const v = visCase(p.x, p.y);
      const ph = phase('pair:' + p.id, p.x, p.y);
      const st = { ...(p.lampe ? STYLE_PAIR_L : STYLE_PAIR), contour: 'rgba(110,200,255,0.9)', sac: p.sac === undefined ? true : p.sac };
      tmpListe.push({ y: p.y, f: () => dessinerHumain(ctx, p.x * TS, p.y * TS, p.dir, st, { t, marche: p.marche ?? (p.allure && p.allure !== 'immobile' ? 1 : 0), phase: ph, allure: p.allure, arme: p.arme, lampe: p.lampe, geste: p.geste, empoigne: p.empoigne, fantome: v < 0.15, aTerre: p.aTerre, agonie: p.agonie }) });
    }
    const J = S.joueur;
    const phJ = phase('moi', J.x, J.y);
    const styleJ = S.styleJoueur || (J.lampe ? STYLE_JOUEUR_L : STYLE_JOUEUR);
    tmpListe.push({ y: J.y, f: () => dessinerHumain(ctx, J.x * TS, J.y * TS, J.dir, styleJ, {
      t, marche: J.marche, phase: phJ, allure: J.allure, arme: J.equip && (J.equip.deux || J.equip.droite), lampe: J.lampe && J.lampeMain,
      frontale: J.lampe && !J.lampeMain, geste: J.cbt && J.cbt.geste, charge: J.cbt ? Math.max(0, J.cbt.charge) : 0, vise: J.cbt && J.cbt.vise,
      empoigne: J.cbt && J.cbt.empoigne, flash: J.cbt ? J.cbt.flash : 0, agonie: J.agonie,
    }) });
    tmpListe.sort((a, b) => a.y - b.y);
    for (const e of tmpListe) e.f();
    // feux, particules, traînées, éclats de l'ancien combat
    const srcVis = lumiere.visibles();
    effets.flammes(ctx, srcVis, t, E.id, visCase, dt);
    effets.dessiner(ctx, t, E.id, visCase);
    atmo.poussieres(ctx, S, t);
    for (const f of S.fx || []) {
      if (f.type !== 'eclat') continue;
      const q = f.age / f.duree, d = Math.min(1, f.age / 260);
      ctx.fillStyle = `rgba(150,14,20,${0.9 * (1 - q)})`;
      cercle(ctx, (f.x + f.vx * d * 0.6) * TS, (f.y + f.vy * d * 0.6) * TS, f.r); ctx.fill();
    }
    // 4) houppiers / lampadaires : au-dessus des personnages
    const objs = E.rendu ? E.rendu.objets : [];
    const vent = S.vent || 0.3;
    for (const R of objs) {
      if (!R.haut || R.retire) continue;
      const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
      const sp = spriteHaut(R);
      const rc = sp.rayon / TS;
      if (cx + rc < vx0 || cx - rc > vx1 || cy + rc < vy0 - 1 || cy - rc > vy1) continue;
      if (!vuCase(cx, cy) && visCase(cx, cy) <= 0) continue;
      const dj = Math.hypot(J.x - cx, J.y - cy);
      let a = R.haut === 'lampadaire' ? 1 : dj < rc * 0.95 ? 0.32 : 0.92;
      for (const z of S.zombies) if (z._vu && z.etage === E.id && Math.hypot(z.x - cx, z.y - cy) < rc * 0.8) { a = Math.min(a, 0.55); break; }
      const ox = R.haut === 'lampadaire' ? 0 : Math.sin(t / 1300 + R.variante) * 2.5 * vent, oy = R.haut === 'lampadaire' ? 0 : Math.cos(t / 1700 + R.variante) * 1.5 * vent;
      ctx.globalAlpha = a;
      ctx.drawImage(sp.cv, cx * TS - sp.S / 2 + ox, cy * TS - sp.S / 2 + oy - (R.haut === 'lampadaire' ? 0 : 6));
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // 5) obscurité (une valeur par petite case, agrandie avec lissage)
    const rx0 = Math.floor(vx0 * FIN) - 2, ry0 = Math.floor(vy0 * FIN) - 2;
    const cols = Math.ceil(vx1 * FIN) - rx0 + 3, rows = Math.ceil(vy1 * FIN) - ry0 + 3;
    const amb = ambiance(S.heure ?? 12);
    S.amb = amb;
    lumiere.masquer(ctx, S, rx0, ry0, cols, rows, (m, mw, mh) => { ctx.imageSmoothingEnabled = true; ctx.drawImage(m, 0, 0, mw, mh, ecranX(rx0 / FIN), ecranY(ry0 / FIN), cols * pxc / FIN, rows * pxc / FIN); });
    lumiere.halos(ctx, S, ecranX, ecranY, pxc);
    // lueur chaude des lampes (soft-light : le noir reste noir)
    for (let q = 0; q < S.nLampes; q++) {
      const L = S.lampes[q];
      const gx = ecranX(L.x), gy = ecranY(L.y), R = (L.portee + 1) * pxc;
      const g = ctx.createRadialGradient(gx, gy, pxc * 0.3, gx, gy, R);
      g.addColorStop(0, 'rgba(255,205,130,0.5)'); g.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g;
      ctx.beginPath();
      if (L.forme === 'halo') ctx.arc(gx, gy, R, 0, 7);
      else { const dm = (L.angle || 60) * Math.PI / 360 + 0.15; ctx.moveTo(gx, gy); ctx.arc(gx, gy, R, L.dir - dm, L.dir + dm); ctx.closePath(); }
      ctx.fill(); ctx.restore();
    }
    // 6) toits, puis le ciel : ombres des nuages, brume
    dessinerToits(S, E, C, pxc, vx0, vy0, vx1, vy1, dt);
    // toits construits : comme ceux des bâtiments, par-dessus l'obscurité (vus de dehors) — repasse en px monde
    ctx.save(); ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (W / 2 + sx0 - cam.x * pxc), dpr * (H / 2 + sy0 - cam.y * pxc));
    toitsConstruits(S, E, S.joueur, vx0, vy0, vx1, vy1, dt, vuCase);
    ctx.restore();
    atmo.nuages(ctx, S, W, H, ecranX, ecranY, pxc, t, dpr);
    atmo.brume(ctx, S, W, H, ecranX, ecranY, pxc, t, dpr);
    atmo.mouille(ctx, S, W, H);
    // repères lisibles
    reperes(S, E, C, pxc, t);
    // météo, étalonnage, grain, vignette
    meteo(S, E, t, dt);
    if (!grain) preparerGrain();
    if (!vignette) preparerVignette();
    etalonnage(amb, S);
    ctx.drawImage(vignette, 0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-((t * 0.37) % 160) | 0, -((t * 0.61) % 160) | 0);
    ctx.fillStyle = grain; ctx.fillRect(0, 0, W + 160, H + 160);
    ctx.restore();
    // pré-rendu des blocs restants quand il reste du temps
    if (performance.now() - t0 < 6) {
      for (let by = 0; by < Math.ceil(E.h / FIN / CHUNK); by++) for (let bx = 0; bx < Math.ceil(E.w / FIN / CHUNK); bx++) {
        const kk = E.idx * 100000 + by * 1000 + bx;
        if (!blocs.has(kk) && blocs.size < MAX_BLOCS) { bloc(E, bx, by, true); return; }
      }
    }
  }

  // ---------- Portes ----------
  function dessinerPorte(c, E, p, s, t, dt) {
    let a = portesA.get(p.cle);
    const cible = s.etat === 'ouverte' ? 1 : 0;
    if (!a) { a = { o: cible }; portesA.set(p.cle, a); }
    a.o += (cible - a.o) * (1 - Math.exp(-dt / 70));
    // une unité de large, une petite case d'épaisseur : (x, y) = coin d'une boîte TS × TS centrée sur la porte
    const x = (p.x + 0.5) * TS - TS / 2, y = (p.y + 0.5) * TS - TS / 2, h = p.orient === 'h';
    const metal = p.style === 'metal' || (p.exterieure && p.style !== 'bois' && /grille/.test(p.nom || ''));
    const grille = p.style === 'grille' || /grille/.test(p.nom || '');
    if (s.etat === 'cassee') {
      c.fillStyle = 'rgba(60,40,24,0.9)';
      c.save(); c.translate(x + TS / 2, y + TS / 2); c.rotate(h ? 0.5 : 1.9);
      rr(c, -TS * 0.42, -3, TS * 0.84, 6, 1); c.fill(); c.restore();
      c.fillStyle = '#4a3220'; for (let k = 0; k < 6; k++) { const r = rng(p.x * 31 + p.y * 7 + k); c.fillRect(x + r() * TS, y + r() * TS, 4, 1.5); }
      return;
    }
    // charnière à gauche (porte horizontale) / en haut (verticale) ; s'ouvre vers +y / +x
    const L = TS * 0.86, e = grille ? 2.6 : 4.2;
    const ang = (h ? 0 : Math.PI / 2) + a.o * (Math.PI / 2) * (h ? 1 : -1);
    const hx = h ? x + TS * 0.07 : x + TS / 2, hy = h ? y + TS / 2 : y + TS * 0.07;
    c.save(); c.translate(hx, hy); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,0.45)'; rr(c, 2, -e / 2 + 2.5, L, e, 1.5); c.fill();
    if (grille) {
      c.strokeStyle = '#151515'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(L, 0); c.stroke();
      c.fillStyle = '#222'; for (let k = 1; k < 6; k++) { cercle(c, k * L / 6, 0, 2); c.fill(); }
    } else {
      const coul = metal ? '#4a4e52' : s.barricadee ? '#3a2a1a' : '#5a3e26';
      c.fillStyle = coul; rr(c, 0, -e / 2, L, e, 1.5); c.fill();
      c.fillStyle = 'rgba(255,230,190,0.14)'; c.fillRect(1, -e / 2 + 0.8, L - 2, 1.2);
      c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1; rr(c, 0, -e / 2, L, e, 1.5); c.stroke();
      c.fillStyle = '#c8b070'; cercle(c, L - 6, e / 2 + 1, 1.6); c.fill(); // poignée
    }
    c.restore();
    if (s.barricadee) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 4; c.lineCap = 'butt'; c.beginPath(); if (h) { c.moveTo(x + 2, y + TS * 0.25); c.lineTo(x + TS - 2, y + TS * 0.75); c.moveTo(x + 2, y + TS * 0.75); c.lineTo(x + TS - 2, y + TS * 0.25); } else { c.moveTo(x + TS * 0.25, y + 2); c.lineTo(x + TS * 0.75, y + TS - 2); c.moveTo(x + TS * 0.75, y + 2); c.lineTo(x + TS * 0.25, y + TS - 2); } c.stroke(); }
    if (s.etat === 'verrouillee' && a.o < 0.05) { const cx = x + TS / 2, cy = y + TS / 2; c.fillStyle = '#b08a3a'; rr(c, cx - 3.5, cy - 1, 7, 6, 1); c.fill(); c.strokeStyle = '#b08a3a'; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy - 1, 2.5, Math.PI, 0); c.stroke(); }
    // dégâts (PV de porte entamés) : fissures
    if (s.pvMax && s.pv < s.pvMax * 0.7 && a.o < 0.05) { c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1; const r = rng(p.x * 13 + p.y); c.beginPath(); c.moveTo(x + TS * 0.3, y + TS * 0.5); c.lineTo(x + TS * (0.4 + r() * 0.2), y + TS * (0.42 + r() * 0.16)); c.lineTo(x + TS * 0.7, y + TS * 0.5); c.stroke(); }
  }

  function objetSol(c, o, t) {
    const x = o.x * TS, y = o.y * TS;
    const pulse = 0.5 + 0.5 * Math.sin(t / 380 + o.uid);
    c.fillStyle = 'rgba(0,0,0,0.4)'; ellipse(c, x + 1.5, y + 2, 7, 5); c.fill();
    if (o.doc) { c.save(); c.translate(x, y); c.rotate(((o.uid * 37) % 10) / 10 - 0.5); c.fillStyle = '#d8d0b8'; c.fillRect(-6, -4.5, 12, 9); c.fillStyle = 'rgba(0,0,0,0.3)'; for (let k = 0; k < 3; k++) c.fillRect(-4.5, -2.5 + k * 2.4, 9 - k * 2, 0.9); c.restore(); }
    else { c.fillStyle = '#7a6a4a'; rr(c, x - 6, y - 5, 12, 10, 2.5); c.fill(); c.fillStyle = 'rgba(255,240,200,0.15)'; c.fillRect(x - 5, y - 4, 10, 1.6); }
    c.strokeStyle = `rgba(201,162,39,${0.35 + 0.4 * pulse})`; c.lineWidth = 1.4; cercle(c, x, y, 10 + pulse * 2); c.stroke();
  }

  function arcAttaque(c, z, t) {
    const at = z.atk, p = at.p || 0;
    const saisie = at.type === 'saisie';
    const R = ((ZOMBIES[z.type] || {}).portee || 0.95) * TS + 6;
    const demi = (saisie ? 50 : 60) * Math.PI / 180;
    const col = saisie ? [230, 170, 50] : [220, 50, 50];
    c.save(); c.translate(z.x * TS, z.y * TS); c.rotate(z.dir || 0);
    c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.1 + 0.32 * p})`;
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * (0.35 + 0.65 * p), -demi, demi); c.closePath(); c.fill();
    c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.55 + 0.4 * p})`; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, R, -demi, demi); c.stroke();
    if (p > 0.8) { c.lineWidth = 3.5; c.strokeStyle = `rgba(255,${saisie ? 210 : 90},${saisie ? 90 : 80},${(Math.sin(t / 30) + 1) / 2})`; c.beginPath(); c.arc(0, 0, R, -demi, demi); c.stroke(); }
    c.restore();
  }

  // ---------- Toits ----------
  function spriteToit(E, k, T) {
    const cle = E.id + ':' + k;
    let s = toitsCache.get(cle);
    if (s) return s;
    const pid = T.piece;
    const dansPiece = (i) => pid >= 0 && E.piece[i] === pid;
    // rectangle du toit (unités) → petites cases
    const x0 = Math.max(0, Math.round(T.x * FIN)), y0 = Math.max(0, Math.round(T.y * FIN));
    const x1 = Math.min(E.w - 1, Math.round((T.x + T.w) * FIN) - 1), y1 = Math.min(E.h - 1, Math.round((T.y + T.h) * FIN) - 1);
    const masque = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * E.w + x;
      if (dansPiece(i)) { masque.push([x, y]); continue; }
      if (E.code[i] !== K.MUR && E.code[i] !== K.FENETRE) continue;
      // mur du pourtour : tous ses voisins non-murs sont la pièce ou l'extérieur
      let touche = false, ok = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= E.w || ny >= E.h) continue;
        const j = ny * E.w + nx, pj = E.piece[j];
        if (pj < 0) continue;
        if (pj === pid) touche = true;
        else if (!niveau.pieces[pj].exterieur) ok = false;
      }
      if (touche && ok) masque.push([x, y]);
    }
    if (!masque.length) { toitsCache.set(cle, null); return null; }
    const Wp = (x1 - x0 + 1) * TF, Hp = (y1 - y0 + 1) * TF;
    const cvs = canvas(Wp, Hp), c = cvs.getContext('2d');
    c.save();
    c.beginPath(); for (const [x, y] of masque) c.rect((x - x0) * TF - 0.5, (y - y0) * TF - 0.5, TF + 1, TF + 1);
    c.clip();
    c.fillStyle = c.createPattern(textureToit(T.type || 'tuiles'), 'repeat'); c.fillRect(0, 0, Wp, Hp);
    // deux pans : faîtage le long du grand côté, pan du bas plus sombre
    const horiz = Wp >= Hp;
    const g = horiz ? c.createLinearGradient(0, 0, 0, Hp) : c.createLinearGradient(0, 0, Wp, 0);
    if (T.type === 'terrasse') { g.addColorStop(0, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(0,0,0,0.18)'); }
    else { g.addColorStop(0, 'rgba(255,230,200,0.12)'); g.addColorStop(0.49, 'rgba(255,230,200,0.02)'); g.addColorStop(0.51, 'rgba(0,0,0,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0.42)'); }
    c.fillStyle = g; c.fillRect(0, 0, Wp, Hp);
    if (T.type !== 'terrasse' && T.type !== 'verriere') {
      c.fillStyle = 'rgba(40,20,12,0.85)';
      if (horiz) c.fillRect(0, Hp / 2 - 2, Wp, 4); else c.fillRect(Wp / 2 - 2, 0, 4, Hp);
      c.fillStyle = 'rgba(255,220,190,0.15)'; if (horiz) c.fillRect(0, Hp / 2 - 2, Wp, 1); else c.fillRect(Wp / 2 - 2, 0, 1, Hp);
    }
    const r = rng(graine(cle));
    if (r() < 0.6 && T.type !== 'verriere') { const cx = TF * (1.2 + r() * Math.max(0, (x1 - x0) - 2.4)), cy = TF * (1.2 + r() * Math.max(0, (y1 - y0) - 2.4)); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(cx + 3, cy + 4, TS * 0.4, TS * 0.4); c.fillStyle = '#6a5a4a'; c.fillRect(cx, cy, TS * 0.4, TS * 0.4); c.fillStyle = '#1a1410'; c.fillRect(cx + 4, cy + 4, TS * 0.4 - 8, TS * 0.4 - 8); }
    if (T.type === 'terrasse' && r() < 0.7) { const cx = TF * (1 + r() * Math.max(0, (x1 - x0) - 3)), cy = TF * (1 + r() * Math.max(0, (y1 - y0) - 3)); c.fillStyle = '#8a8a86'; rr(c, cx, cy, TS * 0.8, TS * 0.6, 3); c.fill(); c.strokeStyle = '#4a4a48'; c.beginPath(); c.arc(cx + TS * 0.4, cy + TS * 0.3, TS * 0.2, 0, 7); c.stroke(); }
    c.restore();
    // bord du toit (génoise) : arête sombre tout autour
    c.strokeStyle = 'rgba(10,6,4,0.8)'; c.lineWidth = 2;
    const dansMasque = new Set(masque.map(([a, b]) => a + ',' + b));
    for (const [x, y] of masque) {
      const bords = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of bords) {
        if (dansMasque.has((x + dx) + ',' + (y + dy))) continue;
        const px = (x - x0) * TF, py = (y - y0) * TF;
        c.beginPath();
        if (dy === -1) { c.moveTo(px, py + 1); c.lineTo(px + TF, py + 1); } else if (dy === 1) { c.moveTo(px, py + TF - 1); c.lineTo(px + TF, py + TF - 1); }
        else if (dx === -1) { c.moveTo(px + 1, py); c.lineTo(px + 1, py + TF); } else { c.moveTo(px + TF - 1, py); c.lineTo(px + TF - 1, py + TF); }
        c.stroke();
      }
    }
    s = { cv: cvs, x0, y0, masque, pid };
    toitsCache.set(cle, s);
    return s;
  }
  // Toits construits : au-dessus de tout ; quand on est dessous (ou sous un toit qui le touche), ils s'effacent.
  function toitsConstruits(S, E, J, vx0, vy0, vx1, vy1, dt, vuCase) {
    const L = [];
    for (const c of S.constructions || []) {
      if (c.etage !== E.id) continue;
      const d = CONSTRUCTIONS[c.type]; if (!d || !d.toit) continue;
      const [w, h] = tailleConstruction(c.type, c.rot); L.push({ c, d, w, h });
    }
    if (!L.length) return;
    // les toits qui se touchent forment un même abri : sous l'un, on voit sous tous
    const touche = (a, b) => a.c.x <= b.c.x + b.w && b.c.x <= a.c.x + a.w && a.c.y <= b.c.y + b.h && b.c.y <= a.c.y + a.h;
    const dessous = new Set(L.filter(o => J.x >= o.c.x && J.x <= o.c.x + o.w && J.y >= o.c.y && J.y <= o.c.y + o.h));
    for (let k = 0; k < L.length; k++) for (const o of L) if (!dessous.has(o) && [...dessous].some(q => touche(q, o))) dessous.add(o);
    for (const o of L) {
      const { c, d, w, h } = o;
      if (c.x + w < vx0 - 1 || c.x > vx1 + 1 || c.y + h < vy0 - 1 || c.y > vy1 + 1) continue;
      if (!vuCase(c.x + w / 2, c.y + h / 2) && !vuCase(c.x + 0.2, c.y + 0.2) && !vuCase(c.x + w - 0.2, c.y + h - 0.2)) continue; // jamais vu : rien
      const cible = dessous.has(o) ? 0.1 : 0.94;
      let a = toitsA.get('c:' + c.uid); if (a == null) a = cible;
      a += (cible - a) * (1 - Math.exp(-dt / 160)); toitsA.set('c:' + c.uid, a);
      const R = rConstr.get(c.uid) || { variante: graine(String(c.uid)) % 1000 };
      Object.assign(R, { type: d.dessin, x: c.x, y: c.y, w, h, rot: 0, c, d, minutes: S.minutes });
      rConstr.set(c.uid, R);
      ctx.globalAlpha = a; dessinerObjet(ctx, R);
      // éclairage du ciel : la nuit, le toit est sombre (comme ceux des bâtiments)
      const lum = 0.16 + 0.84 * (S.jour ?? 1);
      ctx.fillStyle = `rgba(0,0,${S.jour < 0.5 ? 8 : 0},${1 - lum})`; ctx.fillRect(c.x * TS, c.y * TS, w * TS, h * TS);
      ctx.globalAlpha = 1;
    }
  }
  function dessinerToits(S, E, C, pxc, vx0, vy0, vx1, vy1, dt) {
    const T = E.rendu ? E.rendu.toits : [];
    if (!T.length) return;
    const ij = icase(E, S.joueur.x, S.joueur.y), ici = ij >= 0 ? E.piece[ij] : -1;
    const lum = 0.16 + 0.84 * (S.jour ?? 1);
    for (let k = 0; k < T.length; k++) {
      const tt = T[k];
      if (tt.x > vx1 + 1 || tt.y > vy1 + 1 || tt.x + tt.w < vx0 - 1 || tt.y + tt.h < vy0 - 1) continue;
      const sp = spriteToit(E, k, tt); if (!sp) continue;
      // visible si un bout de son pourtour est vu (ou en mémoire)
      let enVue = false, enMemoire = false;
      for (const [x, y] of sp.masque) { const i = y * E.w + x; if (E.piece[i] === sp.pid) continue; if (C.los[i] === C.stamp && C.vis[i] > 0.05) { enVue = true; break; } if (C.vu[i]) enMemoire = true; }
      const dedans = ici === sp.pid;
      const cle = E.id + ':' + k;
      const cible = dedans ? 0 : enVue ? 1 : enMemoire ? 0.75 : 0;
      let a = toitsA.get(cle); if (a == null) a = cible;
      a += (cible - a) * (1 - Math.exp(-dt / 160)); toitsA.set(cle, a);
      if (a < 0.02) continue;
      const X = ecranX(sp.x0 / FIN), Y = ecranY(sp.y0 / FIN), Wd = sp.cv.width / TS * pxc, Hd = sp.cv.height / TS * pxc;
      ctx.globalAlpha = a;
      ctx.drawImage(sp.cv, X, Y, Wd, Hd);
      // éclairage du ciel (nuit : toit sombre) + liseré lunaire
      ctx.fillStyle = `rgba(0,0,${S.jour < 0.5 ? 8 : 0},${(1 - lum) * (enVue ? 1 : 1.05)})`;
      ctx.save(); ctx.beginPath(); for (const [x, y] of sp.masque) ctx.rect(ecranX(x / FIN) - 0.5, ecranY(y / FIN) - 0.5, pxc / FIN + 1, pxc / FIN + 1); ctx.clip(); ctx.fillRect(X, Y, Wd, Hd); ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // ---------- Repères lisibles ----------
  function reperes(S, E, C, pxc, t) {
    // cible d'interaction : coins en équerre, plus lisibles qu'un cadre pointillé
    if (S.cible && S.cible.etage === E.id) {
      const c = S.cible, x0 = ecranX(c.x0), y0 = ecranY(c.y0), x1 = ecranX(c.x1), y1 = ecranY(c.y1);
      const L = Math.min(10, (x1 - x0) / 3), p = 0.6 + 0.4 * Math.sin(t / 260);
      ctx.strokeStyle = `rgba(232,196,90,${0.7 + 0.3 * p})`; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
      ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
      ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
      ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
      ctx.stroke();
    }
    // PV des morts entamés
    for (const z of S.zombies) {
      if (!z._vu || z.etage !== E.id || !z.hpMax || z.hp >= z.hpMax) continue;
      const bx = ecranX(z.x) - pxc * 0.4, by = ecranY(z.y) - pxc * 0.66, bw = pxc * 0.8;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
      ctx.fillStyle = '#c23a44'; ctx.fillRect(bx, by, bw * Math.max(0, z.hp / z.hpMax), 3);
    }
    // à terre : « achever »
    for (const z of S.zombies) {
      if (!z._vu || !z.terre || z.etage !== E.id) continue;
      if (Math.hypot(z.x - S.joueur.x, z.y - S.joueur.y) > 2.2) continue;
      etiquette(ecranX(z.x), ecranY(z.y) - pxc * 0.8, 'Achever', '#e8c45a');
    }
    // anneaux du joueur : charge, empoignade
    const Jc = S.joueur.cbt;
    if (Jc) {
      const jx = ecranX(S.joueur.x), jy = ecranY(S.joueur.y);
      if (Jc.charge > 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 5; cercle(ctx, jx, jy, pxc * 0.64); ctx.stroke();
        ctx.strokeStyle = Jc.charge >= 0.9 ? 'rgba(255,214,140,0.98)' : 'rgba(230,223,204,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(jx, jy, pxc * 0.64, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Jc.charge); ctx.stroke();
      }
      if (Jc.empoigne) {
        const e = Jc.empoigne;
        ctx.strokeStyle = 'rgba(201,162,39,0.35)'; ctx.lineWidth = 6; cercle(ctx, jx, jy, pxc * 0.9); ctx.stroke();
        ctx.strokeStyle = '#e8b830'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(jx, jy, pxc * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - e.p)); ctx.stroke();
        for (let k = 0; k < e.requis; k++) { const a = -Math.PI / 2 + (k + 0.5) / e.requis * Math.PI * 2; ctx.globalAlpha = k < e.taps ? 1 : 0.25; ctx.fillStyle = '#e8b830'; cercle(ctx, jx + Math.cos(a) * pxc * 1.14, jy + Math.sin(a) * pxc * 1.14, 4); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
    }
    // traçantes, chiffres
    for (const f of S.fx || []) {
      const q = f.age / f.duree;
      if (f.type === 'trait') {
        ctx.strokeStyle = `rgba(255,226,160,${0.85 * (1 - q)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ecranX(f.x), ecranY(f.y)); ctx.lineTo(ecranX(f.x2), ecranY(f.y2)); ctx.stroke();
      } else if (f.type === 'nombre') {
        const x = ecranX(f.x), y = ecranY(f.y) - pxc * 0.6 - q * pxc * 0.9;
        ctx.globalAlpha = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3;
        ctx.font = `${f.cls === 'crit' ? 700 : 600} ${f.cls === 'crit' ? 22 : f.cls === 'info' || f.cls === 'rate' ? 13 : 17}px Oswald, system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(f.txt, x, y);
        ctx.fillStyle = f.cls === 'moi' ? '#ff5a64' : f.cls === 'crit' ? '#ffd27a' : f.cls === 'rate' || f.cls === 'info' ? '#e6dfcc' : f.cls === 'furtif' ? '#c9a227' : '#fff2e0';
        ctx.fillText(f.txt, x, y);
        ctx.globalAlpha = 1;
      }
    }
    // « ? » / « ! »
    for (const z of S.zombies) {
      if (!z._vu || z.etage !== E.id) continue;
      if (z.etat === 'chasse') { if (Math.hypot(z.x - S.joueur.x, z.y - S.joueur.y) > 3) marque(ecranX(z.x), ecranY(z.y) - pxc * 0.8, 1, true); continue; }
      if (z.alerte > 0.02) marque(ecranX(z.x), ecranY(z.y) - pxc * 0.8, z.alerte, false);
    }
    // alarmes de voiture : la lueur des phares (blanc) et des clignotants (orange), quand ils sont allumés
    for (const f of S.alarmes || []) {
      if (!f.on) continue;
      const c = Math.cos(f.dir), s = Math.sin(f.dir);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [av, k] of [[1, -1], [1, 1], [-1, -1], [-1, 1]]) {
        const x = f.x + c * f.hl * av * 0.96 - s * f.hw * 0.75 * k, y = f.y + s * f.hl * av * 0.96 + c * f.hw * 0.75 * k;
        const ip = icase(E, x, y); if (ip < 0 || C.los[ip] !== C.stamp) continue;
        const ex = ecranX(x), ey = ecranY(y), r = pxc * (av > 0 ? 0.75 : 0.6);
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, r);
        if (av > 0) { g.addColorStop(0, 'rgba(255,250,225,0.95)'); g.addColorStop(0.35, 'rgba(255,214,120,0.55)'); g.addColorStop(1, 'rgba(255,170,60,0)'); }
        else { g.addColorStop(0, 'rgba(255,190,70,0.95)'); g.addColorStop(0.4, 'rgba(255,130,20,0.5)'); g.addColorStop(1, 'rgba(255,90,0,0)'); }
        ctx.fillStyle = g; ctx.fillRect(ex - r, ey - r, 2 * r, 2 * r);
      }
      ctx.restore();
    }
    // ondes (ce qu'on entend)
    for (const o of S.ondes) {
      if (o.etage !== E.id) continue;
      const a = 1 - o.age / o.duree; if (a <= 0) continue;
      let ox = ecranX(o.x), oy = ecranY(o.y);
      const marge = 26, dehors = ox < marge || oy < marge || ox > W - marge || oy > H - marge;
      if (dehors) { ox = clamp(ox, marge, W - marge); oy = clamp(oy, marge, H - marge); }
      ctx.strokeStyle = o.danger ? `rgba(214,48,62,${0.6 * a})` : o.trouve ? `rgba(232,196,90,${0.75 * a})` : `rgba(230,223,204,${0.45 * a})`;
      ctx.lineWidth = 2;
      for (let r = 0; r < 2; r++) { const rr2 = ((o.age / 600 + r * 0.5) % 1) * (dehors ? 18 : pxc * 0.9) + 4; cercle(ctx, ox, oy, rr2); ctx.stroke(); }
    }
    // objectif : losange qui pulse, ou flèche au bord de l'écran
    if (S.objectif && S.objectif.etage === E.id) {
      const o = S.objectif;
      fleche(ecranX(o.x), ecranY(o.y), '#e8c45a', o.texte || 'Objectif', Math.hypot(o.x - S.joueur.x, o.y - S.joueur.y), true, t);
    }
    // coéquipier : nom au-dessus de la tête, ou flèche au bord quand il est hors de vue
    for (const p of S.pairs) {
      if (p.etage !== E.id) continue;
      const x = ecranX(p.x), y = ecranY(p.y);
      const ip = icase(E, p.x, p.y), v = ip >= 0 && C.los[ip] === C.stamp;
      const d = Math.hypot(p.x - S.joueur.x, p.y - S.joueur.y);
      if (x > 30 && y > 30 && x < W - 30 && y < H - 30) {
        etiquette(x, y - pxc * 0.85, (p.nom || 'Coéquipier') + (p.agonie ? ' — à terre !' : ''), p.agonie ? '#ff6a6a' : '#7cc8ff', !v);
      } else fleche(x, y, '#7cc8ff', p.nom || 'Coéquipier', d, false, t);
    }
    // barre de fouille / d'action
    if (S.fouilleOn) {
      const f = S.fouille, bx = ecranX(f.x) - pxc * 0.7, by = ecranY(f.y) - pxc * 0.95, bw = pxc * 1.4;
      ctx.fillStyle = 'rgba(0,0,0,0.75)'; rr(ctx, bx - 3, by - 3, bw + 6, 11, 3); ctx.fill();
      ctx.fillStyle = '#d8b03a'; rr(ctx, bx, by, bw * f.frac, 5, 2); ctx.fill();
      ctx.fillStyle = 'rgba(230,223,204,0.8)';
      for (let n = 0; n < f.n; n++) { const fx = bx + bw * (n + 1) / (f.n + 1); ctx.fillRect(fx - 0.5, by - 1, 1, 7); }
    }
  }
  function etiquette(x, y, txt, coul, attenue) {
    ctx.font = '600 12px Oswald, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + 12;
    ctx.globalAlpha = attenue ? 0.75 : 1;
    ctx.fillStyle = 'rgba(8,8,10,0.78)'; rr(ctx, x - w / 2, y - 9, w, 18, 5); ctx.fill();
    ctx.strokeStyle = coul; ctx.lineWidth = 1; rr(ctx, x - w / 2 + 0.5, y - 8.5, w - 1, 17, 5); ctx.stroke();
    ctx.fillStyle = coul; ctx.fillText(txt, x, y + 0.5);
    ctx.globalAlpha = 1;
  }
  function fleche(x, y, coul, txt, d, losange, t) {
    const m = 38;
    const dedans = x > m && y > m && x < W - m && y < H - m;
    if (dedans) {
      if (!losange) return;
      const p = 0.5 + 0.5 * Math.sin(t / 300), s = 7 + p * 2;
      ctx.save(); ctx.translate(x, y - cam.pxc * 0.2); ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = coul; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.6 + 0.4 * p; ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.restore(); ctx.globalAlpha = 1;
      return;
    }
    const cx = W / 2, cy = H / 2, a = Math.atan2(y - cy, x - cx);
    const k = Math.min((W / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
    const px = cx + Math.cos(a) * k, py = cy + Math.sin(a) * k;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    ctx.fillStyle = 'rgba(8,8,10,0.75)'; cercle(ctx, 0, 0, 15); ctx.fill();
    ctx.fillStyle = coul; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-5, -7); ctx.lineTo(-2, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.font = '600 11px Oswald, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lab = `${txt} · ${Math.round(d * 0.8)} m`;
    const ly = py + (py > H / 2 ? -26 : 26);
    const w = ctx.measureText(lab).width + 10;
    ctx.fillStyle = 'rgba(8,8,10,0.72)'; rr(ctx, clamp(px, w / 2 + 4, W - w / 2 - 4) - w / 2, ly - 8, w, 16, 4); ctx.fill();
    ctx.fillStyle = coul; ctx.fillText(lab, clamp(px, w / 2 + 4, W - w / 2 - 4), ly + 0.5);
  }
  function marque(x, y, f, plein) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; cercle(ctx, x, y, 10); ctx.fill();
    ctx.strokeStyle = plein ? '#e0303e' : '#d8b03a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
    ctx.fillStyle = plein ? '#e0303e' : '#e6dfcc'; ctx.font = 'bold 12px Oswald, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(plein ? '!' : '?', x, y + 0.5);
  }

  // ---------- Météo, étalonnage ----------
  // Le vent emporte ce que le biome lui donne : poussière et brins secs dans la Crau, papiers en ville, feuilles ailleurs.
  const COUL_VENT = { sec: ['#a08a5a', '#8a7448', '#b8a070', '#6a5a3a'], ville: ['#d8d2c0', '#c9c2ae', '#7a5a26', '#8a6a2a'], vert: ['#7a5a26', '#8a6a2a', '#5a4a22', '#4e6a2a'] };
  function meteo(S, E, t, dt) {
    const dehors = S.dehors, v = S.vent || 0, biome = S.biome || 'ville';
    if (dehors && v > 0.35) {
      const pal = COUL_VENT[biome] || COUL_VENT.ville;
      effets.vent(E.id, S.joueur.x, S.joueur.y, v, dt, pal[(t / 97 | 0) % pal.length]);
      if (biome === 'sec' && v > 0.7) poussiereVent(t, v);
    }
    if (S.pluie > 0 && dehors) {
      effets.eclaboussures(E.id, S.joueur.x, S.joueur.y, S.pluie, dt);
      ctx.save();
      ctx.strokeStyle = `rgba(190,205,220,${0.2 + 0.18 * S.pluie})`; ctx.lineWidth = 1;
      ctx.beginPath();
      const n = Math.round(110 * S.pluie * (W * H) / (1280 * 720)) + 20;
      for (let k = 0; k < n; k++) {
        const vit = 0.9 + ((k * 37) % 10) / 20;
        const x0 = ((k * 9301 + 49297) % 233280) / 233280 * (W + 120) - 60;
        const y = ((t * vit + k * 977) % (H + 80)) - 40;
        const x = x0 + (y * 0.22);
        ctx.moveTo(x, y); ctx.lineTo(x - 5, y - 18);
      }
      ctx.stroke(); ctx.restore();
    }
  }
  // Mistral sur la Crau : de longues traînées de poussière filent au ras du sol.
  function poussiereVent(t, v) {
    ctx.save();
    ctx.strokeStyle = `rgba(190,170,130,${(0.08 + 0.1 * v).toFixed(3)})`; ctx.lineCap = 'round';
    const n = Math.round(26 * (W * H) / (1280 * 720)) + 8;
    for (let k = 0; k < n; k++) {
      const vit = 0.55 + ((k * 53) % 10) / 14;
      const y0 = ((k * 7919) % 1000) / 1000 * (H + 60) - 30;
      const x = ((t * vit * v + k * 811) % (W + 400)) - 200;
      const y = y0 + Math.sin(t / 900 + k) * 8;
      ctx.lineWidth = 1 + (k % 3);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 60 - (k % 5) * 18, y - 6); ctx.stroke();
    }
    ctx.restore();
  }
  function etalonnage(amb, S) {

    // teinte d'ensemble : soir orangé, nuit bleutée (soft-light, discret)
    const r = amb.lr, g = amb.lg, b = amb.lb;
    const ecart = Math.abs(r - g) + Math.abs(g - b);
    if (ecart > 0.05) {
      ctx.save(); ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},${Math.min(0.32, ecart * 0.45)})`;
      ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    void S;
  }
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
    const rad = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.74);
    rad.addColorStop(0, 'rgba(0,0,0,0)'); rad.addColorStop(1, 'rgba(0,0,0,0.72)');
    g.fillStyle = rad; g.fillRect(0, 0, W, H);
    vignette = c;
  }

  resize();
  return {
    cam, resize, dessiner, ecranVersMonde, mondeVersEcran, suivre, recaler, setZoom, effets,
    zoom: () => cam.zoom, taille: () => ({ W, H }),
    viderCache() { blocs.clear(); toitsCache.clear(); },
    fermer() { offSols(); offObjets(); blocs.clear(); toitsCache.clear(); grain = null; vignette = null; lumiere.fermer(); effets.fermer(); anim.clear(); },
  };
}

export const STYLE_JOUEUR = { manteau: '#4a4a3a', pantalon: '#2a2c30', cheveux: '#241a12', peau: '#b89378', coiffure: 'court', sac: false };
export const STYLE_JOUEUR_L = { ...STYLE_JOUEUR };
const STYLE_PAIR = { manteau: '#2c4a66', pantalon: '#22262c', cheveux: '#3a2a1a', peau: '#a88468', coiffure: 'court' };
const STYLE_PAIR_L = { ...STYLE_PAIR };
const STYLE_PNJ = { manteau: '#5a4636', pantalon: '#2a2622', cheveux: '#5a5048', peau: '#b39276', coiffure: 'court' };
void SUB; void FACE; void angDiff;
