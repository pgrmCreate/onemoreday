// ============ Événements aléatoires ============
// SCHÉMA D'UN ÉVÉNEMENT :
// {
//   id: 'ev_unique',
//   types: ['rue'|'interieur'|'parc'],  // types de lieux où il peut survenir
//   lieux: ['gare'],                    // (optionnel) restreint à ces lieux précis
//   once: true,                         // (optionnel) ne survient qu'une fois par partie
//   nuit: true|false,                   // (optionnel) seulement la nuit / seulement le jour
//   p: 1,                               // poids relatif de tirage (défaut 1)
//   condition: { flag:'x' } | { flagAbsent:'x' } | { item:'id' },  // (optionnel)
//   texte: 'Narration de l\'événement…',
//   choix: [
//     {
//       label: 'Intitulé du bouton',
//       besoin: { skill:{agilite:2}, item:'corde' },   // (optionnel) option grisée si non rempli
//       test: { skill:'agilite', base:0.35, parNiveau:0.15 }, // (optionnel) jet de compétence
//       reussite: { texte:'…', effets:{} },            // si test
//       echec:    { texte:'…', effets:{} },            // si test
//       texte: '…', effets: {},                         // si pas de test
//     },
//   ],
// }
// EFFETS POSSIBLES : { pv:-10, sta:-15, faim:+20, soif:-10, items:[{id,qty}],
//   retire:[{id,qty}], blessure:{ type:'egratignure'|'entaille'|'profonde'|'plaie', zones:['au pied', …] },
//   combat:'errant'|['errant','coureur'], tempsMin:30, xp:{agilite:10},
//   flag:'nom_du_flag', maladie:'intoxication' }

import { EVENTS_RUE } from './events_rue.js';
import { EVENTS_INTERIEUR } from './events_interieur.js';
import { EVENTS_PARC } from './events_parc.js';

const EVENTS_BASE = [
  {
    id: 'ev_survivant_mefiant',
    types: ['rue'], once: true,
    texte: 'Une voix sèche claque derrière toi : « Bouge pas. » Un homme émacié te tient en joue avec un fusil de chasse qui tremble un peu trop. « Le sac. Doucement. » Ses yeux sont rouges, épuisés. Il a l\'air aussi terrifié que toi.',
    choix: [
      {
        label: 'Lever les mains et négocier',
        test: { skill: 'dexterite', base: 0.5, parNiveau: 0.05 },
        reussite: { texte: '« J\'ai presque rien, regarde. On est du même côté. » Un long silence. Il baisse son arme, recule sans te quitter des yeux, et disparaît entre les voitures. Tu respires à nouveau.', effets: { xp: { dexterite: 5 } } },
        echec: { texte: 'Il s\'approche, fébrile, et arrache ce qu\'il peut de tes poches avant de détaler. « Me suis pas ! »', effets: { volNourriture: true } },
      },
      {
        label: 'Tenter de le désarmer',
        besoin: { skill: { mainsNues: 1 } },
        test: { skill: 'mainsNues', base: 0.3, parNiveau: 0.18 },
        reussite: { texte: 'Tu dévies le canon d\'une claque et lui arraches le fusil des mains. Il s\'enfuit en sanglotant. Le fusil est vide — il bluffait. Mais maintenant, il est à toi.', effets: { items: [{ id: 'fusil_chasse', qty: 1 }], xp: { mainsNues: 20 } } },
        echec: { texte: 'Le coup part. La gerbe de plomb te laboure l\'épaule dans un éclair blanc de douleur. L\'homme s\'enfuit, horrifié par son propre geste.', effets: { pv: -22, blessure: { type: 'profonde', zones: ['à l\'épaule'] }, xp: { mainsNues: 8 } } },
      },
      {
        label: 'Plonger derrière une voiture et fuir',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.15 },
        reussite: { texte: 'Tu plonges au moment où il hésite. Le temps qu\'il contourne la carcasse, tu es déjà loin.', effets: { sta: -20, xp: { agilite: 10 } } },
        echec: { texte: 'Tu trébuches sur un pare-chocs et t\'étales dans le verre brisé. L\'homme fouille ton sac pendant que tu reprends tes esprits.', effets: { pv: -8, blessure: { type: 'egratignure', zones: ['à la main', 'à l\'avant-bras', 'au genou'] }, volNourriture: true, sta: -15 } },
      },
    ],
  },
  {
    id: 'ev_cadavre_frais',
    types: ['rue'],
    texte: 'Un corps est affalé contre un abribus. Récent — le sang n\'a pas fini de sécher. Un sac à dos est encore sanglé sur ses épaules. Sa tête pend sur sa poitrine, et tu n\'arrives pas à voir si la nuque est intacte.',
    choix: [
      {
        label: 'Fouiller le corps rapidement',
        test: { skill: 'agilite', base: 0.55, parNiveau: 0.1 },
        reussite: { texte: 'Tu coupes les sangles sans le toucher. Au moment où tu recules, ses doigts frémissent. Tu étais à deux secondes de te faire mordre.', effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'bandage', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], xp: { agilite: 6 }, tempsMin: 10 } },
        echec: { texte: 'Sa main se referme sur ton poignet comme un étau. Sa tête se redresse — la moitié du visage manque. Il ouvre ce qui lui reste de bouche.', effets: { combat: 'coureur', tempsMin: 5 } },
      },
      {
        label: 'Lui écraser la tête d\'abord, fouiller ensuite',
        texte: 'Tu fais ce qu\'il faut faire, sans le regarder. Le bruit est pire que l\'image. Dans le sac : de quoi tenir un jour de plus. C\'est tout ce qui compte.',
        effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'bandage', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], tempsMin: 15, sta: -10, bruit: true },
      },
      { label: 'Passer son chemin', texte: 'Pas la peine de tenter le diable. Tu changes de trottoir sans le quitter des yeux.', effets: {} },
    ],
  },
  {
    id: 'ev_meute_passe',
    types: ['rue'],
    texte: 'Un raclement de semelles, multiplié. Au bout de la rue, ils débouchent en groupe — six, peut-être huit, agglutinés autour de quelque chose qu\'ils traînent et qui laisse une longue trace sombre. Ils viennent dans ta direction.',
    choix: [
      {
        label: 'Se plaquer dans un renfoncement',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.12 },
        reussite: { texte: 'Tu retiens ton souffle pendant qu\'ils passent à quelques mètres. L\'odeur est abominable. L\'un d\'eux s\'arrête, hume l\'air... puis repart. Tu attends qu\'ils tournent au coin pour relâcher tes poumons.', effets: { tempsMin: 20, sta: -10, xp: { agilite: 8 } } },
        echec: { texte: 'Ton pied heurte une bouteille qui roule sur le bitume. Huit têtes pivotent d\'un coup. Les deux plus rapides se détachent du groupe en grognant.', effets: { combat: ['coureur', 'errant'], tempsMin: 10 } },
      },
      {
        label: 'Reculer lentement et faire un détour',
        texte: 'Tu rebrousses chemin pas à pas, sans bruit. Le détour te coûte du temps et de la sueur, mais tu gardes ton sang.',
        effets: { tempsMin: 35, sta: -15 },
      },
    ],
  },
  {
    id: 'ev_plancher',
    types: ['interieur'],
    texte: 'Le plancher gémit sous ton poids — puis cède d\'un coup dans un craquement sec. Le vide t\'aspire la jambe.',
    choix: [
      {
        label: 'Se rattraper !',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.15 },
        reussite: { texte: 'Tu te jettes sur le côté au moment où la lame de parquet s\'effondre. Plus de peur que de mal.', effets: { sta: -8, xp: { agilite: 6 } } },
        echec: { texte: 'Ta jambe passe à travers jusqu\'à la cuisse. Une écharde longue comme un doigt te laboure le mollet quand tu te dégages.', effets: { pv: -12, blessure: { type: 'entaille', zones: ['au mollet', 'à la cuisse'] }, tempsMin: 10 } },
      },
    ],
  },
  {
    id: 'ev_pendu',
    types: ['interieur'], once: true,
    texte: 'Dans la pièce du fond, un homme pend à une poutre, une chaise renversée sous lui. Trois semaines, à en juger par l\'état. Sur la table, une lettre lestée d\'une boîte de conserve : « Je ne veux pas devenir ça. Prenez tout. Pardon. Lucien. »',
    choix: [
      {
        label: 'Prendre ses affaires en silence',
        texte: 'Tu murmures un merci absurde à Lucien et tu fais ton marché. Il ne t\'en voudra pas. C\'était écrit.',
        effets: { items: [{ id: 'conserve_raviolis', qty: 2 }, { id: 'alcool_fort', qty: 1 }, { id: 'briquet', qty: 1 }], tempsMin: 10 },
      },
      {
        label: 'Le décrocher et le couvrir d\'abord',
        texte: 'Ça ne sert à rien et ça te coûte une demi-heure, mais quelqu\'un devait le faire. Tu le couvres d\'un drap. En déplaçant la chaise, tu trouves une trappe avec une réserve qu\'il n\'avait pas mentionnée.',
        effets: { items: [{ id: 'conserve_raviolis', qty: 2 }, { id: 'alcool_fort', qty: 1 }, { id: 'briquet', qty: 1 }, { id: 'bouteille_eau', qty: 2 }, { id: 'cartouches', qty: 4 }], tempsMin: 30, sta: -10 },
      },
    ],
  },
  {
    id: 'ev_piege_boites',
    types: ['interieur'],
    texte: 'Un fil de pêche barre le couloir à hauteur de cheville, relié à une guirlande de boîtes de conserve vides. Un système d\'alarme artisanal. Quelqu\'un a vécu ici — ou y vit encore.',
    choix: [
      {
        label: 'Enjamber le fil avec précaution',
        test: { skill: 'dexterite', base: 0.55, parNiveau: 0.12 },
        reussite: { texte: 'Tu passes au-dessus sans le frôler. Au passage, tu récupères le fil : toujours utile.', effets: { items: [{ id: 'fil_de_fer', qty: 1 }], xp: { dexterite: 6 } } },
        echec: { texte: 'Ton talon accroche le fil. Le vacarme des boîtes explose dans le silence comme un carillon de fin du monde. Quelque chose répond, plus loin dans le bâtiment.', effets: { combat: 'errant', tempsMin: 5 } },
      },
      { label: 'Faire demi-tour', texte: 'Un piège veut dire un territoire. Tu n\'as pas envie de rencontrer le propriétaire.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_lapin',
    types: ['parc'],
    texte: 'Un lapin déboule de l\'herbe haute et se fige à quelques mètres, frémissant. De la viande fraîche sur pattes.',
    choix: [
      {
        label: 'Tenter de l\'attraper',
        test: { skill: 'chasse', base: 0.3, parNiveau: 0.18 },
        reussite: { texte: 'Un plongeon, un cri bref, et c\'est fini. Tes mains tremblent encore, mais ce soir, tu manges de la viande.', effets: { items: [{ id: 'viande_crue', qty: 1 }], xp: { chasse: 12 }, sta: -12 } },
        echec: { texte: 'Tu plonges dans l\'herbe et te relèves les mains vides, le souffle court. Le lapin a déjà traversé la moitié du parc.', effets: { sta: -15, xp: { chasse: 4 } } },
      },
      { label: 'Le laisser filer', texte: 'Pas le temps de courir après un déjeuner sur pattes.', effets: {} },
    ],
  },
  {
    id: 'ev_pluie',
    types: ['rue', 'parc'],
    texte: 'Le ciel se déchire d\'un coup. Une pluie drue, glacée, qui rebondit sur les carcasses et transforme la rue en miroir gris. Les silhouettes au loin lèvent la tête vers le ciel, désorientées par le vacarme.',
    choix: [
      {
        label: 'Recueillir l\'eau de pluie',
        besoin: { item: 'bouteille_vide' },
        texte: 'Tu cales ta bouteille sous une gouttière. En quelques minutes, elle déborde d\'eau claire et froide. Un cadeau du ciel, littéralement.',
        effets: { retire: [{ id: 'bouteille_vide', qty: 1 }], items: [{ id: 'bouteille_eau', qty: 1 }], tempsMin: 15 },
      },
      {
        label: 'En profiter pour avancer sans bruit',
        texte: 'La pluie couvre tes pas et brouille leur ouïe. Tu traverses la zone trempé jusqu\'aux os, mais invisible.',
        effets: { flag: 'discretion_pluie', tempsMin: 10 },
      },
      { label: 'S\'abriter en attendant', texte: 'Tu te recroquevilles sous un porche, à regarder la pluie laver le sang des trottoirs.', effets: { tempsMin: 40 } },
    ],
  },
  {
    id: 'ev_chien_errant',
    types: ['rue', 'parc'], once: true,
    texte: 'Un grondement sourd. Un chien squelettique sort de sous une voiture, le poil collé de sang séché. Impossible de dire au premier regard s\'il est infecté ou juste affamé. Ses babines se retroussent.',
    choix: [
      {
        label: 'Lui jeter de la viande',
        besoin: { item: 'viande_crue' },
        texte: 'Le chien happe la viande au vol et recule sans te lâcher du regard. Il n\'était qu\'affamé. Comme tout le monde. Il disparaît entre les voitures — tu croiseras peut-être ce regard à nouveau.',
        effets: { retire: [{ id: 'viande_crue', qty: 1 }], flag: 'chien_nourri' },
      },
      {
        label: 'Reculer lentement',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.1 },
        reussite: { texte: 'Tu recules sans gestes brusques jusqu\'à mettre une carcasse entre vous. Le chien renonce.', effets: { sta: -8 } },
        echec: { texte: 'Le chien bondit. De près, tu vois ses yeux laiteux et son museau fendu. Il est bien infecté.', effets: { combat: 'chien_infecte' } },
      },
    ],
  },
];

export const EVENTS = [...EVENTS_BASE, ...EVENTS_RUE, ...EVENTS_INTERIEUR, ...EVENTS_PARC];

// ---------- Événements créés par l'utilisateur (éditeur de cartes) ----------
// Stockés dans la surcouche locale 'omd_events_v1' (jamais dans ce fichier). Fusionnés ici
// pour être disponibles au placement MANUEL (cd.evEd) — dans l'éditeur comme en mode test.
// Marqués `user:true` afin de NE PAS être tirés par le placement AUTOMATIQUE des vraies cartes.
export function chargerEvenementsUtilisateur() {
  let n = 0;
  try {
    const u = JSON.parse(localStorage.getItem('omd_events_v1') || '[]');
    const connus = new Set(EVENTS.map(e => e.id));
    for (const ev of Array.isArray(u) ? u : []) {
      if (!ev || !ev.id || !Array.isArray(ev.choix) || !ev.choix.length || connus.has(ev.id)) continue;
      ev.user = true;
      EVENTS.push(ev); connus.add(ev.id); n++;
    }
  } catch (e) { /* pas de localStorage (validation Node) : on ignore */ }
  return n;
}
if (typeof localStorage !== 'undefined') chargerEvenementsUtilisateur();
