// ============ Survie — besoins, blessures, infection, le mal, maladies, froid, soins, sommeil (sans DOM) ============
// Règles : GAMEPLAY §5 ; nombres : REGLAGES.survie (+ competences, difficulte). Contrat REFONTE §12.6.
// Branché sur l'horloge par demarrerSurvie() (bus 'minute' → tickMinutes). Émet 'blessure', 'mort' {cause},
// 'survie' (changement d'état), 'toast', et pour les autres temps : 'survie:vomit', 'survie:toux',
// 'survie:evanoui', 'survie:intrusion' {surprise}.
//
// Blessure (G.player.blessures[i]) : { uid, type, zone, gravite, saigne, infecte, bandee, bandage: 'propre'|'sale'|'miel'|null,
//   suturee, attelle, nettoyee, desinfectee, desinfJusqua (minute monde), souillee, animale, onguent,
//   age (min), guerison (0..1), mal (points de mal apportés), cree (minute monde) }
import { G, genrer } from '../core/state.js';
import { emit, on } from '../core/bus.js';
import * as clock from '../core/clock.js';
import { REGLAGES, presetDifficulte } from '../data/reglages.js';
import { ITEMS } from '../data/items.js';
import { ZOMBIES } from '../data/zombies.js';
import { niveau, gagnerXps, normaliserJoueur } from './player.js';
import * as inv from './inventory.js';

const S = () => REGLAGES.survie;
const joueur = (p) => p || (G && G.player);
const diff = () => presetDifficulte(G && G.world && G.world.difficulte);
const maintenant = () => (G ? G.world.minutes : 0);
const parMin = (pH) => pH <= 0 ? 0 : (pH >= 1 ? 1 : 1 - Math.pow(1 - pH, 1 / 60)); // chance/h → chance/min
let uidBlessure = 1;

// ---------- Contexte (fourni par les autres temps) ----------
// exterieur : dehors ? ; feuProche : à ≤ 3 cases d'un feu ; meteo : 'clair'|'mistral'|'pluie'|… ; lieuSur : barricadé/refuge.
// abrite : sous un toit (bâtiment, ou toit construit) — la pluie ne mouille pas ; pluie : intensité 0 / 0,55 / 1.
const contexte = { exterieur: null, abrite: null, pluie: 0, feuProche: false, meteo: 'clair', lieuSur: false, sourceEau: null, lumiere: true };
export function setContexteSurvie(patch) { Object.assign(contexte, patch || {}); emit('survie', { contexte: true }); }
export function contexteSurvie() { return { ...contexte }; }
function estDehors(p) { if (contexte.exterieur != null) return contexte.exterieur; return !!(p.position && p.position.mode === 'voyage'); }

// ---------- Activité courante (multiplicateur des besoins) ----------
// 'normal' | 'course' | 'combat' | 'voyage_rapide' | 'fabrication' | 'repos' | 'sommeil'
let activiteCourante = 'normal';
export function setActivite(a) { activiteCourante = a || 'normal'; }
export function activite() { return activiteCourante; }

// ---------- Douleur, froid ----------
export function douleur(p) {
  p = joueur(p); if (!p) return 0; const B = S().BLESSURES, D = S().DOULEUR, E = p.effets || {};
  let d = 0;
  for (const b of p.blessures || []) {
    const t = B[b.type]; if (!t) continue;
    let x = t.douleur * (1 - 0.7 * (b.guerison || 0));
    if (b.onguent) x = Math.max(0, x - 15);
    if (b.infecte) x += S().INFECTION.DOULEUR;
    if (b.type === 'fracture' && !b.attelle) x += S().FRACTURE_SANS_ATTELLE.douleur;
    d += x;
  }
  if (p.maladies && p.maladies.fievre) d += 10;
  if ((E.douleurAigue || 0) > 0) d += E.douleurAigueV || 0;
  const eff = 1 + S().SOINS.MEDECINE_EFFICACITE * (E.medecineNiv || 0);
  if ((E.antidouleur || 0) > 0) d -= D.ANTIDOULEUR.reduc * eff;
  if ((E.alcool || 0) > 0) d -= D.ALCOOL.reduc;
  if ((E.tisane || 0) > 0) d -= D.TISANE.reduc;
  return Math.max(0, Math.min(100, Math.round(d)));
}
export function besoinChaleur(p) {
  p = joueur(p); const F = S().FROID, nuit = clock.estNuit();
  const dehors = estDehors(p);
  let b = F.BESOIN[(dehors ? 'exterieur_' : 'interieur_') + (nuit ? 'nuit' : 'jour')];
  const saison = (G && G.world.flags && G.world.flags.saison) || F.SAISON_DEFAUT;
  b += F.SAISON[saison] || 0;
  const M = (REGLAGES.meteo.EFFETS[contexte.meteo] || {});
  if (dehors) b += M.froid || 0;
  b += S().MOUILLE.FROID[stadeMouille(p)] || 0;   // des vêtements mouillés glacent, même à l'abri, tant qu'ils n'ont pas séché
  if (contexte.feuProche) b += F.FEU_PROCHE;
  return b;
}
// ---------- Mouillé ----------
// Stade 0 (sec) à 4 (trempé jusqu'aux os), d'après la jauge p.mouille (0..100).
export function stadeMouille(p) { p = joueur(p); const v = (p && p.mouille) || 0; let n = 0; S().MOUILLE.SEUILS.forEach((s, i) => { if (v >= s) n = i + 1; }); return n; }
export function sousLaPluie(p) { p = joueur(p); return !!(contexte.pluie > 0 && estDehors(p) && !contexte.abrite); }
function majMouille(p) {
  const MO = S().MOUILLE;
  if (sousLaPluie(p)) p.mouille = Math.min(100, (p.mouille || 0) + MO.PLUIE_PAR_MIN[contexte.pluie >= 1 ? 'forte' : 'legere'] * inv.facteurPluie(p));
  else if (p.mouille > 0) p.mouille = Math.max(0, p.mouille - (contexte.feuProche ? MO.SECHE_PAR_MIN.feu : estDehors(p) && !contexte.abrite ? MO.SECHE_PAR_MIN.dehors_sec : MO.SECHE_PAR_MIN.abri));
}
export function deficitFroid(p) {
  p = joueur(p); if (!p) return 0;
  let besoin = besoinChaleur(p), chaleur = inv.chaleurVetements(p);
  const ec = effetsCorpulence(p); if (ec) chaleur += ec.chaleur || 0;   // la graisse isole, la maigreur glace
  // en dormant : le sol pompe la chaleur ; un sac de couchage, une couverture tiennent chaud (sur soi ou à portée de main)
  if (activiteCourante === 'sommeil') {
    const SO = S().SOMMEIL;
    besoin += (SO.COUCHAGE[couchageEnCours] || {}).froid || 0;
    for (const [id, c] of Object.entries(SO.CHALEUR_SOMMEIL)) if (inv.countDispo(id, p) > 0) chaleur += c;
  }
  return Math.max(0, besoin - chaleur);
}
// ---------- Couchage (docs/GAMEPLAY.md §5.7) ----------
// Catégorie d'un couchage : 'sol' | 'mauvais' | 'moyen' | 'correct'. type = objet de plan ou construction ; force = ce
// que le plan impose ({ couchage: 'moyen' }). Par terre ou sur un mauvais couchage, un sac de couchage donne « moyen ».
export function categorieCouchage(type, force, p) {
  const SO = S().SOMMEIL;
  let c = force || (type && SO.COUCHAGES[type]) || 'sol';
  if ((c === 'sol' || c === 'mauvais') && inv.countDispo(SO.SAC_COUCHAGE, joueur(p)) > 0) c = 'moyen';
  return c;
}
export const parametresCouchage = (c) => S().SOMMEIL.COUCHAGE[c] || S().SOMMEIL.COUCHAGE.sol;
let couchageEnCours = 'sol';

// ---------- Blessures ----------
// b = { type, zone, gravite?, saigne?, mal? (points déjà calculés), zombie? (id du mort : points calculés ici),
//       souillee?, animale? } ; opts = { degats? (PV retirés), mal? } → la blessure créée.
export function infligerBlessure(p, b, opts = {}) {
  p = normaliserJoueur(joueur(p)); if (!p || !b) return null;
  let type = b.type === 'morsure_animale' ? 'morsure' : b.type;
  const T = S().BLESSURES[type];
  if (!T) { console.warn('[survie] blessure inconnue', b.type); return null; }
  const z = b.zombie ? ZOMBIES[b.zombie] : null;
  const animale = !!(b.animale || b.type === 'morsure_animale' || (z && z.animal));
  const w = {
    uid: `b${Date.now().toString(36)}${uidBlessure++}`, type, zone: b.zone || 'au bras', gravite: b.gravite || T.gravite,
    saigne: b.saigne != null ? !!b.saigne : Math.random() < T.pSaigne, infecte: false, bandee: false, bandage: null,
    suturee: false, attelle: false, nettoyee: false, desinfectee: false, desinfJusqua: 0,
    souillee: !!(b.souillee || (z && z.souille)), animale, age: 0, guerison: 0, mal: 0, cree: maintenant(),
  };
  // Points de mal : donnés par le combat (b.mal / opts.mal), sinon calculés depuis le mort.
  let mal = opts.mal ?? b.mal;
  if (mal == null && z && !z.vivant) mal = (S().CONTAMINATION.POINTS[type] || 0) * (z.infection || 0) * (diff().contamination ?? 1);
  mal = Math.max(0, mal || 0);
  w.mal = mal;
  p.blessures.push(w);
  if (mal) ajouterMal(p, mal);
  if (opts.degats) retirerPv(p, opts.degats, 'combat');
  emit('blessure', { blessure: w, index: p.blessures.length - 1 });
  return w;
}
export function ajouterMal(p, n) {
  p = joueur(p); p.mal = Math.max(0, Math.min(100, (p.mal || 0) + n));
  emit('survie', { mal: p.mal }); verifierMort(p, 'rechute');
}
export function reduireMal(n, p) { ajouterMal(joueur(p), -Math.abs(n)); }
function retirerPv(p, n, cause) {
  p.pv = Math.max(0, p.pv - n);
  if (n > 0) p._cause = cause;
  verifierMort(p);
}

// ---------- Mort ----------
export function causeMort(p) {
  p = joueur(p); if (!p) return null;
  if (p.mort) return p.mort;
  if ((p.mal || 0) >= S().CONTAMINATION.SEUILS.rechute) return 'rechute';
  if (p.pv <= 0) return p._cause || 'combat';
  return null;
}
// Co-op : une mort peut être interceptée (« à terre », le coéquipier peut te relever). fn(p, cause) → true si gérée.
let intercepteur = null;
export function intercepterMort(fn) { intercepteur = fn; }
function verifierMort(p) {
  const c = causeMort(p);
  if (c && !p.mort) {
    if (intercepteur && c !== 'rechute') { try { if (intercepteur(p, c)) return null; } catch (e) { console.warn(e); } }
    p.mort = c; emit('mort', { cause: c });
  }
  return c;
}

// ---------- Le tic de survie ----------
// delta : minutes de jeu écoulées ; activite : voir setActivite. Pas à pas d'une minute (déterministe par joueur).
export function tickMinutes(delta, activite = activiteCourante, p) {
  p = normaliserJoueur(joueur(p)); if (!p || p.mort || delta <= 0) return;
  const avant = signature(p);
  for (let i = 0; i < delta && !p.mort; i++) uneMinute(p, activite);
  recalculerStaMax(p);
  const apres = signature(p);
  if (apres !== avant) emit('survie', {});
}
function signature(p) { return etatsCorps(p).map(m => m.id + m.niveau).join(',') + '|' + p.blessures.length; }

function uneMinute(p, act) {
  const SV = S(), E = SV.EFFETS, SE = SV.SEUILS, MUL = SV.MULT_ACTIVITE, CT = SV.CONTAMINATION, INF = SV.INFECTION;
  const dort = act === 'sommeil';
  const mAct = MUL[act] || 1, besoins = diff().besoins ?? 1, f = inv.surpoids(p).f;
  majMouille(p);
  const mal = p.mal || 0, fievre = !!p.maladies.fievre, d = deficitFroid(p), sm = stadeMouille(p);
  // Besoins
  p.faim -= SV.FAIM_PAR_MIN * besoins * (mal >= CT.SEUILS.noirceur ? 1.25 : 1);
  p.soif -= SV.SOIF_PAR_MIN * besoins * mAct * (fievre ? SV.MALADIES.fievre.soif : 1) * (mal >= CT.SEUILS.fievre_noire ? 1.5 : 1)
    + (p.maladies.intoxication ? SV.MALADIES.intoxication.soifParMin : 0);
  const CO = dort ? parametresCouchage(couchageEnCours) : null;
  if (dort) { if (p.fatigue < CO.plafond) p.fatigue = Math.min(CO.plafond, p.fatigue + SV.SOMMEIL.FATIGUE_PAR_MIN * CO.fatigue); }
  else p.fatigue -= SV.FATIGUE_PAR_MIN * besoins * mAct * (fievre ? SV.MALADIES.fievre.fatigue : 1) * (1 + REGLAGES.inventaire.SURPOIDS.fatigue * f) + SV.FROID.FATIGUE_PAR_POINT * d + SV.MOUILLE.FATIGUE_PAR_MIN[sm];
  p.faim = clamp(p.faim); p.soif = clamp(p.soif); p.fatigue = clamp(p.fatigue);
  // L'estomac se vide en digérant ; le poids suit la faim (bien nourri·e : on en prend, affamé·e : on en perd)
  const RP0 = SV.REPAS, CO0 = SV.CORPS;
  if (p.estomac > 0) p.estomac = Math.max(0, p.estomac - RP0.ESTOMAC_VIDANGE_MIN);
  if (CO0) {
    let kgJ = 0; for (const [s, v] of CO0.KG_JOUR) if (p.faim >= s) { kgJ = v; break; }
    if (dort && kgJ < 0) kgJ *= CO0.SOMMEIL;    // on brûle moins en dormant
    const ref = p.poidsRef || CO0.REF.m;
    p.poidsCorps = Math.max(ref * CO0.BORNES[0], Math.min(ref * CO0.BORNES[1], (p.poidsCorps ?? ref) + kgJ / 1440));
  }
  // Pertes de PV
  let perte = 0, cause = null;
  const perdre = (n, c) => { if (n > 0) { perte += n; if (!cause || n > 0.03) cause = c; } };
  if (p.faim <= 0) perdre(E.PV_FAIM_0, 'faim');
  if (p.soif <= 0) perdre(E.PV_SOIF_0, 'soif');
  if (d >= SV.FROID.PV_SEUIL) perdre(SV.FROID.PV_PAR_POINT * (d - 2), 'froid');
  if (p.maladies.intoxication) perdre(SV.MALADIES.intoxication.pvParMin, 'maladie');
  if (fievre) perdre(SV.MALADIES.fievre.pvParMin, 'maladie');
  if (mal >= CT.SEUILS.delire) perdre(0.02, 'rechute');
  // Blessures
  const infDiff = diff().infection ?? 1; let saigne = false, infectee = false;
  for (const b of p.blessures) {
    const T = SV.BLESSURES[b.type]; if (!T) continue;
    b.age = (b.age || 0) + 1;
    if (b.saigne) {
      saigne = true; perdre(T.saigne, 'hemorragie');
      if (Math.random() < parMin(T.arret)) b.saigne = false;
    } else if (T.suture && !b.suturee && !b.bandee && Math.random() < parMin(SV.REOUVERTURE_H)) b.saigne = true;
    const desinfActive = b.desinfJusqua > maintenant();
    if (b.infecte) {
      infectee = true; perdre(INF.PV_PAR_MIN, 'infection');
      const recul = desinfActive ? INF.RECUL_H.desinfection : (b.nettoyee ? INF.RECUL_H.nettoyee : 0);
      if (Math.random() < parMin(recul)) b.infecte = false;
      if (!p.maladies.fievre && Math.random() < parMin(INF.FIEVRE_H)) { p.maladies.fievre = { reste: SV.MALADIES.fievre.finApresMin }; emit('toast', { texte: 'La fièvre monte.', type: 'mauvais' }); }
    } else if (T.infH > 0) {
      let m = infDiff;
      if (b.nettoyee) m *= INF.NETTOYEE;
      m *= desinfActive ? INF.DESINFECTION_ACTIVE : (b.desinfectee ? INF.DESINFECTEE : 1);
      if (b.bandee) m *= b.bandage === 'miel' ? INF.PANSEMENT_MIEL : (b.bandage === 'sale' ? INF.BANDAGE_SALE : INF.BANDAGE_PROPRE);
      if (b.souillee) m *= INF.SOUILLEE;
      if (b.animale) m *= INF.ANIMALE;
      if (Math.random() < parMin(T.infH * m)) { b.infecte = true; emit('toast', { texte: `Ta plaie ${b.zone} s'est infectée.`, type: 'mauvais' }); emit('blessure', { infection: b.uid }); }
    }
    // Guérison
    if (!b.saigne && !b.infecte) {
      let h = T.guerisonH;
      if (b.bandee) h *= 0.75;
      if (T.suture && !b.suturee) h *= 2;
      if (b.type === 'fracture') h *= b.attelle ? 0.6 : SV.FRACTURE_SANS_ATTELLE.guerison;
      if (b.onguent) h /= 1.5;
      if (dort) h *= CO.guerison;
      b.guerison = Math.min(1, (b.guerison || 0) + 1 / (h * 60));
    }
  }
  const gueries = p.blessures.filter(b => b.guerison >= 1);
  if (gueries.length) {
    p.blessures = p.blessures.filter(b => b.guerison < 1);
    for (const b of gueries) emit('toast', { texte: `${SV.BLESSURES[b.type].nom} ${b.zone} : guérie.`, type: 'bon' });
    emit('blessure', { gueries: gueries.length });
  }
  // Maladies
  const Mx = p.maladies;
  if (Mx.intoxication && --Mx.intoxication.reste <= 0) { delete Mx.intoxication; emit('toast', { texte: 'Ton ventre se calme.', type: 'bon' }); }
  if (Mx.fievre) { if (infectee) Mx.fievre.reste = SV.MALADIES.fievre.finApresMin; else if (--Mx.fievre.reste <= 0) { delete Mx.fievre; emit('toast', { texte: 'La fièvre tombe.', type: 'bon' }); } }
  if (Mx.rhume && (Mx.rhume.reste -= ((p.effets.tisane || 0) > 0 ? 2 : 1)) <= 0) delete Mx.rhume;
  if (!Mx.rhume && (d > 0 || sm >= 2) && Math.random() < parMin(SV.FROID.RHUME_H * d + SV.MOUILLE.RHUME_H[sm])) { Mx.rhume = { reste: 60 * rngInt(...SV.MALADIES.rhume.dureeH) }; emit('toast', { texte: 'Tu as pris froid.', type: 'mauvais' }); }
  p.maladie = Mx.intoxication ? 'intoxication' : Mx.fievre ? 'fievre' : Mx.rhume ? 'rhume' : null;
  // Effets temporaires
  const Ef = p.effets;
  for (const k of ['antidouleur', 'alcool', 'tisane', 'vitamines', 'douleurAigue', 'nausee', 'courbatures']) if (Ef[k] > 0) Ef[k]--;
  if (Ef.antibioDans > 0 && --Ef.antibioDans <= 0) {
    let n = 0; for (const b of p.blessures) if (b.infecte) { b.infecte = false; n++; }
    delete Mx.fievre; if (n) emit('toast', { texte: 'Les antibiotiques ont fait leur œuvre.', type: 'bon' });
  }
  if (Ef.charbonDans > 0 && --Ef.charbonDans <= 0) delete Mx.intoxication;
  // Le mal décline
  if (p.mal > 0 && p.mal < 100) {
    const dec = (dort ? CT.DECLIN_PAR_MIN.sommeil : CT.DECLIN_PAR_MIN.eveille) * ((Ef.vitamines || 0) > 0 ? CT.VITAMINES : 1);
    p.mal = Math.max(0, p.mal - dec);
  }
  // Régénération
  if (!saigne && !infectee && p.faim >= 40 && p.soif >= 40 && (p.mal || 0) < CT.SEUILS.fievre_noire)
    p.pv = Math.min(p.pvMax, p.pv + (dort ? SV.PV_REGEN.sommeil * CO.pv : SV.PV_REGEN.eveille));
  if (act !== 'combat') p.sta = Math.min(p.staMax, p.sta + (dort ? 100 : SV.STA_HORS_COMBAT.repos * ((Ef.courbatures || 0) > 0 ? (Ef.courbaturesSta || 1) : 1)));
  if (perte > 0) retirerPv(p, perte, cause);
  // Évanouissement
  if (p.fatigue <= 0 && !dort && !p._evanoui) { p._evanoui = true; emit('survie:evanoui', {}); emit('toast', { texte: 'Tes jambes lâchent. Tu t\'effondres.', type: 'mauvais' }); }
  if (p.fatigue > 10) p._evanoui = false;
}
const clamp = (v) => Math.max(0, Math.min(100, v));
const rngInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function recalculerStaMax(p) {
  p = joueur(p); const SV = S(), SE = SV.SEUILS, E = SV.EFFETS, M = SV.CONTAMINATION.SEUILS;
  let m = p.staMaxBase || SV.STA_MAX;
  if (p.faim < SE.faim.grave) m -= E.STAMAX_FAIM;
  if (p.soif < SE.soif.grave) m -= E.STAMAX_SOIF;
  if (p.fatigue < SE.fatigue.grave) m -= E.STAMAX_EPUISE; else if (p.fatigue < SE.fatigue.gene) m -= E.STAMAX_FATIGUE;
  if (p.mal >= M.fievre_noire) m -= 20; else if (p.mal >= M.noirceur) m -= 10;
  if (p.maladies && p.maladies.rhume) m += SV.MALADIES.rhume.staMax;
  const ec = effetsCorpulence(p); if (ec) m += ec.staMax || 0;
  p.staMax = Math.max(20, m); p.sta = Math.min(p.sta, p.staMax);
  return p.staMax;
}

// ---------- Moodles (états du corps, façon Project Zomboid) ----------
// → [{ id, niveau (1..4), label, detail, mauvais: bool }] — seulement ce qui compte.
export function etatsCorps(p) {
  p = joueur(p); if (!p) return []; const r = [], SE = S().SEUILS;
  const jauge = (id, v, seuils, labels, detail) => {
    let n = 0; seuils.forEach((s, i) => { if (v < s) n = i + 1; });
    if (n) r.push({ id, niveau: n, label: labels[n - 1], detail, mauvais: true });
  };
  jauge('faim', p.faim, [55, SE.faim.gene, SE.faim.grave, 1], ['Un petit creux', 'Faim', 'Affamé{|e}', 'Affamé{|e}, faible'], 'Mange quelque chose.');
  jauge('soif', p.soif, [SE.soif.gene + 15, SE.soif.gene, SE.soif.grave, 1], ['La bouche sèche', 'Assoiffé{|e}', 'Déshydraté{|e}', 'Tu meurs de soif'], 'Bois. De l\'eau propre si possible.');
  jauge('fatigue', p.fatigue, [SE.fatigue.gene + 20, SE.fatigue.gene, SE.fatigue.grave, 5], ['Las{|se}', 'Fatigué{|e}', 'Épuisé{|e}', 'Tu tombes de sommeil'], 'Dors dans un lieu sûr.');
  const dl = douleur(p), D = S().DOULEUR.SEUILS;
  if (dl > 10) r.push({ id: 'douleur', niveau: dl > D[2] ? 4 : dl > D[1] ? 3 : dl > D[0] ? 2 : 1, label: dl > D[2] ? 'Douleur atroce' : dl > D[1] ? 'Forte douleur' : dl > D[0] ? 'Douleur' : 'Douleur légère', detail: `Douleur ${dl}/100. Antidouleurs : −40 pendant 4 h.`, mauvais: true });
  const saign = p.blessures.filter(b => b.saigne);
  if (saign.length) {
    const debit = saign.reduce((s, b) => s + S().BLESSURES[b.type].saigne, 0);
    r.push({ id: 'saignement', niveau: debit >= 0.15 ? 4 : debit >= 0.08 ? 3 : debit >= 0.04 ? 2 : 1, label: debit >= 0.08 ? 'Hémorragie' : 'Saignement', detail: `${saign.length} plaie${saign.length > 1 ? 's' : ''} saigne${saign.length > 1 ? 'nt' : ''} (−${Math.round(debit * 60)} PV/h). Bande-la.`, mauvais: true });
  }
  const inf = p.blessures.filter(b => b.infecte).length;
  if (inf) r.push({ id: 'infection', niveau: Math.min(4, inf + 1), label: 'Plaie infectée', detail: 'Désinfecte, ou prends des antibiotiques.', mauvais: true });
  if (p.maladies.fievre) r.push({ id: 'fievre', niveau: 2, label: 'Fièvre', detail: 'Soif et fatigue accrues. Tisane ou antibiotiques.', mauvais: true });
  if (p.maladies.intoxication) r.push({ id: 'malade', niveau: 3, label: 'Intoxication', detail: 'Tu vomis. Charbon actif : fin en 30 min.', mauvais: true });
  if (p.maladies.rhume) r.push({ id: 'rhume', niveau: 1, label: 'Enrhumé{|e}', detail: 'Tu tousses : ça s\'entend.', mauvais: true });
  const sm = stadeMouille(p);
  if (sm) r.push({ id: 'mouille', niveau: sm, label: ['Humide', 'Mouillé{|e}', 'Trempé{|e}', 'Trempé{|e} jusqu\'aux os'][sm - 1], detail: sm >= 3 ? 'Tes vêtements te glacent et te ralentissent. Mets-toi à l\'abri, près d\'un feu.' : 'Mets-toi à l\'abri pour sécher (plus vite près d\'un feu).', mauvais: sm >= 2 });
  const d = deficitFroid(p);
  if (d > 0) r.push({ id: 'froid', niveau: Math.min(4, d), label: d >= 3 ? 'Transi{|e}' : d >= 2 ? 'Tu grelottes' : 'Frais', detail: `Il te manque ${d} de chaleur. Couvre-toi, ou approche un feu.`, mauvais: true });
  const sp = inv.surpoids(p);
  if (sp.f > 0 || sp.bloque) r.push({ id: 'surcharge', niveau: sp.bloque ? 4 : sp.f > 0.66 ? 3 : sp.f > 0.33 ? 2 : 1, label: sp.bloque ? 'Trop lourd : immobile' : 'Surchargé{|e}', detail: `${fmtKg(sp.kg)} / ${fmtKg(sp.max)}.`, mauvais: true });
  const M = S().CONTAMINATION.SEUILS, mal = p.mal || 0;
  if (mal > 0) r.push({ id: 'mal', niveau: mal >= M.delire ? 4 : mal >= M.fievre_noire ? 3 : mal >= M.noirceur ? 2 : 1, label: mal >= M.delire ? 'Délire' : mal >= M.fievre_noire ? 'Fièvre noire' : mal >= M.noirceur ? 'Veines noires' : 'Le mal', detail: `Le mal : ${Math.round(mal)}/100. À 100, tu redeviens l'un d'eux.`, mauvais: true });
  if ((p.effets.nausee || 0) > 0) r.push({ id: 'nausee', niveau: 1, label: 'Nauséeux{|se}', detail: 'Trop mangé. Ton souffle revient moins vite.', mauvais: true });
  else if ((p.estomac || 0) >= RP().ESTOMAC_MAX * RP().REPU) r.push({ id: 'repu', niveau: 1, label: 'Repu{|e}', detail: 'Ton estomac est plein : attends un peu avant de remanger.', mauvais: false });
  const co = corpulence(p);
  if (co.id !== 'normal') r.push({ id: 'corpulence', niveau: co.niveau, label: co.label, detail: `${fmtKg(co.kg)}. ${co.detail}`, mauvais: true });
  if ((p.effets.courbatures || 0) > 0) r.push({ id: 'courbatures', niveau: 1, label: 'Courbatures', detail: 'Une nuit à même le sol. Ça passera dans quelques heures.', mauvais: true });
  if ((p.effets.antidouleur || 0) > 0) r.push({ id: 'calme', niveau: 1, label: 'Sous calmants', detail: 'La douleur est tenue à distance.', mauvais: false });
  return r;
}
const fmtKg = (k) => `${(Math.round(k * 10) / 10).toString().replace('.', ',')} kg`;

// ---------- Soins ----------
function dureeSoin(action, p) {
  const base = (S().SOINS[action] || { min: 1 }).min;
  return Math.max(1, Math.round(base * (1 - REGLAGES.competences.EFFETS.medecine.vitesse * niveau('medecine', p))));
}
// Solo : le soin fait passer son temps d'un coup. Co-op : l'horloge commune n'accélère pas (le temps coule).
function passerTemps(min) { if (G && G.mode === 'solo') clock.avancer(min); }
const ACTIONS_SOIN = {
  bandage: 'bander', desinfectant: 'desinfecter', nettoyer: 'nettoyer', suture: 'suturer', attelle: 'attelle',
  antibio: 'antibio', antidouleur: 'antidouleur', vitamines: 'vitamines', tisane: 'tisane', onguent: 'onguent', charbon: 'charbon',
};
export const LIBELLES_SOIN = {
  bander: 'Bander', desinfecter: 'Désinfecter', nettoyer: 'Laver au savon', suturer: 'Suturer', attelle: 'Poser une attelle',
  cauteriser: 'Cautériser', antibio: 'Prendre des antibiotiques', antidouleur: 'Prendre un antidouleur', vitamines: 'Prendre des vitamines',
  tisane: 'Boire la tisane', onguent: 'Appliquer l\'onguent', charbon: 'Avaler le charbon actif',
};
// Action de soin portée par un objet (ou 'cauteriser').
export function actionSoin(objetId) {
  if (objetId === 'cauteriser') return 'cauteriser';
  const d = ITEMS[objetId]; if (!d) return null;
  if (d.soin) return ACTIONS_SOIN[d.soin] || null;
  if ((d.usage || []).includes('desinfecter')) return 'desinfecter';
  return null;
}
// Minutes restantes du « réflexe » : désinfecter une griffure (10 min) / cautériser une morsure (15 min). null si passé.
export function minuteurReflexe(b) {
  const CT = S().CONTAMINATION; if (!b || !b.mal) return null;
  const lim = b.type === 'morsure' ? CT.CAUTERISER_MIN : (['egratignure', 'entaille', 'profonde'].includes(b.type) ? CT.NETTOYAGE_MIN : 0);
  const reste = lim - (maintenant() - (b.cree ?? maintenant()));
  return reste > 0 ? { reste, action: b.type === 'morsure' ? 'cauteriser' : 'desinfecter' } : null;
}
// Pourquoi (pas) ce soin sur cette plaie : → { ok, raison? }
export function peutSoigner(p, b, action) {
  p = joueur(p);
  switch (action) {
    case 'bander': return b.bandee ? { ok: false, raison: 'Déjà bandée.' } : ['contusion', 'fracture'].includes(b.type) ? { ok: false, raison: 'Un bandage n\'y fera rien.' } : { ok: true };
    case 'desinfecter': return ['contusion', 'fracture'].includes(b.type) ? { ok: false, raison: 'Rien à désinfecter.' } : { ok: true };
    case 'nettoyer': return b.nettoyee ? { ok: false, raison: 'Déjà lavée.' } : ['contusion', 'fracture'].includes(b.type) ? { ok: false, raison: 'Rien à laver.' } : { ok: true };
    case 'suturer': return b.type === 'morsure' ? { ok: false, raison: 'On ne recoud pas une morsure : elle doit s\'écouler.' } : b.suturee ? { ok: false, raison: 'Déjà recousue.' } : ['entaille', 'profonde'].includes(b.type) ? { ok: true } : { ok: false, raison: 'Pas besoin de points.' };
    case 'attelle': return b.type !== 'fracture' ? { ok: false, raison: 'Seulement pour une fracture.' } : b.attelle ? { ok: false, raison: 'Déjà immobilisée.' } : { ok: true };
    case 'onguent': return ['brulure', 'contusion'].includes(b.type) && !b.onguent ? { ok: true } : { ok: false, raison: 'Pour une brûlure ou une contusion.' };
    case 'cauteriser': {
      if (!['morsure', 'profonde', 'entaille'].includes(b.type)) return { ok: false, raison: 'Rien à cautériser.' };
      if (!inv.hasTag('couper', p)) return { ok: false, raison: 'Il faut une lame.' };
      if (!inv.hasTag('allumer', p)) return { ok: false, raison: 'Il faut une flamme (briquet, allumettes).' };
      return { ok: true };
    }
    default: return { ok: true };
  }
}
// Soins possibles sur la plaie i, avec l'objet à utiliser : [{ action, label, objet, ok, raison, urgent }]
export function soinsPossibles(p, i) {
  p = joueur(p); const b = p.blessures[i]; if (!b) return [];
  const actions = ['bander', 'desinfecter', 'nettoyer', 'suturer', 'attelle', 'onguent', 'cauteriser'];
  const r = []; const ref = minuteurReflexe(b);
  for (const a of actions) {
    const v = peutSoigner(p, b, a); if (!v.ok && /Rien|Seulement|Pour une|Pas besoin|Un bandage/.test(v.raison || '')) continue;
    let objet = null;
    if (a !== 'cauteriser') {
      const cands = p.inventaire.map(it => it.id).filter(id => actionSoin(id) === a);
      // préférence : le meilleur bandage, le désinfectant le plus sûr
      const ordre = ['pansement_miel', 'bandage', 'bandage_fortune', 'desinfectant', 'lingette', 'alcool_fort'];
      cands.sort((x, y) => ((ordre.indexOf(x) + 99) % 99) - ((ordre.indexOf(y) + 99) % 99));
      objet = cands[0] || null;
      if (!objet && v.ok) { r.push({ action: a, label: LIBELLES_SOIN[a], objet: null, ok: false, raison: 'Rien pour ça dans ton sac.', urgent: false }); continue; }
    }
    r.push({ action: a, label: LIBELLES_SOIN[a], objet, ok: v.ok, raison: v.raison, urgent: !!(ref && ref.action === a) || (a === 'bander' && b.saigne) });
  }
  return r.sort((x, y) => (y.urgent - x.urgent) || (y.ok - x.ok));
}

// soigner(p, blessureIndex, objetId, { horsSac }) — objetId : un objet de soin du sac, ou 'cauteriser'.
// Consomme l'objet (sauf horsSac : il vient d'un meuble / du sol), fait passer le temps du soin, donne l'XP. → { ok, texte?, raison? }
export function soigner(p, blessureIndex, objetId, opts = {}) {
  p = normaliserJoueur(joueur(p)); const action = actionSoin(objetId);
  if (!action) return { ok: false, raison: 'Ça ne soigne pas.' };
  const global = ['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'].includes(action);
  const b = global ? null : p.blessures[blessureIndex];
  if (!global && !b) return { ok: false, raison: 'Quelle plaie ?' };
  if (b) { const v = peutSoigner(p, b, action); if (!v.ok) return v; }
  if (objetId !== 'cauteriser' && !opts.horsSac && !inv.hasItem(objetId, 1, p)) return { ok: false, raison: 'Tu n\'en as plus.' };
  const SV = S(), CT = SV.CONTAMINATION, INF = SV.INFECTION, med = niveau('medecine', p);
  const eff = 1 + REGLAGES.competences.EFFETS.medecine.efficacite * med;
  let texte = '', xp = REGLAGES.competences.XP_ACTIONS.soin; // { medecine: 4 }
  const d = ITEMS[objetId];
  switch (action) {
    case 'bander':
      b.bandee = true; b.saigne = false; b.bandage = d.antiseptique ? 'miel' : (d.qualite || 1) < 1 ? 'sale' : 'propre';
      texte = `Plaie ${b.zone} bandée.`; break;
    case 'desinfecter': {
      const cle = objetId === 'lingette' ? 'lingette' : objetId === 'alcool_fort' ? 'alcool_fort' : 'desinfectant';
      const prend = cle !== 'alcool_fort' || Math.random() < INF.ALCOOL_REUSSITE;
      const ref = minuteurReflexe(b);
      if (prend) {
        b.desinfJusqua = maintenant() + Math.round(INF.DESINFECTION_MIN[cle] * eff); b.desinfectee = true;
        if (ref && ref.action === 'desinfecter' && b.mal > 0) { ajouterMal(p, -b.mal); texte = 'Désinfectée à temps : le mal ne passera pas par là.'; b.mal = 0; }
        else texte = `Plaie ${b.zone} désinfectée.`;
      } else texte = 'L\'alcool brûle, mais tu as mal visé. À refaire.';
      break;
    }
    case 'nettoyer': b.nettoyee = true; texte = `Plaie ${b.zone} lavée au savon.`; break;
    case 'suturer': {
      const C = SV.SOINS.suturer;
      b.suturee = true; b.saigne = false; retirerPv(p, -C.pv > 0 ? -C.pv : 0, 'hemorragie');
      douleurAigue(p, C.douleur * (1 - REGLAGES.competences.EFFETS.medecine.douleurSuture * med), 60);
      xp = REGLAGES.competences.XP_ACTIONS.suture; texte = 'Tu serres les dents. Les points tiennent.'; break;
    }
    case 'attelle': b.attelle = true; texte = 'Le membre est immobilisé.'; break;
    case 'onguent': b.onguent = true; if (b.infecte == null) b.infecte = false; texte = 'La brûlure se calme sous l\'onguent.'; break;
    case 'cauteriser': {
      const C = CT.CAUTERISER_COUT, ref = minuteurReflexe(b);
      b.saigne = false; b.suturee = b.type !== 'morsure' ? true : b.suturee;
      if (ref && b.type === 'morsure' && b.mal > 0) { const retire = b.mal * (1 - CT.CAUTERISER_MULT); ajouterMal(p, -retire); b.mal -= retire; texte = 'La lame rougie. L\'odeur. Le mal recule — un peu.'; }
      else texte = 'Tu cautérises. La plaie ne saigne plus.';
      retirerPv(p, C.pv, 'hemorragie'); douleurAigue(p, C.douleur, 90);
      p.blessures.push({ ...infligerBrulure(b.zone) });
      xp = REGLAGES.competences.XP_ACTIONS.cauteriser; break;
    }
    case 'antibio': p.effets.antibioDans = SV.INFECTION.ANTIBIO_DELAI_MIN; for (const w of p.blessures) { w.desinfJusqua = Math.max(w.desinfJusqua || 0, maintenant() + INF.DESINFECTION_MIN.antibiotiques); } texte = 'Antibiotiques pris. Effet dans 3 h. Contre le mal, ils ne peuvent rien.'; break;
    case 'antidouleur': p.effets.antidouleur = Math.round(SV.DOULEUR.ANTIDOULEUR.min * eff); p.effets.medecineNiv = med; texte = 'La douleur s\'éloigne.'; break;
    case 'vitamines': p.effets.vitamines = 720; p.sta = Math.min(p.staMax, p.sta + (SV.SOINS.vitamines.sta || 0)); texte = 'Vitamines avalées.'; break;
    case 'tisane': p.effets.tisane = SV.DOULEUR.TISANE.min; p.soif = clamp(p.soif + (SV.SOINS.tisane.soif || 0)); if (p.maladies.fievre && !p.blessures.some(w => w.infecte)) p.maladies.fievre.reste = Math.min(p.maladies.fievre.reste, 60); p.effets.vitamines = Math.max(p.effets.vitamines || 0, 720); texte = 'La tisane est amère et chaude.'; break;
    case 'charbon': p.effets.charbonDans = 30; texte = 'Le charbon fera effet dans une demi-heure.'; break;
  }
  if (objetId !== 'cauteriser' && !opts.horsSac) inv.removeItem(objetId, 1, p);
  if (action !== 'antidouleur' && action !== 'vitamines') gagnerXps(xp, 1, p);
  emit('blessure', { soin: action, index: blessureIndex });
  if (action === 'bander' || action === 'attelle') son('soin'); // la bande qu'on déchire
  emit('toast', { texte, type: 'bon' });
  passerTemps(dureeSoin(action === 'antibio' ? 'antibio' : action, p));
  return { ok: true, texte };
}
function infligerBrulure(zone) {
  return { uid: `b${Date.now().toString(36)}${uidBlessure++}`, type: 'brulure', zone, gravite: 2, saigne: false, infecte: false, bandee: false, bandage: null, suturee: false, attelle: false, nettoyee: true, desinfectee: true, desinfJusqua: 0, souillee: false, animale: false, age: 0, guerison: 0, mal: 0, cree: maintenant() };
}
function douleurAigue(p, v, min) { p.effets.douleurAigueV = Math.max((p.effets.douleurAigue || 0) > 0 ? p.effets.douleurAigueV || 0 : 0, v); p.effets.douleurAigue = min; }

// ---------- Manger / boire ----------
// Pas de « +30 » : chaque aliment a ses calories réelles (items.kcal) ; la faim est un état en mots. On mange jusqu'à être
// calé·e et on GARDE le reste : un exemplaire entamé porte `reste` (0..1) et `ouvert` (minute d'ouverture) ; passé
// `perissable` heures, il a tourné. Réglages : survie.REPAS.
const RP = () => S().REPAS;
const motDe = (table, v) => { for (const [s, m] of table) if (v >= s) return m; return table[table.length - 1][1]; };
// Points de faim que cale un aliment (ou ce qu'il en reste).
export function pointsAliment(id, reste = 1) { const d = ITEMS[id]; return d ? ((d.kcal || 0) * (d.cru || 1) * reste) / RP().KCAL_PAR_POINT : 0; }
// « Rassasiée », « Un petit creux », « Faim »… (genre du joueur appliqué).
export function motFaim(p) { p = joueur(p); return genrer(motDe(RP().MOTS, p ? p.faim : 100)); }
export const estRassasie = (p) => (joueur(p) || {}).faim >= RP().RASSASIE;
// « un en-cas », « un vrai repas »… : ce que l'aliment représente.
export function motPortion(id, reste = 1) {
  const pts = pointsAliment(id, reste); if (pts <= 0) return 'rien de nourrissant';
  for (const [s, m] of RP().PORTIONS) if (pts < s) return m;
  return 'plusieurs repas';
}
export const aTourne = (entree) => { const d = ITEMS[entree.id]; return !!(d && d.perissable && entree.ouvert != null && maintenant() - entree.ouvert > d.perissable * 60); };

// L'estomac (façon Project Zomboid) : on ne se gave pas d'un coup. Chaque bouchée le remplit (points de faim), il se vide
// en digérant (REPAS.ESTOMAC_VIDANGE_MIN) ; plein, on est repu·e et on attend avant de remanger.
export const placeEstomac = (p) => { p = joueur(p); return Math.max(0, RP().ESTOMAC_MAX - ((p && p.estomac) || 0)); };
// Points de faim qu'on va réellement caler avec cet aliment, maintenant (faim, estomac, se forcer).
export function pointsPrevus(entree, p, opts = {}) {
  p = joueur(p); const R = RP(), dispo = pointsAliment(entree.id, entree.reste ?? 1);
  if (dispo <= 0) return 0;
  const bonus = opts.forcer ? R.FORCER_POINTS : 0;
  return Math.max(0, Math.min(dispo, Math.max(0, 100 - p.faim) + bonus, placeEstomac(p) + bonus));
}
// Durée d'un repas (ms réelles) : on mange bouchée après bouchée.
export function dureeRepas(pts) { const R = RP(); return Math.round(Math.max(R.MS_MIN, Math.min(R.MS_MAX, R.MS_BASE + R.MS_PAR_POINT * Math.max(0, pts)))); }

// mangerObjet(entree, p, { forcer, maxPoints }) : mange UN exemplaire (du sac, d'un meuble ou du sol) — l'appelant le retire /
//   le remplace. maxPoints : on s'est arrêté·e en route (repas interrompu). entree = { id, reste?, ouvert? }.
//   → { ok, raison?, peutForcer?, fini, reste (0..1 de cet exemplaire), ouvert, texte }
export function mangerObjet(entree, p, opts = {}) {
  p = normaliserJoueur(joueur(p)); const d = ITEMS[entree.id];
  if (!d || d.type !== 'nourriture') return { ok: false, raison: 'Ça ne se mange pas.' };
  const R = RP(), reste0 = entree.reste ?? 1, dejaOuvert = entree.reste != null || entree.ouvert != null;
  if (d.besoinOuvre && !dejaOuvert && !inv.hasTag('ouvrir', p) && !inv.hasTag('couper', p)) return { ok: false, raison: 'Il faut un ouvre-boîte ou une lame.' };
  const dispo = pointsAliment(entree.id, reste0);
  if (dispo > 0 && p.faim >= R.RASSASIE && !opts.forcer) return { ok: false, peutForcer: true, raison: genrer('Tu n\'as plus faim : tu es calé{|e}.') };
  if (dispo > 0 && placeEstomac(p) < R.BOUCHEE && !opts.forcer) return { ok: false, peutForcer: true, raison: genrer('Tu es repu{|e} : ton estomac est plein. Attends un peu avant de remanger.') };
  let pris = pointsPrevus(entree, p, opts);
  if (opts.maxPoints != null) pris = Math.min(pris, Math.max(0, opts.maxPoints));
  if (dispo > 0 && pris <= 0 && opts.maxPoints != null) return { ok: true, fini: false, rien: true, reste: reste0, ouvert: entree.ouvert ?? null, texte: '' };
  let frac = dispo > 0 ? pris / dispo : 1;                 // part de CE QUI RESTAIT qu'on mange
  if (reste0 * (1 - frac) < R.MIETTES) { frac = 1; pris = dispo; }
  const part = reste0 * frac;                              // part de l'objet entier
  const tourne = aTourne(entree);
  const trop = Math.max(0, p.faim + pris - 100) + Math.max(0, (p.estomac || 0) + pris - R.ESTOMAC_MAX);   // ce qu'on s'est forcé·e à avaler
  p.faim = clamp(p.faim + pris);
  p.estomac = Math.min(R.ESTOMAC_MAX + R.FORCER_POINTS, (p.estomac || 0) + pris);
  if (trop > 0 && S().CORPS) p.poidsCorps = (p.poidsCorps ?? p.poidsRef ?? 72) + trop * S().CORPS.GAVE_KG_PAR_POINT;   // se gaver fait grossir
  if (d.soif) p.soif = clamp(p.soif + d.soif * part);
  if (d.fatigue) p.fatigue = clamp(p.fatigue + d.fatigue * part);
  if (d.risque) risqueMaladie(p, d.risque);
  if (tourne) risqueMaladie(p, { type: 'intoxication', p: R.TOURNE_RISQUE });
  if (opts.forcer) p.effets.nausee = R.NAUSEE_MIN;
  const fini = frac >= 1, reste = fini ? 0 : Math.round(reste0 * (1 - frac) * 100) / 100;
  const quoi = `${d.nom} : ` + (fini ? (reste0 < 1 ? 'tu finis ce qui restait' : 'tu manges tout')
    : part < 0.3 ? 'tu en manges quelques bouchées' : part < 0.6 ? 'tu en manges la moitié' : 'tu en manges presque tout');
  const repu = placeEstomac(p) < R.BOUCHEE;
  const etat = opts.forcer ? 'Tu t\'es forcé{|e}. L\'estomac proteste.' : p.faim >= R.RASSASIE ? 'Tu es calé{|e}.'
    : repu ? `Tu es repu{|e} pour l'instant (${motFaim(p).toLowerCase()}).` : `${motFaim(p)}.`;
  const texte = genrer(`${quoi}${tourne ? ' (ça avait tourné)' : ''}. ${fini ? '' : 'Tu gardes le reste. '}${etat}`);
  emit('survie', { mange: entree.id }); son('manger');
  return { ok: true, fini, reste, ouvert: fini ? null : (entree.ouvert ?? maintenant()), texte, rend: fini ? d.rend || null : null };
}
// manger(ref, p, opts) : ref = index du sac (exemplaire précis, entamé ou non) ou id. → { ok, raison?, peutForcer?, texte? }
export function manger(ref, p, opts = {}) {
  p = normaliserJoueur(joueur(p));
  const idx = typeof ref === 'number' ? ref : (() => {   // l'exemplaire entamé d'abord, sinon la pile
    const k = p.inventaire.findIndex(it => it.id === ref && it.reste != null);
    return k >= 0 ? k : p.inventaire.findIndex(it => it.id === ref);
  })();
  const it = p.inventaire[idx];
  if (!it) return { ok: false, raison: 'Tu n\'en as pas.' };
  const r = mangerObjet(it, p, opts);
  if (!r.ok) return r;
  const id = it.id;
  inv.removeIndex(idx, 1, p);
  if (!r.fini) inv.addItem(id, 1, { reste: r.reste, ouvert: r.ouvert }, p);
  if (r.rend) inv.addItem(r.rend, 1, {}, p);
  emit('toast', { texte: r.texte, type: 'info' });
  return r;
}
// boire(ref, p) : ref = id d'une boisson (bouteille d'eau, soda…) ou index d'un contenant d'eau du sac (une gorgée).
export function boire(ref, p) {
  p = normaliserJoueur(joueur(p));
  if (typeof ref === 'number') {
    const it = p.inventaire[ref]; if (!it || !it.eau) return { ok: false, raison: 'Il est vide.' };
    const E = S().EAU; const pris = inv.preleverEau(ref, E.DOSE_L, p); if (!pris) return { ok: false, raison: 'Il est vide.' };
    p.soif = clamp(p.soif + E.SOIF_PAR_L[pris.q] * pris.L);
    if (pris.q === 'croupie') risqueMaladie(p, { type: 'intoxication', p: S().RISQUES_ALIMENTS.eau_croupie });
    emit('toast', { texte: pris.q === 'propre' ? 'Tu bois une gorgée d\'eau.' : 'L\'eau a un goût de vase.', type: 'info' });
    emit('survie', { boit: true }); son('boire');
    return { ok: true };
  }
  const d = ITEMS[ref]; if (!d || d.type !== 'boisson') return { ok: false, raison: 'Ça ne se boit pas.' };
  if (!inv.hasItem(ref, 1, p)) return { ok: false, raison: 'Tu n\'en as pas.' };
  inv.removeItem(ref, 1, p);
  appliquerConso(p, d);
  if (d.special === 'alcool') { p.effets.alcool = S().DOULEUR.ALCOOL.min; }
  if (d.rend) inv.addItem(d.rend, 1, {}, p);
  emit('toast', { texte: `Tu bois : ${d.nom.toLowerCase()}.`, type: 'info' });
  emit('survie', { boit: ref }); son('boire');
  return { ok: true };
}
// ---------- Consommer sur place (sans ramasser) ----------
// Ce qu'on trouve dans un meuble ou par terre : nourriture, boisson, soin. L'appelant a pris UN exemplaire.
const SOINS_GLOBAUX = ['antibio', 'antidouleur', 'vitamines', 'tisane', 'charbon'];
// Libellé du geste (« Manger », « Boire », « Prendre », « Bander une plaie »…) ou null si ça ne se consomme pas.
export function libelleConsommer(id) {
  const d = ITEMS[id]; if (!d) return null;
  if (d.type === 'nourriture') return 'Manger';
  if (d.type === 'boisson') return 'Boire';
  if (d.type === 'soin') { const a = actionSoin(id); if (!a) return null; return SOINS_GLOBAUX.includes(a) ? 'Prendre' : (LIBELLES_SOIN[a] || 'Soigner'); }
  return null;
}
function plaiePour(p, id) { // la plaie à laquelle ce soin sert le plus (une qui saigne d'abord)
  const a = actionSoin(id); let best = -1, bs = -1;
  p.blessures.forEach((b, i) => { if (!peutSoigner(p, b, a).ok) return; const s = (b.saigne ? 10 : 0) + (b.gravite || 1); if (s > bs) { bs = s; best = i; } });
  return best;
}
// peutConsommer(entree, p) → { ok, raison?, peutForcer? } sans rien changer.
export function peutConsommer(entree, p) {
  p = normaliserJoueur(joueur(p)); const d = ITEMS[entree.id];
  if (!d) return { ok: false, raison: 'Ça ne se consomme pas.' };
  if (d.type === 'nourriture') {
    if (d.besoinOuvre && entree.reste == null && entree.ouvert == null && !inv.hasTag('ouvrir', p) && !inv.hasTag('couper', p)) return { ok: false, raison: 'Il faut un ouvre-boîte ou une lame.' };
    if (pointsAliment(entree.id, entree.reste ?? 1) > 0 && p.faim >= RP().RASSASIE) return { ok: false, peutForcer: true, raison: genrer('Tu n\'as plus faim : tu es calé{|e}.') };
    if (pointsAliment(entree.id, entree.reste ?? 1) > 0 && placeEstomac(p) < RP().BOUCHEE) return { ok: false, peutForcer: true, raison: genrer('Tu es repu{|e} : ton estomac est plein. Attends un peu avant de remanger.') };
    return { ok: true };
  }
  if (d.type === 'boisson') return entree.eau && !(entree.eau.L > 0) ? { ok: false, raison: 'Il est vide.' } : { ok: true };
  if (d.type === 'soin') {
    const a = actionSoin(entree.id); if (!a) return { ok: false, raison: 'Ça ne soigne pas.' };
    if (SOINS_GLOBAUX.includes(a)) return { ok: true };
    return plaiePour(p, entree.id) >= 0 ? { ok: true } : { ok: false, raison: p.blessures.length ? 'Aucune plaie qui en a besoin.' : 'Tu n\'as pas de plaie à soigner.' };
  }
  return { ok: false, raison: 'Ça ne se consomme pas.' };
}
// consommer(entree, p, { forcer }) : UN exemplaire pris hors du sac. → { ok, raison?, fini, reste?, ouvert?, rend?, texte }
// Si l'aliment n'est pas fini (`fini: false`), l'appelant garde le reste : { id, qty: 1, reste, ouvert }.
export function consommer(entree, p, opts = {}) {
  p = normaliserJoueur(joueur(p)); const d = ITEMS[entree.id];
  const v = peutConsommer(entree, p);
  if (!v.ok && !(v.peutForcer && opts.forcer)) return v;
  if (d.type === 'nourriture') { const r = mangerObjet(entree, p, opts); if (r.ok) emit('toast', { texte: r.texte, type: 'info' }); return r; }
  if (d.type === 'boisson') {
    if (entree.eau) { // un contenant plein trouvé : on boit ce qu'il faut (jusqu'à 0,5 L), le reste est gardé
      const E = S().EAU, L = Math.min(entree.eau.L, 0.5);
      p.soif = clamp(p.soif + E.SOIF_PAR_L[entree.eau.q] * L);
      if (entree.eau.q === 'croupie') risqueMaladie(p, { type: 'intoxication', p: S().RISQUES_ALIMENTS.eau_croupie });
      const resteL = Math.round((entree.eau.L - L) * 100) / 100;
      emit('toast', { texte: entree.eau.q === 'propre' ? 'Tu bois.' : 'L\'eau a un goût de vase.', type: 'info' }); son('boire');
      return { ok: true, fini: false, eau: { ...entree.eau, L: resteL }, texte: '' };
    }
    appliquerConso(p, d);
    if (d.special === 'alcool') p.effets.alcool = S().DOULEUR.ALCOOL.min;
    emit('toast', { texte: `Tu bois : ${d.nom.toLowerCase()}.`, type: 'info' }); emit('survie', { boit: entree.id }); son('boire');
    return { ok: true, fini: true, rend: d.rend || null };
  }
  const a = actionSoin(entree.id);
  const r = soigner(p, SOINS_GLOBAUX.includes(a) ? -1 : plaiePour(p, entree.id), entree.id, { horsSac: true });
  return r.ok ? { ...r, fini: true } : r;
}

// ---------- Poids du corps (REGLAGES.survie.CORPS) ----------
// Rapport au poids de forme → 'emacie' | 'maigre' | 'normal' | 'enrobe' | 'obese', avec ses effets (vitesse, souffle, coups, froid).
const MOTS_CORPS = {
  emacie: { niveau: 3, label: 'Émacié{|e}', detail: 'La peau sur les os : tu frappes mal, ton souffle s\'épuise et le froid te transperce. Mange à ta faim, plusieurs jours de suite.' },
  maigre: { niveau: 1, label: 'Amaigri{|e}', detail: 'Tu as fondu : un peu moins de force et de souffle, plus frileux{|se}. Mange à ta faim.' },
  normal: { niveau: 0, label: 'En forme', detail: '' },
  enrobe: { niveau: 1, label: 'Enrobé{|e}', detail: 'Tu t\'es trop rempli{|e} : tu t\'essouffles plus vite en courant. Mange moins, bouge plus.' },
  obese: { niveau: 3, label: 'Alourdi{|e}', detail: 'Ton propre poids te ralentit et te coupe le souffle. Mange moins, bouge plus.' },
};
export function corpulence(p) {
  p = joueur(p); const CO = S().CORPS;
  if (!p || !CO) return { id: 'normal', niveau: 0, label: 'En forme', detail: '', kg: 0, ratio: 1 };
  const ref = p.poidsRef || CO.REF.m, kg = p.poidsCorps ?? ref, ratio = kg / ref;
  let id = 'normal'; for (const [s, k] of CO.SEUILS) if (ratio < s) { id = k; break; }
  const m = MOTS_CORPS[id];
  return { id, niveau: m.niveau, label: genrer(m.label), detail: genrer(m.detail), kg, ratio, ref };
}
export function effetsCorpulence(p) { const c = corpulence(p); return c.id === 'normal' ? null : S().CORPS.EFFETS[c.id]; }
// Tendance du poids en ce moment (−1 perd, 0 stable, +1 prend), d'après la faim — comme les flèches de Project Zomboid.
export function tendancePoids(p) {
  p = joueur(p); const CO = S().CORPS; if (!p || !CO) return 0;
  for (const [s, v] of CO.KG_JOUR) if (p.faim >= s) return v > 0 ? 1 : v < 0 ? -1 : 0;
  return -1;
}

function appliquerConso(p, d) {
  if (d.kcal) { const pts = (d.kcal * (d.cru || 1)) / RP().KCAL_PAR_POINT; p.faim = clamp(p.faim + pts); p.estomac = Math.min(RP().ESTOMAC_MAX, (p.estomac || 0) + pts * 0.5); }
  if (d.soif) p.soif = clamp(p.soif + d.soif);
  if (d.fatigue) p.fatigue = clamp(p.fatigue + d.fatigue);
  if (d.risque) risqueMaladie(p, d.risque);
}
function risqueMaladie(p, r) {
  if (r.type !== 'intoxication' || Math.random() >= r.p) return;
  if (p.maladies.intoxication) return;
  p.maladies.intoxication = { reste: rngInt(...S().MALADIES.intoxication.dureeMin) };
  emit('toast', { texte: 'Ton ventre se tord. Ce n\'était pas propre.', type: 'mauvais' });
}

// ---------- Sommeil ----------
// dormir(heures, { sur, danger, mortsPresents, piege }) : fait passer le temps (accéléré).
// sur = pièce barricadée / refuge ; sinon intrusion (4 % + 10 % × danger)/h si des morts sont dans le niveau.
// → { ok, dormi (min), interrompu, raison? }
export function dormir(heures, opts = {}) {
  const p = normaliserJoueur(joueur()); if (!p) return { ok: false };
  const SO = S().SOMMEIL;
  if (p.fatigue >= SO.FATIGUE_MAX_POUR_DORMIR && !opts.force) return { ok: false, raison: 'Tu n\'as pas sommeil.' };
  if (G.mode !== 'solo' && !opts.force) return { ok: false, raison: 'À deux, vous devez décider ensemble de dormir.' };
  // le couchage : par terre si rien n'est dit (évanouissement…)
  const cat = opts.couchage || 'sol', CO = parametresCouchage(cat);
  if (p.fatigue >= CO.plafond - 0.5) return { ok: false, plafond: true, raison: cat === 'sol' ? 'Tu n’arrives pas à dormir ici : tu n’es pas assez {fatigué|fatiguée} pour un sol aussi dur.' : 'Tu n’arrives pas à dormir ici : tu n’es pas assez {fatigué|fatiguée}.' };
  couchageEnCours = cat;
  const sur = opts.sur ?? contexte.lieuSur;
  const risque = sur || opts.mortsPresents === false ? 0 : SO.RISQUE_H.base + SO.RISQUE_H.parDanger * (opts.danger || 0);
  const total = Math.round(heures * 60);
  let dormi = 0, interrompu = false;
  setActivite('sommeil');
  try {
    for (let h = 0; h < heures && !p.mort; h++) {
      const bloc = Math.min(60, total - dormi); if (bloc <= 0) break;
      clock.avancer(bloc); dormi += bloc;
      if (p.fatigue >= CO.plafond - 0.01) break;
      if (risque && Math.random() < risque) { interrompu = true; break; }
    }
  } finally { setActivite('normal'); }
  // mal dormi : courbatures au réveil
  const cb = CO.courbatures;
  if (cb && !opts.sansCourbatures && dormi >= cb.apresH * 60) { douleurAigue(p, cb.douleur, cb.min); p.effets.courbatures = cb.min; p.effets.courbaturesSta = cb.regenSta; }
  if (interrompu) {
    const piege = opts.piege ?? inv.hasItem(SO.PIEGE_SONORE === 'reveil' ? 'piege_sonore' : SO.PIEGE_SONORE, 1, p);
    emit('survie:intrusion', { surprise: piege ? 'normal' : 'surpris' });
    emit('toast', { texte: piege ? 'Des bouteilles s\'entrechoquent : quelque chose est entré.' : 'Un râle, tout près. Tu te réveilles trop tard.', type: 'mauvais' });
  } else if (!opts.silencieux) emit('toast', { texte: `Tu as dormi ${Math.round(dormi / 60)} h.`, type: 'info' });
  emit('survie', { dormi });
  return { ok: true, dormi, interrompu, couchage: cat, plafond: p.fatigue >= CO.plafond - 0.01, courbatures: !!(cb && dormi >= cb.apresH * 60) };
}

// ---------- Branchement sur l'horloge ----------
let branche = null;
export function demarrerSurvie() {
  if (branche) return;
  if (G) normaliserJoueur(G.player);
  const off1 = on('minute', ({ delta }) => { if (!G) return; tickMinutes(delta, activiteCourante); inv.consommerLumiere(delta); });
  const off2 = on('survie:evanoui', () => { setTimeout(() => dormir(S().EFFETS.EVANOUI_H, { force: true, sur: false }), 0); });
  branche = () => { off1(); off2(); };
}
export function arreterSurvie() { if (branche) branche(); branche = null; }

// Sons (audio.js conservé), chargé à la demande et jamais bloquant.
let audio = null;
function son(nom) {
  if (typeof window === 'undefined') return;
  if (audio === null) { audio = false; import('../audio.js').then(m => { audio = m; try { m.sfx(nom); } catch (e) {} }).catch(() => {}); return; }
  if (audio) try { audio.sfx(nom); } catch (e) {}
}
export { son };
