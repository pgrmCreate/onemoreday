// ============ Ouverture du chapitre 2 — le Refuge (Miramas-le-Vieux) ============
// Même schéma que story.js. S'enchaîne après 'fin_arrivee_2' : la montée au
// village, la fouille, la femme de la radio, la couchette — et la douche froide.
// La cible '#chapitre2' est gérée par le moteur : elle téléporte le joueur
// au village (DEPART_CH2 de cartes_miramas.js).
// NOTE : la femme de la radio est la sœur de Léa — le texte doit fonctionner
// que Léa soit arrivée ou non : aucun effet/flag ne la nomme, aucune ligne
// ne suppose sa présence ni son absence.

export const CH2_SCENES = {

  // ---------- LA MONTÉE ----------
  ch2_intro_1: {
    illu: 'camp', musique: 'calme',
    texte: 'La rampe monte raide entre le rocher et un mur de pierre sèche, si étroite que ton épaule frotte. Deux projecteurs te suivent depuis les remparts — des vrais projecteurs, branchés sur des vraies batteries, tenus par de vraies mains. Tu avais oublié ce que ça fait, de la lumière qui te cherche sans vouloir te manger.\n\nDeux chicanes de palettes hérissées de pieux. Une herse de grilles de chantier qu\'on lève à la corde. À chaque palier, des yeux : un gamin perché sur un muret, une femme avec un fusil de chasse cassé sur l\'avant-bras, un vieux qui compte tes pas sans bouger les lèvres.\n\nEn bas, dans ton dos, le triage s\'éteint dans le soir — des kilomètres de wagons morts. Là-dedans, ça bouge encore. Ça bougera toute la nuit.',
    auto: { label: 'Passer la porte', suivant: 'ch2_intro_2' },
  },

  // ---------- LA FOUILLE ----------
  ch2_intro_2: {
    illu: 'place', musique: 'calme',
    texte: 'Sous la voûte de la porte Notre-Dame, on t\'arrête d\'une main à plat sur la poitrine. Pas brutale. Ferme.\n\nIls sont trois. Ils ne prennent rien — ils regardent. Le sac, ouvert, retourné, recompté devant toi. Les manches, relevées jusqu\'au coude. Le col, écarté. La lampe dans les yeux, sur la gorge, derrière les oreilles. Des doigts gantés palpent chaque pansement, et le plus vieux les défait un à un, sans s\'excuser, pour voir la couleur des plaies en dessous.\n\nIls cherchent des morsures. Tu connais la suite si on en trouve une — il n\'y a pas de suite.\n\n« Il est propre », dit enfin le vieux. Pas à toi. Au village entier, qui écoutait.',
    choix: [
      {
        label: 'Soutenir leur regard pendant toute la fouille',
        texte: 'Tu ne baisses pas les yeux, et tu laisses faire — les bras écartés, la mâchoire lâche, comme on rassure un chien de garde. Le vieux finit par hocher le menton, une fois, à peine.\n\n« Ça va. Lui, il a compris comment ça marche ici. »',
        suivant: 'ch2_intro_3',
      },
      {
        label: 'Vider ton sac toi-même, objet par objet',
        texte: 'Tu les devances : tout sur la table, en rangs, lentement, les mains bien visibles entre chaque geste. Le plus jeune des trois sourit malgré lui.\n\n« Un méthodique. Tant mieux. Les paniqués, en général, on les redescend. »',
        effets: { tempsMin: 10 },
        suivant: 'ch2_intro_3',
      },
    ],
  },

  // ---------- LA FEMME DE LA RADIO ----------
  ch2_intro_3: {
    illu: 'camp', musique: 'calme',
    texte: 'On te mène à la salle commune — l\'ancienne salle des fêtes, chaude de soupe et de respirations. Au fond, sous une antenne qui sort par le vasistas, une femme se lève de derrière un émetteur bricolé.\n\nElle parle, et c\'est un vertige : c\'est la voix. Celle de la radio à piles, chambre 203, en boucle dans le noir. « ...le village tient. Le Refuge accueille les survivants. » Tu l\'as écoutée respirer pendant des nuits. En vrai, elle est plus jeune que sa voix. Et plus fatiguée.\n\nElle te fait asseoir et te presse comme un citron : Salon, la gare, l\'état de la voie, ce qui marche, ce qui court, ce qui reste debout. Elle note tout, vite, d\'une écriture d\'infirmière. Puis elle te dévisage longtemps, comme si elle cherchait quelqu\'un d\'autre derrière tes yeux.\n\n« Tout le monde ici attend quelqu\'un. Moi comme les autres. Si tu as ramené quelque chose de Salon — un nom, un visage, n\'importe quoi — tu viendras me le dire. » Elle referme son cahier. « Bienvenue au Refuge. Tu verras, on ne promet rien. C\'est notre force. »',
    auto: { label: 'Suivre la femme de garde', suivant: 'ch2_intro_4' },
  },

  // ---------- LA COUCHETTE, ET LA DOUCHE FROIDE ----------
  ch2_intro_4: {
    illu: 'immeuble', musique: 'sombre',
    texte: 'Le dortoir : des couvertures pendues en cloisons, des rangées de matelas, l\'odeur de laine et de sommeil des autres. On te montre la couchette du fond — un matelas, une caisse, un clou pour ta veste. À toi.\n\nLa femme de garde te laisse avec le règlement, débité sur le ton des choses cent fois dites : « Tout le monde travaille. La citerne est presque à sec — pas de pluie depuis des semaines, alors l\'eau, c\'est deux gobelets par jour, et tu ne discutes pas. Le triage, en bas, grouille : on n\'y descend qu\'à deux minimum, et jamais après le coucher du soleil. Et si tu sors dans la garrigue... » Elle hésite, pour la première fois. « Les chasseurs ont trouvé des carcasses. Des brebis ouvertes proprement, mangées sur place. Pas par des morts — les morts ne mangent pas les bêtes. Y en a qui parlent de lions. Du parc de La Barben. Personne n\'a ri. »\n\nElle souffle la lampe. Autour de toi, des vivants respirent dans le noir.\n\nTu as survécu un jour de plus. Demain, il faudra recommencer — mais plus seul.',
    auto: { label: 'Dormir — demain commence le chapitre 2', suivant: '#chapitre2' },
  },
};
