// Mouillé : la jauge monte sous la pluie (dehors, sans toit), sèche à l'abri et vite près d'un feu ;
// stades → froid, vitesse, souffle. Lancer : node dev/test_mouille.mjs
import { nouvellePartie, G } from '../js/core/state.js';
import * as player from '../js/game/player.js';
import * as surv from '../js/game/survival.js';
let ok = 0, ko = 0;
const verif = (c, m) => { if (c) { ok++; console.log('  ok   :', m); } else { ko++; console.log('  ÉCHEC:', m); } };
nouvellePartie({ nom: 'Sam', mode: 'solo', seed: 7 });
const p = G.player;
surv.setContexteSurvie({ exterieur: true, abrite: false, pluie: 1, meteo: 'pluie', feuProche: false });
const froid0 = surv.besoinChaleur(p), vit0 = player.modificateurs(p).vitesse;
surv.tickMinutes(20, 'normal');
surv.tickMinutes(15, 'normal');
verif(surv.stadeMouille(p) >= 2, `35 min sous une averse : mouillé (jauge ${Math.round(p.mouille)}, stade ${surv.stadeMouille(p)})`);
surv.tickMinutes(30, 'normal');
verif(surv.stadeMouille(p) >= 3, `65 min : trempé (jauge ${Math.round(p.mouille)})`);
verif(surv.besoinChaleur(p) > froid0, `trempé : il faut plus de chaleur (${froid0} → ${surv.besoinChaleur(p)})`);
verif(player.modificateurs(p).vitesse < vit0, `trempé : plus lent (${vit0} → ${player.modificateurs(p).vitesse.toFixed(2)})`);
verif(surv.etatsCorps(p).some(e => e.id === 'mouille'), 'l\'état « mouillé » s\'affiche');
// sous un toit : la pluie ne mouille plus, on sèche
surv.setContexteSurvie({ abrite: true });
const avant = p.mouille; surv.tickMinutes(30, 'normal');
verif(p.mouille < avant, `sous un toit : on sèche (${Math.round(avant)} → ${Math.round(p.mouille)})`);
// près d'un feu : beaucoup plus vite
surv.setContexteSurvie({ feuProche: true }); surv.tickMinutes(45, 'normal');
verif(p.mouille === 0 && surv.stadeMouille(p) === 0, `près du feu : sec (${Math.round(p.mouille)})`);
// imperméable : on se mouille bien moins vite
nouvellePartie({ nom: 'Sam', mode: 'solo', seed: 8 });
surv.setContexteSurvie({ exterieur: true, abrite: false, pluie: 1, feuProche: false });
G.player.equip.torse = 'poncho_pluie'; const impermeable = (await import('../js/game/inventory.js')).impermeable(G.player);
surv.tickMinutes(20, 'normal');
verif(impermeable && G.player.mouille < 8, `poncho de pluie : ${Math.round(G.player.mouille)} après 20 min`);
console.log(`\n${ok}/${ok + ko} vérifications réussies.`);
process.exit(ko ? 1 : 0);
