// ============ Combat dans l'exploration — CÔTÉ JOUEUR (gestes, endurance, retours, application au corps) ============
// La simulation du lieu résout tout (sim.action) ; ici : ce que le joueur local fait et ressent.
//   creerCombatVue(o) → { frapper(appui), pousser(), recharger(), echangerMains(), dos(), rapide(i),
//                         maj(dt, t), vitesseMult(), dirForcee(), surEvt(e), rendu(t), fx, fermer() }
// o = { canal, j: () => V.j, zombies: () => V.zListe, message, sfx, sfxA, vib, inv, player, survie, entrees, tactile: () => bool,
//       pause: () => bool }
import { G } from '../core/state.js';
import { pref, setPref } from '../core/prefs.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { nomMort } from '../data/zombies.js';
import { statsCombat } from '../game/stats_combat.js';
import { profilMelee, geometrie, dureeGeste, chargeDepuisAppui, coutCoup, essouffle, dureeChargePleine } from './combat.js';

const RC = REGLAGES.combat;
const NOM_PLAIE = { egratignure: 'Égratignure', contusion: 'Contusion', entaille: 'Entaille', profonde: 'Blessure profonde', morsure: 'Morsure', fracture: 'Fracture', brulure: 'Brûlure' };
const RAISON_RATE = { derobe: 'Il se dérobe.', essouffle: 'Trop essoufflé : le coup part à côté.', noir: 'Raté : dans le noir.', vide: 'Raté.' };
const angDiff = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };

export function creerCombatVue(o) {
  const C = o.canal;
  const moi = C.joueurId || 'local';
  const S = {
    stats: null, tStats: 0,
    geste: null,          // { type: 'rapide'|'lourd'|'poussee'|'tir'|'recharge', t0, duree, dir }
    charge: null,         // { t0 } appui en cours sur Frapper
    pousseePret: 0,
    empoigne: null,       // { uid, requis, taps, fin, duree, t0 }
    recharge: null,       // { fin, duree }
    dirForcee: null, tDirForcee: 0,
    cibleAuto: null,
    secousse: 0, flash: 0,
    mort: false,
  };
  const fx = [];          // effets éphémères : { type: 'nombre'|'sang'|'eclat'|'trait'|'arc', x, y, … age, duree }
  const sang = [];        // taches au sol (persistantes, plafonnées)
  const now = () => performance.now();

  // ---------- Profil courant ----------
  function stats() {
    const t = now();
    if (!S.stats || t - S.tStats > 1500) majStats();
    return S.stats;
  }
  function majStats(envoyer = true) {
    try {
      S.stats = statsCombat(G.player, { tactile: o.tactile() });
      try { S.stats.surpoids = o.inv && o.inv.surpoids ? o.inv.surpoids().f : 0; } catch (e) {}
      S.tStats = now();
      if (envoyer) C.majJoueur({ stats: S.stats });
    } catch (e) { console.warn('[combat] stats', e); }
    return S.stats;
  }
  const arme = () => stats().arme;
  const estTir = () => !!(arme() && arme().tir);
  const sta = () => G.player.sta ?? 100;
  const depenser = (n) => { G.player.sta = Math.max(0, sta() - n); };
  const occupe = (t = now()) => (S.geste && t < S.geste.t0 + S.geste.duree) || !!S.recharge;

  // ---------- Visée ----------
  // Tactile : on se tourne vers le mort le plus menaçant à portée (sinon on frappe droit devant).
  function viserAuto() {
    const j = o.j(); if (!o.tactile()) return null;
    const V = RC.VISEE_AUTO;
    let best = null, bs = Infinity;
    for (const z of o.zombies()) {
      if (z.etage !== j.etage || !z._vu) continue;
      const d = Math.hypot(z.x - j.x, z.y - j.y);
      const a = Math.abs(angDiff(Math.atan2(z.y - j.y, z.x - j.x), j.dir));
      if (!(d <= V.PORTEE && a <= V.ANGLE_DEG * Math.PI / 180) && !(d <= 1.4)) continue;
      const menace = (z.atk && z.atk.cible === moi) || z.saisit === moi ? -1 : 0;
      const s = d + a * 0.5 + menace;
      if (s < bs) { bs = s; best = z; }
    }
    if (!best) return null;
    S.cibleAuto = best.uid;
    return Math.atan2(best.y - j.y, best.x - j.x);
  }
  function tourner(dir) { if (dir == null) return; const j = o.j(); j.dir = dir; S.dirForcee = dir; S.tDirForcee = now() + 260; }

  // ---------- Gestes ----------
  function frapper(appui, annule) {
    if (S.mort || o.pause()) return;
    if (S.empoigne) { if (appui) marteler(); return; }
    if (estTir()) return appui ? debutVisee() : (annule ? (S.charge = null) : tirer());
    if (appui) {
      if (S.charge) return;
      S.charge = { t0: now() };
      tourner(viserAuto());
      return;
    }
    if (!S.charge) return;
    const tenu = now() - S.charge.t0; S.charge = null;
    if (annule) return;
    const t = now();
    // Un appui pendant la fin d'un geste attend la fin (jamais d'appui perdu).
    const attente = occupe(t) ? Math.max(0, S.geste ? S.geste.t0 + S.geste.duree - t : 0) : 0;
    const go = () => coup(tenu);
    if (attente > 0 && attente < 450) setTimeout(go, attente); else if (!attente) go();
  }
  function coup(tenu) {
    if (S.mort) return;
    const st = majStats(false), prof = profilMelee(st.arme);
    const ess = essouffle(sta());
    const c = chargeDepuisAppui(prof, tenu, ess);
    const duree = dureeGeste(prof, ess);
    const j = o.j();
    tourner(viserAuto() ?? j.dir);
    depenser(coutCoup(prof, c, st));
    S.geste = { type: c >= RC.CHARGE.SEUIL_LOURD ? 'lourd' : 'rapide', t0: now(), duree, dir: j.dir, charge: c, allonge: prof.allonge || 0 };
    o.sfx(c >= RC.CHARGE.SEUIL_LOURD ? 'puissance' : 'rate', { volume: 0.35 });
    // le coup porte à IMPACT du geste : on envoie l'action à ce moment-là
    setTimeout(() => {
      if (S.mort) return;
      const jj = o.j();
      C.action({ type: 'frapper', charge: c, x: jj.x, y: jj.y, dir: S.geste ? S.geste.dir : jj.dir, ess, stats: S.stats });
    }, Math.round(duree * RC.IMPACT));
  }
  function pousser() {
    if (S.mort || o.pause()) return;
    if (S.empoigne) { marteler(); return; }
    const P = RC.POUSSEE, t = now();
    if (t < S.pousseePret) return;
    if (occupe(t) && S.geste && S.geste.type !== 'tir') return;
    S.charge = null;
    tourner(viserAuto());
    depenser(P.STA * (1 + 0.5 * (stats().surpoids || 0)));
    S.pousseePret = t + P.COOLDOWN_MS;
    const j = o.j();
    S.geste = { type: 'poussee', t0: t, duree: P.GESTE_MS, dir: j.dir };
    setTimeout(() => { if (!S.mort) { const jj = o.j(); C.action({ type: 'pousser', x: jj.x, y: jj.y, dir: S.geste ? S.geste.dir : jj.dir, stats: S.stats }); } }, 90);
  }
  function marteler() {
    const e = S.empoigne; if (!e) return;
    depenser(RC.EMPOIGNADE.STA_PAR_TAP);
    S.geste = { type: 'poussee', t0: now(), duree: 140, dir: o.j().dir };
    o.vib(15);
    C.action({ type: 'marteler', ess: sta() < RC.EMPOIGNADE.STA_PAR_TAP });
  }
  // --- Armes de tir : maintenir = viser, relâcher = tirer ---
  function debutVisee() { if (S.charge || occupe()) return; S.charge = { t0: now(), visee: true }; tourner(viserAuto()); }
  function etatArmeTir() {
    const st = stats(), slot = st.armeSlot || 'arme';
    const e = (G.player.equipEtat && G.player.equipEtat[slot]) || {};
    return { slot, e, balles: e.balles || 0, tir: st.arme.tir };
  }
  function tirer() {
    const v = S.charge; S.charge = null;
    if (!v || S.mort) return;
    const a = etatArmeTir();
    if (a.balles <= 0) { o.sfx('clic'); o.message('Vide. Recharge (R / bouton Recharger).', 1800); return; }
    const TI = RC.TIR;
    const tv = Math.max(200, TI.VISEE_MS - TI.VISEE_PAR_NIVEAU * ((stats().niveaux || {}).visee || 0));
    const visee = Math.max(0, Math.min(1, (now() - v.t0) / tv)) * (o.j().allure === 'immobile' ? 1 : 0.5);
    a.e.balles = a.balles - 1;
    depenser(TI.STA);
    const j = o.j();
    tourner(viserAuto() ?? j.dir);
    S.geste = { type: 'tir', t0: now(), duree: Math.max(250, arme().vitesse || 300), dir: j.dir };
    o.sfx('tir');
    S.secousse = Math.max(S.secousse, 0.5);
    C.action({ type: 'tirer', visee, x: j.x, y: j.y, dir: j.dir, stats: S.stats });
    emit('inventaire', { tir: true });
  }
  function recharger() {
    if (S.mort || !estTir() || S.recharge) return;
    const a = etatArmeTir(); const cap = a.tir.capacite;
    if (a.balles >= cap) { o.message('Chargeur plein.', 1200); return; }
    const dispo = o.inv ? o.inv.countItem(a.tir.munition) : 0;
    if (!dispo) { o.message('Plus de munitions.', 1600); return; }
    const d = a.tir.recharge * (1 - RC.TIR.RECHARGE_PAR_NIVEAU * ((stats().niveaux || {}).visee || 0));
    S.charge = null;
    S.recharge = { fin: now() + d, duree: d };
    S.geste = { type: 'recharge', t0: now(), duree: d, dir: o.j().dir };
    o.sfx('clic');
    setTimeout(() => {
      if (!S.recharge) return;
      S.recharge = null;
      const b = etatArmeTir(); const n = Math.min(cap - b.balles, o.inv.countItem(b.tir.munition));
      if (n > 0) { o.inv.removeItem(b.tir.munition, n); b.e.balles = b.balles + n; }
      o.sfx('clic'); emit('inventaire', { recharge: true });
    }, d);
  }
  function echangerMains() {
    if (!o.inv || occupe()) return;
    const r = o.inv.echangerMains(); if (!r.ok) { o.message(r.raison, 1600); return; }
    S.geste = { type: 'change', t0: now(), duree: REGLAGES.inventaire.CHANGER_MAIN_MS, dir: o.j().dir };
    o.sfx('clic'); majStats();
  }
  function dos() {
    if (!o.inv || occupe()) return;
    const p = G.player;
    const r = p.equip.dos ? o.inv.dosVersMain() : p.equip.arme ? o.inv.mainVersDos('arme') : { ok: false, raison: 'Rien à passer dans le dos.' };
    if (!r.ok) { o.message(r.raison, 1600); return; }
    S.geste = { type: 'change', t0: now(), duree: REGLAGES.inventaire.CHANGER_MAIN_MS, dir: o.j().dir };
    o.sfx('tissu_dechire', { volume: 0.4 }); majStats();
  }
  // Accès rapide : prendre en main une arme accrochée à la ceinture.
  function rapide(i) {
    const p = G.player, id = p.accesRapide && p.accesRapide[i];
    if (!id || !o.inv || occupe()) return;
    const k = p.inventaire.findIndex(x => x.id === id);
    if (k < 0) return;
    const d = o.inv.def(id) || {};
    if (d.type !== 'arme' && !d.melee) { o.message(`${d.nom || id} : à utiliser depuis l'inventaire.`, 1600); return; }
    o.inv.tenir(k, 'droite');
    S.geste = { type: 'change', t0: now(), duree: REGLAGES.inventaire.CHANGER_MAIN_MS, dir: o.j().dir };
    o.sfx('clic'); majStats();
  }

  // ---------- Pas de jeu ----------
  function maj(dt) {
    const t = now();
    if (S.dirForcee != null && t > S.tDirForcee) S.dirForcee = null;
    // pendant la charge (tactile), on garde la cible en vue
    if (S.charge && o.tactile()) { const d = viserAuto(); if (d != null) tourner(d); }
    for (let i = fx.length - 1; i >= 0; i--) { fx[i].age += dt; if (fx[i].age > fx[i].duree) fx.splice(i, 1); }
    S.secousse = Math.max(0, S.secousse - dt / 400);
    S.flash = Math.max(0, S.flash - dt / 600);
    // bouton
    const prof = profilMelee(stats().arme);
    const ess = essouffle(sta());
    let ch = 0;
    if (S.charge && !S.charge.visee) ch = Math.min(1, Math.max(0, (t - S.charge.t0 - RC.CHARGE.TAPE_MS) / Math.max(1, dureeChargePleine(prof, ess) - RC.CHARGE.TAPE_MS)));
    if (S.charge && S.charge.visee) ch = Math.min(1, (t - S.charge.t0) / RC.TIR.VISEE_MS);
    const j = o.j();
    let proche = false;
    for (const z of o.zombies()) if (z.etage === j.etage && z._vu && Math.hypot(z.x - j.x, z.y - j.y) < 3) { proche = true; break; }
    o.entrees.setCombat({
      libelle: S.empoigne ? 'Dégage !' : estTir() ? (etatArmeTir().balles > 0 ? 'Tirer' : 'Vide') : 'Frapper',
      charge: ch, proche, empoigne: !!S.empoigne,
      pousseeCd: S.pousseePret > t ? (S.pousseePret - t) / RC.POUSSEE.COOLDOWN_MS : 0,
    });
    o.entrees.setVisible && o.entrees.setVisible('recharger', estTir());
  }
  function vitesseMult() {
    const t = now();
    if (S.empoigne || S.mort) return 0;
    if (S.geste && t < S.geste.t0 + S.geste.duree && S.geste.type !== 'change' && S.geste.type !== 'recharge') return RC.VITESSE_GESTE;
    if (S.charge) return RC.CHARGE.VITESSE;
    if (S.recharge) return 0.6;
    return 1;
  }

  // ---------- Retours ----------
  const nombre = (x, y, txt, cls) => fx.push({ type: 'nombre', x, y, txt, cls, age: 0, duree: 900 });
  function eclabousser(x, y, dir, n = 6, fort = false) {
    for (let k = 0; k < n; k++) {
      const a = dir + (Math.random() - 0.5) * 1.6, v = 0.6 + Math.random() * (fort ? 1.6 : 0.9);
      fx.push({ type: 'eclat', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1.2 + Math.random() * 2.2, age: 0, duree: 380 + Math.random() * 200 });
    }
    sang.push({ x: x + Math.cos(dir) * 0.35, y: y + Math.sin(dir) * 0.35, etage: o.j().etage, r: (fort ? 0.38 : 0.24) + Math.random() * 0.14, a: Math.random() * 6.28, s: Math.random() });
    if (sang.length > 140) sang.splice(0, sang.length - 140);
  }
  function xp(skill, n) { try { o.player && o.player.gagnerXp ? o.player.gagnerXp(skill, n) : null; } catch (e) {} }
  function surEvt(e) {
    const X = RC.XP;
    switch (e.type) {
      case 'coup': {
        const j = o.j();
        const dir = Math.atan2(e.y - j.y, e.x - j.x);
        eclabousser(e.x, e.y, e.joueur === moi ? dir : Math.random() * 6.28, e.crit || e.lourd ? 10 : 5, e.crit || e.lourd);
        if (e.joueur !== moi) { o.sfxA('coup', e.x, e.y, e.etage, 14); return; }
        nombre(e.x, e.y, (e.crit ? '!' : '') + e.degats, e.crit ? 'crit' : e.furtif ? 'furtif' : '');
        o.sfx(e.crit || e.lourd ? 'coup_critique' : 'coup');
        o.vib(e.lourd ? 35 : 18);
        S.secousse = Math.max(S.secousse, e.lourd || e.crit ? 0.6 : 0.25);
        if (e.interrompt) nombre(e.x, e.y - 0.4, 'Interrompu', 'info');
        else if (e.vacille) nombre(e.x, e.y - 0.4, 'Vacille', 'info');
        const st = S.stats || stats();
        const skill = e.tir ? 'visee' : (st.arme.skill || 'mainsNues');
        xp(skill, e.tir ? X.tir : X.touche);
        if (e.lourd) xp('force', X.charge_lourde);
        if (e.tue) xp(skill, X.tue);
        if (o.inv && st.armeSlot && G.player.equip[st.armeSlot] === e.arme) {
          try { const r = o.inv.userArme(e.lourd ? RC.COUP.USURE_LOURD : RC.COUP.USURE, G.player, st.armeSlot); if (r && r.casse) { o.message(`${st.arme.nom} se brise.`, 2200); majStats(); } } catch (err) {}
        }
        break;
      }
      case 'rate': if (e.joueur === moi) { nombre(e.x, e.y, RAISON_RATE[e.raison] || 'Raté', 'rate'); o.sfx('rate', { volume: 0.5 }); } break;
      case 'coup_vide': break;
      case 'mort_zombie': {
        eclabousser(e.x, e.y, Math.random() * 6.28, 8, true);
        if (e.joueur === moi) {
          const st = G.player.stats || (G.player.stats = {});
          st.morts = (st.morts || 0) + 1;
          st.tuesParType = st.tuesParType || {}; st.tuesParType[e.typeMort] = (st.tuesParType[e.typeMort] || 0) + 1;
          if (e.furtif) { o.message('Mise à mort silencieuse.', 1600); xp('discretion', REGLAGES.exploration.FURTIF.XP_DISCRETION); }
        }
        o.sfxA('mort', e.x, e.y, e.etage, 12);
        break;
      }
      case 'poussee': if (e.joueur === moi) {
        o.sfx(e.n ? 'coup' : 'rate', { volume: 0.5 });
        if (e.immobile && !e.n) o.message('Il ne bouge pas.', 1200);
        if (e.n) xp('force', X.poussee);
      } break;
      case 'telegraphe': if (e.joueur === moi) {
        o.sfx(e.attaque === 'saisie' ? 'alerte' : 'zombie', { volume: 0.45 });
        // Premier combat : trois conseils, pas plus.
        if (!S.tuto && !pref('tutoCombatVu')) {
          S.tuto = true; try { setPref('tutoCombatVu', true); } catch (err) {}
          o.message(o.tactile()
            ? 'Arc rouge : il va frapper — recule ou pousse-le. Arc ambre : il veut t\'agripper. Maintiens Frapper pour un coup chargé.'
            : 'Arc rouge : il va frapper — recule ou pousse-le (clic droit). Arc ambre : il veut t\'agripper. Maintiens le clic gauche pour un coup chargé.', 6500);
        }
      } break;
      case 'attaque': if (e.joueur === moi && e.issue === 'vide') o.sfx('rate', { volume: 0.3 }); break;
      case 'saisie': if (e.joueur === moi) {
        S.empoigne = { uid: e.uid, requis: e.requis, taps: 0, t0: now(), duree: e.duree, fin: now() + e.duree };
        S.charge = null;
        o.message(`${nomMort(e.typeMort, e.sexe)} t'agrippe ! Martèle Frapper ou Pousser (${e.requis}).`, 2200);
        o.sfx('alerte_contact'); o.vib([40, 30, 40]);
        S.secousse = Math.max(S.secousse, 0.5);
      } break;
      case 'martele': if (e.joueur === moi && S.empoigne) S.empoigne.taps = e.taps; break;
      case 'degage': if (e.joueur === moi) {
        if (S.empoigne && !e.lache) { o.message('Dégagé. Il tombe.', 1200); xp('force', X.empoignade); }
        S.empoigne = null;
      } break;
      case 'blessure': if (e.joueur === moi) appliquerBlessure(e); break;
      case 'bouscule': if (e.joueur === moi && o.bousculer) { o.bousculer(e.dx, e.dy); S.secousse = 1; } break;
      case 'tir': {
        fx.push({ type: 'trait', x: e.x, y: e.y, x2: e.x2, y2: e.y2, age: 0, duree: 140 });
        if (e.joueur !== moi) o.sfxA('tir', e.x, e.y, null, 40);
        break;
      }
      default: break;
    }
  }
  function appliquerBlessure(e) {
    if (S.empoigne && S.empoigne.uid === e.uid) S.empoigne = null;
    const p = G.player;
    const b = { ...e.blessure, zombie: e.typeMort, mal: e.mal };
    let fait = false;
    if (o.survie && o.survie.infligerBlessure) { try { fait = !!o.survie.infligerBlessure(p, b, { degats: e.degats, mal: e.mal }); } catch (err) { console.warn('[combat] infligerBlessure', err); } }
    if (!fait) { (p.blessures || (p.blessures = [])).push({ ...b, degats: e.degats, infecte: false, bandee: false, suturee: false, age: 0 }); p.pv = Math.max(0, (p.pv ?? 100) - e.degats); p.mal = Math.min(100, (p.mal || 0) + (e.mal || 0)); emit('blessure', { blessure: b, degats: e.degats }); }
    S.charge = null;
    S.secousse = 1; S.flash = 1;
    const j = o.j();
    eclabousser(j.x, j.y, Math.random() * 6.28, 6, e.degats > 10);
    nombre(j.x, j.y - 0.2, '−' + e.degats, 'moi');
    o.sfx('degats'); o.vib([60, 40, 60]);
    o.message(`${NOM_PLAIE[e.blessure.type] || e.blessure.type} ${e.blessure.zone}, −${e.degats} PV.${e.dentsBloquees ? ' Les dents ne passent pas.' : ''}`, 2400);
    if ((p.pv ?? 1) <= 0 || p.mort) mourir();
  }
  function mourir() {
    if (S.mort) return;
    S.mort = true; S.charge = null; S.empoigne = null;
    C.majJoueur({ mort: true });
  }

  // ---------- Pour le rendu ----------
  // État du joueur local à dessiner : geste en cours (p 0..1), charge, empoignade.
  function rendu() {
    const t = now();
    const g = S.geste && t < S.geste.t0 + S.geste.duree ? { type: S.geste.type, p: (t - S.geste.t0) / S.geste.duree, charge: S.geste.charge || 0, allonge: S.geste.allonge || 0 } : null;
    let ch = 0;
    if (S.charge && !S.charge.visee) { const prof = profilMelee(stats().arme); ch = Math.min(1, Math.max(0, (t - S.charge.t0 - RC.CHARGE.TAPE_MS) / Math.max(1, dureeChargePleine(prof, essouffle(sta())) - RC.CHARGE.TAPE_MS))); }
    const emp = S.empoigne ? { p: Math.min(1, (t - S.empoigne.t0) / S.empoigne.duree), taps: S.empoigne.taps, requis: S.empoigne.requis } : null;
    return { geste: g, charge: S.charge ? (S.charge.visee ? -1 : ch) : 0, vise: !!(S.charge && S.charge.visee), empoigne: emp, secousse: S.secousse, flash: S.flash };
  }

  majStats();
  return {
    frapper, pousser, recharger, echangerMains, dos, rapide, maj, vitesseMult, surEvt, rendu, majStats, mourir,
    dirForcee: () => S.dirForcee, fx, sang, etat: S,
    occupe: () => occupe() || !!S.charge || !!S.empoigne,
    fermer() { S.mort = true; },
  };
}
