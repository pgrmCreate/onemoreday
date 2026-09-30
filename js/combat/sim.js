// ============================================================================
//  COMBAT — simulation HEADLESS (aucun DOM), déterministe (graine), pas fixe 50 ms
// ============================================================================
// Contrat : docs/REFONTE.md §12.4, règles et nombres : docs/GAMEPLAY.md §4 et
// REGLAGES.combat. AUCUN nombre de jeu n'est écrit ici en dur, sauf les quelques
// constantes techniques de PARAMS_SIM (proposées au game designer dans le rapport).
//
//   const sim = creerCombat({ id, lieuId, participants: [{ id, nom, stats }],
//                             zombies: [{ uid, type, hp? }], seed, danger, surprise,
//                             difficulte?, pool?, tuto? })
//   sim.action(joueurId, a) → { ok, raison? }       a = { type, appui?, index?, cible? } (voir ACTIONS plus bas)
//   sim.ajouterParticipant(p) · sim.ajouterZombies(liste)
//   sim.tick(dtMs) → evenements[]  (chaque événement n'est émis QU'UNE fois, numéroté `n`)
//   sim.etat() → instantané sérialisable (pour la vue et pour la co-op, 20 Hz)
//   sim.fini() · sim.resultat(joueurId)
//
// ACTIONS (a.type) :
//   frapper {appui:true|false}  appui court = coup rapide ; maintenir = charger, relâcher = coup chargé.
//                               Empoigné(e) : chaque appui = un martèlement.
//   garde {appui}               garde tenue (montée 150 ms).
//   esquive                     pendant la télégraphie : il frappe dans le vide (parfaite = contre).
//   pousser                     jauge −35 % / annule la ruée ; recharge 2,5 s. Empoigné(e) : martèlement.
//   tirer {appui}               arme de tir : maintenir = viser, relâcher = tirer.
//   recharger                   arme de tir.
//   rapide {index}              accès rapide : changer d'arme, lancer, soigner.
//   fuir {appui}                maintenir 1,5 s.
//   cible {uid|null}            co-op : viser le mort d'un partenaire (aider, bonus de flanc).
//   relever {cible, appui}      co-op : relever un partenaire à terre (maintenir 3 s).
//
// ÉVÉNEMENTS (type) : telegraphe, ruee, coup, rate, bloque, esquive, contre (dans coup.contre),
//   saisie, degage, blessure, explosion, mort_zombie, fuite_zombie, renfort, renfort_annonce, cri, cri_coupe,
//   poussee, tir, tir_vide, recharge, change_arme, arme_cassee, jet, soin, refus, fuite, a_terre, releve,
//   mort_joueur, fin.
// ============================================================================
import { REGLAGES, presetDifficulte } from '../data/reglages.js';
import { ZOMBIES, LIEUX, ITEMS } from '../game/donnees.js';
import { seedRng } from '../core/rng.js';

export const PAS_MS = 50;
// Constantes techniques (pas de règle de jeu) — à déplacer dans REGLAGES.combat si le game designer le souhaite.
export const PARAMS_SIM = {
  TAPE_MS: 170,          // un appui plus court que ça sur Frapper = coup rapide (sans charge).
  TAMPON_MS: 450,        // un appui fait pendant un geste est exécuté à la fin du geste s'il date de moins de 450 ms.
  POUSSEE_GESTE_MS: 420, // durée du geste de poussée.
  RELANCE_CRI_MS: 3000,  // un cri de hurleur coupé reprend 3 s plus tard.
  PREMIER_CRI_MS: 1000,  // le hurleur gonfle la gorge 1 s après son entrée (GAMEPLAY §4.2).
  CRI_RENFORT_MS: 4000,  // renforts du cri : 4 s après.
  CRITIQUE_TIR_MIN: 0.05,// précision minimale d'un tir.
};

const R = () => REGLAGES.combat;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const EN_JEU = new Set(['entree', 'menace', 'telegraphe', 'recup', 'vacille', 'a_terre', 'empoignade']);

const MAINS_NUES_ID = 'mains_nues';
export function profilMainsNues() {
  const M = R().MAINS_NUES;
  return { id: MAINS_NUES_ID, nom: M.nom, dmg: M.dmg.slice(), vitesse: M.vitesse, sta: M.sta, allonge: M.allonge,
    charge: M.charge, stagger: M.stagger, crit: M.crit, skill: M.skill, bruit: M.bruit, dur: null, durMax: null };
}

export function creerCombat(opts) {
  const {
    id = 'combat', lieuId = null, participants = [], zombies = [], seed = 1, danger,
    surprise = 'normal', difficulte = null, pool = null, tuto = false,
  } = opts || {};
  const rnd = seedRng(`${seed}:combat:${id}`);
  const rInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const diff = typeof difficulte === 'object' && difficulte ? difficulte : presetDifficulte(difficulte);
  const lieu = (lieuId && LIEUX[lieuId]) || null;
  const dangerLieu = danger ?? (lieu && lieu.danger) ?? 0.3;
  const poolRenforts = (pool && pool.length ? pool : (lieu && lieu.pool && lieu.pool.length ? lieu.pool : ['errant']));
  const ralMenace = tuto ? 1.25 : 1, ralTel = tuto ? 1.4 : 1;

  let t = 0, reste = 0, seq = 0, compteurZ = 0;
  let evts = [];
  let finEmise = false, estFini = false;
  let renfortsTotal = 0, bruitMax = 0, bruyant = false, prochainLong = R().RENFORTS.COMBAT_LONG_S * 1000;
  const attente = [];         // renforts planifiés : { t, type, cause }
  const Z = [];               // tous les morts (ordre d'arrivée = ordre de la file)
  const J = [];               // participants

  function emit(type, data = {}) { const e = { ...data, n: ++seq, t, type }; evts.push(e); return e; }

  // ---------------------------------------------------------------- morts
  function nouveauZombie(z) {
    const type = typeof z === 'string' ? z : z.type;
    let def = ZOMBIES[type];
    if (!def) { console.warn(`[combat] mort inconnu « ${type} » : remplacé par un errant`); def = ZOMBIES.errant; }
    const hpMax = Math.max(1, Math.round(def.hp * (diff.pvMorts || 1)));
    const hp = z && z.hp != null ? Math.max(1, Math.round(z.hp)) : hpMax;
    compteurZ++;
    return {
      uid: (z && z.uid) || `${id}:m${compteurZ}`, type: ZOMBIES[type] ? type : 'errant', def, nom: def.nom,
      hp, hpMax: Math.max(hp, hpMax), etat: 'file', joueur: null, ordre: compteurZ,
      menace: 0, baseMenace: 0, fin: 0, rueeType: null, telDebut: 0, telFin: 0, esquivee: false,
      saisie: null, cri: null, feu: null, tuePar: null,
    };
  }
  function tirerDureeMenace(z) {
    const a = R().MENACE_ALEA;
    z.baseMenace = z.def.menace * (diff.menace || 1) * ralMenace * (1 + (rnd() * 2 - 1) * a);
  }
  const vivant = (z) => z.etat !== 'mort' && z.etat !== 'fui';
  const zombie = (uid) => Z.find(z => z.uid === uid) || null;

  // ---------------------------------------------------------------- joueurs
  function nouveauJoueur(p) {
    const s = p.stats || {};
    const arme = s.arme ? { ...s.arme } : profilMainsNues();
    return {
      id: p.id, nom: p.nom || p.id, stats: s, arme, armeDepart: arme.id,
      pv: s.pv ?? 100, pvMax: s.pvMax ?? 100, sta: s.sta ?? 100, staMax: s.staMax ?? 100,
      issue: null, aTerre: false, aTerreFin: 0,
      occupeJusqu: 0, geste: null, dernierGeste: -1e9,
      charge: null, visee: null, tampon: null,
      gardeVeut: false, garde: false, gardeDebut: 0, briseeJusqu: 0,
      esquiveJusqu: 0, esquiveCd: 0, pousseePret: 0, contreJusqu: -1,
      fuite: null, recharge: null, change: null, soin: null, releve: null,
      empoigne: null, actif: null, cible: null,
      accesRapide: (s.accesRapide || []).map(x => ({ ...x })),
      xp: {}, usure: {}, munChargees: {}, balles: arme.balles || 0, reserve: arme.reserve || 0,
      blessures: [], degatsRecus: 0, mal: 0, jets: [], carreauxTires: 0, echanges: [],
    };
  }
  const joueur = (jid) => J.find(j => j.id === jid) || null;
  const enJeu = (j) => !j.issue && !j.aTerre;
  const niv = (j, k) => (j.stats.niveaux && j.stats.niveaux[k]) || 0;
  const xp = (j, k, n) => { if (k && n) j.xp[k] = (j.xp[k] || 0) + n; };
  const surpoidsMult = (j) => 1 + (REGLAGES.inventaire.SURPOIDS.sta || 0.5) * (j.stats.surpoids || 0);
  const essouffle = (j) => j.sta < R().ENDURANCE.SEUIL_ESSOUFFLE;
  const lenteur = (j) => (essouffle(j) ? R().COUP.DUREE_LENTEUR_EPUISE : 1);
  const occupe = (j, ta = t) => ta < j.occupeJusqu || ta < j.briseeJusqu || !!j.recharge || !!j.change || !!j.soin;
  const depenser = (j, n, ta = t) => { j.sta = Math.max(0, j.sta - n * surpoidsMult(j)); j.dernierGeste = ta; };
  const estTir = (arme) => !!(arme && arme.tir);
  function profilMelee(j) {
    const a = j.arme;
    if (!estTir(a)) return a;
    // Une arme de tir en main : « Frapper » = coup de crosse.
    return { ...a, dmg: (a.crosse || [3, 6]).slice(), vitesse: Math.max(450, a.vitesse || 500), sta: Math.max(4, a.sta || 4),
      allonge: 0, charge: 1.3, stagger: 0.25, crit: 0.05, skill: 'force', crosse: true };
  }

  // ------------------------------------------------------------- file / fronts
  function libererMort(j) {
    const z = j.actif && zombie(j.actif);
    j.actif = null;
    if (z && vivant(z)) {
      if (z.etat === 'empoignade') j.empoigne = null;
      z.etat = 'file'; z.joueur = null; z.menace = 0; z.saisie = null; z.esquivee = false;
    }
  }
  function attribuer() {
    for (const j of J) {
      if (!enJeu(j)) continue;
      const a = j.actif && zombie(j.actif);
      if (a && vivant(a)) continue;
      j.actif = null;
      const suivant = Z.filter(z => z.etat === 'file').sort((x, y) => x.ordre - y.ordre)[0];
      if (!suivant) continue;
      suivant.joueur = j.id; j.actif = suivant.uid;
      suivant.etat = 'entree'; suivant.fin = t + R().ENTREE_MS; suivant.menace = 0;
      tirerDureeMenace(suivant);
      if (suivant.def.special === 'hurle') suivant.cri = { debut: suivant.fin + PARAMS_SIM.PREMIER_CRI_MS, p: 0, fait: false };
      emit('entree', { zombie: suivant.uid, joueur: j.id, typeMort: suivant.type });
    }
  }

  // ------------------------------------------------------------- renforts
  function planifierRenfort(cause, n, delai) {
    const M = R().RENFORTS.MAX;
    const types = [];
    for (let i = 0; i < n; i++) {
      if (renfortsTotal >= M) break;
      renfortsTotal++;
      const type = pick(poolRenforts);
      const d = delai ?? rInt(R().RENFORTS.DELAI_MS[0], R().RENFORTS.DELAI_MS[1]);
      attente.push({ t: t + d, type, cause });
      types.push(type);
    }
    if (types.length) emit('renfort_annonce', { nombre: types.length, cause });
  }
  function arriveeRenforts() {
    const prets = attente.filter(a => a.t <= t);
    if (!prets.length) return;
    for (const a of prets) attente.splice(attente.indexOf(a), 1);
    const nouveaux = prets.map(a => nouveauZombie({ type: a.type }));
    Z.push(...nouveaux);
    emit('renfort', { uids: nouveaux.map(z => z.uid), types: nouveaux.map(z => z.type), cause: prets[0].cause });
  }

  // ------------------------------------------------------------- cycle d'un mort
  function debutTelegraphe(z, mult = 1) {
    const def = z.def;
    z.rueeType = def.saisie > 0 && rnd() < def.saisie ? 'saisie' : 'coup';
    const d = Math.max(R().TELEGRAPHE_MIN_MS, def.telegraphe * (diff.telegraphe || 1) * ralTel * mult);
    z.etat = 'telegraphe'; z.telDebut = t; z.telFin = t + d; z.esquivee = false; z.menace = 1;
    emit('telegraphe', { zombie: z.uid, joueur: z.joueur, ruee: z.rueeType, duree: Math.round(d) });
  }
  function apresRuee(z) {
    z.etat = 'recup'; z.fin = t + R().RECUP_MS;
    z.menace = z.def.enchaine && rnd() < z.def.enchaine ? 0.5 : 0;
    if (z.menace > 0) z.enchaineAnnonce = true;
    tirerDureeMenace(z);
  }
  function ruee(z) {
    const j = joueur(z.joueur);
    if (!j || !enJeu(j)) { apresRuee(z); return; }
    if (z.esquivee) {
      emit('ruee', { zombie: z.uid, joueur: j.id, issue: 'esquivee', ruee: z.rueeType });
      apresRuee(z); return;
    }
    const gardeOk = j.garde && t - j.gardeDebut >= R().GARDE.MONTEE_MS && t >= j.briseeJusqu;
    if (z.rueeType === 'saisie') {
      emit('ruee', { zombie: z.uid, joueur: j.id, issue: 'saisie', ruee: 'saisie' });
      empoigner(z, j, gardeOk);
      return;
    }
    if (gardeOk) {
      emit('ruee', { zombie: z.uid, joueur: j.id, issue: 'bloquee', ruee: 'coup' });
      bloquer(z, j);
    } else {
      emit('ruee', { zombie: z.uid, joueur: j.id, issue: 'touche', ruee: 'coup' });
      toucherJoueur(z, j, false);
    }
    apresRuee(z);
  }
  function degatsBruts(z, max = false) {
    const [mn, mx] = z.def.dmg;
    const jet = max ? mx : rInt(mn, mx);
    return { jet, mn, mx };
  }
  function bloquer(z, j) {
    const G_ = R().GARDE;
    const { jet } = degatsBruts(z);
    const dmg = Math.max(1, Math.round(jet * (diff.degatsMorts || 1)));
    const reduc = (j.arme.id === MAINS_NUES_ID ? G_.REDUC_MAINS : G_.REDUC_ARME) * (z.def.perceGarde ?? 1);
    let bloques = Math.round(dmg * reduc);
    let cout = bloques * G_.STA_PAR_DEGAT;
    let brisee = false;
    if (j.sta < cout) {
      brisee = true;
      bloques = Math.floor(j.sta / G_.STA_PAR_DEGAT);
      cout = j.sta;
      j.briseeJusqu = t + G_.BRISEE_MS; j.garde = false;
      j.charge = null; j.visee = null;
    }
    j.sta = Math.max(0, j.sta - cout); j.dernierGeste = t;
    const passe = Math.max(0, dmg - bloques);
    j.pv -= passe; j.degatsRecus += passe;
    xp(j, 'force', R().XP.bloc);
    emit('bloque', { joueur: j.id, zombie: z.uid, bloques, degats: passe, sta: Math.round(cout), brisee });
    if (j.pv <= 0) tomber(j, z);
  }
  function empoigner(z, j, garde) {
    const E = R().EMPOIGNADE, G_ = R().GARDE;
    let requis = z.def.saisieForce || 6;
    requis -= Math.floor(niv(j, 'force') / E.FORCE_PAR_TAP);
    if (niv(j, 'mainsNues') >= 3) requis -= E.MAINS_NUES_BONUS;
    if (garde) requis += G_.SAISIE_TAPS;
    requis = Math.max(E.TAPS_MIN, requis);
    const duree = (E.MS + (j.stats.tactile ? E.MARGE_TACTILE_MS : 0)) * (garde ? G_.SAISIE_TEMPS : 1);
    z.etat = 'empoignade'; z.saisie = { debut: t, fin: t + duree, requis, taps: 0 };
    j.empoigne = z.uid;
    j.charge = null; j.visee = null; j.garde = false; j.fuite = null; j.soin = null; j.recharge = null; j.change = null;
    emit('saisie', { joueur: j.id, zombie: z.uid, requis, duree: Math.round(duree), garde });
  }
  function marteler(j, ta) {
    const z = zombie(j.empoigne);
    if (!z || z.etat !== 'empoignade') { j.empoigne = null; return; }
    const E = R().EMPOIGNADE;
    z.saisie.taps += j.sta >= E.STA_PAR_TAP ? 1 : 0.5;
    depenser(j, E.STA_PAR_TAP, ta);
    if (z.saisie.taps >= z.saisie.requis) {
      j.empoigne = null; z.saisie = null;
      z.etat = 'a_terre'; z.fin = t + R().A_TERRE.MS; z.menace = 0; tirerDureeMenace(z);
      xp(j, 'force', R().XP.empoignade);
      emit('degage', { joueur: j.id, zombie: z.uid });
    }
  }
  function choisirAttaque(z, morsure) {
    const def = z.def;
    const toutes = (def.attaques || []).filter(a => a && a.zones && a.zones.length);
    let liste;
    if (morsure) liste = toutes.filter(a => a.type === 'morsure' || a.type === 'morsure_animale');
    else liste = toutes.filter(a => a.type !== 'morsure');   // humain : ne mord QUE via l'empoignade
    if (!liste.length) liste = toutes;
    if (!liste.length) return { type: morsure ? 'morsure' : 'coup', desc: '', zones: ['au torse'] };
    return pick(liste);
  }
  // Une ruée (ou une morsure d'empoignade ratée) qui porte : dégâts, zone, plaie, mal.
  function toucherJoueur(z, j, morsure) {
    const def = z.def, B = R().BLESSURES, P = R().PROTECTION, S = REGLAGES.survie;
    const { jet, mn, mx } = degatsBruts(z, morsure);
    const brut = morsure ? jet * R().EMPOIGNADE.MORSURE_DEGATS : jet;
    const haut = jet >= mn + (mx - mn) * 2 / 3, auMax = jet >= mx;
    const att = choisirAttaque(z, morsure);
    const zone = pick(att.zones);
    const typeAtt = morsure ? 'morsure' : att.type;
    let plaie;
    if (typeAtt === 'griffure') plaie = (auMax && def.blessureMax >= 3 && B.griffure.max) ? B.griffure.max : haut ? B.griffure.haut : B.griffure.defaut;
    else if (typeAtt === 'coup') plaie = def.fracture && rnd() < def.fracture ? B.coup.fracture : haut ? B.coup.haut : B.coup.defaut;
    else if (typeAtt === 'morsure_animale') plaie = haut ? B.morsure_animale.haut : B.morsure_animale.defaut;
    else plaie = B.morsure.defaut;
    // Gravité plafonnée par le mort (sauf la morsure d'empoignade, qui est la règle).
    const plafond = def.blessureMax || 4;
    const descente = { fracture: 'contusion', profonde: 'entaille', entaille: 'egratignure' };
    while (!morsure && plaie !== 'morsure' && S.BLESSURES[plaie] && S.BLESSURES[plaie].gravite > plafond && descente[plaie]) plaie = descente[plaie];
    // Protection de la zone
    const p = (j.stats.protection && j.stats.protection[zone]) || 0;
    let dentsBloquees = false;
    if (p > 0) {
      if (typeAtt === 'griffure') {
        if (p >= P.GRIFFURE_SEUIL) plaie = 'contusion';
        else if (p >= P.GRIFFURE_ALLEGE) plaie = plaie === 'profonde' ? 'entaille' : plaie === 'entaille' ? 'egratignure' : plaie;
      }
      if (plaie === 'morsure' && rnd() < P.MORSURE_BLOQUEE * p) { plaie = 'contusion'; dentsBloquees = true; }
    }
    const degats = Math.max(1, Math.round(brut * (diff.degatsMorts || 1)) - P.REDUC_PAR_POINT * p);
    const info = S.BLESSURES[plaie] || { gravite: 1, pSaigne: 0 };
    const saigne = rnd() < (info.pSaigne || 0);
    const pts = (S.CONTAMINATION.POINTS[plaie] || 0);
    const mal = def.vivant ? 0 : Math.round(pts * (def.infection || 0) * (diff.contamination ?? 1) * 10) / 10;
    const blessure = { type: plaie, zone, gravite: info.gravite, saigne, souillee: !!def.souille, animale: !!def.animal, source: z.type };
    j.pv -= degats; j.degatsRecus += degats; j.mal += mal;
    j.blessures.push({ ...blessure, degats, mal });
    // Encaisser casse la charge, la visée, la fuite, le soin, la relève.
    if (R().CHARGE.CASSE_SI_TOUCHE) j.charge = null;
    j.visee = null; j.fuite = null; j.soin = null; j.releve = null;
    emit('blessure', { joueur: j.id, zombie: z.uid, typeMort: z.type, blessure, degats, mal, desc: att.desc || '', attaque: typeAtt, dentsBloquees, protection: p });
    if (j.pv <= 0) tomber(j, z);
  }

  // ------------------------------------------------------------- coups du joueur
  function cibleDe(j) {
    if (j.cible) {
      const c = zombie(j.cible);
      if (c && EN_JEU.has(c.etat)) return c;
      j.cible = null;
    }
    const a = j.actif && zombie(j.actif);
    if (a && EN_JEU.has(a.etat)) return a;
    // Pas de mort à soi : on aide le premier front actif.
    return Z.find(z => EN_JEU.has(z.etat)) || null;
  }
  function pToucher(j, z, ess) {
    const T = R().TOUCHER, s = j.stats;
    let p = T.BASE + T.PAR_NIVEAU * niv(j, j.arme.skill) - (z.def.esquive || 0);
    if (ess) p += T.ESSOUFFLE;
    if ((s.fatigue ?? 100) < 15) p += T.EPUISE;
    if (s.noir) p += T.NOIR;
    if ((s.douleur || 0) > 80) p += T.DOULEUR_80; else if ((s.douleur || 0) > 60) p += T.DOULEUR_60;
    p += T.SURPOIDS * (s.surpoids || 0);
    p += s.toucherBonus || 0;
    return clamp(p, T.MIN, T.MAX);
  }
  function raisonRate(j, z, ess) {
    if (ess) return 'essouffle';
    if (j.stats.noir) return 'noir';
    if ((z.def.esquive || 0) > 0) return 'derobe';
    return 'vide';
  }
  // Inflige un coup (mêlée, tir ou jet) à z. c = charge 0..1. Renvoie true si touché.
  function infliger(j, z, prof, { c = 0, tir = false, jet = false, visee = 0, garantiForce = false, ess = essouffle(j) } = {}) {
    const def = z.def, D = R().DEGATS, CR = R().CRIT, CO = R().COUP;
    const contre = t <= j.contreJusqu && !tir && !jet;
    const aTerre = z.etat === 'a_terre', vacille = z.etat === 'vacille';
    const flanc = z.joueur && z.joueur !== j.id;
    const garanti = contre || aTerre || vacille || garantiForce;
    let p;
    if (tir) {
      const TI = R().TIR;
      p = (prof.tir.precision || 0.7) * (TI.HANCHE + (1 - TI.HANCHE) * visee) + TI.PREC_PAR_NIVEAU * niv(j, 'visee') - (def.esquive || 0);
      if (j.stats.noir) p += R().TOUCHER.NOIR;
      p = clamp(p, PARAMS_SIM.CRITIQUE_TIR_MIN, R().TOUCHER.MAX);
    } else if (jet) p = clamp(R().JET.PRECISION - (def.esquive || 0), 0.05, 0.98);
    else p = pToucher(j, z, ess);
    if (contre) j.contreJusqu = -1;   // le contre est consommé par le coup qui suit
    if (!garanti && rnd() >= p) {
      emit('rate', { joueur: j.id, zombie: z.uid, raison: raisonRate(j, z, ess && !tir && !jet), tir, jet });
      return false;
    }
    let [mn, mx] = prof.dmg;
    if (prof.skill === 'mainsNues' && !tir && !jet) { const b = R().MAINS_NUES.PAR_NIVEAU_DEGATS * niv(j, 'mainsNues'); mn += b; mx += b; }
    let d = rInt(mn, mx) * (1 + ((prof.charge || 1) - 1) * c);
    d *= 1 + D.PAR_NIVEAU * niv(j, tir ? 'visee' : prof.skill);
    let pc = (prof.crit || 0) + CR.PAR_DEXTERITE * niv(j, 'dexterite') + CR.CHARGE * c
      + (contre ? R().ESQUIVE.CONTRE_CRIT : 0) + (vacille ? CR.VACILLE : 0) + (aTerre ? R().A_TERRE.CRIT : 0)
      + (tir ? R().TIR.CRIT_VISEE * visee : 0);
    pc *= def.critMult ?? 1;
    const crit = rnd() < pc;
    if (crit) d *= CO.CRIT_MULT;
    if (contre) d *= R().ESQUIVE.CONTRE_MULT;
    if (aTerre) d *= prof.skill === 'mainsNues' ? R().MAINS_NUES.A_TERRE_MULT : R().A_TERRE.DEGATS;
    if (flanc) d *= D.FLANC_COOP;
    if (!tir && !jet && ess) d *= R().ENDURANCE.ESSOUFFLE_DEGATS;
    if ((j.stats.faim ?? 100) < 15) d *= D.AFFAME;
    if (!jet && prof.durMax && prof.dur != null && prof.dur / prof.durMax < D.SEUIL_USEE) d *= D.USEE;
    if (!tir && !jet) d *= j.stats.degatsMult ?? 1;
    if (!crit && def.armure) d *= 1 - def.armure * (tir ? R().TIR.ARMURE_EFFICACE : 1);
    d = Math.max(1, Math.round(d));
    // Vaciller / interrompre
    const res = def.resistance || 0;
    const facteur = tir || jet ? 1 : c >= R().CHARGE.SEUIL_LOURD ? 1 : c <= 0 ? CO.STAGGER_RAPIDE : c;
    const ps = (prof.stagger || 0) * facteur * (1 - res) + (flanc ? REGLAGES.coop.FLANC.stagger : 0);
    let fait = rnd() < ps;
    let interrompu = false;
    if (z.etat === 'telegraphe' && !tir && !jet && c >= R().CHARGE.SEUIL_INTERRUPTION) {
      interrompu = res < R().VACILLER.RESISTANCE_INTERRUPTION ? true : fait;
      if (interrompu) fait = true;
    }
    z.hp -= d;
    const tue = z.hp <= 0;
    // Recul de la jauge (hors télégraphie)
    if (!tue && z.etat === 'menace') {
      const recul = c > 0 ? CO.RECUL_RAPIDE + CO.RECUL_CHARGE * c : CO.RECUL_RAPIDE + CO.RECUL_ALLONGE * (prof.allonge || 0);
      z.menace = Math.max(0, z.menace - recul);
    }
    let vacilleFait = false;
    if (!tue && fait && z.etat !== 'empoignade' && z.etat !== 'a_terre') {
      if (z.etat === 'telegraphe') z.menace = R().VACILLER.MENACE_APRES_INTERRUPTION;
      z.etat = 'vacille'; z.fin = t + R().VACILLER.MS; vacilleFait = true;
      couperCri(z);
    }
    // XP, usure
    if (tir) xp(j, 'visee', R().XP.tir);
    else if (!jet) xp(j, prof.skill === 'mainsNues' ? 'mainsNues' : prof.skill, R().XP.touche);
    if (!tir && !jet && c >= R().CHARGE.SEUIL_LOURD) xp(j, 'force', R().XP.charge_lourde);
    if (!tir && !jet) user(j, c >= R().CHARGE.SEUIL_LOURD ? CO.USURE_LOURD : CO.USURE);
    emit('coup', { joueur: j.id, zombie: z.uid, degats: d, crit, charge: Math.round(c * 100) / 100, vacille: vacilleFait,
      interrompu: interrompu && vacilleFait, contre, flanc: !!flanc, a_terre: aTerre, tir, jet, pvRestants: Math.max(0, z.hp) });
    if (tue) tuer(z, j, prof, { tir, jet });
    else if (def.fuitPV && z.hp / z.hpMax < def.fuitPV) {
      z.etat = 'fui'; if (z.saisie) { const o = joueur(z.joueur); if (o) o.empoigne = null; }
      emit('fuite_zombie', { zombie: z.uid, typeMort: z.type, joueur: j.id });
    }
    return true;
  }
  function user(j, n) {
    const a = j.arme;
    if (!a || a.id === MAINS_NUES_ID || a.dur == null) return;
    if (rnd() < (REGLAGES.competences.EFFETS.entretien.usure || 0) * niv(j, 'entretien')) return;
    a.dur -= n; j.usure[a.id] = (j.usure[a.id] || 0) + n;
    if (a.dur <= 0) {
      a.dur = 0;
      emit('arme_cassee', { joueur: j.id, arme: a.id, nom: a.nom });
      j.echanges.push({ casse: a.id });
      j.arme = profilMainsNues(); j.balles = 0; j.reserve = 0;
    }
  }
  function couperCri(z) {
    if (!z.cri || z.cri.fait) return;
    if (z.cri.p > 0) emit('cri_coupe', { zombie: z.uid });
    z.cri.p = 0; z.cri.debut = t + PARAMS_SIM.RELANCE_CRI_MS;
  }
  function tuer(z, j, prof, { tir, jet }) {
    const proprio = joueur(z.joueur);
    if (proprio && proprio.empoigne === z.uid) proprio.empoigne = null;
    z.etat = 'mort'; z.hp = 0; z.tuePar = j.id; z.saisie = null;
    if (z.cri) z.cri.fait = true;
    xp(j, tir ? 'visee' : prof.skill === 'mainsNues' ? 'mainsNues' : prof.skill, R().XP.tue);
    emit('mort_zombie', { zombie: z.uid, typeMort: z.type, joueur: j.id, gore: z.def.gore || '' });
    if (z.def.special === 'explose' && !tir && !jet && (prof.allonge || 0) < 2) {
      const pa = z.def.params || {};
      const deg = Math.round(rInt((pa.dmg || [10, 16])[0], (pa.dmg || [10, 16])[1]) * (diff.degatsMorts || 1));
      j.pv -= deg; j.degatsRecus += deg;
      j.sta = Math.max(0, j.sta - (pa.nausee || 0));
      emit('explosion', { joueur: j.id, zombie: z.uid, degats: deg, sta: pa.nausee || 0, souille: !!pa.souille });
      if (j.pv <= 0) tomber(j, z);
    }
  }

  // ------------------------------------------------------------- chute du joueur
  function tomber(j, z) {
    if (j.issue || j.aTerre) return;
    j.pv = 0;
    const autres = J.filter(o => o !== j && enJeu(o));
    j.charge = j.visee = j.fuite = j.soin = j.releve = null; j.garde = false;
    if (j.empoigne) { const e = zombie(j.empoigne); if (e && e.etat === 'empoignade') { e.etat = 'recup'; e.fin = t + R().RECUP_MS; e.saisie = null; } j.empoigne = null; }
    if (autres.length) {
      j.aTerre = true; j.aTerreFin = t + REGLAGES.coop.A_TERRE_MS;
      libererMort(j);
      emit('a_terre', { joueur: j.id, par: z ? z.type : null });
    } else {
      j.issue = 'mort';
      emit('mort_joueur', { joueur: j.id, par: z ? z.type : null });
    }
  }

  // ------------------------------------------------------------- gestes
  function frapperCoup(j, c, ta) {
    j.charge = null;
    const z = cibleDe(j);
    if (!z) return false;
    const prof = profilMelee(j);
    const ess = essouffle(j);
    depenser(j, prof.sta * (1 + (R().CHARGE.STA_MULT_PLEIN - 1) * c), ta);
    j.occupeJusqu = ta + prof.vitesse * (ess ? R().COUP.DUREE_LENTEUR_EPUISE : 1);
    j.geste = c > 0 ? 'lourd' : 'rapide';
    if ((prof.bruit || 0) >= 2) bruyant = true;
    bruitMax = Math.max(bruitMax, prof.bruit || 0);
    infliger(j, z, prof, { c, ess });
    return true;
  }
  function tirer(j, ta) {
    const a = j.arme, v = j.visee;
    j.visee = null;
    if (!estTir(a) || !v) return;
    if (j.balles <= 0) { emit('tir_vide', { joueur: j.id }); return; }
    const z = cibleDe(j);
    const tv = Math.max(200, R().TIR.VISEE_MS - R().TIR.VISEE_PAR_NIVEAU * niv(j, 'visee'));
    const visee = clamp((ta - v.debut) / tv, 0, 1);
    j.balles--; if (a.id === 'arbalete_fortune' || (a.tir && a.tir.recuperable)) j.carreauxTires++;
    depenser(j, R().TIR.STA, ta);
    j.occupeJusqu = ta + (a.vitesse || 450);
    bruitMax = Math.max(bruitMax, a.bruit || 0);
    if ((a.bruit || 0) >= 2) bruyant = true;
    emit('tir', { joueur: j.id, arme: a.id, visee: Math.round(visee * 100) / 100, balles: j.balles });
    user(j, R().COUP.USURE);
    if (z && j.arme === a) infliger(j, z, a, { tir: true, visee });
    if ((a.bruit || 0) >= 3 && rnd() < R().RENFORTS.TIR_P * (0.5 + dangerLieu)) planifierRenfort('tir', 1);
  }
  function lancer(j, slot, def, ta) {
    const z = cibleDe(j);
    if (!z) return { ok: false, raison: 'personne' };
    depenser(j, R().JET.STA, ta);
    j.occupeJusqu = ta + 600;
    j.jets.push(slot.id);
    slot.qty = (slot.qty || 1) - 1;
    const jd = def.jet || {};
    bruitMax = Math.max(bruitMax, Math.min(3, Math.round((jd.bruit || 0) / 6)));
    emit('jet', { joueur: j.id, objet: slot.id, nom: def.nom });
    const prof = { dmg: jd.dmg || [2, 4], charge: 1, stagger: jd.stagger || 0, crit: jd.crit || 0, allonge: 2, skill: 'visee' };
    const touche = infliger(j, z, prof, { jet: true });
    if (jd.feu) {
      const cibles = [z];
      if (jd.feu.suivant) { const s = Z.filter(x => x.etat === 'file').sort((a, b) => a.ordre - b.ordre)[0]; if (s) cibles.push(s); }
      for (const c of cibles) if (vivant(c)) c.feu = { fin: t + jd.feu.ms, dps: jd.feu.dps, par: j.id };
      emit('feu', { joueur: j.id, zombies: cibles.map(c => c.uid), touche });
    }
    return { ok: true };
  }

  // ------------------------------------------------------------- actions (entrées)
  function action(jid, a) {
    const j = joueur(jid);
    if (!j || !a || estFini) return { ok: false, raison: 'hors_combat' };
    const ta = t + reste;
    if (j.aTerre) return { ok: false, raison: 'a_terre' };
    if (j.issue) return { ok: false, raison: 'fini' };
    switch (a.type) {
      case 'frapper': {
        if (a.appui) {
          if (j.empoigne) { marteler(j, ta); return { ok: true }; }
          j.fuite = null; j.releve = null;
          if (occupe(j, ta) || j.charge) { j.tampon = { t: ta, relache: false }; return { ok: true, tampon: true }; }
          j.visee = null; j.garde = false;
          j.charge = { debut: ta };
          return { ok: true };
        }
        if (j.tampon && !j.charge) { j.tampon.relache = true; return { ok: true, tampon: true }; }
        if (!j.charge) return { ok: false, raison: 'pas_de_charge' };
        const prof = profilMelee(j);
        const dureePleine = prof.vitesse * R().CHARGE.FACTEUR_DUREE * lenteur(j);
        const tenu = ta - j.charge.debut;
        const c = tenu < PARAMS_SIM.TAPE_MS ? 0 : clamp((tenu - PARAMS_SIM.TAPE_MS) / Math.max(1, dureePleine - PARAMS_SIM.TAPE_MS), 0, 1);
        const ok = frapperCoup(j, (prof.charge || 1) > 1 ? c : 0, ta);
        return { ok, raison: ok ? null : 'personne' };
      }
      case 'garde': {
        j.gardeVeut = !!a.appui;
        if (a.appui) {
          if (j.empoigne) { j.garde = false; return { ok: false, raison: 'empoigne' }; }
          j.charge = null; j.visee = null; j.fuite = null;
          if (!j.garde) { j.garde = true; j.gardeDebut = Math.max(ta, j.briseeJusqu); }
        } else j.garde = false;
        return { ok: true };
      }
      case 'esquive': {
        const E = R().ESQUIVE;
        if (j.empoigne) return { ok: false, raison: 'empoigne' };
        if (j.sta < E.SEUIL_EPUISE) { emit('refus', { joueur: j.id, action: 'esquive', raison: 'a_bout' }); return { ok: false, raison: 'a_bout' }; }
        if (ta < j.esquiveCd || ta < j.briseeJusqu) return { ok: false, raison: 'cooldown' };
        // L'esquive annule une charge, une visée, une recharge, la fin d'un coup.
        j.charge = null; j.visee = null; j.recharge = null; j.change = null; j.soin = null; j.fuite = null; j.tampon = null;
        j.garde = false;
        depenser(j, E.STA, ta);
        const lent = lenteur(j);
        j.esquiveJusqu = ta + E.DUREE_MS * lent; j.occupeJusqu = j.esquiveJusqu; j.esquiveCd = ta + E.COOLDOWN_MS * lent;
        const z = j.actif && zombie(j.actif);
        if (z && z.etat === 'telegraphe' && !z.esquivee) {
          const s = j.stats;
          let fen = E.PARFAITE_MS + E.PARFAITE_PAR_AGILITE * (s.agilite ?? niv(j, 'agilite')) + (s.tactile ? E.MARGE_TACTILE_MS : 0);
          fen *= diff.fenetreEsquive || 1;
          if ((s.fatigue ?? 100) < 35) fen *= E.FATIGUE;
          fen *= 1 + (E.SURPOIDS - 1) * (s.surpoids || 0);
          const restant = Math.max(0, z.telFin - ta);
          const parfaite = restant <= fen;
          z.esquivee = true;
          if (parfaite) {
            j.contreJusqu = Math.max(ta, z.telFin) + E.CONTRE_MS;
            j.sta = Math.min(j.staMax, j.sta + E.REMBOURSE_PARFAITE);
            xp(j, 'agilite', R().XP.parfaite);
          } else xp(j, 'agilite', R().XP.esquive);
          emit('esquive', { joueur: j.id, zombie: z.uid, parfaite, ruee: z.rueeType, restant: Math.round(restant), fenetre: Math.round(fen) });
        } else {
          if (z && z.etat === 'menace') z.menace = Math.max(0, z.menace - E.HORS_TELEGRAPHE_RECUL);
          emit('esquive', { joueur: j.id, zombie: z ? z.uid : null, vide: true });
        }
        return { ok: true };
      }
      case 'pousser': {
        if (j.empoigne) { marteler(j, ta); return { ok: true }; }
        const Pp = R().POUSSEE;
        if (ta < j.pousseePret) { emit('refus', { joueur: j.id, action: 'pousser', raison: 'recharge', restant: Math.round(j.pousseePret - ta) }); return { ok: false, raison: 'recharge' }; }
        if (occupe(j, ta)) { return { ok: false, raison: 'occupe' }; }
        const z = cibleDe(j);
        if (!z) return { ok: false, raison: 'personne' };
        j.charge = null; j.visee = null; j.fuite = null;
        depenser(j, Pp.STA, ta);
        j.pousseePret = ta + Pp.RECHARGE_MS;
        j.occupeJusqu = ta + PARAMS_SIM.POUSSEE_GESTE_MS * lenteur(j);
        j.geste = 'poussee';
        const res = z.def.resistance || 0;
        let resultat = 'recule', annule = false;
        if (res >= Pp.RESISTANCE_BLOQUE) {
          resultat = 'immobile';
          if (z.etat === 'menace') z.menace = Math.max(0, z.menace - Pp.RECUL_RESISTANT);
        } else {
          if (z.etat === 'telegraphe') { z.etat = 'menace'; z.menace = 1 - Pp.RECUL; annule = true; }
          else if (z.etat === 'menace') z.menace = Math.max(0, z.menace - Pp.RECUL);
          couperCri(z);
          const pt = Pp.TERRE_BASE + Pp.TERRE_PAR_FORCE * niv(j, 'force') - 0.5 * res;
          if (z.def.special !== 'rampe' && EN_JEU.has(z.etat) && z.etat !== 'a_terre' && rnd() < pt) {
            z.etat = 'a_terre'; z.fin = t + R().A_TERRE.MS; resultat = 'a_terre';
          }
        }
        emit('poussee', { joueur: j.id, zombie: z.uid, resultat, annule });
        return { ok: true };
      }
      case 'tirer': {
        if (!estTir(j.arme)) return { ok: false, raison: 'pas_arme_tir' };
        if (a.appui) {
          if (j.empoigne) { marteler(j, ta); return { ok: true }; }
          if (occupe(j, ta)) return { ok: false, raison: 'occupe' };
          if (j.balles <= 0) { emit('tir_vide', { joueur: j.id }); return { ok: false, raison: 'vide' }; }
          j.charge = null; j.garde = false; j.fuite = null;
          j.visee = { debut: ta };
          return { ok: true };
        }
        if (!j.visee) return { ok: false, raison: 'pas_de_visee' };
        tirer(j, ta);
        return { ok: true };
      }
      case 'recharger': {
        const ar = j.arme;
        if (!estTir(ar)) return { ok: false, raison: 'pas_arme_tir' };
        if (j.empoigne || j.recharge || j.change || j.soin) return { ok: false, raison: 'occupe' };
        if (j.balles >= ar.tir.capacite) { emit('refus', { joueur: j.id, action: 'recharger', raison: 'plein' }); return { ok: false, raison: 'plein' }; }
        if (j.reserve <= 0) { emit('refus', { joueur: j.id, action: 'recharger', raison: 'plus_de_munitions' }); return { ok: false, raison: 'plus_de_munitions' }; }
        const d = ar.tir.recharge * (1 - R().TIR.RECHARGE_PAR_NIVEAU * niv(j, 'visee')) * lenteur(j);
        j.visee = null; j.charge = null;
        // Pendant la fin d'un geste, la recharge s'enchaîne juste après (jamais d'appui perdu).
        j.recharge = { fin: Math.max(ta, j.occupeJusqu, j.briseeJusqu) + d, duree: d };
        emit('recharge', { joueur: j.id, duree: Math.round(d), fin: false });
        return { ok: true };
      }
      case 'rapide': {
        const slot = j.accesRapide[a.index | 0];
        if (!slot || (slot.qty != null && slot.qty <= 0)) return { ok: false, raison: 'vide' };
        if (j.empoigne || j.recharge || j.change || j.soin) return { ok: false, raison: 'occupe' };
        const libre = Math.max(ta, j.occupeJusqu, j.briseeJusqu);
        const def = ITEMS[slot.id];
        if (!def) return { ok: false, raison: 'inconnu' };
        if (def.type === 'arme') {
          j.charge = null; j.visee = null;
          j.change = { fin: libre + R().ACCES_RAPIDE.CHANGER_ARME_MS * lenteur(j), slot: a.index | 0 };
          return { ok: true };
        }
        if (def.jet && def.jet.combat) {
          if (occupe(j, ta)) { emit('refus', { joueur: j.id, action: 'rapide', raison: 'occupe' }); return { ok: false, raison: 'occupe' }; }
          return lancer(j, slot, def, ta);
        }
        if (def.type === 'soin' || def.soin) {
          const bander = def.soin === 'bandage';
          j.charge = null; j.visee = null;
          j.soin = { fin: libre + (bander ? R().ACCES_RAPIDE.BANDER_MS : R().ACCES_RAPIDE.SOIN_MS), slot: a.index | 0, objet: slot.id };
          return { ok: true };
        }
        emit('refus', { joueur: j.id, action: 'rapide', raison: 'pas_en_combat', objet: slot.id });
        return { ok: false, raison: 'pas_en_combat' };
      }
      case 'fuir': {
        if (a.appui) {
          if (j.empoigne) return { ok: false, raison: 'empoigne' };
          j.charge = null; j.visee = null; j.garde = false;
          j.fuite = { debut: ta };
        } else j.fuite = null;
        return { ok: true };
      }
      case 'cible': {
        const z = a.cible && zombie(a.cible);
        j.cible = z && vivant(z) ? z.uid : null;
        return { ok: true };
      }
      case 'relever': {
        const c = joueur(a.cible);
        if (!a.appui) { j.releve = null; return { ok: true }; }
        if (!c || !c.aTerre) return { ok: false, raison: 'personne' };
        j.releve = { cible: c.id, debut: ta };
        return { ok: true };
      }
      default: return { ok: false, raison: 'inconnue' };
    }
  }

  // ------------------------------------------------------------- pas de simulation
  function majJoueur(j) {
    if (j.issue) return;
    if (j.aTerre) {
      if (t >= j.aTerreFin) { j.aTerre = false; j.issue = 'mort'; emit('mort_joueur', { joueur: j.id, par: null }); }
      return;
    }
    const E = R().ENDURANCE;
    // Endurance : garde −2/s ; charge/visée 0 ; sinon repos +14/s ou actif +4/s.
    if (j.garde) j.sta = Math.max(0, j.sta - R().GARDE.STA_PAR_S * PAS_MS / 1000);
    else if (j.charge || j.visee || j.empoigne) { /* rien */ }
    else {
      const regen = t - j.dernierGeste >= E.DELAI_REPOS_MS ? E.REGEN_REPOS : E.REGEN_ACTIF;
      j.sta = Math.min(j.staMax, j.sta + regen * (j.stats.regenMult ?? 1) * PAS_MS / 1000);
    }
    // Fin de gestes longs
    if (j.recharge && t >= j.recharge.fin) {
      const cap = j.arme.tir ? j.arme.tir.capacite : 0;
      const n = Math.min(cap - j.balles, j.reserve);
      j.balles += n; j.reserve -= n;
      const mid = j.arme.tir && j.arme.tir.munition;
      if (mid) j.munChargees[mid] = (j.munChargees[mid] || 0) + n;
      j.recharge = null;
      emit('recharge', { joueur: j.id, fin: true, balles: j.balles, reserve: j.reserve });
    }
    if (j.change && t >= j.change.fin) {
      const idx = j.change.slot; j.change = null;
      const slot = j.accesRapide[idx];
      const def = slot && ITEMS[slot.id];
      if (def && def.type === 'arme') {
        const ancienne = j.arme;
        const neuve = armeDepuisSlot(slot, def);
        // Échange : l'arme en main prend la place à la ceinture (sauf les mains nues : l'emplacement se vide).
        if (ancienne.id !== MAINS_NUES_ID) j.accesRapide[idx] = { id: ancienne.id, qty: 1, dur: ancienne.dur, balles: j.balles, _reserve: j.reserve };
        else j.accesRapide[idx] = { id: null, qty: 0 };
        j.echanges.push({ slot: idx, prend: neuve.id, prendDur: neuve.dur, pose: ancienne.id, poseDur: ancienne.dur, poseBalles: ancienne.tir ? j.balles : undefined });
        j.arme = neuve; j.balles = neuve.balles || 0; j.reserve = slot._reserve ?? neuve.reserve ?? 0;
        emit('change_arme', { joueur: j.id, arme: neuve.id, nom: neuve.nom });
      }
    }
    if (j.soin && t >= j.soin.fin) {
      const s = j.soin; j.soin = null;
      const slot = j.accesRapide[s.slot];
      if (slot) slot.qty = (slot.qty || 1) - 1;
      j.jets.push(s.objet);
      emit('soin', { joueur: j.id, objet: s.objet, slot: s.slot });
    }
    // Garde qui se relève après un geste / une brisure, si le bouton est encore tenu.
    if (j.gardeVeut && !j.garde && !occupe(j) && !j.charge && !j.visee && !j.empoigne && !j.fuite) { j.garde = true; j.gardeDebut = t; }
    // Tampon : appui fait pendant un geste
    if (j.tampon && !occupe(j) && !j.empoigne) {
      const tp = j.tampon; j.tampon = null;
      if (t - tp.t <= PARAMS_SIM.TAMPON_MS || !tp.relache) {
        if (tp.relache) frapperCoup(j, 0, t);
        else { j.garde = false; j.charge = { debut: t }; }
      }
    }
    // Fuite
    if (j.fuite && t - j.fuite.debut >= R().FUITE.MAINTIEN_MS) {
      j.fuite = null;
      const F = R().FUITE;
      const vivants = Z.filter(vivant).length;
      const a = j.actif && zombie(j.actif);
      const s = j.stats;
      let p = F.BASE + F.PAR_AGILITE * (s.agilite ?? niv(j, 'agilite')) + F.PAR_MORT_EN_PLUS * Math.max(0, vivants - 1)
        + F.STA * (j.sta / j.staMax - 0.5) + (s.jambeBlessee ? F.JAMBE : 0) + F.SURPOIDS * (s.surpoids || 0)
        + (a && (a.etat === 'a_terre' || a.etat === 'vacille') ? F.MORT_NEUTRALISE : 0);
      p = clamp(p, F.MIN, F.MAX);
      if (rnd() < p) {
        depenser(j, F.COUT_STA);
        j.issue = 'fuite';
        xp(j, 'agilite', R().XP.fuite);
        libererMort(j);
        emit('fuite', { joueur: j.id, reussie: true, chance: Math.round(p * 100) });
      } else {
        emit('fuite', { joueur: j.id, reussie: false, chance: Math.round(p * 100) });
        if (a && EN_JEU.has(a.etat) && a.etat !== 'telegraphe' && a.etat !== 'empoignade') debutTelegraphe(a, F.ECHEC_TELEGRAPHE);
      }
    }
    // Relever un partenaire
    if (j.releve) {
      const c = joueur(j.releve.cible);
      if (!c || !c.aTerre) j.releve = null;
      else if (t - j.releve.debut >= REGLAGES.coop.RELEVER_MS) {
        c.aTerre = false; c.pv = REGLAGES.coop.PV_RELEVE; j.releve = null;
        emit('releve', { joueur: c.id, par: j.id });
      }
    }
  }
  function armeDepuisSlot(slot, def) {
    return { id: slot.id, nom: def.nom, dmg: def.dmg.slice(), vitesse: def.vitesse, sta: def.sta, allonge: def.allonge || 0,
      charge: def.charge || 1, stagger: def.stagger || 0, crit: def.crit || 0, skill: def.skill, bruit: def.bruit || 0,
      tir: def.tir || null, crosse: def.crosse || null, dur: slot.dur ?? def.dur ?? null, durMax: def.dur ?? null,
      balles: slot.balles || 0, reserve: slot._reserve ?? slot.reserve ?? 0 };
  }

  function majZombie(z) {
    if (!EN_JEU.has(z.etat)) return;
    const j = joueur(z.joueur);
    // Feu (molotov)
    if (z.feu) {
      if (t >= z.feu.fin) z.feu = null;
      else {
        z.hp -= z.feu.dps * PAS_MS / 1000;
        if (z.hp <= 0) { const par = joueur(z.feu.par) || j || J[0]; tuer(z, par, { allonge: 2, skill: 'visee' }, { tir: false, jet: true }); return; }
      }
    }
    // Hurleur : jauge de cri
    if (z.cri && !z.cri.fait && t >= z.cri.debut && (z.etat === 'menace' || z.etat === 'telegraphe' || z.etat === 'recup')) {
      z.cri.p += PAS_MS / (z.def.params && z.def.params.criMs || 2500);
      if (z.cri.p >= 1) {
        z.cri.fait = true; z.cri.p = 1;
        const rr = (z.def.params && z.def.params.renforts) || [1, 2];
        emit('cri', { zombie: z.uid });
        planifierRenfort('cri', rInt(rr[0], rr[1]), PARAMS_SIM.CRI_RENFORT_MS);
      }
    }
    if (!j || !enJeu(j)) return;
    switch (z.etat) {
      case 'entree':
        if (t >= z.fin) { z.etat = 'menace'; }
        break;
      case 'menace': {
        const allonge = (j.arme && j.arme.allonge) || 0;
        z.menace += PAS_MS / (z.baseMenace * (1 + R().ALLONGE_MENACE * allonge));
        if (z.menace >= 1) debutTelegraphe(z);
        break;
      }
      case 'telegraphe':
        if (t >= z.telFin) ruee(z);
        break;
      case 'recup': case 'vacille': case 'a_terre':
        if (t >= z.fin) {
          z.etat = 'menace';
          if (z.enchaineAnnonce) { z.enchaineAnnonce = false; emit('enchaine', { zombie: z.uid, joueur: j.id }); }
          if (z.menace >= 1) debutTelegraphe(z);
        }
        break;
      case 'empoignade':
        if (z.saisie && t >= z.saisie.fin) {
          j.empoigne = null; z.saisie = null;
          toucherJoueur(z, j, true);
          apresRuee(z);
        }
        break;
    }
  }

  function verifierFin() {
    if (estFini) return;
    const actifs = J.filter(enJeu);
    const vivants = Z.filter(vivant);
    if (J.length && !actifs.length) {
      for (const j of J) if (!j.issue) { j.issue = 'mort'; j.aTerre = false; }
      estFini = true;
    } else if (!vivants.length && !attente.length && J.length) {
      for (const j of J) {
        if (j.issue) continue;
        if (j.aTerre) { j.aTerre = false; j.pv = REGLAGES.coop.PV_RELEVE; }
        j.issue = 'victoire';
      }
      estFini = true;
    }
    if (estFini && !finEmise) {
      finEmise = true;
      emit('fin', { issues: Object.fromEntries(J.map(j => [j.id, j.issue])) });
    }
  }

  function pas() {
    t += PAS_MS;
    arriveeRenforts();
    for (const j of J) majJoueur(j);
    attribuer();
    for (const z of Z) majZombie(z);
    // Combat bruyant qui dure : renfort possible toutes les 15 s.
    if (bruyant && t >= prochainLong) {
      prochainLong = t + 15000;
      if (rnd() < R().RENFORTS.COMBAT_LONG_P) planifierRenfort('bruit', 1);
    }
    verifierFin();
  }

  function tick(dtMs) {
    if (estFini) { const out = evts; evts = []; return out; }
    reste += Math.max(0, Math.min(dtMs, 1000));
    while (reste >= PAS_MS && !estFini) { reste -= PAS_MS; pas(); }
    const out = evts; evts = [];
    return out;
  }

  // ------------------------------------------------------------- lecture
  function coutBloc(j, z) {
    if (!z) return 0;
    const G_ = R().GARDE;
    const moy = (z.def.dmg[0] + z.def.dmg[1]) / 2 * (diff.degatsMorts || 1);
    const reduc = (j.arme.id === MAINS_NUES_ID ? G_.REDUC_MAINS : G_.REDUC_ARME) * (z.def.perceGarde ?? 1);
    return Math.round(moy * reduc * G_.STA_PAR_DEGAT);
  }
  function etat() {
    const file = Z.filter(z => z.etat === 'file').sort((a, b) => a.ordre - b.ordre).map(z => z.uid);
    return {
      id, t, fini: estFini, lieuId, surprise,
      renfortsEnRoute: attente.length, prochainRenfort: attente.length ? Math.min(...attente.map(a => a.t)) - t : null,
      participants: J.map(j => {
        const z = j.actif && zombie(j.actif);
        const prof = profilMelee(j);
        const dureePleine = prof.vitesse * R().CHARGE.FACTEUR_DUREE * lenteur(j);
        const emp = j.empoigne && zombie(j.empoigne);
        return {
          id: j.id, nom: j.nom, pv: Math.max(0, Math.round(j.pv)), pvMax: j.pvMax, sta: Math.round(j.sta * 10) / 10, staMax: j.staMax,
          issue: j.issue, aTerre: j.aTerre, aTerreRestant: j.aTerre ? Math.max(0, j.aTerreFin - t) : 0,
          actif: j.actif, cible: j.cible,
          occupe: occupe(j), geste: t < j.occupeJusqu ? j.geste : null,
          charge: j.charge ? clamp((t - j.charge.debut - PARAMS_SIM.TAPE_MS) / Math.max(1, dureePleine - PARAMS_SIM.TAPE_MS), 0, 1) : null,
          visee: j.visee ? clamp((t - j.visee.debut) / Math.max(200, R().TIR.VISEE_MS - R().TIR.VISEE_PAR_NIVEAU * niv(j, 'visee')), 0, 1) : null,
          garde: j.garde, gardePrete: j.garde && t - j.gardeDebut >= R().GARDE.MONTEE_MS,
          brisee: t < j.briseeJusqu, esquive: t < j.esquiveJusqu, esquiveCd: Math.max(0, j.esquiveCd - t),
          aBout: j.sta < R().ESQUIVE.SEUIL_EPUISE, essouffle: essouffle(j),
          contre: Math.max(0, j.contreJusqu - t), poussee: Math.max(0, j.pousseePret - t),
          fuite: j.fuite ? clamp((t - j.fuite.debut) / R().FUITE.MAINTIEN_MS, 0, 1) : null,
          recharge: j.recharge ? clamp(1 - (j.recharge.fin - t) / j.recharge.duree, 0, 1) : null,
          change: !!j.change, soin: !!j.soin, releve: j.releve ? clamp((t - j.releve.debut) / REGLAGES.coop.RELEVER_MS, 0, 1) : null,
          empoignade: emp && emp.saisie ? { zombie: emp.uid, restant: Math.max(0, emp.saisie.fin - t), duree: emp.saisie.fin - emp.saisie.debut,
            taps: emp.saisie.taps, requis: emp.saisie.requis } : null,
          arme: { id: j.arme.id, nom: j.arme.nom, dur: j.arme.dur, durMax: j.arme.durMax, tir: !!j.arme.tir,
            balles: j.balles, capacite: j.arme.tir ? j.arme.tir.capacite : 0, reserve: j.reserve, allonge: j.arme.allonge || 0,
            staCoup: Math.round(prof.sta * surpoidsMult(j) * 10) / 10,
            staLourd: Math.round(prof.sta * R().CHARGE.STA_MULT_PLEIN * surpoidsMult(j) * 10) / 10 },
          coutBloc: coutBloc(j, z),
          accesRapide: j.accesRapide.map(s => (s && s.id ? { id: s.id, nom: (ITEMS[s.id] || {}).nom || s.id, qty: s.qty ?? 1, type: (ITEMS[s.id] || {}).type } : null)),
        };
      }),
      zombies: Z.map(z => ({
        uid: z.uid, type: z.type, nom: z.nom, hp: Math.max(0, Math.ceil(z.hp)), hpMax: z.hpMax, etat: z.etat, joueur: z.joueur,
        menace: Math.round(clamp(z.menace, 0, 1) * 1000) / 1000,
        ruee: z.etat === 'telegraphe' ? z.rueeType : null,
        tel: z.etat === 'telegraphe' ? clamp((t - z.telDebut) / (z.telFin - z.telDebut), 0, 1) : null,
        telRestant: z.etat === 'telegraphe' ? Math.max(0, z.telFin - t) : null,
        rang: z.etat === 'file' ? file.indexOf(z.uid) + 1 : 0,
        cri: z.cri && !z.cri.fait && z.cri.p > 0 ? z.cri.p : null,
        feu: !!z.feu, esquivee: z.esquivee,
      })),
      file,
    };
  }
  function resultat(jid) {
    const j = joueur(jid);
    if (!j) return null;
    const tues = Z.filter(z => z.etat === 'mort').map(z => z.uid);
    const vivants = Z.filter(vivant).map(z => z.uid);
    const fuisZ = Z.filter(z => z.etat === 'fui').map(z => z.uid);
    const munitions = { ...j.munChargees };
    // Carreaux d'arbalète : une partie se récupère après le combat (graine).
    if (j.carreauxTires && j.arme.tir && j.arme.tir.recuperable) {
      const r2 = seedRng(`${seed}:combat:${id}:carreaux:${jid}`);
      let recup = 0; for (let i = 0; i < j.carreauxTires; i++) if (r2() < j.arme.tir.recuperable) recup++;
      munitions.recuperes = { [j.arme.tir.munition]: recup };
    }
    return {
      issue: j.issue || (estFini ? 'victoire' : null),
      tues, tuesParMoi: Z.filter(z => z.etat === 'mort' && z.tuePar === jid).length, fuis: j.issue === 'fuite' ? [...vivants, ...fuisZ] : fuisZ, restants: vivants,
      blessures: j.blessures.slice(), xp: { ...j.xp }, usure: { ...j.usure }, munitions,
      arme: { id: j.arme.id === MAINS_NUES_ID ? null : j.arme.id, dur: j.arme.dur, balles: j.balles, depart: j.armeDepart },
      echanges: j.echanges.slice(), accesRapide: j.accesRapide.map(s => (s && s.id ? { ...s } : null)), consommes: j.jets.slice(),
      bruit: bruitMax, dureeMs: t, pv: Math.max(0, Math.round(j.pv)), sta: Math.round(j.sta), degatsRecus: j.degatsRecus,
      mal: Math.round(j.mal * 10) / 10,
    };
  }

  // ------------------------------------------------------------- construction
  function ajouterParticipant(p) {
    if (joueur(p.id)) return;
    const j = nouveauJoueur(p);
    J.push(j);
    emit('rejoint', { joueur: j.id, nom: j.nom });
    attribuer();
  }
  function ajouterZombies(liste) {
    const n = (liste || []).map(nouveauZombie);
    Z.push(...n);
    if (n.length) emit('renfort', { uids: n.map(z => z.uid), types: n.map(z => z.type), cause: 'arrivee' });
  }

  // Départ : un mort actif par joueur, jauge selon la surprise ; le reste en file.
  for (const p of participants) J.push(nouveauJoueur(p));
  for (const z of zombies) Z.push(nouveauZombie(z));
  const depart = R().MENACE_DEPART[surprise] ?? R().MENACE_DEPART.normal;
  for (const j of J) {
    const z = Z.find(x => x.etat === 'file');
    if (!z) break;
    z.etat = 'menace'; z.joueur = j.id; j.actif = z.uid; z.menace = depart; tirerDureeMenace(z);
    if (z.def.special === 'hurle') z.cri = { debut: PARAMS_SIM.PREMIER_CRI_MS, p: 0, fait: false };
  }
  emit('debut', { participants: J.map(j => j.id), zombies: Z.map(z => z.uid), surprise });

  return {
    id, action, tick, etat, resultat, ajouterParticipant, ajouterZombies,
    fini: () => estFini,
    temps: () => t,
  };
}
