// ============ OBJETS DE QUÊTE ET DE LORE (fusionnés dans ITEMS au chargement — REFONTE §11) ============
// Même format que js/data/items.js. type : 'quete' (sert à l'histoire, ne se jette pas) | 'lore' (souvenir, lisible).
// poids en kg, espace en cases. Les ids ne doivent pas entrer en collision avec items.js (vérifié par tools/verifier_histoire.mjs).
// Les objets de l'histoire qui se consomment (antibio_veto, jerrican_gasoil, foulard_mouille, masque_gaz, filtre_gaz, pain)
// sont dans items.js et clothing.js.
export const OBJETS_QUETE = {
  // ─── L'histoire (docs/HISTOIRE.md) ───
  enveloppe_helene: { nom: 'L’enveloppe d’Hélène', type: 'quete', poids: 0.02, espace: 0,
    desc: 'Une enveloppe blanche, épaisse, sur laquelle Hélène a écrit de sa petite écriture droite : À N’OUVRIR QUE SI LE REFUGE TOMBE. Dedans, on sent deux feuilles pliées en trois. Le jour où tu l’ouvres, elle reste dans ton sac, et la lettre aussi.' },

  // ─── Les clés et les plans du monde (utilisés par les plans de niveaux et le voyage) ───
  plan_salon: { nom: 'Plan de Salon-de-Provence', type: 'quete', poids: 0.05, espace: 0,
    desc: 'Un plan du centre-ville, celui que donne l’office de tourisme, en papier glacé, troué aux quatre coins par des punaises. Il montre la vieille ville et ses boulevards : la Tour de l’Horloge, la Fontaine Moussue, le château de l’Empéri sur son rocher, la maison de Nostradamus, la collégiale Saint-Laurent. Le cimetière Saint-Roch est tout en bas, au bord du papier. Au-delà des boulevards, il n’y a plus rien : ni la gare, ni l’hôpital, ni la base aérienne, ni les villages autour. Le reste, il faudra le découvrir sur place. Le gardien du cimetière l’a couvert de notes au stylo bille.' },
  cle_grille_saint_roch: { nom: 'Double de la clé de la grille', type: 'quete', poids: 0.1, espace: 0,
    desc: 'Une grosse clé de laiton, plus longue que ta main. À l’anneau pend une étiquette en carton : DOUBLE GRILLE — NE PAS DONNER. Le gardien du cimetière Saint-Roch l’avait cachée aux soldats, sur un clou, derrière le plan de Salon punaisé au mur de sa loge, et il l’avait attachée à son poignet par une ficelle de cuisine, dont un bout cassé pend encore à l’anneau. Elle ouvre la grille principale du cimetière.' },
  cle_sacristie: { nom: 'Clé de la sacristie', type: 'quete', poids: 0.1, espace: 0,
    desc: 'Une longue clé de fer ouvragée, avec une étiquette en carton : SACRISTIE. Elle pendait à la ceinture d’un prêtre mort, qui agitait encore sa clochette.' },
  cle_armoire_forte: { nom: 'Clé « A.F. — Armoire forte »', type: 'quete', poids: 0.05, espace: 0,
    desc: 'Une clé au bout d’une chaînette, prise au cou de l’officier de garde de la base aérienne 701. Elle ouvre l’armoire forte, le coffre où l’on rangeait les documents secrets.' },
};
