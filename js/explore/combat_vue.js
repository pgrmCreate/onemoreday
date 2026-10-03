// ============ Combat dans l'exploration — CÔTÉ JOUEUR (« combat 2 ») ============
// La simulation du lieu juge tout (sim.action) ; ici : ce que le joueur local FAIT et RESSENT.
//   Gestes : frapper (tape = coup rapide, enchaîner 3 tapes = enchaînement, maintenir = coup chargé), pousser,
//            esquiver (ruée courte invulnérable), achever (frapper un mort à terre), tirer / recharger, mains, dos.
//   Retours : micro-arrêt de l'image à l'impact, secousse, gerbes de sang qui tachent le sol, traînée d'arme,
//            chiffres, voile rouge, vibration, ralenti sur esquive parfaite (seul).
// creerCombatVue(o) → { frapper(appui, annule), pousser(), esquiver(), recharger(), echangerMains(), dos(), rapide(i),
//                       maj(dt), vitesseMult(), dirForcee(), ruee(), echelleTemps(), surEvt(e), rendu(), fx, sang, etat, fermer() }
// o = { canal, j, zombies, message, sfx, sfxA, vib, inv, player, survie, entrees, tactile, pause, effets (rendu.effets),
//       etage () → E, mouvement () → { mx, my }, ralentir (f, ms), solo: bool }
import { G } from '../core/state.js';
import { pref, setPref } from '../core/prefs.js';
import { emit } from '../core/bus.js';
import { REGLAGES } from '../data/reglages.js';
import { nomMort } from '../data/zombies.js';
import { statsCombat } from '../game/stats_combat.js';
import { profilMelee, dureeGeste, chargeDepuisAppui, coutCoup, essouffle, dureeChargePleine } from './combat.js';

const RC = REGLAGES.combat;
const NOM_PLAIE = { egratignure: 'Égratignure', contusion: 'Contusion', entaille: 'Entaille', profonde: 'Blessure profonde', morsure: 'Morsure', fracture: 'Fracture', brulure: 'Brûlure' };
const angDiff = (a, b) => { let d = (a - b) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; };

export function creerCombatVue(o) {
  const C = o.canal;
  const moi = C.joueurId || 'local';
  const S = {
    stats: null, tStats: 0,
    geste: null,          // { type: 'rapide'|'lourd'|'poussee'|'tir'|'recharge'|'esquive'|'change', t0, duree, dir, combo, charge }
    charge: null,         // { t0 } appui en cours sur Frapper
    tampon: null,         // un appui pendant un geste : rejoué dès qu'il finit (jamais d'appui perdu)
    combo: 0, finCombo: 0,// enchaînement en cours, et fin de sa fenêtre
    pousseePret: 0, esquivePret: 0,
    ruee: null,           // { t0, duree, vx, vy } esquive en cours (déplacement forcé)
    empoigne: null,       // { uid, requis, taps, fin, duree, t0 }
    recharge: null,
    dirForcee: null, tDirForcee: 0,
    critJusqu: 0,         // après une esquive parfaite : prochain coup critique
    hitstop: 0,           // ms d'image figée restantes
    secousse: 0, flash: 0,
    mort: false, tuto: false,
  };
  const fx = [];
  const sang = [];
  const now = () => performance.now();

  // ---------- Profil courant ----------
  function stats() { if (!S.stats || now() - S.tStats > 1500) majStats(); return S.stats; }
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

  // ---------- Visée assistée (tactile) ----------
  function viserAuto(portee = RC.VISEE_AUTO.PORTEE) {
    const j = o.j(); if (!o.tactile()) return null;
    let best = null, bs = Infinity;
    for (const z of o.zombies()) {
      if (z.etage !== j.etage || !z._vu) continue;
      const d = Math.hypot(z.x - j.x, z.y - j.y);
      const a = Math.abs(angDiff(Math.atan2(z.y - j.y, z.x - j.x), j.dir));
      if (!(d <= portee && a <= RC.VISEE_AUTO.ANGLE_DEG * Math.PI / 180) && !(d <= 1.4)) continue;
      const menace = (z.atk && z.atk.cible === moi) || z.saisit === moi || z.fente != null ? -1 : 0;
      const s = d + a * 0.5 + menace + (z.terre ? -0.4 : 0);
      if (s < bs) { bs = s; best = z; }
    }
    return best ? Math.atan2(best.y - j.y, best.x - j.x) : null;
  }
  function tourner(dir, ms = 260) { if (dir == null) return; const j = o.j(); j.dir = dir; S.dirForcee = dir; S.tDirForcee = now() + ms; }

  // ---------- Frapper ----------
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
    if (occupe()) { S.tampon = { tenu, t: now() }; return; }
    coup(tenu);
  }
  function coup(tenu) {
    if (S.mort) return;
    const st = majStats(false), prof = profilMelee(st.arme);
    const ess = essouffle(sta());
    const c = chargeDepuisAppui(prof, tenu, ess);
    const t = now();
    // enchaînement : un coup rapide dans la fenêtre après le précédent
    if (c < RC.CHARGE.SEUIL_INTERRUPTION && t <= S.finCombo && S.combo < 2) S.combo++; else S.combo = 0;
    if (c >= RC.CHARGE.SEUIL_INTERRUPTION) S.combo = 0;
    const combo = S.combo;
    const duree = dureeGeste(prof, ess) * (combo === 2 ? 1.12 : 1);
    const j = o.j();
    tourner(viserAuto() ?? j.dir);
    depenser(coutCoup(prof, c, st) * (combo === 2 ? 1.3 : 1));
    const lourd = c >= RC.CHARGE.SEUIL_LOURD;
    S.geste = { type: lourd ? 'lourd' : 'rapide', t0: t, duree, dir: j.dir, charge: c, combo };
    o.sfx(lourd || combo === 2 ? 'puissance' : 'rate', { volume: 0.32 });
    const impact = Math.round(duree * RC.IMPACT * (lourd ? 1.25 : 1));
    S.finCombo = t + impact + RC.COMBO.FENETRE_MS;
    setTimeout(() => {
      if (S.mort) return;
      const jj = o.j(), dir = S.geste ? S.geste.dir : jj.dir;
      const crit = now() < S.critJusqu;
      if (crit) S.critJusqu = 0;
      const fx2 = o.effets && o.effets();
      if (fx2) fx2.trainee(jj.etage, jj.x, jj.y, dir, { R: 1.05 + (prof.allonge || 0) * 0.35, lourd: lourd || combo === 2, sens: combo % 2 === 1 ? -1 : 1, duree: lourd ? 200 : 150 });
      C.action({ type: 'frapper', charge: c, combo, crit, x: jj.x, y: jj.y, dir, ess, stats: S.stats });
    }, impact);
  }
  // ---------- Pousser ----------
  function pousser() {
    if (S.mort || o.pause()) return;
    if (S.empoigne) { marteler(); return; }
    const P = RC.POUSSEE, t = now();
    if (t < S.pousseePret) return;
    if (occupe(t) && S.geste && S.geste.type !== 'tir' && S.geste.type !== 'rapide') return;
    S.charge = null; S.combo = 0;
    tourner(viserAuto(1.8));
    depenser(P.STA * (1 + 0.5 * (stats().surpoids || 0)));
    S.pousseePret = t + P.COOLDOWN_MS;
    const j = o.j();
    S.geste = { type: 'poussee', t0: t, duree: P.GESTE_MS, dir: j.dir };
    setTimeout(() => { if (!S.mort) { const jj = o.j(); C.action({ type: 'pousser', x: jj.x, y: jj.y, dir: S.geste ? S.geste.dir : jj.dir, stats: S.stats }); } }, 90);
  }
  // ---------- Esquiver ----------
  function esquiver() {
    if (S.mort || o.pause()) return;
    if (S.empoigne) { marteler(); return; }
    const E = RC.ESQUIVE, t = now();
    if (t < S.esquivePret || S.ruee) return;
    if (sta() < E.STA) { o.message('Trop essoufflé pour esquiver.', 1200); o.sfx('rate', { volume: 0.4 }); return; }
    const j = o.j(), m = o.mouvement ? o.mouvement() : { mx: 0, my: 0 };
    let a = Math.hypot(m.mx, m.my) > 0.2 ? Math.atan2(m.my, m.mx) : j.dir + Math.PI;  // sans direction : on recule
    const v = E.CASES / (E.MS / 1000);
    S.ruee = { t0: t, duree: E.MS, vx: Math.cos(a) * v, vy: Math.sin(a) * v };
    S.charge = null; S.tampon = null; S.combo = 0;
    depenser(E.STA);
    S.esquivePret = t + E.MS + E.COOLDOWN_MS;
    S.geste = { type: 'esquive', t0: t, duree: E.MS, dir: j.dir };
    o.sfx('esquive', { volume: 0.5 });
    const fx2 = o.effets && o.effets(); if (fx2) fx2.poussiere(j.etage, j.x, j.y, 4);
    C.action({ type: 'esquiver', x: j.x, y: j.y, dir: j.dir });
  }
  function marteler() {
    const e = S.empoigne; if (!e) return;
    depenser(RC.EMPOIGNADE.STA_PAR_TAP);
    S.geste = { type: 'poussee', t0: now(), duree: 140, dir: o.j().dir };
    o.vib(15);
    C.action({ type: 'marteler', ess: sta() < RC.EMPOIGNADE.STA_PAR_TAP });
  }
  // ---------- Armes de tir : maintenir = viser, relâcher = tirer ----------
  function debutVisee() { if (S.charge || occupe()) return; S.charge = { t0: now(), visee: true }; tourner(viserAuto(9)); }
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
    tourner(viserAuto(9) ?? j.dir);
    S.geste = { type: 'tir', t0: now(), duree: Math.max(250, arme().vitesse || 300), dir: j.dir };
    o.sfx('tir');
    S.secousse = Math.max(S.secousse, 0.55);
    const crit = now() < S.critJusqu; if (crit) S.critJusqu = 0;
    C.action({ type: 'tirer', visee, crit, x: j.x, y: j.y, dir: j.dir, stats: S.stats });
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
    if (S.charge && o.tactile()) { const d = viserAuto(); if (d != null) tourner(d); }
    if (S.tampon && !occupe(t)) { const tp = S.tampon; S.tampon = null; if (t - tp.t < 600) coup(tp.tenu); }
    if (S.ruee && t > S.ruee.t0 + S.ruee.duree) S.ruee = null;
    for (let i = fx.length - 1; i >= 0; i--) { fx[i].age += dt; if (fx[i].age > fx[i].duree) fx.splice(i, 1); }
    S.secousse = Math.max(0, S.secousse - dt / 380);
    S.flash = Math.max(0, S.flash - dt / 550);
    S.hitstop = Math.max(0, S.hitstop - dt);
    // boutons tactiles
    const prof = profilMelee(stats().arme);
    const ess = essouffle(sta());
    let ch = 0;
    if (S.charge && !S.charge.visee) ch = Math.min(1, Math.max(0, (t - S.charge.t0 - RC.CHARGE.TAPE_MS) / Math.max(1, dureeChargePleine(prof, ess) - RC.CHARGE.TAPE_MS)));
    if (S.charge && S.charge.visee) ch = Math.min(1, (t - S.charge.t0) / RC.TIR.VISEE_MS);
    const j = o.j();
    let proche = false, auSol = false;
    for (const z of o.zombies()) {
      if (z.etage !== j.etage || !z._vu) continue;
      const d = Math.hypot(z.x - j.x, z.y - j.y);
      if (d < 3) proche = true;
      if (z.terre && d < RC.ACHEVER.PORTEE + 0.3) auSol = true;
    }
    o.entrees.setCombat({
      libelle: S.empoigne ? 'Dégage !' : estTir() ? (etatArmeTir().balles > 0 ? 'Tirer' : 'Vide') : auSol ? 'Achever' : 'Frapper',
      charge: ch, proche, empoigne: !!S.empoigne, combo: t <= S.finCombo ? S.combo : -1,
      pousseeCd: S.pousseePret > t ? (S.pousseePret - t) / RC.POUSSEE.COOLDOWN_MS : 0,
      esquiveCd: S.esquivePret > t ? (S.esquivePret - t) / (RC.ESQUIVE.MS + RC.ESQUIVE.COOLDOWN_MS) : 0,
    });
    o.entrees.setVisible && o.entrees.setVisible('recharger', estTir());
  }
  function vitesseMult() {
    const t = now();
    if (S.empoigne || S.mort) return 0;
    if (S.ruee) return 0;          // le déplacement est forcé par la ruée
    if (S.geste && t < S.geste.t0 + S.geste.duree && S.geste.type !== 'change' && S.geste.type !== 'recharge' && S.geste.type !== 'esquive') return RC.VITESSE_GESTE;
    if (S.charge) return RC.CHARGE.VITESSE;
    if (S.recharge) return 0.6;
    return 1;
  }
  // Déplacement forcé de l'esquive (cases/s), ou null.
  function ruee() {
    if (!S.ruee) return null;
    const p = (now() - S.ruee.t0) / S.ruee.duree;
    const k = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3 * 0.8;
    return { vx: S.ruee.vx * k, vy: S.ruee.vy * k };
  }
  // Facteur de temps pour l'image (micro-arrêt à l'impact).
  const echelleTemps = () => (S.hitstop > 0 ? 0.08 : 1);

  // ---------- Retours ----------
  const nombre = (x, y, txt, cls) => fx.push({ type: 'nombre', x, y, txt, cls, age: 0, duree: 900 });
  function gerbe(x, y, dir, force) {
    const fx2 = o.effets && o.effets(), E = o.etage && o.etage();
    if (fx2 && E) fx2.sang(E, o.j().etage, x, y, dir, force);
    else sang.push({ x, y, etage: o.j().etage, r: 0.25 + force * 0.15, a: Math.random() * 6.28, s: Math.random() });
  }
  function xp(skill, n) { try { o.player && o.player.gagnerXp ? o.player.gagnerXp(skill, n) : null; } catch (e) {} }
  function surEvt(e) {
    const X = RC.XP, HS = RC.HITSTOP_MS;
    switch (e.type) {
      case 'coup': {
        const j = o.j();
        const dir = e.dir ?? Math.atan2(e.y - j.y, e.x - j.x);
        const fort = e.lourd || e.crit || e.combo === 2 || e.achever;
        gerbe(e.x, e.y, dir, fort ? 1.2 : 0.6);
        if (e.joueur !== moi) { o.sfxA('coup', e.x, e.y, e.etage, 14); return; }
        // micro-arrêt : la sensation de choc
        S.hitstop = Math.max(S.hitstop, e.achever ? HS.achever : e.lourd ? HS.lourd : e.combo === 2 ? HS.combo : e.tue ? HS.tue : HS.rapide);
        nombre(e.x, e.y, (e.crit ? '!' : '') + e.degats, e.crit ? 'crit' : e.furtif ? 'furtif' : '');
        o.sfx(fort ? 'coup_critique' : 'coup');
        o.vib(fort ? 40 : 18);
        S.secousse = Math.max(S.secousse, fort ? 0.7 : 0.28);
        if (e.achever) nombre(e.x, e.y - 0.45, 'Coup de grâce', 'crit');
        else if (e.terre) nombre(e.x, e.y - 0.45, 'À terre', 'info');
        else if (e.interrompt) nombre(e.x, e.y - 0.45, 'Interrompu', 'info');
        else if (e.vacille) nombre(e.x, e.y - 0.45, 'Il vacille', 'info');
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
      case 'rate': if (e.joueur === moi) { nombre(e.x, e.y, 'Raté', 'rate'); o.sfx('rate', { volume: 0.5 }); } break;
      case 'coup_vide': if (e.joueur === moi) S.combo = 0; break;
      case 'mort_zombie': {
        gerbe(e.x, e.y, Math.random() * 6.28, 1.4);
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
        if (e.immobile && !e.n) o.message('Il ne bouge pas. Esquive, ou frappe fort.', 1600);
        if (e.n) { xp('force', X.poussee); S.secousse = Math.max(S.secousse, 0.2); }
      } break;
      case 'telegraphe': if (e.joueur === moi) {
        o.sfx(e.attaque === 'saisie' ? 'alerte' : 'zombie', { volume: 0.45 });
        if (!S.tuto && !pref('tutoCombat2Vu')) {
          S.tuto = true; try { setPref('tutoCombat2Vu', true); } catch (err) {}
          o.message(o.tactile()
            ? 'Il arme son coup (arc rouge) : ESQUIVE au dernier moment, ou frappe fort pour l\'interrompre. Arc ambre : il veut t\'agripper.'
            : 'Il arme son coup (arc rouge) : ESPACE pour esquiver au dernier moment, clic droit pour le repousser, ou maintiens le clic pour un coup qui l\'interrompt.', 7000);
        }
      } break;
      case 'esquive': if (e.joueur === moi) {
        if (e.parfaite) {
          S.critJusqu = now() + RC.ESQUIVE.CRIT_MS;
          nombre(o.j().x, o.j().y - 0.3, 'Esquive parfaite', 'crit');
          o.sfx('esquive'); o.vib(25);
          if (o.solo && o.ralentir) o.ralentir(0.3, RC.ESQUIVE.RALENTI_MS);
          xp('agilite', X.parfaite);
        } else xp('agilite', X.esquive);
      } break;
      case 'attaque': if (e.joueur === moi && e.issue === 'vide') o.sfx('rate', { volume: 0.3 }); break;
      case 'saisie': if (e.joueur === moi) {
        S.empoigne = { uid: e.uid, requis: e.requis, taps: 0, t0: now(), duree: e.duree, fin: now() + e.duree };
        S.charge = null; S.ruee = null;
        o.message(`${nomMort(e.typeMort, e.sexe)} t'agrippe ! Martèle Frapper (${e.requis} fois).`, 2200);
        o.sfx('alerte_contact'); o.vib([40, 30, 40]);
        S.secousse = Math.max(S.secousse, 0.55);
      } break;
      case 'martele': if (e.joueur === moi && S.empoigne) S.empoigne.taps = e.taps; break;
      case 'degage': if (e.joueur === moi) {
        if (S.empoigne && !e.lache) { o.message('Dégagé ! Il tombe : achève-le.', 1500); xp('force', X.empoignade); }
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
    S.charge = null; S.tampon = null; S.combo = 0;
    S.secousse = 1; S.flash = 1; S.hitstop = Math.max(S.hitstop, 60);
    const j = o.j();
    gerbe(j.x, j.y, e.dir ?? Math.random() * 6.28, e.degats > 10 ? 1 : 0.5);
    nombre(j.x, j.y - 0.2, '−' + e.degats, 'moi');
    o.sfx('degats'); o.vib([60, 40, 60]);
    o.message(`${NOM_PLAIE[e.blessure.type] || e.blessure.type} ${e.blessure.zone}, −${e.degats} PV.${e.dentsBloquees ? ' Les dents ne passent pas.' : ''}`, 2400);
    if ((p.pv ?? 1) <= 0 || p.mort) mourir();
  }
  function mourir() {
    if (S.mort) return;
    S.mort = true; S.charge = null; S.empoigne = null; S.ruee = null;
    C.majJoueur({ mort: true });
  }

  // ---------- Pour le rendu ----------
  function rendu() {
    const t = now();
    const g = S.geste && t < S.geste.t0 + S.geste.duree ? { type: S.geste.type, p: (t - S.geste.t0) / S.geste.duree, charge: S.geste.charge || 0, combo: S.geste.combo || 0 } : null;
    let ch = 0;
    if (S.charge && !S.charge.visee) { const prof = profilMelee(stats().arme); ch = Math.min(1, Math.max(0, (t - S.charge.t0 - RC.CHARGE.TAPE_MS) / Math.max(1, dureeChargePleine(prof, essouffle(sta())) - RC.CHARGE.TAPE_MS))); }
    const emp = S.empoigne ? { p: Math.min(1, (t - S.empoigne.t0) / S.empoigne.duree), taps: S.empoigne.taps, requis: S.empoigne.requis } : null;
    return { geste: g, charge: S.charge ? (S.charge.visee ? -1 : ch) : 0, vise: !!(S.charge && S.charge.visee), empoigne: emp, secousse: S.secousse, flash: S.flash, crit: t < S.critJusqu };
  }

  majStats();
  return {
    frapper, pousser, esquiver, recharger, echangerMains, dos, rapide, maj, vitesseMult, ruee, echelleTemps, surEvt, rendu, majStats, mourir,
    dirForcee: () => S.dirForcee, fx, sang, etat: S,
    occupe: () => occupe() || !!S.charge || !!S.empoigne,
    fermer() { S.mort = true; },
  };
}
