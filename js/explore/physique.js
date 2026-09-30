// ============ Physique de grille : cercle contre cases bloquantes (joueurs et morts) ============
// Glisse le long des murs et contourne les coins en douceur (poussée selon le point le plus proche
// de chaque case, comme un cercle contre des carrés) : pas d'accrochage aux angles. Sans allocation.

// Déplace pos {x,y} de (dx,dy) en sous-pas de ≤ 0,2 case, en résolvant les collisions.
export function deplacer(w, h, bloque, pos, dx, dy, r) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.2));
  const sx = dx / n, sy = dy / n;
  for (let k = 0; k < n; k++) {
    pos.x += sx; pos.y += sy;
    resoudre(w, h, bloque, pos, r);
  }
}

export function resoudre(w, h, bloque, pos, r) {
  const r2 = r * r;
  for (let it = 0; it < 4; it++) {
    let touche = false;
    const x0 = Math.floor(pos.x - r), x1 = Math.floor(pos.x + r);
    const y0 = Math.floor(pos.y - r), y1 = Math.floor(pos.y + r);
    let meilleur = 0, mx = 0, my = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (x >= 0 && y >= 0 && x < w && y < h && !bloque[y * w + x]) continue;
      const cx = pos.x < x ? x : pos.x > x + 1 ? x + 1 : pos.x;
      const cy = pos.y < y ? y : pos.y > y + 1 ? y + 1 : pos.y;
      let ex = pos.x - cx, ey = pos.y - cy;
      const d2 = ex * ex + ey * ey;
      if (d2 >= r2) continue;
      let pen, nx, ny;
      if (d2 > 1e-10) { const d = Math.sqrt(d2); pen = r - d; nx = ex / d; ny = ey / d; }
      else {
        // centre DANS la case : sortir par le côté le plus proche
        const gx = pos.x - x, gy = pos.y - y;
        const m = Math.min(gx, 1 - gx, gy, 1 - gy);
        if (m === gx) { nx = -1; ny = 0; pen = gx + r; } else if (m === 1 - gx) { nx = 1; ny = 0; pen = 1 - gx + r; }
        else if (m === gy) { nx = 0; ny = -1; pen = gy + r; } else { nx = 0; ny = 1; pen = 1 - gy + r; }
      }
      if (pen > meilleur) { meilleur = pen; mx = nx; my = ny; }
      touche = true;
    }
    if (!touche) return;
    pos.x += mx * (meilleur + 1e-4); pos.y += my * (meilleur + 1e-4);
  }
}

// Ligne de vue entre deux points (centres en cases) : false si une case opaque est traversée
// (les cases de départ et d'arrivée sont ignorées). DDA exact sur la grille.
export function ligneLibre(w, h, opaque, x0, y0, x1, y1) {
  let cx = Math.floor(x0), cy = Math.floor(y0);
  const tx = Math.floor(x1), ty = Math.floor(y1);
  const dx = x1 - x0, dy = y1 - y0;
  const px = dx > 0 ? 1 : -1, py = dy > 0 ? 1 : -1;
  const idx = dx !== 0 ? Math.abs(1 / dx) : Infinity, idy = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  let tmx = dx !== 0 ? (dx > 0 ? (cx + 1 - x0) : (x0 - cx)) * idx : Infinity;
  let tmy = dy !== 0 ? (dy > 0 ? (cy + 1 - y0) : (y0 - cy)) * idy : Infinity;
  for (let n = 0; n < 400; n++) {
    if (cx === tx && cy === ty) return true;
    if (tmx < tmy) { tmx += idx; cx += px; } else { tmy += idy; cy += py; }
    if (cx === tx && cy === ty) return true;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) return false;
    if (opaque[cy * w + cx]) return false;
  }
  return true;
}

// Compte les obstacles traversés par un son : { murs, portes } (DDA). codePorte : valeur de code des portes.
export function obstaclesSon(E, bloqueDyn, x0, y0, x1, y1, sortie) {
  const w = E.w, h = E.h;
  let cx = Math.floor(x0), cy = Math.floor(y0);
  const tx = Math.floor(x1), ty = Math.floor(y1);
  const dx = x1 - x0, dy = y1 - y0;
  const px = dx > 0 ? 1 : -1, py = dy > 0 ? 1 : -1;
  const idx = dx !== 0 ? Math.abs(1 / dx) : Infinity, idy = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  let tmx = dx !== 0 ? (dx > 0 ? (cx + 1 - x0) : (x0 - cx)) * idx : Infinity;
  let tmy = dy !== 0 ? (dy > 0 ? (cy + 1 - y0) : (y0 - cy)) * idy : Infinity;
  let murs = 0, portes = 0, dernierMur = false;
  for (let n = 0; n < 400; n++) {
    if (cx === tx && cy === ty) break;
    if (tmx < tmy) { tmx += idx; cx += px; } else { tmy += idy; cy += py; }
    if (cx === tx && cy === ty) break;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) break;
    const i = cy * w + cx, c = E.code[i];
    if (c === 4 /* PORTE */) { if (bloqueDyn[i]) portes++; dernierMur = false; }
    else if (c === 1 || c === 0 || c === 5) { if (!dernierMur) murs++; dernierMur = true; } // un mur épais compte une fois
    else dernierMur = false;
  }
  sortie.murs = murs; sortie.portes = portes;
  return sortie;
}
