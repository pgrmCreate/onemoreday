// ============ Hasard — libre (Math.random) ou reproductible (graine) ============
export function hashStr(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Générateur mulberry32 dérivé d'une chaîne : même graine → même suite (co-op, repeuplement…).
export function seedRng(s) {
  let a = hashStr(s);
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function rng(min, max, r = Math.random) { return Math.floor(r() * (max - min + 1)) + min; }
export function rngF(min, max, r = Math.random) { return min + r() * (max - min); }
export function chance(p, r = Math.random) { return r() < p; }
export function pick(arr, r = Math.random) { return arr[Math.floor(r() * arr.length)]; }
export function pickPoids(arr, poids = (x) => x.poids || 1, r = Math.random) {
  const tot = arr.reduce((s, x) => s + poids(x), 0);
  let v = r() * tot;
  for (const x of arr) { v -= poids(x); if (v <= 0) return x; }
  return arr[arr.length - 1];
}
export function melanger(arr, r = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
