// ============ Effets : particules (sang, poussière, braises, fumée, feuilles, éclaboussures), calque de sang
// persistant par étage, flammes animées, traînées d'arme ============
// creerEffets() → { emettre(type, x, y, o), sang(etage, x, y, dir, force), maj(dt), dessiner(c, t, E, vu),
//                   calqueSang(c, E), flammes(c, sources, t, vu), trainee(…) }
// Coordonnées monde en CASES ; dessin en px monde (× TS).
import { TS, canvas, cercle, ellipse, rng, hash } from './outils.js';

const MAX = 500;
const ECH_SANG = 0.5;          // résolution du calque de sang (px par px monde)

export function creerEffets() {
  const P = [];                 // particules vivantes
  const calques = new Map();    // étage → { cv, c }
  const traines = [];           // traînées d'arme : { etage, x, y, dir, a0, a1, R, age, duree, lourd }
  let rs = 1;
  const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };

  function calque(E) {
    let k = calques.get(E.id);
    if (!k) {
      const cv = canvas(E.w * TS * ECH_SANG, E.h * TS * ECH_SANG);
      k = { cv, c: cv.getContext('2d'), n: 0 };
      calques.set(E.id, k);
    }
    return k;
  }
  // Tache de sang imprimée au sol (persistante tant qu'on reste dans le lieu).
  function tache(E, x, y, r, a = rnd() * 6.28, fonce = false) {
    if (!E) return;
    const k = calque(E), c = k.c, s = TS * ECH_SANG;
    c.save(); c.translate(x * s, y * s); c.rotate(a);
    c.fillStyle = fonce ? 'rgba(40,3,5,0.85)' : `rgba(${70 + rnd() * 30 | 0},6,9,0.78)`;
    ellipse(c, 0, 0, r * s, r * s * (0.55 + rnd() * 0.3)); c.fill();
    const n = 3 + (rnd() * 5 | 0);
    for (let q = 0; q < n; q++) { const aa = rnd() * 6.28, d = r * s * (0.8 + rnd()); cercle(c, Math.cos(aa) * d, Math.sin(aa) * d * 0.7, r * s * (0.08 + rnd() * 0.16)); c.fill(); }
    c.restore();
    k.n++;
  }
  function emettre(type, x, y, o = {}) {
    if (P.length >= MAX) P.splice(0, P.length - MAX + 1);
    const p = { type, x, y, z: o.z ?? 0, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, age: 0, duree: o.duree || 600, t: o.t || 2, etage: o.etage, coul: o.coul || null, E: o.E || null, a: o.a || 0, va: o.va || 0 };
    P.push(p);
    return p;
  }
  // Gerbe de sang : gouttes projetées dans la direction du coup, qui tombent et tachent le sol.
  function sang(E, etage, x, y, dir, force = 1) {
    const n = Math.round(6 + 10 * force);
    for (let k = 0; k < n; k++) {
      const a = dir + (rnd() - 0.5) * 1.5, v = (1.2 + rnd() * 2.6) * (0.6 + force * 0.6);
      emettre('goutte', x, y, { E, etage, vx: Math.cos(a) * v, vy: Math.sin(a) * v, z: 0.5 + rnd() * 0.4, vz: 1 + rnd() * 2.5, duree: 900, t: 1.2 + rnd() * 1.8 });
    }
    tache(E, x + Math.cos(dir) * 0.35, y + Math.sin(dir) * 0.35, 0.16 + 0.18 * force);
  }
  function poussiere(etage, x, y, n = 3, coul = 'rgba(120,110,95,') {
    for (let k = 0; k < n; k++) emettre('poussiere', x + (rnd() - 0.5) * 0.3, y + (rnd() - 0.5) * 0.3, { etage, vx: (rnd() - 0.5) * 0.5, vy: (rnd() - 0.5) * 0.5, duree: 500 + rnd() * 300, t: 3 + rnd() * 3, coul });
  }
  function etincelles(etage, x, y, dir) {
    for (let k = 0; k < 7; k++) { const a = dir + (rnd() - 0.5) * 2, v = 2 + rnd() * 4; emettre('etincelle', x, y, { etage, vx: Math.cos(a) * v, vy: Math.sin(a) * v, duree: 200 + rnd() * 200 }); }
  }
  function eclats(etage, x, y, dir, coul = '#6a4a2a') {
    for (let k = 0; k < 6; k++) { const a = dir + (rnd() - 0.5) * 2.4, v = 1.5 + rnd() * 2.5; emettre('eclat', x, y, { etage, vx: Math.cos(a) * v, vy: Math.sin(a) * v, z: 0.4, vz: 1 + rnd() * 2, duree: 700, coul, a: rnd() * 6, va: (rnd() - 0.5) * 20 }); }
  }
  function trainee(etage, x, y, dir, o = {}) {
    traines.push({ etage, x, y, dir, a0: o.a0 ?? 1.3, a1: o.a1 ?? -0.9, R: o.R ?? 1.1, age: 0, duree: o.duree || 160, lourd: !!o.lourd, sens: o.sens || 1 });
    if (traines.length > 12) traines.shift();
  }

  function maj(dt) {
    const s = dt / 1000;
    for (let k = P.length - 1; k >= 0; k--) {
      const p = P[k];
      p.age += dt;
      if (p.age >= p.duree) { P.splice(k, 1); continue; }
      p.x += p.vx * s; p.y += p.vy * s;
      if (p.type === 'goutte' || p.type === 'eclat') {
        p.vz -= 9 * s; p.z += p.vz * s; p.a += p.va * s;
        if (p.z <= 0) {
          if (p.type === 'goutte' && p.E) tache(p.E, p.x, p.y, 0.035 + rnd() * 0.05);
          P.splice(k, 1); continue;
        }
        p.vx *= 1 - 1.2 * s; p.vy *= 1 - 1.2 * s;
      } else if (p.type === 'fumee') { p.vx *= 1 - 0.5 * s; p.vy *= 1 - 0.5 * s; p.t += 4 * s; }
      else if (p.type === 'braise') { p.vx += (rnd() - 0.5) * 2 * s; p.vy += (rnd() - 0.5) * 2 * s; }
      else if (p.type === 'poussiere' || p.type === 'etincelle') { p.vx *= 1 - 3 * s; p.vy *= 1 - 3 * s; }
      else if (p.type === 'feuille') { p.a += p.va * s; }
    }
    for (let k = traines.length - 1; k >= 0; k--) { traines[k].age += dt; if (traines[k].age > traines[k].duree) traines.splice(k, 1); }
  }

  function dessinerCalqueSang(c, E) {
    const k = calques.get(E.id);
    if (!k || !k.n) return;
    c.drawImage(k.cv, 0, 0, E.w * TS, E.h * TS);
  }

  // Particules et traînées de l'étage (en px monde). vu(x, y) → 0..1 : visibilité de la case (on ne voit rien dans le noir).
  function dessiner(c, t, etage, vu) {
    for (const tr of traines) {
      if (tr.etage !== etage || vu(tr.x, tr.y) < 0.2) continue;
      const q = tr.age / tr.duree, a = (1 - q);
      c.save(); c.translate(tr.x * TS, tr.y * TS); c.rotate(tr.dir);
      const g = c.createRadialGradient(0, 0, tr.R * TS * 0.35, 0, 0, tr.R * TS);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, `rgba(255,240,220,${0.32 * a * (tr.lourd ? 1.3 : 1)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      const a0 = tr.sens * tr.a0, a1 = tr.sens * (tr.a0 + (tr.a1 - tr.a0) * Math.min(1, q * 2.2));
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, tr.R * TS, Math.min(a0, a1), Math.max(a0, a1)); c.closePath(); c.fill();
      c.restore();
    }
    for (const p of P) {
      if (p.etage !== etage) continue;
      const v = vu(p.x, p.y); if (v < 0.15) continue;
      const q = p.age / p.duree, X = p.x * TS, Y = p.y * TS - (p.z || 0) * TS * 0.6;
      switch (p.type) {
        case 'goutte': c.fillStyle = 'rgba(120,10,14,0.95)'; cercle(c, X, Y, p.t); c.fill(); break;
        case 'poussiere': c.fillStyle = (p.coul || 'rgba(120,110,95,') + (0.28 * (1 - q) * v).toFixed(3) + ')'; cercle(c, X, Y, p.t * (1 + q * 1.5)); c.fill(); break;
        case 'etincelle': c.fillStyle = `rgba(255,${200 - q * 100 | 0},90,${1 - q})`; c.fillRect(X - 1, Y - 1, 2.4, 2.4); break;
        case 'eclat': c.save(); c.translate(X, Y); c.rotate(p.a); c.fillStyle = p.coul || '#6a4a2a'; c.fillRect(-2.5, -1, 5, 2); c.restore(); break;
        case 'fumee': c.fillStyle = `rgba(40,38,36,${0.22 * (1 - q) * v})`; cercle(c, X, Y, p.t * TS * 0.12); c.fill(); break;
        case 'braise': { const f = 1 - q; c.fillStyle = `rgba(255,${150 + 80 * f | 0},60,${f})`; c.fillRect(X - 1, Y - 1, 2, 2); break; }
        case 'feuille': c.save(); c.translate(X, Y); c.rotate(p.a); c.fillStyle = p.coul || '#7a5a26'; ellipse(c, 0, 0, 3.4, 1.8); c.fill(); c.restore(); break;
        case 'eclabousse': c.strokeStyle = `rgba(170,190,205,${0.45 * (1 - q)})`; c.lineWidth = 1; cercle(c, X, Y, 1.5 + q * 5); c.stroke(); break;
        default: break;
      }
    }
  }

  // Flammes des feux visibles (au-dessus des braseros) + braises et fumée émises de temps en temps.
  function flammes(c, sources, t, etage, vu, dt) {
    for (const s of sources) {
      if (s.anim !== 'feu' || vu(s.x, s.y) < 0.2) continue;
      const X = s.x * TS, Y = s.y * TS, f = s._f ?? 1, R = (s.type === 'fusee' ? 0.18 : 0.3) * TS;
      for (let k = 0; k < 5; k++) {
        const ph = t / (90 + k * 23) + k * 1.7 + s.phase;
        const ox = Math.sin(ph) * R * 0.35, oy = Math.cos(ph * 1.3) * R * 0.3 - k * 1.2;
        const g = c.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, R * (1.1 - k * 0.12) * f);
        g.addColorStop(0, k < 2 ? 'rgba(255,240,180,0.95)' : 'rgba(255,170,60,0.8)'); g.addColorStop(0.5, 'rgba(240,90,20,0.55)'); g.addColorStop(1, 'rgba(120,20,5,0)');
        c.fillStyle = g; cercle(c, X + ox, Y + oy, R * (1.1 - k * 0.12) * f); c.fill();
      }
      s._tEmit = (s._tEmit || 0) - dt;
      if (s._tEmit <= 0) {
        s._tEmit = 90 + rnd() * 120;
        emettre('braise', s.x + (rnd() - 0.5) * 0.2, s.y + (rnd() - 0.5) * 0.2, { etage, vx: (rnd() - 0.5) * 0.6, vy: -0.4 - rnd() * 0.8, duree: 700 + rnd() * 900 });
        if (rnd() < 0.5) emettre('fumee', s.x, s.y - 0.2, { etage, vx: (rnd() - 0.5) * 0.3 + 0.15, vy: -0.5 - rnd() * 0.4, duree: 1800 + rnd() * 1200, t: 2 });
      }
    }
  }
  // Feuilles portées par le mistral (dehors) autour d'un point.
  function vent(etage, x, y, force, dt, coul) {
    if (rnd() > force * dt / 140) return;
    const a = 0.25 + (rnd() - 0.5) * 0.4;
    emettre('feuille', x - 9 + rnd() * 4, y - 7 + rnd() * 14, { etage, vx: Math.cos(a) * (2 + force * 3), vy: Math.sin(a) * (2 + force * 3), duree: 5000, a: rnd() * 6, va: (rnd() - 0.5) * 6, coul: coul || ['#7a5a26', '#8a6a2a', '#5a4a22', '#9a7032'][rnd() * 4 | 0] });
  }
  function eclaboussures(etage, x, y, intensite, dt) {
    const n = intensite * dt / 22;
    for (let k = 0; k < n; k++) if (rnd() < 0.6) emettre('eclabousse', x + (rnd() - 0.5) * 22, y + (rnd() - 0.5) * 14, { etage, duree: 260 });
  }

  return {
    emettre, sang, tache, poussiere, etincelles, eclats, trainee, maj, dessiner, dessinerCalqueSang, flammes, vent, eclaboussures,
    vider() { P.length = 0; traines.length = 0; },
    fermer() { P.length = 0; calques.clear(); },
  };
}
void rng; void hash;
