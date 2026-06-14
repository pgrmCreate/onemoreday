// ============ Créatures de combat — SVG autonomes (fond transparent) ============
// Généré pour la refonte du combat : chaque zombie est une image indépendante,
// centrée en x=0 et posée sur la ligne de sol (translate(150,346)), à incruster
// par-dessus le décor. Tous les ids SVG sont préfixés par le zid (paramètre p)
// pour cohabiter dans le DOM. Palette désaturée : chair morte, os, sang, braise.

export const CREATURES = {
  errant: zErrant,
  rampant: zRampant,
  coureur: zCoureur,
  enrage: zEnrage,
  gonfle: zGonfle,
  hurleur: zHurleur,
  putrefie: zPutrefie,
  chien_infecte: zChien,
  colosse: zColosse,
  brule: zBrule,
  nuee_rats: zNueeRats,
  traqueur: zTraqueur,
};

function zErrant(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.34" r="0.78"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-torse" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-jambeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0e13"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-jambeD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0e13"/><stop offset="0.5" stop-color="#101117"/><stop offset="1" stop-color="#14151b"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="74" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-30" cy="3" rx="20" ry="6" fill="#000" opacity="0.4"/>
<path d="M -8,-118 L -36,-74 L -50,-22 L -36,-6 L -22,-8 L -26,-30 L -10,-72 L 6,-112 Z" fill="url(#${p}-jambeG)"/>
<path d="M -44,-44 q -4,16 -2,26" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M -50,-22 q -8,4 -16,3 l 1,8 q 12,2 22,-3 Z" fill="#0d0e13"/>
<path d="M -36,-6 q -12,3 -22,2 l 1,7 l 30,-1 Z" fill="#0d0e13"/>
<path d="M -16,-96 q -3,10 -8,18" stroke="#a31621" stroke-width="2" fill="none" opacity="0.45"/>
<path d="M 6,-120 L 30,-78 L 40,-26 L 38,-6 L 18,-6 L 16,-28 L 8,-74 L -6,-112 Z" fill="url(#${p}-jambeD)"/>
<path d="M 26,-58 q 6,18 4,34" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M 38,-6 l 22,2 l -1,7 l -24,0 Z" fill="#0d0e13"/>
<path d="M 18,-6 l -8,2 l 0,6 l 12,-1 Z" fill="#0d0e13"/>
<path d="M 22,-70 l 12,8 l -3,9 l -12,-7 Z" fill="#0d0e13" opacity="0.8"/>
<path d="M -28,-122 Q -42,-168 -26,-198 L 30,-202 Q 46,-166 34,-120 Q 22,-110 0,-112 Q -16,-110 -28,-122 Z" fill="url(#${p}-torse)"/>
<path d="M -24,-128 Q -34,-166 -22,-194 L -12,-196 Q -22,-164 -14,-126 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -26,-192 Q -2,-204 30,-198 L 27,-184 Q -2,-192 -24,-180 Z" fill="#0d0e13"/>
<path d="M -8,-176 q 14,5 24,1 M -9,-164 q 14,5 25,1 M -10,-152 q 13,6 24,1 M -12,-138 q 14,6 26,1" stroke="#17161c" stroke-width="2.2" fill="none" opacity="0.85"/>
<path d="M 30,-160 L 40,-150 L 30,-138 L 38,-126 L 28,-116 L 36,-104" stroke="#0d0e13" stroke-width="3" fill="none"/>
<path d="M -26,-150 l -8,10 l 8,4 l -4,12 l 7,2" stroke="#0d0e13" stroke-width="2.6" fill="none"/>
<path d="M 12,-118 q 4,12 -2,22 l 7,-2 q 5,-10 1,-20 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -2,-130 q 3,18 -1,40 q -1,6 3,5 q 4,-2 3,-14 q 2,-18 -1,-32 Z" fill="#a31621" opacity="0.4"/>
<path d="M 8,-150 q 2,10 -1,20" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.4"/>
<ellipse cx="28" cy="-188" rx="13" ry="11" fill="url(#${p}-torse)"/>
<path d="M 30,-184 Q 52,-178 56,-156 Q 58,-138 44,-130 Q 56,-126 60,-110 Q 62,-96 54,-86" stroke="url(#${p}-bras)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 50,-150 l 9,-3 l 2,6 l -8,4 Z" fill="url(#${p}-os)"/>
<path d="M 53,-149 l 5,-1" stroke="#0d0e13" stroke-width="1" opacity="0.6"/>
<path d="M 44,-132 q 8,-2 12,2" stroke="#a31621" stroke-width="3" fill="none" opacity="0.85"/>
<path d="M 54,-86 l -2,12 M 54,-86 l 6,11 M 54,-86 l 11,6 M 54,-86 l 11,-3 M 54,-86 l 7,-9" stroke="url(#${p}-bras)" stroke-width="3.2" stroke-linecap="round"/>
<path d="M 65,-80 l 2,4 M 65,-83 l 3,1" stroke="#0d0e13" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="-24" cy="-186" rx="12" ry="10" fill="url(#${p}-torse)"/>
<path d="M -26,-182 L -46,-150 L -42,-120 L -50,-92" stroke="url(#${p}-bras)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="miter"/>
<path d="M -44,-146 q 5,4 4,12" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -50,-92 l -6,9 M -50,-92 l 1,12 M -50,-92 l 8,9 M -50,-92 l 10,2" stroke="url(#${p}-bras)" stroke-width="2.8" stroke-linecap="round"/>
<path d="M -10,-198 L -14,-214 L 12,-218 L 14,-200 Z" fill="#14151b"/>
<path d="M -10,-208 q 12,4 22,-1" stroke="#17161c" stroke-width="2" fill="none" opacity="0.8"/>
<g transform="rotate(10 0 -220)">
<path d="M -16,-218 Q -24,-248 -2,-256 Q 22,-252 20,-224 Q 19,-214 8,-210 L -6,-212 Q -16,-214 -16,-218 Z" fill="url(#${p}-crane)"/>
<path d="M -14,-222 Q -20,-244 -4,-252 L 0,-250 Q -14,-242 -10,-220 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -12,-228 q 10,-4 22,-1" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -10,-216 q 6,5 12,4" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M 12,-224 q 6,2 6,8 q -4,3 -9,1 Z" fill="url(#${p}-os)" opacity="0.55"/>
<path d="M -7,-210 Q -5,-204 4,-203 L 4,-209 Q -2,-209 -7,-211 Z" fill="#0d0e13"/>
<path d="M -6,-208 l 2,4 l 2,-3 l 2,4 l 2,-3" stroke="#8f8876" stroke-width="1.3" fill="none"/>
<path d="M -6,-204 Q -10,-188 -3,-178 Q 6,-176 10,-186 Q 11,-196 6,-202 L 0,-203 Q -3,-203 -6,-204 Z" fill="url(#${p}-crane)"/>
<path d="M -4,-200 Q -7,-188 -1,-181 Q 5,-180 8,-187 Q 8,-194 4,-198 Z" fill="#0d0e13"/>
<path d="M -3,-198 l 2,3 l 2,-2 l 2,3 l 2,-2" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.85"/>
<path d="M -6,-205 q -3,8 -2,18" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M 7,-203 q 3,7 2,16" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.8"/>
<path d="M 0,-204 q 0,9 -1,22" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M 3,-180 q 1,6 -1,11" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -10,-250 q -4,-6 -1,-12 M -2,-254 q -1,-7 3,-12 M 8,-250 q 4,-6 2,-12" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.7"/>
<circle cx="-7" cy="-234" r="7" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-234" r="2.3" fill="#d6303e"/>
<circle cx="-7.8" cy="-234.8" r="0.9" fill="#e8868d"/>
<circle cx="8" cy="-232" r="7" fill="url(#${p}-eye)"/>
<circle cx="8" cy="-232" r="2.3" fill="#d6303e"/>
<circle cx="7.2" cy="-232.8" r="0.9" fill="#e8868d"/>
</g>
</g>`;
}

function zRampant(p) { return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.42" cy="0.34" r="0.82"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0c0d12"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.3" r="0.78"><stop offset="0" stop-color="#22202a"/><stop offset="0.55" stop-color="#15161c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stop-color="#1b1a22"/><stop offset="1" stop-color="#101117"/></linearGradient>
<linearGradient id="${p}-os" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></linearGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#a31621"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<linearGradient id="${p}-trace" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d0b12" stop-opacity="0"/><stop offset="0.45" stop-color="#5e0e16" stop-opacity="0.75"/><stop offset="1" stop-color="#a31621" stop-opacity="0.9"/></linearGradient>
</defs>
<ellipse cx="0" cy="2" rx="132" ry="11" fill="#000" opacity="0.5"/>
<path d="M -148,-2 Q -60,-16 30,-12 Q 80,-10 108,-6 L 108,8 Q 70,2 20,2 Q -70,-2 -148,10 Z" fill="url(#${p}-trace)" opacity="0.85"/>
<path d="M -140,-4 Q -70,-12 10,-9" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M -120,4 Q -50,-2 30,0" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.45"/>
<path d="M 40,-6 Q 20,8 -4,5 Q -22,3 -36,8 Q -52,8 -70,8" stroke="#2a0d12" stroke-width="6" fill="none" opacity="0.8"/>
<path d="M 30,-10 q -14,9 -30,6 q -12,-2 -24,4" stroke="#3d1218" stroke-width="3.4" fill="none" opacity="0.7"/>
<path d="M 44,-16 Q 36,-40 48,-58 Q 56,-72 78,-74 Q 96,-72 100,-56 Q 102,-42 92,-30 Q 80,-18 60,-16 Z" fill="url(#${p}-torse)"/>
<path d="M 46,-20 Q 40,-44 50,-60 Q 44,-44 50,-22 Z" fill="#0a0b10" opacity="0.7"/>
<path d="M 56,-66 q 16,-3 30,4 M 54,-56 q 18,-4 34,3 M 56,-44 q 16,-2 30,5" stroke="#26272f" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 42,-14 Q 30,-22 24,-16 Q 30,-6 44,-12 Z" fill="#2a0d12"/>
<path d="M 40,-18 Q 30,-26 22,-22 L 26,-30 Q 34,-30 42,-22 Z" fill="url(#${p}-sang)" opacity="0.9"/>
<path d="M 28,-26 q -2,8 2,14 M 36,-24 q -1,7 3,13" stroke="#7a1018" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M 30,-30 l 2,-7 l 5,5 l 4,-7 l 4,7" stroke="url(#${p}-os)" stroke-width="2.2" fill="none"/>
<ellipse cx="38" cy="-26" rx="3" ry="2.4" fill="#5e0e16"/>
<path d="M 50,-58 L 32,-46 L 18,-30" stroke="url(#${p}-bras)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 50,-58 L 34,-47" stroke="#23222c" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="0.6"/>
<path d="M 18,-30 q -10,5 -16,12" stroke="url(#${p}-bras)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 2,-18 l -14,7 M 2,-18 l -13,11 M 2,-18 l -8,15 M 2,-18 l -1,16" stroke="url(#${p}-os)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<path d="M -12,-11 l -8,4 M -11,-7 l -7,7" stroke="#0c0d12" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M 74,-52 L 96,-34 L 116,-18" stroke="url(#${p}-bras)" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 74,-52 L 94,-36" stroke="#24232d" stroke-width="3.6" fill="none" stroke-linecap="round" opacity="0.55"/>
<path d="M 96,-34 q 12,7 20,16" stroke="url(#${p}-bras)" stroke-width="9.5" fill="none" stroke-linecap="round"/>
<path d="M 116,-18 l 16,1 M 116,-18 l 15,7 M 116,-18 l 11,12 M 116,-18 l 5,15 M 116,-18 l -2,15" stroke="url(#${p}-os)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
<path d="M 132,-17 l 3,2 M 131,-11 l 3,2 M 127,-6 l 3,2" stroke="#0c0d12" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M 100,-26 q 4,6 4,14" stroke="#3d1218" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 70,-72 Q 60,-96 76,-104 Q 96,-108 102,-90 Q 104,-76 92,-68 Q 80,-62 70,-72 Z" fill="url(#${p}-crane)"/>
<path d="M 72,-74 Q 64,-92 76,-100 Q 66,-90 72,-72 Z" fill="#0b0c11" opacity="0.7"/>
<path d="M 78,-66 Q 78,-52 88,-50 Q 98,-52 98,-66 L 90,-62 Q 82,-62 78,-66 Z" fill="#0e0f14"/>
<path d="M 80,-63 q 6,4 14,1" stroke="url(#${p}-os)" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M 80,-63 l 2,5 l 3,-4 l 3,5 l 3,-4 l 3,4" stroke="url(#${p}-os)" stroke-width="1.5" fill="none" opacity="0.7"/>
<path d="M 84,-50 q 1,7 -2,12" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M 72,-90 q 10,-5 22,-2 M 70,-82 q 12,-4 24,-1" stroke="#26272f" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M 88,-96 q 6,-4 12,-2" stroke="#3d1218" stroke-width="2.2" fill="none" opacity="0.6"/>
<circle cx="74" cy="-86" r="2.4" fill="#8f8876" opacity="0.7"/>
<circle cx="76" cy="-78" r="7" fill="url(#${p}-eye)"/>
<circle cx="76" cy="-78" r="2.3" fill="#d6303e"/>
<circle cx="75.2" cy="-78.8" r="0.9" fill="#e8868d"/>
<circle cx="90" cy="-76" r="7" fill="url(#${p}-eye)"/>
<circle cx="90" cy="-76" r="2.3" fill="#d6303e"/>
<circle cx="89.2" cy="-76.8" r="0.9" fill="#e8868d"/>
</g>`; }

function zCoureur(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-hood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-torse" x1="0.2" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-jean" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-bouche" cx="0.5" cy="0.4" r="0.65"><stop offset="0" stop-color="#7a2410"/><stop offset="0.55" stop-color="#a31621"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-chair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#101117"/></linearGradient>
</defs>
<ellipse cx="0" cy="2" rx="86" ry="11" fill="#000" opacity="0.5"/>
<path d="M -36,-4 q 38,-12 78,-3" stroke="#44505a" stroke-width="5" opacity="0.18" fill="none"/>
<path d="M 30,-2 q 26,-10 54,-2" stroke="#44505a" stroke-width="4" opacity="0.14" fill="none"/>
<path d="M -58,-128 L -86,-86 L -98,-44 L -82,-38 L -74,-78 L -46,-116 Z" fill="url(#${p}-jean)"/>
<path d="M -82,-40 l -20,4 l 1,9 l 22,-2 Z" fill="#0d0e13"/>
<path d="M -82,-40 q 10,3 18,1" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -54,-94 q -10,18 -14,40" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -26,-130 L 18,-104 L 60,-70 L 92,-26 L 78,-16 L 44,-58 L 6,-92 L -36,-120 Z" fill="url(#${p}-jean)"/>
<path d="M 78,-18 l 22,8 l -4,10 l -22,-7 Z" fill="#0d0e13"/>
<path d="M 78,-18 q 10,5 18,4" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -10,-118 q 30,22 64,50" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M 40,-66 l 14,12 l 8,-7 l -13,-12 Z" fill="#101117" opacity="0.8"/>
<path d="M -50,-138 Q -64,-180 -44,-214 Q -14,-236 26,-228 Q 56,-220 56,-184 Q 54,-150 40,-128 L 22,-138 L 8,-124 L -10,-140 L -26,-124 L -40,-136 Z" fill="url(#${p}-torse)"/>
<path d="M -44,-210 Q -10,-228 24,-222 L 14,-204 Q -14,-216 -38,-200 Z" fill="url(#${p}-hood)"/>
<path d="M -42,-204 Q -8,-220 22,-214 L 18,-208 Q -10,-220 -38,-200 Z" fill="#0d0e13" opacity="0.8"/>
<path d="M -8,-176 q 4,40 -2,64 M -10,-174 q -3,40 -8,60" stroke="#0d0e13" stroke-width="3.5" fill="none" opacity="0.75"/>
<path d="M -34,-170 q 16,8 30,4 M -33,-156 q 16,8 31,4 M -32,-142 q 15,8 29,3" stroke="#17161c" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M -26,-120 L -4,-118 l -2,10 l -22,-2 Z" fill="#0d0e13"/>
<path d="M 38,-156 q 12,4 12,18 q -10,4 -18,-6 Z" fill="url(#${p}-chair)"/>
<path d="M 40,-150 q 6,4 5,12" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M 38,-156 q 7,1 11,7" stroke="#8f8876" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -44,-200 L -78,-168 L -106,-128 L -118,-92" stroke="url(#${p}-chair)" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M -78,-168 l -4,-12 M -106,-128 l 10,-6" stroke="#0d0e13" stroke-width="2" opacity="0.6"/>
<path d="M -118,-94 q -8,4 -14,0" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -118,-92 l -16,-6 M -118,-92 l -15,4 M -118,-92 l -9,13 M -118,-92 l 0,16 M -118,-92 l 9,12" stroke="url(#${p}-chair)" stroke-width="3.4" stroke-linecap="round"/>
<path d="M -134,-98 l 6,3 M -133,-88 l 6,2" stroke="#8f8876" stroke-width="1.5" opacity="0.7" stroke-linecap="round"/>
<path d="M 44,-198 L 80,-176 L 104,-138 L 116,-100" stroke="url(#${p}-chair)" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M 80,-176 l 6,-11 M 104,-138 l -10,-5" stroke="#0d0e13" stroke-width="2" opacity="0.6"/>
<path d="M 116,-100 l 16,-6 M 116,-100 l 15,5 M 116,-100 l 8,14 M 116,-100 l -2,16 M 116,-100 l -10,12" stroke="url(#${p}-chair)" stroke-width="3.4" stroke-linecap="round"/>
<path d="M 132,-106 l -6,3 M 131,-95 l -6,2" stroke="#8f8876" stroke-width="1.5" opacity="0.7" stroke-linecap="round"/>
<path d="M 92,-150 q 10,6 8,18" stroke="#a31621" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -22,-214 Q -28,-244 -2,-252 Q 26,-248 22,-216 Q 18,-200 0,-198 Q -16,-200 -22,-214 Z" fill="url(#${p}-crane)"/>
<path d="M -20,-228 Q -2,-238 18,-230 Q 14,-220 0,-220 Q -12,-222 -20,-228 Z" fill="#17161c" opacity="0.5"/>
<path d="M -18,-218 q 10,-3 14,4 M 6,-222 q 8,-2 12,4" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -14,-208 Q -10,-186 4,-182 Q 18,-186 16,-208 L 4,-204 Q -6,-204 -14,-208 Z" fill="url(#${p}-bouche)"/>
<path d="M -12,-206 l 3,5 l 3,-4 l 3,5 l 3,-4 l 4,5 l 3,-4" stroke="#b3ac96" stroke-width="1.5" fill="none"/>
<path d="M -9,-188 l 3,-5 l 3,5 l 3,-5 l 4,5 l 3,-5" stroke="#8f8876" stroke-width="1.4" fill="none"/>
<path d="M -14,-208 q -3,12 0,24 M 16,-208 q 3,12 0,24" stroke="#a31621" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 4,-182 q 1,12 -1,20" stroke="#a31621" stroke-width="2" opacity="0.7" fill="none"/>
<path d="M -16,-216 q 6,-4 14,-3 M 6,-218 q 8,-1 12,3" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 18,-210 q 6,12 3,26" stroke="#a31621" stroke-width="2.4" opacity="0.65" fill="none"/>
<circle cx="-9" cy="-226" r="7" fill="url(#${p}-eye)"/>
<circle cx="-9" cy="-226" r="2.3" fill="#d6303e"/>
<circle cx="-9.8" cy="-226.8" r="0.9" fill="#e8868d"/>
<circle cx="11" cy="-225" r="7" fill="url(#${p}-eye)"/>
<circle cx="11" cy="-225" r="2.3" fill="#d6303e"/>
<circle cx="10.2" cy="-225.8" r="0.9" fill="#e8868d"/>
</g>`;
}

function zEnrage(p) { return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.42" cy="0.32" r="0.85"><stop offset="0" stop-color="#1b1a22"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0c0d12"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.65" stop-color="#16151c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#1a1920"/><stop offset="0.55" stop-color="#141319"/><stop offset="1" stop-color="#0e0f14"/></linearGradient>
<linearGradient id="${p}-jambe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#181820"/><stop offset="1" stop-color="#0b0c11"/></linearGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#d6303e"/><stop offset="0.55" stop-color="#a31621"/><stop offset="1" stop-color="#5e1118"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="104" ry="11" fill="#000" opacity="0.5"/>
<path d="M -78,-4 l 30,-7 M -72,3 l 28,-6 M 48,-9 l 30,5 M 44,-2 l 30,4" stroke="#1d2027" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
<path d="M -86,-58 Q -100,-44 -98,-22 L -84,-22 L -82,-44 L -64,-58 Z" fill="url(#${p}-jambe)"/>
<path d="M -98,-22 q -2,12 4,18 l 18,-1 l 2,-8 q -12,-2 -24,-9 Z" fill="#0c0d11"/>
<path d="M -96,-6 l -16,3 l 2,7 l 18,-2 Z" fill="#0a0a0e"/>
<path d="M 64,-58 Q 96,-46 100,-22 L 84,-22 L 78,-44 L 50,-58 Z" fill="url(#${p}-jambe)"/>
<path d="M 100,-22 q 4,12 -2,18 l -18,-1 l -2,-8 q 12,-2 22,-9 Z" fill="#0c0d11"/>
<path d="M 98,-6 l 16,3 l -2,7 l -18,-2 Z" fill="#0a0a0e"/>
<path d="M -68,-58 Q -54,-78 -34,-86 L 38,-88 Q 60,-80 70,-58 L 60,-40 Q 30,-52 0,-50 Q -34,-50 -60,-40 Z" fill="url(#${p}-jambe)"/>
<path d="M -58,-110 Q -76,-156 -52,-194 Q -28,-220 4,-220 Q 40,-218 58,-188 Q 76,-152 56,-108 Q 40,-78 0,-74 Q -38,-78 -58,-110 Z" fill="url(#${p}-torse)"/>
<path d="M -50,-186 Q -28,-204 4,-204 Q 36,-202 52,-180 Q 38,-192 4,-192 Q -28,-194 -50,-186 Z" fill="#1f1e27" opacity="0.7"/>
<path d="M 2,-200 Q 6,-150 0,-92" stroke="#0a0b0f" stroke-width="3.5" opacity="0.7" fill="none"/>
<path d="M -26,-198 q 4,40 -2,86 M 30,-196 q -4,42 2,88" stroke="#0c0d12" stroke-width="2.4" opacity="0.55" fill="none"/>
<path d="M -44,-176 L -40,-132 M -36,-184 L -30,-128 M 36,-180 L 30,-128 M 44,-170 L 38,-124" stroke="#22212a" stroke-width="2" opacity="0.4" fill="none"/>
<path d="M -40,-170 L -8,-118 M -24,-176 L 6,-120 M -4,-182 L 22,-122 M 18,-178 L 36,-130 M -34,-148 L -10,-104 M 22,-150 L 40,-108" stroke="url(#${p}-sang)" stroke-width="2.2" opacity="0.85" stroke-linecap="round" fill="none"/>
<path d="M -38,-168 q 6,8 4,18 q -2,8 6,12 M 16,-180 q 8,6 6,16 q -2,9 5,13" stroke="#a31621" stroke-width="3" opacity="0.7" fill="none" stroke-linecap="round"/>
<path d="M -10,-150 q 14,4 26,-2 q -8,10 -22,8 q -8,-2 -4,-6 Z" fill="#7a2410" opacity="0.6"/>
<path d="M -8,-150 q 12,3 22,-2 l 2,4 q -10,5 -22,2 Z" fill="url(#${p}-sang)"/>
<path d="M -6,-144 q 2,16 0,30 M 4,-146 q 3,14 1,26 M 12,-142 q 2,12 0,22" stroke="#a31621" stroke-width="1.8" opacity="0.7" fill="none" stroke-linecap="round"/>
<path d="M -54,-178 L -98,-150 L -132,-110" stroke="url(#${p}-bras)" stroke-width="15" fill="none" stroke-linecap="round"/>
<path d="M -98,-150 q -10,-4 -16,2 M -54,-178 q -8,-8 -18,-4" stroke="#0c0d12" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M -132,-110 l -16,-6 q -3,3 0,6 l 14,8 Z M -132,-110 l -14,4 q -2,5 2,7 l 12,-1 Z M -132,-110 l -8,14 q 2,4 6,2 l 4,-10 Z M -132,-110 l 1,16 q 4,2 6,-2 l -1,-12 Z" fill="url(#${p}-bras)"/>
<path d="M -147,-115 l -3,-3 M -145,-105 l -4,1 M -139,-95 l -3,7" stroke="#8f8876" stroke-width="1.6" opacity="0.7" stroke-linecap="round"/>
<path d="M -110,-138 l 8,10 M -120,-126 l 8,10" stroke="#a31621" stroke-width="1.6" opacity="0.7" stroke-linecap="round"/>
<path d="M 54,-176 L 100,-150 L 134,-108" stroke="url(#${p}-bras)" stroke-width="15" fill="none" stroke-linecap="round"/>
<path d="M 100,-150 q 10,-4 16,2 M 54,-176 q 8,-8 18,-4" stroke="#0c0d12" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M 134,-108 l 16,-6 q 3,3 0,6 l -14,8 Z M 134,-108 l 14,4 q 2,5 -2,7 l -12,-1 Z M 134,-108 l 8,14 q -2,4 -6,2 l -4,-10 Z M 134,-108 l -1,16 q -4,2 -6,-2 l 1,-12 Z" fill="url(#${p}-bras)"/>
<path d="M 149,-113 l 1,-3 M 147,-103 l 3,1 M 141,-93 l 3,7" stroke="#8f8876" stroke-width="1.6" opacity="0.7" stroke-linecap="round"/>
<path d="M 112,-136 l -8,10 M 122,-124 l -8,10" stroke="#a31621" stroke-width="1.6" opacity="0.7" stroke-linecap="round"/>
<path d="M -22,-198 L -14,-214 L 16,-214 L 22,-198 Z" fill="url(#${p}-crane)"/>
<path d="M -28,-224 Q -36,-258 -6,-268 Q 28,-264 30,-228 Q 30,-208 12,-202 L -10,-204 Q -26,-208 -28,-224 Z" fill="url(#${p}-crane)"/>
<path d="M -22,-258 Q -4,-266 22,-256 Q 8,-262 -6,-262 Q -16,-262 -22,-258 Z" fill="#221f29" opacity="0.7"/>
<path d="M -24,-228 q -6,8 -2,18 M 26,-230 q 6,8 0,18" stroke="#0a0b0f" stroke-width="3" opacity="0.6" fill="none"/>
<path d="M -18,-214 Q -16,-198 -2,-194 Q 14,-196 16,-212 L 4,-206 Q -8,-206 -18,-214 Z" fill="#08080c"/>
<path d="M -16,-212 l 4,7 l 4,-6 l 4,7 l 4,-6 l 5,6 l 4,-6" stroke="#b3ac96" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M -13,-199 l 4,-6 l 4,6 l 4,-6 l 5,6 l 4,-6" stroke="#9a9484" stroke-width="1.7" fill="none" stroke-linecap="round"/>
<path d="M -22,-240 q 10,-6 18,0 M 8,-240 q 10,-6 18,2" stroke="#0a0b0f" stroke-width="2.4" opacity="0.7" fill="none"/>
<path d="M -10,-258 l 6,12 M 0,-260 l 6,12 M 10,-258 l 5,11" stroke="#a31621" stroke-width="1.6" opacity="0.8" stroke-linecap="round"/>
<path d="M 18,-236 q 10,4 16,12 q 2,4 -2,4 l -10,-6 Z" fill="#8f8876" opacity="0.65"/>
<path d="M -28,-220 q -4,18 -2,30" stroke="#a31621" stroke-width="2.4" opacity="0.6" fill="none" stroke-linecap="round"/>
<circle cx="-10" cy="-228" r="7" fill="url(#${p}-eye)"/>
<circle cx="-10" cy="-228" r="2.3" fill="#d6303e"/>
<circle cx="-11" cy="-229" r="0.9" fill="#e8868d"/>
<circle cx="12" cy="-227" r="7" fill="url(#${p}-eye)"/>
<circle cx="12" cy="-227" r="2.3" fill="#d6303e"/>
<circle cx="11" cy="-228" r="0.9" fill="#e8868d"/>
<path d="M 0,-194 q 3,12 0,22 M 8,-194 q 3,10 1,18" stroke="#a31621" stroke-width="1.8" opacity="0.65" fill="none" stroke-linecap="round"/>
</g>`; }

function zGonfle(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.34" r="0.82"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.5" stop-color="#2a3326"/><stop offset="0.82" stop-color="#17161c"/><stop offset="1" stop-color="#101117"/></radialGradient>
<radialGradient id="${p}-bas" cx="0.5" cy="0.62" r="0.7"><stop offset="0" stop-color="#2a3326"/><stop offset="0.7" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-cloque" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#3d4a36" stop-opacity="0.95"/><stop offset="0.55" stop-color="#2a3326"/><stop offset="1" stop-color="#14151b" stop-opacity="0.9"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.42" cy="0.34" r="0.72"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.6" stop-color="#2a3326"/><stop offset="1" stop-color="#101117"/></radialGradient>
<linearGradient id="${p}-membre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a3326"/><stop offset="0.5" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-fluide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.6" stop-color="#2a3326"/><stop offset="1" stop-color="#101117"/></linearGradient>
</defs>
<ellipse cx="0" cy="2" rx="92" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="2" cy="-2" rx="58" ry="7" fill="#0d0e13" opacity="0.8"/>
<path d="M -30,-72 L -42,-30 L -34,-3 L -16,-3 L -22,-30 L -16,-66 Z" fill="url(#${p}-membre)"/>
<path d="M -42,-30 q -6,14 -3,27 l 8,0 q -3,-13 1,-26 Z" fill="#101117" opacity="0.7"/>
<path d="M -42,-3 l -16,2 l 2,7 l 18,-1 Z" fill="#0d0e13"/>
<path d="M -36,-1 l 4,9 M -28,-1 l 2,9 M -20,-1 l -1,9" stroke="#0d0e13" stroke-width="1.6"/>
<path d="M 30,-72 L 44,-30 L 36,-3 L 18,-3 L 22,-30 L 16,-66 Z" fill="url(#${p}-membre)"/>
<path d="M 44,-30 q 6,14 2,27 l -8,0 q 3,-13 0,-26 Z" fill="#101117" opacity="0.7"/>
<path d="M 44,-3 l 16,2 l -2,7 l -18,-1 Z" fill="#0d0e13"/>
<path d="M 38,-1 l -3,9 M 30,-1 l -1,9 M 22,-1 l 1,9" stroke="#0d0e13" stroke-width="1.6"/>
<path d="M -64,-120 L -90,-100 L -98,-72" stroke="url(#${p}-membre)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -90,-100 l -4,16 M -78,-110 l -3,12" stroke="#101117" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
<path d="M -98,-72 l -8,5 M -98,-72 l -2,10 M -98,-72 l 6,9 M -98,-72 l -10,-3" stroke="url(#${p}-membre)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 66,-118 L 92,-98 L 100,-70" stroke="url(#${p}-membre)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 92,-98 l 4,16 M 80,-108 l 3,12" stroke="#101117" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
<path d="M 100,-70 l 8,5 M 100,-70 l 2,10 M 100,-70 l -6,9 M 100,-70 l 10,-3" stroke="url(#${p}-membre)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 0,-30 Q -92,-34 -94,-118 Q -90,-186 -2,-194 Q 88,-188 94,-116 Q 92,-32 0,-30 Z" fill="url(#${p}-torse)"/>
<path d="M -40,-200 Q 0,-176 42,-202 Q 30,-216 0,-216 Q -28,-216 -40,-200 Z" fill="url(#${p}-bas)"/>
<path d="M -88,-150 Q -50,-138 -6,-148 Q 40,-156 86,-142" stroke="#101117" stroke-width="2.6" fill="none" opacity="0.85"/>
<path d="M -90,-110 Q -48,-96 0,-104 Q 48,-112 90,-100" stroke="#101117" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M -84,-70 Q -44,-58 0,-66 Q 46,-74 84,-62" stroke="#101117" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -46,-188 Q -36,-152 -42,-112 Q -46,-74 -38,-44" stroke="#101117" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M 50,-186 Q 42,-150 48,-110 Q 52,-72 42,-44" stroke="#101117" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -40,-178 Q -8,-200 36,-184 Q 20,-150 -4,-156 Q -28,-160 -40,-178 Z" fill="#3d4a36" opacity="0.55"/>
<path d="M 28,-150 Q 64,-150 72,-118 Q 58,-100 36,-110 Q 22,-130 28,-150 Z" fill="url(#${p}-cloque)"/>
<path d="M 32,-146 q 28,0 36,28" stroke="#3d4a36" stroke-width="1.6" fill="none" opacity="0.55"/>
<ellipse cx="50" cy="-126" rx="6" ry="4" fill="#3d4a36" opacity="0.6"/>
<path d="M -64,-128 Q -34,-130 -28,-100 Q -40,-82 -58,-92 Q -72,-110 -64,-128 Z" fill="url(#${p}-cloque)"/>
<ellipse cx="-50" cy="-112" rx="5" ry="3.4" fill="#3d4a36" opacity="0.6"/>
<path d="M -22,-72 Q 4,-58 30,-70 Q 28,-46 2,-44 Q -22,-48 -22,-72 Z" fill="url(#${p}-cloque)"/>
<ellipse cx="2" cy="-60" rx="7" ry="4.4" fill="#3d4a36" opacity="0.55"/>
<ellipse cx="-12" cy="-160" rx="9" ry="6" fill="#2a3326"/><circle cx="-15" cy="-162" r="2.2" fill="#3d4a36"/>
<ellipse cx="22" cy="-186" rx="7" ry="5" fill="#2a3326"/><circle cx="20" cy="-188" r="1.8" fill="#3d4a36"/>
<ellipse cx="-66" cy="-160" rx="6" ry="4" fill="#2a3326"/>
<ellipse cx="70" cy="-160" rx="6" ry="4.6" fill="#2a3326"/><circle cx="68" cy="-162" r="1.6" fill="#3d4a36"/>
<path d="M 0,-30 Q -22,-26 -34,-12 Q -28,-40 0,-34 Q 28,-40 36,-12 Q 22,-26 0,-30 Z" fill="#101117" opacity="0.8"/>
<path d="M -78,-118 Q -88,-110 -88,-96" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.45"/>
<path d="M 60,-92 q 6,16 2,34 q -2,9 4,8 q 5,-3 3,-15 q 0,-16 -4,-28 Z" fill="url(#${p}-fluide)" opacity="0.9"/>
<path d="M 64,-90 q 4,14 1,30" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -30,-50 q 4,18 -1,38 q -1,8 4,7 q 5,-3 2,-16 q 0,-18 -5,-29 Z" fill="url(#${p}-fluide)" opacity="0.85"/>
<path d="M 6,-44 q 2,22 -2,44 l 6,-1 q 4,-21 2,-43 Z" fill="url(#${p}-fluide)" opacity="0.7"/>
<path d="M -54,-188 L -78,-198 L -68,-180 Z" fill="#2a3326"/>
<path d="M 56,-188 L 80,-200 L 70,-180 Z" fill="#2a3326"/>
<path d="M -14,-200 Q -16,-228 4,-232 Q 24,-228 20,-200 Q 12,-190 0,-192 Q -10,-192 -14,-200 Z" fill="url(#${p}-crane)"/>
<path d="M -7,-202 q 8,6 16,-1" stroke="#101117" stroke-width="2.4" fill="none"/>
<path d="M -8,-200 L -10,-190 M 9,-201 L 10,-191" stroke="#101117" stroke-width="1.6"/>
<path d="M 0,-198 q 3,9 0,15" stroke="#2a3326" stroke-width="2" opacity="0.7" fill="none"/>
<path d="M 6,-228 Q 18,-226 16,-214" stroke="#3d4a36" stroke-width="1.6" fill="none" opacity="0.5"/>
<circle cx="-7" cy="-219" r="7" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-219" r="2.3" fill="#d6303e"/>
<circle cx="-7.8" cy="-219.8" r="0.9" fill="#e8868d"/>
<circle cx="9" cy="-218" r="7" fill="url(#${p}-eye)"/>
<circle cx="9" cy="-218" r="2.3" fill="#d6303e"/>
<circle cx="8.2" cy="-218.8" r="0.9" fill="#e8868d"/>
<path d="M -28,-206 q -8,-14 -2,-28 q 4,-10 -2,-20 M 30,-208 q 9,-14 3,-30" stroke="#3d4a36" stroke-width="1.8" fill="none" opacity="0.2"/>
</g>`;
}

function zHurleur(p) { return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.32" r="0.85"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-cuisse" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#101117"/><stop offset="0.55" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-crane" cx="0.42" cy="0.38" r="0.72"><stop offset="0" stop-color="#17161c"/><stop offset="0.65" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-gorge" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="#a31621"/><stop offset="0.5" stop-color="#a31621"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-bouche" cx="0.5" cy="0.42" r="0.65"><stop offset="0" stop-color="#a31621"/><stop offset="0.6" stop-color="#0d0e13"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-cri" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.16"/><stop offset="0.6" stop-color="#d6303e" stop-opacity="0.05"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="62" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-2" cy="-244" rx="60" ry="62" fill="url(#${p}-cri)"/>
<path d="M -38,-246 q 32,-22 70,-4 M -46,-262 q 40,-26 86,-5 M -52,-278 q 46,-30 100,-6" stroke="#d6303e" stroke-width="2" fill="none" opacity="0.32" stroke-linecap="round"/>
<path d="M -44,-256 q 38,-24 80,-5" stroke="#e8868d" stroke-width="1.2" fill="none" opacity="0.22"/>
<path d="M -30,-12 L -42,-72 L -22,-110 L -6,-96 L -12,-58 L -10,-12 Z" fill="url(#${p}-cuisse)"/>
<path d="M 6,-12 L 14,-70 L 26,-118 L 40,-96 L 24,-58 L 22,-12 Z" fill="url(#${p}-cuisse)"/>
<path d="M -36,-72 q -8,4 -6,30 q 1,18 4,30 M 16,-70 q 10,2 12,26 q 1,16 -2,32" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -30,-12 l -16,2 l 2,9 l 18,1 Z" fill="#0d0e13"/>
<path d="M 8,-12 l 18,1 l 0,9 l -16,2 Z" fill="#0d0e13"/>
<path d="M -34,-72 Q -54,-130 -34,-176 Q -16,-210 16,-204 Q 44,-196 48,-150 Q 50,-110 32,-70 Q 14,-58 -10,-62 Q -28,-64 -34,-72 Z" fill="url(#${p}-torse)"/>
<path d="M 10,-200 Q 40,-188 46,-148 Q 48,-112 32,-74 Q 28,-130 18,-198 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -22,-86 q 18,8 38,3 M -26,-104 q 22,9 46,3 M -28,-124 q 24,9 50,2 M -28,-144 q 24,8 50,1 M -26,-162 q 22,7 46,0" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.7"/>
<path d="M -30,-150 q 6,-3 14,0 q 8,4 8,18 q 0,12 -8,16 q -10,3 -16,-4 q -5,-8 -2,-22 Z" fill="#0d0e13"/>
<path d="M -28,-148 q 8,-2 14,2 M -30,-138 q 10,0 16,4 M -29,-128 q 9,2 14,7" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -24,-152 q -3,16 0,30" stroke="#a31621" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -34,-176 L -64,-194 L -86,-214" stroke="url(#${p}-bras)" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M -64,-194 q -10,-6 -8,-16" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -86,-214 l -8,-9 M -86,-214 l -1,-13 M -86,-214 l 7,-10 M -86,-214 l 11,-3" stroke="#17161c" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M -86,-214 l -8,-9 M -86,-214 l 7,-10" stroke="#0d0e13" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M 28,-180 L 60,-202 L 84,-226" stroke="url(#${p}-bras)" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M 60,-202 q 10,-7 7,-17" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 84,-226 l 8,-9 M 84,-226 l 1,-13 M 84,-226 l -7,-11 M 84,-226 l -11,-4" stroke="#17161c" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M 70,-208 l 4,-7" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -36,-178 Q -30,-196 -10,-202 Q 8,-206 22,-200 Q 30,-196 30,-188 Q 24,-180 8,-180 Q -16,-178 -36,-178 Z" fill="url(#${p}-gorge)"/>
<path d="M -30,-184 Q -10,-188 18,-186 Q 6,-178 -12,-180 Q -24,-181 -30,-184 Z" fill="#0d0e13" opacity="0.9"/>
<path d="M -26,-180 q -4,4 -2,10 M -14,-181 q -3,5 -1,11 M 0,-182 q -2,5 0,11 M 14,-182 q 1,5 4,9" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M -22,-186 q 6,-6 14,-4 M 0,-188 q 8,-3 16,1" stroke="#d6303e" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M 6,-180 q 2,18 -4,34 q -2,8 2,9 q 5,-2 5,-12 q 3,-16 1,-30 Z" fill="#a31621" opacity="0.85"/>
<path d="M 8,-176 q 1,14 -3,26" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -20,-198 Q -24,-218 -6,-232 Q 16,-244 34,-228 Q 44,-216 40,-202 Q 30,-194 12,-196 Q -8,-194 -20,-198 Z" fill="url(#${p}-crane)"/>
<path d="M 20,-238 Q 40,-228 40,-208 Q 38,-200 30,-198 Q 36,-218 24,-236 Z" fill="#0d0e13" opacity="0.8"/>
<path d="M -14,-210 q 16,-9 36,-3" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -8,-236 q 4,-3 12,-2" stroke="#101117" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 6,-244 Q 24,-252 38,-242 Q 46,-234 44,-224 Q 36,-238 22,-244 Q 12,-246 6,-244 Z" fill="url(#${p}-bouche)"/>
<path d="M 8,-242 Q 22,-248 34,-240 L 30,-236 Q 20,-242 10,-240 Z" fill="#0d0e13"/>
<path d="M 10,-243 l -1,5 M 16,-245 l -1,5 M 22,-246 l 0,5 M 28,-245 l 1,5 M 34,-242 l 2,4" stroke="#b3ac96" stroke-width="1.3" fill="none"/>
<path d="M 12,-236 l 0,4 M 19,-236 l 1,4 M 26,-237 l 1,4 M 32,-235 l 2,4" stroke="#8f8876" stroke-width="1.2" fill="none"/>
<path d="M 4,-242 q -3,3 -3,8 M 40,-226 q 4,2 5,7" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.85"/>
<path d="M 38,-230 q 4,-2 6,2" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.7"/>
<ellipse cx="-4" cy="-220" rx="9" ry="3" fill="#0d0e13" opacity="0.6"/>
<circle cx="-2" cy="-222" r="7" fill="url(#${p}-eye)"/><circle cx="-2" cy="-222" r="2.3" fill="#d6303e"/><circle cx="-2.8" cy="-222.8" r="0.9" fill="#e8868d"/>
<circle cx="14" cy="-226" r="7" fill="url(#${p}-eye)"/><circle cx="14" cy="-226" r="2.3" fill="#d6303e"/><circle cx="13.2" cy="-226.8" r="0.9" fill="#e8868d"/>
<path d="M -36,-176 q -3,10 -2,22" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M 30,-188 q 4,8 4,18 q 0,10 -2,16" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.5"/>
</g>`; }

function zPutrefie(p) {
  let vermine = '';
  for (let i = 0; i < 11; i++) {
    const vx = 14 + ((i * 17) % 30) - 15;
    const vy = -150 + (i * 23) % 70;
    const a = (i % 3) * 24 - 24;
    vermine += `<g transform="translate(${vx},${vy}) rotate(${a})"><path d="M -2.4,0 q 1.2,-1.4 2.4,0 q 1.2,1.4 2.4,0" stroke="#b3ac96" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.${5 + (i % 3)}"/></g>`;
  }
  for (let i = 0; i < 7; i++) {
    const vx = ((i * 23) % 46) - 22;
    const vy = -4 + (i * 7) % 10;
    vermine += `<circle cx="${vx}" cy="${vy}" r="1" fill="#b3ac96" opacity="0.4"/>`;
  }
  let gouttes = '';
  const gd = [[-30, -70, 30], [-8, -52, 46], [12, -90, 26], [40, -64, 24], [-44, -100, 20], [22, -40, 34]];
  for (let i = 0; i < gd.length; i++) {
    const [gx, gy, gl] = gd[i];
    gouttes += `<path d="M ${gx},${gy} q -1.6,${(gl * 0.5).toFixed(0)} 0,${gl} q 1.8,${(gl * 0.18).toFixed(0)} 3.4,0 q 1.6,${-(gl * 0.5).toFixed(0)} 0,${-gl} Z" fill="url(#${p}-coule)" opacity="0.9"/>`;
    gouttes += `<ellipse cx="${gx + 1.6}" cy="${gy + gl + 2}" rx="3.4" ry="2.4" fill="#0d0e13"/>`;
  }
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.32" r="0.85"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.42" cy="0.34" r="0.8"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#17161c"/><stop offset="1" stop-color="#101117"/></radialGradient>
<linearGradient id="${p}-membre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-coule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3326"/><stop offset="0.6" stop-color="#3d4a36" stop-opacity="0.7"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-cavite" cx="0.5" cy="0.45" r="0.65"><stop offset="0" stop-color="#7a2410"/><stop offset="0.5" stop-color="#a31621" stop-opacity="0.9"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="78" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="6" cy="0" rx="58" ry="9" fill="#2a3326" opacity="0.85"/>
<ellipse cx="40" cy="3" rx="22" ry="5" fill="#2a3326" opacity="0.9"/>
<path d="M -42,-1 q 30,-7 70,-2 q -8,7 -34,7 q -28,1 -36,-5 Z" fill="#2a3326" opacity="0.6"/>
<path d="M -26,-118 L -52,-86 L -54,-44 L -30,-40 L -34,-82 L -16,-110 Z" fill="url(#${p}-membre)"/>
<path d="M -52,-86 q -5,4 -3,12 q 3,5 7,2" fill="#101117" opacity="0.7"/>
<path d="M -30,-42 q 2,16 -3,30 q -1,7 3,7 q 5,-2 4,-13 q 2,-15 1,-26 Z" fill="url(#${p}-coule)"/>
<ellipse cx="-25" cy="-3" rx="4" ry="2.6" fill="#0d0e13"/>
<path d="M 22,-116 L 50,-82 L 54,-40 L 30,-38 L 30,-80 L 12,-108 Z" fill="url(#${p}-membre)"/>
<path d="M 30,-40 q 3,15 -1,28 q -1,7 3,6 q 5,-3 3,-14 q 1,-13 0,-22 Z" fill="url(#${p}-coule)"/>
<ellipse cx="42" cy="-1" rx="4" ry="2.6" fill="#0d0e13"/>
<path d="M -34,-122 Q -48,-176 -26,-218 Q -4,-238 22,-228 Q 50,-210 42,-158 Q 38,-128 24,-118 Q 6,-110 -14,-116 Q -28,-116 -34,-122 Z" fill="url(#${p}-torse)"/>
<path d="M -30,-126 Q -42,-170 -24,-208 Q -14,-220 -2,-222 Q -22,-200 -26,-160 Q -28,-128 -18,-120 Z" fill="#17161c" opacity="0.55"/>
<path d="M 8,-216 Q 40,-208 40,-160 Q 38,-130 26,-120 Q 36,-150 30,-186 Q 26,-206 8,-216 Z" fill="#101117" opacity="0.7"/>
<path d="M 12,-200 Q 44,-194 40,-156 Q 36,-132 22,-126 Q 20,-138 18,-150 L 12,-152 Q 8,-150 6,-156 Q 16,-156 18,-168 Q 16,-188 12,-200 Z" fill="url(#${p}-cavite)"/>
<path d="M 14,-198 Q 13,-176 12,-152" stroke="url(#${p}-os)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
<path d="M 18,-192 q 9,-1 14,7 q -2,6 -10,5 q -6,-1 -5,-7 Z" fill="url(#${p}-os)"/>
<path d="M 20,-176 q 9,0 14,8 q -2,6 -10,5 q -6,-2 -5,-8 Z" fill="url(#${p}-os)"/>
<path d="M 21,-160 q 9,1 13,9 q -2,5 -10,4 q -6,-2 -4,-8 Z" fill="url(#${p}-os)"/>
<path d="M 8,-204 q 12,-2 22,2 q -2,6 -12,5 q -8,-1 -10,-7 Z" fill="#17161c" opacity="0.7"/>
<path d="M 6,-152 Q 14,-148 24,-150 Q 18,-138 8,-136 Q 0,-138 2,-148 Z" fill="#0d0e13"/>
<path d="M -28,-200 q 10,-6 22,-4 M -30,-184 q 14,-5 28,-3 M -30,-166 q 12,-4 24,-2" stroke="#101117" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -22,-150 q 3,16 -1,32 q -2,9 3,9 q 6,-2 4,-15 q 2,-16 0,-28 Z" fill="url(#${p}-coule)"/>
<ellipse cx="-19" cy="-58" rx="3.6" ry="2.6" fill="#0d0e13"/>
<path d="M -8,-138 q 4,14 1,26" stroke="url(#${p}-coule)" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M -32,-208 L -58,-176 L -60,-138" stroke="url(#${p}-membre)" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M -58,-176 q -5,3 -4,11 M -60,-138 q 2,11 -2,20" stroke="url(#${p}-coule)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<path d="M -60,-138 l -8,4 M -60,-138 l -4,10 M -60,-138 l 3,11 M -60,-138 l 8,7" stroke="url(#${p}-membre)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M -55,-156 q 2,5 -2,9" stroke="#101117" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 26,-212 L 52,-184 L 64,-148" stroke="url(#${p}-membre)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 50,-186 L 60,-152" stroke="url(#${p}-os)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 52,-184 q 5,2 5,9 M 64,-148 q 3,11 -1,19" stroke="url(#${p}-coule)" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M 64,-148 l 9,3 M 64,-148 l 5,10 M 64,-148 l -2,11 M 64,-148 l -7,6" stroke="url(#${p}-membre)" stroke-width="2.4" stroke-linecap="round"/>
<path d="M -16,-228 Q -24,-258 2,-264 Q 28,-258 22,-226 Q 20,-210 0,-208 Q -12,-210 -16,-228 Z" fill="url(#${p}-crane)"/>
<path d="M -14,-232 Q -20,-254 0,-260 Q -8,-244 -8,-226 Q -8,-214 -2,-210 Q -12,-214 -14,-232 Z" fill="#17161c" opacity="0.6"/>
<path d="M 8,-258 Q 24,-252 22,-228 Q 20,-212 6,-208 Q 16,-228 14,-244 Q 12,-254 8,-258 Z" fill="#101117" opacity="0.7"/>
<path d="M -10,-238 q 7,-8 16,-3 q 5,4 1,8 q -10,-6 -17,-5 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -2,-232 q -6,5 -10,4 M 10,-230 q 5,5 1,9" stroke="#101117" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -2,-216 Q 4,-212 12,-214 Q 8,-206 0,-205 Q -6,-207 -2,-216 Z" fill="#0d0e13"/>
<path d="M 4,-208 q 3,11 0,21 q -1,7 3,6 q 4,-3 2,-13 Z" fill="url(#${p}-coule)"/>
<path d="M 14,-220 q 4,1 6,5" stroke="url(#${p}-os)" stroke-width="2" stroke-linecap="round" fill="none"/>
<circle cx="-7" cy="-238" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-238" r="2.2" fill="#d6303e"/>
<circle cx="-7.7" cy="-238.7" r="0.85" fill="#e8868d"/>
<circle cx="8" cy="-236" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="8" cy="-236" r="2.2" fill="#d6303e"/>
<circle cx="7.3" cy="-236.7" r="0.85" fill="#e8868d"/>
${gouttes}
${vermine}
</g>`;
}

function zChien(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.42" cy="0.34" r="0.82"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-croupe" cx="0.55" cy="0.34" r="0.85"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.32" r="0.9"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-patte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-gueule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2410"/><stop offset="0.55" stop-color="#a31621"/><stop offset="1" stop-color="#101117"/></linearGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9421e" stop-opacity="0.5"/><stop offset="1" stop-color="#c9421e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="118" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-58" cy="-66" rx="58" ry="30" fill="url(#${p}-braise)" opacity="0.4"/>
<path d="M 86,-58 Q 116,-100 100,-128 Q 88,-148 60,-150 Q 30,-150 18,-128 Q 6,-104 14,-70 Q 22,-44 50,-36 Q 80,-34 96,-50 Q 100,-38 92,-22 L 80,-8 L 70,-30 L 50,-36 L 30,-30 Q 8,-26 -16,-30 Q -44,-36 -64,-56 L -78,-78 Q -88,-96 -80,-114 L -72,-104 L -64,-118 L -56,-104 L -48,-120 L -40,-104 L -32,-118 L -24,-102 L -14,-114 Q 2,-100 22,-100 Q 46,-102 62,-90 Q 74,-78 86,-58 Z" fill="url(#${p}-torse)"/>
<path d="M 90,-128 Q 116,-118 124,-96 Q 128,-78 116,-64 Q 108,-78 110,-96 Q 108,-114 90,-122 Z" fill="url(#${p}-croupe)"/>
<path d="M -82,-114 L -76,-106 L -68,-122 L -60,-104 L -52,-122 L -44,-104 L -36,-122 L -28,-104 L -18,-118 L -8,-104 L 2,-118 L 14,-100" stroke="#0d0e13" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
<path d="M -78,-110 L -72,-100 L -64,-114 M -54,-114 L -46,-100 M -34,-114 L -26,-100" stroke="#2a3326" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M 6,-90 Q 16,-66 12,-44 M 22,-92 Q 32,-66 28,-42 M 38,-90 Q 48,-66 44,-46 M 54,-86 Q 62,-64 58,-48" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.85"/>
<path d="M 6,-90 Q 16,-66 12,-44 M 22,-92 Q 32,-66 28,-42 M 38,-90 Q 48,-66 44,-46" stroke="#17161c" stroke-width="1.2" fill="none" opacity="0.5"/>
<path d="M -10,-60 Q 8,-50 28,-54 Q 18,-42 -2,-44 Q -10,-50 -10,-60 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 70,-12 L 76,-2 L 86,-2 L 82,-14 Z" fill="url(#${p}-patte)"/>
<path d="M 76,-2 l -3,2 M 81,-2 l -2,2 M 85,-2 l -2,2" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M 96,-50 Q 104,-32 100,-14 L 90,-2 L 98,-2 L 108,-16 Q 114,-34 106,-52 Z" fill="url(#${p}-patte)"/>
<path d="M 90,-2 l -2,2 M 95,-2 l -2,2 M 100,-2 l -2,2 M 105,-2 l -2,2" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -64,-56 Q -74,-34 -70,-12 L -78,-2 L -68,-2 L -60,-14 Q -56,-34 -52,-52 Z" fill="url(#${p}-patte)"/>
<path d="M -78,-2 l -3,2 M -73,-2 l -2,3 M -68,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -42,-44 L -48,-12 L -56,-2 L -46,-2 L -38,-14 L -34,-42 Z" fill="url(#${p}-patte)"/>
<path d="M -56,-2 l -3,2 M -50,-2 l -2,3 M -45,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -58,-42 q -4,8 -2,18" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -44,-30 q -3,7 -1,14" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -64,-118 Q -98,-110 -116,-84 L -110,-78 Q -92,-98 -68,-104 Z" fill="url(#${p}-croupe)"/>
<path d="M -116,-84 Q -126,-72 -120,-58 Q -114,-64 -112,-76 Z" fill="#0d0e13"/>
<path d="M -64,-128 Q -94,-126 -110,-150 L -100,-178 Q -92,-200 -72,-206 Q -52,-208 -42,-192 L -36,-168 Q -34,-150 -42,-138 Q -54,-130 -64,-128 Z" fill="url(#${p}-crane)"/>
<path d="M -72,-204 L -84,-228 L -64,-216 Z" fill="#101117"/>
<path d="M -50,-200 L -54,-226 L -38,-208 Z" fill="#101117"/>
<path d="M -82,-224 L -88,-238 L -76,-228 Z" fill="#0d0e13"/>
<path d="M -54,-222 L -56,-236 L -46,-226 Z" fill="#0d0e13"/>
<path d="M -68,-128 Q -98,-132 -116,-150 Q -130,-166 -126,-184 L -116,-178 Q -118,-162 -106,-150 Q -90,-136 -64,-134 Z" fill="url(#${p}-gueule)"/>
<path d="M -116,-150 Q -130,-166 -126,-184 L -116,-178 Q -118,-162 -106,-150 Z" fill="#a31621" opacity="0.55"/>
<path d="M -116,-178 L -126,-182 L -119,-172 L -130,-174 L -122,-164 L -132,-164 L -124,-156 L -134,-154" stroke="#b3ac96" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
<path d="M -120,-178 L -126,-170 M -116,-172 L -122,-164 M -113,-166 L -118,-158" stroke="#8f8876" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M -64,-128 Q -94,-118 -112,-100 Q -124,-86 -120,-72 L -110,-78 Q -108,-92 -96,-104 Q -82,-118 -60,-122 Z" fill="url(#${p}-gueule)"/>
<path d="M -112,-100 Q -124,-86 -120,-72 L -110,-78 Q -108,-92 -96,-104 Z" fill="#a31621" opacity="0.5"/>
<path d="M -120,-72 L -128,-72 L -120,-64 L -130,-62 L -121,-56 L -132,-52" stroke="#b3ac96" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
<path d="M -116,-78 L -120,-68 M -110,-82 L -114,-72 M -104,-88 L -108,-78" stroke="#8f8876" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M -118,-128 Q -134,-130 -142,-138 Q -136,-126 -124,-124 Z" fill="#a31621"/>
<path d="M -120,-126 Q -132,-118 -130,-106 Q -124,-116 -116,-122 Z" fill="#a31621"/>
<path d="M -110,-150 Q -126,-156 -136,-150 Q -126,-146 -114,-146 Z" fill="#101117"/>
<path d="M -134,-150 q -6,2 -8,6" stroke="#0d0e13" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M -134,-150 q -3,4 -2,9" stroke="#0d0e13" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M -116,-188 Q -110,-200 -100,-200 Q -94,-194 -98,-186 Q -106,-182 -116,-188 Z" fill="#101117"/>
<path d="M -118,-186 q 6,4 14,1" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -84,-160 q 8,4 16,1 M -84,-152 q 8,4 15,1" stroke="#17161c" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -90,-176 Q -82,-168 -72,-172" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -100,-138 q 4,8 -2,16" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.75"/>
<circle cx="-103" cy="-186" r="7" fill="url(#${p}-eye)"/>
<circle cx="-103" cy="-186" r="2.3" fill="#d6303e"/>
<circle cx="-104.1" cy="-187.1" r="0.9" fill="#e8868d"/>
<circle cx="-86" cy="-178" r="7" fill="url(#${p}-eye)"/>
<circle cx="-86" cy="-178" r="2.3" fill="#d6303e"/>
<circle cx="-87.1" cy="-179.1" r="0.9" fill="#e8868d"/>
</g>`;
}

function zColosse(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-torse" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#1c1e29"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0a0b10"/></linearGradient>
<linearGradient id="${p}-plaq" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#2a2d3a"/><stop offset="0.5" stop-color="#181a24"/><stop offset="1" stop-color="#0d0e15"/></linearGradient>
<radialGradient id="${p}-casq" cx="0.4" cy="0.32" r="0.75"><stop offset="0" stop-color="#2c2f3c"/><stop offset="0.6" stop-color="#171924"/><stop offset="1" stop-color="#0c0d13"/></radialGradient>
<linearGradient id="${p}-visi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1d27"/><stop offset="0.5" stop-color="#0a0b10"/><stop offset="1" stop-color="#05060a"/></linearGradient>
<radialGradient id="${p}-bras" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#1d1f2a"/><stop offset="0.6" stop-color="#121319"/><stop offset="1" stop-color="#0a0b10"/></radialGradient>
<radialGradient id="${p}-poing" cx="0.4" cy="0.35" r="0.85"><stop offset="0" stop-color="#21232f"/><stop offset="0.6" stop-color="#14151d"/><stop offset="1" stop-color="#0b0c11"/></radialGradient>
<linearGradient id="${p}-acier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#525d67"/><stop offset="1" stop-color="#323b44"/></linearGradient>
</defs>
<ellipse cx="0" cy="2" rx="118" ry="11" fill="#000" opacity="0.5"/>

<path d="M -50,-30 L -68,-12 L -60,-2 L -34,-12 Z" fill="#0a0b10"/>
<path d="M 50,-30 L 70,-12 L 60,-2 L 34,-12 Z" fill="#0a0b10"/>

<path d="M -54,-118 L -66,-58 L -58,-6 L -22,-6 L -28,-62 L -16,-110 Z" fill="url(#${p}-torse)"/>
<path d="M 52,-118 L 68,-60 L 60,-6 L 24,-6 L 28,-62 L 14,-110 Z" fill="url(#${p}-torse)"/>
<rect x="-62" y="-56" width="30" height="44" rx="7" fill="url(#${p}-plaq)"/>
<rect x="32" y="-58" width="30" height="44" rx="7" fill="url(#${p}-plaq)"/>
<path d="M -58,-50 l 22,4 M -60,-38 l 24,3 M -59,-26 l 23,3" stroke="#05060a" stroke-width="1.6" opacity="0.7"/>
<path d="M 36,-52 l 22,4 M 34,-40 l 24,3 M 35,-28 l 23,3" stroke="#05060a" stroke-width="1.6" opacity="0.7"/>

<path d="M -60,-6 L -22,-6 L -20,8 L -64,10 Z" fill="#08090d"/>
<path d="M 60,-6 L 22,-6 L 20,8 L 64,10 Z" fill="#08090d"/>
<path d="M -52,-8 l 26,0 M 24,-8 l 26,0" stroke="#1a1d27" stroke-width="2" opacity="0.6"/>

<path d="M -72,-128 Q -86,-196 -56,-244 L 62,-244 Q 88,-194 74,-126 L 44,-134 L 26,-122 L 0,-136 L -26,-122 L -48,-134 Z" fill="url(#${p}-torse)"/>

<path d="M -56,-238 L -40,-242 L -36,-198 L -58,-200 Z" fill="#0c0d13" opacity="0.7"/>
<path d="M 60,-238 L 44,-242 L 40,-198 L 60,-200 Z" fill="#0c0d13" opacity="0.7"/>

<rect x="-48" y="-228" width="94" height="34" rx="8" fill="url(#${p}-plaq)"/>
<rect x="-50" y="-188" width="98" height="30" rx="8" fill="url(#${p}-plaq)"/>
<rect x="-46" y="-152" width="90" height="26" rx="7" fill="url(#${p}-plaq)"/>
<rect x="-44" y="-122" width="86" height="14" rx="5" fill="#0c0d13"/>
<path d="M -48,-211 l 94,0 M -50,-172 l 98,0 M -46,-138 l 90,0" stroke="#3a4150" stroke-width="2.4" opacity="0.85"/>
<path d="M -48,-208 l 94,0" stroke="#05060a" stroke-width="1.4" opacity="0.6"/>
<path d="M -50,-169 l 98,0" stroke="#05060a" stroke-width="1.4" opacity="0.6"/>
<rect x="-12" y="-124" width="22" height="16" rx="3" fill="url(#${p}-acier)"/>
<rect x="-7" y="-120" width="12" height="8" rx="1" fill="#0c0d13"/>

<path d="M 14,-204 L 40,-150 L 36,-130" stroke="#a31621" stroke-width="3" opacity="0.55" fill="none"/>
<path d="M 18,-198 q 6,18 0,40" stroke="#7a2410" stroke-width="2" opacity="0.5" fill="none"/>

<path d="M -86,-236 Q -70,-254 -48,-246 L -52,-214 Q -78,-208 -90,-220 Z" fill="url(#${p}-plaq)"/>
<path d="M 88,-236 Q 72,-254 50,-246 L 54,-214 Q 80,-208 92,-220 Z" fill="url(#${p}-plaq)"/>
<path d="M -84,-230 q 14,-12 30,-8 M -84,-224 q 16,-10 30,-6" stroke="#3a4150" stroke-width="1.6" opacity="0.6" fill="none"/>
<path d="M 86,-230 q -14,-12 -30,-8 M 86,-224 q -16,-10 -30,-6" stroke="#3a4150" stroke-width="1.6" opacity="0.6" fill="none"/>

<path d="M -78,-220 L -96,-160 L -88,-96" stroke="url(#${p}-bras)" stroke-width="22" fill="none" stroke-linecap="round"/>
<path d="M 82,-220 L 100,-162 L 92,-98" stroke="url(#${p}-bras)" stroke-width="22" fill="none" stroke-linecap="round"/>
<path d="M -84,-186 q -8,4 -10,18 M -90,-150 q -6,4 -8,16" stroke="#05060a" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M 88,-188 q 8,4 10,18 M 94,-152 q 6,4 8,16" stroke="#05060a" stroke-width="3" opacity="0.5" fill="none"/>
<rect x="-98" y="-176" width="14" height="36" rx="4" fill="url(#${p}-plaq)" transform="rotate(10 -91 -158)"/>
<rect x="84" y="-178" width="14" height="36" rx="4" fill="url(#${p}-plaq)" transform="rotate(-10 91 -160)"/>

<path d="M 96,-148 q 12,2 18,14 q 4,8 -2,12 q -10,4 -16,-4" stroke="#17161c" stroke-width="6" fill="none"/>
<path d="M 98,-142 l 8,10 M 104,-136 l 6,9" stroke="#a31621" stroke-width="1.8" opacity="0.8"/>

<ellipse cx="-90" cy="-90" rx="18" ry="20" fill="url(#${p}-poing)"/>
<path d="M -104,-96 q 4,-6 12,-6 q 8,0 10,6 M -106,-88 q 6,-4 14,-4 q 8,0 10,4 M -104,-80 q 6,-3 12,-3 q 7,0 9,3" stroke="#05060a" stroke-width="2.2" fill="none"/>
<path d="M -90,-108 q -6,2 -8,8" stroke="#0a0b10" stroke-width="4" fill="none"/>
<path d="M -100,-100 q 2,8 0,18" stroke="#a31621" stroke-width="2" opacity="0.55" fill="none"/>

<ellipse cx="94" cy="-92" rx="18" ry="21" fill="url(#${p}-poing)"/>
<path d="M 108,-98 q -4,-6 -12,-6 q -8,0 -10,6 M 110,-90 q -6,-4 -14,-4 q -8,0 -10,4 M 108,-82 q -6,-3 -12,-3 q -7,0 -9,3" stroke="#05060a" stroke-width="2.2" fill="none"/>
<path d="M 94,-110 q 6,2 8,8" stroke="#0a0b10" stroke-width="4" fill="none"/>
<path d="M 86,-94 q -3,6 -2,14" stroke="#8f8876" stroke-width="2.2" opacity="0.5" fill="none"/>

<path d="M -18,-244 L -16,-258 L 18,-258 L 18,-244 Z" fill="#0d0e15"/>
<path d="M -16,-250 l 32,0" stroke="#05060a" stroke-width="2" opacity="0.7"/>

<path d="M -30,-262 Q -36,-308 0,-318 Q 36,-308 30,-262 Q 28,-250 18,-248 L -18,-248 Q -28,-250 -30,-262 Z" fill="url(#${p}-casq)"/>
<path d="M -30,-262 Q -36,-308 0,-318 Q 16,-313 22,-300 Q -2,-308 -22,-294 Q -30,-280 -28,-262 Z" fill="#2a2d3a" opacity="0.35"/>
<path d="M 0,-318 Q 30,-310 30,-274" stroke="#3a4150" stroke-width="2" opacity="0.4" fill="none"/>
<path d="M -2,-318 q 6,30 4,62" stroke="#05060a" stroke-width="2.4" opacity="0.5" fill="none"/>

<path d="M -28,-292 Q 0,-300 28,-292 L 26,-286 Q 0,-294 -26,-286 Z" fill="#3a4150" opacity="0.45"/>

<path d="M -24,-282 L 24,-282 L 22,-258 Q 0,-252 -22,-258 Z" fill="url(#${p}-visi)"/>
<path d="M -24,-274 L 26,-270" stroke="#a31621" stroke-width="2.2" opacity="0.85"/>
<path d="M -24,-273 L 26,-269" stroke="#7a2410" stroke-width="1" opacity="0.7"/>
<path d="M -20,-280 l 0,22 M -8,-281 l 0,24 M 6,-281 l 0,24 M 18,-280 l 0,22" stroke="#05060a" stroke-width="1.4" opacity="0.55"/>
<path d="M -22,-280 L 22,-280" stroke="#1a1d27" stroke-width="1.6" opacity="0.6"/>

<rect x="-20" y="-258" width="40" height="9" rx="3" fill="#0a0b10"/>
<path d="M -18,-253 l 36,0" stroke="#1a1d27" stroke-width="1.4" opacity="0.5"/>
<circle cx="-12" cy="-253" r="1.4" fill="#05060a"/>
<circle cx="0" cy="-253" r="1.4" fill="#05060a"/>
<circle cx="12" cy="-253" r="1.4" fill="#05060a"/>

<circle cx="-9" cy="-269" r="7" fill="url(#${p}-eye)"/>
<circle cx="-9" cy="-269" r="2.3" fill="#d6303e"/>
<circle cx="-9.8" cy="-269.8" r="0.9" fill="#e8868d"/>
<circle cx="11" cy="-268" r="7" fill="url(#${p}-eye)"/>
<circle cx="11" cy="-268" r="2.3" fill="#d6303e"/>
<circle cx="10.2" cy="-268.8" r="0.9" fill="#e8868d"/>

<path d="M -36,-290 q -6,4 -6,14 M 36,-288 q 6,4 6,14" stroke="#05060a" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M 6,-306 q 4,16 0,30" stroke="#a31621" stroke-width="2.2" opacity="0.6" fill="none"/>
<path d="M 8,-300 l 5,8" stroke="#d6303e" stroke-width="1.4" opacity="0.7"/>
</g>`;
}

function zBrule(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-torse" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.5" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.34" r="0.72"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-jambe" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9421e" stop-opacity="0.85"/><stop offset="0.5" stop-color="#7a2410" stop-opacity="0.45"/><stop offset="1" stop-color="#7a2410" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-fissure" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9421e"/><stop offset="0.6" stop-color="#7a2410"/><stop offset="1" stop-color="#7a2410"/></linearGradient>
<radialGradient id="${p}-fumee" cx="0.5" cy="1" r="0.8"><stop offset="0" stop-color="#44505a" stop-opacity="0.22"/><stop offset="1" stop-color="#44505a" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="62" ry="11" fill="#000" opacity="0.5"/>

<ellipse cx="-2" cy="-92" rx="58" ry="68" fill="url(#${p}-fumee)"/>
<ellipse cx="6" cy="-150" rx="40" ry="56" fill="url(#${p}-fumee)"/>

<path d="M -24,-94 L -34,-50 L -30,-4 L -10,-2 L -14,-50 L -6,-92 Z" fill="url(#${p}-jambe)"/>
<path d="M 24,-96 L 36,-52 L 30,-2 L 12,-4 L 14,-52 L 6,-92 Z" fill="url(#${p}-jambe)"/>
<path d="M -30,-2 l -16,3 l 1,8 l 20,-2 Z" fill="#0d0e13"/>
<path d="M 30,-2 l 16,3 l -1,8 l -20,-2 Z" fill="#0d0e13"/>
<path d="M -27,-70 q 2,22 -3,42 M 23,-72 q 4,20 0,40" stroke="url(#${p}-fissure)" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M -22,-40 l 5,18 M 18,-44 l 4,20" stroke="#7a2410" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M -19,-86 q -4,14 -2,28 M 13,-88 q 3,16 1,30" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.7"/>

<path d="M -34,-98 Q -48,-148 -30,-184 L 30,-186 Q 50,-150 36,-96 L 24,-104 L 12,-92 L -4,-104 L -18,-92 L -28,-102 Z" fill="url(#${p}-torse)"/>
<path d="M -30,-180 Q 0,-192 30,-182 L 26,-166 Q 0,-176 -26,-166 Z" fill="#0d0e13"/>
<path d="M -8,-176 Q -12,-128 -4,-96 Q 0,-90 4,-96 Q 12,-130 8,-176 Z" fill="url(#${p}-fissure)" opacity="0.92"/>
<path d="M -6,-170 Q -9,-130 -2,-100 Q 1,-96 3,-100 Q 9,-132 6,-170 Z" fill="url(#${p}-braise)"/>
<path d="M -24,-150 q 10,5 0,18 q -8,10 2,22 q 8,8 -2,20" stroke="url(#${p}-fissure)" stroke-width="1.8" fill="none" opacity="0.8"/>
<path d="M 22,-156 q -9,6 1,18 q 8,9 -2,22 q -7,9 3,18" stroke="url(#${p}-fissure)" stroke-width="1.8" fill="none" opacity="0.8"/>
<path d="M -22,-152 q 9,5 0,16 q -7,9 2,20" stroke="#c9421e" stroke-width="0.8" fill="none" opacity="0.7"/>
<path d="M -30,-176 l 8,6 M 28,-178 l -8,6 M -16,-118 l 9,4 M 12,-122 l 8,4 M -20,-130 l 7,3 M 14,-148 l 7,3" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.75"/>
<path d="M 16,-110 Q 30,-106 28,-92 L 14,-90 Q 10,-100 16,-110 Z" fill="#0d0e13"/>
<path d="M 17,-108 q 9,4 9,14" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M -16,-178 q 6,3 14,1 M -16,-170 q 7,3 15,1" stroke="#2a3326" stroke-width="1.6" fill="none" opacity="0.6"/>

<path d="M -30,-176 L -54,-150 L -64,-110 L -58,-78" stroke="url(#${p}-bras)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -56,-148 q -6,18 -6,38 q 0,16 2,28" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.8"/>
<path d="M -54,-150 l -5,9 M -62,-118 l -6,8 M -60,-96 l -6,7" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -58,-78 Q -68,-74 -68,-64 Q -66,-56 -58,-58 Q -50,-60 -50,-70 Q -52,-78 -58,-78 Z" fill="url(#${p}-bras)"/>
<path d="M -65,-66 q -4,5 -2,11 M -58,-58 q -3,5 -1,10 M -51,-62 q -2,5 0,10" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.8"/>
<path d="M -64,-66 q 4,3 12,1" stroke="url(#${p}-fissure)" stroke-width="1.3" fill="none" opacity="0.75"/>

<path d="M 32,-178 L 56,-150 L 66,-112 L 60,-80" stroke="url(#${p}-bras)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 56,-150 q 6,18 6,38 q 0,14 -2,26" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.8"/>
<path d="M 56,-150 l 5,9 M 64,-120 l 6,8 M 62,-98 l 6,7" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 60,-80 Q 70,-76 70,-66 Q 68,-58 60,-60 Q 52,-62 52,-72 Q 54,-80 60,-80 Z" fill="url(#${p}-bras)"/>
<path d="M 67,-68 q 4,5 2,11 M 60,-60 q 3,5 1,10 M 53,-64 q 2,5 0,10" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.8"/>
<path d="M 66,-68 q -4,3 -12,1" stroke="url(#${p}-fissure)" stroke-width="1.3" fill="none" opacity="0.75"/>

<path d="M -10,-186 L -12,-200 L 14,-202 L 14,-186 Z" fill="url(#${p}-bras)"/>
<path d="M -8,-192 q 6,4 18,2" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.8"/>

<path d="M -18,-202 Q -26,-238 -2,-248 Q 24,-240 20,-204 Q 16,-190 0,-188 Q -12,-190 -18,-202 Z" fill="url(#${p}-crane)"/>
<path d="M -4,-246 Q 2,-238 12,-242 Q 8,-220 14,-208 Q 6,-204 -2,-208 Q -8,-224 -4,-246 Z" fill="#17161c" opacity="0.7"/>
<path d="M -14,-228 Q -2,-244 16,-232 L 14,-224 Q -2,-236 -12,-222 Z" fill="#0d0e13"/>
<path d="M -6,-244 q -2,18 1,32 M 4,-246 q 3,16 1,30" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.85"/>
<path d="M -16,-222 q 8,3 0,12 q -6,7 2,14 M 18,-220 q -7,4 1,12 q 6,7 -2,12" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M -16,-214 l -4,6 M 18,-212 l 4,6 M -10,-238 l -3,5 M 8,-242 l 3,5" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -10,-198 Q -2,-190 12,-198 L 11,-192 Q 0,-186 -9,-192 Z" fill="#0d0e13"/>
<path d="M -9,-197 l 2,5 l 3,-4 l 3,4 l 3,-4 l 3,4 l 3,-4" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M -8,-196 q 5,4 16,1" stroke="url(#${p}-braise)" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -10,-208 q 5,3 12,0 M -9,-228 q 6,3 14,0" stroke="#2a3326" stroke-width="1.5" fill="none" opacity="0.5"/>
<circle cx="-7" cy="-220" r="7" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-220" r="2.3" fill="#d6303e"/>
<circle cx="-7.8" cy="-220.8" r="0.9" fill="#e8868d"/>
<circle cx="9" cy="-219" r="7" fill="url(#${p}-eye)"/>
<circle cx="9" cy="-219" r="2.3" fill="#d6303e"/>
<circle cx="8.2" cy="-219.8" r="0.9" fill="#e8868d"/>

<path d="M -16,-208 q -8,-18 -2,-34 q 4,-10 -2,-22 M 18,-210 q 9,-16 3,-32 q -4,-10 2,-20 M 0,-250 q -4,-14 4,-26" stroke="url(#${p}-fumee)" stroke-width="3" fill="none" opacity="0.5"/>
<path d="M -38,-150 q -6,-12 0,-24 M 40,-140 q 6,-12 0,-24" stroke="url(#${p}-fumee)" stroke-width="2.4" fill="none" opacity="0.4"/>
</g>`;
}

function zNueeRats(p) {
  // Nuee de rats : masse tres large et tres basse, deferlant au ras du sol vers le joueur.
  // Aucune balise <svg>. Un seul <g> racine, centre x=0, pose sur y=0.
  const corps = `#14151b`, corpsOmbre = `#0d0e13`, dosClair = `#17161c`;

  // --- Fabriques internes (autonomes, tout en dur) ---
  // Oeil rouge luisant : halo + pupille + reflet.
  const eye = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${(r * 3).toFixed(1)}" fill="url(#${p}-eye)"/>` +
    `<circle cx="${x}" cy="${y}" r="${(r).toFixed(1)}" fill="#d6303e"/>` +
    `<circle cx="${(x - r * 0.4).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" r="${(r * 0.38).toFixed(1)}" fill="#e8868d"/>`;

  // Queue nue : longue courbe sinueuse fine.
  const queue = (x, y, dx, dy, w) =>
    `<path d="M ${x},${y} q ${(dx * 0.5).toFixed(0)},${(dy - 6).toFixed(0)} ${(dx * 0.5).toFixed(0)},${(dy * 0.2).toFixed(0)} t ${(dx * 0.5).toFixed(0)},${(dy * 0.8).toFixed(0)}" stroke="#101117" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="0.9"/>`;

  // Un rat : corps ovale degrade, dos arque, museau, oreilles, deux yeux rouges, pattes griffues.
  // s = echelle, f = flip (1 ou -1) pour orienter le museau, op = opacite (profondeur).
  const rat = (x, y, s, f, eyeR, op) => {
    const ex1 = x + f * 17 * s, ey = y - 7 * s;       // oeil avant
    const ex2 = x + f * 12 * s, ey2 = y - 9 * s;      // oeil arriere
    return `<g transform="translate(${x},${y}) scale(${(f * s).toFixed(3)},${s})" opacity="${op}">` +
      // ombre propre au rat
      `<ellipse cx="2" cy="3" rx="22" ry="5" fill="#000" opacity="0.35"/>` +
      // corps gras, dos arque (gradient radial pour le volume)
      `<path d="M -24,-2 Q -26,-16 -10,-19 Q 4,-22 16,-16 Q 26,-12 28,-3 Q 26,3 14,4 L -16,4 Q -24,3 -24,-2 Z" fill="url(#${p}-corps)"/>` +
      // arete du dos plus claire
      `<path d="M -18,-13 Q -2,-21 18,-13" stroke="${dosClair}" stroke-width="2" fill="none" opacity="0.7"/>` +
      // ombre interne sous le ventre
      `<path d="M -18,3 Q 0,6 14,3" stroke="${corpsOmbre}" stroke-width="3" fill="none" opacity="0.8"/>` +
      // museau pointu vers l'avant
      `<path d="M 24,-7 Q 36,-6 39,-1 Q 36,3 26,2 Q 22,-3 24,-7 Z" fill="${corps}"/>` +
      // truffe
      `<circle cx="38" cy="-1" r="1.6" fill="#0d0e13"/>` +
      // dent jaunatre (os expose)
      `<path d="M 34,1 l 2,4 l 1,-4 Z" fill="#8f8876" opacity="0.8"/>` +
      // oreille ronde
      `<circle cx="14" cy="-17" r="4.5" fill="${corpsOmbre}"/>` +
      `<circle cx="14" cy="-17" r="2.2" fill="#101117" opacity="0.7"/>` +
      // pattes avant griffues
      `<path d="M 18,4 l 1,6 M 21,4 l 0,6 M 24,4 l 1,6" stroke="${corpsOmbre}" stroke-width="1.4" stroke-linecap="round"/>` +
      // pattes arriere
      `<path d="M -8,4 l -1,5 M -4,4 l 0,6 M 0,4 l 1,5" stroke="${corpsOmbre}" stroke-width="1.4" stroke-linecap="round"/>` +
      // yeux rouges
      eye(ex1, ey, eyeR) + eye(ex2, ey2, eyeR) +
      `</g>`;
  };

  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-corps" cx="0.42" cy="0.3" r="0.85"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-masse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-lueur" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#a31621" stop-opacity="0.18"/><stop offset="1" stop-color="#a31621" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="142" ry="9" fill="#000" opacity="0.5"/>
<ellipse cx="0" cy="-26" rx="120" ry="44" fill="url(#${p}-lueur)"/>

<!-- Masse mouvante de fond : silhouettes basses entremelees (dos qui ondulent) -->
<path d="M -138,2 Q -130,-30 -108,-26 Q -96,-40 -78,-32 Q -64,-46 -44,-36 Q -28,-50 -8,-38 Q 8,-52 28,-39 Q 46,-50 64,-37 Q 82,-48 100,-33 Q 116,-42 130,-26 Q 140,-16 138,2 Z" fill="url(#${p}-masse)"/>
<path d="M -120,-22 Q -108,-34 -94,-28 M -70,-30 Q -56,-42 -40,-32 M -16,-34 Q 2,-46 22,-34 M 44,-34 Q 60,-44 76,-32 M 96,-30 Q 110,-38 122,-24" stroke="${dosClair}" stroke-width="2" fill="none" opacity="0.45"/>

<!-- Queues nues entremelees qui sortent de la masse -->
${queue(-128, -4, 40, 6, 2.4)}
${queue(-86, -2, -30, 5, 2.2)}
${queue(-30, 0, 44, 4, 2.6)}
${queue(36, -2, -38, 6, 2.4)}
${queue(92, -3, 36, 5, 2.2)}
${queue(124, -2, 22, 4, 2)}
${queue(8, 1, 30, 3, 2)}

<!-- Coulures de sang seche au ras du sol -->
<path d="M -60,4 q 18,-3 40,-1 l -4,5 q -20,-2 -38,1 Z" fill="#a31621" opacity="0.35"/>
<path d="M 40,5 q 14,-2 30,0 l -3,4 q -16,-1 -28,1 Z" fill="#a31621" opacity="0.3"/>

<!-- Rangee de fond (rats lointains, petits, sombres) -->
${rat(-104, -22, 0.7, 1, 1.4, 0.85)}
${rat(-58, -25, 0.72, 1, 1.5, 0.88)}
${rat(-6, -27, 0.74, 1, 1.5, 0.9)}
${rat(48, -25, 0.72, 1, 1.5, 0.88)}
${rat(98, -22, 0.7, 1, 1.4, 0.85)}

<!-- Rangee mediane -->
${rat(-118, -10, 0.9, 1, 1.8, 0.95)}
${rat(-70, -12, 0.95, 1, 1.9, 0.96)}
${rat(-24, -13, 0.98, 1, 2, 0.97)}
${rat(28, -13, 0.96, -1, 1.9, 0.97)}
${rat(76, -11, 0.92, 1, 1.9, 0.95)}
${rat(120, -9, 0.88, -1, 1.8, 0.94)}

<!-- Premier plan : les plus gros, museaux tournes vers le joueur (vers le bas/avant) -->
${rat(-92, 0, 1.18, 1, 2.4, 1)}
${rat(-44, 1, 1.25, 1, 2.5, 1)}
${rat(6, 2, 1.32, 1, 2.6, 1)}
${rat(58, 1, 1.26, -1, 2.5, 1)}
${rat(104, 0, 1.2, -1, 2.4, 1)}

<!-- Quelques yeux rouges supplementaires noyes dans la masse de fond (profondeur) -->
${eye(-80, -30, 1.3)}${eye(18, -33, 1.4)}${eye(70, -31, 1.3)}${eye(-30, -36, 1.2)}${eye(112, -28, 1.2)}
</g>`;
}

function zTraqueur(p) {
  return `<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.42" cy="0.34" r="0.82"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.32" r="0.85"><stop offset="0" stop-color="#17161c"/><stop offset="0.62" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stop-color="#17161c"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-cuisse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-ventre" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
</defs>
<g transform="translate(150,346)">
<ellipse cx="0" cy="2" rx="118" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-88" cy="0" rx="20" ry="6" fill="#000" opacity="0.4"/>
<ellipse cx="92" cy="-1" rx="22" ry="6" fill="#000" opacity="0.4"/>
<path d="M 30,-118 Q 58,-110 66,-78 Q 70,-54 56,-30 L 40,-26 Q 50,-52 42,-76 Q 36,-98 22,-110 Z" fill="url(#${p}-cuisse)"/>
<path d="M 54,-34 Q 64,-22 84,-12 Q 100,-6 110,-4 L 108,4 L 86,0 Q 60,-8 44,-24 Z" fill="#101117"/>
<path d="M 108,-3 l 12,1 M 102,1 l 13,3 M 94,3 l 12,5 M 86,4 l 10,7" stroke="#8f8876" stroke-width="2.2" stroke-linecap="round"/>
<path d="M 48,-66 q 4,16 0,30" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M -28,-122 Q -56,-112 -64,-80 Q -68,-56 -54,-32 L -38,-28 Q -48,-54 -40,-78 Q -34,-100 -20,-112 Z" fill="url(#${p}-cuisse)"/>
<path d="M -52,-36 Q -64,-24 -82,-14 Q -96,-8 -108,-5 L -106,3 Q -86,-2 -64,-12 Q -50,-20 -42,-26 Z" fill="#0d0e13"/>
<path d="M -106,-4 l -12,2 M -100,1 l -13,4 M -92,4 l -11,6 M -84,5 l -9,7" stroke="#8f8876" stroke-width="2.2" stroke-linecap="round"/>
<path d="M 28,-104 Q 70,-118 104,-138 Q 122,-150 130,-168" stroke="#101117" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M 130,-168 l 6,-10 M 130,-168 l 11,-2 M 130,-168 l 2,11" stroke="#0d0e13" stroke-width="3" stroke-linecap="round"/>
<path d="M -8,-150 Q 36,-150 46,-118 Q 50,-100 30,-92 Q 0,-86 -22,-94 Q -34,-104 -28,-130 Z" fill="url(#${p}-torse)"/>
<path d="M -28,-130 Q -36,-186 -8,-216 Q 24,-244 44,-228 Q 52,-220 46,-208 Q 28,-220 6,-208 Q -16,-194 -14,-160 Q -14,-142 -8,-128 Z" fill="url(#${p}-torse)"/>
<path d="M -22,-138 l -7,4 M -20,-152 l -8,3 M -16,-168 l -9,2 M -10,-184 l -9,0 M 0,-198 l -8,-3 M 14,-208 l -7,-5 M 28,-214 l -5,-7" stroke="#8f8876" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
<path d="M -24,-134 q -6,40 4,76" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -14,-160 Q 20,-178 40,-156 Q 50,-142 40,-122 Q 18,-104 -6,-114 Q -18,-128 -14,-160 Z" fill="url(#${p}-ventre)"/>
<path d="M 8,-160 q 14,4 24,-2 M 4,-148 q 16,5 28,-1 M 2,-136 q 16,5 26,-1" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.75"/>
<path d="M 36,-150 q 8,-3 12,2 M 38,-138 q 8,-2 12,3 M 36,-126 q 7,-1 11,4" stroke="#8f8876" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M -2,-140 Q -10,-132 -4,-122 Q 4,-116 8,-126 Q 6,-136 -2,-140 Z" fill="#a31621" opacity="0.45"/>
<path d="M 0,-134 l 5,2 l 3,-3" stroke="#b3ac96" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -3,-122 q 2,10 0,18" stroke="#a31621" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -14,-200 Q -42,-202 -58,-184 Q -68,-170 -56,-156 Q -36,-148 -20,-160 Q -10,-176 -14,-200 Z" fill="url(#${p}-torse)"/>
<path d="M -50,-182 q -8,12 -2,24" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -46,-176 Q -78,-156 -96,-110 Q -106,-72 -110,-30 L -98,-26 Q -90,-70 -78,-104 Q -62,-148 -36,-166 Z" fill="url(#${p}-bras)"/>
<path d="M -110,-30 Q -114,-16 -112,-4 L -100,-2 Q -100,-16 -98,-26 Z" fill="#101117"/>
<path d="M -100,-90 q -6,30 -8,58" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -86,-110 q 2,-2 5,-1" stroke="#8f8876" stroke-width="1.4" opacity="0.5"/>
<path d="M -112,-4 L -136,2 M -110,-2 L -134,8 M -106,1 L -128,12 M -101,2 L -120,14 M -98,2 L -112,15" stroke="#101117" stroke-width="3.4" stroke-linecap="round"/>
<path d="M -136,2 l -7,-1 M -134,8 l -8,1 M -128,12 l -7,2 M -120,14 l -6,3 M -112,15 l -5,3" stroke="#8f8876" stroke-width="2" stroke-linecap="round"/>
<path d="M -18,-188 Q 18,-172 48,-128 Q 64,-98 76,-58 L 64,-52 Q 50,-92 34,-122 Q 12,-160 -22,-178 Z" fill="url(#${p}-bras)"/>
<path d="M 76,-58 Q 82,-40 84,-22 L 72,-20 Q 70,-38 64,-52 Z" fill="#0d0e13"/>
<path d="M 50,-120 q 12,32 22,64" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M 84,-22 L 104,-14 M 82,-20 L 104,-8 M 78,-18 L 98,-2 M 74,-18 L 90,0 M 72,-18 L 82,0" stroke="#101117" stroke-width="3.4" stroke-linecap="round"/>
<path d="M 104,-14 l 8,-2 M 104,-8 l 8,1 M 98,-2 l 7,3 M 90,0 l 6,4 M 82,0 l 5,5" stroke="#8f8876" stroke-width="2" stroke-linecap="round"/>
<path d="M -40,-198 Q -56,-208 -76,-204 Q -88,-200 -86,-190 Q -78,-182 -62,-186 Q -46,-192 -40,-198 Z" fill="url(#${p}-torse)"/>
<path d="M -58,-200 q 8,4 16,2 M -60,-192 q 8,3 15,1" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.6"/>
<g transform="rotate(-8 -94 -206)">
<path d="M -72,-188 Q -98,-200 -116,-194 Q -130,-188 -126,-176 Q -118,-170 -108,-172 L -110,-180 Q -94,-184 -72,-182 Z" fill="url(#${p}-crane)"/>
<path d="M -76,-204 Q -100,-214 -120,-206 Q -134,-198 -128,-184 Q -116,-172 -98,-178 Q -78,-188 -76,-204 Z" fill="url(#${p}-crane)"/>
<path d="M -126,-184 Q -134,-180 -130,-172 L -110,-172 Q -118,-178 -126,-184 Z" fill="#0d0e13"/>
<path d="M -124,-178 l -2,6 l 3,-4 Z M -118,-176 l -1,6 l 3,-4 Z M -113,-174 l -1,5 l 2,-4 Z" fill="#b3ac96"/>
<path d="M -120,-188 q 6,3 14,2" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.8"/>
<path d="M -82,-208 L -72,-224 L -66,-204 Z" fill="#101117"/>
<path d="M -100,-210 L -92,-224 L -86,-206 Z" fill="#14151b"/>
<path d="M -108,-200 q 10,-4 20,-1" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -90,-198 l 6,3 l -2,4" stroke="#b3ac96" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -118,-180 q -2,6 0,11" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.7"/>
<circle cx="-105" cy="-192" r="7" fill="url(#${p}-eye)"/>
<circle cx="-105" cy="-192" r="2.3" fill="#d6303e"/>
<circle cx="-106" cy="-193" r="0.9" fill="#e8868d"/>
<circle cx="-91" cy="-190" r="7" fill="url(#${p}-eye)"/>
<circle cx="-91" cy="-190" r="2.3" fill="#d6303e"/>
<circle cx="-92" cy="-191" r="0.9" fill="#e8868d"/>
</g>
<path d="M -118,-168 q -4,18 -2,40 q 1,8 4,7 q 3,-4 1,-14 q 1,-18 -1,-32 Z" fill="#a31621" opacity="0.5"/>
<ellipse cx="-118" cy="-2" rx="14" ry="3" fill="#a31621" opacity="0.4"/>
</g>`;
}
