// Ambiance « Garage Renault Sapas » — la halle d'atelier, 666 boulevard du Roy René.
// Intérieur : le rideau métallique entrouvert laisse tomber un rai de ciel oblique
// sur le béton taché ; la voiture attend sur le pont, la fosse mange le premier plan.
import { W, H, R, rng, dots, fenetre, halo, carcasse, voileNuit, neige } from '../ambiance_lib.js';

export default function (a) {
  const r = rng(666);
  let s = '';

  // La halle : parpaings peints, plafond technique où plus rien ne s'allume.
  s += `<rect width="${W}" height="${H}" fill="#0e0f14"/>`;
  s += `<rect width="${W}" height="46" fill="#0a0b0f"/>`;
  s += `<path d="M0 46H${W}M64 46v-9M168 46v-9M276 46v-9M388 46v-9M500 46v-9M620 46v-9M730 46v-9" stroke="#07080c" stroke-width="3" fill="none"/>`;

  // Le losange peint sur le mur, à demi effacé — la marque survit à la maison.
  s += `<path d="M214 52l30 18 -30 18 -30 -18zM214 60l17 10 -17 10 -17 -10z" fill="none" stroke="#c9a227" stroke-width="2" opacity="0.15"/>`;

  // Le panneau d'outillage : chaque clé à son ombre dessinée, certaines manquent.
  s += `<rect x="152" y="96" width="128" height="84" fill="#0c0d12"/>
    <rect x="152" y="96" width="128" height="84" fill="none" stroke="#08090d" stroke-width="2"/>
    <path d="M166 110v18M180 108v22M194 112v14M210 106v24M226 111v16M242 108v20M258 112v13" stroke="#060709" stroke-width="2.4" fill="none"/>`;
  // L'extincteur descellé, encore pendu de travers.
  s += `<g transform="rotate(8 298 168)"><rect x="294" y="156" width="9" height="21" rx="3.5" fill="#a31621" opacity="0.4"/><path d="M298 156v-5l4 -3" stroke="#0c0d12" stroke-width="2" fill="none"/></g>`;

  // Les néons, morts. Celui-là pend par une seule chaîne depuis le soir du jour 1.
  s += `<path d="M368 46v16M452 46v16" stroke="#14151b" stroke-width="1.6" fill="none"/>
    <rect x="356" y="62" width="108" height="7" fill="#13141a"/>
    <rect x="360" y="69" width="100" height="4" rx="2" fill="#1d1e26"/>`;
  s += `<g transform="rotate(27 120 46)"><path d="M120 46v12" stroke="#14151b" stroke-width="1.6" fill="none"/><rect x="116" y="58" width="86" height="6" fill="#13141a"/><rect x="120" y="64" width="78" height="3.5" rx="1.7" fill="#1d1e26"/></g>`;

  // Le béton : joints tirés vers la sectionnelle, taches d'huile anciennes.
  s += `<rect x="0" y="235" width="${W}" height="${H - 235}" fill="#13141a"/>`;
  let joints = '';
  for (let i = 0; i < 6; i++) joints += `M${R(i * 152 - 36)} ${H}L${R(i * 136 + 36)} 235`;
  s += `<path d="${joints}M0 264H${W}" stroke="#0c0d11" stroke-width="1.4" fill="none" opacity="0.7"/>`;
  s += `<ellipse cx="398" cy="248" rx="32" ry="5" fill="#08080b" opacity="0.8"/>
    <ellipse cx="612" cy="272" rx="46" ry="7" fill="#08080b" opacity="0.6"/>`;
  // La trace d'huile file vers la fosse, comme une flèche.
  s += `<path d="M560 244Q420 266 268 290l8 6Q432 274 566 250z" fill="#08080b" opacity="0.7"/>`;

  // Le rideau métallique, baissé presque jusqu'au sol. Presque.
  s += `<rect x="548" y="56" width="204" height="140" fill="#101117"/>`;
  let lames = '';
  for (let i = 0; i < 10; i++) lames += `M548 ${R(62 + i * 13.4)}h204`;
  s += `<path d="${lames}" stroke="#0a0b0f" stroke-width="2" fill="none"/>`;
  s += `<rect x="540" y="50" width="9" height="185" fill="#0c0d12"/><rect x="751" y="50" width="9" height="185" fill="#0c0d12"/>`;
  // Les hublots de la sectionnelle : deux colonnes de jour gris sur la halle.
  s += fenetre(a, 584, 86, 26, 30, 'h1');
  s += fenetre(a, 668, 86, 26, 30, 'h2', true);
  s += `<path d="M584 116L610 116L538 235L506 235Z" fill="${a.bas}" opacity="${R(0.05 * a.lum)}"/>
    <path d="M668 116L694 116L640 235L606 235Z" fill="${a.bas}" opacity="${R(0.04 * a.lum)}"/>`;
  // L'entrebâillement : le parking, les véhicules de courtoisie qui n'attendent plus personne.
  s += `<rect x="549" y="196" width="202" height="39" fill="${a.bas}"/>
    <rect x="549" y="226" width="202" height="9" fill="#0b0c11"/>
    <path d="M584 228q9 -11 18 0M652 227q10 -12 20 0" fill="#07080c"/>
    <rect x="548" y="190" width="204" height="8" fill="#0b0c10"/>`;
  // Le rai oblique s'écrase sur le béton, et renonce avant le fond de la halle.
  s += `<path d="M549 198L751 198L660 340L324 340Z" fill="${a.bas}" opacity="${R(0.11 * Math.max(0.15, a.lum))}"/>`;
  s += halo(a, 'rai', 540, 296, 250, 62, a.bas, R(0.16 * Math.max(0.18, a.lum)));
  // Quelqu'un est passé dessous en rampant. Dans un sens ou dans l'autre.
  s += `<path d="M572 238q46 10 88 6l-8 7q-40 2 -74 -7z" fill="#22080a" opacity="0.45"/>`;

  // Le pont élévateur : la voiture en l'air, capot ouvert sur un moteur à moitié démonté.
  s += `<rect x="306" y="76" width="190" height="7" fill="#13141a"/>
    <rect x="306" y="83" width="15" height="152" fill="#15161d"/>
    <rect x="481" y="83" width="15" height="152" fill="#15161d"/>
    <rect x="321" y="148" width="9" height="36" fill="#191a21"/>
    <rect x="472" y="148" width="9" height="36" fill="#191a21"/>
    <path d="M330 170l26 -8M472 170l-26 -8" stroke="#191a21" stroke-width="5" fill="none"/>`;
  s += carcasse(340, 156, 1.25, '#13141b', 20000);
  s += `<ellipse cx="436" cy="130" rx="12" ry="4" fill="#060709"/>
    <path d="M444 128l20 -19" stroke="#13141b" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M448 127l8 -12" stroke="#1d1e26" stroke-width="1.6" fill="none"/>`;
  // En dessous, la batterie de poids lourd sur son chariot — le cœur de rechange.
  s += `<path d="M376 226h44M376 226l-12 -16" stroke="#14151b" stroke-width="3" fill="none"/>
    <circle cx="382" cy="231" r="4" fill="#0b0c10"/><circle cx="414" cy="231" r="4" fill="#0b0c10"/>
    <rect x="382" y="207" width="34" height="19" rx="2" fill="#11121a"/>
    <path d="M388 207h.1M410 207h.1" stroke="#c9a227" stroke-width="3" stroke-linecap="round" opacity="0.5" fill="none"/>`;

  // Les pneus en colonnes — la réserve déborde jusque dans la halle.
  for (const [px, n, sy] of [[52, 6, 228], [104, 5, 230]]) {
    for (let i = 0; i < n; i++) {
      const ty = R(sy - i * 15);
      s += `<ellipse cx="${px}" cy="${ty}" rx="27" ry="9" fill="#0a0b10"/>
        <ellipse cx="${px}" cy="${R(ty - 2.5)}" rx="27" ry="9" fill="#101117"/>
        <ellipse cx="${px}" cy="${R(ty - 2.5)}" rx="11" ry="3.5" fill="#07080c"/>`;
    }
  }
  s += `<circle cx="148" cy="221" r="16" fill="#0c0d12"/><circle cx="148" cy="221" r="7" fill="#08090d"/>`;

  // Le fût d'huile contre le mur, et ce qu'il a laissé filer.
  s += `<rect x="252" y="190" width="40" height="45" rx="3" fill="#0f1016"/>
    <path d="M252 202h40M252 222h40" stroke="#0a0b0f" stroke-width="2" fill="none"/>
    <ellipse cx="272" cy="237" rx="26" ry="4" fill="#08080b" opacity="0.8"/>`;

  // La servante renversée : les tiroirs ont vomi leurs douilles sur le béton.
  s += `<rect x="296" y="280" width="58" height="32" rx="3" fill="#14151c"/>
    <path d="M312 280v32M330 280v32M346 280v32" stroke="#0c0d11" stroke-width="2" fill="none"/>
    <circle cx="358" cy="287" r="4" fill="#0a0b0f"/><circle cx="358" cy="305" r="4" fill="#0a0b0f"/>
    <rect x="356" y="300" width="22" height="9" fill="#101118"/>
    <path d="M384 314h16M392 310v8" stroke="#1c1d25" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const douilles = [];
  for (let i = 0; i < 9; i++) douilles.push([R(350 + r() * 70), R(294 + r() * 28)]);
  s += dots(douilles, 2.4, '#1c1d25', 0.9);
  // Le verre du néon tombé, en miettes sous sa chaîne.
  const verre = [];
  for (let i = 0; i < 6; i++) verre.push([R(190 + r() * 44), R(240 + r() * 14)]);
  s += dots(verre, 1.6, '#1d1e26', 0.7);

  // Les bidons près de la sectionnelle — un s'est couché, personne ne l'a relevé.
  s += `<g fill="#101118">
    <path d="M500 235v-24q0 -3 3 -3h16q3 0 3 3v24z"/>
    <path d="M526 235v-20q0 -3 3 -3h13q3 0 3 3v20z"/>
    <path d="M464 235l-2 -12q14 -8 24 -2l2 14z"/>
  </g>
  <path d="M505 211h12M530 215h9" stroke="#0a0b0f" stroke-width="2.5" fill="none"/>`;

  // La fosse de visite, au premier plan : quatre marches, deux doigts d'huile noire.
  s += `<rect x="64" y="288" width="200" height="${H - 288}" fill="#050507"/>
    <path d="M64 288h20v13h18v13h18v13h-56z" fill="#0b0c11"/>
    <ellipse cx="180" cy="334" rx="70" ry="4" fill="#020203"/>
    <path d="M58 288h212" stroke="#1f2029" stroke-width="2.5" fill="none"/>
    <path d="M58 285h212" stroke="#c9a227" stroke-width="2" opacity="0.12" fill="none"/>`;
  // La baladeuse éteinte pend dans le trou. Et le gant. Un seul gant.
  s += `<path d="M252 288q12 16 4 34" stroke="#16171d" stroke-width="1.6" fill="none"/>
    <ellipse cx="254" cy="326" rx="4" ry="6.5" fill="#0e0f14" stroke="#16171d" stroke-width="1.4"/>`;
  s += `<path d="M114 284q0 -5 4 -5t4 5l5 -3q3 2 0 5l-9 3q-6 0 -4 -5z" fill="#15161d"/>`;

  // Poussière en suspension dans le rai — la halle respire encore, à sa façon.
  if (a.lum > 0.3) s += neige(91, 14, R(0.11 * a.lum), 470, 745, 200, 318);

  // Une halle aveugle au-delà de l'entrebâillement : la pénombre tient le reste.
  s += voileNuit(a, 1.35);
  return s;
}
