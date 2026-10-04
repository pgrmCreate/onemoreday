// ============ Cinématiques — une main qui ressemble à une main ============
// Main droite vue de profil (côté du pouce), articulée : métacarpe, quatre doigts à trois phalanges, pouce à trois
// segments, ongles, plis des articulations, jointures ; modelé par un reflet côté dos et une ombre côté paume ; le doigt du
// fond est plus sombre que celui de devant. Avant-bras : peau du poignet, poignet d'anorak côtelé, manche de blouse plissée.
// Tout est dessiné dans le repère de la main (poignet en 0,0 ; x vers le bout des doigts ; y vers la paume) : l'appelant
// place le groupe (translate + rotate) et ne fait que changer les angles.
//   formesMain(g) → { clé: chemin } ; g = { doigts: [[mcp, pip, dip] × 4 (index, majeur, annulaire, auriculaire)], pouce: [cmc, mcp, ip] }
//   formesBras(o) → { clé: chemin } (repère de l'avant-bras : x vers la main, le coude du côté des x négatifs)
//   POSES_MAIN : pince (tient un papier), ouverte (lâche), repos.
const RAD = Math.PI / 180;
const r1 = n => Math.round(n * 10) / 10;
const f1 = (q) => `${r1(q[0])} ${r1(q[1])}`;

// Capsule effilée de a (rayon ra) à b (rayon rb) — même sens de parcours partout (les parties d'un chemin se recouvrent sans trou).
function capsule(a, b, ra, rb, gA = 0, gP = 0) {
  let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1e-6; dx /= L; dy /= L;
  const nx = -dy, ny = dx, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, rm = (ra + rb) / 2;
  const a1 = [a[0] + nx * ra, a[1] + ny * ra], b1 = [b[0] + nx * rb, b[1] + ny * rb], b2 = [b[0] - nx * rb, b[1] - ny * rb], a2 = [a[0] - nx * ra, a[1] - ny * ra];
  const c1 = [mx + nx * (rm + gP * 2), my + ny * (rm + gP * 2)], c2 = [mx - nx * (rm + gA * 2), my - ny * (rm + gA * 2)];
  return `M${f1(a1)}Q${f1(c1)} ${f1(b1)}A${r1(rb)} ${r1(rb)} 0 0 0 ${f1(b2)}Q${f1(c2)} ${f1(a2)}A${r1(ra)} ${r1(ra)} 0 0 0 ${f1(a1)}Z`;
}
// Courbe lisse fermée (Catmull-Rom → Bézier).
function lisse(pts, k = 1) {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  if (a > 0) pts = pts.slice().reverse();
  const n = pts.length, P = (i) => pts[(i + n) % n];
  let d = `M${f1(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += `C${f1([p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k])} ${f1([p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k])} ${f1(p2)}`;
  }
  return d + 'Z';
}
const dir = (o, ang, len) => [o[0] + Math.cos(ang * RAD) * len, o[1] + Math.sin(ang * RAD) * len];
const decale = (p, ang, d) => [p[0] - Math.sin(ang * RAD) * d, p[1] + Math.cos(ang * RAD) * d];   // vers la paume (+) / le dos (−)

// Doigts : base (articulation métacarpo-phalangienne), longueurs et rayons des trois phalanges, angle de départ.
const DOIGTS = [
  { base: [100, -15], L: [46, 28, 23], r: [11, 10, 8.6], a0: -3 },     // index (devant)
  { base: [103, -5], L: [50, 31, 24], r: [11.4, 10.3, 8.8], a0: 0 },   // majeur
  { base: [99, 5], L: [47, 29, 23], r: [10.8, 9.7, 8.4], a0: 4 },      // annulaire
  { base: [91, 15], L: [37, 22, 19], r: [9.4, 8.4, 7.4], a0: 9 },      // auriculaire (au fond)
];
export const POSES_MAIN = {
  pince: { doigts: [[43, 30, 30], [50, 70, 34], [56, 76, 36], [62, 78, 34]], pouce: [10, 4, 8] },
  ouverte: { doigts: [[10, 12, 6], [14, 18, 8], [20, 24, 10], [26, 28, 12]], pouce: [-6, -2, 2] },
  repos: { doigts: [[24, 32, 18], [30, 40, 20], [36, 46, 22], [42, 48, 22]], pouce: [12, 8, 12] },
};
export function melangePose(a, b, t) {
  const m = (x, y) => x + (y - x) * t;
  return { doigts: a.doigts.map((d, i) => d.map((v, j) => m(v, b.doigts[i][j]))), pouce: a.pouce.map((v, j) => m(v, b.pouce[j])) };
}
// Squelette d'un doigt : points des articulations et angle de chaque phalange.
function doigt(D, fl) {
  const pts = [D.base], angs = [];
  let ang = D.a0;
  for (let i = 0; i < 3; i++) { ang += fl[i]; angs.push(ang); pts.push(dir(pts[i], ang, D.L[i])); }
  return { pts, angs };
}
function pouceSq(fl) {
  const base = [28, 22], L = [50, 34, 28];
  const pts = [base], angs = []; let ang = 8;
  for (let i = 0; i < 3; i++) { ang += fl[i]; angs.push(ang); pts.push(dir(pts[i], ang, L[i])); }
  return { pts, angs, r: [14, 11.6, 10.2, 8.8] };
}

export function formesMain(g) {
  const F = {};
  const sq = DOIGTS.map((D, i) => doigt(D, g.doigts[i]));
  // phalanges (du fond vers l'avant : auriculaire, annulaire, majeur ; l'index passe devant la paume)
  const phal = (i) => { const D = DOIGTS[i], s = sq[i]; let d = ''; for (let k = 0; k < 3; k++) d += capsule(s.pts[k], s.pts[k + 1], D.r[k] * (k ? 1 : 1.08), D.r[k + 1 < 3 ? k + 1 : 2] * (k === 2 ? 0.92 : 1)); return d; };
  F.d3 = phal(3); F.d2 = phal(2); F.d1 = phal(1);
  // dos de la main et paume (éminence thénar), jointures en léger relief
  F.paume = lisse([[-6, -33], [30, -36], [66, -33], [94, -29], [106, -20], [108, -2], [102, 18], [92, 30], [66, 40], [40, 46], [18, 44], [-4, 36], [-12, 0]], 0.95);
  F.d0 = phal(0);
  // pouce
  const P = pouceSq(g.pouce);
  F.pouce = capsule([8, 26], P.pts[1], 17, P.r[1]) + capsule(P.pts[1], P.pts[2], P.r[1], P.r[2]) + capsule(P.pts[2], P.pts[3], P.r[2], P.r[3] * 0.94);
  // ongles : sur le dos de la dernière phalange (index, majeur ; pouce)
  const ongle = (a, b, ang, r) => {
    const A = decale(dir(a, ang, (Math.hypot(b[0] - a[0], b[1] - a[1])) * 0.3), ang, -r * 0.62), B = decale(b, ang, -r * 0.5);
    const A2 = decale(A, ang, r * 0.42), B2 = decale(dir(b, ang, r * 0.55), ang, -r * 0.05);
    return lisse([A, B, B2, A2], 0.8);
  };
  F.ongles = ongle(sq[0].pts[2], sq[0].pts[3], sq[0].angs[2], DOIGTS[0].r[2]) + ongle(sq[1].pts[2], sq[1].pts[3], sq[1].angs[2], DOIGTS[1].r[2]) + ongle(P.pts[2], P.pts[3], P.angs[2], P.r[3]);
  // plis côté paume aux articulations, petites rides côté dos sur les jointures
  let plis = '';
  for (const i of [0, 1]) for (const k of [1, 2]) {
    const s = sq[i], p = s.pts[k], a = (s.angs[k - 1] + s.angs[k]) / 2, r = DOIGTS[i].r[k];
    const u = decale(p, a, r * 0.95), v = decale(p, a, r * 0.35);
    plis += `M${f1(u)}L${f1(v)}`;
    const w1 = decale(dir(p, a, -2), a, -r * 0.92), w2 = decale(dir(p, a, 3), a, -r * 0.7);
    plis += `M${f1(w1)}Q${f1(decale(p, a, -r * 1.05))} ${f1(w2)}`;
  }
  { const p = P.pts[2], a = (P.angs[1] + P.angs[2]) / 2; plis += `M${f1(decale(p, a, P.r[2] * 0.95))}L${f1(decale(p, a, P.r[2] * 0.3))}`; }
  plis += 'M30 41Q50 30 70 36M14 38Q20 24 36 22';                                           // plis de la paume (ligne de vie)
  F.plis = plis;
  // tendons et veines sur le dos de la main
  F.tendons = 'M10 -24Q50 -28 98 -22M14 -16Q52 -18 100 -11M20 -30Q40 -40 62 -31';
  // modelé : reflet sur le dos des phalanges et de la main, ombre côté paume
  let reflet = 'M4 -26Q50 -33 96 -26';
  for (const i of [0, 1]) for (let k = 0; k < 3; k++) { const s = sq[i]; reflet += `M${f1(decale(s.pts[k], s.angs[k], -DOIGTS[i].r[k] * 0.5))}L${f1(decale(s.pts[k + 1], s.angs[k], -DOIGTS[i].r[Math.min(2, k + 1)] * 0.5))}`; }
  for (let k = 0; k < 3; k++) reflet += `M${f1(decale(P.pts[k], P.angs[k], -P.r[k] * 0.45))}L${f1(decale(P.pts[k + 1], P.angs[k], -P.r[k + 1] * 0.45))}`;
  F.reflet = reflet;
  let ombre = 'M6 32Q40 44 92 26';
  for (const i of [0]) for (let k = 0; k < 3; k++) { const s = sq[i]; ombre += `M${f1(decale(s.pts[k], s.angs[k], DOIGTS[i].r[k] * 0.62))}L${f1(decale(s.pts[k + 1], s.angs[k], DOIGTS[i].r[Math.min(2, k + 1)] * 0.62))}`; }
  F.ombre = ombre;
  // bout des doigts (pour accrocher un papier)
  F._index = { bout: sq[0].pts[3], ang: sq[0].angs[2], milieu: sq[0].pts[2] };
  F._pouce = { bout: P.pts[3], ang: P.angs[2] };
  return F;
}
// Avant-bras : peau du poignet, poignet d'anorak côtelé (rouge), manche de blouse blanche plissée qui sort du cadre.
export function formesBras() {
  const F = {};
  F.peau = capsule([-80, -2], [8, 0], 30, 31);
  F.anorak = lisse([[-50, -38], [-150, -42], [-156, 0], [-150, 42], [-50, 38], [-43, 0]], 0.9);
  let cotes = '';
  for (let x = -55; x > -148; x -= 8) cotes += `M${x} -36Q${x - 3} 0 ${x} 36`;
  F.cotes = cotes;
  F.manche = lisse([[-128, -50], [-380, -60], [-720, -72], [-1100, -80], [-1100, 80], [-720, 72], [-380, 60], [-128, 52], [-118, 0]], 0.9);
  F.plisManche = 'M-170 -44Q-205 -4 -186 46M-270 -54Q-300 -8 -262 56M-430 -62Q-476 0 -440 66M-580 -68Q-560 -16 -616 70M-230 26Q-320 16 -380 38';
  F.ourlet = 'M-130 -48Q-121 0 -128 50';
  return F;
}

// ---------- Mise en SVG ----------
// svgBrasMain({ id, peau }) → chaîne : <g class="bras-rig"> (avant-bras) puis <g class="main-rig"> (main), chaque partie marquée
// data-k ; poserMain(groupe, g) recalcule les chemins de la main (les angles changent, rien n'est reconstruit).
const fonce = (c, t) => { const n = parseInt(c.slice(1), 16); const f = (v) => Math.round(v * (1 - t)); return '#' + ((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };
export function svgBrasMain({ id = 'mn', peau = '#d2a489', pose = POSES_MAIN.pince, billet = true } = {}) {
  const B = formesBras(), M = formesMain(pose);
  const flou = `${id}-flou`;
  let s = `<defs><filter id="${flou}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<g class="bras-rig">`
    + `<path data-k="manche" d="${B.manche}" fill="#d6dad3"/><path d="${B.plisManche}" stroke="#8f9690" stroke-width="5" fill="none" opacity="0.55" stroke-linecap="round"/>`
    + `<path d="${B.manche}" fill="none" stroke="#f4f6f2" stroke-width="10" opacity="0.25" filter="url(#${flou})" transform="translate(0,-14) scale(1,0.8)"/>`
    + `<path d="${B.anorak}" fill="#a0222a"/><path d="${B.cotes}" stroke="#66121a" stroke-width="3" fill="none" opacity="0.7"/>`
    + `<path d="${B.ourlet}" stroke="#868d87" stroke-width="7" fill="none" stroke-linecap="round"/>`
    + `<path d="${B.peau}" fill="${peau}"/></g>`;
  s += `<g class="main-rig">`
    + `<path data-k="d3" d="${M.d3}" fill="${fonce(peau, 0.24)}"/><path data-k="d2" d="${M.d2}" fill="${fonce(peau, 0.16)}"/><path data-k="d1" d="${M.d1}" fill="${fonce(peau, 0.08)}"/>`
    + `<path data-k="paume" d="${M.paume}" fill="${peau}"/><path data-k="tendons" d="${M.tendons}" stroke="#e8c4aa" stroke-width="3" fill="none" opacity="0.4" stroke-linecap="round"/>`
    + `<path data-k="d0" d="${M.d0}" fill="${peau}"/>`
    + (billet ? `<g class="billet-main"><path data-k="billet" d="" fill="#efe9d8"/><path data-k="pliBillet" d="" stroke="#b6ad96" stroke-width="2" fill="none"/></g>` : '')
    + `<path data-k="pouce" d="${M.pouce}" fill="${peau}"/>`
    + `<path data-k="ongles" d="${M.ongles}" fill="#ebcfc0" stroke="#a37b68" stroke-width="1.3"/>`
    + `<path data-k="plis" d="${M.plis}" stroke="#86593f" stroke-width="1.7" fill="none" opacity="0.55" stroke-linecap="round"/>`
    + `<path data-k="reflet" d="${M.reflet}" stroke="#f6dccb" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round" filter="url(#${flou})"/>`
    + `<path data-k="ombre" d="${M.ombre}" stroke="#6e4430" stroke-width="8" fill="none" opacity="0.3" stroke-linecap="round" filter="url(#${flou})"/>`
    + `</g>`;
  return s;
}
// Le billet plié tenu entre le pouce et l'index (repère de la main).
export function formesBillet(M) {
  const a = M._index.bout, b = M._pouce.bout;
  const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD + 90;
  const pt = (u, v) => [c[0] + Math.cos(ang * RAD) * u - Math.sin(ang * RAD) * v, c[1] + Math.sin(ang * RAD) * u + Math.cos(ang * RAD) * v];
  return { billet: `M${f1(pt(-8, -20))}L${f1(pt(44, -24))}L${f1(pt(47, 16))}L${f1(pt(-5, 20))}Z`, pliBillet: `M${f1(pt(18, -22))}L${f1(pt(22, 18))}` };
}
export function poserMain(groupe, g, avecBillet = true) {
  const M = formesMain(g);
  if (avecBillet) Object.assign(M, formesBillet(M)); else { M.billet = ''; M.pliBillet = ''; }
  const els = groupe.__parties || (groupe.__parties = [...groupe.querySelectorAll('[data-k]')]);
  for (const el of els) { const d = M[el.dataset.k]; if (d != null) el.setAttribute('d', d); }
  return M;
}
