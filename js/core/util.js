// ============ Petits outils partagés ============
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
// el('div', { class: 'x', onclick: fn, style: {…} }, enfant, 'texte', …)
export function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) { if (e == null || e === false) continue; n.append(e.nodeType ? e : document.createTextNode(String(e))); }
  return n;
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export function fmtDistance(m) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`;
}
export function fmtDuree(min) {
  min = Math.max(0, Math.round(min));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export const attendre = (ms) => new Promise(r => setTimeout(r, ms));
// Texte narratif → HTML : paragraphes (\n\n), retours (\n), *italique*.
export function texteHtml(s) {
  return escapeHtml(s).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`).join('');
}
export const estTactile = () => matchMedia('(pointer: coarse)').matches;
export function vibrer(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
