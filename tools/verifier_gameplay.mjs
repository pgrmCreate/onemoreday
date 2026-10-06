#!/usr/bin/env node
// ============================================================================
//  verifier_gameplay.mjs — vérifie la cohérence des données de gameplay
// ============================================================================
// Usage : node tools/verifier_gameplay.mjs        (depuis la racine du dépôt, ou d'ailleurs)
// Sort en code 1 s'il y a au moins une ERREUR ; les AVERTISSEMENTS ne bloquent pas.
// Vérifie : imports, objets, vêtements, bestiaire, recettes → objets/outils/livres, butin → objets,
// lieux_gameplay ↔ lieux.js, zones → morts, rencontres → scènes/morts/zones/butin,
// scènes → suivant/objets/compétences/blessures/lieux, réglages, absence d'émoji.
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const erreurs = [];
const avert = [];
const E = (m) => erreurs.push(m);
const W = (m) => avert.push(m);

async function charger(rel, requis = true) {
  const f = path.join(RACINE, rel);
  if (!existsSync(f)) { if (requis) E(`${rel} : fichier absent`); return null; }
  try { return await import(pathToFileURL(f).href); }
  catch (e) { E(`${rel} : ne s'importe pas — ${e.message}`); return null; }
}

const mReg = await charger('js/data/reglages.js');
const mItems = await charger('js/data/items.js');
const mClothes = await charger('js/data/clothing.js');
const mZ = await charger('js/data/zombies.js');
const mRec = await charger('js/data/recipes.js');
const mButin = await charger('js/data/butin.js');
const mCons = await charger('js/data/construction.js');
const mLieux = await charger('js/data/lieux.js');
const mLG = await charger('js/data/lieux_gameplay.js');
const mZones = await charger('js/data/zones.js');
const mRenc = await charger('js/data/rencontres.js');
const mRS = await charger('js/data/rencontres_scenes.js');
// Fichiers du scénariste (facultatifs) : pour les collisions et les renvois de scènes.
const mHScenes = await charger('js/data/histoire/scenes.js', false);
const mHObjets = await charger('js/data/histoire/objets_quete.js', false);

if (erreurs.length) { rapport(); }

const REGLAGES = mReg.REGLAGES;
const ITEMS = mItems.ITEMS;
const CLOTHES = mClothes.CLOTHES;
const ZONES_CORPS = mClothes.ZONES_CORPS;
const ZOMBIES = mZ.ZOMBIES;
const RECIPES = mRec.RECIPES;
const BUTIN = mButin.BUTIN;
const LIEUX_GEO = mLieux.LIEUX_GEO;
const LIEUX_GAMEPLAY = mLG.LIEUX_GAMEPLAY;
const ZONES = mZones.ZONES;
const RENCONTRES = mRenc.RENCONTRES;
const SCENES_R = mRS.SCENES_RENCONTRES;
const SCENES_H = (mHScenes && mHScenes.SCENES) || {};
const OBJETS_QUETE = (mHObjets && mHObjets.OBJETS_QUETE) || {};

const SKILLS = Object.keys(REGLAGES.competences.LISTE);
const TOUT_OBJET = { ...OBJETS_QUETE, ...ITEMS, ...CLOTHES };
const existe = (id) => Object.prototype.hasOwnProperty.call(TOUT_OBJET, id);
const num = (x) => typeof x === 'number' && Number.isFinite(x);
const dans = (x, a, b) => num(x) && x >= a && x <= b;
const paire = (p) => Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]) && p[0] <= p[1];

const TAGS = ['abattre', 'elaguer', 'scier', 'allumer', 'cuisson', 'couper', 'ouvrir', 'visser', 'marteler', 'affuter', 'coudre', 'forcer', 'couper_chaine',
  'crocheter', 'siphon', 'lumiere', 'peche', 'piege', 'alarme', 'filtrer', 'creuser', 'observer', 'radio',
  'entretien_arme', 'escalade', 'desinfecter', 'combustible'];
const TYPES_OBJET = mItems.TYPES_OBJET;
const FAMILLES = mItems.FAMILLES_REPARATION;
const SOINS = ['bandage', 'desinfectant', 'nettoyer', 'antibio', 'antidouleur', 'suture', 'attelle', 'vitamines', 'tisane', 'onguent', 'charbon'];
const BLESSURES = Object.keys(REGLAGES.survie.BLESSURES);

// ─────────────────────────── OBJETS ───────────────────────────
for (const [id, d] of Object.entries(ITEMS)) {
  const o = `objet ${id}`;
  if (!d.nom) E(`${o} : pas de nom`);
  if (!d.desc) W(`${o} : pas de desc`);
  if (!TYPES_OBJET.includes(d.type)) E(`${o} : type inconnu « ${d.type} »`);
  if (d.type === 'quete') W(`${o} : type 'quete' dans items.js — les objets de quête vont dans histoire/objets_quete.js`);
  if (!num(d.poids) || d.poids < 0) E(`${o} : poids invalide`);
  if (!num(d.espace) || d.espace < 0) E(`${o} : espace invalide`);
  if (d.volume != null && (!num(d.volume) || d.volume < 0)) E(`${o} : volume (L) invalide`);
  for (const t of d.usage || []) if (!TAGS.includes(t)) E(`${o} : tag d'usage inconnu « ${t} »`);
  if (d.rend && !existe(d.rend)) E(`${o} : rend « ${d.rend} » inexistant`);
  if (d.carburant && !existe(d.carburant)) E(`${o} : carburant « ${d.carburant} » inexistant`);
  if (d.type === 'soin' && !SOINS.includes(d.soin)) E(`${o} : soin « ${d.soin} » inconnu`);
  if (d.type === 'arme') {
    if (!paire(d.dmg)) E(`${o} : dmg [min,max] invalide`);
    if (!num(d.vitesse) || d.vitesse < 200 || d.vitesse > 2000) E(`${o} : vitesse (ms) hors plage 200..2000`);
    if (!num(d.sta) || d.sta < 0) E(`${o} : sta invalide`);
    if (!dans(d.allonge, 0, 2)) E(`${o} : allonge hors 0..2`);
    if (!num(d.charge) || d.charge < 1 || d.charge > 3) E(`${o} : charge hors 1..3`);
    if (!dans(d.stagger, 0, 1)) E(`${o} : stagger hors 0..1`);
    if (!dans(d.crit, 0, 1)) E(`${o} : crit hors 0..1`);
    if (!num(d.dur) || d.dur <= 0) E(`${o} : dur invalide`);
    if (!dans(d.bruit, 0, 3)) E(`${o} : bruit hors 0..3`);
    if (!SKILLS.includes(d.skill)) E(`${o} : skill « ${d.skill} » inconnue`);
    if (d.reparation && !FAMILLES.includes(d.reparation)) E(`${o} : famille de réparation « ${d.reparation} » inconnue`);
    if (d.tir) {
      if (!existe(d.tir.munition) || ITEMS[d.tir.munition]?.type !== 'munition') E(`${o} : tir.munition « ${d.tir.munition} » n'est pas une munition`);
      if (!num(d.tir.capacite) || d.tir.capacite < 1) E(`${o} : tir.capacite invalide`);
      if (!dans(d.tir.precision, 0, 1)) E(`${o} : tir.precision hors 0..1`);
      if (!num(d.tir.recharge) || d.tir.recharge <= 0) E(`${o} : tir.recharge invalide`);
      if (!dans(d.tir.portee, 0, 2)) E(`${o} : tir.portee hors 0..2`);
      if (d.crosse && !paire(d.crosse)) E(`${o} : crosse invalide`);
    }
  }
  if (d.jet) {
    if (!num(d.jet.portee) || d.jet.portee <= 0) E(`${o} : jet.portee invalide`);
    if (!num(d.jet.bruit) || d.jet.bruit < 0) E(`${o} : jet.bruit invalide`);
    if (d.jet.dmg && !paire(d.jet.dmg)) E(`${o} : jet.dmg invalide`);
  }
  if (d.type === 'livre') {
    if (!num(d.lecture)) E(`${o} : livre sans durée de lecture`);
    for (const s of Object.keys(d.xp || {})) if (!SKILLS.includes(s)) E(`${o} : xp de compétence inconnue « ${s} »`);
    if (!RECIPES.some(r => (r.apprise_par || []).includes(id))) W(`${o} : livre qui n'apprend aucune recette`);
  }
  if ((d.usage || []).includes('lumiere') && !REGLAGES.lumiere.SOURCES[id]) E(`${o} : source de lumière sans entrée dans reglages.lumiere.SOURCES`);
}
for (const [id, s] of Object.entries(REGLAGES.lumiere.SOURCES)) {
  if (!['feu_camp'].includes(id) && !existe(id)) E(`reglages.lumiere.SOURCES.${id} : objet inexistant`);
  if (s.charge && !existe(s.charge)) E(`reglages.lumiere.SOURCES.${id} : charge « ${s.charge} » inexistante`);
}
for (const id of Object.keys(OBJETS_QUETE)) if (ITEMS[id] || CLOTHES[id]) W(`objet de quête ${id} : même id qu'un objet de items.js/clothing.js (écrasé à la fusion)`);

// ─────────────────────────── VÊTEMENTS ───────────────────────────
const SLOTS = Object.keys(mClothes.SLOTS);
for (const [id, c] of Object.entries(CLOTHES)) {
  const o = `vêtement ${id}`;
  if (ITEMS[id]) E(`${o} : même id qu'un objet de items.js`);
  if (!SLOTS.includes(c.slot)) E(`${o} : slot « ${c.slot} » inconnu`);
  if (!num(c.poids)) E(`${o} : poids invalide`);
  if (!dans(c.protection, 0, 4)) E(`${o} : protection hors 0..4`);
  for (const z of c.couvre || []) if (!ZONES_CORPS.includes(z)) E(`${o} : zone couverte inconnue « ${z} »`);
  if (!c.desc) W(`${o} : pas de desc`);
}

// ─────────────────────────── BESTIAIRE ───────────────────────────
const SPECIAUX = ['hurle', 'explose', 'rampe', 'charge', null];
const TYPES_ATT = mZ.TYPES_ATTAQUE;
const TMIN = REGLAGES.combat.TELEGRAPHE_MIN_MS;
const nZ = Object.keys(ZOMBIES).length;
if (nZ < 4 || nZ > 6) W(`bestiaire : ${nZ} types (visé : 4 à 6, chacun homme ou femme)`);
for (const [id, z] of Object.entries(ZOMBIES)) {
  const o = `mort ${id}`;
  for (const k of ['nom', 'desc', 'gore']) if (!z[k]) E(`${o} : champ ${k} manquant`);
  if (!num(z.hp) || z.hp <= 0) E(`${o} : hp invalide`);
  if (!paire(z.dmg)) E(`${o} : dmg invalide`);
  if (!num(z.portee) || z.portee < 0.6 || z.portee > 1.6) E(`${o} : portee (cases) hors 0,6..1,6`);
  if (!num(z.cadence) || z.cadence < 500) E(`${o} : cadence (ms) invalide ou trop courte`);
  if (!z.noms || !z.noms.h || !z.noms.f) E(`${o} : noms { h, f } manquants`);
  if (!z.sexes || Math.abs((z.sexes.h || 0) + (z.sexes.f || 0) - 1) > 0.01) E(`${o} : sexes { h, f } ne somment pas à 1`);
  if (!num(z.telegraphe) || z.telegraphe < TMIN) E(`${o} : telegraphe < TELEGRAPHE_MIN_MS (${TMIN})`);
  if (!dans(z.saisie, 0, 1)) E(`${o} : saisie hors 0..1`);
  if (z.saisie > 0 && (!num(z.saisieForce) || z.saisieForce < 1)) E(`${o} : saisie > 0 sans saisieForce`);
  if (!dans(z.esquive, 0, 0.3)) E(`${o} : esquive hors 0..0,3`);
  if (!dans(z.resistance, 0, 1)) E(`${o} : resistance hors 0..1`);
  if (!dans(z.blessureMax, 1, 4)) E(`${o} : blessureMax hors 1..4`);
  if (!dans(z.infection, 0, 1)) E(`${o} : infection hors 0..1`);
  for (const k of ['vitesse', 'vitesseChasse', 'vue', 'ouie']) if (!num(z[k]) || z[k] <= 0) E(`${o} : ${k} invalide`);
  if (!SPECIAUX.includes(z.special ?? null)) E(`${o} : special « ${z.special} » inconnu`);
  if (!num(z.jourMin) || z.jourMin < 1) E(`${o} : jourMin invalide`);
  if (z.png) {
    if (!existsSync(path.join(RACINE, z.png))) E(`${o} : image ${z.png} introuvable`);
  }
  if (!Array.isArray(z.attaques) || !z.attaques.length) E(`${o} : aucune attaque`);
  for (const a of z.attaques || []) {
    if (!a.desc) E(`${o} : attaque sans desc`);
    if (!TYPES_ATT.includes(a.type)) E(`${o} : type d'attaque inconnu « ${a.type} »`);
    if (!Array.isArray(a.zones) || !a.zones.length) E(`${o} : attaque sans zones`);
    for (const zz of a.zones || []) if (!ZONES_CORPS.includes(zz)) E(`${o} : zone « ${zz} » hors vocabulaire ZONES_CORPS`);
  }
  if (!z.animal && z.saisie > 0) {
    if (!(z.attaques || []).some(a => a.type === 'morsure')) E(`${o} : peut empoigner mais n'a aucune attaque 'morsure' (texte de l'empoignade ratée)`);
    if (!(z.attaques || []).some(a => a.type !== 'morsure')) E(`${o} : n'a que des morsures (il ne mord qu'en empoignade)`);
  }
  if (!z.animal && (z.attaques || []).some(a => a.type === 'morsure_animale')) E(`${o} : 'morsure_animale' réservée aux animaux`);
  for (const b of z.butin || []) {
    if (!existe(b.id)) E(`${o} : butin « ${b.id} » inexistant`);
    if (!paire(b.q) || !dans(b.p, 0, 1)) E(`${o} : ligne de butin ${b.id} invalide`);
  }
  if (z.etats) {
    const s = Object.values(z.etats).reduce((a, b) => a + b, 0);
    if (Math.abs(s - 1) > 0.01) W(`${o} : etats ne somment pas à 1 (${s})`);
  }
}

// ─────────────────────────── RECETTES ───────────────────────────
const CATS_R = Object.keys(mRec.CATEGORIES_RECETTES);
const tagsDispo = new Set(Object.values(ITEMS).flatMap(d => d.usage || []));
const idsR = new Set();
if (RECIPES.length < 40 || RECIPES.length > 110) W(`recettes : ${RECIPES.length} (visé : 40 à 110)`);
for (const r of RECIPES) {
  const o = `recette ${r.id}`;
  if (idsR.has(r.id)) E(`${o} : id en double`); idsR.add(r.id);
  if (!CATS_R.includes(r.cat)) E(`${o} : catégorie « ${r.cat} » inconnue`);
  if (!r.nom || !r.desc) E(`${o} : nom/desc manquant`);
  if (r.special) {
    if (!['reparer', 'feu_camp', 'barricade'].includes(r.special)) E(`${o} : special « ${r.special} » inconnu`);
    if (r.resultat !== null) E(`${o} : une recette spéciale a resultat: null`);
    if (r.special === 'reparer') {
      if (!Array.isArray(r.cible) || !r.cible.length) E(`${o} : reparer sans cible`);
      for (const c of r.cible || []) if (!FAMILLES.includes(c)) E(`${o} : cible « ${c} » inconnue`);
      if (!dans(r.gain, 0.05, 1)) E(`${o} : gain hors 0,05..1`);
    }
  } else {
    if (!r.resultat || !existe(r.resultat.id)) E(`${o} : résultat « ${r.resultat?.id} » inexistant`);
    if (!r.resultat || !num(r.resultat.qty) || r.resultat.qty < 1) E(`${o} : quantité de résultat invalide`);
  }
  for (const i of r.ingredients || []) {
    if (!existe(i.id)) E(`${o} : ingrédient « ${i.id} » inexistant`);
    if (!num(i.qty) || i.qty < 1) E(`${o} : quantité d'ingrédient invalide (${i.id})`);
  }
  for (const t of r.outils || []) {
    if (!TAGS.includes(t)) E(`${o} : outil (tag) inconnu « ${t} »`);
    else if (!tagsDispo.has(t)) E(`${o} : aucun objet ne fournit l'outil « ${t} »`);
  }
  if (![null, 'etabli', 'feu'].includes(r.poste ?? null)) E(`${o} : poste « ${r.poste} » inconnu`);
  for (const s of Object.keys(r.skill || {})) if (!SKILLS.includes(s)) E(`${o} : compétence requise inconnue « ${s} »`);
  for (const s of Object.keys(r.xp || {})) if (!SKILLS.includes(s)) E(`${o} : xp de compétence inconnue « ${s} »`);
  if (!num(r.tempsMin) || r.tempsMin <= 0) E(`${o} : tempsMin invalide`);
  if (typeof r.connue !== 'boolean') E(`${o} : champ connue (booléen) manquant`);
  for (const l of r.apprise_par || []) {
    if (!existe(l)) E(`${o} : apprise_par « ${l} » inexistant`);
    else if (TOUT_OBJET[l].type !== 'livre') E(`${o} : apprise_par « ${l} » n'est pas un livre`);
  }
  for (const s of Object.keys(r.apprise_niveau || {})) if (!SKILLS.includes(s)) E(`${o} : apprise_niveau compétence inconnue « ${s} »`);
  if (r.connue === false && !(r.apprise_par || []).length && !Object.keys(r.apprise_niveau || {}).length) E(`${o} : inconnue et impossible à apprendre`);
  if (r.resultat && r.ingredients?.some(i => i.id === r.resultat.id)) W(`${o} : le résultat figure dans ses propres ingrédients`);
}

// ─────────────────────────── BUTIN ───────────────────────────
const CATS_M = mButin.CATEGORIES_MEUBLE;
const obtenables = new Set();
for (const [type, tables] of Object.entries(BUTIN)) {
  for (const [cat, lignes] of Object.entries(tables)) {
    const o = `butin ${type}.${cat}`;
    if (type !== 'voyage' && !CATS_M.includes(cat)) E(`${o} : catégorie de meuble inconnue`);
    if (!Array.isArray(lignes)) { E(`${o} : pas un tableau`); continue; }
    if (!lignes.length) W(`${o} : table vide`);
    for (const l of lignes) {
      if (!existe(l.id)) E(`${o} : objet « ${l.id} » inexistant`);
      if (!paire(l.q) || l.q[0] < 1) E(`${o} : q invalide pour ${l.id}`);
      if (!(num(l.p) && l.p > 0 && l.p <= 1)) E(`${o} : p hors ]0,1] pour ${l.id}`);
      obtenables.add(l.id);
    }
  }
}
for (const cat of CATS_M) if (!BUTIN.defaut[cat]) E(`butin defaut : catégorie « ${cat} » manquante`);
const typesLieux = new Set(Object.values(LIEUX_GEO).map(l => l.type));
for (const t of typesLieux) if (!BUTIN[t]) W(`butin : pas de table pour le type de lieu « ${t} » (retombe sur defaut)`);
const TYPES_DEMANDES = ['hotel', 'pharmacie', 'superette', 'supermarche', 'hypermarche', 'hopital', 'commissariat', 'gendarmerie',
  'caserne', 'bricolage', 'gare', 'eglise', 'musee', 'chateau', 'mairie', 'mediatheque', 'cinema', 'usine', 'cimetiere', 'lycee',
  'cite', 'village', 'ruines', 'grotte', 'zoo', 'base', 'triage', 'aerodrome', 'place', 'monument'];
for (const t of TYPES_DEMANDES) if (!BUTIN[t]) E(`butin : table manquante pour le type « ${t} »`);
// Essai de tirage (sans aléa) : la fonction doit tourner partout.
try {
  let s = 1; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (const t of Object.keys(BUTIN)) for (const c of CATS_M) mButin.tirerButin(t, c, rnd, { taille: 3, danger: 0.5, jour: 4, coop: true });
} catch (e) { E(`butin : tirerButin plante — ${e.message}`); }

// ─────────────────────────── LIEUX ───────────────────────────
const AMB = mLG.AMBIANCES;
for (const id of Object.keys(LIEUX_GEO)) if (!LIEUX_GAMEPLAY[id]) E(`lieux_gameplay : lieu « ${id} » de lieux.js sans entrée`);
for (const [id, l] of Object.entries(LIEUX_GAMEPLAY)) {
  const o = `lieu ${id}`;
  if (!LIEUX_GEO[id]) E(`${o} : absent de lieux.js`);
  if (!dans(l.danger, 0, 1)) E(`${o} : danger hors 0..1`);
  if (!Array.isArray(l.pool) || !l.pool.length) E(`${o} : pool vide`);
  for (const z of l.pool || []) if (!ZOMBIES[z]) E(`${o} : mort « ${z} » inconnu`);
  if (!l.morts || !paire(l.morts.n) || l.morts.n[0] < 0) E(`${o} : morts.n invalide`);
  if (!BUTIN[l.typeButin]) E(`${o} : typeButin « ${l.typeButin} » sans table`);
  if (!num(l.repeuplement) || l.repeuplement < 0) E(`${o} : repeuplement invalide`);
  if (!AMB.includes(l.ambiance)) E(`${o} : ambiance « ${l.ambiance} » inconnue`);
  if (l.abondance !== undefined && !dans(l.abondance, 0.3, 2)) E(`${o} : abondance hors 0,3..2`);
}

// ─────────────────────────── ZONES ───────────────────────────
const idsZ = new Set();
for (const z of ZONES) {
  const o = `zone ${z.id}`;
  if (idsZ.has(z.id)) E(`${o} : id en double`); idsZ.add(z.id);
  if (!['salon', 'region'].includes(z.echelle)) E(`${o} : echelle invalide`);
  if (!z.centre || !dans(z.centre.lat, 43.3, 43.9) || !dans(z.centre.lon, 4.6, 5.5)) E(`${o} : centre hors du pays salonais`);
  if (!num(z.rayon_m) || z.rayon_m <= 0) E(`${o} : rayon_m invalide`);
  if (!dans(z.danger, 0, 1)) E(`${o} : danger hors 0..1`);
  for (const m of z.pool || []) if (!ZOMBIES[m]) E(`${o} : mort « ${m} » inconnu`);
  if (!z.nom || !z.desc) E(`${o} : nom/desc manquant`);
}

// ─────────────────────────── CONDITIONS & EFFETS ───────────────────────────
const CLES_COND = ['flag', 'pasFlag', 'flagEgal', 'objet', 'skill', 'nuit', 'jourMin', 'lieuVisite', 'quete', 'ou'];
function verifCond(c, o) {
  if (c == null) return;
  if (typeof c !== 'object') { E(`${o} : condition non-objet`); return; }
  for (const [k, v] of Object.entries(c)) {
    if (!CLES_COND.includes(k)) E(`${o} : clé de condition inconnue « ${k} »`);
    if (k === 'objet') { const id = Array.isArray(v) ? v[0] : v; if (!existe(id)) E(`${o} : condition objet « ${id} » inexistant`); }
    if (k === 'skill') { if (!Array.isArray(v) || !SKILLS.includes(v[0])) E(`${o} : condition skill invalide`); }
    if (k === 'lieuVisite' && !LIEUX_GEO[v]) E(`${o} : lieuVisite « ${v} » inconnu`);
    if (k === 'ou') { if (!Array.isArray(v)) E(`${o} : ou doit être un tableau`); else v.forEach((cc, i) => verifCond(cc, `${o}.ou[${i}]`)); }
  }
}
const CLES_EFF = ['flag', 'flags', 'retirerFlag', 'objet', 'objets', 'blessure', 'pv', 'sta', 'faim', 'soif', 'fatigue', 'tempsMin',
  'xp', 'decouvrir', 'quete', 'journal', 'document', 'combat', 'cinematique', 'teleporter', 'bruit', 'infection',
  'detour', 'demiTour', 'butin']; // trois dernières : extensions voyage (GAMEPLAY §Temps 2)
function verifEffets(ef, o) {
  if (ef == null) return;
  for (const [k, v] of Object.entries(ef)) {
    if (!CLES_EFF.includes(k)) E(`${o} : effet inconnu « ${k} »`);
    if (k === 'objet' && (!Array.isArray(v) || !existe(v[0]) || !num(v[1]))) E(`${o} : effet objet invalide ${JSON.stringify(v)}`);
    if (k === 'objets') for (const p of v) if (!Array.isArray(p) || !existe(p[0]) || !num(p[1])) E(`${o} : effet objets invalide ${JSON.stringify(p)}`);
    if (k === 'blessure') {
      if (!BLESSURES.includes(v.type)) E(`${o} : blessure « ${v.type} » inconnue`);
      if (v.zone && !ZONES_CORPS.includes(v.zone)) E(`${o} : zone « ${v.zone} » inconnue`);
    }
    if (k === 'xp') for (const s of Object.keys(v)) if (!SKILLS.includes(s)) E(`${o} : xp compétence inconnue « ${s} »`);
    if (k === 'decouvrir') for (const l of v) if (!LIEUX_GEO[l]) E(`${o} : decouvrir « ${l} » inconnu`);
    if (k === 'combat') {
      if (!Array.isArray(v.zombies) || !v.zombies.length) E(`${o} : combat sans morts`);
      for (const z of v.zombies || []) if (!ZOMBIES[z]) E(`${o} : combat — mort « ${z} » inconnu`);
    }
    if (k === 'butin' && !mButin.tableParCle(v.table)) E(`${o} : table de butin « ${v.table} » introuvable`);
    if (['pv', 'sta', 'faim', 'soif', 'fatigue', 'tempsMin', 'detour', 'bruit'].includes(k) && !num(v)) E(`${o} : ${k} doit être un nombre`);
  }
}

// ─────────────────────────── RENCONTRES ───────────────────────────
const TYPES_R = mRenc.TYPES_RENCONTRE;
const idsRe = new Set();
if (RENCONTRES.length < 30 || RENCONTRES.length > 45) W(`rencontres : ${RENCONTRES.length} (visé : 30 à 45)`);
const scenesAtteintes = new Set();
const toutesScenes = { ...SCENES_H, ...SCENES_R };
for (const id of Object.keys(SCENES_R)) if (SCENES_H[id]) E(`scène ${id} : même id qu'une scène du scénariste`);
for (const r of RENCONTRES) {
  const o = `rencontre ${r.id}`;
  if (idsRe.has(r.id)) E(`${o} : id en double`); idsRe.add(r.id);
  if (!TYPES_R.includes(r.type)) E(`${o} : type « ${r.type} » inconnu`);
  if (!num(r.poids) || r.poids <= 0) E(`${o} : poids invalide`);
  if (r.echelle != null && !['salon', 'region'].includes(r.echelle)) E(`${o} : echelle invalide`);
  if (![null, true, false, undefined].includes(r.nuit)) E(`${o} : nuit doit être null/true/false`);
  if (r.dangerMin != null && !dans(r.dangerMin, 0, 1)) E(`${o} : dangerMin hors 0..1`);
  for (const zid of r.zones || []) {
    const z = ZONES.find(x => x.id === zid);
    if (!z) E(`${o} : zone « ${zid} » inconnue`);
    else if (r.echelle && z.echelle !== r.echelle) E(`${o} : zone « ${zid} » d'échelle ${z.echelle} ≠ ${r.echelle}`);
  }
  verifCond(r.si, `${o}.si`);
  if (r.type === 'choix' || r.type === 'pnj') {
    if (!r.scene || !toutesScenes[r.scene]) E(`${o} : scène « ${r.scene} » introuvable`);
    else scenesAtteintes.add(r.scene);
  }
  if (r.type === 'combat') {
    if (!r.combat || !Array.isArray(r.combat.zombies) || !r.combat.zombies.length) E(`${o} : combat sans morts`);
    for (const z of r.combat?.zombies || []) {
      if (!ZOMBIES[z]) E(`${o} : mort « ${z} » inconnu`);
      else {
        const jm = r.si?.jourMin || 1;
        if (ZOMBIES[z].jourMin > jm) W(`${o} : ${z} (jourMin ${ZOMBIES[z].jourMin}) possible dès le jour ${jm}`);
      }
    }
  }
  if (r.type === 'butin') {
    if (!r.butin || !mButin.tableParCle(r.butin.table)) E(`${o} : table de butin « ${r.butin?.table} » introuvable`);
  }
  if (['combat', 'butin', 'ambiance'].includes(r.type) && !r.texte) E(`${o} : texte manquant`);
  verifEffets(r.effets, `${o}.effets`);
}

// ─────────────────────────── SCÈNES ───────────────────────────
const SPECIAUX_S = ['#fin', '#mort', '#combat'];
function verifSuivant(s, o, ef) {
  if (s == null) { E(`${o} : suivant manquant`); return; }
  if (SPECIAUX_S.includes(s)) {
    if (s === '#combat' && !(ef && ef.combat)) E(`${o} : suivant '#combat' sans effets.combat`);
    return;
  }
  if (!toutesScenes[s]) E(`${o} : suivant « ${s} » introuvable`);
  else scenesAtteintes.add(s);
}
for (const [id, sc] of Object.entries(SCENES_R)) {
  const o = `scène ${id}`;
  if (!id.startsWith('rv_')) W(`${o} : id sans préfixe rv_`);
  if (!sc.texte) E(`${o} : texte manquant`);
  if (!sc.choix && !sc.auto) E(`${o} : ni choix ni auto`);
  if (sc.auto) verifSuivant(sc.auto.suivant, `${o}.auto`, null);
  (sc.choix || []).forEach((c, i) => {
    const oc = `${o}.choix[${i}]`;
    if (!c.label) E(`${oc} : label manquant`);
    verifCond(c.si, `${oc}.si`); verifCond(c.besoin, `${oc}.besoin`);
    if (c.test) {
      if (c.test.skill !== undefined) {
        if (!SKILLS.includes(c.test.skill)) E(`${oc} : test sur compétence inconnue « ${c.test.skill} »`);
        if (!num(c.test.difficulte)) E(`${oc} : test sans difficulte`);
      } else if (!dans(c.test.chance, 0, 1)) E(`${oc} : test sans skill ni chance valide`);
      for (const b of ['reussite', 'echec']) {
        if (!c[b]) { E(`${oc} : test sans ${b}`); continue; }
        if (!c[b].texte) W(`${oc}.${b} : pas de texte`);
        verifEffets(c[b].effets, `${oc}.${b}.effets`);
        verifSuivant(c[b].suivant, `${oc}.${b}`, c[b].effets);
      }
    } else {
      verifEffets(c.effets, `${oc}.effets`);
      verifSuivant(c.suivant, oc, c.effets);
    }
  });
}
for (const id of Object.keys(SCENES_R)) if (!scenesAtteintes.has(id)) W(`scène ${id} : jamais atteinte (ni rencontre ni suivant)`);

// Recherche au sol (js/data/recherche.js)
try { const mR = await import('../js/data/recherche.js'); for (const t of Object.values(mR.TABLES_RECHERCHE)) for (const [id] of t) { obtenables.add(id); if (!ITEMS[id]) E(`recherche au sol : objet inconnu « ${id} »`); } } catch (e) { W('recherche au sol : ' + e.message); }
// ─────────────────────────── ÉCONOMIE : objets jamais obtenables ───────────────────────────
for (const r of RECIPES) if (r.resultat) obtenables.add(r.resultat.id);
// Construction : le potager donne des légumes ; démonter un meuble rend planches, ressorts, visserie…
if (mCons) {
  for (const d of Object.values(mCons.CONSTRUCTIONS)) if (d.potager) obtenables.add('legumes');
  for (const d of Object.values(mCons.DEMONTABLES)) for (const id of Object.keys(d)) if (id !== 'ms') obtenables.add(id);
  // la nature : arbres abattus, buissons coupés, cueillette
  for (const d of Object.values(mCons.RECOLTES || {})) { for (const id of Object.keys(d.rendu || {})) obtenables.add(id); if (d.cueillette) obtenables.add(d.cueillette.id); }
  for (const [k, d] of Object.entries(mCons.CONSTRUCTIONS)) {
    for (const x of d.ingredients || []) if (!ITEMS[x.id]) E(`construction ${k} : ingrédient inconnu « ${x.id} »`);
    if (!d.t || !d.nom || !d.dessin) E(`construction ${k} : t, nom ou dessin manquant`);
  }
}
for (const z of Object.values(ZOMBIES)) for (const b of z.butin || []) obtenables.add(b.id);
const collecterEffets = (ef) => { if (!ef) return; if (ef.objet && ef.objet[1] > 0) obtenables.add(ef.objet[0]); for (const p of ef.objets || []) if (p[1] > 0) obtenables.add(p[0]); };
for (const sc of Object.values(SCENES_R)) for (const c of sc.choix || []) { collecterEffets(c.effets); collecterEffets(c.reussite?.effets); collecterEffets(c.echec?.effets); }
for (const [id, d] of Object.entries(ITEMS)) if (d.rend) obtenables.add(d.rend);
for (const id of Object.keys({ ...ITEMS, ...CLOTHES })) {
  const d = TOUT_OBJET[id];
  if (!obtenables.has(id) && d.type !== 'quete') W(`économie : « ${id} » ne s'obtient nulle part (butin, recette, cadavre, rencontre)`);
}

// ─────────────────────────── RÉGLAGES ───────────────────────────
if (!num(REGLAGES.temps?.MS_PAR_MINUTE)) E('reglages : temps.MS_PAR_MINUTE manquant');
for (const k of ['temps', 'exploration', 'voyage', 'combat', 'survie', 'fouille', 'lumiere', 'craft', 'coop']) if (!REGLAGES[k]) E(`reglages : section « ${k} » manquante`);
const presets = Object.values(REGLAGES.difficulte.PRESETS);
const clesP = Object.keys(presets[0]).sort().join();
for (const [id, p] of Object.entries(REGLAGES.difficulte.PRESETS)) if (Object.keys(p).sort().join() !== clesP) E(`reglages.difficulte.${id} : clés différentes des autres préréglages`);
const jours = REGLAGES.courbe.JOURS.map(j => j.jourMin);
if (jours.some((j, i) => i && j <= jours[i - 1])) E('reglages.courbe.JOURS : jourMin non croissants');
for (const s of Object.keys(REGLAGES.competences.DEPART)) if (!SKILLS.includes(s)) E(`reglages.competences.DEPART : « ${s} » inconnue`);

// ─────────────────────────── TEXTE : émojis, marqueurs de genre ───────────────────────────
const MES_FICHIERS = ['docs/GAMEPLAY.md', 'js/data/reglages.js', 'js/data/zombies.js', 'js/data/items.js', 'js/data/clothing.js',
  'js/data/recipes.js', 'js/data/butin.js', 'js/data/rencontres.js', 'js/data/rencontres_scenes.js', 'js/data/lieux_gameplay.js',
  'js/data/zones.js', 'tools/verifier_gameplay.mjs'];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
for (const f of MES_FICHIERS) {
  const p = path.join(RACINE, f);
  if (!existsSync(p)) { if (f.endsWith('.md')) W(`${f} : absent`); continue; }
  const txt = readFileSync(p, 'utf8');
  txt.split('\n').forEach((ligne, i) => { if (EMOJI.test(ligne)) E(`${f}:${i + 1} : émoji ou pictogramme interdit`); });
}
const verifGenre = (t, o) => {
  if (typeof t !== 'string') return;
  const ouvre = (t.match(/\{/g) || []).length, ferme = (t.match(/\}/g) || []).length;
  if (ouvre !== ferme) E(`${o} : accolades de genre déséquilibrées`);
  for (const m of t.match(/\{[^}]*\}/g) || []) if (!m.includes('|')) E(`${o} : marqueur de genre sans « | » : ${m}`);
};
for (const [id, sc] of Object.entries(SCENES_R)) {
  verifGenre(sc.texte, `scène ${id}`);
  for (const c of sc.choix || []) { verifGenre(c.label, `scène ${id}`); verifGenre(c.texte, `scène ${id}`); verifGenre(c.reussite?.texte, `scène ${id}`); verifGenre(c.echec?.texte, `scène ${id}`); }
}
for (const r of RENCONTRES) verifGenre(r.texte, `rencontre ${r.id}`);
for (const [id, z] of Object.entries(ZOMBIES)) for (const a of z.attaques) verifGenre(a.desc, `mort ${id}`);

rapport();

function rapport() {
  for (const w of avert) console.log('  avertissement : ' + w);
  for (const e of erreurs) console.log('  ERREUR : ' + e);
  const n = (a) => a.length;
  console.log(`\nverifier_gameplay : ${n(erreurs)} erreur(s), ${n(avert)} avertissement(s).`);
  if (!erreurs.length && ITEMS) {
    console.log(`  ${Object.keys(ITEMS).length} objets, ${Object.keys(CLOTHES).length} vêtements, ${Object.keys(ZOMBIES).length} morts, ` +
      `${RECIPES.length} recettes, ${Object.keys(BUTIN).length} types de butin, ${Object.keys(LIEUX_GAMEPLAY).length} lieux, ` +
      `${ZONES.length} zones, ${RENCONTRES.length} rencontres, ${Object.keys(SCENES_R).length} scènes.`);
  }
  process.exit(erreurs.length ? 1 : 0);
}
