#!/usr/bin/env node
// ============ Vérification des données de l'histoire (scénariste) ============
// Usage : node tools/verifier_histoire.mjs        (code de sortie 1 s'il y a des ERREURS)
// Vérifie : imports, formats (REFONTE §4.5 à §4.11), références croisées (scènes, quêtes, lieux, objets,
// documents, morts, cinématiques, décors, marqueurs de niveau documentés), drapeaux testés jamais posés,
// scènes orphelines, lieux clés ≤ 14, syntaxe {masculin|féminin}, absence d'émojis.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = p => 'file://' + join(RACINE, p);
const erreurs = [], avertissements = [];
const err = m => erreurs.push(m), warn = m => avertissements.push(m);

const imp = async (p, nom, facultatif = false) => {
  try { const m = await import(url(p)); if (nom && !(nom in m)) err(`${p} : export « ${nom} » absent`); return m; }
  catch (e) { (facultatif ? warn : err)(`${p} : import impossible (${e.message})`); return {}; }
};

const { SCENES = {}, PARTIES_SCENES = {} } = await imp('js/data/histoire/scenes.js', 'SCENES');
const { QUETES = {} } = await imp('js/data/histoire/quetes.js', 'QUETES');
const { DECLENCHEURS = [] } = await imp('js/data/histoire/declencheurs.js', 'DECLENCHEURS');
const { DOCUMENTS = {} } = await imp('js/data/histoire/documents.js', 'DOCUMENTS');
const { PNJ = {} } = await imp('js/data/histoire/pnj.js', 'PNJ');
const { RENCONTRES_HISTOIRE = [] } = await imp('js/data/histoire/rencontres.js', 'RENCONTRES_HISTOIRE');
const { LIEUX_RECIT = {} } = await imp('js/data/histoire/lieux_recit.js', 'LIEUX_RECIT');
const { OBJETS_QUETE = {} } = await imp('js/data/histoire/objets_quete.js', 'OBJETS_QUETE');
const { MORTS = {} } = await imp('js/data/histoire/morts.js', 'MORTS');
const { FINS = {} } = await imp('js/data/histoire/fins.js', 'FINS');
const { CINEMATIQUES = {}, DECORS = [] } = await imp('js/data/cinematiques.js', 'CINEMATIQUES');
const { LIEUX_GEO = {} } = await imp('js/data/lieux.js', 'LIEUX_GEO');
const { ITEMS = {} } = await imp('js/data/items.js', 'ITEMS', true);
const { ZOMBIES = {} } = await imp('js/data/zombies.js', 'ZOMBIES', true);
const { ZONES_CORPS = null } = await imp('js/data/clothing.js', null, true);

const histoireMd = (() => { try { return readFileSync(join(RACINE, 'docs/HISTOIRE.md'), 'utf8'); } catch { err('docs/HISTOIRE.md absent'); return ''; } })();
const niveauxMd = (() => { try { return readFileSync(join(RACINE, 'docs/NIVEAUX_BESOINS.md'), 'utf8'); } catch { err('docs/NIVEAUX_BESOINS.md absent'); return ''; } })();

// ─── Tables de référence ───
const SPECIAUX = new Set(['#fin', '#mort', '#combat']);
const OBJETS = { ...ITEMS, ...OBJETS_QUETE };
const DECORS_SET = new Set(DECORS);
const SKILLS = new Set(['force', 'dexterite', 'agilite', 'mainsNues', 'visee', 'construction', 'mecanique', 'entretien', 'chasse']);
const PLAIES = new Set(['egratignure', 'contusion', 'entaille', 'profonde', 'morsure', 'fracture', 'brulure']);
const MUSIQUES_SCENE = new Set(['calme', 'sombre', 'tension', 'combat', 'mort', null]);
const MUSIQUES_CINE = new Set(['titre', 'calme', 'sombre', 'tension', 'combat', 'mort', 'refuge']);
const COND_CLES = new Set(['flag', 'pasFlag', 'flagEgal', 'objet', 'skill', 'nuit', 'jourMin', 'lieuVisite', 'quete', 'ou']);
const EFFET_CLES = new Set(['flag', 'flags', 'retirerFlag', 'objet', 'objets', 'blessure', 'pv', 'sta', 'faim', 'soif', 'fatigue',
  'tempsMin', 'xp', 'decouvrir', 'quete', 'journal', 'document', 'combat', 'cinematique', 'teleporter', 'bruit', 'infection', 'detour']);
const DECL_QUAND = new Set(['entree_lieu', 'marqueur', 'flag', 'heure', 'voyage']);
const TYPES_RENC = new Set(['combat', 'choix', 'butin', 'ambiance', 'pnj']);
const STYLES_DOC = new Set(['manuscrit', 'tape', 'imprime', 'sms', 'carnet']);
const ROLES = new Set(['cle', 'secondaire', 'decor']);
const MORTS_REQUISES = ['combat', 'hemorragie', 'infection', 'faim', 'soif', 'maladie'];

const flagsPoses = new Set(), flagsTestes = new Map(); // flag -> [contexte]
const docsDonnes = new Set(), scenesCibles = new Set(), cinesCibles = new Set(), rencCibles = new Set();
const marqueursUtilises = new Map(); // "lieu:marqueur" -> contexte
const lieuOk = (id, ctx) => { if (!LIEUX_GEO[id]) err(`${ctx} : lieu inconnu « ${id} »`); };
const objetOk = (id, ctx) => { if (!OBJETS[id]) (ITEMS && Object.keys(ITEMS).length ? err : warn)(`${ctx} : objet inconnu « ${id} »`); };
const quetEtapeOk = (q, e, ctx) => {
  if (!QUETES[q]) return err(`${ctx} : quête inconnue « ${q} »`);
  if (!QUETES[q].etapes?.[e]) err(`${ctx} : étape « ${e} » absente de la quête « ${q} »`);
};

function verifCondition(c, ctx) {
  if (c == null) return;
  if (typeof c !== 'object' || Array.isArray(c)) return err(`${ctx} : condition mal formée`);
  for (const [k, v] of Object.entries(c)) {
    if (!COND_CLES.has(k)) err(`${ctx} : clé de condition inconnue « ${k} »`);
    if (k === 'flag' || k === 'pasFlag') { if (typeof v !== 'string') err(`${ctx} : ${k} doit être une chaîne`); else if (k === 'flag') (flagsTestes.get(v) || flagsTestes.set(v, []).get(v)).push(ctx); }
    if (k === 'flagEgal') { if (!Array.isArray(v) || v.length !== 2 || typeof v[0] !== 'string' || v[1] === undefined) err(`${ctx} : flagEgal mal formé`); else (flagsTestes.get(v[0]) || flagsTestes.set(v[0], []).get(v[0])).push(ctx); }
    if (k === 'objet') objetOk(Array.isArray(v) ? v[0] : v, ctx);
    if (k === 'skill' && (!Array.isArray(v) || !SKILLS.has(v[0]))) err(`${ctx} : skill mal formé`);
    if (k === 'lieuVisite') lieuOk(v, ctx);
    if (k === 'quete') { if (!Array.isArray(v)) err(`${ctx} : quete mal formée`); else quetEtapeOk(v[0], v[1], ctx); }
    if (k === 'ou') { if (!Array.isArray(v) || !v.length) err(`${ctx} : ou mal formé`); else v.forEach((cc, i) => verifCondition(cc, `${ctx}.ou[${i}]`)); }
  }
}

function verifEffets(e, ctx) {
  if (e == null) return;
  if (typeof e !== 'object' || Array.isArray(e)) return err(`${ctx} : effets mal formés`);
  for (const [k, v] of Object.entries(e)) {
    if (!EFFET_CLES.has(k)) err(`${ctx} : effet inconnu « ${k} »`);
    switch (k) {
      case 'flag': if (Array.isArray(v)) flagsPoses.add(v[0]); else if (typeof v === 'string') flagsPoses.add(v); else err(`${ctx} : flag mal formé`); break;
      case 'flags': if (typeof v !== 'object') err(`${ctx} : flags mal formé`); else Object.keys(v).forEach(f => flagsPoses.add(f)); break;
      case 'objet': if (!Array.isArray(v) || typeof v[1] !== 'number') err(`${ctx} : objet doit être ['id', qty]`); else objetOk(v[0], ctx); break;
      case 'objets': if (!Array.isArray(v)) err(`${ctx} : objets mal formé`); else v.forEach(o => objetOk(o[0], ctx)); break;
      case 'blessure': if (!PLAIES.has(v?.type)) err(`${ctx} : type de plaie inconnu « ${v?.type} »`);
        if (ZONES_CORPS && v?.zone && !ZONES_CORPS.includes(v.zone)) err(`${ctx} : zone du corps inconnue « ${v.zone} »`); break;
      case 'xp': Object.keys(v || {}).forEach(s => { if (!SKILLS.has(s)) err(`${ctx} : compétence inconnue « ${s} »`); }); break;
      case 'decouvrir': (Array.isArray(v) ? v : [v]).forEach(l => lieuOk(l, ctx)); break;
      case 'quete': if (!Array.isArray(v)) err(`${ctx} : quete mal formée`); else quetEtapeOk(v[0], v[1], ctx); break;
      case 'document': docsDonnes.add(v); if (!DOCUMENTS[v]) err(`${ctx} : document inconnu « ${v} »`); break;
      case 'combat': if (!Array.isArray(v?.zombies) || !v.zombies.length) err(`${ctx} : combat sans morts`);
        else v.zombies.forEach(z => { if (!ZOMBIES[z]) (Object.keys(ZOMBIES).length ? err : warn)(`${ctx} : mort inconnu « ${z} »`); });
        if (v?.lieu) lieuOk(v.lieu, ctx); break;
      case 'cinematique': cinesCibles.add(v); if (!CINEMATIQUES[v]) err(`${ctx} : cinématique inconnue « ${v} »`); break;
      case 'teleporter': lieuOk(v?.lieu, ctx); if (v?.entree) marqueursUtilises.set(`${v.lieu}:${v.entree}`, ctx); break;
      case 'journal': if (typeof v !== 'string') err(`${ctx} : journal doit être un texte`); else verifTexte(v, ctx); break;
      default: if (['pv', 'sta', 'faim', 'soif', 'fatigue', 'tempsMin', 'bruit', 'detour'].includes(k) && typeof v !== 'number') err(`${ctx} : ${k} doit être un nombre`);
    }
  }
}

const EMOJI = /\p{Extended_Pictographic}/u;
function verifTexte(t, ctx) {
  if (typeof t !== 'string') return;
  if (EMOJI.test(t)) err(`${ctx} : émoji interdit`);
  if (/·/.test(t)) err(`${ctx} : écriture inclusive « · » — utiliser {masculin|féminin}`);
  if (/undefined|\[object/.test(t)) err(`${ctx} : texte corrompu`);
  const ouvre = (t.match(/\{/g) || []).length, ferme = (t.match(/\}/g) || []).length;
  if (ouvre !== ferme) err(`${ctx} : accolades déséquilibrées`);
  for (const m of t.matchAll(/\{([^}]*)\}/g)) if (!/^[^|{}]+\|[^|{}]+$/.test(m[1])) err(`${ctx} : syntaxe de genre invalide « {${m[1]}} »`);
}

function verifSuivant(s, ctx) {
  if (s == null) return err(`${ctx} : suivant manquant`);
  if (SPECIAUX.has(s)) return;
  if (!SCENES[s]) err(`${ctx} : scène suivante inconnue « ${s} »`);
  else scenesCibles.add(s);
}

// Menus dont les choix, tous conditionnels, couvrent tous les états possibles (vérifié à la main, voir HISTOIRE.md §9).
const EXHAUSTIFS = new Set(['emp_retour_lou', 'emp_retour_nathan', 'ch1_depart', 'cal_arrivee', 'cal_retour', 'ver_berger_toi', 'fin_pont_2', 'stl_lou', 'ver_rose_2']);

// ─── 1. Scènes ───
const vus = new Map();
for (const [partie, obj] of Object.entries(PARTIES_SCENES)) for (const id of Object.keys(obj)) {
  if (vus.has(id)) err(`scène en double « ${id} » (${vus.get(id)} et ${partie})`); else vus.set(id, partie);
}
for (const [id, sc] of Object.entries(SCENES)) {
  const c = `scène ${id}`;
  if (!/^[a-z0-9_]+$/.test(id)) err(`${c} : id non snake_case`);
  if (typeof sc.texte !== 'string' || !sc.texte.trim()) err(`${c} : texte vide`);
  verifTexte(sc.texte, c);
  if (sc.illu != null && !DECORS_SET.has(sc.illu)) err(`${c} : illu « ${sc.illu} » absente de DECORS`);
  if (!MUSIQUES_SCENE.has(sc.musique ?? null)) err(`${c} : musique inconnue « ${sc.musique} »`);
  if (sc.auto) verifSuivant(sc.auto.suivant, `${c}.auto`);
  if (!sc.auto && (!Array.isArray(sc.choix) || !sc.choix.length)) err(`${c} : ni choix ni auto`);
  (sc.choix || []).forEach((ch, i) => {
    const cc = `${c}.choix[${i}]`;
    if (!ch.label) err(`${cc} : label manquant`); else verifTexte(ch.label, cc);
    verifCondition(ch.si, `${cc}.si`); verifCondition(ch.besoin, `${cc}.besoin`);
    verifEffets(ch.effets, `${cc}.effets`);
    if (ch.test) {
      if (ch.test.skill && !SKILLS.has(ch.test.skill)) err(`${cc} : compétence de test inconnue`);
      if (!ch.test.skill && typeof ch.test.chance !== 'number') err(`${cc} : test mal formé`);
      for (const r of ['reussite', 'echec']) {
        if (!ch[r]) { err(`${cc} : ${r} manquant`); continue; }
        verifTexte(ch[r].texte, `${cc}.${r}`); verifEffets(ch[r].effets, `${cc}.${r}.effets`); verifSuivant(ch[r].suivant, `${cc}.${r}`);
      }
    } else verifSuivant(ch.suivant, cc);
  });
  if (sc.timerMs) {
    if (!sc.timeout) err(`${c} : timerMs sans timeout`);
    else { verifTexte(sc.timeout.texte, `${c}.timeout`); verifEffets(sc.timeout.effets, `${c}.timeout.effets`); verifSuivant(sc.timeout.suivant, `${c}.timeout`); }
  }
  // Un menu dont TOUS les choix sont conditionnels peut bloquer le joueur : on le signale.
  const complementaires = (sc.choix || []).some(a => a.si?.flag && (sc.choix || []).some(b => b.si?.pasFlag === a.si.flag));
  if (sc.choix && sc.choix.length && sc.choix.every(ch => ch.si) && !complementaires && !EXHAUSTIFS.has(id)) warn(`${c} : tous les choix ont une condition (vérifier qu'au moins un est toujours vrai)`);
}

// ─── 2. Quêtes ───
for (const [id, q] of Object.entries(QUETES)) {
  if (!q.titre || typeof q.chapitre !== 'number' || !q.etapes) err(`quête ${id} : titre/chapitre/etapes manquants`);
  for (const [e, et] of Object.entries(q.etapes || {})) { if (!et.objectif) err(`quête ${id}.${e} : objectif vide`); if (et.lieu) lieuOk(et.lieu, `quête ${id}.${e}`); }
}

// ─── 3. Déclencheurs ───
DECLENCHEURS.forEach((d, i) => {
  const c = `déclencheur[${i}] (${d.quand} ${d.lieu || ''} ${d.marqueur || ''})`;
  if (!DECL_QUAND.has(d.quand)) err(`${c} : quand inconnu`);
  if (d.lieu) lieuOk(d.lieu, c);
  if (d.de) lieuOk(d.de, c); if (d.vers) lieuOk(d.vers, c);
  verifCondition(d.si, `${c}.si`);
  const actions = ['scene', 'cinematique', 'rencontre'].filter(k => d[k]);
  if (actions.length !== 1) err(`${c} : il faut exactement une action (scene | cinematique | rencontre)`);
  if (d.scene) { if (!SCENES[d.scene]) err(`${c} : scène inconnue « ${d.scene} »`); scenesCibles.add(d.scene); }
  if (d.cinematique) { if (!CINEMATIQUES[d.cinematique]) err(`${c} : cinématique inconnue`); cinesCibles.add(d.cinematique); }
  if (d.rencontre) { rencCibles.add(d.rencontre); if (!RENCONTRES_HISTOIRE.find(r => r.id === d.rencontre)) err(`${c} : rencontre inconnue « ${d.rencontre} »`); }
  if (d.quand === 'marqueur') { if (!d.marqueur) err(`${c} : marqueur manquant`); else marqueursUtilises.set(`${d.lieu}:${d.marqueur}`, c); }
  if (d.quand === 'voyage' && (typeof d.a !== 'number' || d.a <= 0 || d.a >= 1)) err(`${c} : a doit être dans ]0,1[`);
  if (d.quand === 'flag' && !d.flag) err(`${c} : flag manquant`);
});

// ─── 4. Documents ───
for (const [id, d] of Object.entries(DOCUMENTS)) {
  const c = `document ${id}`;
  if (!d.titre || !d.texte) err(`${c} : titre ou texte manquant`);
  if (!STYLES_DOC.has(d.style)) err(`${c} : style inconnu « ${d.style} »`);
  verifTexte(d.texte, c); verifTexte(d.titre, c);
  if (d.lieu) lieuOk(d.lieu, c);
  if (d.marqueur) { if (!d.lieu) err(`${c} : marqueur sans lieu`); else marqueursUtilises.set(`${d.lieu}:${d.marqueur}`, c); }
  if (!d.lieu && !docsDonnes.has(id)) err(`${c} : ni lieu, ni donné par une scène — introuvable`);
}

// ─── 5. PNJ ───
for (const [id, p] of Object.entries(PNJ)) {
  const c = `pnj ${id}`;
  if (!p.nom || !p.portrait) err(`${c} : nom/portrait manquant`);
  lieuOk(p.lieu, c);
  if (!SCENES[p.scene]) err(`${c} : scène inconnue « ${p.scene} »`); else scenesCibles.add(p.scene);
  if (!p.marqueur) err(`${c} : marqueur manquant`); else marqueursUtilises.set(`${p.lieu}:${p.marqueur}`, c);
  verifCondition(p.si, `${c}.si`);
}

// ─── 6. Rencontres ───
const idsRenc = new Set();
for (const r of RENCONTRES_HISTOIRE) {
  const c = `rencontre ${r.id}`;
  if (!/^rh_[a-z0-9_]+$/.test(r.id || '')) err(`${c} : id doit commencer par rh_`);
  if (idsRenc.has(r.id)) err(`${c} : en double`); idsRenc.add(r.id);
  if (!TYPES_RENC.has(r.type)) err(`${c} : type inconnu`);
  if (typeof r.poids !== 'number') err(`${c} : poids manquant`);
  if (r.poids === 0 && !rencCibles.has(r.id)) warn(`${c} : poids 0 et aucun déclencheur ne la lance`);
  verifCondition(r.si, `${c}.si`);
  if (r.illu && !DECORS_SET.has(r.illu)) err(`${c} : illu absente de DECORS`);
  if (r.type === 'choix' || r.type === 'pnj') { if (!SCENES[r.scene]) err(`${c} : scène inconnue « ${r.scene} »`); else scenesCibles.add(r.scene); }
  if (r.type === 'combat') verifEffets({ combat: r.combat }, c);
  if ((r.type === 'ambiance' || r.type === 'combat') && !r.texte) err(`${c} : texte manquant`);
  if (r.texte) verifTexte(r.texte, c);
  if (r.effets) verifEffets(r.effets, `${c}.effets`);
}

// ─── 7. Lieux du récit ───
for (const id of Object.keys(LIEUX_GEO)) if (!LIEUX_RECIT[id]) err(`lieux_recit : lieu « ${id} » non couvert`);
let nbCles = 0;
for (const [id, l] of Object.entries(LIEUX_RECIT)) {
  const c = `lieux_recit.${id}`;
  if (!LIEUX_GEO[id]) err(`${c} : absent de lieux.js`);
  if (!l.desc) err(`${c} : desc vide`); verifTexte(l.desc, c);
  if (typeof l.decouvert !== 'boolean') err(`${c} : decouvert doit être booléen`);
  if (!ROLES.has(l.role)) err(`${c} : role inconnu`);
  if (l.role === 'cle') { nbCles++; if (!niveauxMd.includes('`' + id + '`')) err(`${c} : lieu clé non décrit dans NIVEAUX_BESOINS.md`); }
}
if (nbCles > 14) err(`lieux clés : ${nbCles} > 14`);

// ─── 8. Objets de quête ───
for (const [id, o] of Object.entries(OBJETS_QUETE)) {
  const c = `objet ${id}`;
  if (ITEMS[id]) err(`${c} : collision avec items.js`);
  if (!['quete', 'lore'].includes(o.type)) err(`${c} : type doit être quete|lore`);
  if (!o.nom || !o.desc || typeof o.poids !== 'number' || typeof o.espace !== 'number') err(`${c} : nom/desc/poids/espace manquant`);
  verifTexte(o.desc, c);
}

// ─── 9. Morts, fins ───
for (const k of MORTS_REQUISES) if (!MORTS[k]) err(`morts : cause « ${k} » manquante`);
Object.entries(MORTS).forEach(([k, t]) => verifTexte(t, `morts.${k}`));
for (const [id, f] of Object.entries(FINS)) {
  if (!CINEMATIQUES[f.cinematique]) err(`fin ${id} : cinématique inconnue`);
  if (!SCENES[f.scene]) err(`fin ${id} : scène inconnue`);
  if (!flagsPoses.has(f.flag)) err(`fin ${id} : drapeau « ${f.flag} » jamais posé`);
}

// ─── 10. Cinématiques et décors ───
for (const d of DECORS) if (!histoireMd.includes('`' + d + '`')) err(`décor « ${d} » non décrit dans HISTOIRE.md (briefs)`);
for (const [id, cin] of Object.entries(CINEMATIQUES)) {
  const c = `cinématique ${id}`;
  if (!MUSIQUES_CINE.has(cin.musique)) err(`${c} : musique inconnue`);
  if (!Array.isArray(cin.plans) || !cin.plans.length) { err(`${c} : aucun plan`); continue; }
  cin.plans.forEach((p, i) => {
    const cc = `${c}.plans[${i}]`;
    if (!DECORS_SET.has(p.decor)) err(`${cc} : décor « ${p.decor} » absent de DECORS`);
    if (typeof p.duree !== 'number' || p.duree < 1000) err(`${cc} : durée invalide`);
    if (!p.camera?.de || !p.camera?.vers || typeof p.camera.de.zoom !== 'number' || typeof p.camera.vers.zoom !== 'number') err(`${cc} : caméra mal formée`);
    if (typeof p.texte !== 'string') err(`${cc} : texte manquant`); else verifTexte(p.texte, cc);
  });
  if (!cin.plans.some(p => p.attendre)) warn(`${c} : aucun plan « attendre »`);
  if (id !== 'intro' && !cinesCibles.has(id)) warn(`${c} : jamais déclenchée`);
}
if (!CINEMATIQUES.intro) err('cinématique « intro » manquante');

// ─── 11. Marqueurs de niveau documentés ───
for (const [clef, ctx] of marqueursUtilises) {
  const m = clef.split(':')[1];
  if (!niveauxMd.includes('`' + m + '`')) err(`${ctx} : marqueur/entrée « ${m} » non documenté dans NIVEAUX_BESOINS.md`);
}

// ─── 12. Drapeaux ───
const FLAGS_MOTEUR = new Set([]);
for (const [f, ctxs] of flagsTestes) if (!flagsPoses.has(f) && !FLAGS_MOTEUR.has(f)) err(`drapeau « ${f} » testé mais jamais posé (${ctxs[0]})`);

// ─── 13. Scènes orphelines ───
const racines = new Set([...scenesCibles]);
for (const id of Object.keys(SCENES)) if (!racines.has(id)) warn(`scène orpheline « ${id} » (aucun lien vers elle)`);

// ─── Bilan ───
const stats = `${Object.keys(SCENES).length} scènes, ${Object.keys(QUETES).length} quêtes, ${DECLENCHEURS.length} déclencheurs, ` +
  `${Object.keys(DOCUMENTS).length} documents, ${Object.keys(PNJ).length} PNJ, ${RENCONTRES_HISTOIRE.length} rencontres, ` +
  `${Object.keys(LIEUX_RECIT).length} lieux (${nbCles} clés), ${Object.keys(OBJETS_QUETE).length} objets, ` +
  `${Object.keys(CINEMATIQUES).length} cinématiques, ${DECORS.length} décors, ${flagsPoses.size} drapeaux`;
for (const a of avertissements) console.log('  avertissement : ' + a);
for (const e of erreurs) console.log('  ERREUR : ' + e);
console.log(`\n${stats}`);
console.log(erreurs.length ? `ÉCHEC : ${erreurs.length} erreur(s), ${avertissements.length} avertissement(s).` : `OK — ${avertissements.length} avertissement(s).`);
process.exit(erreurs.length ? 1 : 0);
