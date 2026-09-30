// ============ Cinématiques — effets globaux (canvas léger + quelques calques DOM) ============
// Un seul canvas au-dessus du SVG pour les particules (pluie, braises, cendres, fumée, poussière, mistral,
// étoiles, brouillard, lueur de lampe, chaleur, grain), plus trois calques DOM gérés ici :
// vignette (pulsation), teinte (flash rouge) et voile (fondu au noir / au blanc), et la secousse du monde.
// Chaque effet a un niveau 0..1 qui monte ou descend en douceur quand la liste des effets change.
//
// Réglages optionnels fournis par le décor (decor.reglages) :
//   fumee: '#2b2622', braises: '#f4a23c', cendres: '#b8b2a6', brouillard: '#b8c0c8', lampe: [x, y] (0..1 du cadre),
//   poussiere: '#e8d7b0', pluie: '#a8b8c8', vent: -1..1 (sens du vent de base, + = vers la droite)

const EFFETS_CANVAS = ['etoiles', 'brouillard_bas', 'fumee', 'poussiere', 'mistral', 'cendres', 'braises', 'pluie', 'chaleur', 'lueur_lampe', 'grain'];
export const EFFETS_CONNUS = [...EFFETS_CANVAS, 'vignette_pulse', 'flash_rouge', 'fondu_noir', 'fondu_blanc', 'secousse'];

const rnd = Math.random; // effets purement visuels : pas besoin de déterminisme ici
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function sprite(taille, stops) {
  const c = document.createElement('canvas'); c.width = c.height = taille;
  const g = c.getContext('2d'); const r = taille / 2;
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, taille, taille);
  return c;
}
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function tuilesGrain() {
  const tuiles = [];
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 192;
    const g = c.getContext('2d'); const img = g.createImageData(192, 192);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() < 0.5 ? 0 : 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = rnd() < 0.55 ? Math.floor(rnd() * 70) : 0;
    }
    g.putImageData(img, 0, 0); tuiles.push(c);
  }
  return tuiles;
}

export function creerEffets({ canvas, vignette, teinte, voile, monde }) {
  const ctx = canvas.getContext('2d');
  let W = 1, Hc = 1, echelle = 1;
  const niveaux = {}; const cibles = {};
  for (const e of EFFETS_CONNUS) { niveaux[e] = 0; cibles[e] = 0; }
  let reglages = {};
  let parts = null;
  let grain = null, grainIdx = 0, grainT = 0, grainOx = 0, grainOy = 0;
  let spriteFumee = null, spriteBrume = null, spriteBraise = null;
  let flashT = 99, flashProchain = 3;
  let secX = 0, secY = 0, secT = 0, secousseCible = [0, 0];
  let fondu = { noir: 0, blanc: 0 };

  function initParticules() {
    parts = {
      etoiles: Array.from({ length: 140 }, () => ({ x: rnd(), y: Math.pow(rnd(), 1.6) * 0.5, r: 0.5 + rnd() * 1.3, f: 0.5 + rnd() * 2.5, ph: rnd() * 6.28 })),
      poussiere: Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 2, v: 0.004 + rnd() * 0.012, ph: rnd() * 6.28, a: 0.2 + rnd() * 0.5 })),
      mistral: Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), l: 0.04 + rnd() * 0.14, v: 0.5 + rnd() * 0.9, a: 0.05 + rnd() * 0.14 })),
      grit: Array.from({ length: 60 }, () => ({ x: rnd(), y: 0.3 + rnd() * 0.7, v: 0.6 + rnd() * 0.9, r: 0.5 + rnd() * 1.2, ph: rnd() * 6.28 })),
      cendres: Array.from({ length: 90 }, () => ({ x: rnd(), y: rnd(), r: 1 + rnd() * 2.6, v: 0.02 + rnd() * 0.05, rot: rnd() * 6.28, vr: (rnd() - 0.5) * 3, ph: rnd() * 6.28, a: 0.3 + rnd() * 0.5 })),
      braises: Array.from({ length: 110 }, () => nouvelleBraise(true)),
      fumee: Array.from({ length: 16 }, () => nouvelleFumee(true)),
      brume: Array.from({ length: 12 }, () => ({ x: rnd() * 1.6 - 0.3, y: 0.62 + rnd() * 0.36, w: 0.5 + rnd() * 0.7, h: 0.1 + rnd() * 0.12, v: 0.004 + rnd() * 0.01, a: 0.5 + rnd() * 0.5 })),
      pluie: Array.from({ length: 220 }, () => ({ x: rnd() * 1.2, y: rnd(), l: 0.03 + rnd() * 0.05, v: 1.4 + rnd() * 0.9, a: 0.12 + rnd() * 0.25 })),
      chaleur: Array.from({ length: 12 }, () => ({ y: 0.45 + rnd() * 0.5, ph: rnd() * 6.28, v: 0.02 + rnd() * 0.04 })),
    };
  }
  function nouvelleBraise(init) {
    return { x: rnd() * 1.1 - 0.05, y: init ? rnd() : 1.02 + rnd() * 0.1, v: 0.05 + rnd() * 0.14, r: 0.8 + rnd() * 2.2, ph: rnd() * 6.28, vie: 0.6 + rnd() * 0.4, f: 3 + rnd() * 8 };
  }
  function nouvelleFumee(init) {
    return { x: rnd() * 1.3 - 0.2, y: init ? 0.2 + rnd() * 0.9 : 1.15, r: 0.18 + rnd() * 0.25, v: 0.012 + rnd() * 0.02, a: 0.35 + rnd() * 0.4, rot: rnd() * 6.28 };
  }

  function taille(w, h) {
    echelle = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, Math.round(w * echelle)); Hc = Math.max(1, Math.round(h * echelle));
    canvas.width = W; canvas.height = Hc;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  }

  function regler(liste, reg = {}) {
    reglages = reg || {};
    for (const e of EFFETS_CONNUS) cibles[e] = liste.includes(e) ? 1 : 0;
    if (liste.includes('flash_rouge')) { flashT = 0; flashProchain = 1.8 + rnd() * 2; }
    const cf = reglages.fumee || '#2b2723';
    spriteFumee = sprite(128, [[0, rgba(cf, 0.55)], [0.5, rgba(cf, 0.25)], [1, rgba(cf, 0)]]);
    const cb = reglages.brouillard || '#b8c0c8';
    spriteBrume = sprite(128, [[0, rgba(cb, 0.5)], [0.6, rgba(cb, 0.18)], [1, rgba(cb, 0)]]);
    const cbr = reglages.braises || '#f4a23c';
    spriteBraise = sprite(32, [[0, 'rgba(255,245,210,1)'], [0.25, rgba(cbr, 0.9)], [1, rgba(cbr, 0)]]);
  }
  // Pour démarrer un plan sans montée progressive (premier plan, changement de décor derrière le rideau).
  function immediat() { for (const e of EFFETS_CONNUS) niveaux[e] = cibles[e]; }

  // Battement de cœur : deux pics rapprochés toutes les ~1,1 s.
  const coeur = t => { const x = (t % 1.15) / 1.15; return Math.exp(-Math.pow((x - 0.08) / 0.035, 2)) + 0.6 * Math.exp(-Math.pow((x - 0.24) / 0.04, 2)); };

  // dt, t en secondes ; cam : { dx (déplacement caméra en px écran depuis le début du plan, sert à la parallaxe) } ; p : avancement du plan.
  function frame(dt, t, cam, p) {
    if (!parts) initParticules();
    for (const e of EFFETS_CONNUS) {
      const c = cibles[e]; const n = niveaux[e];
      if (n !== c) niveaux[e] = c > n ? Math.min(c, n + dt * 1.1) : Math.max(c, n - dt * 1.4);
    }
    const N = niveaux;
    const vent = (reglages.vent || 0) + N.mistral * 1.6;
    ctx.clearRect(0, 0, W, Hc);
    const px = (cam && cam.px) || 0;
    const S = Math.min(W, Hc * 2.39) / 1000; // échelle des tailles (px par « point » de référence)

    if (N.etoiles > 0) {
      ctx.fillStyle = '#e8e2d0';
      for (const s of parts.etoiles) {
        const a = N.etoiles * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.f + s.ph)));
        let x = ((s.x * W - px * 0.04) % W + W) % W;
        ctx.globalAlpha = a * 0.85;
        ctx.beginPath(); ctx.arc(x, s.y * Hc, s.r * S * 1.4, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (N.brouillard_bas > 0 && spriteBrume) {
      for (const b of parts.brume) {
        b.x += b.v * dt * (1 + vent);
        if (b.x > 1.4) b.x = -0.6 - rnd() * 0.3;
        let x = b.x * W - px * 0.5; x = ((x + W * 0.6) % (W * 2) + W * 2) % (W * 2) - W * 0.6;
        ctx.globalAlpha = N.brouillard_bas * b.a * 0.8;
        ctx.drawImage(spriteBrume, x, b.y * Hc - b.h * Hc, b.w * W, b.h * Hc * 2);
      }
      ctx.globalAlpha = 1;
    }
    if (N.fumee > 0 && spriteFumee) {
      for (const f of parts.fumee) {
        f.y -= f.v * dt; f.x += (0.01 + vent * 0.05) * dt; f.r += dt * 0.012; f.rot += dt * 0.05;
        if (f.y < -0.4 || f.x > 1.4) Object.assign(f, nouvelleFumee(false));
        const vie = smooth(1.15, 0.8, f.y) * smooth(-0.4, 0.1, f.y);
        ctx.globalAlpha = N.fumee * f.a * vie;
        const r = f.r * Hc * 1.4;
        let x = f.x * W - px * 0.7;
        x = ((x + W * 0.4) % (W * 1.8) + W * 1.8) % (W * 1.8) - W * 0.4;
        ctx.drawImage(spriteFumee, x - r, f.y * Hc - r * 0.7, r * 2, r * 1.4);
      }
      ctx.globalAlpha = 1;
    }
    if (N.chaleur > 0) {
      // Mirage : bandes tremblantes chaudes vers le bas du cadre.
      const g = ctx.createLinearGradient(0, Hc * 0.35, 0, Hc);
      g.addColorStop(0, 'rgba(255,170,80,0)'); g.addColorStop(1, `rgba(255,150,60,${0.1 * N.chaleur})`);
      ctx.fillStyle = g; ctx.fillRect(0, Hc * 0.35, W, Hc * 0.65);
      ctx.strokeStyle = `rgba(255,236,200,${0.05 * N.chaleur})`; ctx.lineWidth = 2 * S;
      for (const c of parts.chaleur) {
        c.y -= c.v * dt; if (c.y < 0.35) c.y = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += W / 30) { const y = c.y * Hc + Math.sin(x / W * 20 + t * 3 + c.ph) * 4 * S; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    if (N.poussiere > 0) {
      ctx.fillStyle = reglages.poussiere || '#e8d7b0';
      for (const d of parts.poussiere) {
        d.x += (d.v * 0.4 + vent * 0.25 * d.v * 20) * dt; d.y += Math.sin(t * 0.7 + d.ph) * 0.004 * dt - d.v * 0.2 * dt;
        if (d.x > 1.05) d.x = -0.05; if (d.x < -0.05) d.x = 1.05; if (d.y < -0.05) d.y = 1.05;
        let x = ((d.x * W - px * 0.9) % W + W) % W;
        ctx.globalAlpha = N.poussiere * d.a * (0.6 + 0.4 * Math.sin(t * 1.3 + d.ph));
        ctx.beginPath(); ctx.arc(x, d.y * Hc, d.r * S * 1.6, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (N.mistral > 0) {
      ctx.strokeStyle = '#eef2f4'; ctx.lineCap = 'round';
      for (const m of parts.mistral) {
        m.x += m.v * dt; if (m.x > 1.2) { m.x = -0.2 - rnd() * 0.2; m.y = rnd(); }
        const x = m.x * W, y = m.y * Hc + Math.sin(t * 2 + m.y * 20) * 6 * S;
        ctx.globalAlpha = N.mistral * m.a; ctx.lineWidth = (1 + m.a * 6) * S;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + m.l * W * 0.5, y - 4 * S, x + m.l * W, y + 2 * S); ctx.stroke();
      }
      ctx.fillStyle = reglages.poussiere || '#d8cfb8';
      for (const g of parts.grit) {
        g.x += g.v * dt * 1.3; if (g.x > 1.05) { g.x = -0.05; g.y = 0.3 + rnd() * 0.7; }
        ctx.globalAlpha = N.mistral * 0.5;
        ctx.beginPath(); ctx.arc(g.x * W, g.y * Hc + Math.sin(t * 9 + g.ph) * 3 * S, g.r * S * 1.5, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (N.cendres > 0) {
      ctx.fillStyle = reglages.cendres || '#bdb7aa';
      for (const c of parts.cendres) {
        c.y += c.v * dt; c.x += (Math.sin(t * 0.8 + c.ph) * 0.01 + vent * 0.05) * dt; c.rot += c.vr * dt;
        if (c.y > 1.05) { c.y = -0.05; c.x = rnd(); } if (c.x > 1.05) c.x = -0.05;
        const x = ((c.x * W - px * 0.8) % W + W) % W;
        ctx.globalAlpha = N.cendres * c.a;
        ctx.save(); ctx.translate(x, c.y * Hc); ctx.rotate(c.rot); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(c.rot)));
        ctx.fillRect(-c.r * S * 1.6, -c.r * S * 1.6, c.r * S * 3.2, c.r * S * 3.2); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    if (N.braises > 0 && spriteBraise) {
      ctx.globalCompositeOperation = 'lighter';
      for (const b of parts.braises) {
        b.y -= b.v * dt; b.x += (Math.sin(t * 1.5 + b.ph) * 0.02 + vent * 0.07) * dt; b.vie -= dt * 0.12;
        if (b.y < -0.05 || b.vie <= 0 || b.x > 1.1) Object.assign(b, nouvelleBraise(false));
        const cl = 0.55 + 0.45 * Math.sin(t * b.f + b.ph);
        ctx.globalAlpha = N.braises * Math.min(1, b.vie * 2) * cl;
        const r = b.r * S * 5;
        const x = ((b.x * W - px * 1.1) % (W * 1.1) + W * 1.1) % (W * 1.1) - W * 0.05;
        ctx.drawImage(spriteBraise, x - r, b.y * Hc - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    if (N.pluie > 0) {
      ctx.strokeStyle = reglages.pluie || '#aebccb'; ctx.lineWidth = 1.2 * S * 1.3;
      const inc = 0.18 + vent * 0.15;
      ctx.beginPath();
      for (const r of parts.pluie) {
        r.y += r.v * dt; r.x += r.v * inc * dt * 0.42; if (r.y > 1.05) { r.y = -0.1; r.x = rnd() * 1.2 - 0.1; }
        const x = r.x * W, y = r.y * Hc;
        ctx.moveTo(x, y); ctx.lineTo(x + r.l * Hc * inc, y + r.l * Hc);
      }
      ctx.globalAlpha = 0.35 * N.pluie; ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (N.lueur_lampe > 0) {
      const [lx, ly] = reglages.lampe || [0.5, 0.9];
      const fl = 0.85 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7.3) + (rnd() < 0.02 ? -0.2 : 0);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(lx * W, ly * Hc, 0, lx * W, ly * Hc, Hc * 0.55);
      g.addColorStop(0, `rgba(232,212,154,${0.34 * N.lueur_lampe * fl})`); g.addColorStop(0.45, `rgba(232,196,120,${0.12 * N.lueur_lampe * fl})`); g.addColorStop(1, 'rgba(232,212,154,0)');
      ctx.fillStyle = g;
      ctx.save(); ctx.translate(lx * W, ly * Hc); ctx.scale(1.9, 0.6); ctx.translate(-lx * W, -ly * Hc);
      ctx.fillRect(0, 0, W, Hc * 2); ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    }
    if (N.grain > 0) {
      if (!grain) grain = tuilesGrain();
      grainT += dt;
      if (grainT > 1 / 24) { grainT = 0; grainIdx = (grainIdx + 1) % grain.length; grainOx = rnd() * 192; grainOy = rnd() * 192; }
      const pat = ctx.createPattern(grain[grainIdx], 'repeat');
      ctx.save(); ctx.globalAlpha = 0.5 * N.grain; ctx.translate(-grainOx, -grainOy); ctx.fillStyle = pat; ctx.fillRect(0, 0, W + 192, Hc + 192); ctx.restore();
    }

    // ---- Calques DOM ----
    const vp = N.vignette_pulse;
    if (vignette) vignette.style.opacity = (0.72 + vp * (0.25 * coeur(t) - 0.05)).toFixed(3);
    if (vignette) vignette.style.transform = vp > 0 ? `scale(${(1 - 0.03 * vp * coeur(t)).toFixed(4)})` : '';
    // Flash rouge : un éclat franc au début du plan, puis des pulsations irrégulières.
    if (teinte) {
      let a = 0;
      if (N.flash_rouge > 0 || flashT < 1) {
        flashT += dt;
        a = Math.max(0, 0.72 * Math.exp(-flashT * 3.2));
        if (cibles.flash_rouge) {
          flashProchain -= dt;
          if (flashProchain < 0) { flashT = 0.35; flashProchain = 1.5 + rnd() * 2.5; }
          a = Math.max(a, 0.1 * N.flash_rouge * (0.5 + 0.5 * Math.sin(t * 2.2)));
        }
      }
      teinte.style.opacity = a.toFixed(3);
    }
    // Fondus progressifs sur la durée du plan.
    fondu.noir = cibles.fondu_noir ? smooth(0.2, 0.95, p) : Math.max(0, fondu.noir - dt * 1.5);
    fondu.blanc = cibles.fondu_blanc ? smooth(0.3, 1, p) : Math.max(0, fondu.blanc - dt * 1.5);
    if (voile) {
      if (fondu.blanc > fondu.noir) { voile.style.background = '#f4f1ea'; voile.style.opacity = fondu.blanc.toFixed(3); }
      else { voile.style.background = '#000'; voile.style.opacity = fondu.noir.toFixed(3); }
    }
    // Secousse (et tremblement de chaleur).
    if (monde) {
      let tr = '';
      if (N.secousse > 0) {
        secT -= dt;
        if (secT <= 0) { secT = 0.05 + rnd() * 0.06; const fort = rnd() < 0.08 ? 3 : 1; secousseCible = [(rnd() - 0.5) * 10 * fort, (rnd() - 0.5) * 7 * fort]; }
        secX += (secousseCible[0] - secX) * Math.min(1, dt * 18); secY += (secousseCible[1] - secY) * Math.min(1, dt * 18);
        tr += `translate(${(secX * N.secousse).toFixed(2)}px,${(secY * N.secousse).toFixed(2)}px) `;
      }
      if (N.chaleur > 0) tr += `skewX(${(Math.sin(t * 2.1) * 0.12 * N.chaleur).toFixed(3)}deg) scaleY(${(1 + Math.sin(t * 3.3) * 0.0025 * N.chaleur).toFixed(4)})`;
      monde.style.transform = tr;
    }
  }
  function fonduCourant() { return fondu; }
  function detruire() { parts = null; grain = null; ctx.clearRect(0, 0, W, Hc); }
  return { taille, regler, immediat, frame, detruire, fonduCourant };
}
