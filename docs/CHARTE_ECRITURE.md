# Charte d'écriture — passe de clarté (retour du joueur)

Le propriétaire du jeu a joué le début et trouve que les textes narratifs « ne sont pas du bon français » et
« pas compréhensibles ». On réécrit donc TOUS les textes affichés pour qu'ils soient en français correct,
clair et compréhensible du premier coup, sans perdre le ton adulte et sombre.

## Règles
1. **Français irréprochable** : orthographe, accords, conjugaison, ponctuation française (espaces fines avant
   ; : ! ? remplacées par des espaces normales, guillemets « », apostrophe ’). Aucun mot employé à contre-sens
   (ex. « avec une application terrible » → « avec une avidité terrible »). Aucune phrase bancale ou calquée de l'anglais.
2. **Compréhensible du premier coup** : un joueur qui lit une seule fois doit comprendre CE QUI SE PASSE, OÙ il est,
   QUI parle et CE QU'IL PEUT FAIRE. Si une scène est elliptique au point d'être obscure, ajoute la phrase qui manque.
3. **Phrases courtes** en action ; une idée par phrase. Évite les enchaînements de métaphores, les phrases nominales
   en série et les sous-entendus que seul l'auteur comprend.
4. **Pas de jargon non expliqué** : sigles (NRBC, URG, P4…), termes médicaux ou militaires → explique-les en
   quelques mots la première fois (« NRBC — le risque nucléaire, radiologique, biologique et chimique »), ou simplifie.
5. **Les informations clés de l'histoire sont dites clairement** au moins une fois (ce qui est arrivé, qui est Maud,
   ce que veut le joueur, le principe « un pour un », ce que veut le berger, ce que prépare l'armée). Le mystère peut rester,
   mais le joueur ne doit jamais être perdu sur ce qu'on attend de lui.
6. **Les libellés de choix** (`label`) sont des actions claires à l'infinitif ou à l'impératif, courtes (≤ 60 caractères),
   qui disent ce qu'on va faire (« Ouvrir la porte du caveau », pas « Le silence »).
7. **Objectifs de quête** (`objectif`) : une phrase d'action simple, avec le lieu (« Rejoindre la Tour de l'Horloge, place Crousillat »).
8. **On garde** : le ton adulte, la violence, le gore, le réel salonais, le tutoiement, la syntaxe `{masculin|féminin}`.

## Contraintes techniques (STRICTES)
- Ne modifie QUE les chaînes de texte affichées : `texte`, `label`, `titre`, `sousTitre`, `objectif`, `desc`, `nom`,
  `court`, `orateur`, `resume`, `journal` (dans les effets), et les champs texte des documents. Ne touche JAMAIS aux ids,
  clés, `suivant`, `si`, `besoin`, `effets` (sauf `journal`), `test`, structure, ni aux noms de fichiers.
- Garde les fichiers importables : `node --input-type=module -e "import('./js/data/histoire/scenes.js')"`, et
  `node tools/verifier_histoire.mjs` doit rester à 0 erreur (et `node tools/verifier_gameplay.mjs` pour rencontres_scenes.js).
- Attention aux apostrophes dans les chaînes entre '…' : utilise ’ (typographique) ou échappe \'.
