// ============ Plan du lieu : la carte locale qui se dévoile en explorant ============
// Ce qu'on a vu d'un lieu (mémoire C.vu de chaque étage) devient un plan : pièces nommées, portes, fenêtres, escaliers,
// sorties, ta position et ta direction, l'allié en co-op. Rien sur les morts ni le butin : c'est ce dont tu te souviens.
// La mémoire est gardée dans la sauvegarde (G.world.lieux[id].plan) : en revenant, le plan est toujours là.
// Ouverture : Tab ou M au clavier, bouton « Plan » sur l'écran. En solo le jeu est en pause tant que le plan est ouvert.
import { G } from '../core/state.js';
import { el } from '../core/util.js';
import { K, FIN } from '../carte/catalogue.js';

let V = null, P = null;   // P : { racine, cv, tabs, etage, tRaf, fermer }
export function lierPlan(v) { V = v; if (!v) fermerPlan(); }

// ---------- Mémoire (sauvegarde compacte : longueurs de plages alternées 0/1, en base 36) ----------
function encoder(vu) {
  const r = []; let cur = 0, n = 0;
  for (let i = 0; i < vu.length; i++) { const b = vu[i] ? 1 : 0; if (b === cur) n++; else { r.push(n.toString(36)); cur = b; n = 1; } }
  r.push(n.toString(36));
  return r.join('.');
}
function decoder(txt, vu) {
  let i = 0, b = 0;
  for (const s of String(txt).split('.')) { const n = parseInt(s, 36) || 0; if (b) vu.fill(1, i, Math.min(vu.length, i + n)); i += n; b ^= 1; }
}
export function chargerMemoire(v) {
  const L = G.world.lieux[v.lieuId], m = L && L.plan;
  if (!m || m.v !== 1 || (m.pv || 0) !== (v.niveau.planVersion || 0)) return;   // plan refait : on oublie
  v.niveau.etages.forEach((E, k) => { const s = m.etages && m.etages[E.id]; if (s && s.w === E.w && s.h === E.h) try { decoder(s.d, v.champs[k].vu); } catch (e) { /* plan changé : on oublie */ } });
}
export function sauverMemoire(v) {
  if (!v || v.arene) return;
  const etages = {};
  v.niveau.etages.forEach((E, k) => { const vu = v.champs[k].vu; if (vu.indexOf(1) >= 0) etages[E.id] = { w: E.w, h: E.h, d: encoder(vu) }; });
  G.world.lieux[v.lieuId] = { ...(G.world.lieux[v.lieuId] || {}), plan: { v: 1, pv: v.niveau.planVersion || 0, etages } };
}

// ---------- Fenêtre ----------
export function planOuvert() { return !!P; }
export function basculerPlan(opts = {}) { if (P) fermerPlan(); else ouvrirPlan(opts); }
export function ouvrirPlan({ surFermeture } = {}) {
  if (!V || P) return;
  const cv = el('canvas', { class: 'ex-plan-cv' });
  const tabs = el('div', { class: 'ex-plan-etages' });
  const racine = el('div', { class: 'ex-plan', role: 'dialog', 'aria-label': 'Plan du lieu' },
    el('div', { class: 'ex-plan-tete' },
      el('div', { class: 'ex-plan-titre' }, el('strong', {}, V.niveau.nom || 'Plan du lieu'), el('small', {}, 'Ce que tu as déjà exploré')),
      tabs,
      el('button', { class: 'ex-plan-fermer', type: 'button', 'aria-label': 'Fermer le plan', onclick: () => fermerPlan() }, 'Fermer')),
    el('div', { class: 'ex-plan-zone' }, cv),
    el('div', { class: 'ex-plan-legende' },
      el('span', {}, el('i', { class: 'lg-moi' }), 'Toi'),
      G.mode !== 'solo' ? el('span', {}, el('i', { class: 'lg-allie' }), 'Ton allié') : null,
      el('span', {}, el('i', { class: 'lg-porte' }), 'Porte'),
      el('span', {}, el('i', { class: 'lg-esc' }), 'Escalier'),
      el('span', {}, el('i', { class: 'lg-sortie' }), 'Sortie')));
  // un toucher sur le fond (hors du plan) ferme aussi
  racine.addEventListener('pointerdown', (e) => { if (e.target === racine) fermerPlan(); });
  const clavier = (e) => { if (['Tab', 'Escape', 'KeyM'].includes(e.code)) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) fermerPlan(); } };
  document.addEventListener('keydown', clavier, true);
  V.racine.append(racine);
  P = { racine, cv, tabs, etage: V.j.etage, clavier, surFermeture, t: 0 };
  dessiner();
  // en co-op le jeu continue : le plan suit ta position
  P.timer = setInterval(() => { if (P && V) dessiner(); }, 400);
  window.addEventListener('resize', dessiner);
}
export function fermerPlan() {
  if (!P) return;
  const p = P; P = null;
  clearInterval(p.timer);
  document.removeEventListener('keydown', p.clavier, true);
  window.removeEventListener('resize', dessiner);
  p.racine.remove();
  if (p.surFermeture) try { p.surFermeture(); } catch (e) { console.warn(e); }
}

// ---------- Dessin ----------
const COUL = {
  [K.MUR]: [214, 204, 180], [K.FENETRE]: [126, 160, 182], [K.PORTE]: [201, 162, 39], [K.MEUBLE]: [92, 86, 74],
  [K.EAU]: [44, 78, 104], [K.ESC_MONTE]: [178, 146, 92], [K.ESC_DESCEND]: [178, 146, 92], [K.SORTIE]: [232, 196, 90],
};
const SOL_INT = [74, 67, 56], SOL_EXT = [50, 55, 46];

function etagesConnus() {
  return V.niveau.etages.filter((E, k) => E.id === V.j.etage || V.champs[k].vu.indexOf(1) >= 0);
}
function dessiner() {
  if (!P || !V) return;
  const n = V.niveau;
  if (n.etageIdx[P.etage] == null) P.etage = V.j.etage;
  // onglets d'étage (seulement s'il y en a plusieurs de connus)
  const connus = etagesConnus();
  const cleTabs = connus.map(E => E.id).join('|') + '#' + P.etage + '#' + V.j.etage;
  if (P.cleTabs !== cleTabs) {
    P.cleTabs = cleTabs; P.tabs.textContent = '';
    if (connus.length > 1) for (const E of connus) {
      P.tabs.append(el('button', { type: 'button', class: 'ex-plan-etage' + (E.id === P.etage ? ' actif' : ''), onclick: () => { P.etage = E.id; P.cleTabs = null; dessiner(); } },
        E.nom || E.id, E.id === V.j.etage ? el('em', {}, ' · tu es ici') : null));
    }
  }
  const E = n.etages[n.etageIdx[P.etage]], C = V.champs[E.idx], vu = C.vu, w = E.w, h = E.h;
  // cadre : ce qu'on a vu (+ une marge), pas tout le niveau
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < w * h; i++) if (vu[i]) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const ici = E.id === V.j.etage;
  if (ici) { const jx = Math.floor(V.j.x * FIN), jy = Math.floor(V.j.y * FIN); x0 = Math.min(x0, jx); x1 = Math.max(x1, jx); y0 = Math.min(y0, jy); y1 = Math.max(y1, jy); }
  const M = 6 * FIN;
  x0 = Math.max(0, x0 - M); y0 = Math.max(0, y0 - M); x1 = Math.min(w - 1, x1 + M); y1 = Math.min(h - 1, y1 + M);
  const bw = Math.max(1, x1 - x0 + 1), bh = Math.max(1, y1 - y0 + 1);
  // image du plan, 1 pixel par petite case
  const cle = `${E.id}:${x0},${y0},${bw},${bh}:${somme(vu)}`;
  if (P.cleImg !== cle) {
    P.cleImg = cle;
    const off = P.off || (P.off = document.createElement('canvas'));
    off.width = bw; off.height = bh;
    const g = off.getContext('2d'), im = g.createImageData(bw, bh), d = im.data;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = (y + y0) * w + x + x0, o = (y * bw + x) * 4;
      if (!vu[i]) { d[o + 3] = 0; continue; }
      const k = E.code[i];
      if (k === K.VIDE) { d[o + 3] = 0; continue; }
      const pc = E.piece[i] >= 0 ? n.pieces[E.piece[i]] : null;
      const c = COUL[k] || (pc && pc.exterieur ? SOL_EXT : SOL_INT);
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  // mise à l'échelle dans la zone
  const zone = P.cv.parentElement, dpr = Math.min(2, window.devicePixelRatio || 1);
  const ZW = Math.max(100, zone.clientWidth), ZH = Math.max(100, zone.clientHeight);
  if (P.cv.width !== Math.round(ZW * dpr) || P.cv.height !== Math.round(ZH * dpr)) { P.cv.width = Math.round(ZW * dpr); P.cv.height = Math.round(ZH * dpr); }
  P.cv.style.width = ZW + 'px'; P.cv.style.height = ZH + 'px';
  const ctx = P.cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, ZW, ZH);
  const s = Math.min(ZW / bw, ZH / bh, 9);             // pixels écran par petite case (plafonné : petit lieu = pas énorme)
  const ox = (ZW - bw * s) / 2, oy = (ZH - bh * s) / 2;
  const X = (ux) => ox + (ux * FIN - x0) * s, Y = (uy) => oy + (uy * FIN - y0) * s;   // unités → écran
  if (vu.indexOf(1) < 0) {
    ctx.fillStyle = 'rgba(230,223,204,.6)'; ctx.font = '16px "EB Garamond", Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('Tu n’as encore rien exploré à cet étage.', ZW / 2, ZH / 2);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(P.off, ox, oy, bw * s, bh * s);
  ctx.imageSmoothingEnabled = true;
  const vuU = (ux, uy) => { const x = Math.floor(ux * FIN), y = Math.floor(uy * FIN); return x >= 0 && y >= 0 && x < w && y < h && vu[y * w + x]; };
  const texte = (t, x, y, taille, coul) => {
    ctx.font = `600 ${taille}px Oswald, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(8,8,9,.85)'; ctx.strokeText(t, x, y); ctx.fillStyle = coul; ctx.fillText(t, x, y);
  };
  // noms des pièces vues
  const vues = new Set();
  for (let i = 0; i < w * h; i++) if (vu[i] && E.piece[i] >= 0) vues.add(E.piece[i]);
  const taille = Math.max(10, Math.min(14, s * 2.2));
  for (const pid of vues) {
    const pc = n.pieces[pid]; if (!pc.nom || pc.etage !== E.id) continue;
    texte(pc.nom.charAt(0).toUpperCase() + pc.nom.slice(1), ox + ((pc.x0 + pc.x1 + 1) / 2 - x0) * s, oy + ((pc.y0 + pc.y1 + 1) / 2 - y0) * s, taille, 'rgba(230,223,204,.92)');
  }
  // escaliers et sorties vus
  for (const e of n.escaliers) if (e.etage === E.id && vuU(e.cx, e.cy)) {
    const cible = e.vers && n.etageIdx[e.vers] != null ? n.etages[n.etageIdx[e.vers]].nom : null;
    texte(`${e.sens === 'monte' ? '↑' : '↓'} ${cible || (e.sens === 'monte' ? 'Monter' : 'Descendre')}`, X(e.cx), Y(e.cy) - s * 2.2, Math.max(10, taille - 1), '#d9b56a');
  }
  for (const so of n.sorties) if (so.etage === E.id && vuU(so.cx, so.cy)) texte('Sortie', X(so.cx), Y(so.cy) - s * 2, Math.max(10, taille - 1), '#e8c45a');
  // l'allié
  for (const p of V.pairsDerniers || []) if (p.etage === E.id) {
    ctx.fillStyle = '#7cc8ff'; ctx.strokeStyle = '#0b0b0c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), Math.max(5, s * 1.1), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // toi : une flèche dans ta direction
  if (ici) {
    const r = Math.max(8, s * 1.8), px = X(V.j.x), py = Y(V.j.y), a = V.j.dir;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.7, r * 0.65); ctx.lineTo(-r * 0.35, 0); ctx.lineTo(-r * 0.7, -r * 0.65); ctx.closePath();
    ctx.fillStyle = '#e8c45a'; ctx.strokeStyle = '#0b0b0c'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
function somme(vu) { let n = 0; for (let i = 0; i < vu.length; i += 7) n += vu[i]; return n; }
