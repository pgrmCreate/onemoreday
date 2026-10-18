// ============ Les morts vus de dessus — corps, vêtements, plaies, mains, têtes (canvas 2D) ============
// Chaque mort a une apparence tirée de son uid (la même chez les deux joueurs) : vêtement (t-shirt, chemise, sweat à
// capuche, veste, blouse d'hôpital ouverte dans le dos, débardeur, pull, gilet de chantier, costume, doudoune), peau
// marbrée, coiffure, sang, déchirures, morsure à l'épaule, une chaussure perdue…
// Le DÉTAIL (tissu, plis, saleté, sang, cheveux mèche à mèche, veines) est peint UNE fois dans de petits sprites
// (torse, tête, corps couché) mis en cache ; à chaque image on ne dessine que ce qui bouge : les jambes, les bras à
// deux segments (coude calculé) et les mains à doigts, le balancement, la tête qui roule, la mâchoire, l'élan.
// Repère du mort : il regarde vers +x, ses épaules sont le long de y ; 1 unité = TS px. L'ombre tombe toujours vers le
// bas-droite du monde (comme celle des objets).
//   dessinerMort(c, x, y, z, t, def)        z = mort interpolé (type, sexe, dir, vitesse, etat, atk, fente, vac, terre,
//                                           touche/tTouche, saisit, _phase, uid)
//   dessinerCadavre(c, cd, t, frais, def)   cd = { uid, type, sexe, x, y, dir } ; frais = ms depuis la mort (ou null)
//   apparenceMort(uid, type, sexe, allure)
import { TS, rng, graine, hex, ellipse, cercle, clamp } from './outils.js';
import { PI, TAU, easeOut, mix, mul, css, choisir, entre, sprite, poser, dessinerOmbre, tache, volume, crasse, points, contourTorse, coude } from './corps.js';


// ---------- Couleurs de base ----------
const SANG_SEC = [58, 10, 9], SANG = [104, 14, 14], SANG_VIF = [150, 24, 22], CHAIR = [128, 42, 40];
const CUIR = [34, 28, 24], NOIR = [16, 14, 12];

// ---------- Apparence ----------
// Garde-robe selon le type : le coureur est en tenue de sport, la hurleuse sort souvent de l'hôpital, le colosse du chantier.
const GARDE_ROBE = {
  errant: ['tshirt', 'chemise', 'sweat', 'veste', 'pull', 'blouse', 'costume', 'doudoune', 'debardeur', 'gilet_jaune', 'chemise', 'tshirt', 'veste'],
  coureur: ['tshirt', 'debardeur', 'sweat', 'tshirt', 'coupe_vent', 'sweat', 'maillot'],
  rampant: ['tshirt', 'chemise', 'pull', 'veste', 'blouse', 'sweat'],
  hurleur: ['blouse', 'blouse', 'chemise', 'pull', 'robe', 'tshirt', 'blouse'],
  colosse: ['tshirt', 'debardeur', 'gilet_jaune', 'veste', 'tshirt', 'doudoune'],
};
const COUL_SPECIALES = {
  blouse: [[150, 178, 186], [170, 190, 170], [190, 196, 200], [140, 162, 190]],
  gilet_jaune: [[196, 186, 40], [214, 120, 30]],
  costume: [[34, 36, 42], [44, 42, 40], [30, 34, 48]],
  maillot: [[170, 30, 34], [30, 80, 150], [230, 230, 226], [30, 120, 70]],
  coupe_vent: [[40, 110, 150], [150, 40, 50], [60, 60, 66], [200, 120, 30]],
  robe: [[110, 40, 60], [60, 70, 110], [140, 120, 90], [40, 40, 44]],
};
const MANCHES = { tshirt: 'courtes', chemise: 'longues', sweat: 'longues', veste: 'longues', pull: 'longues', blouse: 'courtes', costume: 'longues',
  doudoune: 'longues', debardeur: 'aucune', gilet_jaune: 'courtes', coupe_vent: 'longues', maillot: 'courtes', robe: 'aucune' };
const apparences = new Map();
export function apparenceMort(uid, type, sexe, allure) {
  const cle = uid + ':' + type;
  let a = apparences.get(cle);
  if (a) return a;
  const r = rng(graine(cle));
  const A = allure || {};
  const f = sexe === 'f';
  // peau : gris-vert de la mort, marbrée de violet, parfois jaunie
  const base = hex(choisir(r, A.peau || ['#7d8070', '#86836f', '#737a6c']));
  const peau = mix(base, choisir(r, [[120, 96, 120], [150, 140, 90], [96, 110, 96], base]), entre(r, 0.05, 0.25));
  let vet = choisir(r, GARDE_ROBE[type] || GARDE_ROBE.errant);
  if (vet === 'robe' && !f) vet = 'chemise';
  const coulVet = COUL_SPECIALES[vet] ? choisir(r, COUL_SPECIALES[vet]) : mul(hex(choisir(r, A.vetements || ['#3b3128', '#2e3136', '#463a36'])), entre(r, 0.85, 1.35));
  const sale = entre(r, 0.25, 0.75);
  a = {
    type, sexe, seed: graine(cle),
    peau, peauSombre: mul(peau, 0.62), peauClair: mix(peau, [205, 205, 190], 0.18),
    vet, coulVet: mix(coulVet, [70, 60, 48], sale * 0.35),                 // la crasse ternit tout
    manches: MANCHES[vet] || 'longues',
    pantalon: choisir(r, [[40, 46, 62], [34, 34, 38], [58, 52, 40], [28, 30, 34], [62, 66, 74], [70, 58, 46]]),
    jupe: f && vet !== 'robe' && r() < 0.18,
    chaussures: choisir(r, [[22, 18, 14], [40, 36, 34], [190, 186, 180], [60, 30, 24], [28, 30, 40]]),
    pieds: r() < 0.14 ? (r() < 0.6 ? 'un_nu' : 'nus') : 'chaussures',
    cheveux: choisir(r, [[30, 22, 16], [58, 40, 24], [92, 80, 70], [40, 34, 30], [122, 106, 86], [150, 140, 128], [96, 52, 30], [70, 60, 50]]),
    coiffure: f ? choisir(r, ['long', 'long', 'queue', 'chignon', 'court', 'long']) : choisir(r, ['court', 'court', 'rase', 'chauve', 'degarni', 'court', 'long']),
    sang: entre(r, 0.25, 1), sale,
    morsure: r() < 0.45 ? (r() < 0.5 ? -1 : 1) : 0,                        // un morceau d'épaule arraché
    dechirures: Math.floor(entre(r, 0, 3.6)),
    plaieTete: r() < 0.3,
    oreille: r() < 0.1 ? (r() < 0.5 ? -1 : 1) : 0,                          // une oreille arrachée
    brasMort: r() < 0.16 ? (r() < 0.5 ? -1 : 1) : 0,                        // un bras ballant (cassé)
    tete: (r() - 0.5) * 0.5,                                                 // tête penchée (rad)
    boite: r() < 0.5 ? 1 : -1,                                               // la jambe qui traîne
    couche: r() < 0.55 ? 'dos' : 'ventre',                                   // comment il est tombé
    pose: Math.floor(r() * 4),
    taille: (A.taille || 1) * entre(r, 0.94, 1.05), carrure: (A.carrure || 1) * entre(r, 0.95, 1.06) * (f ? 0.94 : 1),
    bouche: !!A.bouche, ph0: r() * TAU, tic: entre(r, 0.7, 1.4),
  };
  apparences.set(cle, a);
  if (apparences.size > 900) apparences.delete(apparences.keys().next().value);
  return a;
}


function peindreTorse(c, ap) {
  const car = ap.carrure, r = rng(ap.seed ^ 0x51ed);
  const ventre = ap.type === 'colosse' ? 4.5 * car : ap.vet === 'doudoune' ? 1.4 : 0;
  const forme = () => contourTorse(c, car, ventre);
  const SW = 12.3 * car;
  const V = ap.coulVet;
  // 1. le vêtement (ou la peau là où il n'y en a pas)
  const peauNue = ap.vet === 'debardeur' || ap.vet === 'robe';
  c.fillStyle = css(peauNue ? ap.peau : V); forme(); c.fill();
  c.save(); forme(); c.clip();
  if (peauNue) {   // débardeur, robe à bretelles : le tissu au milieu, les épaules nues
    c.fillStyle = css(V); c.beginPath(); c.ellipse(-0.4, 0, 8.4 * car, SW * 0.6, 0, 0, TAU); c.fill();
    c.strokeStyle = css(mul(V, 0.85)); c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-6, -4.6 * car); c.lineTo(5, -4.2 * car); c.moveTo(-6, 4.6 * car); c.lineTo(5, 4.2 * car); c.stroke();
    // la peau des épaules : marbrures
    for (let k = 0; k < 7; k++) { c.fillStyle = css(choisir(r, [ap.peauSombre, [110, 90, 120], ap.peauClair]), 0.25); ellipse(c, entre(r, -5, 4), (r() < 0.5 ? -1 : 1) * entre(r, 7, SW), entre(r, 1, 2.6), entre(r, 0.8, 2)); c.fill(); }
  }
  if (ap.vet === 'blouse') {
    // la blouse d'hôpital : petits losanges imprimés, ouverte dans le dos (la peau grise, les nœuds défaits)
    c.fillStyle = css(mul(V, 0.82), 0.5);
    c.beginPath();
    for (let y = -SW; y < SW; y += 2.6) for (let x = -7; x < 7; x += 2.6) { c.moveTo(x, y - 0.6); c.lineTo(x + 0.6, y); c.lineTo(x, y + 0.6); c.lineTo(x - 0.6, y); c.closePath(); }
    c.fill();
    c.fillStyle = css(ap.peau); c.beginPath(); c.moveTo(-7.5 * car, -3.2); c.quadraticCurveTo(-3.2 * car, -1.4, -2.2 * car, 0); c.quadraticCurveTo(-3.2 * car, 1.6, -7.5 * car, 3.4); c.closePath(); c.fill();
    c.fillStyle = css(ap.peauSombre, 0.5); c.fillRect(-7.5 * car, -0.4, 4.5 * car, 0.8);   // la colonne
    c.strokeStyle = css(mul(V, 0.75)); c.lineWidth = 0.7;
    for (const y of [-2.6, 2.6]) { c.beginPath(); c.moveTo(-5.6 * car, y); c.lineTo(-7.2 * car, y * 1.4); c.stroke(); }
  }
  if (ap.vet === 'gilet_jaune') {
    // gilet de chantier sur un t-shirt sombre : bandes réfléchissantes qui passent sur les épaules
    c.fillStyle = css([44, 44, 46]); c.beginPath(); c.ellipse(1.5 * car, 0, 4 * car, 3.2 * car, 0, 0, TAU); c.fill();
    c.fillStyle = css([170, 172, 168], 0.9);
    for (const s of [-1, 1]) { c.fillRect(-7 * car, s * 7.3 * car - 1, 13 * car, 2); }
    c.fillStyle = css([210, 212, 208], 0.5); for (const s of [-1, 1]) c.fillRect(-7 * car, s * 7.3 * car - 0.4, 13 * car, 0.5);
  }
  if (ap.vet === 'pull') {     // mailles : rangs serrés
    c.strokeStyle = css(mul(V, 0.78), 0.45); c.lineWidth = 0.45;
    c.beginPath(); for (let x = -7; x < 7; x += 1.15) { c.moveTo(x, -SW); c.lineTo(x + 0.4, SW); } c.stroke();
  }
  if (ap.vet === 'doudoune') { // doudoune : boudins matelassés
    for (let x = -6.5 * car; x < 7 * car; x += 3 * car) {
      const g = c.createLinearGradient(x, 0, x + 3 * car, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.3)'); g.addColorStop(0.45, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
      c.fillStyle = g; c.fillRect(x, -SW - 1, 3 * car, 2 * SW + 2);
    }
  }
  if (ap.vet === 'maillot' || ap.vet === 'coupe_vent') {   // tenue de sport : une bande claire sur les épaules
    c.fillStyle = css(mix(V, [235, 235, 230], 0.6), 0.7);
    for (const s of [-1, 1]) c.fillRect(-6 * car, s * 9.5 * car - 0.8, 11 * car, 1.6);
  }
  // 2. plis du tissu : du cou vers les épaules
  for (const [coul, n, lw] of [['rgba(0,0,0,0.22)', 6, 0.7], ['rgba(255,245,230,0.10)', 3, 0.55]]) {
    c.strokeStyle = coul; c.lineWidth = lw; c.beginPath();
    for (let k = 0; k < n; k++) { const s = r() < 0.5 ? -1 : 1, y0 = s * entre(r, 2.5, 5), y1 = s * entre(r, 7, SW - 1); c.moveTo(entre(r, -3, 2), y0); c.quadraticCurveTo(entre(r, -5, 4), (y0 + y1) / 2, entre(r, -4, 3), y1); }
    c.stroke();
  }
  // couture de l'épaule et creux de la colonne
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 0.6;
  c.beginPath(); c.moveTo(-0.8, -4); c.quadraticCurveTo(-1.2, -SW * 0.7, -0.6, -SW); c.moveTo(-0.8, 4); c.quadraticCurveTo(-1.2, SW * 0.7, -0.6, SW); c.stroke();
  if (ap.vet !== 'blouse') { c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-7 * car, 0); c.lineTo(-3.4 * car, 0); c.stroke(); }
  // 3. volume (haut des épaules éclairé, bords dans l'ombre)
  c.restore();
  volume(c, forme, -0.6, 0, SW * 1.02, 0.14, 0.55);
  // 4. le col : chaque vêtement le sien (autour du cou, sous la tête)
  c.save(); forme(); c.clip();
  switch (ap.vet) {
    case 'chemise': case 'costume': {
      const col = ap.vet === 'costume' ? [196, 196, 190] : mul(V, 1.12);
      c.fillStyle = css(col); c.beginPath(); c.moveTo(-3.2, -4.4); c.lineTo(4.6, -3.2); c.lineTo(3, -0.6); c.lineTo(-3.6, -2.4); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-3.2, 4.4); c.lineTo(4.6, 3.2); c.lineTo(3, 0.6); c.lineTo(-3.6, 2.4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.5; c.stroke();
      if (ap.vet === 'costume') { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(4.8, -4.8); c.lineTo(6.2, -1.4); c.moveTo(4.8, 4.8); c.lineTo(6.2, 1.4); c.stroke(); }
      break;
    }
    case 'sweat': {
      // la capuche tombée dans le dos : un bourrelet, l'ouverture sombre, les cordons devant
      c.fillStyle = css(mul(V, 0.92)); ellipse(c, -6.2 * car, 0, 4.2 * car, 5.4 * car); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.45)'; ellipse(c, -5.6 * car, 0, 2.4 * car, 3.6 * car); c.fill();
      c.strokeStyle = css(mul(V, 0.7)); c.lineWidth = 0.9; c.beginPath(); c.ellipse(-6.2 * car, 0, 4.2 * car, 5.4 * car, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(230,226,214,0.8)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(4.8, -1.6); c.lineTo(6.6, -1.9); c.moveTo(4.8, 1.6); c.lineTo(6.6, 1.9); c.stroke();
      break;
    }
    case 'veste': case 'coupe_vent': case 'doudoune': {
      c.strokeStyle = css(mul(V, 0.65)); c.lineWidth = 2.2; c.beginPath(); c.ellipse(0.6, 0, 4.6, 6, 0, 0, TAU); c.stroke();      // col montant
      c.strokeStyle = 'rgba(200,196,186,0.55)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(5, 0); c.lineTo(7 * car, 0); c.stroke(); // fermeture
      if (ap.vet === 'veste') { c.fillStyle = 'rgba(255,255,255,0.07)'; ellipse(c, -1.5, -6.5 * car, 3, 2.2); c.fill(); }          // le cuir luit un peu
      break;
    }
    default: {
      c.strokeStyle = css(mul(V, 0.72)); c.lineWidth = 1.1; c.beginPath(); c.ellipse(0.8, 0, 4.4, 5.2, 0, 0, TAU); c.stroke();      // col rond
    }
  }
  // 5. la crasse
  crasse(c, r, -8, -SW, 8, SW, 70, [44, 34, 22], 0.35 * (0.4 + ap.sale));
  for (let k = 0; k < 3; k++) tache(c, r, entre(r, -6, 5), entre(r, -SW, SW), entre(r, 2, 4), [60, 48, 30], 0.18 * ap.sale, 4);
  // 6. les déchirures : la peau grise apparaît, bords effilochés, une entaille dessous
  for (let k = 0; k < ap.dechirures; k++) {
    const x = entre(r, -5, 4), y = (r() < 0.5 ? -1 : 1) * entre(r, 3, SW - 2), w = entre(r, 1.6, 3.4), h = entre(r, 1, 2.2), a = entre(r, -0.6, 0.6);
    c.fillStyle = css(ap.peauSombre); c.beginPath();
    for (let q = 0; q < 9; q++) { const t = q / 9 * TAU, rr = 1 + (r() - 0.5) * 0.55; c.lineTo(x + Math.cos(t + a) * w * rr, y + Math.sin(t + a) * h * rr); }
    c.closePath(); c.fill();
    c.fillStyle = css(ap.peau, 0.85); ellipse(c, x + 0.2, y + 0.1, w * 0.62, h * 0.55, a); c.fill();
    c.strokeStyle = css(SANG, 0.8); c.lineWidth = 0.55; c.beginPath(); c.moveTo(x - w * 0.5, y); c.lineTo(x + w * 0.45, y + h * 0.2); c.stroke();
    c.strokeStyle = css(mul(V, 0.7), 0.9); c.lineWidth = 0.4;
    for (let q = 0; q < 6; q++) { const t = r() * TAU; c.beginPath(); c.moveTo(x + Math.cos(t) * w, y + Math.sin(t) * h); c.lineTo(x + Math.cos(t) * w * 1.25, y + Math.sin(t) * h * 1.3); c.stroke(); }
  }
  // 7. le sang : sur le devant (il a coulé de la bouche, de la gorge), en traînées sur une épaule, quelques éclaboussures
  const S = ap.sang;
  tache(c, r, 4.6 * car, entre(r, -4, 4), 2.2 + 1.8 * S, SANG_SEC, 0.6, 7);
  tache(c, r, 4.4 * car, entre(r, -2, 2), 1.1 + 1.2 * S, SANG, 0.5, 4);
  tache(c, r, entre(r, -3, 2), (r() < 0.5 ? -1 : 1) * entre(r, 5, 9), 1.6 + 2 * S, SANG_SEC, 0.45, 5);
  if (S > 0.45) {
    const s = r() < 0.5 ? -1 : 1;
    c.strokeStyle = css(SANG_SEC, 0.6); c.lineWidth = 1.6 + S;
    c.beginPath(); c.moveTo(4, s * 3); c.quadraticCurveTo(0, s * entre(r, 6, 9), -5 * car, s * entre(r, 7, 10)); c.stroke();
  }
  { const a = [], b = []; for (let k = 0; k < 8 + S * 14; k++) (r() < 0.5 ? a : b).push([entre(r, -6, 7), entre(r, -SW, SW), entre(r, 0.25, 0.8)]); points(c, a, css(SANG, 0.65)); points(c, b, css(SANG_SEC, 0.7)); }
  // quelques reflets de sang frais
  for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(190,60,60,0.35)'; cercle(c, entre(r, 3, 6), entre(r, -3, 3), entre(r, 0.25, 0.6)); c.fill(); }
  // 8. la morsure : un morceau d'épaule arraché, la chair à vif
  if (ap.morsure) {
    const y = ap.morsure * (SW - 3.2), x = entre(r, -2.5, 1.5);
    tache(c, r, x, y, 3.2, SANG_SEC, 0.8, 6);
    c.fillStyle = css(mul(CHAIR, 0.8)); c.beginPath();
    for (let q = 0; q < 10; q++) { const t = q / 10 * TAU, rr = 1 + (r() - 0.5) * 0.6; c.lineTo(x + Math.cos(t) * 2.1 * rr, y + Math.sin(t) * 1.6 * rr); }
    c.closePath(); c.fill();
    c.fillStyle = css([150, 62, 58], 0.55); ellipse(c, x - 0.3, y - 0.2 * ap.morsure, 1, 0.6); c.fill();
    c.fillStyle = 'rgba(40,6,6,0.8)'; for (let q = 0; q < 4; q++) { cercle(c, x + entre(r, -2, 2), y + entre(r, -1.5, 1.5), 0.45); c.fill(); }   // les dents
  }
  c.restore();
  // 9. le contour : il se détache du sol
  c.strokeStyle = 'rgba(8,6,4,0.55)'; c.lineWidth = 0.75; forme(); c.stroke();
}
function spriteTorse(ap) {
  const car = ap.carrure, hx = 12 * car + 3, hy = 13.5 * car + 2;
  return sprite(`t:${ap.seed}:${ap.type}`, hx, hy, (c) => peindreTorse(c, ap));
}

// ---------- La tête (vue d'en haut) ----------
function contourCrane(c) { c.beginPath(); c.ellipse(0, 0, 6.2, 5.2, 0, 0, TAU); }
function peindreTete(c, ap) {
  const r = rng(ap.seed ^ 0x7e7e), P = ap.peau, H = ap.cheveux;
  // oreilles (sous le crâne)
  for (const s of [-1, 1]) {
    if (ap.oreille === s) { c.fillStyle = css(SANG, 0.9); ellipse(c, 0.6, s * 5, 1.2, 1); c.fill(); continue; }
    c.fillStyle = css(mul(P, 0.86)); ellipse(c, 0.8, s * 5.1, 1.7, 1.15); c.fill();
    c.fillStyle = css(mul(P, 0.6)); ellipse(c, 0.7, s * 5.25, 0.8, 0.5); c.fill();
  }
  // le crâne : peau marbrée, veines
  c.fillStyle = css(P); contourCrane(c); c.fill();
  c.save(); contourCrane(c); c.clip();
  for (let k = 0; k < 6; k++) { c.fillStyle = css(choisir(r, [[110, 86, 116], ap.peauSombre, [150, 150, 100], ap.peauClair]), entre(r, 0.12, 0.3)); ellipse(c, entre(r, -5, 5), entre(r, -4, 4), entre(r, 0.8, 2.4), entre(r, 0.6, 1.8), r() * PI); c.fill(); }
  c.strokeStyle = 'rgba(60,50,80,0.35)'; c.lineWidth = 0.3;
  c.beginPath(); for (let k = 0; k < 4; k++) { let x = entre(r, -4, 3), y = entre(r, -3, 3); c.moveTo(x, y); for (let q = 0; q < 4; q++) { x += entre(r, -1.6, 1.6); y += entre(r, -1.6, 1.6); c.lineTo(x, y); } } c.stroke();
  c.restore();
  // les cheveux, mèche à mèche (de l'arrière du crâne vers la naissance des cheveux)
  const coif = ap.coiffure;
  const front = coif === 'degarni' ? -1.5 : 3.6;     // naissance des cheveux (x) ; dégarni : le dessus est nu
  if (coif !== 'chauve') {
    const masse = () => {
      c.beginPath();
      if (coif === 'degarni') { c.ellipse(-1.2, 0, 5.4, 5.6, 0, PI * 0.42, PI * 1.58); c.ellipse(-0.2, 0, 3.4, 3.4, 0, PI * 1.5, PI * 0.5, true); }
      else { c.moveTo(front, -4.4); c.bezierCurveTo(front + 1.6, -1.6, front + 1.6, 1.6, front, 4.4); c.ellipse(-0.2, 0, 6.4, 5.5, 0, PI * 0.36, PI * 1.64); }
      c.closePath();
    };
    if (coif === 'rase') {
      c.save(); contourCrane(c); c.clip();
      c.fillStyle = css(H, 0.45); c.beginPath(); c.ellipse(-0.6, 0, 5.8, 5, 0, 0, TAU); c.fill();
      { const l = []; for (let k = 0; k < 160; k++) l.push([entre(r, -6, 3.5), entre(r, -5, 5), 0.18]); points(c, l, css(mul(H, 0.8), 0.6)); }
      c.restore();
    } else {
      // masse longue dans le dos (sous la masse du dessus)
      if (coif === 'long') {
        c.fillStyle = css(mul(H, 0.85)); c.beginPath();
        c.moveTo(-1, -5.6); c.bezierCurveTo(-7, -7.6, -12.5, -5, -12.8, 0); c.bezierCurveTo(-12.5, 5, -7, 7.6, -1, 5.6); c.closePath(); c.fill();
        c.strokeStyle = css(mul(H, 0.6), 0.7); c.lineWidth = 0.35;
        c.beginPath(); for (let k = 0; k < 28; k++) { const y = entre(r, -5.5, 5.5); c.moveTo(-2, y * 0.8); c.quadraticCurveTo(-7, y * 1.25 + entre(r, -1, 1), entre(r, -12.5, -9.5), y * entre(r, 0.8, 1.15)); } c.stroke();
      }
      if (coif === 'queue') { c.fillStyle = css(mul(H, 0.9)); ellipse(c, -9.4, 0.6, 3.4, 1.7, 0.1); c.fill(); c.fillStyle = css([40, 30, 40]); cercle(c, -6.6, 0.2, 0.9); c.fill(); }
      c.fillStyle = css(H); masse(); c.fill();
      c.save(); masse(); c.clip();
      // mèches : fines, plus claires et plus sombres, qui suivent la courbe du crâne
      for (const [coul, n, lw] of [[css(mul(H, 0.62), 0.55), 60, 0.36], [css(mix(H, [220, 210, 190], 0.25), 0.35), 45, 0.28], [css(mul(H, 0.45), 0.5), 25, 0.22]]) {
        c.strokeStyle = coul; c.lineWidth = lw; c.beginPath();
        for (let k = 0; k < n; k++) {
          const a = entre(r, -PI, PI), cx = -1.6, cy = 0, l = entre(r, 3, 7);
          c.moveTo(cx + Math.cos(a) * 0.6, cy + Math.sin(a) * 0.6);
          c.quadraticCurveTo(cx + Math.cos(a + 0.3) * l * 0.6, cy + Math.sin(a + 0.3) * l * 0.6, cx + Math.cos(a + 0.15) * l, cy + Math.sin(a + 0.15) * l);
        }
        c.stroke();
      }
      // cheveux collés de sang, en paquets
      for (let k = 0; k < 3; k++) tache(c, r, entre(r, -5, 2), entre(r, -4, 4), entre(r, 0.8, 1.8), [40, 10, 8], 0.5, 3);
      c.restore();
      if (coif === 'chignon') { c.fillStyle = css(mul(H, 0.95)); cercle(c, -4.6, 0, 2.6); c.fill(); c.strokeStyle = css(mul(H, 0.6)); c.lineWidth = 0.4; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(-4.6, 0, entre(r, 0.8, 2.3), r() * TAU, r() * TAU + 2); c.stroke(); } }
    }
  } else {
    // crâne nu : lésions
    for (let k = 0; k < 3; k++) { c.fillStyle = css([96, 50, 50], 0.4); ellipse(c, entre(r, -4, 2), entre(r, -3, 3), entre(r, 0.5, 1.2), entre(r, 0.4, 1)); c.fill(); }
  }
  // le visage, au bord avant : arcade, orbites, nez qui dépasse
  c.fillStyle = css(mul(P, 0.55), 0.8); ellipse(c, 4.7, -2.2, 1.1, 0.9); c.fill(); ellipse(c, 4.7, 2.2, 1.1, 0.9); c.fill();
  c.fillStyle = 'rgba(214,210,182,0.7)'; cercle(c, 5.2, -2.2, 0.42); c.fill(); cercle(c, 5.2, 2.2, 0.42); c.fill();     // yeux laiteux
  c.fillStyle = css(mul(P, 0.92)); c.beginPath(); c.moveTo(5.4, -1); c.quadraticCurveTo(7.4, -0.5, 7.4, 0); c.quadraticCurveTo(7.4, 0.5, 5.4, 1); c.closePath(); c.fill();
  c.fillStyle = 'rgba(30,10,10,0.6)'; cercle(c, 6.6, -0.45, 0.28); c.fill(); cercle(c, 6.6, 0.45, 0.28); c.fill();
  // du sang sur les joues (il a mangé) : sur les côtés du visage, pas au milieu du front
  for (const s2 of [-1, 1]) if (r() < 0.6 * ap.sang + 0.2) { c.fillStyle = css(SANG_SEC, 0.5); ellipse(c, 4.6, s2 * 3.6, 1.1, 0.7, 0.4 * s2); c.fill(); }
  // une plaie au crâne
  if (ap.plaieTete) {
    const x = entre(r, -3, 1), y = entre(r, -3, 3), a = r() * PI;
    c.strokeStyle = css(SANG_SEC, 0.95); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - Math.cos(a) * 2.2, y - Math.sin(a) * 2.2); c.lineTo(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2); c.stroke();
    c.strokeStyle = css(CHAIR); c.lineWidth = 0.7; c.stroke();
    if (r() < 0.5) { c.fillStyle = 'rgba(220,210,190,0.75)'; cercle(c, x, y, 0.45); c.fill(); }   // l'os
  }
  volume(c, () => { c.beginPath(); c.ellipse(0, 0, 6.6, 5.6, 0, 0, TAU); }, -0.8, -0.2, 7, 0.16, 0.55);
  c.strokeStyle = 'rgba(8,6,4,0.5)'; c.lineWidth = 0.6; contourCrane(c); c.stroke();
}
function spriteTete(ap) { return sprite(`h:${ap.seed}:${ap.type}`, 14, 8.5, (c) => peindreTete(c, ap)); }

// La mâchoire qui s'ouvre (attaque), la bouche béante (le hurlement : il renverse la tête, on voit son visage).
function bouche(c, ap, ouvre, hurle) {
  if (hurle) {
    // tête renversée : le visage vers le ciel, la bouche immense, les yeux blancs
    c.fillStyle = css(mul(ap.peau, 0.95)); ellipse(c, 2.4, 0, 4.3, 4.4); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.5)'; ellipse(c, 0.6, -2.1, 1.2, 1); c.fill(); ellipse(c, 0.6, 2.1, 1.2, 1); c.fill();
    c.fillStyle = 'rgba(226,222,196,0.95)'; cercle(c, 0.6, -2.1, 0.6); c.fill(); cercle(c, 0.6, 2.1, 0.6); c.fill();
    c.fillStyle = '#140404'; ellipse(c, 4, 0, 2.2 * ouvre + 0.6, 2.4 * ouvre + 0.6); c.fill();
    c.fillStyle = 'rgba(210,200,170,0.85)'; for (let k = -2; k <= 2; k++) { cercle(c, 4 - 1.9 * ouvre + Math.abs(k) * 0.25, k * 0.7, 0.32); c.fill(); }
    return;
  }
  if (ouvre < 0.05) return;
  // vue d'en haut, la mâchoire qui tombe fait saillir le menton sous le nez : une fente sombre, des dents
  c.fillStyle = css(mul(ap.peau, 0.8)); ellipse(c, 6.6 + ouvre * 0.9, 0, 1 + ouvre * 0.5, 2.4); c.fill();
  c.fillStyle = 'rgba(14,4,4,0.9)'; ellipse(c, 7 + ouvre * 0.5, 0, 0.35 + ouvre * 0.45, 1.5 + ouvre * 0.4); c.fill();
  c.fillStyle = 'rgba(214,204,176,0.75)'; cercle(c, 7.2 + ouvre * 0.4, -0.7, 0.24); c.fill(); cercle(c, 7.2 + ouvre * 0.4, 0.7, 0.24); c.fill();
}

// ---------- Bras à deux segments, mains à doigts ----------
// Épaule S → main H : le coude se plie vers l'extérieur (côté s = ±1). La manche couvre le bras, ou pas.
function bras(c, ap, sx, sy, hx, hy, s, ep, griffe, casse) {
  // coude calculé, bras raccourci quand il pend (sinon le coude saille et l'épaule paraît remontée)
  let ex, ey;
  [ex, ey, hx, hy] = coude(sx, sy, hx, hy, 9.6 * ap.carrure, 9.2 * ap.carrure, s, casse ? 0.2 : 0.75);
  const K = couleurs(ap);
  // contour sombre puis remplissage (un trait arrondi de chaque segment) ; la manche courte s'arrête avant le coude
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = 'rgba(8,6,4,0.55)';
  c.lineWidth = ep + 1.3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = K.bas; c.lineWidth = ep * 0.86; c.beginPath(); c.moveTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  const mx = ap.manches === 'courtes' ? sx + (ex - sx) * 0.62 : ex, my = ap.manches === 'courtes' ? sy + (ey - sy) * 0.62 : ey;
  if (ap.manches === 'courtes') { c.strokeStyle = K.peau; c.lineWidth = ep * 0.9; c.beginPath(); c.moveTo(mx, my); c.lineTo(ex, ey); c.stroke(); }
  c.strokeStyle = K.haut; c.lineWidth = ep; c.beginPath(); c.moveTo(sx, sy); c.lineTo(mx, my); c.stroke();
  main(c, ap, hx, hy, Math.atan2(hy - ey, hx - ex), s, griffe);
}
// Les couleurs d'un mort, en chaînes prêtes pour le canvas (rien n'est recalculé à chaque image).
function couleurs(ap) {
  if (ap._K) return ap._K;
  const V = ap.coulVet, P = ap.peau, m = ap.manches;
  ap._K = { haut: css(mul(m === 'aucune' ? P : V, 0.95)), bas: css(mul(m === 'longues' ? V : P, m === 'longues' ? 0.88 : 0.95)), peau: css(P), jambe: css(ap.jupe ? P : ap.pantalon) };
  return ap._K;
}
// La main : paume, quatre doigts écartés en griffe (ou repliés), le pouce vers l'intérieur, ongles noirs.
function main(c, ap, x, y, a, s, griffe) {
  const g = Math.round(clamp(griffe, 0, 1) * 3);
  const H = sprite(`m:${ap.seed}:${s}:${g}`, 6.5, 5, (cc) => peindreMain(cc, ap, s, g / 3));
  c.save(); c.translate(x, y); c.rotate(a); c.scale(ap.carrure, ap.carrure);
  if (H) poser(c, H); else { c.fillStyle = couleurs(ap).peau; ellipse(c, 0.6, 0, 2.4, 1.9); c.fill(); }
  c.restore();
}
function peindreMain(c, ap, s, griffe) {
  const P = mul(ap.peau, 0.88);
  c.save();
  // quatre doigts en éventail (repliés quand il agrippe), le pouce vers l'intérieur
  const ouv = 0.5 - griffe * 0.3, L = 3.7 - griffe * 1.5;
  const doigts = () => {
    c.beginPath();
    for (let q = 0; q < 4; q++) {
      const t = (q - 1.5) * ouv, l = L * (q === 0 || q === 3 ? 0.82 : 1);
      const bx = 1.2, by = (q - 1.5) * 0.85;
      const ex = bx + Math.cos(t) * l, ey = by + Math.sin(t) * l;
      c.moveTo(bx, by); c.quadraticCurveTo(bx + Math.cos(t) * l * 0.65, by + Math.sin(t) * l * 0.65 - griffe * t, ex - griffe * 0.8, ey - griffe * t * 1.2);
    }
    c.moveTo(-0.2, -s * 1.1); c.quadraticCurveTo(0.9, -s * 2.6, 2.1, -s * 2.7);
  };
  c.lineCap = 'round';
  c.strokeStyle = 'rgba(8,6,4,0.7)'; c.lineWidth = 1.45; doigts(); c.stroke();
  c.strokeStyle = css(P); c.lineWidth = 0.85; doigts(); c.stroke();
  c.fillStyle = 'rgba(8,6,4,0.6)'; ellipse(c, 0.2, 0, 2.05, 1.85); c.fill();
  c.fillStyle = css(P); ellipse(c, 0.2, 0, 1.65, 1.5); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; ellipse(c, 0.6, 0.3 * s, 0.9, 0.7); c.fill();
  // le bout des doigts : sang séché, ongles noirs
  for (let q = 0; q < 4; q++) {
    const t = (q - 1.5) * ouv, l = L * (q === 0 || q === 3 ? 0.82 : 1), bx = 1.2, by = (q - 1.5) * 0.85;
    const ex = bx + Math.cos(t) * l - griffe * 0.8, ey = by + Math.sin(t) * l - griffe * t * 1.2;
    c.fillStyle = css(SANG_SEC, 0.6); cercle(c, ex - Math.cos(t) * 0.8, ey - Math.sin(t) * 0.8, 0.5); c.fill();
    c.fillStyle = 'rgba(16,10,8,0.95)'; cercle(c, ex, ey, 0.34); c.fill();
  }
  c.restore();
}

// ---------- Jambes et pieds ----------
function jambes(c, ap, pas, traine, car, ecartPieds = 5.4) {
  const J = ap.pantalon;
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const s of [-1, 1]) {
    const avance = s < 0 ? pas : -pas;
    const fx = avance * (ap.boite === s ? 0.55 : 1) + 1.2, fy = s * ecartPieds * car;
    // la jambe
    c.strokeStyle = 'rgba(8,6,4,0.5)'; c.lineWidth = 6.4 * car; c.beginPath(); c.moveTo(-1.5, s * 4.3 * car); c.lineTo(fx - 1, fy); c.stroke();
    c.strokeStyle = couleurs(ap).jambe; c.lineWidth = 5.4 * car; c.stroke();
    // le pied : chaussure (semelle claire, lacets) ou pied nu (orteils) — peint une fois
    const nu = ap.pieds === 'nus' || (ap.pieds === 'un_nu' && s > 0);
    const ang = (ap.boite === s ? traine : 0) * s;
    const Pd = sprite(`p:${ap.seed}:${nu ? 1 : 0}`, 6, 3.6, (cc) => peindrePied(cc, ap, nu));
    c.save(); c.translate(fx, fy); c.rotate(ang);
    if (Pd) poser(c, Pd); else { c.fillStyle = css(ap.chaussures); ellipse(c, 0.6, 0, 4.4, 2.3); c.fill(); }
    c.restore();
  }
}
function peindrePied(c, ap, nu) {
  {
    if (nu) {
      c.fillStyle = 'rgba(8,6,4,0.5)'; ellipse(c, 0.6, 0, 4.4, 2.5); c.fill();
      c.fillStyle = css(mul(ap.peau, 0.92)); ellipse(c, 0.4, 0, 3.8, 2.05); c.fill();
      c.fillStyle = css(mul(ap.peau, 0.8)); for (let q = 0; q < 5; q++) { cercle(c, 3.9, (q - 2) * 0.75, 0.45); c.fill(); }
      c.fillStyle = css(SANG_SEC, 0.6); ellipse(c, -1.6, 0.2, 1.2, 1); c.fill();
    } else {
      const C = ap.chaussures;
      c.fillStyle = 'rgba(8,6,4,0.6)'; ellipse(c, 0.8, 0, 4.9, 2.75); c.fill();
      c.fillStyle = css(C); ellipse(c, 0.6, 0, 4.4, 2.3); c.fill();
      c.fillStyle = 'rgba(255,246,230,0.14)'; ellipse(c, 0.2, -0.4, 2.8, 1); c.fill();
      c.strokeStyle = css(mix(C, [200, 196, 186], 0.45), 0.55); c.lineWidth = 0.35; c.beginPath(); for (let q = 0; q < 3; q++) { c.moveTo(0.4 + q * 0.9, -0.7); c.lineTo(0.4 + q * 0.9, 0.7); } c.stroke();
    }
  }
}

// ---------- Le mort, debout ----------
export function dessinerMort(c, x, y, z, t, def) {
  const ap = apparenceMort(z.uid, z.type, z.sexe, def && def.allure);
  const s = ap.taille, car = ap.carrure, dir = z.dir || 0;
  // à terre (il se relèvera), ou qui fait le mort : couché, comme un cadavre
  if (z.terre || z.etat === 'fait_le_mort') {
    dessinerCouche(c, x, y, dir, ap, t, { bouge: !!z.terre, frais: null, flaque: 0.35, s });
    return;
  }
  if (z.type === 'rampant') { dessinerRampant(c, x, y, z, t, ap, s); return; }
  const v = Math.min(1, (z.vitesse || 0) / 1.2), ph = (z._phase || 0) + ap.ph0;
  const coureur = z.type === 'coureur', hurleur = z.type === 'hurleur', colosse = z.type === 'colosse';
  const chasse = z.etat === 'chasse' || z.etat === 'alerte' || !!z.atk;
  const dort = z.etat === 'dort', cogne = z.etat === 'cogne';
  // l'attaque : il arme (bras en arrière, tassé), puis se fend (élan, bras tendus, gueule ouverte)
  let armer = 0, fente = 0;
  if (z.atk) { const p = z.atk.p || 0; if (p < 0.85) armer = easeOut(p / 0.85); else fente = (p - 0.85) / 0.15; }
  if (z.fente != null) { fente = 1 - Math.abs(z.fente - 0.5) * 0.6; armer = 0; }
  const saisit = !!z.saisit;
  const vac = !!z.vac;
  // ombre (vers le bas-droite du monde)
  dessinerOmbre(c, x, y, dir, 15 * car * s, 12 * car * s, s);
  c.save();
  c.translate(x, y); c.rotate(dir); c.scale(s, s);
  // balancement : la démarche traînante, la course penchée, le pas lourd du colosse ; vacille : il titube
  const bal = Math.sin(ph) * (coureur ? 0.8 : colosse ? 2.4 : 1.8) * Math.max(v, 0.15);
  const lean = coureur ? 2.6 * Math.max(v, 0.4) : colosse ? 0.4 : 0.8 + (chasse ? 0.8 : 0);
  const twist = Math.sin(ph) * (colosse ? 0.09 : 0.06) * v;
  const jx = vac ? Math.sin(t / 23 + x) * 2.2 : 0, jy = vac ? Math.cos(t / 31 + y) * 1.6 : 0;
  c.translate(fente * 8 - armer * 3 + jx, bal * 0.5 + jy);
  // jambes
  const pas = Math.sin(ph) * (coureur ? 8.5 : colosse ? 6 : 5) * v;
  jambes(c, ap, pas, 0.5 + 0.25 * Math.sin(ph), car, colosse ? 6.2 : 5.4);
  // bras : où sont les mains ?
  const SWb = 12.3 * car - 1.8;
  const tw = Math.sin(t / 150 * ap.tic + ap.ph0) * 1.6;
  let gx, gy, dx, dy, griffe = 0.15;
  if (saisit) { gx = 17; gy = -4.5 + tw * 0.3; dx = 17; dy = 4.5 - tw * 0.3; griffe = 0.9; }
  else if (armer > 0) { gx = 6 - armer * 10; gy = -SWb - 4 - armer * 3; dx = 6 - armer * 10; dy = SWb + 4 + armer * 3; griffe = 0.4; }
  else if (fente > 0) { gx = 16 + fente * 6; gy = -7; dx = 16 + fente * 6; dy = 7; griffe = 0.05; }
  else if (cogne) { const k = Math.max(0, Math.sin(t / 170)); gx = 13 + k * 5; gy = -6; dx = 13 + Math.max(0, Math.sin(t / 170 + 1.6)) * 5; dy = 6; griffe = 0.85; }
  else if (coureur && v > 0.5) { gx = -2 + Math.sin(ph + PI) * 9; gy = -SWb - 2.5; dx = -2 + Math.sin(ph) * 9; dy = SWb + 2.5; griffe = 0.5; }
  else if (dort) { gx = 3; gy = -SWb - 1; dx = 3.4; dy = SWb + 1; griffe = 0.5; }
  else if (chasse) { gx = 16 + tw; gy = -7.5 - tw * 0.4; dx = 16 - tw; dy = 7.5 - tw * 0.4; griffe = 0.1; }
  else {
    // au repos (il erre, il attend) : les bras pendent le long du corps, un peu en avant, et ballottent au pas ;
    // certains gardent une main à demi levée
    const p = Math.sin(ph) * 2.2 * v;
    gx = 4 + p + tw * 0.3; gy = -SWb - 1.6; dx = 4 - p - tw * 0.3; dy = SWb + 1.6; griffe = 0.45;
    if (ap.pose === 1) { gx = 10 + tw * 0.5; gy = -8.5; }
  }
  if (vac) { gx = 4 + Math.sin(t / 35) * 7; gy = -SWb - 4; dx = 2 - Math.sin(t / 29) * 7; dy = SWb + 4; }
  const casse = ap.brasMort;
  if (casse < 0 && !z.atk && !saisit) { gx = -1 + Math.sin(ph) * 1.5; gy = -SWb - 3; }
  if (casse > 0 && !z.atk && !saisit) { dx = -1 - Math.sin(ph) * 1.5; dy = SWb + 3; }
  // bras : leur racine passe sous l'épaule (vu de dessus, le haut du bras sort de dessous la carrure)
  const ep = 5.1 * car;
  c.save(); c.rotate(twist);
  bras(c, ap, 0.4, -SWb, gx + lean, gy, -1, ep, griffe, casse < 0 && !z.atk && !saisit);
  bras(c, ap, 0.4, SWb, dx + lean, dy, 1, ep, griffe, casse > 0 && !z.atk && !saisit);
  c.restore();
  // torse
  c.save(); c.translate(lean * 0.4, 0); c.rotate(twist);
  const T = spriteTorse(ap);
  if (T) { poser(c, T); } else { c.fillStyle = css(ap.coulVet); contourTorse(c, car, 0); c.fill(); }
  c.restore();
  // tête : elle roule, penche, s'avance quand il a faim ; le hurleur la renverse pour hurler
  const hurle = hurleur && z.etat === 'chasse' && Math.sin(t / 420 + ap.ph0) > 0.35 && !z.atk;
  const hx = 1 + lean + (coureur ? 1.6 : 0) + (chasse ? 0.6 : 0) + fente * 1.5 - armer * 1.2 + (dort ? 2 : 0);
  const hy = bal * 0.35;
  const roule = ap.tete + Math.sin(ph * 0.5 + ap.ph0) * 0.12 * (1 - v * 0.5) + (vac ? Math.sin(t / 40) * 0.4 : 0);
  c.save(); c.translate(hx, hy); c.rotate(roule);
  if (colosse) c.scale(1.08, 1.08);
  if (dort) c.scale(0.94, 0.94);              // tête tombée sur la poitrine : on en voit moins
  const Hs = spriteTete(ap);
  if (Hs) { poser(c, Hs); } else { c.fillStyle = css(ap.peau); contourCrane(c); c.fill(); }
  const ouvre = Math.max(fente, saisit ? 0.8 : 0, chasse && Math.sin(t / 260 + ap.ph0 * 3) > 0.6 ? 0.5 : 0, armer * 0.5);
  bouche(c, ap, hurle ? 1 : ouvre, hurle);
  c.restore();
  // l'éclair quand il encaisse : le corps blanchit un instant
  const tT = z.tTouche;
  if (tT && t - tT < 140) {
    const k = 1 - (t - tT) / 140;
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * k;
    if (T) poser(c, T);
    c.translate(hx, hy); c.rotate(roule); if (Hs) poser(c, Hs);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
  c.restore();
}

// ---------- Le rampant : un buste qui se traîne sur les coudes ----------
function peindreRampant(c, ap) {
  const r = rng(ap.seed ^ 0x9a9a), car = ap.carrure;
  // traînée de sang et ce qui pend derrière lui
  // la traînée qu'il laisse : du sang frotté, plus clair au bout
  const g = c.createLinearGradient(-8, 0, -23, 0); g.addColorStop(0, 'rgba(58,10,9,0.7)'); g.addColorStop(1, 'rgba(58,10,9,0)');
  c.fillStyle = g; ellipse(c, -15, 0, 9, 4.6); c.fill();
  // ce qui pend : deux boucles sombres et luisantes, la colonne qui dépasse
  for (let k = 0; k < 2; k++) {
    c.beginPath(); c.moveTo(-9, entre(r, -2.5, 2.5)); c.bezierCurveTo(-12, entre(r, -6, 6), -15, entre(r, -5, 5), entre(r, -19, -16), entre(r, -3, 3));
    c.strokeStyle = 'rgba(40,8,10,0.9)'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = css([116, 48, 54]); c.lineWidth = 1.3; c.stroke();
    c.strokeStyle = 'rgba(220,160,160,0.25)'; c.lineWidth = 0.4; c.stroke();
  }
  c.fillStyle = 'rgba(200,188,166,0.8)'; for (let k = 0; k < 3; k++) { ellipse(c, -9.6 - k * 1.5, 0, 0.7, 0.95); c.fill(); }
  // le dos (couché sur le ventre)
  const forme = () => { c.beginPath(); c.ellipse(-1.5, 0, 9.5 * car, 11.2 * car, 0, 0, TAU); };
  c.fillStyle = css(ap.coulVet); forme(); c.fill();
  c.save(); forme(); c.clip();
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 0.65; c.beginPath(); for (let k = 0; k < 8; k++) { c.moveTo(entre(r, -9, 6), entre(r, -10, 10)); c.lineTo(entre(r, -9, 6), entre(r, -10, 10)); } c.stroke();
  crasse(c, r, -10, -11, 8, 11, 80, [44, 34, 22], 0.45);
  tache(c, r, -7, 0, 4.4, SANG_SEC, 0.75, 6);
  c.fillStyle = css(mul(CHAIR, 0.7)); ellipse(c, -10.2, 0, 2.2, 4.2); c.fill();   // la taille arrachée
  c.restore();
  volume(c, forme, -1.5, 0, 11.5, 0.12, 0.5);
  c.strokeStyle = 'rgba(8,6,4,0.55)'; c.lineWidth = 0.75; forme(); c.stroke();
}
function dessinerRampant(c, x, y, z, t, ap, s) {
  const dir = z.dir || 0, ph = (z._phase || 0) + ap.ph0;
  let armer = 0, fente = 0;
  if (z.atk) { const p = z.atk.p || 0; if (p < 0.85) armer = easeOut(p / 0.85); else fente = (p - 0.85) / 0.15; }
  if (z.fente != null) { fente = 1 - Math.abs(z.fente - 0.5) * 0.6; armer = 0; }
  dessinerOmbre(c, x, y, dir, 22 * s, 12 * s, s * 0.6);
  c.save(); c.translate(x, y); c.rotate(dir); c.scale(s, s);
  c.translate(fente * 6, 0);
  const R = sprite(`r:${ap.seed}`, 24, 13, (cc) => peindreRampant(cc, ap));
  if (R) poser(c, R); else { c.fillStyle = css(ap.coulVet); ellipse(c, -1.5, 0, 9.5, 11); c.fill(); }
  // les bras qui tirent le corps, chacun son tour
  const tire = Math.sin(ph) * 6;
  bras(c, ap, 2, -8, 17 + tire - armer * 8 + fente * 6, -11, -1, 4.6, 0.75 - fente * 0.6, false);
  bras(c, ap, 2, 8, 17 - tire - armer * 8 + fente * 6, 11, 1, 4.6, 0.75 - fente * 0.6, false);
  // la tête relevée, qui te cherche
  c.save(); c.translate(6 + fente * 1.5, Math.sin(ph) * 0.6); c.rotate(ap.tete * 0.6);
  const H = spriteTete(ap); if (H) poser(c, H);
  bouche(c, ap, Math.max(fente, armer * 0.4, Math.sin(t / 300 + ap.ph0) > 0.7 ? 0.5 : 0), false);
  c.restore();
  if (z.tTouche && t - z.tTouche < 140) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 * (1 - (t - z.tTouche) / 140); if (R) poser(c, R); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  c.restore();
}

// ---------- Couché : cadavre, mort à terre (il se relèvera), mort qui fait le mort ----------
// Le corps entier étendu (≈ 1,6 m) : sur le dos (on voit son visage) ou sur le ventre (sa nuque, son dos), bras et
// jambes jetés n'importe comment. Peint une fois ; un mort à terre agite encore un bras et relève la tête.
// Un membre effilé (cuisse → cheville, bras → poignet) : deux disques reliés, contour, dessus éclairé.
function membre(c, x0, y0, x1, y1, ep, coul, ep1 = ep * 0.8) {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  const forme = (k) => {
    const r0 = ep / 2 + k, r1 = ep1 / 2 + k;
    c.beginPath();
    c.moveTo(x0 + nx * r0, y0 + ny * r0); c.lineTo(x1 + nx * r1, y1 + ny * r1);
    c.arc(x1, y1, r1, a + PI / 2, a - PI / 2, true);
    c.lineTo(x0 - nx * r0, y0 - ny * r0);
    c.arc(x0, y0, r0, a - PI / 2, a + PI / 2, true);
    c.closePath();
  };
  c.fillStyle = 'rgba(8,6,4,0.55)'; forme(0.65); c.fill();
  c.fillStyle = css(coul); forme(0); c.fill();
  const g = c.createLinearGradient(x0 + nx * ep / 2, y0 + ny * ep / 2, x0 - nx * ep / 2, y0 - ny * ep / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.45, 'rgba(255,246,230,0.1)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
  c.fillStyle = g; forme(0); c.fill();
}
// Une jambe étendue : hanche → genou (légèrement plié) → pied.
function jambeCouchee(c, x0, y0, x1, y1, car, coul, r) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, a = Math.atan2(y1 - y0, x1 - x0), pli = entre(r, -2.2, 2.2);
  const kx = mx - Math.sin(a) * pli, ky = my + Math.cos(a) * pli;
  membre(c, kx, ky, x1, y1, 6.4 * car, mul(coul, 0.94), 4.8 * car);
  membre(c, x0, y0, kx, ky, 8.6 * car, coul, 6.6 * car);
  c.fillStyle = 'rgba(0,0,0,0.18)'; ellipse(c, kx, ky, 2.4 * car, 3 * car, a); c.fill();     // le pli du genou
}
function posesCouche(ap) {
  // positions (repère du corps couché : la tête vers +x) des mains et des pieds selon la façon dont il est tombé
  return [
    { g: [6, -24], d: [2, 23], pg: [-46, -9], pd: [-44, 10] },     // bras en croix
    { g: [36, -12], d: [-6, 15], pg: [-44, -6], pd: [-40, 15] },    // un bras au-dessus de la tête
    { g: [-4, -15], d: [-6, 15], pg: [-46, -5], pd: [-46, 6] },     // bras le long du corps
    { g: [16, -22], d: [30, 14], pg: [-38, -14], pd: [-46, 4] },    // recroquevillé d'un côté
  ][ap.pose % 4];
}
function peindreCouche(c, ap, sansBrasG) {
  const r = rng(ap.seed ^ 0xc0c0), car = ap.carrure, dos = ap.couche === 'dos';
  const P = posesCouche(ap), V = ap.coulVet, J = ap.pantalon;
  // jambes (cuisse large, genou, mollet), pieds : chaussure pointe en l'air (sur le dos) ou semelle (sur le ventre)
  for (const [s, pf] of [[-1, P.pg], [1, P.pd]]) {
    const nu = ap.pieds === 'nus' || (ap.pieds === 'un_nu' && s > 0);
    const ang = Math.atan2(pf[1] - s * 5, pf[0] + 8);
    c.save(); c.translate(pf[0], pf[1]); c.rotate(ang + PI);
    c.fillStyle = 'rgba(8,6,4,0.55)'; ellipse(c, 2.4, 0, dos ? 3.6 : 5, 3.1); c.fill();
    c.fillStyle = css(nu ? mul(ap.peau, 0.9) : ap.chaussures); ellipse(c, 2.2, 0, dos ? 3.1 : 4.5, 2.6); c.fill();
    if (!nu) { c.fillStyle = dos ? 'rgba(255,246,230,0.12)' : 'rgba(200,196,186,0.25)'; ellipse(c, 2, 0, dos ? 1.8 : 3.4, dos ? 1.4 : 1.6); c.fill(); }
    else { c.fillStyle = css(mul(ap.peau, 0.75)); for (let q = 0; q < 5; q++) { cercle(c, 4.9, (q - 2) * 0.8, 0.5); c.fill(); } }
    c.restore();
    jambeCouchee(c, -8, s * 5 * car, pf[0], pf[1], car, ap.jupe ? ap.peau : J, r);
  }
  // le corps : du bassin aux épaules
  const forme = () => {
    c.beginPath();
    c.moveTo(-11 * car, -10.2 * car);
    c.bezierCurveTo(-5 * car, -10.8 * car, 0, -9 * car, 5 * car, -9.6 * car);                 // hanche → taille
    c.bezierCurveTo(11 * car, -10.6 * car, 15 * car, -13.6 * car, 20.5 * car, -13.2 * car);   // taille → épaule
    c.bezierCurveTo(25.5 * car, -12.6 * car, 26 * car, -5 * car, 25 * car, 0);
    c.bezierCurveTo(26 * car, 5 * car, 25.5 * car, 12.6 * car, 20.5 * car, 13.2 * car);
    c.bezierCurveTo(15 * car, 13.6 * car, 11 * car, 10.6 * car, 5 * car, 9.6 * car);
    c.bezierCurveTo(0, 9 * car, -5 * car, 10.8 * car, -11 * car, 10.2 * car);
    c.bezierCurveTo(-14 * car, 6, -14 * car, -6, -11 * car, -10.2 * car); c.closePath();
  };
  // le pantalon jusqu'à la taille
  c.fillStyle = css(J); c.beginPath(); c.ellipse(-6 * car, 0, 7 * car, 9.6 * car, 0, 0, TAU); c.fill();
  c.fillStyle = css(V); forme(); c.fill();
  c.save(); forme(); c.clip();
  c.fillStyle = css(J); c.fillRect(-14 * car, -14, 7 * car, 28);
  c.strokeStyle = css(CUIR, 0.9); c.lineWidth = 1.1; c.beginPath(); c.moveTo(-7.2 * car, -10); c.lineTo(-7.2 * car, 10); c.stroke();   // la ceinture
  if (ap.vet === 'blouse') { c.fillStyle = css(mul(V, 0.82), 0.45); c.beginPath(); for (let y = -12; y < 12; y += 2.6) for (let x = -6; x < 24; x += 2.6) c.rect(x, y, 0.8, 0.8); c.fill(); }
  if (ap.vet === 'gilet_jaune') { c.fillStyle = css([170, 172, 168], 0.9); c.fillRect(-4, -12, 1.8, 24); c.fillRect(8, -12, 1.8, 24); }
  if (dos && ap.vet !== 'debardeur') { c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-6, 0); c.lineTo(20, 0); c.stroke(); for (let x = 0; x < 20; x += 4.2) { c.fillStyle = 'rgba(200,196,186,0.5)'; cercle(c, x, 0.7, 0.35); c.fill(); } }
  for (const [coul, n] of [['rgba(0,0,0,0.22)', 7], ['rgba(255,245,230,0.09)', 3]]) { c.strokeStyle = coul; c.lineWidth = 0.65; c.beginPath(); for (let k = 0; k < n; k++) { c.moveTo(entre(r, -8, 20), entre(r, -11, 11)); c.quadraticCurveTo(entre(r, -8, 20), entre(r, -11, 11), entre(r, -8, 20), entre(r, -11, 11)); } c.stroke(); }
  crasse(c, r, -12, -12, 24, 12, 110, [44, 34, 22], 0.35 * (0.5 + ap.sale));
  // le sang : il a coulé de la gorge sur la poitrine (sur le dos) ou fait une flaque sous lui (sur le ventre)
  tache(c, r, dos ? 18 : 12, entre(r, -4, 4), 4 + 3 * ap.sang, SANG_SEC, 0.8, 8);
  tache(c, r, entre(r, 2, 16), entre(r, -8, 8), 2 + 2 * ap.sang, SANG, 0.65, 5);
  for (let k = 0; k < ap.dechirures + 1; k++) { const x = entre(r, -4, 18), y = entre(r, -9, 9); c.fillStyle = css(ap.peauSombre); ellipse(c, x, y, entre(r, 1.5, 3), entre(r, 1, 2), r() * PI); c.fill(); c.strokeStyle = css(SANG, 0.8); c.lineWidth = 0.5; c.beginPath(); c.moveTo(x - 1.5, y); c.lineTo(x + 1.5, y + 0.4); c.stroke(); }
  c.restore();
  volume(c, forme, 6, 0, 22 * car, 0.12, 0.5);
  c.strokeStyle = 'rgba(8,6,4,0.55)'; c.lineWidth = 0.75; forme(); c.stroke();
  // les bras
  {
    for (const [s, ph] of [[-1, P.g], [1, P.d]]) {
      if (s < 0 && sansBrasG) continue;      // le bras qui bouge encore (mort à terre) : dessiné à chaque image
      const sx = 19 * car, sy = s * 10.5 * car;
      const ex = (sx + ph[0]) / 2 + s * 0 + (ph[0] < sx ? 0 : 3), ey = (sy + ph[1]) / 2 + s * 3;
      const cHaut = ap.manches === 'aucune' ? ap.peau : V, cBas = ap.manches === 'longues' ? V : ap.peau;
      membre(c, ex, ey, ph[0], ph[1], 4.6 * car, cBas, 3.6 * car);
      membre(c, sx, sy, ex, ey, 5.8 * car, cHaut, 4.8 * car);
      main(c, ap, ph[0], ph[1], Math.atan2(ph[1] - ey, ph[0] - ex), s, 0.55);
    }
  }
  // le cou, puis la tête
  c.fillStyle = css(mul(ap.peau, 0.85)); ellipse(c, 25.5 * car, 0, 3.4 * car, 3.6 * car); c.fill();
  c.save(); c.translate(30 * car, (r() - 0.5) * 2); c.rotate((r() - 0.5) * 0.9);
  if (dos) {
    // sur le dos : le visage tourné vers le ciel — orbites, yeux ouverts, bouche ouverte
    for (const s of [-1, 1]) { c.fillStyle = css(mul(ap.peau, 0.85)); ellipse(c, -0.5, s * 5, 1.4, 1.6); c.fill(); }
    c.fillStyle = css(ap.peau); ellipse(c, 0, 0, 6, 5.1); c.fill();
    if (ap.coiffure !== 'chauve' && ap.coiffure !== 'rase') { c.fillStyle = css(ap.cheveux); c.beginPath(); c.ellipse(-1.4, 0, 5.4, 5.6, 0, PI * 0.6, PI * 1.4); c.closePath(); c.fill();
      if (ap.coiffure === 'long' || ap.coiffure === 'queue') { c.fillStyle = css(mul(ap.cheveux, 0.85)); ellipse(c, -6, 0, 3.6, 7.5); c.fill(); } }
    c.fillStyle = 'rgba(0,0,0,0.5)'; ellipse(c, 1.4, -2.1, 1.2, 1); c.fill(); ellipse(c, 1.4, 2.1, 1.2, 1); c.fill();
    c.fillStyle = 'rgba(214,210,182,0.9)'; cercle(c, 1.4, -2.1, 0.55); c.fill(); cercle(c, 1.4, 2.1, 0.55); c.fill();
    c.fillStyle = css(mul(ap.peau, 0.9)); ellipse(c, 3, 0, 1.2, 0.8); c.fill();
    c.fillStyle = '#1a0606'; ellipse(c, 4.4, 0, 1.1, 1.7); c.fill();
    c.fillStyle = css(SANG, 0.7); ellipse(c, 5.4, 0.6, 1.2, 0.9); c.fill();
    volume(c, () => { c.beginPath(); c.ellipse(0, 0, 6.3, 5.4, 0, 0, TAU); }, 0.5, 0, 7, 0.14, 0.5);
  } else {
    const H = spriteTete(ap); if (H) poser(c, H);
  }
  c.restore();
}
const LX = 54, LY = 30;
// Un corps couché en taille réelle paraissait trop grand à côté des vivants (vus de dessus, très tassés) : on le réduit.
const COUCHE_ECH = 0.76;
// Flaque de sang lisse et irrégulière (rayons tirés de la graine, courbes entre les milieux), des gouttes autour,
// un bord plus sombre et un reflet humide.
const RAYONS = new Map();
function flaqueSang(c, ap, R0, k) {
  let rs = RAYONS.get(ap.seed);
  if (!rs) { const r = rng(ap.seed ^ 0xb100d); rs = { r: Array.from({ length: 12 }, () => entre(r, 0.55, 1.25)), g: Array.from({ length: 7 }, () => [entre(r, -1.45, 1.45), entre(r, -1.05, 1.05), entre(r, 0.025, 0.07)]), cx: entre(r, 6, 14) }; RAYONS.set(ap.seed, rs); if (RAYONS.size > 600) RAYONS.delete(RAYONS.keys().next().value); }
  const n = rs.r.length, pts = [];
  for (let q = 0; q < n; q++) { const a = q / n * TAU; pts.push([rs.cx + Math.cos(a) * R0 * rs.r[q] * 1.3, Math.sin(a) * R0 * rs.r[q] * 0.85]); }
  const trace = (f) => {
    c.beginPath();
    const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    c.moveTo(rs.cx + (m0[0] - rs.cx) * f, m0[1] * f);
    for (let q = 0; q < n; q++) { const p = pts[q], s2 = pts[(q + 1) % n]; c.quadraticCurveTo(rs.cx + (p[0] - rs.cx) * f, p[1] * f, rs.cx + ((p[0] + s2[0]) / 2 - rs.cx) * f, (p[1] + s2[1]) / 2 * f); }
    c.closePath();
  };
  c.fillStyle = 'rgba(30,2,4,0.82)'; trace(1); c.fill();
  c.fillStyle = 'rgba(70,6,8,0.55)'; trace(0.78); c.fill();
  for (const [gx, gy, gr] of rs.g) { c.fillStyle = 'rgba(40,3,5,0.8)'; cercle(c, rs.cx + gx * R0, gy * R0, Math.max(0.6, gr * R0 * (0.5 + 0.5 * k))); c.fill(); }
  c.fillStyle = 'rgba(190,70,70,0.14)'; ellipse(c, rs.cx - R0 * 0.25, -R0 * 0.25, R0 * 0.45, R0 * 0.16, -0.5); c.fill();
}
function dessinerCouche(c, x, y, dir, ap, t, { bouge, frais, flaque, s }) {
  const r = rng(ap.seed ^ 0x5a17);
  const k = frais == null ? 1 : clamp(frais / 2500, 0, 1);
  c.save();
  c.translate(x, y); c.rotate(dir + PI + (r() - 0.5) * 0.8); c.scale(s * COUCHE_ECH, s * COUCHE_ECH);
  // la flaque (elle s'étend les premières secondes)
  if (flaque > 0) flaqueSang(c, ap, (8 + 14 * k) * flaque * 1.5, k);
  // la chute : il s'aplatit en tombant
  const chute = frais == null ? 1 : easeOut(clamp(frais / 380, 0, 1));
  c.scale(0.8 + 0.2 * chute, 1);
  const S = sprite(`${bouge ? 'cb' : 'c'}:${ap.seed}:${ap.type}`, LX, LY, (cc) => peindreCouche(cc, ap, bouge));
  if (S) {
    // un mort à terre bouge encore : on le soulève à peine et on le fait trembler
    if (bouge) { c.translate(Math.sin(t / 90) * 0.8, Math.sin(t / 70) * 0.6); }
    poser(c, S);
    if (bouge) {
      // un bras qui griffe le sol, la tête qui se relève
      const a = Math.sin(t / 180 * ap.tic) * 5, P = posesCouche(ap);
      bras(c, ap, 19 * ap.carrure, -10.5 * ap.carrure, (P.g[0] + 30) / 2 + a, Math.min(-14, P.g[1] * 0.7) + a * 0.3, -1, 4.6, 0.6 + 0.3 * Math.sin(t / 130), false);
    }
  }                 // (pas encore peint : la flaque seule, le corps apparaît à l'image suivante)
  c.restore();
}

// Cadavre : flaque qui s'étend les premières secondes (frais = ms depuis la mort, ou null).
const CADAVRE_ECH = 0.9; // Corps et flaque à −10 % ; les morts encore vivants au sol gardent leur taille.
export function dessinerCadavre(c, cd, t, frais, def) {
  const ap = apparenceMort(cd.uid, cd.type, cd.sexe, def && def.allure);
  if (cd.type === 'rampant') {
    c.save(); c.translate(cd.x * TS, cd.y * TS); c.rotate((cd.dir || 0));
    c.scale(CADAVRE_ECH, CADAVRE_ECH);
    const k = frais == null ? 1 : clamp(frais / 2500, 0, 1);
    flaqueSang(c, ap, 9 + 7 * k, k);
    const R = sprite(`r:${ap.seed}`, 24, 13, (cc) => peindreRampant(cc, ap)); if (R) poser(c, R);
    c.translate(9.5, 0.6); c.rotate(0.35); const H = spriteTete(ap); if (H) poser(c, H);
    c.restore();
    return;
  }
  dessinerCouche(c, cd.x * TS, cd.y * TS, cd.dir || 0, ap, t, { bouge: false, frais, flaque: 1, s: ap.taille * CADAVRE_ECH });
}
