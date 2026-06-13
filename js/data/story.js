// ============ Scènes scriptées (prologue, locomotive, fin) ============
// SCHÉMA D'UNE SCÈNE :
// {
//   illu: 'train', musique: 'calme'|'sombre'|'train'|'combat'|null,
//   texte: 'Narration…',
//   timerMs: 8000,                                  // (optionnel) choix chronométré
//   timeout: { suivant:'id', texte:'…', effets:{} },// si le timer expire
//   choix: [{ label, besoin?, test?, effets?, suivant:'id'|'#retour'|'#mort'|'#arrivee',
//             reussite:{texte,effets,suivant}, echec:{texte,effets,suivant} }],
//   auto: { label:'Continuer', suivant:'id' },      // simple bouton "continuer"
// }
// Cibles spéciales : '#retour' (retour au jeu), '#mort', '#arrivee' (fin du chapitre).

import { TRAIN_SCENES } from './story_train.js';
import { CH2_SCENES } from './story_ch2.js';

const BASE_SCENES = {

  // ---------- PROLOGUE 1/3 : LA VIE D'AVANT ----------
  // Ces panneaux sont joués par la grande introduction de main.js (jouerIntro),
  // qui intercale les cinématiques intro_avant et intro_chaos. Leurs cibles
  // restent de vraies scènes : le moteur normal sait aussi les enchaîner.
  intro_av1: {
    illu: 'cuisine_radio', musique: 'calme',
    texte: 'Un mois plus tôt.\n\nUn mardi soir ordinaire. La casserole refroidit sur la cuisinière, la radio parle toute seule : un « incident sanitaire » aux urgences de Salon, des « mouvements de foule » à Marseille. Le présentateur enchaîne sur la météo — mistral demain, gel en fin de semaine.\n\nTu éteins la radio. Par la fenêtre, la ville ronronne : les terrasses de la place Crousillat, les phares sur le cours Carnot, l\'horloge qui sonne la demie.\n\nTu te souviens d\'avoir pensé : ça ne nous concerne pas.',
    auto: { label: 'Continuer', suivant: 'intro_av2' },
    choix: [{ label: 'Passer l\'introduction', sous: 'aller directement au réveil', suivant: 'intro_1' }],
  },
  intro_av2: {
    illu: 'cuisine_radio', musique: 'calme',
    texte: 'Les jours suivants, le bruit monte. Des sirènes la nuit, de plus en plus, de moins en moins loin. Les hélicoptères de la base aérienne rasent les toits. À la radio, plus de météo : des consignes. Restez chez vous. Fermez vos portes. N\'approchez pas des personnes désorientées.\n\nMardi soir, les voisins du dessous chargent leur break en silence. La petite serre un lapin en peluche contre sa bouche. Personne ne te propose de monter.\n\nTu restes. On reste toujours : c\'est chez toi, ça va passer.\n\nLe lendemain, c\'était mercredi. Jour de grand marché.',
    auto: { label: 'Continuer', suivant: '#intro_chaos' },
  },

  // ---------- PROLOGUE 2/3 : LA FUITE ----------
  intro_fu1: {
    illu: 'exode', musique: 'sombre',
    texte: 'Ça s\'est déchiré en une matinée. Les cris ont traversé la foule du marché comme une vague, et la ville a essayé de partir d\'un seul bloc — les cours bouchés en vingt minutes, les klaxons, puis plus de klaxons.\n\nTu es parti à pied, le sac d\'une autre vie sur l\'épaule : des papiers, un chargeur de téléphone, rien d\'utile. Tu as longé les voitures abandonnées, les étals renversés, les fruits écrasés sous les semelles.\n\nTu as vu de près ce que la radio appelait des personnes désorientées. Tu as vu ce qu\'elles faisaient à ceux qu\'elles rattrapaient. Après ça, tu as couru sans regarder derrière.',
    auto: { label: 'Continuer', suivant: 'intro_fu2' },
  },
  intro_fu2: {
    illu: 'hall_hotel', musique: 'sombre',
    texte: 'Le Grand Hôtel de la Poste avait sa porte entrouverte et son hall vide. Tu es entré parce que c\'était là. Parce que les murs étaient épais. Parce qu\'il fallait un dedans.\n\nTu as poussé contre la porte tout ce que tes bras pouvaient soulever : l\'armoire de la lingerie, les fauteuils du salon, le grand bureau de la réception. Tes mains tremblaient trop pour faire des nœuds, alors tu as empilé, coincé, cloué.\n\nPuis tu es monté au deuxième. Chambre 203. Le petit verrou doré, ridicule, a claqué — et le noir t\'a pris d\'un coup, comme une trappe.',
    auto: { label: 'Continuer', suivant: 'intro_1' },
  },

  // ---------- PROLOGUE 3/3 : LE RÉVEIL (raccord avec le début de jeu) ----------
  intro_1: {
    illu: 'appartement', musique: 'calme',
    texte: 'Jour 23.\n\nTu ouvres les yeux dans la chambre 203, sous trois couvertures qui sentent la poussière. Sur le papier peint, au canif : vingt-trois entailles, une par matin. Quatre jours pour que Salon tombe ; dix-neuf à manger froid et à écouter les ongles gratter les portes du couloir.\n\nPar la fenêtre, au-dessus de la place Crousillat, l\'horloge de la Tour de l\'Horloge est arrêtée — comme en 1909, après le séisme. Cette fois, personne ne viendra la remonter.',
    auto: { label: 'Continuer', suivant: 'intro_2' },
  },
  intro_2: {
    illu: 'appartement', musique: 'calme',
    texte: 'Cette nuit, la radio à piles a accroché un signal. Une voix de femme, épuisée, en boucle :\n\n« ...Miramas-le-Vieux... le village tient. Le Refuge accueille les survivants. Vivres, médecins, murs. Suivez la voie ferrée vers le sud... »\n\nMiramas-le-Vieux. Quinze kilomètres. Vingt minutes de train, avant. Autant dire la Lune, à pied, en plein hiver, à travers eux.\n\nMais il y a la gare. Et sur la voie de service, peut-être, une machine.',
    auto: { label: 'Continuer', suivant: 'intro_3' },
  },
  intro_3: {
    illu: 'appartement', musique: 'calme',
    texte: 'Ce matin, tu as mangé ta dernière conserve. En bas, des silhouettes tournent sans fin autour de la Fontaine Moussue. Le choix s\'est fait tout seul : rester ici, c\'est mourir en silence sous une horloge arrêtée.\n\nIl te faut un plan. Atteindre la gare, à l\'ouest des cours. Sur la voie de service dort le vieux locotracteur orange des équipes d\'entretien — il lui faut une batterie, du gasoil, une clé. Et toi, il te faut survivre assez longtemps pour monter dedans.\n\nUn jour de plus. C\'est tout ce que tu demandes. Un jour de plus, chaque jour.',
    auto: { label: 'Ouvrir les yeux', suivant: '#retour' },
  },

  // ---------- LA LOCOMOTIVE DÉMARRE ----------
  loco_demarrage: {
    illu: 'gare', musique: 'sombre',
    texte: 'Tu hisses la batterie poids lourd dans la cabine du Y 8000, les bras en feu, et tu la raccordes en suivant les schémas gravés sur la plaque constructeur. Le gasoil glougloute dans le réservoir, dix litres — de quoi rouler, pas de quoi se tromper.\n\nLa clé du cheminot entre dans le contacteur. Tu fermes les yeux une seconde.\n\n« Allez. Allez, allez, allez... »',
    auto: { label: 'Tourner la clé', suivant: 'loco_demarrage_2' },
  },
  loco_demarrage_2: {
    illu: 'gare', musique: 'sombre',
    texte: 'Un claquement. Un gémissement de métal. Puis le vieux diesel explose de vie dans un rugissement de bête préhistorique, crachant une fumée noire qui monte au-dessus des quais.\n\nLe bruit. Le BRUIT. Dans tout Salon, des milliers de têtes viennent de pivoter vers la gare.\n\nSur le boulevard, ils arrivent déjà. Ils dévalent la passerelle au-dessus des voies. Des dizaines. Des centaines.',
    auto: { label: 'Lancer la machine', suivant: 'train_depart' },
  },

  // ---------- FIN : ARRIVÉE ----------
  fin_arrivee: {
    illu: 'camp', musique: 'calme',
    texte: 'Au bout du triage, tu le vois enfin en entier : le rocher de Miramas-le-Vieux, ses maisons de pierre soudées à la falaise, ses remparts — et de la fumée de cuisine, de la VRAIE fumée de cuisine. Des projecteurs s\'allument là-haut et balaient la machine.\n\nUne voix amplifiée, la même que la radio : « Train non identifié, stoppez et identifiez-vous ! »\n\nTu coupes les gaz. En contrebas du village, un quai de fortune — palettes, conteneurs, barbelés — et des silhouettes armées. Derrière elles, des enfants qui regardent à travers le grillage.\n\nDes vivants. Des vivants partout.',
    auto: { label: 'Descendre du train', suivant: 'fin_arrivee_2' },
  },
  fin_arrivee_2: {
    illu: 'camp', musique: 'calme',
    texte: 'On te fouille, on t\'examine, on compte tes blessures avec un froncement de sourcils. Puis on te fait monter la rampe — la seule, étroite, qui grimpe entre les murs de pierre jusqu\'au village. En haut, une femme en blouse te tend un bol de soupe chaude et dit les mots les plus étranges du monde :\n\n« Bienvenue au Refuge. Tu es en sécurité. »\n\nTu as survécu un jour de plus. Et demain, pour la première fois depuis vingt-trois jours, c\'est à quelqu\'un d\'autre d\'y veiller.\n\n— FIN DU CHAPITRE 1 —',
    auto: { label: 'Voir le bilan', suivant: '#arrivee' },
  },
};

export const SCENES = { ...BASE_SCENES, ...TRAIN_SCENES, ...CH2_SCENES };

// Textes de mort selon la cause
export const MORTS = {
  combat: 'Les dents trouvent ta gorge. Le froid monte vite, plus vite que la douleur. La dernière chose que tu vois, c\'est le ciel gris entre leurs silhouettes penchées — et la dernière chose que tu entends, c\'est le bruit qu\'ils font en mangeant.',
  hemorragie: 'Tu laisses une traînée sombre derrière toi, de plus en plus large. Tu t\'assois juste une minute, pour reprendre des forces. La minute s\'allonge. Le sol est étrangement confortable. Tu fermes les yeux juste une seconde.',
  infection: 'La fièvre brûle tout. Tes pensées fondent comme de la cire. Quelque part dans la nuit, tu sens ton propre corps se lever sans toi — et partir marcher avec les autres.',
  faim: 'Ton corps a tout brûlé : la graisse, le muscle, l\'espoir. Tu t\'allonges dans un coin tranquille, trop faible pour avoir peur. Au moins, eux ne mangent que les vivants.',
  soif: 'Ta langue est un morceau de carton. Les hallucinations sont presque belles, vers la fin — il pleut, dans ta tête, une pluie chaude et infinie que tu es seul à voir.',
  maladie: 'Plié en deux par les crampes, vidé par la fièvre, tu n\'as plus la force de tenir une arme. Quand ils te trouvent, tu n\'es déjà plus qu\'à moitié là.',
};
