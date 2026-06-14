// ============ Bestiaire ============
// vitesse : millisecondes pour remplir la jauge de menace (plus petit = plus rapide)
// esquive : malus à la chance du joueur de toucher (0 à 0.3)
// blessureMax : gravité max des blessures infligées (1 égratignure, 2 entaille, 3 profonde, 4 plaie ouverte)
// attaques : chaque coup porté a sa description ET ses zones du corps — la blessure
//   tombe LÀ où la narration frappe (un rampant mord les chevilles, pas le dos).
export const ZOMBIES = {
  errant: {
    nom: 'Errant', hp: 30, dmg: [5, 12], vitesse: 6500, esquive: 0, blessureMax: 2, infection: 0.06,
    desc: 'Il avance d\'un pas traînant, la mâchoire pendante, un bras tordu dans le mauvais sens. Ses yeux laiteux te fixent sans te voir.',
    gore: 'Le crâne cède avec un craquement humide. Il s\'effondre, enfin immobile.',
    attaques: [
      { desc: 'Ses doigts se referment sur ton bras et ses dents raclent ta peau.', zones: ['au bras', 'à l\'avant-bras'] },
      { desc: 'Il s\'abat sur toi de tout son poids morne, la mâchoire en avant, et mord ton épaule.', zones: ['à l\'épaule'] },
      { desc: 'Ses ongles noirs accrochent la main que tu lèves pour le repousser.', zones: ['à la main', 'à l\'avant-bras'] },
    ],
  },
  rampant: {
    nom: 'Rampant', hp: 20, dmg: [7, 14], vitesse: 8000, esquive: 0.15, blessureMax: 3, infection: 0.1,
    desc: 'Sectionné à la taille, il se tracte sur les coudes en laissant une traînée noire. Ses doigts rongés jusqu\'à l\'os griffent le sol vers tes chevilles.',
    gore: 'Tu écrases ce qui reste de sa tête. Le silence revient, épais.',
    attaques: [
      { desc: 'Il agrippe ta cheville et y plante ce qui lui reste de dents.', zones: ['à la cheville'] },
      { desc: 'Ses doigts rongés jusqu\'à l\'os se referment sur ton mollet et serrent jusqu\'au sang.', zones: ['au mollet'] },
      { desc: 'Il se hisse le long de ta jambe et mord, juste au-dessus du genou.', zones: ['au genou', 'à la cuisse'] },
    ],
  },
  coureur: {
    nom: 'Coureur', hp: 32, dmg: [8, 15], vitesse: 3800, esquive: 0.12, blessureMax: 3, infection: 0.08,
    desc: 'Récent. Trop récent. Il court presque comme un vivant, la bouche grande ouverte sur un hurlement muet.',
    gore: 'Il s\'écroule en pleine course et glisse jusqu\'à tes pieds. Tu recules d\'instinct.',
    attaques: [
      { desc: 'Il te percute de plein fouet — vous roulez au sol et ses ongles te labourent le flanc.', zones: ['au flanc', 'au torse'] },
      { desc: 'Lancé à pleine vitesse, il happe ton bras au passage. La peau part avec.', zones: ['au bras', 'à l\'avant-bras'] },
      { desc: 'Sa mâchoire claque vers ta gorge — tu te dégages d\'un sursaut, pas tout à fait assez vite.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },
  enrage: {
    nom: 'Enragé', hp: 48, dmg: [11, 20], vitesse: 3500, esquive: 0.1, blessureMax: 4, infection: 0.12,
    desc: 'Il se jette contre les murs pour t\'atteindre. Sa peau est déchirée par ses propres ongles, ses dents claquent à vide comme un piège à loup.',
    gore: 'Il faut trois coups de plus, même à terre, pour qu\'il arrête de bouger.',
    attaques: [
      { desc: 'Il frappe, mord, griffe, tout à la fois — ses ongles t\'ouvrent le visage.', zones: ['au visage'] },
      { desc: 'Il te saisit à deux mains et ses dents déchirent ton épaule à travers le tissu.', zones: ['à l\'épaule', 'au cou'] },
      { desc: 'Une rafale de coups désordonnés — l\'un d\'eux te lacère le torse.', zones: ['au torse', 'au flanc'] },
    ],
  },
  gonfle: {
    nom: 'Gonflé', hp: 55, dmg: [6, 12], vitesse: 7500, esquive: 0, blessureMax: 2, infection: 0.15,
    explose: true,
    desc: 'Boursouflé de gaz, la peau tendue à craquer, verdâtre. Chaque pas fait un bruit de poche qui clapote. Ne le crève pas trop près.',
    gore: 'Il éclate dans une gerbe de gaz putride et de fluides noirs. L\'odeur te poursuivra des heures.',
    attaques: [
      { desc: 'Sa main boursouflée s\'écrase sur ton bras — sa peau à lui se déchire, la tienne aussi.', zones: ['au bras', 'à l\'avant-bras'] },
      { desc: 'Il t\'enveloppe de ses bras gonflés et ses dents cherchent ton cou.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },
  hurleur: {
    nom: 'Hurleur', hp: 26, dmg: [5, 10], vitesse: 5200, esquive: 0.05, blessureMax: 2, infection: 0.08,
    hurle: true,
    desc: 'Sa gorge déchiquetée vibre. Quand il te repère, il pousse un cri strident qui porte loin — trop loin.',
    gore: 'Le cri s\'éteint dans un gargouillis. Mais qui l\'a entendu ?',
    attaques: [
      { desc: 'Ses ongles fendent l\'air et déchirent l\'avant-bras que tu lèves en protection.', zones: ['à l\'avant-bras', 'à la main'] },
      { desc: 'Il s\'accroche à ton col et mord, entre le cou et l\'épaule.', zones: ['au cou', 'à l\'épaule'] },
    ],
  },
  putrefie: {
    nom: 'Putréfié', hp: 20, dmg: [4, 9], vitesse: 7000, esquive: 0, blessureMax: 2, infection: 0.3,
    desc: 'Il tombe en morceaux en marchant. La chair noircie suinte, grouillante. La moindre griffure de cette chose s\'infectera.',
    gore: 'Il s\'affaisse comme un sac de boue. Quelque chose continue de grouiller à l\'intérieur.',
    attaques: [
      { desc: 'Sa main suintante glisse le long de ton bras — ses ongles, eux, accrochent.', zones: ['au bras', 'à l\'avant-bras'] },
      { desc: 'Il s\'effondre sur toi plus qu\'il n\'attaque, et mord ce qu\'il trouve : ton épaule.', zones: ['à l\'épaule'] },
      { desc: 'Ses doigts noircis griffent ta main avant que tu n\'arraches ton poignet à sa prise.', zones: ['à la main'] },
    ],
  },
  chien_infecte: {
    nom: 'Chien infecté', hp: 24, dmg: [8, 16], vitesse: 3000, esquive: 0.25, blessureMax: 3, infection: 0.1,
    desc: 'Un berger allemand, ou ce qu\'il en reste. Le museau fendu jusqu\'aux oreilles, il tourne autour de toi en grondant.',
    gore: 'Le chien pousse un dernier jappement presque normal. Presque triste.',
    attaques: [
      { desc: 'Les crocs se plantent dans ton mollet et il secoue la tête comme pour arracher.', zones: ['au mollet'] },
      { desc: 'Il bondit et referme sa gueule sur l\'avant-bras que tu lui jettes en pâture.', zones: ['à l\'avant-bras'] },
      { desc: 'Il te fauche les jambes et ses crocs taillent ta cuisse au passage.', zones: ['à la cuisse'] },
    ],
  },
  colosse: {
    nom: 'Colosse', hp: 90, dmg: [14, 26], vitesse: 5800, esquive: 0, blessureMax: 4, infection: 0.1,
    desc: 'Un ancien CRS, encore en tenue anti-émeute. Deux mètres de muscles morts sous le kevlar. Les balles l\'agacent à peine.',
    gore: 'La montagne s\'écroule. Le sol tremble. Tu restes immobile un long moment, à reprendre ton souffle.',
    attaques: [
      { desc: 'Son poing s\'abat sur toi comme une enclume. Le sol tangue — quelque chose s\'est ouvert dans ton dos en tombant.', zones: ['dans le dos', 'au flanc'] },
      { desc: 'Il te soulève d\'une seule main et te jette contre le mur. Le monde clignote.', zones: ['dans le dos', 'à l\'épaule'] },
      { desc: 'Son revers te cueille en pleine poitrine et t\'envoie au tapis, le souffle coupé.', zones: ['au torse'] },
    ],
  },
  brule: {
    nom: 'Brûlé', hp: 34, dmg: [8, 15], vitesse: 4800, esquive: 0.05, blessureMax: 3, infection: 0.04,
    desc: 'Il sort d\'un immeuble incendié, carbonisé jusqu\'à l\'os par endroits. La chair noircie craque à chaque pas — sans douleur, sans hâte. Ses doigts soudés en moufles ne griffent plus : ils écrasent.',
    gore: 'Il se brise plus qu\'il ne tombe, dans une odeur de cendre froide et de graisse cuite.',
    attaques: [
      { desc: 'Ses doigts soudés en moufle se referment sur ton avant-bras et broient. La chair carbonisée crisse.', zones: ['à l\'avant-bras', 'à la main'] },
      { desc: 'Il t\'enserre l\'épaule et écrase, sans hâte, sans douleur — la sienne du moins.', zones: ['à l\'épaule'] },
      { desc: 'Son moignon durci te percute le flanc comme une poutre calcinée.', zones: ['au flanc', 'au torse'] },
    ],
  },
  nuee_rats: {
    nom: 'Nuée de rats', hp: 16, dmg: [3, 8], vitesse: 2800, esquive: 0.35, blessureMax: 1, infection: 0.25,
    desc: 'Le sol bouge. Des dizaines de rats gras et sans peur, nourris à ce que tu devines, déferlent en vague basse vers tes chevilles. Chaque morsure est minuscule. Aucune n\'est propre.',
    gore: 'La nuée se disperse dans les fissures en couinant. Sur le sol, il reste les tiens — et un silence grouillant.',
    attaques: [
      { desc: 'La vague déferle sur tes chevilles — dix morsures minuscules, aucune propre.', zones: ['à la cheville', 'au pied'] },
      { desc: 'Des incisives s\'enfoncent dans ton mollet, à travers le tissu.', zones: ['au mollet'] },
      { desc: 'Un rat remonte le long de ta jambe — tu le chasses, il emporte un bout de ta main.', zones: ['à la main'] },
    ],
  },
  ecolier: {
    nom: 'Écolier', hp: 18, dmg: [4, 9], vitesse: 4200, esquive: 0.2, blessureMax: 2, infection: 0.09,
    desc: 'Un gamin, dix ans peut-être, encore dans son uniforme d\'école déchiré — cravate de travers, genoux écorchés. Il te regarde de ses yeux blancs, la bouche barbouillée de rouge, et trottine vers toi sans un bruit. C\'est ça le pire : le silence.',
    gore: 'Tu détournes les yeux à la dernière seconde. Le petit corps s\'affaisse sans bruit. Tu mettras du temps à oublier.',
    attaques: [
      { desc: 'Il s\'accroche à ta jambe comme à un parent et mord ta cuisse à pleines dents de lait.', zones: ['à la cuisse', 'au genou'] },
      { desc: 'Petit et vif, il file sous ta garde et plante ses dents dans ta main.', zones: ['à la main', 'à l\'avant-bras'] },
      { desc: 'Il grimpe sur toi avec une force qu\'un enfant ne devrait pas avoir et mord ton ventre.', zones: ['au ventre', 'au flanc'] },
    ],
  },
  policier: {
    nom: 'Policier', hp: 42, dmg: [9, 17], vitesse: 4600, esquive: 0.05, blessureMax: 3, infection: 0.1,
    desc: 'Un flic, ou ce qu\'il en reste. Chemise d\'uniforme noire de sang séché, l\'étoile ternie pend encore à sa poche. Il avance d\'un pas lourd et carré, gardant on ne sait quel réflexe de service — celui de fondre droit sur la menace. Toi.',
    gore: 'L\'étoile tinte sur le bitume quand il tombe. Personne ne viendra relever le numéro de matricule.',
    attaques: [
      { desc: 'Il te ceinture comme pour une interpellation et ses dents cherchent ton épaule à travers le col.', zones: ['à l\'épaule', 'au cou'] },
      { desc: 'Son avant-bras te percute la poitrine et t\'envoie reculer ; il en profite pour mordre.', zones: ['au torse', 'au bras'] },
      { desc: 'Sa poigne se referme sur ton poignet, ferme, entraînée, et il l\'attire vers sa mâchoire.', zones: ['à l\'avant-bras', 'à la main'] },
    ],
  },
  rat_geant: {
    nom: 'Rat géant', hp: 28, dmg: [7, 14], vitesse: 3000, esquive: 0.3, blessureMax: 3, infection: 0.25,
    desc: 'Gros comme un chien, le dos pelé jusqu\'aux côtes, la chair à vif luisante. Il a grandi dans les égouts, nourri à ce qu\'il y trouvait, et la maladie l\'a rendu énorme. Sa gueule s\'ouvre sur deux incisives jaunies, longues comme des doigts.',
    gore: 'La chose couine une dernière fois, un cri presque humain, puis se fige, pattes en l\'air, ventre béant.',
    attaques: [
      { desc: 'Il bondit plus haut qu\'un rat ne devrait et referme sa gueule sur ton avant-bras.', zones: ['à l\'avant-bras', 'à la main'] },
      { desc: 'Ses incisives s\'enfoncent dans ton mollet et il s\'arc-boute pour arracher.', zones: ['au mollet', 'à la cheville'] },
      { desc: 'Il te fauche les jambes de tout son poids et te taille la cuisse de ses griffes en remontant.', zones: ['à la cuisse', 'au flanc'] },
    ],
  },
  traqueur: {
    nom: 'Traqueur', hp: 36, dmg: [10, 18], vitesse: 3300, esquive: 0.2, blessureMax: 3, infection: 0.1,
    desc: 'Celui-là ne fonce pas. Il glisse de couverture en couverture, tête basse, et il te regarde — pas à travers toi, TOI. Il reste assez de chasseur dans ce cadavre pour attendre ton premier faux pas.',
    gore: 'Il tombe en silence, comme il chassait. Ses yeux mettent longtemps à s\'éteindre.',
    attaques: [
      { desc: 'Il surgit de ton angle mort — ses ongles t\'ouvrent le dos avant même que tu te retournes.', zones: ['dans le dos'] },
      { desc: 'Une prise de chasseur : il te tord le bras et mord au défaut de l\'épaule.', zones: ['au bras', 'à l\'épaule'] },
      { desc: 'Il te plaque au sol, un genou dans les reins, et griffe ton flanc exposé.', zones: ['au flanc', 'dans le dos'] },
    ],
  },
};

export function zombie(id) { return ZOMBIES[id]; }
