// Événements d'intérieur supplémentaires — généré par agents (voir schéma dans events.js)
export const EVENTS_INTERIEUR = [
  {
    id: 'ev_i_porte_condamnee',
    types: ['interieur'], once: true,
    texte: 'Au fond du couloir, une porte est condamnée par des planches clouées en croix. À la peinture rouge, en travers du battant : « ELLE EST ENCORE LÀ-DEDANS. NE PAS OUVRIR. » Et plus bas, d\'une autre écriture, minuscule : « pardon ». Derrière le bois, un raclement lent suit tes déplacements, comme des ongles qui apprennent le mur par cœur.',
    choix: [
      {
        label: 'Faire levier sur les planches',
        besoin: { item: 'pied_de_biche' },
        texte: 'Les clous cèdent un à un avec des cris de bois mort. Au dernier, la porte s\'ouvre seule. Elle porte encore sa chemise de nuit. Elle devait avoir quinze ans. Elle se jette dans l\'ouverture sans un bruit. Derrière elle, une chambre que personne n\'a pillée depuis le premier jour.',
        effets: { combat: 'errant', items: [{ id: 'bouteille_eau', qty: 1 }, { id: 'antidouleur', qty: 1 }], tempsMin: 15 },
      },
      {
        label: 'Arracher les planches à mains nues',
        test: { skill: 'force', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu tires jusqu\'à sentir tes épaules craquer. Les planches tombent ensemble — et elle aussi, droit sur toi, chemise de nuit et dents découvertes. Mais tu l\'attendais. Derrière elle, une chambre intacte.', effets: { combat: 'errant', items: [{ id: 'bouteille_eau', qty: 1 }, { id: 'antidouleur', qty: 1 }], sta: -15, xp: { force: 10 }, tempsMin: 15 } },
        echec: { texte: 'Une planche cède d\'un coup et tu pars en arrière. Un bras maigre jaillit par la brèche et te laboure l\'avant-bras avant que tu puisses reculer. Le reste du bois s\'effondre sous son poids.', effets: { pv: -8, blessure: { type: 'egratignure', zones: ['à l\'avant-bras'] }, combat: 'errant', tempsMin: 10 } },
      },
      {
        label: 'Glisser un œil entre les planches',
        texte: 'Dans la pénombre, une silhouette frêle se balance d\'un pied sur l\'autre, le visage tourné vers la fente comme si elle savait. Une adolescente. Tu restes là une seconde de trop, le front contre le bois. Puis tu t\'éloignes, et le raclement reprend derrière toi.',
        effets: { tempsMin: 5 },
      },
    ],
  },
  {
    id: 'ev_i_armoire',
    types: ['interieur'],
    texte: 'L\'armoire de la chambre tremble par à-coups. Quelque chose pousse contre la porte de l\'intérieur — sans rythme, sans colère, sans relâche, comme une machine qui aurait oublié à quoi elle sert. La clé est encore dans la serrure.',
    choix: [
      {
        label: 'Ouvrir d\'un coup, arme prête',
        test: { skill: 'dexterite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu tournes la clé et tires le battant dans le même geste. Il bascule vers toi au milieu des cintres et tu frappes avant qu\'il touche le sol. Un vieil homme en gilet de laine. Quelqu\'un l\'avait enfermé là avec ses souvenirs. Au fond de l\'armoire, une boîte à chaussures pleine de petites choses utiles.', effets: { items: [{ id: 'allumettes', qty: 1 }, { id: 'chiffon', qty: 2 }], xp: { dexterite: 8 }, sta: -8, tempsMin: 5 } },
        echec: { texte: 'La porte te revient dans l\'épaule, poussée de l\'intérieur, et il te tombe dessus dans une avalanche de manteaux qui sentent la naphtaline et la charogne.', effets: { combat: 'errant', tempsMin: 5 } },
      },
      {
        label: 'Donner un tour de clé et fouiller autour',
        texte: 'Le pêne claque. Les coups continuent, étouffés, patients, pendant tout le temps que tu passes à retourner la chambre. Tu travailles vite, avec ce poing mort dans le dos comme un métronome.',
        effets: { items: [{ id: 'biscuits', qty: 1 }], tempsMin: 15, sta: -5 },
      },
      { label: 'Quitter la pièce sans y toucher', texte: 'Certaines portes ne demandent qu\'une chose : rester fermées. Tu refermes celle de la chambre derrière toi.', effets: {} },
    ],
  },
  {
    id: 'ev_i_bibliotheque',
    types: ['interieur'],
    texte: 'Une bibliothèque massive s\'est abattue en travers du salon — ou quelqu\'un l\'a abattue. Dessous, une chose broyée à partir du bassin rampe sur place depuis des semaines, les ongles usés jusqu\'au sang sur le parquet rayé en éventail. À cinquante centimètres de ses doigts : un sac de sport, fermé, intact.',
    choix: [
      {
        label: 'Attraper le sac sans s\'approcher trop',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu te coules le long du meuble, hors de portée, et tu tires le sac par la sangle. Les doigts se referment sur le vide, encore et encore. Ils continueront après ton départ.', effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'desinfectant', qty: 1 }], xp: { agilite: 6 }, tempsMin: 5 } },
        echec: { texte: 'Tu as le sac — mais sa main aussi a trouvé quelque chose : ton poignet. Tu te dégages d\'une torsion en y laissant de la peau, et ses ongles fendus te labourent l\'avant-bras jusqu\'au coude.', effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'desinfectant', qty: 1 }], pv: -8, blessure: { type: 'egratignure', zones: ['à la main', 'à l\'avant-bras'] }, sta: -8, tempsMin: 5 } },
      },
      {
        label: 'Lui écraser le crâne d\'abord',
        texte: 'Tu poses le pied sur sa nuque et tu appuies de tout ton poids jusqu\'au craquement. Le parquet ne grincera plus. Le sac est à toi, et le silence aussi.',
        effets: { items: [{ id: 'barre_cereales', qty: 2 }, { id: 'desinfectant', qty: 1 }], sta: -8, xp: { mainsNues: 5 }, tempsMin: 10 },
      },
      { label: 'Laisser le sac où il est', texte: 'Quelque chose dans ce grattement infini te retourne l\'estomac. Tu sors à reculons.', effets: {} },
    ],
  },
  {
    id: 'ev_i_plinthe',
    types: ['interieur'],
    texte: 'La cuisine a été pillée dix fois : placards béants, tiroirs arrachés, miettes fossiles. Pourtant quelque chose cloche. La plinthe sous l\'évier est fixée par des vis neuves — brillantes, dans un appartement où tout le reste est gris de poussière.',
    choix: [
      {
        label: 'Dévisser proprement',
        besoin: { item: 'tournevis' },
        texte: 'Quatre vis, deux minutes. Derrière la plinthe, un boyau aménagé avec soin : le garde-manger secret de quelqu\'un de prudent. Quelqu\'un qui n\'est jamais revenu le vider.',
        effets: { items: [{ id: 'conserve_haricots', qty: 2 }, { id: 'bouteille_eau', qty: 1 }, { id: 'chocolat', qty: 1 }], tempsMin: 10 },
      },
      {
        label: 'Arracher la plinthe de force',
        test: { skill: 'force', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Le bois cède d\'un coup sec et tu pars en arrière avec la plinthe dans les mains. Dans la cache : des boîtes, de l\'eau. Quelqu\'un de prudent — mais moins fort que toi.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'bouteille_eau', qty: 1 }], sta: -8, xp: { force: 6 }, tempsMin: 10 } },
        echec: { texte: 'Les vis tiennent bon. Tes doigts glissent sur l\'arête du bois et s\'ouvrent sur toute la longueur. La cache garde son secret, et toi, une strie rouge en travers de la paume.', effets: { pv: -4, blessure: { type: 'egratignure', zones: ['à la main'] }, sta: -10, tempsMin: 10 } },
      },
      { label: 'Laisser tomber', texte: 'Des vis neuves, et alors. Tu as d\'autres pièces à voir.', effets: {} },
    ],
  },
  {
    id: 'ev_i_vieil_homme',
    types: ['interieur'],
    texte: 'Au bout du couloir, une porte renforcée de planches vissées de l\'intérieur. Quand le parquet craque sous ton pas, une voix éraillée traverse le bois : « J\'ai un fusil. J\'ai plus grand-chose d\'autre, mais j\'ai un fusil. » Une voix de vieil homme, sèche comme du papier. Au bas de la porte, une fente — assez large pour y glisser quelque chose.',
    choix: [
      {
        label: 'Glisser une bouteille d\'eau sous la porte',
        besoin: { item: 'bouteille_eau' },
        texte: 'Un long silence. Puis un raclement, et la bouteille disparaît. « ... Pourquoi ? » Tu n\'as pas de réponse. Quelques secondes plus tard, des cartouches roulent vers toi par la fente, une à une. « C\'est tout ce que j\'ai en double. Tiens un jour de plus, petit. »',
        effets: { retire: [{ id: 'bouteille_eau', qty: 1 }], items: [{ id: 'cartouches', qty: 3 }], flag: 'vieil_homme_aide', tempsMin: 10 },
      },
      {
        label: 'Enfoncer la porte',
        test: { skill: 'force', base: 0.3, parNiveau: 0.12 },
        reussite: { texte: 'Le chambranle cède au troisième coup d\'épaule. Il est recroquevillé dans un coin, le fusil tremblant au bout de bras trop maigres pour viser. Il ne tire pas. Il ne dit rien pendant que tu prends ce que tu veux. Son regard, lui, te suivra longtemps.', effets: { items: [{ id: 'fusil_chasse', qty: 1 }, { id: 'conserve_raviolis', qty: 1 }], flag: 'vieil_homme_depouille', sta: -15, xp: { force: 8 }, tempsMin: 10 } },
        echec: { texte: 'Le canon tonne à travers le battant. La chevrotine arrache le bois à dix centimètres de ta tête et te crible le flanc d\'échardes. « Le prochain est pour le ventre. » Tu le crois sur parole.', effets: { pv: -14, blessure: { type: 'entaille', zones: ['au flanc'] }, tempsMin: 5 } },
      },
      { label: 'Passer sans bruit', texte: 'Tu lèves les mains, geste inutile à travers une porte, et tu recules. Chacun son île.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_i_fusil_piege',
    types: ['interieur'],
    texte: 'La porte de la chambre est entrouverte sur le noir. En te baissant pour ramasser une douille, tu le vois : un fil de fer tendu de la poignée vers l\'intérieur, jusqu\'à une masse sombre sanglée sur la commode. Un fusil monté sur des serre-joints, braqué sur l\'embrasure à hauteur de poitrine. Quelqu\'un protège quelque chose — ou se venge de tout le monde.',
    choix: [
      {
        label: 'Désamorcer le mécanisme',
        test: { skill: 'mecanique', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu suis le fil du bout des doigts, bloques le chien avec le pouce et démontes l\'ensemble sans respirer. Le fusil est rongé de rouille, bon pour rien — mais il était chargé, et la chambre derrière valait la peine.', effets: { items: [{ id: 'cartouches', qty: 2 }, { id: 'fil_de_fer', qty: 1 }, { id: 'soda', qty: 1 }], xp: { mecanique: 12 }, tempsMin: 15 } },
        echec: { texte: 'Ton pouce glisse. La détonation est monstrueuse dans la pièce close — la gerbe pulvérise le chambranle et te crible l\'épaule de plombs perdus et d\'échardes. Et maintenant, tout le quartier sait que tu es là.', effets: { pv: -12, blessure: { type: 'entaille', zones: ['à l\'épaule'] }, combat: 'errant', tempsMin: 5 } },
      },
      {
        label: 'Couper le fil à distance',
        besoin: { item: 'pince_coupante' },
        texte: 'La pince tranche le fil sans le tendre. Le percuteur retombe sur le vide avec un clic de jouet cassé. Propre. Tu démontes le piège et fais les poches de la chambre.',
        effets: { items: [{ id: 'cartouches', qty: 2 }, { id: 'fil_de_fer', qty: 1 }, { id: 'soda', qty: 1 }], tempsMin: 10 },
      },
      { label: 'Renoncer à la pièce', texte: 'Un piège pareil annonce soit un trésor, soit un cinglé. Tu n\'as envie de rencontrer ni l\'un ni l\'autre aujourd\'hui.', effets: {} },
    ],
  },
  {
    id: 'ev_i_escalier',
    types: ['interieur'],
    texte: 'L\'escalier vers l\'étage a perdu trois marches, dévorées par l\'humidité. Le reste de la volée pend de travers, retenu par des clous fatigués qui saignent de la rouille. Là-haut, des portes fermées que personne n\'a dû rouvrir depuis le début.',
    choix: [
      {
        label: 'Monter en collant la rampe',
        test: { skill: 'agilite', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'Tu répartis ton poids, un pied sur la lisse, l\'autre au ras du mur. Le bois proteste mais tient. L\'étage sent le renfermé et la poussière — pas la mort. Personne n\'est monté piller ici.', effets: { items: [{ id: 'conserve_raviolis', qty: 1 }, { id: 'bandage', qty: 1 }, { id: 'piles', qty: 1 }], xp: { agilite: 8 }, sta: -10, tempsMin: 20 } },
        echec: { texte: 'Une marche explose sous ton talon. Tu dévales la volée sur le dos, et une arête de bois fendu te déchire le flanc au passage. En bas, allongé dans les gravats, tu écoutes l\'étage te narguer.', effets: { pv: -13, blessure: { type: 'entaille', zones: ['au flanc', 'dans le dos'] }, sta: -12, tempsMin: 10 } },
      },
      {
        label: 'Consolider avec une planche',
        besoin: { item: 'planche', skill: { construction: 1 } },
        texte: 'Tu cales ta planche en travers des marches mortes et tu la cloues dans le bois sain. L\'escalier tiendra — pour toi, et pour ceux d\'après. L\'étage est intact, et tu redescends chargé.',
        effets: { retire: [{ id: 'planche', qty: 1 }], items: [{ id: 'conserve_raviolis', qty: 1 }, { id: 'bandage', qty: 1 }, { id: 'piles', qty: 1 }], xp: { construction: 10 }, sta: -8, tempsMin: 25 },
      },
      { label: 'Renoncer à l\'étage', texte: 'Une jambe cassée, ici, c\'est une condamnation à mort avec sursis. Tu restes en bas.', effets: {} },
    ],
  },
  {
    id: 'ev_i_table_mise',
    types: ['interieur'], once: true,
    texte: 'La salle à manger baigne dans la lumière rayée des volets. Quatre couverts sur une nappe propre. Ils sont encore assis tous les quatre — le père, la mère, deux enfants — affaissés sur leurs chaises comme si le repas les avait simplement épuisés. Les assiettes sont vides, raclées jusqu\'à la faïence. Au centre de la table, un flacon de comprimés couché sur le flanc, vide lui aussi. Dans la cuisine, la vaisselle est faite. Quelqu\'un a essuyé le plan de travail avant de s\'asseoir.',
    choix: [
      {
        label: 'Fouiller la maison sans toucher à la table',
        texte: 'Tu travailles en silence, comme on se déplace dans une église. La maison est généreuse : ils n\'avaient pas prévu de partir, seulement de ne pas rester.',
        effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'biscuits', qty: 1 }, { id: 'antidouleur', qty: 1 }, { id: 'allumettes', qty: 1 }], tempsMin: 25 },
      },
      {
        label: 'Recouvrir les enfants avant de fouiller',
        texte: 'Deux nappes du buffet, deux silhouettes en moins dans la lumière rayée. Ça ne change rien pour eux. Pour toi, si. Tu fouilles ensuite, plus lentement, et tu refermes la porte comme on borde quelqu\'un.',
        effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'biscuits', qty: 1 }, { id: 'antidouleur', qty: 1 }, { id: 'allumettes', qty: 1 }], tempsMin: 40, sta: -5 },
      },
      { label: 'Ressortir sans rien prendre', texte: 'Il y a des maisons où l\'on n\'entre pas, même quand la porte est ouverte. Surtout quand la porte est ouverte.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_i_cloison',
    types: ['interieur'],
    texte: 'Un grattement dans la cloison. Tu t\'arrêtes — il s\'arrête. Tu repars — il reprend, et il te suit le long du mur, à hauteur d\'épaule, derrière le placo. Trop lourd pour des rats. Trop patient pour autre chose.',
    choix: [
      {
        label: 'Ouvrir la cloison proprement',
        test: { skill: 'construction', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Tu découpes le placo en carré, à bonne distance du grattement. Derrière : une gaine technique — et calé entre les tuyaux, un sac étanche que quelqu\'un a planqué là avant que les murs aient des dents. La chose, elle, gratte toujours, un mètre plus loin, enfermée dans son couloir de plâtre.', effets: { items: [{ id: 'briquet', qty: 1 }, { id: 'conserve_raviolis', qty: 1 }], xp: { construction: 10 }, tempsMin: 15 } },
        echec: { texte: 'Le pan de cloison s\'effondre d\'un bloc — et lui avec. Un torse sans jambes dégringole à tes pieds dans un nuage de poussière de plâtre, déjà en train de ramper vers tes chevilles.', effets: { combat: 'rampant', tempsMin: 5 } },
      },
      {
        label: 'Cogner le mur pour voir',
        texte: 'Tu frappes deux grands coups du plat de la main. Le grattement s\'affole, converge, racle furieusement à hauteur de ton visage... puis s\'éloigne vers le bas, et s\'éteint quelque part sous le plancher. Tu ne sauras jamais. C\'est peut-être mieux.',
        effets: { sta: -5, tempsMin: 10 },
      },
      { label: 'Accélérer le pas', texte: 'Tu finis la pièce en gardant un mètre entre le mur et toi. Le grattement t\'accompagne jusqu\'à la porte, poli, presque amical.', effets: { tempsMin: 5 } },
    ],
  },
  {
    id: 'ev_i_pillards_nuit',
    types: ['interieur'], nuit: true,
    texte: 'En bas, la porte d\'entrée s\'ouvre. Pas un grognement, pas un raclement de semelle morte : des pas. Deux au moins, et le halo d\'une lampe qui lèche le bas de l\'escalier. « Vérifie la cuisine. Moi je monte. » Des vivants. Armés, forcément.',
    choix: [
      {
        label: 'Se fondre dans l\'ombre et attendre',
        test: { skill: 'agilite', base: 0.45, parNiveau: 0.1 },
        reussite: { texte: 'Tu te plies derrière une commode, joue contre le bois froid. Le faisceau passe deux fois à un mètre de ton visage. « Y a plus rien ici, c\'est gratté jusqu\'à l\'os. Et passe pas par la grand-rue en rentrant, c\'est infesté depuis hier. » Les pas refluent. Tu attends que la porte claque pour respirer.', effets: { sta: -10, xp: { agilite: 10 }, tempsMin: 25 } },
        echec: { texte: 'Le faisceau s\'arrête sur toi. Ce qui suit est rapide et humiliant : un coup de barre dans les côtes, des mains expertes dans ton sac, et leurs rires qui descendent l\'escalier sans se presser.', effets: { pv: -12, blessure: { type: 'egratignure', zones: ['au flanc'] }, volNourriture: true, sta: -10, tempsMin: 10 } },
      },
      {
        label: 'Lancer d\'une voix forte : « C\'est chez moi. Partez. »',
        test: { skill: 'force', base: 0.35, parNiveau: 0.12 },
        reussite: { texte: 'Un silence épais. Puis une voix plus jeune que la tienne : « Laisse tomber, on se tire. » Des pas précipités, la porte qui claque. Dans la cuisine, ils ont abandonné ce qu\'ils avaient déjà raflé sur le plan de travail.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'soda', qty: 1 }], xp: { force: 6 }, tempsMin: 10 } },
        echec: { texte: '« Vas-y, descends alors. » Ils sont deux, et toi seul. La suite te laisse au sol du palier, sonné, le sac retourné comme une poche de noyé.', effets: { pv: -15, blessure: { type: 'entaille', zones: ['au visage', 'au torse', 'au flanc'] }, volNourriture: true, sta: -10, tempsMin: 15 } },
      },
      {
        label: 'Filer par la fenêtre de derrière',
        texte: 'Tu enjambes l\'appui dans le noir, suspendu au-dessus du vide le temps d\'un battement de cœur. La gouttière proteste mais tient. Tu laisses la maison aux charognards — elle ne t\'appartenait pas plus qu\'à eux.',
        effets: { sta: -15, tempsMin: 10 },
      },
    ],
  },
  {
    id: 'ev_i_reveil',
    types: ['interieur'], nuit: true,
    texte: 'Une sonnerie stridente déchire le noir. Quelque part dans l\'appartement, un réveil à piles que personne n\'a jamais éteint vient de croire au matin. Le vacarme rebondit dans la cage d\'escalier de l\'immeuble entier. Dehors, quelque chose répond.',
    choix: [
      {
        label: 'Foncer le faire taire',
        test: { skill: 'agilite', base: 0.5, parNiveau: 0.09 },
        reussite: { texte: 'Tu suis le son à tâtons, mains en avant dans le noir — table, couloir, chambre — et tu l\'écrases sous une pile de linge. Le silence retombe, énorme. Tu gardes les piles : il les a bien méritées, toi aussi.', effets: { items: [{ id: 'piles', qty: 1 }], xp: { agilite: 8 }, sta: -5, tempsMin: 5 } },
        echec: { texte: 'Ton tibia trouve la table basse avant tes mains. Le temps de te relever en jurant et d\'étrangler enfin la sonnerie, des poings cognent déjà contre la porte d\'entrée — puis le bois commence à céder.', effets: { pv: -4, combat: 'errant', tempsMin: 5 } },
      },
      {
        label: 'Se barricader et laisser sonner',
        texte: 'Tu coinces une chaise sous la poignée et tu t\'assois dans le noir, dos au mur. Le réveil sonne dix minutes, puis meurt de sa belle mort. Longtemps après, des pas traînants raclent le palier — vont, viennent, repartent. Tu ne fermes pas l\'œil du reste de la nuit.',
        effets: { sta: -15, tempsMin: 60 },
      },
    ],
  },
  {
    id: 'ev_i_cave_inondee',
    types: ['interieur'],
    texte: 'L\'escalier de la cave plonge dans une eau noire et parfaitement immobile, montée à mi-cuisse. Ce qui filtre du soupirail accroche des étagères métalliques au fond, chargées de boîtes de conserve. Entre elles et toi, la surface huileuse — et, flottant ventre en l\'air, quelque chose que tu choisis de prendre pour un chien.',
    choix: [
      {
        label: 'Traverser jusqu\'aux étagères',
        test: { skill: 'agilite', base: 0.4, parNiveau: 0.11 },
        reussite: { texte: 'L\'eau glacée te serre les jambes comme une main. Tu avances sans un remous, en gardant la chose flottante dans ton champ de vision, et tu charges les boîtes une à une. Elle n\'a pas bougé. Tu ne vérifies pas pourquoi.', effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'conserve_raviolis', qty: 1 }], sta: -15, xp: { agilite: 6 }, tempsMin: 15 } },
        echec: { texte: 'À mi-chemin, la chose au ventre blanc pivote sur elle-même. Ce n\'était pas un chien. La main qui crève la surface n\'a plus d\'ongles, et la tête qui suit n\'a plus de lèvres. L\'eau noire se met à bouillir autour de toi.', effets: { combat: 'putrefie', sta: -12, tempsMin: 5 } },
      },
      {
        label: 'Pêcher les boîtes depuis l\'escalier',
        besoin: { item: 'canne_peche' },
        texte: 'Tu ferres des conserves comme d\'autres ferraient des truites, accroupi sur la dernière marche sèche. C\'est lent, c\'est ridicule, et ça marche. La chose flottante regarde le plafond pendant tout ce temps. Tu la remercies à voix basse de ne rien faire d\'autre.',
        effets: { items: [{ id: 'conserve_haricots', qty: 1 }, { id: 'conserve_raviolis', qty: 1 }], xp: { chasse: 6 }, tempsMin: 25 },
      },
      { label: 'Refermer la porte de la cave', texte: 'L\'eau noire garde ses boîtes et son chien qui n\'en est pas un. Tu remontes en verrouillant derrière toi.', effets: {} },
    ],
  },
];
