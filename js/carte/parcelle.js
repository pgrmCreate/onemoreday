// ============ Parcelle de nature — un grand morceau de collines, de Crau ou de rivière, généré avec l'API à couches ============
// Pour TENIR loin des villes (les sirènes de l'armée : js/data/histoire/ruees.js) : de grands espaces sans rues, où l'on
// trouve de l'eau, du bois, de quoi cueillir et chercher au sol, de la place pour construire, un abri de pierre.
//
//   parcelle(meta, { W, H, milieu, graine }, (e, P) => { … détails propres au lieu … })
//   milieu : 'pinede'  (chaîne des Côtes : pins serrés, rochers, garrigue, un cabanon de chasse, une source)
//            'crau'    (coussouls : herbe rase et galets à perte de vue, murets de pierre sèche, une bergerie, un puits)
//            'riviere' (la Touloubre : un cours d'eau qui serpente, ripisylve, cannes, une passerelle, un vieux moulin)
//   P : { W, H, rnd, libre(x, y, w, h), reserver(…), poser(type, x, y, o, marge), semis(…), trouver(w, h, zone) → {x, y},
//         chemin, traverse, yA, yB, xT, lit (rivière) } — pour poser ses propres détails sans chevaucher.
// Déterministe (graine = id du niveau, comme tout plan). Les bords sont un maquis infranchissable, sauf aux sorties.
import { plan } from './plan.js';
import { OBJETS } from './catalogue.js';

export function parcelle(meta, o, details) {
  return plan({ exterieur: true, typeButin: 'nature', ...meta }, (p) => {
    const W = o.W || 128, H = o.H || 96, milieu = o.milieu || 'pinede';
    const solBase = milieu === 'riviere' ? 'herbe' : 'herbe_seche';
    const e = p.etage('sol', meta.nom, W, H, { sol: solBase });
    const rnd = e.rng;
    const occ = new Uint8Array(W * H);                    // 1 = réservé (chemin, bâtiment, eau, objet)
    const libre = (x, y, w = 1, h = 1) => {
      if (x < 2 || y < 2 || x + w > W - 2 || y + h > H - 2) return false;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (occ[yy * W + xx]) return false;
      return true;
    };
    const reserver = (x, y, w = 1, h = 1) => { for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) occ[yy * W + xx] = 1; };
    const poser = (type, x, y, opts = {}, marge = 1) => {
      const d = OBJETS[type] || { t: [1, 1] }, w = opts.w || d.t[0], h = opts.h || d.t[1];
      if (!libre(x - marge, y - marge, w + 2 * marge, h + 2 * marge)) return false;
      e.objet(type, x, y, opts); reserver(x, y, w, h); return true;
    };
    // Un semis : n essais de poser `type` dans un rectangle, à distance des autres (marge). type peut être une liste
    // pondérée [[type, poids], …] d'essences de même emprise : le choix dépend de la case (hachage), pas du tirage —
    // les parcelles déjà visitées gardent leurs arbres aux mêmes places.
    const essence = (type, x, y) => {
      if (!Array.isArray(type)) return type;
      let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177);
      let u = (((h ^ (h >>> 16)) >>> 0) / 4294967296) * type.reduce((s, t) => s + t[1], 0);
      for (const [t, p] of type) if ((u -= p) < 0) return t;
      return type[type.length - 1][0];
    };
    const semis = (type, x0, y0, w, h, n, marge = 1, opts) => {
      let k = 0;
      for (let a = 0; a < n * 4 && k < n; a++) {
        const x = Math.floor(x0 + rnd() * w), y = Math.floor(y0 + rnd() * h);
        if (poser(essence(type, x, y), x, y, typeof opts === 'function' ? opts() : (opts || {}), marge)) k++;
      }
      return k;
    };

    // ---------- Le sol : taches de matières selon le milieu ----------
    if (milieu === 'pinede') {
      e.taches('terre', 2, 2, W - 4, H - 4, 0.05, 2);
      e.taches('gravier', 2, 2, W - 4, H - 4, 0.02, 1.5);
      e.taches('herbe', 2, 2, W - 4, H - 4, 0.03, 1.8);
    } else if (milieu === 'crau') {
      e.taches('gravier', 2, 2, W - 4, H - 4, 0.16, 1.8);   // les galets de la Crau
      e.taches('terre', 2, 2, W - 4, H - 4, 0.05, 1.5);
    } else {
      e.taches('herbe_seche', 2, 2, W - 4, H - 4, 0.08, 2);
      e.taches('terre', 2, 2, W - 4, H - 4, 0.06, 1.6);
    }

    // ---------- Le chemin principal (ouest → est) qui serpente, et un chemin de traverse ----------
    const yA = Math.floor(H * (0.35 + rnd() * 0.3)), yB = Math.floor(H * (0.3 + rnd() * 0.4));
    const pts = [[0, yA]];
    for (let k = 1; k < 6; k++) pts.push([Math.round(W * k / 6), Math.round(yA + (yB - yA) * k / 6 + (rnd() - 0.5) * H * 0.18)]);
    pts.push([W - 1, yB]);
    const matChemin = milieu === 'crau' ? 'terre' : 'terre';
    e.chemin(matChemin, pts, 2);
    const xT = Math.floor(W * (0.35 + rnd() * 0.3));
    const traverse = [[xT, 0], [xT + Math.round((rnd() - 0.5) * 16), Math.round(H * 0.3)], [pts[3][0], pts[3][1]]];
    e.chemin('terre', traverse, 1);
    const reserverChemin = (l, larg) => { for (let k = 0; k < l.length - 1; k++) { const [x0, y0] = l[k], [x1, y1] = l[k + 1]; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let s = 0; s <= n; s++) { const x = Math.round(x0 + (x1 - x0) * s / n), y = Math.round(y0 + (y1 - y0) * s / n); reserver(x - larg, y - larg, 2 * larg + 1, 2 * larg + 1); } } };
    reserverChemin(pts, 2); reserverChemin(traverse, 1);

    // ---------- Les bords : un maquis infranchissable (ou des murets dans la Crau), ouvert aux sorties ----------
    const bord = milieu === 'crau' ? 'muret' : 'haie';
    e.murRect(bord, 0, 0, W, 1); e.murRect(bord, 0, H - 1, W, 1); e.murRect(bord, 0, 0, 1, H); e.murRect(bord, W - 1, 0, 1, H);
    if (milieu !== 'crau') { e.murRect('haie', 1, 1, W - 2, 1); e.murRect('haie', 1, H - 2, W - 2, 1); e.murRect('haie', 1, 1, 1, H - 2); e.murRect('haie', W - 2, 1, 1, H - 2); }
    const ouvrir = (x, y, w, h) => { e.solRect(matChemin, x, y, w, h); e.sortie(x, y, w, h); };
    // sorties : ouest et est au bout du chemin, nord au bout de la traverse
    e.solRect(matChemin, 0, yA - 2, 3, 5); e.solRect(matChemin, W - 3, yB - 2, 3, 5); e.solRect('terre', xT - 1, 0, 3, 3);
    // on efface le bord aux sorties
    const percer = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { const i = yy * W + xx; e.mur[i] = 0; } };
    percer(0, yA - 2, 2, 5); percer(W - 2, yB - 2, 2, 5); percer(xT - 1, 0, 3, 2);
    ouvrir(0, yA - 2, 1, 5); ouvrir(W - 1, yB - 2, 1, 5); ouvrir(xT - 1, 0, 3, 1);
    e.entree('defaut', 4, yA); e.entree('ouest', 4, yA); e.entree('est', W - 5, yB); e.entree('nord', xT, 4);
    reserver(0, yA - 3, 8, 7); reserver(W - 8, yB - 3, 8, 7); reserver(xT - 3, 0, 7, 7);

    // Trouver la place d'un bâtiment w × h (avec une marge), de préférence dans un rectangle [x0, y0, x1, y1].
    const trouver = (w, h, zone = [4, 4, W - 4, H - 4], marge = 2) => {
      for (let a = 0; a < 400; a++) {
        const x = Math.floor(zone[0] + rnd() * Math.max(1, zone[2] - zone[0] - w)), y = Math.floor(zone[1] + rnd() * Math.max(1, zone[3] - zone[1] - h));
        if (libre(x - marge, y - marge, w + 2 * marge, h + 2 * marge)) { reserver(x - marge, y - marge, w + 2 * marge, h + 2 * marge); return { x, y }; }
      }
      return null;
    };
    const P = { W, H, rnd, libre, reserver, poser, semis, trouver, chemin: pts, traverse, yA, yB, xT, e };

    // ---------- Le milieu ----------
    if (milieu === 'riviere') riviere(e, P);
    if (details) details(e, P);   // les bâtiments et les lieux nommés d'abord : la végétation pousse autour
    if (milieu === 'riviere') berges(e, P);

    if (milieu === 'pinede') {
      semis([['pin', 3], ['chene_vert', 2]], 2, 2, W - 4, H - 4, Math.round(W * H / 34), 1);
      semis([['romarin', 3], ['buisson', 2], ['lavande', 1]], 2, 2, W - 4, H - 4, Math.round(W * H / 90), 0);
      semis('roncier', 2, 2, W - 4, H - 4, Math.round(W * H / 260), 0);
      // affleurements de rocher (calcaire de la chaîne des Côtes)
      for (let k = 0; k < Math.round(W * H / 700); k++) {
        const x = 4 + Math.floor(rnd() * (W - 10)), y = 4 + Math.floor(rnd() * (H - 10)), w = 2 + Math.floor(rnd() * 3), h = 1 + Math.floor(rnd() * 3);
        if (libre(x - 1, y - 1, w + 2, h + 2)) { e.murRect('rocher', x, y, w, h); reserver(x, y, w, h); }
      }
      e.semer('aiguilles', 2, 2, W - 4, H - 4, Math.round(W * H / 40));
      e.semer('herbes', 2, 2, W - 4, H - 4, Math.round(W * H / 120));
    } else if (milieu === 'crau') {
      // de longs murets de pierre sèche, troués (les anciennes limites des coussouls)
      for (let k = 0; k < 6; k++) {
        const hor = rnd() < 0.5, x = 6 + Math.floor(rnd() * (W - 30)), y = 6 + Math.floor(rnd() * (H - 30)), L = 14 + Math.floor(rnd() * 22);
        for (let s = 0; s < L; s++) {
          if (rnd() < 0.12) continue;                         // une brèche
          const xx = hor ? x + s : x, yy = hor ? y : y + s;
          if (libre(xx, yy)) { e.murRect('muret', xx, yy, 1, 1); reserver(xx, yy); }
        }
      }
      semis('amandier', 2, 2, W - 4, H - 4, Math.round(W * H / 900), 2);
      semis([['buisson', 2], ['romarin', 2]], 2, 2, W - 4, H - 4, Math.round(W * H / 260), 1);
      semis('gravats', 2, 2, W - 4, H - 4, Math.round(W * H / 500), 1, () => ({ nom: 'le cairn' }));
      e.semer('gravillons', 2, 2, W - 4, H - 4, Math.round(W * H / 30));
      e.semer('herbes', 2, 2, W - 4, H - 4, Math.round(W * H / 90));
    } else {
      semis('arbre', 2, 2, W - 4, H - 4, Math.round(W * H / 120), 1);
      semis('buisson', 2, 2, W - 4, H - 4, Math.round(W * H / 140), 0);
      semis('roncier', 2, 2, W - 4, H - 4, Math.round(W * H / 220), 0);
      semis('figuier', 2, 2, W - 4, H - 4, Math.round(W * H / 1400), 2);
      e.semer('feuilles', 2, 2, W - 4, H - 4, Math.round(W * H / 60));
      e.semer('herbes', 2, 2, W - 4, H - 4, Math.round(W * H / 70));
    }
  });
}

// ---------- La rivière : un cours d'eau du nord au sud qui serpente, ses berges, une passerelle sur le chemin ----------
function riviere(e, P) {
  const { W, H, rnd, reserver } = P;
  let x = Math.floor(W * (0.55 + rnd() * 0.15));
  const larg = 4;
  const lit = [];
  for (let y = 0; y < H; y++) {
    if (y % 3 === 0) x = Math.max(12, Math.min(W - 16, x + Math.round((rnd() - 0.5) * 3)));
    lit.push(x);
  }
  // le chemin principal passe la rivière : une passerelle de planches à cette hauteur
  const croise = (y) => { for (let k = 0; k < P.chemin.length - 1; k++) { const [x0, y0] = P.chemin[k], [x1, y1] = P.chemin[k + 1]; const xx = lit[y]; if (xx >= x0 && xx <= x1) { const t = (xx - x0) / Math.max(1, x1 - x0); return Math.abs(y - (y0 + (y1 - y0) * t)) <= 1.5; } } return false; };
  for (let y = 0; y < H; y++) {
    const x0 = lit[y];
    e.solRect('boue', x0 - 2, y, 1, 1); e.solRect('sable', x0 + larg + 1, y, 1, 1);
    e.solRect('boue', x0 - 1, y, 1, 1); e.solRect('boue', x0 + larg, y, 1, 1);
    if (croise(y)) { e.solRect('planches', x0, y, larg, 1); reserver(x0 - 2, y - 1, larg + 4, 3); continue; }
    e.eau(x0, y, larg, 1); reserver(x0 - 1, y, larg + 2, 1);
  }
  e.semer('flaque', lit[Math.floor(H / 2)] - 3, 2, 3, H - 4, Math.round(H / 6));
  P.lit = lit; P.largeurLit = larg;
}
// Les berges (après les bâtiments du lieu) : les cannes de Provence en touffes.
function berges(e, P) {
  const { H, rnd, lit, largeurLit: larg } = P;
  for (let k = 0; k < Math.round(H / 2.5); k++) {
    const y = 2 + Math.floor(rnd() * (H - 4)), cote = rnd() < 0.5 ? -3 - Math.floor(rnd() * 2) : larg + 2 + Math.floor(rnd() * 2);
    P.poser('cannier', lit[y] + cote, y, {}, 0);
  }
}
