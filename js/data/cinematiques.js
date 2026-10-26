// ============ CINÉMATIQUES — scripts (docs/HISTOIRE.md §11) ============
// Chaque plan est TOURNÉ dans Blender (tools/blender/cine/plans3.py, mains : omd_mains.py) : `clip` → img/cine/clips/<clip>.webm.
// Le `decor` est le repli si la vidéo manque (plaque photo img/cine/<décor>.webp rendue dans la même scène 3D, voir
// js/cine/photos.js) et l'illustration des scènes (clé `illu`).
//
// Plan : { clip?, decor, camera: { de: {x, y?, zoom}, vers: {x, y?, zoom} }, duree (ms), effets: [...], anim: [...],
//          texte (sous-titre), attendre (bool : bouton « Continuer » à la fin du plan), titre? (carton de titre) }
//   x, y : 0..1 (centre de la caméra dans le décor de repli) ; zoom : 1 = décor entier.
// Effets globaux : grain, vignette_pulse, flash_rouge, fondu_noir, fondu_blanc, fumee, braises, cendres, poussiere,
//   mistral, chaleur, lueur_lampe, brouillard_bas, etoiles, secousse. Musique : titre | calme | sombre | tension | combat | mort | refuge.

export const DECORS = [
  // plans des cinématiques (plaques photo rendues dans Blender)
  'crau_aube', 'mains_radio', 'voie_ferree', 'refuge_porte', 'mains_levees', 'noir',
  'triage_feu', 'mains_enveloppe', 'refuge_nuit', 'mains_corde', 'etang_nuit', 'poudrerie_brume', 'mains_foulard',
  'cornillon_belvedere', 'mains_carte', 'durance_pont', 'mallemort_camp', 'mains_liste', 'mains_feu', 'camp_refugies',
  // vignettes des scènes
  'refuge_place', 'refuge_cellule', 'refuge_donjon', 'triage_horde', 'bergerie_crau', 'bergerie_nuit', 'poudrerie_parc',
  'peage_lancon', 'grans_moulin', 'istres_pharmacie', 'plaine_route', 'nuit_campagne', 'crau_mistral',
];

export const CINEMATIQUES = {

  // ─────────── Nouvelle partie : le message ───────────
  // ─────────── Le début (docs/HISTOIRE_DEBUT_V3.md §3) : pas de vidéo, trois phrases sur un écran noir ───────────
  // Les plans tournés attendront que l'histoire soit validée de bout en bout (docs/RETOURS_JOUEUR.md #62).
  ouverture: { musique: 'titre', plans: [
    { decor: 'noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 8000, effets: ['grain'], anim: [],
      texte: 'Ça fait deux jours qu’ils t’ont {ramassé|ramassée} au bord de la route de Pélissanne : six inconnus dans un fourgon de plombier, qui roulent tous feux éteints.' },
    { decor: 'noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 8000, effets: ['grain'], anim: [],
      texte: 'Ce soir, pour éviter les morts de la nationale, ils ont pris une piste de pompiers à travers le bois de la Barben. Le moteur a toussé au milieu des pins, puis il s’est tu.', attendre: true },
    { decor: 'noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 3500,
      effets: ['fondu_noir'], anim: [], titre: 'One More Day', texte: '', attendre: true },
  ] },

  intro: { musique: 'titre', plans: [
    { clip: 'intro_1', decor: 'crau_aube', camera: { de: { x: 0.3, zoom: 1.15 }, vers: { x: 0.6, zoom: 1.05 } }, duree: 8500,
      effets: ['grain'], anim: [],
      texte: 'Pays salonais, fin septembre. Trois semaines ont passé depuis le Mercredi, le jour où le grand marché de Salon s’est mis à mordre.' },
    { clip: 'intro_2', decor: 'mains_radio', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.12 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Depuis vingt jours, tu survis {seul|seule}. Il y a deux jours, en tournant la molette de ta petite radio, tu as capté une voix.' },
    { clip: 'intro_3', decor: 'voie_ferree', camera: { de: { x: 0.45, zoom: 1.1 }, vers: { x: 0.5, zoom: 1.25 } }, duree: 9000,
      effets: ['grain'], anim: [],
      texte: '« Ici le Refuge de Miramas-le-Vieux. Nous accueillons les survivants. Venez par la route de Saint-Chamas, à la porte Notre-Dame. Montrez vos mains. »' },
    { clip: 'intro_4', decor: 'refuge_porte', camera: { de: { x: 0.5, y: 0.7, zoom: 1.2 }, vers: { x: 0.5, y: 0.4, zoom: 1.05 } }, duree: 7000,
      effets: ['grain', 'lueur_lampe'], anim: [],
      texte: 'Tu arrives au pied des remparts quand le soleil se couche. En haut, une lampe s’allume et descend sur toi.' },
    { clip: 'intro_5', decor: 'mains_levees', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.5, zoom: 1.15 } }, duree: 8000,
      effets: ['grain', 'lueur_lampe'], anim: [],
      texte: '« Stop ! Montre tes mains ! » Tu lèves les mains dans le faisceau, puis tu tournes lentement tes avant-bras pour qu’il voie bien qu’il n’y a pas de morsure.', attendre: true },
    { clip: 'intro_6', decor: 'noir', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.0 } }, duree: 4000,
      effets: ['fondu_noir'], anim: [], titre: 'One More Day', texte: '', attendre: true },
  ] },

  // ─────────── Acte II : la frappe sur la gare de triage ───────────
  frappe: { musique: 'tension', plans: [
    { clip: 'frappe_1', decor: 'crau_aube', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.65, zoom: 1.2 } }, duree: 7000,
      effets: ['grain', 'secousse'], anim: [],
      texte: 'Le grondement arrive avant les avions. Deux ombres passent si bas au-dessus de la Crau que les herbes se couchent.' },
    { clip: 'frappe_2', decor: 'triage_feu', camera: { de: { x: 0.45, zoom: 1.05 }, vers: { x: 0.55, zoom: 1.25 } }, duree: 9000,
      effets: ['grain', 'secousse', 'fumee'], anim: [],
      texte: 'Sur la gare de triage, les explosions s’enchaînent, puis une boule de feu monte au-dessus des trains. Et sous la fumée noire, quelque chose de jaune se met à rouler au ras du sol, sans monter.' },
    { clip: 'frappe_3', decor: 'mains_enveloppe', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 7000,
      effets: ['grain'], anim: [],
      texte: 'Dans ta poche, l’enveloppe d’Hélène pèse soudain très lourd : « À n’ouvrir que si le Refuge tombe. »', attendre: true },
  ] },

  // ─────────── Acte III : la chute du Refuge ───────────
  chute: { musique: 'combat', plans: [
    { clip: 'chute_1', decor: 'refuge_nuit', camera: { de: { x: 0.4, zoom: 1.1 }, vers: { x: 0.55, zoom: 1.2 } }, duree: 7000,
      effets: ['grain', 'braises'], anim: [],
      texte: 'Par la porte grande ouverte, ils entrent par dizaines, puis par centaines, et ils remplissent la rue.' },
    { clip: 'chute_2', decor: 'mains_corde', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.12 } }, duree: 7000,
      effets: ['grain'], anim: [],
      texte: 'Dans le clocher de Notre-Dame, Fernand pend de tout son poids à la corde, et la cloche se met à sonner.' },
    { clip: 'chute_3', decor: 'refuge_nuit', camera: { de: { x: 0.6, zoom: 1.15 }, vers: { x: 0.4, zoom: 1.05 } }, duree: 7500,
      effets: ['grain', 'braises'], anim: [],
      texte: 'Dans la rue, toutes les têtes se tournent vers l’église, et les morts s’y dirigent, tous ensemble, vers le bruit.', attendre: true },
  ] },

  // ─────────── Acte IV : la brume ───────────
  brume: { musique: 'sombre', plans: [
    { clip: 'brume_1', decor: 'etang_nuit', camera: { de: { x: 0.3, zoom: 1.1 }, vers: { x: 0.6, zoom: 1.15 } }, duree: 8000,
      effets: ['grain', 'brouillard_bas'], anim: [],
      texte: 'Sur l’étang de Berre, sous la lune, une brume basse s’avance sur l’eau. Elle est jaune, et elle sent l’eau de Javel.' },
    { clip: 'brume_2', decor: 'poudrerie_brume', camera: { de: { x: 0.5, zoom: 1.05 }, vers: { x: 0.5, zoom: 1.2 } }, duree: 8000,
      effets: ['grain', 'brouillard_bas'], anim: [],
      texte: 'Elle coule entre les platanes du parc. Et dedans, sans un bruit, quelqu’un marche.' },
    { clip: 'brume_3', decor: 'mains_foulard', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.08 } }, duree: 6500,
      effets: ['grain', 'vignette_pulse'], anim: [],
      texte: 'Tu plaques le foulard mouillé sur ta bouche. Tes yeux pleurent. Il faut monter.', attendre: true },
  ] },

  // ─────────── Acte IV → V : la mer jaune ───────────
  cornillon_aube: { musique: 'calme', plans: [
    { clip: 'cornillon_1', decor: 'cornillon_belvedere', camera: { de: { x: 0.2, zoom: 1.15 }, vers: { x: 0.8, zoom: 1.1 } }, duree: 9500,
      effets: ['grain'], anim: [],
      texte: 'Du belvédère de Cornillon, la plaine a disparu sous une mer jaune. Seuls en dépassent les clochers, les pylônes et la cheminée d’une usine, et au loin, l’étang qui brille.' },
    { clip: 'cornillon_2', decor: 'mains_carte', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Tu déplies sur le muret la carte qu’Inès a trouvée chez le guetteur, et ton doigt suit la route vers le nord, jusqu’à la Durance.', attendre: true },
  ] },

  // ─────────── Final : le pont ───────────
  pont: { musique: 'tension', plans: [
    { clip: 'pont_1', decor: 'durance_pont', camera: { de: { x: 0.35, zoom: 1.15 }, vers: { x: 0.55, zoom: 1.05 } }, duree: 8000,
      effets: ['grain', 'brouillard_bas'], anim: [],
      texte: 'L’aube se lève sur la Durance. Le vieux pont suspendu tend ses câbles entre ses pylônes de pierre, et sur l’autre rive, les projecteurs de l’armée s’éteignent un à un.' },
    { clip: 'pont_2', decor: 'mallemort_camp', camera: { de: { x: 0.3, zoom: 1.1 }, vers: { x: 0.6, zoom: 1.15 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Sur la rive sud, des centaines de gens se lèvent en même temps et plient leurs couvertures sans un mot.' },
    { clip: 'pont_3', decor: 'mains_liste', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 7000,
      effets: ['grain'], anim: [],
      texte: 'Au bout du pont, une main gantée te tend une feuille.', attendre: true },
  ] },

  // ─────────── Fins ───────────
  fin_pont: { musique: 'refuge', plans: [
    { clip: 'fin_pont_1', decor: 'mallemort_camp', camera: { de: { x: 0.5, zoom: 1.1 }, vers: { x: 0.65, zoom: 1.2 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Les planches du pont résonnent sous tes pas. Derrière toi, le pays salonais reste de l’autre côté de l’eau.' },
    { clip: 'fin_pont_2', decor: 'camp_refugies', camera: { de: { x: 0.2, zoom: 1.15 }, vers: { x: 0.6, zoom: 1.1 } }, duree: 9000,
      effets: ['grain'], anim: [],
      texte: 'Il y a des tentes, de la soupe chaude et des listes qu’on appelle. Il y a un lendemain, et puis un autre.', attendre: true },
  ] },
  fin_place: { musique: 'sombre', plans: [
    { clip: 'fin_place_1', decor: 'durance_pont', camera: { de: { x: 0.6, zoom: 1.2 }, vers: { x: 0.4, zoom: 1.05 } }, duree: 8500,
      effets: ['grain'], anim: [],
      texte: 'Hélène traverse sans se retourner. Au bout du pont, elle s’arrête une seconde, puis les soldats la font avancer.' },
    { clip: 'fin_place_2', decor: 'mains_feu', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Le soir, sur la rive sud, tu tends les mains vers un petit feu. Un jour de plus.', attendre: true },
  ] },
  fin_seul: { musique: 'sombre', plans: [
    { clip: 'fin_seul_1', decor: 'cornillon_belvedere', camera: { de: { x: 0.7, zoom: 1.1 }, vers: { x: 0.3, zoom: 1.15 } }, duree: 9000,
      effets: ['grain'], anim: [],
      texte: 'La radio ne dit plus rien. Sous les collines, la brume est de plus en plus pâle, et le pays reste à ceux qui y vivent encore.' },
    { clip: 'fin_place_2', decor: 'mains_feu', camera: { de: { x: 0.5, zoom: 1.0 }, vers: { x: 0.5, zoom: 1.1 } }, duree: 8000,
      effets: ['grain'], anim: [],
      texte: 'Tu rallumes le feu. Demain, il faudra de l’eau, du bois, et un endroit où dormir. Encore un jour.', attendre: true },
  ] },
};
