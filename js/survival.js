// ============ Survie : temps, faim, soif, blessures, maladie, froid, sommeil ============
// Les fonctions retournent des tableaux de messages [{t, c}] que l'appelant journalise.
import { G, rng, chance, pick, estNuit } from './state.js';
import { item } from './data/items.js';
import { cloth } from './data/clothing.js';
import { carteCourante } from './world.js';
import {
  hasItem, removeItem, addItem, hasOutil, chaleurTotale,
  recipientOuvert, desequiperVetement, consolider,
} from './inventory.js';

export const BLESSURES = {
  egratignure: { nom: 'Égratignure', saignement: 0.025, pSaigne: 0.3, pInfectHeure: 0.015, guerison: 720 },
  entaille:    { nom: 'Entaille',     saignement: 0.06,  pSaigne: 0.7, pInfectHeure: 0.035, guerison: 1700 },
  profonde:    { nom: 'Blessure profonde', saignement: 0.11, pSaigne: 1, pInfectHeure: 0.07, guerison: 3000, suture: true },
  plaie:       { nom: 'Plaie ouverte', saignement: 0.18, pSaigne: 1, pInfectHeure: 0.11, guerison: 4400, suture: true },
};
// Vocabulaire des zones (la silhouette de l'écran Corps les reconnaît toutes) :
// 'au visage', 'au cou', 'à l'épaule', 'au bras', 'à l'avant-bras', 'à la main',
// 'au torse', 'au flanc', 'dans le dos', 'à la cuisse', 'au genou', 'au mollet',
// 'à la cheville', 'au pied'.
const ZONES_CORPS = ['au bras', 'à l\'avant-bras', 'à la main', 'à l\'épaule', 'à la cuisse', 'au mollet', 'au flanc', 'dans le dos', 'au cou'];

// « l'égratignure », « l'entaille », « la blessure profonde », « la plaie ouverte »
export function nomBlessure(def, majuscule = false) {
  const n = def.nom.toLowerCase();
  const el = /^[aeéèêiouh]/.test(n) ? `l'${n}` : `la ${n}`;
  return majuscule ? el.charAt(0).toUpperCase() + el.slice(1) : el;
}

// zones : où la blessure tombe — une chaîne, ou un tableau dont on tire une entrée.
// Sans zones, on tire au hasard (chute, accident...) ; une attaque précise vise, elle.
export function ajouterBlessure(type, zones = null) {
  const def = BLESSURES[type];
  if (!def) return [];
  const zone = zones ? (Array.isArray(zones) ? pick(zones) : zones) : pick(ZONES_CORPS);
  const b = {
    type, zone,
    saigne: chance(def.pSaigne),
    infecte: false, bandee: false, desinfectee: false, suturee: false, age: 0,
  };
  G.player.blessures.push(b);
  const msgs = [{ t: `${def.nom} ${b.zone}.` + (b.saigne ? ' Ça saigne.' : ''), c: 'bad' }];
  return msgs;
}

export function mortJoueur(cause) {
  window.dispatchEvent(new CustomEvent('omd-mort', { detail: { cause } }));
}

// ---------- Avancée du temps ----------
// opts : { sommeil:false } — retourne { messages, mort }
export function advanceTime(minutes, opts = {}) {
  const msgs = [];
  let mort = null;
  const p = G.player;
  const pas = 10; // traitement par tranches de 10 minutes
  let restant = minutes;
  let saignementSignale = false, froidSignale = false;

  while (restant > 0 && !mort) {
    const dt = Math.min(pas, restant);
    restant -= dt;

    // Horloge
    G.world.minute += dt;
    G.world.statsTemps += dt;
    while (G.world.minute >= 60) {
      G.world.minute -= 60;
      G.world.heure++;
      if (G.world.heure >= 24) { G.world.heure = 0; G.world.jour++; msgs.push({ t: `Jour ${G.world.jour}. Tu as survécu un jour de plus.`, c: 'good' }); }
    }

    // Faim / soif
    p.faim = Math.max(0, p.faim - 0.055 * dt);
    p.soif = Math.max(0, p.soif - 0.085 * dt * (p.maladie === 'fievre' ? 1.6 : 1));

    // Endurance (récupération hors combat)
    if (opts.sommeil) {
      p.sta = Math.min(p.staMax, p.sta + 0.14 * dt);
      if (p.faim > 30 && p.soif > 20) p.pv = Math.min(p.pvMax, p.pv + 0.03 * dt);
    } else {
      const regen = (p.faim > 20 && p.soif > 20) ? 0.35 : 0.1;
      p.sta = Math.min(p.staMax, p.sta + regen * dt);
    }

    // Froid (dehors, l'hiver mord)
    const carteDef = carteCourante();
    if (carteDef && carteDef.exterieur && !opts.sommeil) {
      const besoin = estNuit() ? 5 : 3;
      const deficit = besoin - chaleurTotale();
      if (deficit > 0) {
        p.sta = Math.max(0, p.sta - 0.06 * deficit * dt);
        if (deficit >= 3) p.pv = Math.max(0, p.pv - 0.02 * deficit * dt);
        if (!froidSignale) { msgs.push({ t: 'Le froid te transperce. Il te faudrait des vêtements plus chauds.', c: 'warn' }); froidSignale = true; }
      }
    }

    // Blessures : saignement, infection, guérison
    for (let i = p.blessures.length - 1; i >= 0; i--) {
      const b = p.blessures[i];
      const def = BLESSURES[b.type];
      b.age += dt;
      if (b.saigne && !b.bandee) {
        p.pv = Math.max(0, p.pv - def.saignement * dt);
        if (!saignementSignale) { msgs.push({ t: 'Tu perds du sang. Il te faut un bandage, vite.', c: 'bad' }); saignementSignale = true; }
      }
      // Infection (par tranche de 10 min)
      if (!b.infecte && !b.desinfectee) {
        let pInf = def.pInfectHeure * (dt / 60);
        if (b.souillee) pInf *= 2.5; // blessure infligée par un putréfié
        if (b.bandee && b.bandeSale) pInf *= 1.5;
        else if (b.bandee) pInf *= 0.5;
        if (chance(pInf)) {
          b.infecte = true;
          msgs.push({ t: `${nomBlessure(def, true)} ${b.zone} a une vilaine couleur. Elle est infectée.`, c: 'bad' });
        }
      }
      if (b.infecte) {
        p.pv = Math.max(0, p.pv - 0.045 * dt);
        if (p.maladie !== 'fievre' && chance(0.04 * (dt / 10))) {
          p.maladie = 'fievre'; p.maladieDuree = 0;
          msgs.push({ t: 'Des frissons. Une chaleur moite. La fièvre s\'installe.', c: 'bad' });
        }
      }
      // Guérison naturelle
      const besoinSuture = def.suture && !b.suturee;
      if (!b.infecte && !besoinSuture && b.age >= def.guerison * (b.bandee ? 0.75 : 1)) {
        p.blessures.splice(i, 1);
        msgs.push({ t: `${nomBlessure(def, true)} ${b.zone} est guérie.`, c: 'good' });
      }
      // Une plaie profonde non suturée se rouvre
      if (besoinSuture && !b.saigne && !b.bandee && chance(0.02 * (dt / 10))) {
        b.saigne = true;
        msgs.push({ t: `${nomBlessure(def, true)} ${b.zone} se rouvre.`, c: 'bad' });
      }
    }

    // Maladies
    if (p.maladie === 'intoxication') {
      p.maladieDuree -= dt;
      p.pv = Math.max(0, p.pv - 0.025 * dt);
      p.soif = Math.max(0, p.soif - 0.05 * dt);
      if (p.maladieDuree <= 0) { p.maladie = null; msgs.push({ t: 'Ton estomac se calme enfin.', c: 'good' }); }
    } else if (p.maladie === 'fievre') {
      p.maladieDuree += dt;
      p.pv = Math.max(0, p.pv - 0.02 * dt);
      if (!p.blessures.some(b => b.infecte) && p.maladieDuree > 240) {
        p.maladie = null; p.maladieDuree = 0;
        msgs.push({ t: 'La fièvre retombe doucement.', c: 'good' });
      }
    }

    // Faim / soif critiques
    if (p.faim <= 0) p.pv = Math.max(0, p.pv - 0.05 * dt);
    if (p.soif <= 0) p.pv = Math.max(0, p.pv - 0.12 * dt);

    // Mort ?
    if (p.pv <= 0) {
      if (p.soif <= 0) mort = 'soif';
      else if (p.faim <= 0) mort = 'faim';
      else if (p.blessures.some(b => b.infecte)) mort = 'infection';
      else if (p.blessures.some(b => b.saigne && !b.bandee)) mort = 'hemorragie';
      else if (p.maladie) mort = 'maladie';
      else mort = 'hemorragie';
    }
  }
  if (mort) mortJoueur(mort);
  return { messages: msgs, mort };
}

// ---------- Manger / boire ----------
function peutOuvrirConserve() {
  return hasOutil('ouvrir') || hasItem('couteau_cuisine') || hasItem('couteau_artisanal') || hasItem('machette')
    || (G.player.equip.arme && ['couteau_cuisine', 'couteau_artisanal', 'machette'].includes(G.player.equip.arme.id));
}

export function consommer(index) {
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, messages: [] };
  const d = item(it.id);
  if (!d || (d.type !== 'nourriture' && d.type !== 'boisson')) return { ok: false, messages: [] };
  const msgs = [];
  if (d.besoinOuvre && !peutOuvrirConserve()) {
    return { ok: false, messages: [{ t: 'Impossible d\'ouvrir la boîte sans ouvre-boîte ni couteau.', c: 'warn' }] };
  }
  if (d.special === 'alcool') {
    // L'alcool se boit... ou désinfecte (via l'écran de soins)
    G.player.soif = Math.max(0, G.player.soif + (d.soif || 0));
    G.player.pv = Math.min(G.player.pvMax, G.player.pv + 2);
    msgs.push({ t: 'L\'alcool brûle la gorge et réchauffe le ventre. Le monde devient un peu plus flou, un peu plus supportable.', c: '' });
  } else {
    if (d.faim) G.player.faim = Math.min(100, Math.max(0, G.player.faim + d.faim));
    if (d.soif) G.player.soif = Math.min(100, Math.max(0, G.player.soif + d.soif));
    msgs.push({ t: d.type === 'boisson' ? `Tu bois (${d.nom.toLowerCase()}).` : `Tu manges (${d.nom.toLowerCase()}).`, c: '' });
  }
  if (d.risque && chance(d.risque.p)) {
    G.player.maladie = 'intoxication';
    G.player.maladieDuree = rng(180, 420);
    msgs.push({ t: 'Quelques minutes plus tard, ton estomac se tord. C\'était une mauvaise idée.', c: 'bad' });
  }
  it.qty -= 1;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  if (d.rend) {
    // boire rend le contenant : bouteille vide, canette vide... (toutes féminines)
    const rd = item(d.rend);
    if (addItem(d.rend, 1)) msgs.push({ t: `Tu gardes la ${rd ? rd.nom.toLowerCase() : 'bouteille vide'}.`, c: '' });
  }
  return { ok: true, messages: msgs, type: d.type };
}

// ---------- Eau en contenant ----------
// ref : une instance d'inventaire OU l'objet tenu en main (G.player.equip.arme),
// les deux portent eau:{q,L}. Boire prélève ~0,5 L et recharge la soif comme
// l'eau croupie / l'eau bouillie en bouteille — mêmes risques pour la croupie.
export const DOSE_EAU = 0.5; // litres par gorgée longue

export function boireContenant(ref) {
  if (!ref || !ref.eau || ref.eau.L <= 0) return { ok: false, messages: [] };
  const d = item(ref.id);
  const dose = Math.min(DOSE_EAU, ref.eau.L);
  const croupie = ref.eau.q !== 'bouillie';
  const gain = (croupie ? 30 : 40) * (dose / DOSE_EAU);
  G.player.soif = Math.min(100, Math.max(0, G.player.soif + gain));
  const msgs = [{ t: `Tu bois une longue gorgée d'eau ${croupie ? 'croupie' : 'bouillie'}${d ? ` (${d.nom.toLowerCase()})` : ''}.`, c: '' }];
  if (croupie && chance(0.5 * (dose / DOSE_EAU))) {
    G.player.maladie = 'intoxication';
    G.player.maladieDuree = rng(180, 420);
    msgs.push({ t: 'Quelques minutes plus tard, ton estomac se tord. C\'était une mauvaise idée.', c: 'bad' });
  }
  ref.eau.L = Math.round((ref.eau.L - dose) * 100) / 100;
  if (ref.eau.L <= 0.01) {
    delete ref.eau;
    consolider();
    msgs.push({ t: `${d ? d.nom : 'Le contenant'} : à sec.`, c: '' });
  }
  return { ok: true, messages: msgs };
}

// Faire bouillir l'eau croupie SUR PLACE, dans son contenant. Il faut du feu, et :
//  — un récipient ouvert (canette, casserole) va directement sur la flamme ;
//  — un contenant fermé (gourde, thermos, bidon) se fait bouillir par passages
//    dans une casserole (ou un réchaud) avant d'y retourner.
export function peutBouillirContenant(ref) {
  if (!ref || !ref.eau || ref.eau.q === 'bouillie') return false;
  if (!hasOutil('feu')) return false;
  if (recipientOuvert(ref.id)) return true;
  return hasItem('casserole') || hasItem('rechaud_camping')
    || (G.player.equip.arme && G.player.equip.arme.id === 'casserole');
}
// ~20 min par litre (chauffe + ébullition prolongée), au moins 10 min, plafonné à 2 h.
export function tempsBouillir(ref) {
  return Math.min(120, Math.max(10, Math.round((ref && ref.eau ? ref.eau.L : 0) * 20)));
}
export function bouillirContenant(ref) {
  if (!peutBouillirContenant(ref)) {
    return { ok: false, messages: [{ t: 'Il te faut du feu — et de quoi faire bouillir (récipient en métal ou casserole).', c: 'warn' }] };
  }
  const d = item(ref.id);
  const r = advanceTime(tempsBouillir(ref));
  const msgs = [...r.messages];
  if (!r.mort) {
    ref.eau.q = 'bouillie';
    msgs.push({ t: `${d ? d.nom : 'Le contenant'} : l'eau a bouilli longuement. Ce qui grouillait dedans ne grouille plus.`, c: 'good' });
  }
  return { ok: !r.mort, messages: msgs, mort: r.mort };
}

// ---------- Déchirer un vêtement en chiffons ----------
// Les vêtements en tissu (champ tissu: 1|2|3 dans clothing.js) se déchirent en
// chiffons. 5 minutes de travail, le vêtement est détruit. Liberté totale :
// le joueur peut déchirer ce qu'il porte — il assume le froid qui suit.
export function dechirerVetement(index) {
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, messages: [] };
  const c = cloth(it.id);
  if (!c || !c.tissu) return { ok: false, messages: [{ t: 'Ça ne se déchire pas en chiffons utilisables.', c: 'warn' }] };
  it.qty -= 1;
  if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  addItem('chiffon', c.tissu); // espace 0 : entre toujours
  const r = advanceTime(5);
  const msgs = [
    { t: `Tu tailles des bandes régulières dans le tissu (${c.nom.toLowerCase()}) : ${c.tissu} chiffon${c.tissu > 1 ? 's' : ''}.`, c: 'good' },
    ...r.messages,
  ];
  return { ok: true, messages: msgs, mort: r.mort };
}
// Déchirer un vêtement PORTÉ : on le retire d'abord (mêmes garde-fous que
// « Retirer » — espace, ceinture pleine), puis on le déchire depuis le sac.
export function dechirerEquipe(slot) {
  const id = G.player.equip[slot];
  if (!id) return { ok: false, messages: [] };
  if (!desequiperVetement(slot)) {
    return { ok: false, messages: [{ t: 'Impossible : ce vêtement porte ton inventaire ou ta ceinture est pleine.', c: 'warn' }] };
  }
  const index = G.player.inventaire.findIndex(i => i.id === id);
  if (index < 0) return { ok: false, messages: [] }; // ne devrait pas arriver
  return dechirerVetement(index);
}

// ---------- Soins ----------
export function soigner(index) {
  const it = G.player.inventaire[index];
  if (!it) return { ok: false, messages: [] };
  const d = item(it.id);
  if (!d || d.type !== 'soin') return { ok: false, messages: [] };
  const p = G.player;
  const msgs = [];
  let utilise = false;

  const pire = (filtre) => {
    const ordre = ['plaie', 'profonde', 'entaille', 'egratignure'];
    for (const t of ordre) {
      const b = p.blessures.find(x => x.type === t && filtre(x));
      if (b) return b;
    }
    return null;
  };

  switch (d.soin) {
    case 'bandage': {
      const b = pire(x => !x.bandee);
      if (!b) return { ok: false, messages: [{ t: 'Aucune blessure à bander.', c: 'warn' }] };
      b.bandee = true;
      if (d.qualite < 1 && !b.desinfectee) b.bandeSale = true;
      msgs.push({ t: `Tu bandes ${nomBlessure(BLESSURES[b.type])} ${b.zone}. Le saignement s\'arrête.`, c: 'good' });
      utilise = true;
      break;
    }
    case 'desinfectant': {
      const b = pire(x => !x.desinfectee && !x.infecte);
      if (!b) return { ok: false, messages: [{ t: 'Rien à désinfecter (ou c\'est déjà infecté : il faut des antibiotiques).', c: 'warn' }] };
      b.desinfectee = true; b.bandeSale = false;
      msgs.push({ t: `Le désinfectant mord la chair à vif. Tu serres les dents. ${nomBlessure(BLESSURES[b.type], true)} ${b.zone} est propre.`, c: 'good' });
      utilise = true;
      break;
    }
    case 'antibio': {
      const infectees = p.blessures.filter(x => x.infecte);
      if (!infectees.length && p.maladie !== 'fievre') return { ok: false, messages: [{ t: 'Pas d\'infection à traiter. Garde-les pour quand ça comptera.', c: 'warn' }] };
      infectees.forEach(b => { b.infecte = false; b.desinfectee = true; });
      if (p.maladie === 'fievre') { p.maladie = null; p.maladieDuree = 0; }
      msgs.push({ t: 'Tu avales les antibiotiques. Dans quelques heures, l\'infection devrait reculer.', c: 'good' });
      utilise = true;
      break;
    }
    case 'suture': {
      const b = pire(x => (x.type === 'profonde' || x.type === 'plaie') && !x.suturee);
      if (!b) return { ok: false, messages: [{ t: 'Aucune plaie à recoudre.', c: 'warn' }] };
      b.suturee = true; b.saigne = false;
      p.pv = Math.max(1, p.pv - 4);
      msgs.push({ t: `Point par point, en tremblant, tu recouds ${nomBlessure(BLESSURES[b.type])} ${b.zone}. Tu as failli tourner de l\'œil. Deux fois.`, c: 'good' });
      utilise = true;
      break;
    }
    case 'antidouleur': {
      p.pv = Math.min(p.pvMax, p.pv + 8);
      msgs.push({ t: 'La douleur s\'éloigne derrière une vitre cotonneuse.', c: 'good' });
      utilise = true;
      break;
    }
    case 'vitamines': {
      p.pv = Math.min(p.pvMax, p.pv + 4);
      p.sta = Math.min(p.staMax, p.sta + 10);
      msgs.push({ t: 'Un petit coup de fouet. Mieux que rien.', c: 'good' });
      utilise = true;
      break;
    }
  }
  if (utilise) {
    it.qty -= 1;
    if (it.qty <= 0) G.player.inventaire.splice(index, 1);
  }
  return { ok: utilise, messages: msgs };
}

// ---------- Soin CIBLÉ : appliqué à une blessure précise (écran Personnage) ----------
// action : 'bander' | 'desinfecter' | 'suturer' | 'antibio' — itemId : l'objet consommé.
export function appliquerSoinCible(idx, action, itemId) {
  const p = G.player;
  const b = p.blessures[idx];
  const ko = (t) => ({ ok: false, messages: [{ t, c: 'warn' }] });
  if (!b) return ko('Cette blessure n\'existe plus.');
  if (!hasItem(itemId)) return ko('Tu n\'as plus cet objet.');
  const def = BLESSURES[b.type];
  const msgs = [];

  switch (action) {
    case 'bander': {
      if (b.bandee) return ko('Déjà bandée.');
      removeItem(itemId, 1);
      b.bandee = true;
      if (itemId === 'bandage_fortune' && !b.desinfectee) b.bandeSale = true;
      msgs.push({ t: `Tu bandes ${nomBlessure(def)} ${b.zone}${itemId === 'bandage_fortune' ? ' avec des chiffons noués' : ''}. Le saignement s'arrête.`, c: 'good' });
      break;
    }
    case 'desinfecter': {
      if (b.infecte) return ko('Trop tard pour désinfecter : il faut des antibiotiques.');
      if (b.desinfectee) return ko('Déjà désinfectée.');
      removeItem(itemId, 1);
      if (itemId === 'alcool_fort') {
        b.desinfectee = chance(0.75);
        b.bandeSale = false;
        msgs.push({ t: b.desinfectee
          ? `Tu verses l'alcool sur ${nomBlessure(def)} ${b.zone} en hurlant dans ta manche. C'est propre.`
          : `Tu verses l'alcool en hurlant dans ta manche... mais ${nomBlessure(def)} ${b.zone} reste douteuse.`, c: b.desinfectee ? 'good' : 'warn' });
      } else {
        b.desinfectee = true;
        b.bandeSale = false;
        msgs.push({ t: `Le désinfectant mord la chair à vif. ${nomBlessure(def, true)} ${b.zone} est propre.`, c: 'good' });
      }
      break;
    }
    case 'suturer': {
      if (!def.suture) return ko('Pas besoin de points pour ça.');
      if (b.suturee) return ko('Déjà suturée.');
      removeItem(itemId, 1);
      b.suturee = true;
      b.saigne = false;
      p.pv = Math.max(1, p.pv - 4);
      msgs.push({ t: `Point par point, en tremblant, tu recouds ${nomBlessure(def)} ${b.zone}. Tu as failli tourner de l'œil. Deux fois.`, c: 'good' });
      break;
    }
    case 'antibio': {
      if (!b.infecte) return ko('Cette blessure n\'est pas infectée.');
      removeItem(itemId, 1);
      // les antibiotiques agissent sur tout le corps
      p.blessures.forEach(x => { if (x.infecte) { x.infecte = false; x.desinfectee = true; } });
      if (p.maladie === 'fievre') { p.maladie = null; p.maladieDuree = 0; }
      msgs.push({ t: 'Tu avales les antibiotiques. Dans quelques heures, l\'infection devrait reculer — partout.', c: 'good' });
      break;
    }
    default: return ko('Soin inconnu.');
  }
  return { ok: true, messages: msgs };
}

// Désinfecter avec de l'alcool fort (qualité moindre)
export function desinfecterAlcool() {
  const p = G.player;
  if (!hasItem('alcool_fort')) return { ok: false, messages: [] };
  const b = p.blessures.find(x => !x.desinfectee && !x.infecte);
  if (!b) return { ok: false, messages: [{ t: 'Rien à désinfecter.', c: 'warn' }] };
  removeItem('alcool_fort', 1);
  b.desinfectee = chance(0.75);
  b.bandeSale = false;
  return {
    ok: true,
    messages: [{ t: b.desinfectee
      ? `Tu verses l\'alcool sur la plaie en hurlant dans ta manche. C\'est propre.`
      : `Tu verses l\'alcool en hurlant dans ta manche... mais la plaie reste douteuse.`, c: b.desinfectee ? 'good' : 'warn' }],
  };
}

// ---------- Sommeil ----------
// Retourne { messages, attaque } — l'appelant déclenche le combat si attaque.
// piege : un piège sonore divise le risque d'attaque et supprime l'effet de surprise.
export function dormir(heures, securise, piege = false) {
  const msgs = [{ t: securise ? 'Tu fermes les yeux dans un endroit sûr.' : 'Tu t\'endors d\'un œil, l\'oreille tendue vers chaque bruit.', c: '' }];
  let attaque = false;
  const p = G.player;
  let dormies = 0; // heures réellement dormies (le réveil en sursaut écourte la nuit)
  for (let h = 0; h < heures; h++) {
    const r = advanceTime(60, { sommeil: true });
    msgs.push(...r.messages);
    if (r.mort) return { messages: msgs, attaque: false };
    dormies++;
    if (!securise && chance(piege ? 0.04 : 0.09)) { attaque = true; break; }
  }
  p.sta = Math.min(p.staMax, p.sta + dormies * 4);
  if (attaque) {
    msgs.push({ t: 'Un bruit de verre brisé te réveille en sursaut. Quelque chose est entré.', c: 'bad' });
  } else {
    msgs.push({ t: 'Tu te réveilles. Encore en vie. Encore un jour à arracher.', c: 'good' });
  }
  return { messages: msgs, attaque };
}

export function froidActuel() {
  const carteDef = carteCourante();
  if (!carteDef || !carteDef.exterieur) return 0;
  const besoin = estNuit() ? 5 : 3;
  return Math.max(0, besoin - chaleurTotale());
}
