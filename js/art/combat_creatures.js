// ============ Créatures de combat — SVG autonomes (fond transparent) ============
// Chaque zombie est une image indépendante, centrée en x=0 et posée sur la ligne de sol
// (translate(150,346)), à incruster par-dessus le décor. Tous les ids SVG sont préfixés
// par le zid (paramètre p) pour cohabiter dans le DOM. Palette désaturée : chair morte,
// os, sang, braise. 12 morts d'origine redessinés + écolier, policier et rat géant.
// (Fichier assemblé par tools/build_creatures.js — voir ce script pour régénérer.)

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
  ecolier: zEcolier,
  policier: zPolicier,
  rat_geant: zRatGeant,
};

function zErrant(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-skin" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stop-color="#3a3526"/><stop offset="0.5" stop-color="#2d2920"/><stop offset="1" stop-color="#14141a"/></radialGradient>
<radialGradient id="${p}-skinD" cx="0.4" cy="0.32" r="0.8"><stop offset="0" stop-color="#2d2920"/><stop offset="0.6" stop-color="#1d1c24"/><stop offset="1" stop-color="#101117"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stop-color="#4a4434"/><stop offset="0.55" stop-color="#2d2920"/><stop offset="1" stop-color="#14141a"/></radialGradient>
<linearGradient id="${p}-torse" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#2f2a1e"/><stop offset="0.5" stop-color="#1d1b16"/><stop offset="1" stop-color="#101117"/></linearGradient>
<linearGradient id="${p}-shirt" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#4a3a26"/><stop offset="0.45" stop-color="#33281a"/><stop offset="1" stop-color="#1a1610"/></linearGradient>
<linearGradient id="${p}-shirtD" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#33281a"/><stop offset="0.5" stop-color="#241c12"/><stop offset="1" stop-color="#15110b"/></linearGradient>
<linearGradient id="${p}-pant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#171710"/><stop offset="0.5" stop-color="#3a3122"/><stop offset="1" stop-color="#181810"/></linearGradient>
<linearGradient id="${p}-pantD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#13130d"/><stop offset="0.5" stop-color="#2f2819"/><stop offset="1" stop-color="#1d1a12"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#393425"/><stop offset="0.55" stop-color="#241f17"/><stop offset="1" stop-color="#131218"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-milky" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="#cfd2c8"/><stop offset="0.6" stop-color="#9aa093"/><stop offset="1" stop-color="#5c6258"/></radialGradient>
<radialGradient id="${p}-rot" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#3d4a36"/><stop offset="1" stop-color="#2a3326"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="80" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-38" cy="3" rx="22" ry="6" fill="#000" opacity="0.4"/>
<ellipse cx="42" cy="3" rx="15" ry="5" fill="#000" opacity="0.35"/>
<path d="M -12,-120 L -40,-78 L -56,-26 L -44,-6 L -24,-7 L -28,-30 L -14,-74 L 2,-114 Z" fill="url(#${p}-pant)"/>
<path d="M -48,-50 q -5,18 -3,30" stroke="#13130d" stroke-width="3.4" fill="none" opacity="0.7"/>
<path d="M -35,-70 q -4,16 -3,30" stroke="#171710" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -22,-96 q -3,14 -6,28" stroke="#2a2418" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -52,-32 l -6,16 l 3,1 l 5,-15 Z" fill="#13130d" opacity="0.7"/>
<path d="M -46,-40 l -7,22 l 3,1 l 6,-21 Z" fill="#171710" opacity="0.55"/>
<path d="M -40,-30 l -5,26 l 3,1 l 4,-25 Z" fill="#13130d" opacity="0.6"/>
<path d="M -33,-26 l -3,22 l 3,0 l 2,-21 Z" fill="#15110b" opacity="0.55"/>
<path d="M -56,-26 q -10,5 -19,4 l 1,9 q 14,2 26,-3 Z" fill="#0d0e13"/>
<path d="M -44,-6 q -14,3 -26,2 l 1,8 l 35,-1 Z" fill="#0d0e13"/>
<path d="M -28,-30 l -18,4 l 1,6 l 17,-4 Z" fill="#15110b" opacity="0.85"/>
<path d="M -42,-44 q -10,2 -15,8 l 14,-3 Z" fill="url(#${p}-rot)" opacity="0.7"/>
<path d="M -48,-58 q -3,8 1,16" stroke="#2a3326" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M -22,-100 q -3,12 -9,22" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.45"/>
<path d="M -52,-30 q 6,8 4,20 l 5,-2 q 2,-12 -4,-20 Z" fill="url(#${p}-os)" opacity="0.4"/>
<path d="M -58,-22 l -4,18 M -50,-20 l -2,16 M -42,-18 l -1,15" stroke="#15110b" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M 4,-122 L 32,-80 L 46,-28 L 44,-6 L 20,-6 L 18,-30 L 6,-76 L -10,-114 Z" fill="url(#${p}-pantD)"/>
<path d="M 26,-62 q 7,20 5,38" stroke="#13130d" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 14,-90 q 5,18 4,34" stroke="#2a2418" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 36,-58 q 4,16 4,30" stroke="#171710" stroke-width="1.8" fill="none" opacity="0.45"/>
<path d="M 44,-30 l 5,20 l -3,1 l -4,-20 Z" fill="#13130d" opacity="0.65"/>
<path d="M 38,-24 l 4,22 l -3,1 l -3,-22 Z" fill="#171710" opacity="0.55"/>
<path d="M 30,-22 l 2,20 l -3,0 l -1,-19 Z" fill="#15110b" opacity="0.55"/>
<path d="M 46,-28 l 24,2 l -1,8 l -27,0 Z" fill="#0d0e13"/>
<path d="M 20,-6 l -10,2 l 0,7 l 14,-1 Z" fill="#0d0e13"/>
<path d="M 22,-74 l 16,9 l -3,10 l -16,-8 Z" fill="#15110b" opacity="0.85"/>
<path d="M 40,-40 q 10,3 14,11 l -3,4 q -8,-7 -14,-9 Z" fill="url(#${p}-rot)" opacity="0.7"/>
<path d="M 28,-30 q 8,2 11,9" stroke="#3d4a36" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M 38,-22 q 4,10 1,18" stroke="#2a3326" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M 50,-24 l 4,18 M 44,-20 l 2,15" stroke="#15110b" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 10,-120 q 5,14 -2,26 l 8,-2 q 6,-12 1,-24 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -4,-130 q 4,20 -1,44 q -1,7 3,6 q 5,-2 4,-15 q 2,-20 -2,-36 Z" fill="#5e0e16" opacity="0.4"/>
<path d="M -36,-124 Q -52,-176 -32,-208 L 38,-212 Q 56,-172 42,-122 Q 24,-110 0,-112 Q -22,-110 -36,-124 Z" fill="url(#${p}-torse)"/>
<path d="M -36,-124 Q -52,-176 -32,-208 L -8,-210 Q -28,-176 -16,-126 Q -28,-122 -36,-124 Z" fill="url(#${p}-shirtD)"/>
<path d="M 42,-122 Q 56,-172 38,-212 L 16,-211 Q 38,-170 26,-120 Q 36,-118 42,-122 Z" fill="url(#${p}-shirt)"/>
<path d="M -32,-204 Q -4,-216 38,-208 L 35,-192 Q -2,-202 -30,-190 Z" fill="#241c12"/>
<path d="M -30,-190 Q 4,-200 35,-192 L 32,-182 Q 2,-190 -28,-180 Z" fill="#33281a" opacity="0.8"/>
<path d="M -8,-208 L -10,-130 L -4,-130 L -2,-208 Z" fill="#15110b" opacity="0.8"/>
<path d="M -8,-186 L -24,-176 L -8,-172 Z" fill="#15110b" opacity="0.75"/>
<path d="M -4,-160 L 14,-150 L -2,-146 Z" fill="#1a1610" opacity="0.7"/>
<path d="M -28,-170 q -8,6 -10,16 l 10,-4 Z" fill="#15110b" opacity="0.8"/>
<path d="M 30,-200 q 12,8 14,22 l -8,-4 q -2,-12 -10,-16 Z" fill="#33281a" opacity="0.7"/>
<path d="M -2,-128 q -10,4 -22,2 l 6,-12 q 10,4 18,1 Z" fill="#15110b" opacity="0.85"/>
<path d="M 8,-126 q 12,3 24,-2 l -2,-12 q -10,5 -20,2 Z" fill="#1a1610" opacity="0.8"/>
<path d="M -34,-148 q -4,-14 0,-30" stroke="#241c12" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 38,-146 q 4,-14 0,-30" stroke="#33281a" stroke-width="2.6" fill="none" opacity="0.55"/>
<path d="M -20,-184 l 40,-4 q -2,56 -5,60 q -18,4 -31,-1 Z" fill="url(#${p}-skin)"/>
<path d="M -18,-178 q 18,4 33,0 M -19,-166 q 18,5 34,0 M -20,-154 q 19,5 35,0 M -20,-142 q 19,6 35,0 M -19,-131 q 18,5 33,0" stroke="#b3ac96" stroke-width="2.6" fill="none" opacity="0.7"/>
<path d="M -18,-178 q 18,4 33,0 M -20,-154 q 19,5 35,0 M -19,-131 q 18,5 33,0" stroke="#14141a" stroke-width="1.2" fill="none" opacity="0.6"/>
<path d="M -2,-180 L -3,-128 L 1,-128 L 0,-180 Z" fill="#8f8876" opacity="0.55"/>
<path d="M -2,-128 Q 0,-118 4,-114 Q 8,-118 6,-128 Z" fill="url(#${p}-os)" opacity="0.7"/>
<path d="M -20,-150 q -6,3 -8,9 M 16,-150 q 6,3 8,9" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -14,-186 q 2,-8 12,-9 q 10,1 12,9" stroke="#b3ac96" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 16,-178 q 10,2 18,-2 l -2,-10 q -8,4 -16,2 Z" fill="url(#${p}-skin)" opacity="0.85"/>
<path d="M 18,-166 q 9,3 17,-1 M 17,-152 q 9,3 17,-1" stroke="#8f8876" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -40,-168 q -6,4 -7,12 q 5,-2 8,-7 Z" fill="#7a1018" opacity="0.5"/>
<path d="M 4,-130 q -4,16 -10,28" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M 2,-128 q 3,14 0,30" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.45"/>
<path d="M -10,-118 q -10,18 -8,36" stroke="#2a3326" stroke-width="2" fill="none" opacity="0.45"/>
<ellipse cx="34" cy="-194" rx="14" ry="12" fill="url(#${p}-shirt)"/>
<path d="M 36,-198 q -3,-10 4,-15" stroke="#241c12" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 36,-190 Q 58,-184 64,-160 Q 68,-142 52,-134 L 60,-128 Q 72,-118 68,-100 Q 64,-84 52,-78" stroke="url(#${p}-bras)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 36,-190 Q 52,-186 60,-168 L 52,-166 Q 46,-182 34,-186 Z" fill="#241c12" opacity="0.7"/>
<path d="M 52,-134 q -6,3 -10,-1" stroke="#13130d" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M 56,-158 l 10,-4 l 3,7 l -9,5 Z" fill="url(#${p}-os)"/>
<path d="M 59,-157 l 6,-2" stroke="#14141a" stroke-width="1" opacity="0.6"/>
<path d="M 52,-130 q 9,-2 14,3" stroke="#7a1018" stroke-width="3" fill="none" opacity="0.8"/>
<path d="M 62,-118 q 4,2 5,8" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 58,-150 q 3,12 -2,24" stroke="#33281a" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 52,-78 l -3,13 M 52,-78 l 6,12 M 52,-78 l 12,7 M 52,-78 l 12,-3 M 52,-78 l 8,-10" stroke="url(#${p}-bras)" stroke-width="3.2" stroke-linecap="round"/>
<path d="M 64,-71 l 2,4 M 64,-74 l 3,1 M 58,-66 l 1,4" stroke="#14141a" stroke-width="1.6" stroke-linecap="round"/>
<path d="M 59,-66 l 3,3" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
<ellipse cx="-30" cy="-192" rx="13" ry="11" fill="url(#${p}-shirtD)"/>
<path d="M -32,-188 L -54,-152 L -44,-122 L -60,-98 L -48,-84" stroke="url(#${p}-bras)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="miter"/>
<path d="M -32,-188 L -50,-156 L -46,-138" stroke="#241c12" stroke-width="4" fill="none" opacity="0.6" stroke-linecap="round"/>
<path d="M -52,-150 q 6,4 5,14" stroke="#13130d" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -44,-122 q -10,8 -16,20" stroke="#15110b" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -50,-118 l -8,6 l 4,5 l 8,-5 Z" fill="#15110b" opacity="0.8"/>
<path d="M -46,-130 l 8,-3 l 2,6 l -7,4 Z" fill="url(#${p}-os)" opacity="0.85"/>
<path d="M -55,-148 q -3,10 0,20" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -48,-84 l -7,9 M -48,-84 l 1,13 M -48,-84 l 9,9 M -48,-84 l 11,2 M -48,-84 l 8,-8" stroke="url(#${p}-bras)" stroke-width="2.9" stroke-linecap="round"/>
<path d="M -47,-71 l 0,4 M -39,-75 l 3,1" stroke="#14141a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M -40,-75 l 2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round" opacity="0.65"/>
<path d="M -12,-204 L -18,-222 L 16,-226 L 18,-206 Z" fill="url(#${p}-skin)"/>
<path d="M -14,-214 q 15,5 28,-1" stroke="#23211a" stroke-width="2" fill="none" opacity="0.8"/>
<path d="M -12,-206 q 15,4 28,0" stroke="#b3ac96" stroke-width="1.6" fill="none" opacity="0.45"/>
<path d="M -16,-220 l 2,16 M -8,-223 l 1,17 M 2,-224 l 1,17 M 12,-224 l 1,17" stroke="#14141a" stroke-width="1.4" opacity="0.55"/>
<path d="M -18,-222 q -3,8 0,16 l 5,-2 q -2,-8 0,-15 Z" fill="url(#${p}-os)" opacity="0.5"/>
<g transform="rotate(12 0 -224)">
<path d="M -20,-222 Q -30,-256 -2,-266 Q 28,-262 26,-228 Q 25,-216 12,-212 L -6,-214 Q -20,-216 -20,-222 Z" fill="url(#${p}-crane)"/>
<path d="M -18,-226 Q -26,-252 -4,-262 L 2,-260 Q -18,-250 -14,-222 Z" fill="#2d2920" opacity="0.8"/>
<path d="M 6,-260 Q 24,-254 24,-232 Q 24,-222 14,-216 Q 22,-228 20,-242 Q 18,-254 6,-258 Z" fill="#14141a" opacity="0.6"/>
<path d="M -16,-232 q 13,-5 28,-1" stroke="#14141a" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -14,-220 q 8,5 15,4" stroke="#14141a" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M 16,-228 q 7,2 7,9 q -5,3 -10,1 Z" fill="url(#${p}-os)" opacity="0.6"/>
<path d="M -12,-258 q 9,-3 20,-1" stroke="#4a4434" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -14,-250 q -3,5 -1,11 M 20,-248 q 3,5 1,11" stroke="#2d2920" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -18,-242 q -4,4 -3,10 M 24,-240 q 4,4 3,10" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.4"/>
<path d="M -10,-214 Q -8,-208 4,-207 L 4,-213 Q -3,-213 -10,-215 Z" fill="#14141a"/>
<path d="M -8,-212 l 2,4 l 2,-3 l 2,4 l 2,-3" stroke="#8f8876" stroke-width="1.3" fill="none"/>
<path d="M -8,-208 Q -14,-184 -4,-172 Q 8,-170 14,-184 Q 15,-197 7,-205 L -1,-206 Q -4,-206 -8,-208 Z" fill="url(#${p}-crane)"/>
<path d="M -6,-204 Q -10,-186 -2,-176 Q 6,-175 10,-184 Q 10,-194 5,-200 Z" fill="#14141a"/>
<path d="M -4,-202 l 3,3 l 2,-2 l 2,3 l 3,-3 l 2,3" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.9"/>
<path d="M -1,-186 l 0,12 M 5,-188 l 1,12" stroke="#14141a" stroke-width="1" opacity="0.6"/>
<path d="M -8,-209 q -4,9 -3,21" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M 9,-207 q 4,8 3,18" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.65"/>
<path d="M 0,-208 q 1,11 -1,26" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M 4,-174 q 1,7 -2,12" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M -6,-174 q 8,5 18,1" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M -18,-246 q -7,2 -10,9 M 22,-244 q 7,2 10,9" stroke="#2d2920" stroke-width="1.4" fill="none" opacity="0.5"/>
<circle cx="-8" cy="-238" r="6.5" fill="url(#${p}-milky)"/>
<circle cx="-8" cy="-238" r="3" fill="#cfd2c8" opacity="0.85"/>
<circle cx="-8.6" cy="-239" r="3.2" fill="#9aa093" opacity="0.4"/>
<circle cx="-9.3" cy="-239.4" r="1" fill="#eef0e8"/>
<path d="M -15,-240 q 7,-4 14,-1" stroke="#14141a" stroke-width="1.6" fill="none" opacity="0.8"/>
<circle cx="9" cy="-236" r="6.5" fill="url(#${p}-milky)"/>
<circle cx="9" cy="-236" r="3" fill="#cfd2c8" opacity="0.85"/>
<circle cx="8.4" cy="-237" r="3.2" fill="#9aa093" opacity="0.4"/>
<circle cx="7.7" cy="-237.4" r="1" fill="#eef0e8"/>
<path d="M 2,-238 q 7,-3 14,0" stroke="#14141a" stroke-width="1.4" fill="none" opacity="0.75"/>
<path d="M -18,-228 q -5,3 -6,9" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.5"/>
</g>
</g>`;
}

function zRampant(p) { return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.32" r="0.85"><stop offset="0" stop-color="#23222a"/><stop offset="0.5" stop-color="#17161c"/><stop offset="1" stop-color="#0c0d12"/></radialGradient>
<radialGradient id="${p}-dos" cx="0.55" cy="0.3" r="0.9"><stop offset="0" stop-color="#2d2920"/><stop offset="0.55" stop-color="#1d1c24"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.36" cy="0.28" r="0.82"><stop offset="0" stop-color="#3a3526"/><stop offset="0.55" stop-color="#23222a"/><stop offset="1" stop-color="#101117"/></radialGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stop-color="#2d2920"/><stop offset="0.55" stop-color="#1a1920"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-brasD" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stop-color="#23222a"/><stop offset="0.6" stop-color="#15151b"/><stop offset="1" stop-color="#0b0c11"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.66"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-cote" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#c2bba4"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#a31621"/><stop offset="0.65" stop-color="#5e0e16"/><stop offset="1" stop-color="#3d0b12"/></radialGradient>
<radialGradient id="${p}-tripe" cx="0.42" cy="0.35" r="0.7"><stop offset="0" stop-color="#a31621"/><stop offset="0.55" stop-color="#7a1018"/><stop offset="1" stop-color="#4a0c12"/></radialGradient>
<linearGradient id="${p}-trace" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0810" stop-opacity="0"/><stop offset="0.35" stop-color="#5e0e16" stop-opacity="0.7"/><stop offset="0.75" stop-color="#7a1018" stop-opacity="0.92"/><stop offset="1" stop-color="#a31621" stop-opacity="0.95"/></linearGradient>
<radialGradient id="${p}-milky" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="#e6e8e0"/><stop offset="0.6" stop-color="#b6bbac"/><stop offset="1" stop-color="#73786a"/></radialGradient>
</defs>
<ellipse cx="10" cy="2" rx="138" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="86" cy="3" rx="48" ry="8" fill="#000" opacity="0.42"/>
<ellipse cx="-86" cy="4" rx="40" ry="6" fill="#000" opacity="0.4"/>
<path d="M -8,-30 Q 60,-46 110,-34 Q 150,-24 150,-6 Q 150,8 108,8 Q 56,10 -4,2 Z" fill="url(#${p}-trace)" opacity="0.9"/>
<path d="M 28,-30 Q 78,-40 116,-28 Q 142,-20 140,-4 Q 116,4 70,0 Q 40,-4 28,-14 Z" fill="url(#${p}-sang)" opacity="0.85"/>
<path d="M 50,-26 q 16,-3 30,1 q 12,3 12,11 q -2,7 -16,6 q -16,-1 -24,-8 Z" fill="url(#${p}-tripe)"/>
<path d="M 78,-24 q 18,-2 30,3 q 11,4 9,12 q -4,6 -18,3 q -14,-3 -22,-10 Z" fill="url(#${p}-tripe)" opacity="0.95"/>
<path d="M 100,-18 q 16,0 26,6 q 8,5 4,11 q -6,4 -18,0 q -10,-4 -14,-11 Z" fill="url(#${p}-tripe)" opacity="0.9"/>
<path d="M 56,-22 q 12,-1 22,2" stroke="#3d0b12" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M 84,-18 q 12,0 22,4" stroke="#3d0b12" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M 108,-12 q 10,1 16,5" stroke="#3d0b12" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 52,-22 q 6,4 4,12 M 70,-24 q 7,4 5,14 M 92,-20 q 7,3 5,13 M 112,-14 q 6,3 5,11" stroke="#d6303e" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 40,-8 Q 90,-2 130,-2 L 132,4 Q 92,6 42,2 Z" fill="#3d0b12" opacity="0.8"/>
<ellipse cx="120" cy="-8" rx="9" ry="6" fill="url(#${p}-tripe)" opacity="0.85"/>
<ellipse cx="134" cy="-4" rx="6" ry="4" fill="#7a1018" opacity="0.8"/>
<path d="M 24,-34 Q 70,-2 36,8 L 16,4 Q 8,-14 16,-32 Z" fill="url(#${p}-sang)" opacity="0.7"/>
<path d="M -10,-18 Q 30,-22 56,-14 Q 70,-9 60,2 Q 30,8 -8,2 Z" fill="url(#${p}-tripe)" opacity="0.75"/>
<path d="M 4,-12 q 18,-2 30,2 M 0,-4 q 20,1 34,-2" stroke="#4a0c12" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -64,-8 Q -100,-14 -132,-2 Q -150,4 -138,12 Q -118,16 -88,8 Q -72,4 -64,-2 Z" fill="url(#${p}-bras)"/>
<path d="M -68,-10 Q -98,-14 -124,-4 L -120,-9 Q -96,-17 -70,-14 Z" fill="#3a3526" opacity="0.55"/>
<path d="M -132,-2 q -10,4 -8,12 l 10,-3 q -2,-6 6,-8 Z" fill="url(#${p}-bras)"/>
<path d="M -138,2 l -10,5 l 3,5 l 10,-5 Z" fill="url(#${p}-brasD)"/>
<path d="M -138,7 l -11,3 l 2,5 l 11,-3 Z" fill="url(#${p}-bras)"/>
<path d="M -136,11 l -10,5 l 3,4 l 10,-4 Z" fill="url(#${p}-brasD)"/>
<path d="M -134,15 l -8,6 l 3,3 l 8,-5 Z" fill="url(#${p}-bras)"/>
<path d="M -130,18 l -6,7 l 3,2 l 6,-6 Z" fill="url(#${p}-brasD)"/>
<path d="M -148,7 l -4,2 M -149,12 l -3,2 M -146,16 l -3,3 M -142,21 l -2,3" stroke="#0b0c11" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
<path d="M -149,9 l 3,1 M -147,17 l 3,1" stroke="#8f8876" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
<path d="M -108,-8 q -8,4 -10,12" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -96,-4 q -6,4 -7,10" stroke="#0a0b10" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M -88,-6 q 6,-3 13,-1 l -1,6 q -7,-2 -13,1 Z" fill="url(#${p}-os)" opacity="0.7"/>
<ellipse cx="-104" cy="-4" rx="7" ry="3.4" fill="#5e0e16" opacity="0.5"/>
<path d="M -56,-26 Q -20,-36 -36,2 Q -54,8 -64,-2 Q -70,-14 -56,-26 Z" fill="url(#${p}-bras)"/>
<path d="M -52,-24 Q -88,-18 -120,-6 L -122,-3 Q -90,-15 -56,-20 Z" fill="#3a3526" opacity="0.5"/>
<path d="M -44,-22 Q -82,-14 -116,0" stroke="#0a0b10" stroke-width="3" fill="none" opacity="0.45"/>
<path d="M -70,-12 q 7,-3 14,-1 l -1,6 q -7,-2 -14,1 Z" fill="url(#${p}-os)" opacity="0.6"/>
<ellipse cx="-82" cy="-6" rx="8" ry="3.6" fill="#5e0e16" opacity="0.55"/>
<path d="M -100,-2 q 5,5 4,13" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -60,-26 Q -10,-46 24,-30 Q 44,-20 36,2 Q 28,12 -4,8 Q -42,4 -60,-12 Z" fill="url(#${p}-torse)"/>
<path d="M -56,-28 Q -18,-42 20,-30 L 16,-22 Q -16,-32 -50,-22 Z" fill="#3a3526" opacity="0.4"/>
<path d="M 20,-30 Q 42,-22 36,0 Q 30,9 8,8 L 12,-6 Q 24,-18 20,-30 Z" fill="url(#${p}-dos)"/>
<path d="M 6,-28 L 8,8 M 18,-26 q 4,18 0,32 M -8,-30 L -8,6" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 28,-26 q 8,3 12,-2 l 2,8 q -6,5 -14,2 Z" fill="url(#${p}-cote)" opacity="0.92"/>
<path d="M 30,-16 q 8,3 12,-1 l 1,7 q -6,4 -13,1 Z" fill="url(#${p}-cote)" opacity="0.9"/>
<path d="M 30,-6 q 8,3 12,0 l 0,7 q -6,3 -12,1 Z" fill="url(#${p}-cote)" opacity="0.86"/>
<path d="M 32,4 q 7,2 11,0 l -1,6 q -6,2 -11,0 Z" fill="url(#${p}-cote)" opacity="0.8"/>
<path d="M 30,-22 l 11,1 M 31,-12 l 11,1 M 31,-2 l 11,1 M 33,8 l 9,1" stroke="#5c5746" stroke-width="1.4" opacity="0.7"/>
<path d="M 24,-28 Q 30,0 28,10" stroke="#8f8876" stroke-width="2.4" fill="none" opacity="0.75"/>
<path d="M 24,-28 Q 30,0 28,10" stroke="#0a0b10" stroke-width="1" fill="none" opacity="0.5"/>
<path d="M 20,-30 q 6,-2 8,-8 q 6,4 4,10 q -6,3 -12,2 Z" fill="url(#${p}-sang)" opacity="0.7"/>
<path d="M 16,-24 q 8,-1 12,-6" stroke="#a31621" stroke-width="2" fill="none" opacity="0.6"/>
<ellipse cx="-30" cy="-18" rx="9" ry="5" fill="#3d0b12" opacity="0.6"/>
<ellipse cx="-30" cy="-18" rx="5" ry="3" fill="#7a1018" opacity="0.7"/>
<ellipse cx="-8" cy="-8" rx="7" ry="4" fill="#3d0b12" opacity="0.55"/>
<ellipse cx="-44" cy="-6" rx="6" ry="3.4" fill="#5e0e16" opacity="0.55"/>
<path d="M -18,-30 q -4,16 -6,30" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -38,-26 Q -52,-30 -54,-20 Q -52,-12 -40,-12 Z" fill="url(#${p}-torse)"/>
<path d="M -40,-22 q -8,1 -10,6" stroke="#0a0b10" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -34,-40 Q -44,-58 -28,-66 L 4,-66 Q 16,-54 12,-38 Q 0,-30 -16,-30 Q -28,-32 -34,-40 Z" fill="url(#${p}-dos)"/>
<path d="M -30,-44 Q -38,-58 -26,-64 L -10,-64 Q -24,-56 -22,-42 Z" fill="#3a3526" opacity="0.45"/>
<path d="M -8,-62 q -2,16 -4,28 M 2,-60 q 0,14 -2,26" stroke="#0a0b10" stroke-width="1.4" fill="none" opacity="0.5"/>
<ellipse cx="-18" cy="-48" rx="7" ry="4" fill="#3d0b12" opacity="0.6"/>
<ellipse cx="-18" cy="-48" rx="4" ry="2.4" fill="#7a1018" opacity="0.7"/>
<path d="M 4,-52 q 6,3 8,-2 q 4,6 -2,9 q -6,1 -10,-3 Z" fill="url(#${p}-sang)" opacity="0.6"/>
<path d="M -28,-58 Q -36,-90 -8,-104 Q 22,-100 24,-66 Q 22,-50 4,-48 Q -20,-46 -28,-58 Z" fill="url(#${p}-crane)"/>
<path d="M -26,-62 Q -34,-88 -10,-100 L -2,-98 Q -26,-86 -22,-58 Z" fill="#3a3526" opacity="0.6"/>
<path d="M 6,-100 Q 22,-92 22,-70 Q 22,-58 10,-52 Q 18,-66 16,-82 Q 14,-94 4,-98 Z" fill="#101117" opacity="0.55"/>
<path d="M -24,-86 Q -10,-104 6,-104 Q 18,-101 22,-90 Q 6,-100 -10,-96 Q -20,-93 -24,-86 Z" fill="#2d2920"/>
<path d="M -22,-90 Q -8,-101 4,-101 M -20,-84 Q -4,-95 12,-92 M -16,-78 Q -2,-88 16,-83" stroke="#15140f" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -22,-88 q 4,-6 12,-8 M 0,-99 q 10,-2 18,4 M -10,-94 q 8,-4 16,-2" stroke="#3a3526" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -10,-100 l -3,12 M 2,-100 l 0,12 M -22,-90 l -2,10 M 14,-92 l 3,10" stroke="#15140f" stroke-width="1.4" opacity="0.55"/>
<path d="M -26,-66 q 8,-4 18,-2" stroke="#15140f" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 4,-66 q 8,-3 16,1" stroke="#15140f" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -22,-72 Q -16,-78 -8,-74 Q -14,-70 -22,-72 Z" fill="#0a0b10"/>
<path d="M 4,-72 Q 12,-77 20,-72 Q 12,-69 4,-72 Z" fill="#0a0b10"/>
<path d="M -20,-72 q 6,-3 11,-1" stroke="#15140f" stroke-width="1.4" fill="none" opacity="0.7"/>
<circle cx="-13" cy="-72" r="6.2" fill="url(#${p}-milky)"/>
<circle cx="-13" cy="-72" r="6.2" fill="none" stroke="#15140f" stroke-width="1.2" opacity="0.7"/>
<circle cx="-13" cy="-72" r="2.4" fill="#3a3a40"/>
<circle cx="-13" cy="-72" r="1.1" fill="#0a0b10"/>
<circle cx="-14.4" cy="-73.2" r="1.1" fill="#f2f3ec"/>
<path d="M -19,-77 q 6,-3 12,0" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<circle cx="11" cy="-71" r="6.2" fill="url(#${p}-milky)"/>
<circle cx="11" cy="-71" r="6.2" fill="none" stroke="#15140f" stroke-width="1.2" opacity="0.7"/>
<circle cx="11" cy="-71" r="2.4" fill="#3a3a40"/>
<circle cx="11" cy="-71" r="1.1" fill="#0a0b10"/>
<circle cx="9.6" cy="-72.2" r="1.1" fill="#f2f3ec"/>
<path d="M 5,-76 q 6,-3 12,0" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -2,-72 q -3,8 -6,12 q 4,2 8,0" stroke="#15140f" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -3,-72 l -1,10" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -12,-58 Q -2,-62 8,-58 Q 12,-54 8,-50 Q -2,-46 -12,-50 Q -16,-54 -12,-58 Z" fill="#0a0b10"/>
<path d="M -12,-58 Q -2,-61 8,-58 L 8,-56 Q -2,-59 -12,-56 Z" fill="#2d2920" opacity="0.8"/>
<path d="M -10,-57 l 0,5 M -6,-58 l 0,6 M -2,-58 l 0,6 M 2,-58 l 0,6 M 6,-57 l 0,5" stroke="#6b5f47" stroke-width="2.2" opacity="0.85"/>
<path d="M -10,-52 l 1,4 M -6,-52 l 0,4 M -2,-52 l 0,4 M 2,-52 l 0,4 M 6,-52 l -1,4" stroke="#5c5640" stroke-width="2" opacity="0.7"/>
<path d="M -8,-49 q 8,3 16,0" stroke="#15140f" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -4,-50 q -2,10 -4,18 q 3,2 6,0" stroke="#0a0b10" stroke-width="2.2" fill="none" opacity="0.75"/>
<path d="M -5,-49 q -2,9 -3,16" stroke="#3d0b12" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M 2,-49 q 1,8 -2,14" stroke="#0a0b10" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -22,-58 q -4,6 -3,14" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 18,-56 q 4,6 3,14" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.45"/>
<path d="M -30,-50 q 6,8 4,18" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -34,-40 q -6,4 -14,2" stroke="#0a0b10" stroke-width="1.4" fill="none" opacity="0.5"/>
</g>`; }

function zCoureur(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-skin" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stop-color="#2d2920"/><stop offset="0.5" stop-color="#1d1c24"/><stop offset="1" stop-color="#101117"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.34" cy="0.24" r="0.86"><stop offset="0" stop-color="#3a3526"/><stop offset="0.5" stop-color="#23222a"/><stop offset="1" stop-color="#14151b"/></radialGradient>
<linearGradient id="${p}-veste" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#363f49"/><stop offset="0.5" stop-color="#252b33"/><stop offset="1" stop-color="#14171c"/></linearGradient>
<linearGradient id="${p}-vesteD" x1="0" y1="0" x2="1" y2="0.7"><stop offset="0" stop-color="#2a313a"/><stop offset="0.5" stop-color="#1c2128"/><stop offset="1" stop-color="#10131a"/></linearGradient>
<linearGradient id="${p}-shirt" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#6b6f76"/><stop offset="0.5" stop-color="#4a4e55"/><stop offset="1" stop-color="#2c2f36"/></linearGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#a31621"/><stop offset="0.6" stop-color="#7a1018"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<linearGradient id="${p}-jean" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16171d"/><stop offset="0.5" stop-color="#2a313a"/><stop offset="1" stop-color="#16171d"/></linearGradient>
<linearGradient id="${p}-jeanD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121319"/><stop offset="0.5" stop-color="#222831"/><stop offset="1" stop-color="#15161c"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a3038"/><stop offset="1" stop-color="#13151a"/></linearGradient>
<linearGradient id="${p}-avant" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#2d2920"/><stop offset="1" stop-color="#13141a"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="86" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-52" cy="3" rx="20" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="46" cy="3" rx="16" ry="5" fill="#000" opacity="0.32"/>
<path d="M -8,-118 Q 22,-110 44,-92 Q 70,-70 84,-44 L 70,-30 Q 54,-58 30,-78 Q 8,-94 -14,-100 Z" fill="url(#${p}-jeanD)"/>
<path d="M 20,-104 q 16,12 28,28" stroke="#121319" stroke-width="3.4" fill="none" opacity="0.7"/>
<path d="M 38,-86 q 14,14 24,32" stroke="#222831" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M 48,-66 q 12,12 20,28" stroke="#121319" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M 84,-44 q 14,-2 26,4 l -4,12 q -12,-6 -24,-4 Z" fill="#16171d"/>
<path d="M 70,-30 q 12,-3 22,3 l -3,9 q -10,-5 -21,-2 Z" fill="#0d0e13"/>
<path d="M 104,-40 q 12,0 18,7 l -3,8 q -8,-7 -19,-5 Z" fill="#1d1c24"/>
<path d="M 118,-32 q 8,3 8,11 l -22,2 l 1,-9 Z" fill="#0d0e13"/>
<path d="M 108,-24 l 14,1 l 0,5 l -14,0 Z" fill="#b3ac96" opacity="0.45"/>
<path d="M 60,-56 q 10,5 14,15" stroke="#5e0e16" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M -16,-122 Q -40,-112 -54,-92 Q -72,-64 -76,-34 L -60,-26 Q -54,-58 -38,-80 Q -22,-98 -2,-106 Z" fill="url(#${p}-jean)"/>
<path d="M -36,-104 q -14,16 -22,40" stroke="#16171d" stroke-width="3.4" fill="none" opacity="0.7"/>
<path d="M -22,-114 q -12,12 -20,30" stroke="#2a313a" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -52,-72 q -8,16 -8,38" stroke="#121319" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -76,-34 q -16,-2 -28,5 l 5,13 q 12,-7 25,-5 Z" fill="#15161c"/>
<path d="M -60,-26 q -13,-2 -23,5 l 4,9 q 10,-5 21,-3 Z" fill="#0d0e13"/>
<path d="M -104,-29 q -10,2 -13,11 l 24,3 l 1,-9 Z" fill="#1a1922"/>
<path d="M -117,-18 q -3,4 0,9 l 26,-1 l -1,-8 Z" fill="#0d0e13"/>
<path d="M -113,-11 l 22,-1 l 0,5 l -22,1 Z" fill="#8f8876" opacity="0.4"/>
<path d="M -50,-58 q 6,8 4,20" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.45"/>
<path d="M -2,-112 q 14,4 22,16 l -8,10 q -10,-12 -22,-14 Z" fill="#16171d" opacity="0.85"/>
<path d="M -14,-120 q -12,2 -22,10 l 6,10 q 10,-8 22,-8 Z" fill="#1d1c24" opacity="0.8"/>
<path d="M -38,-118 Q -52,-156 -42,-200 Q -22,-222 16,-220 Q 50,-214 56,-176 Q 60,-148 44,-118 Q 20,-104 -6,-108 Q -26,-110 -38,-118 Z" fill="url(#${p}-veste)"/>
<path d="M -38,-118 Q -52,-156 -42,-200 L -20,-204 Q -34,-160 -24,-120 Q -32,-118 -38,-118 Z" fill="url(#${p}-vesteD)"/>
<path d="M 44,-118 Q 60,-148 54,-188 L 34,-196 Q 50,-156 38,-114 Q 42,-114 44,-118 Z" fill="url(#${p}-veste)"/>
<path d="M -22,-204 Q 4,-216 38,-200 L 32,-180 Q 2,-194 -18,-184 Z" fill="#2a313a"/>
<path d="M -28,-180 L -8,-110 L 0,-112 L -16,-184 Z" fill="url(#${p}-shirt)"/>
<path d="M -16,-184 L -4,-114 L 6,-114 L 4,-186 Z" fill="url(#${p}-shirt)"/>
<path d="M 4,-186 L 8,-114 L 22,-118 L 26,-182 Z" fill="url(#${p}-shirt)"/>
<path d="M -18,-186 Q 4,-194 26,-184 L 24,-176 Q 2,-184 -16,-178 Z" fill="#6b6f76" opacity="0.7"/>
<path d="M -28,-180 Q 0,-188 28,-180" stroke="#2c2f36" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -14,-178 L -16,-118 L -12,-118 L -10,-178 Z" fill="#2c2f36" opacity="0.55"/>
<path d="M 12,-178 L 12,-120 L 16,-120 L 18,-178 Z" fill="#2c2f36" opacity="0.45"/>
<path d="M -20,-150 q 14,5 30,1 q 18,-3 26,3" stroke="#2c2f36" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M -22,-148 Q -4,-138 18,-144 Q 26,-126 14,-114 Q -6,-108 -22,-118 Q -28,-134 -22,-148 Z" fill="url(#${p}-sang)" opacity="0.92"/>
<path d="M -22,-148 Q -4,-138 18,-144 Q 12,-150 0,-150 Q -14,-152 -22,-148 Z" fill="#a31621" opacity="0.5"/>
<path d="M -16,-120 q -4,14 -10,26 M -2,-114 q 0,16 -3,30 M 10,-116 q 4,14 2,28" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -8,-112 q 2,18 -2,34" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M 14,-138 q 8,6 8,16 q 0,8 -6,12" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.6"/>
<ellipse cx="-6" cy="-130" rx="9" ry="6" fill="#a31621" opacity="0.5"/>
<path d="M 18,-150 q 6,-4 14,-2 l 3,10 q -8,-2 -15,1 Z" fill="#5e0e16" opacity="0.55"/>
<path d="M -32,-200 Q -54,-196 -64,-176 Q -72,-160 -86,-150 L -98,-138" stroke="url(#${p}-bras)" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -34,-198 Q -52,-192 -60,-176 L -50,-172 Q -42,-188 -30,-194 Z" fill="#2a313a" opacity="0.7"/>
<path d="M -64,-176 q -4,8 -14,14" stroke="#10131a" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -86,-150 q -8,4 -12,12" stroke="#10131a" stroke-width="3.4" fill="none" opacity="0.6"/>
<path d="M -90,-148 q -10,-2 -18,6 q -8,8 -6,16 q 1,7 8,7 q -3,-9 4,-15 q 6,-6 14,-4 Z" fill="url(#${p}-avant)"/>
<path d="M -98,-138 q -8,3 -12,11" stroke="#13141a" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -106,-126 l -10,4 l -3,-6 l 9,-5 Z" fill="url(#${p}-os)"/>
<path d="M -109,-128 l -7,2" stroke="#14151b" stroke-width="1" opacity="0.6"/>
<path d="M -104,-122 q -12,-2 -16,5 M -103,-119 q -11,1 -14,8 M -105,-115 q -10,3 -12,10" stroke="url(#${p}-avant)" stroke-width="4" stroke-linecap="round"/>
<path d="M -116,-112 q -5,2 -6,7 M -114,-107 q -4,3 -4,8" stroke="#13141a" stroke-width="3" stroke-linecap="round"/>
<path d="M -118,-105 l -2,3 M -116,-100 l -1,4" stroke="#14151b" stroke-width="1.4" stroke-linecap="round"/>
<path d="M -106,-118 q -6,6 -10,4" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 26,-194 Q 50,-186 64,-168 Q 78,-152 92,-148 L 106,-146" stroke="url(#${p}-bras)" stroke-width="19" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 28,-192 Q 48,-184 60,-168 L 50,-162 Q 40,-180 26,-186 Z" fill="#2a313a" opacity="0.7"/>
<path d="M 64,-168 q 8,6 18,12" stroke="#10131a" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 86,-152 q 8,2 18,4" stroke="#10131a" stroke-width="3.4" fill="none" opacity="0.55"/>
<path d="M 90,-150 q 10,-1 18,4 q 8,5 8,13 q 0,6 -7,6 q 1,-9 -7,-13 q -7,-3 -14,-1 Z" fill="url(#${p}-avant)"/>
<path d="M 106,-146 q 10,1 16,7" stroke="#13141a" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M 116,-138 l 10,-2 l 2,7 l -10,3 Z" fill="url(#${p}-os)"/>
<path d="M 119,-138 l 6,-1" stroke="#14151b" stroke-width="1" opacity="0.6"/>
<path d="M 112,-140 q 12,1 17,8 M 113,-136 q 11,3 14,10 M 111,-132 q 10,4 12,11" stroke="url(#${p}-avant)" stroke-width="4.2" stroke-linecap="round"/>
<path d="M 127,-126 q 5,3 5,9 M 125,-121 q 4,4 3,9" stroke="#13141a" stroke-width="3" stroke-linecap="round"/>
<path d="M 132,-118 l 1,4 M 127,-113 l 1,4" stroke="#14151b" stroke-width="1.4" stroke-linecap="round"/>
<path d="M 116,-132 q 8,3 12,0" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M 110,-148 q 5,-3 11,-1" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M -16,-198 L -20,-216 L 14,-220 L 18,-202 Z" fill="url(#${p}-skin)"/>
<path d="M -14,-210 q 14,5 28,-1" stroke="#23222a" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -16,-202 q 14,5 30,-1" stroke="#3a3526" stroke-width="1.6" fill="none" opacity="0.4"/>
<path d="M -10,-214 q 12,6 22,2" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.45"/>
<g transform="rotate(15 0 -222)">
<path d="M -20,-220 Q -32,-256 -2,-268 Q 30,-264 28,-228 Q 27,-214 12,-210 L -6,-212 Q -20,-214 -20,-220 Z" fill="url(#${p}-crane)"/>
<path d="M -18,-224 Q -28,-252 -4,-262 L 4,-260 Q -18,-250 -14,-220 Z" fill="#3a3526" opacity="0.65"/>
<path d="M 8,-262 Q 26,-254 26,-232 Q 26,-220 14,-214 Q 24,-228 22,-244 Q 19,-256 8,-260 Z" fill="#14151b" opacity="0.6"/>
<ellipse cx="-2" cy="-256" rx="20" ry="11" fill="#23222a" opacity="0.5"/>
<path d="M -16,-256 q 14,-7 30,-2" stroke="#3a3526" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M -10,-262 q 8,-4 16,-1" stroke="#4a4434" stroke-width="1.4" fill="none" opacity="0.45"/>
<path d="M -18,-244 q -5,4 -4,12 M 26,-242 q 5,4 4,12" stroke="#23222a" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -20,-236 q -6,5 -4,13" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.4"/>
<path d="M -16,-230 q 13,-6 28,-2" stroke="#14151b" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -14,-220 q 8,5 16,4" stroke="#14151b" stroke-width="2.4" fill="none" opacity="0.8"/>
<circle cx="-9" cy="-236" r="6" fill="url(#${p}-eye)"/>
<circle cx="-9" cy="-236" r="2.6" fill="#d6303e"/>
<circle cx="-9.8" cy="-236.8" r="0.9" fill="#e8868d"/>
<path d="M -16,-239 q 7,-5 14,-2" stroke="#14151b" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -15,-232 q 6,3 13,2" stroke="#101117" stroke-width="1.4" fill="none" opacity="0.6"/>
<circle cx="11" cy="-234" r="6" fill="url(#${p}-eye)"/>
<circle cx="11" cy="-234" r="2.6" fill="#d6303e"/>
<circle cx="10.2" cy="-234.8" r="0.9" fill="#e8868d"/>
<path d="M 3,-237 q 8,-4 15,-1" stroke="#14151b" stroke-width="1.6" fill="none" opacity="0.8"/>
<path d="M 4,-230 q 7,3 14,1" stroke="#101117" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M -1,-228 l -2,12" stroke="#14151b" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -6,-216 Q -2,-212 4,-213" stroke="#14151b" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -10,-212 Q -8,-184 10,-178 Q 26,-180 26,-202 Q 24,-210 14,-213 L -2,-214 Q -7,-214 -10,-212 Z" fill="url(#${p}-crane)"/>
<path d="M -10,-212 Q -8,-188 8,-182 Q 22,-184 24,-202 Q 12,-194 -2,-200 Q -8,-204 -10,-212 Z" fill="#5e0e16" opacity="0.85"/>
<path d="M -8,-208 Q -6,-188 8,-184 Q 20,-186 22,-200 Q 10,-194 -2,-198 Q -7,-202 -8,-208 Z" fill="#7a1018" opacity="0.7"/>
<path d="M -6,-204 l 3,4 l 3,-3 l 3,4 l 3,-3 l 3,4 l 3,-3" stroke="#b3ac96" stroke-width="1.4" fill="none" opacity="0.85"/>
<path d="M -5,-194 l 2,8 M 2,-193 l 1,9 M 9,-193 l 0,8 M 15,-194 l -1,7" stroke="#5e0e16" stroke-width="1.4" opacity="0.7"/>
<path d="M -10,-180 q 8,8 20,4 q 10,-4 12,-14" stroke="#3d0b12" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 0,-178 q 6,16 2,30" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M 10,-180 q 8,12 8,26" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -6,-179 q -2,12 -8,22" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.55"/>
<ellipse cx="6" cy="-180" rx="14" ry="6" fill="#3d0b12" opacity="0.6"/>
<path d="M -20,-228 q -6,3 -8,10 M 26,-224 q 6,3 8,10" stroke="#23222a" stroke-width="1.4" fill="none" opacity="0.5"/>
</g>
</g>`;
}

function zEnrage(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-skin" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stop-color="#3a3526"/><stop offset="0.5" stop-color="#23211a"/><stop offset="1" stop-color="#121118"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.34" cy="0.26" r="0.85"><stop offset="0" stop-color="#4a4434"/><stop offset="0.55" stop-color="#2d2920"/><stop offset="1" stop-color="#14141a"/></radialGradient>
<linearGradient id="${p}-parka" x1="0.18" y1="0" x2="0.82" y2="1"><stop offset="0" stop-color="#8c7d5f"/><stop offset="0.5" stop-color="#6b5f47"/><stop offset="1" stop-color="#4a4332"/></linearGradient>
<linearGradient id="${p}-parkaD" x1="0" y1="0" x2="1" y2="0.7"><stop offset="0" stop-color="#6b5f47"/><stop offset="0.5" stop-color="#4f4734"/><stop offset="1" stop-color="#363121"/></linearGradient>
<linearGradient id="${p}-parkaL" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#9c8d6b"/><stop offset="0.5" stop-color="#7c6f53"/><stop offset="1" stop-color="#564d39"/></linearGradient>
<linearGradient id="${p}-pant" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#564e3a"/><stop offset="0.5" stop-color="#73684e"/><stop offset="1" stop-color="#4a4332"/></linearGradient>
<linearGradient id="${p}-pantD" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#403925"/><stop offset="0.5" stop-color="#5b5239"/><stop offset="1" stop-color="#352f1f"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c6f53"/><stop offset="0.55" stop-color="#564d39"/><stop offset="1" stop-color="#352f1f"/></linearGradient>
<linearGradient id="${p}-brasD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5239"/><stop offset="0.6" stop-color="#3d3724"/><stop offset="1" stop-color="#26220f"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#a31621"/><stop offset="0.65" stop-color="#7a1018"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<radialGradient id="${p}-sangV" cx="0.5" cy="0.4" r="0.65"><stop offset="0" stop-color="#7a1018"/><stop offset="0.7" stop-color="#5e0e16"/><stop offset="1" stop-color="#3d0b12"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="92" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-58" cy="3" rx="22" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="50" cy="4" rx="18" ry="5" fill="#000" opacity="0.35"/>
<path d="M -8,-118 L -44,-92 L -72,-44 L -84,-8 L -64,-2 L -56,-30 L -34,-74 L -8,-104 L 8,-110 Z" fill="url(#${p}-pant)"/>
<path d="M -48,-78 q -14,26 -22,46" stroke="#403925" stroke-width="3.4" fill="none" opacity="0.6"/>
<path d="M -34,-74 q -10,20 -16,38" stroke="#352f1f" stroke-width="2.2" fill="none" opacity="0.5"/>
<path d="M -60,-44 q 8,4 18,1" stroke="#352f1f" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -84,-8 q -16,2 -28,-2 l -2,9 q 16,5 33,2 Z" fill="#101117"/>
<path d="M -112,-10 q -6,1 -8,6 l 1,7 q 6,1 10,-2 Z" fill="#0d0e13"/>
<path d="M -64,-2 q -16,3 -30,1 l 0,8 q 18,2 33,-1 Z" fill="#14151b"/>
<path d="M -84,-8 l -18,3 l 0,6 l 19,-2 Z" fill="#1d1c24" opacity="0.7"/>
<path d="M -56,-30 l 18,-40 l 6,3 l -18,40 Z" fill="#5e0e16" opacity="0.45"/>
<path d="M -44,-92 q 10,4 22,2" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.4"/>
<path d="M -70,-40 q -6,10 -8,22" stroke="#a31621" stroke-width="2" fill="none" opacity="0.35"/>
<path d="M 6,-122 L 38,-94 L 64,-50 L 86,-16 L 74,-8 L 50,-38 L 30,-78 L 8,-108 L -8,-112 Z" fill="url(#${p}-pantD)"/>
<path d="M 42,-80 q 14,24 28,44" stroke="#352f1f" stroke-width="3.2" fill="none" opacity="0.6"/>
<path d="M 30,-78 q 12,20 22,36" stroke="#403925" stroke-width="2.2" fill="none" opacity="0.5"/>
<path d="M 86,-16 q 16,1 28,5 l -1,8 q -16,-4 -30,-5 Z" fill="#101117"/>
<path d="M 114,-11 q 6,2 7,7 l -2,7 q -6,-3 -9,-5 Z" fill="#0d0e13"/>
<path d="M 74,-8 q 14,2 26,5 l -1,8 q -16,-3 -28,-4 Z" fill="#14151b"/>
<path d="M 86,-16 l 18,4 l -1,6 l -18,-3 Z" fill="#1d1c24" opacity="0.7"/>
<path d="M 50,-38 l -16,-38 l 6,-2 l 16,38 Z" fill="#5e0e16" opacity="0.4"/>
<path d="M 60,-48 q 8,8 14,20" stroke="#7a1018" stroke-width="2.2" fill="none" opacity="0.4"/>
<path d="M 38,-94 q 10,2 20,-1" stroke="#a31621" stroke-width="2" fill="none" opacity="0.35"/>
<path d="M -2,-126 q 6,16 0,30 l 12,-1 q 6,-16 -2,-30 Z" fill="url(#${p}-pant)"/>
<path d="M 0,-124 q 4,14 -1,28" stroke="#403925" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -4,-122 q -3,18 4,40" stroke="#7a1018" stroke-width="2.6" fill="none" opacity="0.4"/>
<path d="M -48,-128 Q -54,-178 -34,-214 L 40,-216 Q 60,-178 50,-126 Q 30,-114 0,-116 Q -30,-114 -48,-128 Z" fill="url(#${p}-parka)"/>
<path d="M -48,-128 Q -56,-176 -40,-210 L -10,-212 Q -30,-176 -22,-122 Q -36,-122 -48,-128 Z" fill="url(#${p}-parkaD)"/>
<path d="M 50,-126 Q 60,-176 42,-214 L 14,-212 Q 34,-176 26,-120 Q 40,-120 50,-126 Z" fill="url(#${p}-parkaL)"/>
<path d="M -40,-208 Q -4,-220 42,-210 L 38,-194 Q -4,-204 -36,-192 Z" fill="#564d39"/>
<path d="M -36,-192 Q 2,-202 38,-194 L 35,-182 Q 0,-190 -34,-180 Z" fill="#7c6f53" opacity="0.85"/>
<path d="M -22,-210 L -16,-122 L -8,-122 L -12,-210 Z" fill="#3d3724" opacity="0.85"/>
<path d="M -16,-122 Q -4,-118 4,-118 Q 14,-118 24,-122 L 22,-130 Q 4,-124 -14,-130 Z" fill="#3d3724" opacity="0.7"/>
<path d="M -18,-200 q -10,8 -12,20 l 12,-6 Z" fill="#564d39" opacity="0.7"/>
<path d="M 24,-198 q 12,8 14,22 l -10,-6 Z" fill="#564d39" opacity="0.7"/>
<path d="M -14,-200 L -28,-186 L -12,-182 Z" fill="#3d3724" opacity="0.7"/>
<path d="M 18,-178 L 32,-166 L 16,-162 Z" fill="#3d3724" opacity="0.6"/>
<path d="M -20,-160 q 12,6 26,4 q 16,-2 30,-10 q -10,16 -28,18 q -20,2 -34,-4 Z" fill="#3d3724" opacity="0.5"/>
<path d="M -18,-190 q -2,30 0,62 q 18,8 38,2 q 4,-32 0,-66 q -20,8 -38,2 Z" fill="url(#${p}-sang)" opacity="0.9"/>
<path d="M -16,-186 q 14,6 32,0 q 2,28 -2,56 q -14,5 -28,0 q -4,-28 -2,-56 Z" fill="url(#${p}-sangV)" opacity="0.85"/>
<path d="M -10,-200 q -6,14 -2,30 q 4,12 -2,26" stroke="#a31621" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M 6,-204 q 8,16 4,38 q -2,16 4,32" stroke="#7a1018" stroke-width="3.4" fill="none" opacity="0.65"/>
<path d="M -4,-198 q 2,40 -2,74" stroke="#5e0e16" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M 16,-178 q 6,30 -2,56" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M -22,-150 q 18,10 42,2" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -18,-128 q 18,8 38,1" stroke="#a31621" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -16,-122 q -6,16 -10,30 l 8,-2 q 4,-14 8,-26 Z" fill="#5e0e16" opacity="0.7"/>
<path d="M 18,-120 q 8,16 8,32 l -8,-4 q -2,-14 -8,-26 Z" fill="#7a1018" opacity="0.65"/>
<path d="M 2,-118 q 0,22 -4,42" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -10,-138 l -4,8 l 6,2 l 3,-7 Z" fill="#d6303e" opacity="0.6"/>
<path d="M 14,-148 l 5,7 l -5,4 l -5,-7 Z" fill="#a31621" opacity="0.6"/>
<path d="M -2,-110 q 4,18 -2,34" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.55"/>
<ellipse cx="-44" cy="-198" rx="14" ry="13" fill="url(#${p}-parkaD)"/>
<path d="M -46,-202 q -4,-10 4,-16" stroke="#3d3724" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -44,-194 Q -68,-180 -76,-150 Q -80,-128 -66,-114 L -58,-96 Q -50,-82 -56,-66" stroke="url(#${p}-brasD)" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -44,-194 Q -62,-184 -70,-156 L -62,-152 Q -56,-178 -42,-188 Z" fill="#564d39" opacity="0.6"/>
<path d="M -68,-130 q 6,4 6,16" stroke="#26220f" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M -72,-150 q -6,18 0,34" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M -58,-96 q -10,10 -10,24" stroke="#26220f" stroke-width="3.2" fill="none" opacity="0.55"/>
<path d="M -56,-66 l -8,12 M -56,-66 l 0,15 M -56,-66 l 9,11 M -56,-66 l 13,4 M -56,-66 l 10,-9" stroke="url(#${p}-skin)" stroke-width="4" stroke-linecap="round"/>
<path d="M -64,-54 l 0,5 M -47,-55 l 4,2 M -56,-51 l 1,5" stroke="#14141a" stroke-width="1.8" stroke-linecap="round"/>
<path d="M -50,-58 l 4,3" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
<path d="M -64,-114 q 10,3 16,12" stroke="#7a1018" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -56,-72 q 8,-2 14,3" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.55"/>
<ellipse cx="44" cy="-200" rx="14" ry="13" fill="url(#${p}-parkaL)"/>
<path d="M 46,-204 q 4,-10 -4,-16" stroke="#564d39" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M 44,-196 Q 70,-186 80,-156 Q 86,-134 74,-118 L 70,-100 Q 64,-84 72,-68" stroke="url(#${p}-bras)" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 44,-196 Q 62,-188 72,-160 L 64,-156 Q 58,-180 42,-190 Z" fill="#9c8d6b" opacity="0.6"/>
<path d="M 76,-134 q -6,4 -6,16" stroke="#352f1f" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 80,-154 q 6,18 -2,34" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.45"/>
<path d="M 70,-100 q 10,10 12,24" stroke="#352f1f" stroke-width="3.2" fill="none" opacity="0.55"/>
<path d="M 72,-68 l 10,12 M 72,-68 l 2,16 M 72,-68 l -8,12 M 72,-68 l -13,5 M 72,-68 l -10,-8" stroke="url(#${p}-skin)" stroke-width="4" stroke-linecap="round"/>
<path d="M 82,-56 l 0,5 M 64,-56 l -4,2 M 74,-52 l -1,5" stroke="#14141a" stroke-width="1.8" stroke-linecap="round"/>
<path d="M 66,-58 l -4,3" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
<path d="M 76,-118 q -10,2 -16,11" stroke="#a31621" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M 72,-74 q -8,-2 -14,3" stroke="#7a1018" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M -16,-208 L -22,-228 L 18,-232 L 22,-210 Z" fill="url(#${p}-skin)"/>
<path d="M -18,-220 q 18,5 34,-1" stroke="#23211a" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M -16,-210 q 18,4 32,0" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -20,-226 l 2,18 M -8,-229 l 1,19 M 4,-230 l 1,19 M 14,-230 l 1,19" stroke="#14141a" stroke-width="1.4" opacity="0.5"/>
<path d="M -22,-228 q -4,9 0,18 l 6,-2 q -3,-9 0,-16 Z" fill="url(#${p}-os)" opacity="0.45"/>
<path d="M 0,-216 q 8,4 16,1" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.5"/>
<g transform="rotate(20 0 -228)">
<path d="M -22,-226 Q -32,-262 -2,-274 Q 30,-270 28,-234 Q 27,-220 12,-216 L -8,-218 Q -22,-220 -22,-226 Z" fill="url(#${p}-crane)"/>
<path d="M -20,-230 Q -28,-256 -4,-268 L 2,-266 Q -18,-254 -14,-226 Z" fill="#2d2920" opacity="0.8"/>
<path d="M 6,-266 Q 24,-258 24,-236 Q 24,-224 12,-218 Q 22,-232 20,-248 Q 18,-258 6,-262 Z" fill="#14141a" opacity="0.6"/>
<path d="M -16,-234 q 14,-6 30,-1" stroke="#14141a" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -10,-258 q 10,-4 22,-1" stroke="#4a4434" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -14,-250 q -3,5 -1,12 M 20,-248 q 3,5 1,12" stroke="#2d2920" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -18,-242 q -4,4 -3,11 M 24,-240 q 4,4 3,11" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.45"/>
<path d="M -8,-272 q 6,6 4,16" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -10,-216 Q -8,-198 6,-194 Q 22,-194 24,-210 L 20,-220 Q 6,-210 -10,-216 Z" fill="url(#${p}-crane)"/>
<path d="M -8,-212 Q -4,-200 8,-198 Q 18,-198 21,-208 Q 8,-204 -8,-212 Z" fill="#14141a"/>
<path d="M -16,-228 q 7,6 16,5" stroke="#14141a" stroke-width="2.6" fill="none" opacity="0.8"/>
<ellipse cx="-10" cy="-228" rx="9" ry="8" fill="url(#${p}-eye)"/>
<ellipse cx="9" cy="-228" rx="9" ry="8" fill="url(#${p}-eye)"/>
<circle cx="-10" cy="-228" r="3.4" fill="#d6303e"/>
<circle cx="9" cy="-228" r="3.4" fill="#d6303e"/>
<circle cx="-11" cy="-229" r="1.2" fill="#e8868d"/>
<circle cx="8" cy="-229" r="1.2" fill="#e8868d"/>
<path d="M -17,-234 q 7,-4 14,-1" stroke="#14141a" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M 2,-234 q 7,-3 14,0" stroke="#14141a" stroke-width="1.6" fill="none" opacity="0.8"/>
<path d="M -3,-222 l -4,8 l 4,2 l 3,-7 Z" fill="#2d2920" opacity="0.7"/>
<path d="M -7,-208 Q 0,-196 14,-198 Q 22,-202 22,-210 Q 8,-202 -7,-208 Z" fill="#1a0a0c"/>
<path d="M -3,-206 q 8,7 18,3" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -2,-205 l 3,5 M 4,-204 l 2,5 M 10,-204 l 1,5" stroke="#b3ac96" stroke-width="1.4" opacity="0.7"/>
<path d="M 16,-203 l -1,5 M 20,-205 l -1,4" stroke="#8f8876" stroke-width="1.3" opacity="0.6"/>
<path d="M -6,-208 q 4,12 8,18" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 10,-196 q 2,10 -2,18" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M -2,-194 q 6,12 2,28" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -18,-238 q -6,2 -9,8" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 18,-236 q 6,2 9,8" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -14,-220 q -6,8 -4,18" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.5"/>
</g>
</g>`;
}

function zGonfle(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-belly" cx="0.4" cy="0.32" r="0.85"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.4" stop-color="#2a3326"/><stop offset="0.72" stop-color="#1d1c24"/><stop offset="1" stop-color="#101117"/></radialGradient>
<radialGradient id="${p}-bellyHi" cx="0.36" cy="0.28" r="0.6"><stop offset="0" stop-color="#4a5a40" stop-opacity="0.9"/><stop offset="1" stop-color="#2a3326" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-skin" cx="0.38" cy="0.3" r="0.82"><stop offset="0" stop-color="#3a3526"/><stop offset="0.5" stop-color="#23211a"/><stop offset="1" stop-color="#121118"/></radialGradient>
<radialGradient id="${p}-flesh" cx="0.4" cy="0.32" r="0.8"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.55" stop-color="#23222a"/><stop offset="1" stop-color="#14151b"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.36" cy="0.3" r="0.82"><stop offset="0" stop-color="#4a5a40"/><stop offset="0.5" stop-color="#2a3326"/><stop offset="1" stop-color="#14141a"/></radialGradient>
<linearGradient id="${p}-shirt" x1="0.15" y1="0" x2="0.82" y2="1"><stop offset="0" stop-color="#7a2410"/><stop offset="0.45" stop-color="#5e1118"/><stop offset="1" stop-color="#3a0b10"/></linearGradient>
<linearGradient id="${p}-shirtD" x1="0" y1="0" x2="1" y2="0.7"><stop offset="0" stop-color="#5e1118"/><stop offset="0.5" stop-color="#420b12"/><stop offset="1" stop-color="#2a0810"/></linearGradient>
<linearGradient id="${p}-pant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#171710"/><stop offset="0.5" stop-color="#2a313a"/><stop offset="1" stop-color="#13141a"/></linearGradient>
<linearGradient id="${p}-pantD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101117"/><stop offset="0.5" stop-color="#222831"/><stop offset="1" stop-color="#181a20"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.55" stop-color="#23222a"/><stop offset="1" stop-color="#131218"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-blister" cx="0.4" cy="0.32" r="0.65"><stop offset="0" stop-color="#a39060" stop-opacity="0.9"/><stop offset="0.6" stop-color="#5e6b3e" stop-opacity="0.8"/><stop offset="1" stop-color="#2a3326" stop-opacity="0.6"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#a31621"/><stop offset="0.7" stop-color="#5e0e16"/><stop offset="1" stop-color="#3d0b12"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="96" ry="12" fill="#000" opacity="0.5"/>
<ellipse cx="-42" cy="3" rx="26" ry="7" fill="#000" opacity="0.4"/>
<ellipse cx="44" cy="3" rx="24" ry="7" fill="#000" opacity="0.4"/>
<path d="M -54,-92 Q -64,-56 -58,-22 L -44,-6 L -18,-7 Q -22,-30 -20,-58 Q -22,-82 -34,-96 Z" fill="url(#${p}-pant)"/>
<path d="M -50,-70 q -8,22 -4,46" stroke="#101117" stroke-width="4" fill="none" opacity="0.7"/>
<path d="M -36,-78 q -6,20 -3,40" stroke="#13141a" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M -58,-22 q -12,5 -22,4 l 1,11 q 16,2 30,-3 Z" fill="#0d0e13"/>
<path d="M -44,-6 q -16,3 -30,2 l 1,9 l 41,-1 Z" fill="#101117"/>
<path d="M -52,-30 l -20,5 l 1,7 l 19,-4 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -48,-48 q -12,3 -17,9 l 16,-3 Z" fill="#2a3326" opacity="0.6"/>
<path d="M -56,-60 q -3,10 1,18" stroke="#3d4a36" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M 22,-94 Q 30,-56 26,-22 L 36,-6 L 60,-6 Q 64,-30 60,-60 Q 58,-84 46,-98 Z" fill="url(#${p}-pantD)"/>
<path d="M 40,-72 q 8,22 5,46" stroke="#101117" stroke-width="4" fill="none" opacity="0.65"/>
<path d="M 28,-82 q 6,20 4,40" stroke="#181a20" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M 36,-6 l 22,2 l -1,9 l -25,0 Z" fill="#101117"/>
<path d="M 60,-6 l 14,2 l -1,8 l -16,-1 Z" fill="#0d0e13"/>
<path d="M 32,-30 l 20,5 l -1,7 l -19,-4 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M 44,-50 q 12,3 16,11 l -3,5 q -10,-8 -16,-10 Z" fill="#2a3326" opacity="0.6"/>
<path d="M 50,-58 q 4,10 1,18" stroke="#3d4a36" stroke-width="2.2" fill="none" opacity="0.5"/>
<path d="M -30,-118 Q -54,-114 -64,-92 Q -66,-72 -48,-64 L -40,-70 Q -52,-86 -42,-104 Z" fill="url(#${p}-belly)"/>
<path d="M 28,-120 Q 52,-114 62,-90 Q 64,-70 46,-62 L 38,-68 Q 50,-84 40,-106 Z" fill="url(#${p}-belly)"/>
<path d="M -88,-178 Q -116,-150 -110,-104 Q -100,-58 -52,-44 Q 0,-34 48,-46 Q 100,-60 112,-108 Q 122,-152 92,-182 Q 60,-204 0,-202 Q -58,-202 -88,-178 Z" fill="url(#${p}-belly)"/>
<path d="M -70,-176 Q -98,-148 -90,-108 Q -84,-78 -56,-60 Q -78,-86 -74,-128 Q -72,-160 -52,-184 Q -62,-182 -70,-176 Z" fill="url(#${p}-bellyHi)" opacity="0.5"/>
<ellipse cx="-18" cy="-150" rx="64" ry="52" fill="url(#${p}-bellyHi)" opacity="0.55"/>
<path d="M 18,-44 Q 22,-78 6,-110 Q -8,-134 -2,-160" stroke="#101117" stroke-width="3.4" fill="none" opacity="0.55"/>
<path d="M -30,-50 Q -36,-86 -28,-120" stroke="#14151b" stroke-width="2.6" fill="none" opacity="0.45"/>
<path d="M 56,-58 Q 66,-92 58,-130" stroke="#14151b" stroke-width="2.6" fill="none" opacity="0.4"/>
<path d="M -44,-140 q 20,10 4,22 q -18,6 -22,-8 q -2,-12 18,-14 Z" fill="url(#${p}-flesh)" opacity="0.7"/>
<path d="M -60,-120 Q -48,-118 -42,-128 Q -52,-130 -60,-122 Z" fill="#2a3326" opacity="0.65"/>
<path d="M 70,-128 q 16,4 18,18 q -14,8 -22,-4 q -4,-12 4,-14 Z" fill="url(#${p}-flesh)" opacity="0.65"/>
<path d="M -90,-130 q -10,8 -10,24 q 10,-4 14,-14 Z" fill="#2a3326" opacity="0.55"/>
<path d="M -86,-150 Q -100,-140 -100,-118" stroke="#3d4a36" stroke-width="2.6" fill="none" opacity="0.55"/>
<path d="M 104,-126 q 10,8 8,24 q -10,-4 -12,-16 Z" fill="#2a3326" opacity="0.5"/>
<path d="M -50,-170 q 12,-4 22,2 M -26,-188 q 16,-3 30,3 M 20,-186 q 18,-2 30,6 M 44,-168 q 16,2 26,12" stroke="#3d4a36" stroke-width="2.2" fill="none" opacity="0.5"/>
<path d="M -68,-130 q 22,8 40,2 M -70,-110 q 30,10 54,2 M -60,-90 q 30,10 56,2 M -40,-72 q 26,8 48,1" stroke="#2a3326" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M -84,-150 Q -60,-160 -28,-156 Q 8,-152 40,-158 Q 72,-162 98,-150" stroke="#1d1c24" stroke-width="2.8" fill="none" opacity="0.45"/>
<path d="M -78,-160 Q -106,-132 -100,-92 L -88,-94 Q -94,-130 -68,-156 Z" fill="#7a2410" opacity="0.92"/>
<path d="M -78,-160 Q -52,-178 -8,-184 L -10,-170 Q -50,-164 -70,-150 Z" fill="url(#${p}-shirtD)"/>
<path d="M 88,-160 Q 116,-134 108,-94 L 96,-96 Q 104,-130 78,-156 Z" fill="url(#${p}-shirt)"/>
<path d="M 88,-160 Q 56,-180 6,-184 L 8,-170 Q 54,-164 78,-150 Z" fill="url(#${p}-shirt)"/>
<path d="M -70,-150 Q -8,-172 80,-150 L 76,-132 Q -6,-152 -66,-134 Z" fill="url(#${p}-shirt)"/>
<path d="M -70,-150 Q -8,-172 80,-150 L 78,-142 Q -6,-162 -68,-142 Z" fill="#420b12" opacity="0.7"/>
<path d="M -64,-140 Q -2,-160 76,-140" stroke="#a31621" stroke-width="3.4" fill="none" opacity="0.5"/>
<path d="M -50,-156 Q 6,-176 64,-156 M -58,-130 Q 4,-150 70,-130" stroke="#7a2410" stroke-width="4" fill="none" opacity="0.45"/>
<path d="M -86,-150 Q -98,-140 -100,-122" stroke="#a31621" stroke-width="3" fill="none" opacity="0.4"/>
<path d="M -60,-178 L -64,-150 L -56,-150 L -52,-178 Z" fill="#2a0810" opacity="0.7"/>
<path d="M 18,-182 L 14,-150 L 22,-150 L 26,-182 Z" fill="#420b12" opacity="0.6"/>
<path d="M -36,-156 q 20,5 40,-2" stroke="#5e1118" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -8,-154 q -6,18 -2,40 q 1,8 5,6 q 4,-3 2,-14 q 2,-20 -2,-34 Z" fill="#5e0e16" opacity="0.4"/>
<path d="M 50,-128 q 14,-4 26,2 l -2,12 q -12,-6 -24,-2 Z" fill="url(#${p}-shirt)"/>
<path d="M -74,-130 q -12,-2 -22,4 l 2,12 q 10,-6 20,-4 Z" fill="url(#${p}-shirtD)"/>
<ellipse cx="-30" cy="-100" rx="11" ry="9" fill="url(#${p}-blister)"/>
<ellipse cx="-31" cy="-101" rx="5" ry="4" fill="#b3ac96" opacity="0.55"/>
<ellipse cx="18" cy="-86" rx="13" ry="10" fill="url(#${p}-blister)"/>
<ellipse cx="17" cy="-87" rx="6" ry="4.5" fill="#a39060" opacity="0.6"/>
<ellipse cx="54" cy="-104" rx="9" ry="7" fill="url(#${p}-blister)" opacity="0.85"/>
<ellipse cx="-58" cy="-78" rx="8" ry="6" fill="url(#${p}-blister)" opacity="0.8"/>
<path d="M 30,-118 Q 44,-110 40,-94 Q 34,-86 24,-92 Q 20,-104 30,-118 Z" fill="url(#${p}-flesh)" opacity="0.85"/>
<path d="M 28,-114 Q 38,-108 36,-96 Q 30,-92 26,-98 Q 24,-106 28,-114 Z" fill="url(#${p}-sang)" opacity="0.7"/>
<path d="M 30,-110 q 4,8 2,16" stroke="#a31621" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 24,-100 q 6,2 9,8" stroke="#5e0e16" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M -44,-118 Q -56,-112 -54,-100 Q -48,-94 -40,-100 Q -38,-110 -44,-118 Z" fill="url(#${p}-flesh)" opacity="0.8"/>
<path d="M -46,-114 q -4,8 -2,14" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M -6,-66 Q 4,-58 0,-46 Q -8,-44 -12,-52 Q -12,-62 -6,-66 Z" fill="url(#${p}-sang)" opacity="0.7"/>
<path d="M -6,-58 q -2,10 -6,16" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -2,-150 q -3,12 -1,26 M 14,-128 q -2,12 1,24" stroke="#2a3326" stroke-width="1.8" fill="none" opacity="0.45"/>
<ellipse cx="-66" cy="-184" rx="22" ry="18" fill="url(#${p}-shirtD)"/>
<path d="M -64,-188 q -4,-12 6,-18" stroke="#420b12" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -68,-182 Q -92,-178 -100,-156 Q -104,-138 -90,-128 L -98,-120 Q -110,-110 -104,-92 L -94,-88" stroke="url(#${p}-bras)" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -68,-182 Q -86,-178 -94,-160 L -84,-156 Q -78,-174 -64,-178 Z" fill="#420b12" opacity="0.6"/>
<path d="M -98,-150 q -8,4 -8,16" stroke="#101117" stroke-width="3.4" fill="none" opacity="0.6"/>
<path d="M -100,-128 q -8,3 -10,12" stroke="#14151b" stroke-width="3" fill="none" opacity="0.55"/>
<path d="M -96,-156 l -12,4 l 3,8 l 11,-4 Z" fill="url(#${p}-os)" opacity="0.5"/>
<path d="M -100,-122 q -10,2 -14,8" stroke="#3d4a36" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M -94,-88 l -8,12 M -94,-88 l 0,15 M -94,-88 l 10,11 M -94,-88 l 13,3 M -94,-88 l 9,-10" stroke="url(#${p}-bras)" stroke-width="5.6" stroke-linecap="round"/>
<path d="M -85,-73 l 1,5 M -84,-77 l 4,1 M -102,-77 l 1,5" stroke="#101117" stroke-width="2" stroke-linecap="round"/>
<path d="M -84,-78 l 4,3" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
<path d="M -100,-150 q -3,12 0,24" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.5"/>
<ellipse cx="64" cy="-186" rx="22" ry="18" fill="url(#${p}-shirt)"/>
<path d="M 66,-190 q 4,-12 -6,-18" stroke="#420b12" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M 66,-182 Q 96,-180 110,-200 Q 122,-218 112,-236 L 122,-242 Q 134,-250 130,-266 Q 126,-280 112,-282" stroke="url(#${p}-bras)" stroke-width="19" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 66,-182 Q 90,-182 104,-200 L 96,-208 Q 84,-192 64,-190 Z" fill="#5e1118" opacity="0.55"/>
<path d="M 110,-220 q 6,-6 4,-18" stroke="#101117" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 116,-250 l 10,-5 l 4,8 l -9,6 Z" fill="url(#${p}-os)"/>
<path d="M 119,-249 l 6,-3" stroke="#14141a" stroke-width="1" opacity="0.6"/>
<path d="M 112,-278 q 9,-3 15,3" stroke="#7a1018" stroke-width="3" fill="none" opacity="0.8"/>
<path d="M 124,-268 q 5,1 7,7" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 112,-282 l -4,-14 M 112,-282 l 6,-13 M 112,-282 l 14,-7 M 112,-282 l 14,4 M 112,-282 l 10,11" stroke="url(#${p}-bras)" stroke-width="5.4" stroke-linecap="round"/>
<path d="M 108,-296 l 1,-5 M 118,-295 l 4,-2 M 126,-289 l 4,1" stroke="#101117" stroke-width="2" stroke-linecap="round"/>
<path d="M 118,-295 l 3,-4" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
<path d="M 112,-230 q 8,4 8,16" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M 124,-256 q 4,8 1,16" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -24,-190 Q -22,-208 -4,-214 L 18,-212 Q 28,-200 24,-188 Q 0,-180 -24,-190 Z" fill="url(#${p}-skin)"/>
<path d="M -20,-200 q 22,8 38,0" stroke="#23211a" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M -18,-192 q 20,6 34,0" stroke="#3d4a36" stroke-width="1.8" fill="none" opacity="0.45"/>
<path d="M -10,-210 q 4,-8 12,-9 q 8,1 11,8" stroke="#2a3326" stroke-width="2.2" fill="none" opacity="0.5"/>
<path d="M -22,-188 q -2,8 4,14 M 22,-186 q 2,8 -4,14" stroke="#101117" stroke-width="2" fill="none" opacity="0.5"/>
<g transform="rotate(7 0 -226)">
<path d="M -22,-210 Q -34,-248 -2,-262 Q 30,-258 30,-220 Q 29,-204 12,-200 L -8,-202 Q -22,-204 -22,-210 Z" fill="url(#${p}-crane)"/>
<path d="M -20,-214 Q -28,-244 -4,-256 L 4,-254 Q -20,-244 -16,-208 Z" fill="#2a3326" opacity="0.7"/>
<path d="M 8,-256 Q 26,-248 26,-224 Q 26,-210 14,-204 Q 24,-218 22,-236 Q 20,-248 8,-254 Z" fill="#14141a" opacity="0.6"/>
<path d="M -18,-222 q 14,-6 30,-1" stroke="#14141a" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -16,-208 q 9,6 18,4" stroke="#14141a" stroke-width="2.6" fill="none" opacity="0.8"/>
<path d="M 18,-216 q 8,2 9,11 q -6,3 -12,1 Z" fill="url(#${p}-flesh)" opacity="0.6"/>
<path d="M -12,-250 q 9,-3 20,-1" stroke="#4a5a40" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -14,-240 q -3,5 -1,12 M 22,-238 q 3,5 1,12" stroke="#2a3326" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M -8,-204 Q -14,-180 -4,-168 Q 10,-166 16,-180 Q 17,-194 8,-202 L -2,-202 Q -5,-202 -8,-204 Z" fill="url(#${p}-crane)"/>
<path d="M -6,-200 Q -11,-181 -2,-172 Q 8,-171 13,-181 Q 13,-191 7,-198 Z" fill="#14141a"/>
<path d="M -4,-198 l 3,3 l 3,-2 l 3,3 l 3,-3 l 2,3" stroke="#8f8876" stroke-width="1.3" fill="none" opacity="0.85"/>
<path d="M -1,-184 l 0,13 M 6,-185 l 1,12" stroke="#14141a" stroke-width="1.1" opacity="0.6"/>
<path d="M -8,-205 q -4,10 -3,23" stroke="#7a1018" stroke-width="1.9" fill="none" opacity="0.65"/>
<path d="M 10,-203 q 4,9 3,20" stroke="#7a1018" stroke-width="1.7" fill="none" opacity="0.6"/>
<path d="M -7,-170 q 9,5 20,1" stroke="#5e0e16" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M -16,-238 q -7,2 -10,9 M 22,-236 q 7,2 10,9" stroke="#2a3326" stroke-width="1.6" fill="none" opacity="0.5"/>
<circle cx="-9" cy="-234" r="7.5" fill="url(#${p}-eye)"/>
<circle cx="-9" cy="-234" r="3" fill="#d6303e"/>
<circle cx="-9.6" cy="-235" r="1" fill="#e8868d"/>
<path d="M -17,-236 q 8,-4 15,-1" stroke="#14141a" stroke-width="1.8" fill="none" opacity="0.8"/>
<circle cx="10" cy="-232" r="7.5" fill="url(#${p}-eye)"/>
<circle cx="10" cy="-232" r="3" fill="#d6303e"/>
<circle cx="9.4" cy="-233" r="1" fill="#e8868d"/>
<path d="M 2,-234 q 7,-3 15,0" stroke="#14141a" stroke-width="1.6" fill="none" opacity="0.75"/>
<path d="M -20,-224 q -5,3 -6,10" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.5"/>
</g>
</g>`;
}

function zHurleur(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-skin" cx="0.36" cy="0.28" r="0.85"><stop offset="0" stop-color="#3a3526"/><stop offset="0.45" stop-color="#23211a"/><stop offset="1" stop-color="#101117"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.34" cy="0.26" r="0.85"><stop offset="0" stop-color="#46402f"/><stop offset="0.5" stop-color="#2d2920"/><stop offset="1" stop-color="#14141a"/></radialGradient>
<radialGradient id="${p}-raw" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#d6303e"/><stop offset="0.45" stop-color="#a31621"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<radialGradient id="${p}-throat" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="#7a1018"/><stop offset="0.6" stop-color="#3d0b12"/><stop offset="1" stop-color="#15060a"/></radialGradient>
<linearGradient id="${p}-robe" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#363f49"/><stop offset="0.5" stop-color="#252b32"/><stop offset="1" stop-color="#13161b"/></linearGradient>
<linearGradient id="${p}-robeD" x1="0" y1="0" x2="1" y2="0.7"><stop offset="0" stop-color="#2a313a"/><stop offset="0.5" stop-color="#1b2026"/><stop offset="1" stop-color="#101317"/></linearGradient>
<linearGradient id="${p}-leg" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#39342500"/><stop offset="0" stop-color="#3a3526"/><stop offset="0.55" stop-color="#1d1c24"/><stop offset="1" stop-color="#101117"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3526"/><stop offset="0.5" stop-color="#23211a"/><stop offset="1" stop-color="#101117"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.36" r="0.62"><stop offset="0" stop-color="#c4bda4"/><stop offset="0.6" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<linearGradient id="${p}-iron" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#3a4049"/><stop offset="0.5" stop-color="#22262c"/><stop offset="1" stop-color="#0e1014"/></linearGradient>
<radialGradient id="${p}-hair" cx="0.4" cy="0.15" r="0.9"><stop offset="0" stop-color="#4a525c"/><stop offset="0.6" stop-color="#2a313a"/><stop offset="1" stop-color="#13161b"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="86" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-46" cy="3" rx="20" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="44" cy="3" rx="18" ry="6" fill="#000" opacity="0.4"/>
<path d="M -30,-118 Q -50,-78 -54,-30 L -40,-4 L -22,-6 L -28,-30 L -16,-72 L 2,-110 Z" fill="url(#${p}-leg)"/>
<path d="M -42,-60 q -6,16 -4,30" stroke="#101117" stroke-width="3" fill="none" opacity="0.65"/>
<path d="M -30,-90 q -8,20 -8,40" stroke="#14151b" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -52,-30 q 6,-10 4,-26" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.45"/>
<path d="M -40,-50 q -8,3 -12,10 l 11,-3 Z" fill="url(#${p}-raw)" opacity="0.6"/>
<path d="M 8,-120 Q 32,-80 48,-30 L 44,-4 L 24,-6 L 22,-30 L 14,-74 L -4,-110 Z" fill="url(#${p}-leg)"/>
<path d="M 30,-58 q 8,18 6,36" stroke="#101117" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M 18,-86 q 8,20 8,40" stroke="#14151b" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 40,-46 q 10,3 14,11 l -3,4 q -8,-7 -14,-9 Z" fill="url(#${p}-raw)" opacity="0.55"/>
<path d="M 44,-30 q 6,-10 3,-24" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.4"/>
<path d="M -54,-30 q -10,5 -19,4 l 1,9 q 14,2 26,-3 Z" fill="#101117"/>
<path d="M -40,-4 q -14,2 -25,1 l 1,7 l 33,-1 Z" fill="#0d0e13"/>
<path d="M -22,-6 l -10,2 l 0,7 l 13,-1 Z" fill="#101117"/>
<path d="M -56,-26 l -16,3 l 1,5 l 15,-3 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M -64,-3 l 8,-1 l 1,8 l -8,1 Z" fill="#14151b"/>
<path d="M 48,-30 q 9,4 18,4 l -1,9 q -13,1 -23,-4 Z" fill="#101117"/>
<path d="M 44,-4 q 13,2 24,1 l -1,7 l -32,-1 Z" fill="#0d0e13"/>
<path d="M 24,-6 l 9,2 l 0,7 l -12,-1 Z" fill="#101117"/>
<path d="M 50,-26 l 15,3 l -1,5 l -14,-3 Z" fill="#0d0e13" opacity="0.85"/>
<path d="M 58,-3 l 8,-1 l 1,8 l -8,1 Z" fill="#14151b"/>
<g stroke="url(#${p}-iron)" stroke-width="5.5" fill="none" stroke-linecap="round">
<ellipse cx="-50" cy="-12" rx="13" ry="8"/>
<ellipse cx="54" cy="-12" rx="13" ry="8"/>
</g>
<path d="M -46,-6 q -4,9 -14,12 q -9,2 -16,9" stroke="url(#${p}-iron)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<ellipse cx="-58" cy="2" rx="4" ry="3" fill="none" stroke="#22262c" stroke-width="2.4"/>
<ellipse cx="-67" cy="7" rx="4" ry="3" fill="none" stroke="#0e1014" stroke-width="2.4"/>
<path d="M 50,-6 q 4,9 14,12 q 9,2 16,9" stroke="url(#${p}-iron)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<ellipse cx="62" cy="2" rx="4" ry="3" fill="none" stroke="#22262c" stroke-width="2.4"/>
<ellipse cx="71" cy="7" rx="4" ry="3" fill="none" stroke="#0e1014" stroke-width="2.4"/>
<path d="M -49,-14 q 5,-2 10,1" stroke="#4a525c" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M 53,-14 q 5,-2 10,1" stroke="#4a525c" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M -34,-118 Q -58,-168 -28,-200 L 40,-204 Q 60,-166 46,-114 Q 26,-104 -2,-106 Q -22,-106 -34,-118 Z" fill="url(#${p}-robe)"/>
<path d="M -34,-118 Q -58,-168 -28,-200 L -6,-202 Q -32,-166 -16,-110 Q -26,-110 -34,-118 Z" fill="url(#${p}-robeD)"/>
<path d="M -28,-196 Q 4,-208 40,-200 L 36,-184 Q 2,-194 -26,-182 Z" fill="#1b2026"/>
<path d="M -26,-182 Q 6,-192 36,-184 L 33,-172 Q 4,-180 -24,-170 Z" fill="#2a313a" opacity="0.8"/>
<path d="M -16,-200 L -24,-118 L -16,-118 L -8,-200 Z" fill="#101317" opacity="0.7"/>
<path d="M 12,-202 L 20,-116 L 12,-116 L 6,-202 Z" fill="#13161b" opacity="0.65"/>
<path d="M -20,-160 L -2,-150 L -18,-144 Z" fill="#101317" opacity="0.7"/>
<path d="M 8,-150 L 26,-138 L 8,-132 Z" fill="#13161b" opacity="0.65"/>
<path d="M -34,-118 q 8,8 22,9 l -2,12 q -14,-2 -22,-10 Z" fill="#101317" opacity="0.7"/>
<path d="M 16,-112 q 14,2 28,-4 l 2,10 q -14,7 -30,5 Z" fill="#13161b" opacity="0.6"/>
<path d="M -28,-130 q 14,5 30,1 M -30,-148 q 16,5 32,0 M -32,-166 q 16,5 34,-1" stroke="#13161b" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 6,-180 q 6,28 2,60 q -1,8 4,7 q 5,-1 4,-12 q 3,-30 -2,-56 Z" fill="url(#${p}-raw)" opacity="0.4"/>
<path d="M -10,-170 q -4,22 -2,46" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.4"/>
<path d="M 24,-118 q -4,12 -2,22" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.45"/>
<ellipse cx="-30" cy="-188" rx="13" ry="11" fill="url(#${p}-robeD)"/>
<path d="M -32,-186 Q -58,-176 -70,-150 Q -78,-130 -62,-118 L -72,-110 Q -86,-98 -80,-78" stroke="url(#${p}-bras)" stroke-width="9.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -32,-186 Q -52,-178 -62,-156 L -54,-152 Q -46,-172 -30,-180 Z" fill="#1b2026" opacity="0.65"/>
<path d="M -68,-142 q 7,4 5,16" stroke="#101117" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -64,-124 q -8,4 -12,12" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.4"/>
<path d="M -60,-148 l -10,-3 l -2,7 l 9,4 Z" fill="url(#${p}-os)" opacity="0.85"/>
<path d="M -67,-148 l -5,-1" stroke="#14141a" stroke-width="1" opacity="0.6"/>
<path d="M -80,-78 l -4,13 M -80,-78 l 2,15 M -80,-78 l 10,12 M -80,-78 l 14,5 M -80,-78 l 11,-7" stroke="url(#${p}-bras)" stroke-width="3" stroke-linecap="round"/>
<path d="M -84,-65 l -1,5 M -78,-63 l 2,5 M -70,-66 l 4,2 M -66,-73 l 4,0" stroke="#14141a" stroke-width="1.5" stroke-linecap="round"/>
<path d="M -69,-73 l 4,2" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
<path d="M -74,-130 q -4,10 -1,20" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.45"/>
<ellipse cx="30" cy="-190" rx="14" ry="12" fill="url(#${p}-raw)" opacity="0.85"/>
<path d="M 22,-198 q 8,-6 18,-3 l -2,8 q -8,-3 -15,1 Z" fill="#5e0e16" opacity="0.6"/>
<path d="M 32,-188 Q 60,-180 72,-154 Q 80,-134 64,-122 L 74,-114 Q 88,-102 82,-82" stroke="url(#${p}-bras)" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 32,-188 Q 52,-182 62,-160 L 54,-156 Q 46,-176 30,-182 Z" fill="url(#${p}-raw)" opacity="0.55"/>
<path d="M 70,-146 q 7,4 5,16" stroke="#101117" stroke-width="2.8" fill="none" opacity="0.6"/>
<path d="M 66,-126 q 9,4 13,12" stroke="#7a1018" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M 64,-150 l 11,-3 l 2,7 l -10,4 Z" fill="url(#${p}-os)"/>
<path d="M 67,-150 l 6,-2" stroke="#14141a" stroke-width="1" opacity="0.6"/>
<path d="M 82,-82 l -3,14 M 82,-82 l 7,13 M 82,-82 l 13,7 M 82,-82 l 13,-4 M 82,-82 l 9,-11" stroke="url(#${p}-bras)" stroke-width="3.2" stroke-linecap="round"/>
<path d="M 94,-75 l 2,5 M 95,-78 l 3,1 M 88,-70 l 1,5 M 79,-68 l 0,5" stroke="#14141a" stroke-width="1.6" stroke-linecap="round"/>
<path d="M 89,-71 l 3,3" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
<path d="M 76,-130 q 4,10 1,20" stroke="#5e0e16" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M -18,-198 L -22,-218 L 18,-222 L 20,-200 Z" fill="url(#${p}-skin)"/>
<path d="M 4,-200 q 12,-3 18,-1 l 0,4 q -10,-2 -18,1 Z" fill="url(#${p}-raw)" opacity="0.7"/>
<path d="M -18,-210 q 18,5 34,-1" stroke="#23211a" stroke-width="2" fill="none" opacity="0.8"/>
<path d="M -16,-200 q 18,4 32,0" stroke="#8f8876" stroke-width="1.4" fill="none" opacity="0.4"/>
<path d="M -16,-216 l 2,16 M -6,-219 l 1,17 M 4,-220 l 1,17 M 14,-220 l 1,17" stroke="#14141a" stroke-width="1.4" opacity="0.5"/>
<g transform="rotate(16 0 -222)">
<path d="M -22,-220 Q -34,-256 -2,-268 Q 30,-264 28,-228 Q 27,-214 12,-210 L -8,-212 Q -22,-214 -22,-220 Z" fill="url(#${p}-crane)"/>
<path d="M -20,-224 Q -28,-252 -4,-262 L 4,-260 Q -20,-250 -16,-220 Z" fill="#2d2920" opacity="0.8"/>
<path d="M 8,-262 Q 26,-254 26,-232 Q 26,-220 14,-214 Q 24,-228 22,-244 Q 20,-256 8,-260 Z" fill="#14141a" opacity="0.6"/>
<path d="M 6,-256 Q 24,-250 24,-228 Q 24,-216 12,-212 Q 22,-226 20,-242 Q 18,-252 6,-254 Z" fill="url(#${p}-raw)" opacity="0.3"/>
<path d="M -16,-236 q 12,-5 26,-1" stroke="#14141a" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -10,-258 q 8,-3 18,-1" stroke="#46402f" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -14,-250 q -3,5 -1,11 M 16,-248 q 3,5 1,11" stroke="#2d2920" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -18,-242 q -4,4 -3,11 M 22,-240 q 4,4 3,11" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.45"/>
<circle cx="-9" cy="-238" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="-9" cy="-238" r="3" fill="#d6303e"/>
<circle cx="-9.6" cy="-239" r="1.1" fill="#e8868d"/>
<path d="M -16,-240 q 7,-4 14,-1" stroke="#14141a" stroke-width="1.6" fill="none" opacity="0.8"/>
<circle cx="9" cy="-236" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="9" cy="-236" r="3" fill="#d6303e"/>
<circle cx="8.4" cy="-237" r="1.1" fill="#e8868d"/>
<path d="M 2,-238 q 7,-3 14,0" stroke="#14141a" stroke-width="1.4" fill="none" opacity="0.75"/>
<path d="M -3,-230 q 2,4 0,8" stroke="#14141a" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -3,-220 q 4,2 8,0" stroke="#14141a" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -10,-214 Q -16,-186 -2,-166 Q 14,-162 22,-180 Q 24,-198 12,-210 L -2,-211 Q -7,-212 -10,-214 Z" fill="url(#${p}-throat)"/>
<path d="M -7,-210 Q -12,-187 -1,-172 Q 12,-169 18,-184 Q 19,-199 9,-207 Z" fill="#5e0e16" opacity="0.7"/>
<path d="M -3,-200 Q -6,-184 1,-174 Q 9,-172 13,-184 Q 13,-196 6,-202 Z" fill="url(#${p}-throat)"/>
<path d="M -8,-214 l 2,8 l 5,-5 l 3,7 l 4,-6 l 4,7 l 4,-7" stroke="#b3ac96" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M -6,-170 l 3,-7 l 4,6 l 3,-6 l 4,6 l 4,-6" stroke="#8f8876" stroke-width="1.5" fill="none" opacity="0.8"/>
<path d="M -10,-215 q 18,-6 32,1" stroke="#7a1018" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -2,-166 q 10,5 20,-2" stroke="#5e0e16" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -10,-212 q -5,12 -3,28" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M 22,-208 q 4,10 3,22" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.5"/>
</g>
<path d="M -22,-238 Q -52,-232 -58,-200 Q -62,-176 -50,-150 Q -54,-180 -42,-206 Q -34,-226 -20,-234 Z" fill="url(#${p}-hair)"/>
<path d="M -18,-244 Q -46,-242 -56,-214 Q -60,-194 -52,-168" stroke="#2a313a" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -22,-238 Q -42,-228 -48,-202 Q -52,-180 -46,-158" stroke="#13161b" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -14,-240 Q -34,-230 -40,-204 Q -44,-184 -40,-162" stroke="#4a525c" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 24,-244 Q 52,-236 58,-202 Q 62,-176 52,-150 Q 56,-182 44,-208 Q 36,-228 22,-238 Z" fill="url(#${p}-hair)"/>
<path d="M 20,-248 Q 48,-244 56,-216 Q 60,-196 52,-170" stroke="#2a313a" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M 24,-240 Q 44,-230 50,-204 Q 54,-184 48,-160" stroke="#13161b" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 18,-244 Q 36,-232 42,-206 Q 46,-186 42,-164" stroke="#4a525c" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -2,-262 Q -20,-256 -24,-236 Q -16,-250 0,-254 Q 16,-250 24,-236 Q 20,-256 2,-262 Z" fill="url(#${p}-hair)" opacity="0.9"/>
<path d="M -18,-258 q 10,-6 20,-5 M 4,-263 q 10,1 18,7" stroke="#4a525c" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M -34,-200 Q -44,-196 -48,-186" stroke="#2a313a" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 36,-200 Q 46,-196 50,-186" stroke="#2a313a" stroke-width="1.6" fill="none" opacity="0.5"/>
<g stroke="#d6303e" fill="none" stroke-linecap="round" opacity="0.32">
<path d="M -52,-262 Q -66,-244 -64,-218" stroke-width="2"/>
<path d="M -62,-268 Q -80,-244 -78,-210" stroke-width="1.6" opacity="0.7"/>
<path d="M 56,-258 Q 70,-240 68,-214" stroke-width="2"/>
<path d="M 66,-264 Q 84,-240 82,-206" stroke-width="1.6" opacity="0.7"/>
</g>
</g>`;
}

function zPutrefie(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.38" cy="0.3" r="0.88"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.5" stop-color="#14151b"/><stop offset="1" stop-color="#0c0d12"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.32" r="0.82"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#15161c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-membre" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#1b1a22"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0c0d12"/></linearGradient>
<linearGradient id="${p}-peau" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#22202a"/><stop offset="0.6" stop-color="#15141a"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-coule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.45" stop-color="#2a3326"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-mare" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#3d4a36"/><stop offset="0.6" stop-color="#2a3326"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-os" cx="0.38" cy="0.36" r="0.72"><stop offset="0" stop-color="#b3ac96"/><stop offset="0.7" stop-color="#9a937e"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-cavite" cx="0.5" cy="0.42" r="0.72"><stop offset="0" stop-color="#7a2410"/><stop offset="0.45" stop-color="#5e0e16"/><stop offset="0.8" stop-color="#2a1014"/><stop offset="1" stop-color="#0a0b0f"/></radialGradient>
<radialGradient id="${p}-organe" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#a31621" stop-opacity="0.9"/><stop offset="0.6" stop-color="#5e0e16"/><stop offset="1" stop-color="#2a1014"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="80" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-34" cy="3" rx="22" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="6" cy="0" rx="62" ry="10" fill="url(#${p}-mare)" opacity="0.9"/>
<ellipse cx="44" cy="3" rx="24" ry="5.5" fill="#2a3326" opacity="0.92"/>
<ellipse cx="-46" cy="1" rx="16" ry="4.5" fill="#2a3326" opacity="0.8"/>
<path d="M -48,-1 q 32,-8 76,-2 q -9,8 -38,8 q -30,1 -38,-6 Z" fill="#3d4a36" opacity="0.5"/>
<path d="M 28,-2 q 10,1 18,-1 q -3,4 -10,4 q -7,0 -8,-3 Z" fill="#1d1c24" opacity="0.7"/>
<ellipse cx="14" cy="-2" rx="6" ry="2" fill="#0d0e13" opacity="0.7"/>
<path d="M -26,-120 L -54,-86 L -56,-42 L -32,-38 L -36,-82 L -16,-112 Z" fill="url(#${p}-membre)"/>
<path d="M -50,-90 q -6,4 -4,13 q 4,6 9,2 q -2,-9 -5,-15 Z" fill="#0d0e13" opacity="0.75"/>
<path d="M -44,-100 L -40,-64 L -38,-44" stroke="url(#${p}-os)" stroke-width="3.4" stroke-linecap="round" fill="none" opacity="0.92"/>
<path d="M -44,-100 q -3,-1 -5,2 q 1,3 5,2 Z" fill="url(#${p}-os)"/>
<path d="M -41,-74 q 4,1 7,-1 M -40,-62 q 4,1 7,-1" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -47,-92 q -7,3 -10,12 q 3,4 9,1 q -1,-8 1,-13 Z" fill="url(#${p}-peau)" opacity="0.9"/>
<path d="M -32,-40 q 2,17 -4,31 q -1,7 3,7 q 6,-2 5,-14 q 2,-15 1,-26 Z" fill="url(#${p}-coule)"/>
<path d="M -28,-46 q 3,12 -1,24" stroke="#3d4a36" stroke-width="2" fill="none" opacity="0.7"/>
<ellipse cx="-26" cy="-3" rx="4.4" ry="2.6" fill="#0d0e13"/>
<ellipse cx="-26" cy="-4" rx="2.4" ry="1.3" fill="#3d4a36" opacity="0.7"/>
<path d="M 22,-118 L 50,-82 L 56,-40 L 30,-38 L 30,-80 L 12,-110 Z" fill="url(#${p}-membre)"/>
<path d="M 40,-92 q 6,4 5,13 q -4,5 -9,1 q 1,-9 4,-14 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 26,-74 q 8,2 14,0 M 28,-58 q 8,2 14,-1" stroke="#101117" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M 32,-100 q 7,2 6,12" stroke="#5e0e16" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M 30,-40 q 3,15 -1,28 q -1,7 3,6 q 5,-3 4,-15 q 1,-12 0,-21 Z" fill="url(#${p}-coule)"/>
<ellipse cx="44" cy="-1" rx="4.4" ry="2.6" fill="#0d0e13"/>
<ellipse cx="44" cy="-2" rx="2.4" ry="1.3" fill="#3d4a36" opacity="0.7"/>
<path d="M -36,-122 Q -50,-178 -28,-220 Q -4,-242 24,-230 Q 52,-212 44,-158 Q 40,-128 24,-118 Q 4,-110 -16,-116 Q -30,-116 -36,-122 Z" fill="url(#${p}-torse)"/>
<path d="M -32,-128 Q -44,-172 -26,-210 Q -16,-222 -4,-224 Q -24,-202 -28,-162 Q -30,-130 -20,-122 Z" fill="#22202a" opacity="0.5"/>
<path d="M 10,-218 Q 42,-210 42,-160 Q 40,-130 26,-120 Q 36,-150 30,-188 Q 26,-208 10,-218 Z" fill="#0c0d12" opacity="0.72"/>
<path d="M -34,-150 Q -28,-148 -20,-152 Q -14,-160 -22,-186 Q -28,-204 -32,-200 Q -36,-176 -34,-150 Z" fill="#1d1c24" opacity="0.6"/>
<path d="M -30,-206 q 11,-7 24,-5 M -32,-190 q 15,-6 30,-4 M -33,-174 q 14,-5 28,-3 M -33,-158 q 12,-4 24,-2" stroke="#0c0d12" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -30,-206 q 11,-7 24,-5 M -33,-174 q 14,-5 28,-3" stroke="#3d4a36" stroke-width="1" fill="none" opacity="0.4"/>
<path d="M 14,-204 Q 46,-198 42,-156 Q 38,-130 22,-124 Q 18,-138 16,-152 L 8,-154 Q 2,-152 0,-160 Q 14,-158 18,-172 Q 16,-192 14,-204 Z" fill="url(#${p}-cavite)"/>
<path d="M 16,-200 Q 14,-176 14,-152" stroke="url(#${p}-os)" stroke-width="3.6" stroke-linecap="round" fill="none"/>
<path d="M 4,-188 Q 18,-186 32,-188 Q 34,-180 30,-176 Q 16,-178 4,-180 Z" fill="url(#${p}-organe)" opacity="0.85"/>
<path d="M 2,-168 Q 16,-166 30,-168 Q 32,-160 26,-156 Q 14,-158 2,-160 Z" fill="url(#${p}-organe)" opacity="0.8"/>
<ellipse cx="20" cy="-176" rx="9" ry="6" fill="#a31621" opacity="0.5"/>
<ellipse cx="17" cy="-178" rx="3.2" ry="2" fill="#d6303e" opacity="0.55"/>
<path d="M 20,-198 q 10,-1 15,7 q -2,7 -11,5 q -6,-2 -5,-8 Z" fill="url(#${p}-os)"/>
<path d="M 22,-184 q 10,0 15,8 q -2,7 -11,5 q -6,-2 -5,-9 Z" fill="url(#${p}-os)"/>
<path d="M 23,-168 q 10,1 14,9 q -2,6 -11,4 q -6,-2 -4,-9 Z" fill="url(#${p}-os)"/>
<path d="M 23,-152 q 9,2 13,9 q -2,6 -10,4 q -6,-2 -4,-9 Z" fill="url(#${p}-os)"/>
<path d="M 26,-196 q 6,1 9,5 M 27,-182 q 6,1 9,5 M 28,-166 q 6,1 8,5" stroke="#8f8876" stroke-width="1.1" fill="none" opacity="0.6"/>
<path d="M 8,-206 q 14,-2 26,2 q -2,7 -14,6 q -9,-1 -12,-8 Z" fill="#1d1c24" opacity="0.72"/>
<path d="M 6,-154 Q 16,-150 28,-152 Q 20,-138 8,-136 Q -2,-138 0,-150 Z" fill="#0a0b0f"/>
<path d="M 8,-150 q 7,3 16,1" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 30,-150 q 6,5 4,14 q -2,9 -8,16 q 4,-12 1,-22 Z" fill="url(#${p}-peau)" opacity="0.92"/>
<path d="M 32,-148 q 5,4 3,12" stroke="#3d4a36" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -36,-150 Q -42,-140 -40,-122 Q -36,-110 -24,-112 Q -30,-126 -30,-140 Z" fill="url(#${p}-peau)"/>
<path d="M -36,-150 q -5,11 -3,27" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -24,-152 q 3,17 -1,33 q -2,9 3,9 q 6,-2 5,-16 q 2,-16 0,-28 Z" fill="url(#${p}-coule)"/>
<path d="M -20,-148 q 3,13 -1,27" stroke="#3d4a36" stroke-width="1.8" fill="none" opacity="0.7"/>
<ellipse cx="-21" cy="-60" rx="3.6" ry="2.6" fill="#0d0e13"/>
<path d="M -10,-140 q 4,15 1,28" stroke="url(#${p}-coule)" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M -2,-134 q 3,12 0,24" stroke="url(#${p}-coule)" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>
<path d="M -34,-210 L -60,-178 L -62,-138" stroke="url(#${p}-membre)" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M -52,-188 L -60,-152" stroke="url(#${p}-os)" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
<path d="M -60,-178 q -6,3 -5,12 M -62,-138 q 2,12 -3,21" stroke="url(#${p}-coule)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<path d="M -57,-160 q 3,5 -2,10" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -62,-138 l -9,4 M -62,-138 l -5,11 M -62,-138 l 3,12 M -62,-138 l 9,8 M -62,-138 l 11,-1" stroke="url(#${p}-membre)" stroke-width="2.8" stroke-linecap="round"/>
<path d="M -71,-134 l 2,5 M -53,-130 l 2,5" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round"/>
<path d="M -57,-202 q -8,3 -10,11 q 4,5 11,1 q -2,-8 -1,-12 Z" fill="url(#${p}-peau)" opacity="0.9"/>
<path d="M 28,-214 L 54,-186 L 66,-148" stroke="url(#${p}-membre)" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M 52,-188 L 62,-152" stroke="url(#${p}-os)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 50,-186 q 4,-2 7,1 q 0,4 -4,4 Z" fill="url(#${p}-os)"/>
<path d="M 54,-186 q 5,2 5,10 M 66,-148 q 3,12 -1,20" stroke="url(#${p}-coule)" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M 58,-170 q 3,6 -1,11" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 66,-148 l 10,3 M 66,-148 l 6,11 M 66,-148 l -2,12 M 66,-148 l -8,7 M 66,-148 l 11,-3" stroke="url(#${p}-membre)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 76,-145 l 1,5 M 64,-137 l -1,5" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round"/>
<path d="M 36,-208 q 9,2 11,10 q -4,5 -11,2 q -2,-8 0,-12 Z" fill="url(#${p}-peau)" opacity="0.88"/>
<path d="M -18,-226 Q -16,-216 -8,-214 L 6,-216 Q 14,-218 14,-226 Q 8,-234 0,-234 Q -10,-234 -18,-226 Z" fill="url(#${p}-torse)"/>
<path d="M -16,-228 Q -26,-258 0,-266 Q 28,-260 24,-226 Q 22,-210 2,-208 Q -10,-210 -16,-228 Z" fill="url(#${p}-crane)"/>
<path d="M -14,-232 Q -20,-256 1,-262 Q -8,-246 -8,-228 Q -8,-214 -1,-210 Q -12,-214 -14,-232 Z" fill="#22202a" opacity="0.55"/>
<path d="M 10,-260 Q 26,-254 24,-228 Q 22,-212 7,-208 Q 17,-228 15,-244 Q 13,-256 10,-260 Z" fill="#0c0d12" opacity="0.7"/>
<path d="M -10,-256 q -4,-6 -1,-13 M -1,-260 q -1,-7 4,-13 M 10,-255 q 5,-6 2,-12" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.65"/>
<path d="M 8,-258 q 8,3 10,11 q -6,-1 -11,-6 Z" fill="url(#${p}-os)" opacity="0.55"/>
<path d="M -11,-240 q 8,-8 17,-3 q 5,4 1,9 q -10,-7 -18,-6 Z" fill="#0a0b0f" opacity="0.85"/>
<path d="M -3,-234 q -6,5 -11,4 M 11,-232 q 5,5 1,10" stroke="#101117" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -16,-226 q 7,4 6,12" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 16,-224 q 3,5 1,11" stroke="url(#${p}-os)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
<path d="M 6,-218 Q 16,-216 22,-220 Q 16,-208 6,-208 Q 0,-212 6,-218 Z" fill="url(#${p}-os)" opacity="0.5"/>
<path d="M -8,-214 Q -2,-210 8,-211 Q 4,-200 -4,-200 Q -10,-204 -8,-214 Z" fill="#0a0b0f"/>
<path d="M -6,-211 l 2,4 l 2,-3 l 2,4 l 2,-3 l 2,4" stroke="#b3ac96" stroke-width="1.2" fill="none" opacity="0.85"/>
<path d="M -7,-205 Q -11,-190 -3,-180 Q 7,-178 12,-188 Q 12,-200 4,-204 L -2,-205 Q -5,-205 -7,-205 Z" fill="url(#${p}-crane)"/>
<path d="M -5,-201 Q -8,-189 -1,-182 Q 6,-181 9,-189 Q 8,-197 3,-200 Z" fill="#0a0b0f"/>
<path d="M -3,-199 l 2,3 l 2,-2 l 2,3 l 2,-2 l 2,3" stroke="#b3ac96" stroke-width="1.1" fill="none" opacity="0.8"/>
<path d="M 4,-186 q 8,1 11,7 q -1,7 -8,7 q -7,-1 -7,-8 Z" fill="url(#${p}-peau)" opacity="0.92"/>
<path d="M 2,-208 q -2,18 -2,38 q 0,7 4,5 q 4,-2 3,-14 q 1,-17 0,-29 Z" fill="url(#${p}-coule)" opacity="0.85"/>
<path d="M -7,-206 q -3,8 -2,18" stroke="#3d4a36" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M 8,-204 q 3,7 2,16" stroke="#3d4a36" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -4,-180 q 1,6 -1,12" stroke="#3d4a36" stroke-width="1.4" fill="none" opacity="0.55"/>
<circle cx="-7" cy="-238" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-238" r="2.2" fill="#d6303e"/>
<circle cx="-7.7" cy="-238.7" r="0.85" fill="#e8868d"/>
<circle cx="9" cy="-236" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="9" cy="-236" r="2.2" fill="#d6303e"/>
<circle cx="8.3" cy="-236.7" r="0.85" fill="#e8868d"/>
<path d="M -30,-72 q -1.6,18 0,36 q 1.8,5 3.4,0 q 1.6,-18 0,-36 Z" fill="url(#${p}-coule)" opacity="0.9"/>
<ellipse cx="-28.4" cy="-34" rx="3.4" ry="2.4" fill="#0d0e13"/>
<path d="M -8,-52 q -1.6,23 0,46 q 1.8,7 3.4,0 q 1.6,-23 0,-46 Z" fill="url(#${p}-coule)" opacity="0.9"/>
<ellipse cx="-6.4" cy="-4" rx="3.4" ry="2.4" fill="#0d0e13"/>
<path d="M 12,-90 q -1.6,13 0,26 q 1.8,4 3.4,0 q 1.6,-13 0,-26 Z" fill="url(#${p}-coule)" opacity="0.9"/>
<ellipse cx="13.6" cy="-62" rx="3.4" ry="2.4" fill="#0d0e13"/>
<path d="M 40,-64 q -1.6,12 0,24 q 1.8,4 3.4,0 q 1.6,-12 0,-24 Z" fill="url(#${p}-coule)" opacity="0.9"/>
<ellipse cx="41.6" cy="-38" rx="3.4" ry="2.4" fill="#0d0e13"/>
<path d="M -44,-100 q -1.6,10 0,20 q 1.8,3 3.4,0 q 1.6,-10 0,-20 Z" fill="url(#${p}-coule)" opacity="0.85"/>
<ellipse cx="-42.4" cy="-78" rx="3" ry="2.2" fill="#0d0e13"/>
<path d="M 22,-40 q -1.6,17 0,34 q 1.8,5 3.4,0 q 1.6,-17 0,-34 Z" fill="url(#${p}-coule)" opacity="0.88"/>
<ellipse cx="23.6" cy="-4" rx="3.4" ry="2.4" fill="#0d0e13"/>
<g transform="translate(13,-178) rotate(-24)"><path d="M -2.6,0 q 1.3,-1.5 2.6,0 q 1.3,1.5 2.6,0" stroke="#b3ac96" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.7"/></g>
<g transform="translate(24,-160) rotate(8)"><path d="M -2.6,0 q 1.3,-1.5 2.6,0 q 1.3,1.5 2.6,0" stroke="#b3ac96" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.65"/></g>
<g transform="translate(6,-150) rotate(-12)"><path d="M -2.6,0 q 1.3,-1.5 2.6,0 q 1.3,1.5 2.6,0" stroke="#b3ac96" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.6"/></g>
<g transform="translate(20,-188) rotate(20)"><path d="M -2.4,0 q 1.2,-1.4 2.4,0 q 1.2,1.4 2.4,0" stroke="#9a937e" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.6"/></g>
<g transform="translate(28,-176) rotate(-18)"><path d="M -2.4,0 q 1.2,-1.4 2.4,0 q 1.2,1.4 2.4,0" stroke="#b3ac96" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/></g>
<g transform="translate(-22,-168) rotate(14)"><path d="M -2.4,0 q 1.2,-1.4 2.4,0 q 1.2,1.4 2.4,0" stroke="#b3ac96" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.6"/></g>
<g transform="translate(-26,-150) rotate(-10)"><path d="M -2.4,0 q 1.2,-1.4 2.4,0 q 1.2,1.4 2.4,0" stroke="#9a937e" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/></g>
<g transform="translate(2,-212) rotate(6)"><path d="M -2.2,0 q 1.1,-1.3 2.2,0 q 1.1,1.3 2.2,0" stroke="#b3ac96" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/></g>
<g transform="translate(-50,-156) rotate(-20)"><path d="M -2.2,0 q 1.1,-1.3 2.2,0 q 1.1,1.3 2.2,0" stroke="#b3ac96" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/></g>
<g transform="translate(58,-160) rotate(16)"><path d="M -2.2,0 q 1.1,-1.3 2.2,0 q 1.1,1.3 2.2,0" stroke="#9a937e" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.5"/></g>
<g transform="translate(0,-198) rotate(-8)"><path d="M -2.2,0 q 1.1,-1.3 2.2,0 q 1.1,1.3 2.2,0" stroke="#b3ac96" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/></g>
<circle cx="-18" cy="-6" r="1.1" fill="#b3ac96" opacity="0.45"/>
<circle cx="-6" cy="-2" r="1.1" fill="#9a937e" opacity="0.4"/>
<circle cx="8" cy="-5" r="1" fill="#b3ac96" opacity="0.45"/>
<circle cx="22" cy="-2" r="1.1" fill="#b3ac96" opacity="0.4"/>
<circle cx="-30" cy="-3" r="1" fill="#9a937e" opacity="0.4"/>
<circle cx="38" cy="-4" r="1" fill="#b3ac96" opacity="0.4"/>
<circle cx="0" cy="-7" r="1" fill="#9a937e" opacity="0.35"/>
</g>`;
}

function zChien(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.42" cy="0.3" r="0.85"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.5" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-croupe" cx="0.5" cy="0.28" r="0.9"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-epaule" cx="0.38" cy="0.32" r="0.85"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.3" r="0.95"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-patte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-patteAv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1c24"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-gueule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2410"/><stop offset="0.5" stop-color="#a31621"/><stop offset="1" stop-color="#101117"/></linearGradient>
<radialGradient id="${p}-bouche" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#5e0e16"/><stop offset="0.7" stop-color="#3a0a10"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9421e" stop-opacity="0.5"/><stop offset="1" stop-color="#c9421e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="120" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-92" cy="-4" rx="34" ry="7" fill="#000" opacity="0.4"/>
<ellipse cx="62" cy="-2" rx="38" ry="7" fill="#000" opacity="0.4"/>
<ellipse cx="-66" cy="-70" rx="58" ry="30" fill="url(#${p}-braise)" opacity="0.4"/>
<path d="M 64,-160 Q 98,-156 116,-128 Q 128,-104 124,-78 Q 120,-52 102,-40 Q 110,-30 106,-14 L 96,-2 L 86,-2 L 90,-22 L 78,-34 Q 56,-30 38,-36 Q 18,-44 6,-62 Q -2,-50 -4,-34 L 2,-12 L -6,-2 L -16,-2 L -16,-22 Q -18,-44 -10,-66 Q -30,-72 -48,-86 L -66,-104 L -84,-116 Q -94,-100 -86,-82 L -78,-72 L -88,-66 L -94,-50 L -86,-30 L -94,-14 L -100,-2 L -110,-2 L -106,-22 Q -114,-46 -106,-72 Q -100,-96 -82,-112 Q -60,-130 -32,-138 Q 0,-148 32,-150 Q 50,-152 64,-160 Z" fill="url(#${p}-torse)"/>
<path d="M 62,-158 Q 96,-150 112,-122 Q 124,-100 118,-76 Q 110,-94 110,-114 Q 102,-138 78,-148 Q 70,-154 62,-158 Z" fill="url(#${p}-croupe)"/>
<path d="M -8,-66 Q -28,-78 -42,-96 Q -54,-112 -50,-128 Q -36,-118 -24,-100 Q -14,-84 -8,-66 Z" fill="url(#${p}-epaule)"/>
<path d="M 60,-156 Q 88,-148 104,-126 Q 96,-128 84,-138 Q 72,-150 60,-156 Z" fill="#1d1c24" opacity="0.6"/>
<path d="M -44,-120 Q -32,-104 -22,-86" stroke="#1d1c24" stroke-width="3" fill="none" opacity="0.55"/>
<path d="M 70,-150 Q 86,-142 96,-126 M 56,-148 Q 72,-138 82,-120" stroke="#1d1c24" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M -6,-66 Q 16,-58 40,-62 M -2,-52 Q 22,-44 46,-50 M 4,-36 Q 26,-30 50,-38" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.55"/>
<path d="M 8,-64 Q 18,-40 14,-16 M 24,-66 Q 34,-42 30,-16 M 40,-66 Q 50,-44 46,-18 M 56,-62 Q 64,-42 60,-20" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.85"/>
<path d="M 8,-64 Q 18,-40 14,-16 M 24,-66 Q 34,-42 30,-16 M 40,-66 Q 50,-44 46,-18" stroke="#17161c" stroke-width="1.2" fill="none" opacity="0.5"/>
<path d="M 14,-78 Q 36,-92 60,-90 Q 50,-78 28,-78 Q 18,-80 14,-78 Z" fill="#0d0e13" opacity="0.65"/>
<path d="M 18,-80 Q 28,-72 38,-74 M 42,-82 Q 50,-76 58,-78" stroke="#b3ac96" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 20,-78 q -1,8 1,15 M 34,-78 q -1,8 1,16 M 48,-80 q -1,8 1,15" stroke="#b3ac96" stroke-width="1.6" fill="none" opacity="0.4"/>
<path d="M 60,-92 Q 80,-86 94,-72 L 88,-66 Q 76,-80 58,-86 Z" fill="#1d1c24" opacity="0.5"/>
<path d="M 16,-60 q -4,10 -2,22 M 30,-58 q -3,9 -1,20" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.4"/>
<path d="M 90,-44 Q 100,-26 96,-10 L 86,-2 L 94,-2 L 104,-16 Q 110,-34 102,-50 Z" fill="url(#${p}-patte)"/>
<path d="M 86,-2 l -2,3 M 91,-2 l -2,3 M 96,-2 l -2,3 M 101,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M 96,-26 q 4,8 1,16" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 76,-32 L 80,-12 L 72,-2 L 82,-2 L 90,-14 L 88,-30 Z" fill="url(#${p}-patte)"/>
<path d="M 72,-2 l -2,3 M 77,-2 l -2,3 M 82,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M 80,-26 q -3,8 0,16" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -6,-34 Q -2,-16 -6,-2 L -16,-2 L -8,-2 L 0,-14 L 2,-32 Z" fill="url(#${p}-patteAv)"/>
<path d="M -16,-2 l -3,3 M -10,-2 l -2,3 M -4,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -2,-22 q -3,9 -1,18" stroke="#a31621" stroke-width="2" fill="none" opacity="0.75"/>
<path d="M -86,-30 Q -90,-14 -96,-2 L -106,-2 L -98,-2 L -90,-14 L -84,-30 Z" fill="url(#${p}-patteAv)"/>
<path d="M -106,-2 l -3,3 M -100,-2 l -2,3 M -94,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -90,-44 q -4,8 -2,18" stroke="#a31621" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -88,-66 q 6,6 4,14" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -78,-56 q -4,9 -2,18" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M 116,-128 Q 142,-126 158,-104 L 150,-96 Q 136,-112 112,-118 Z" fill="url(#${p}-croupe)"/>
<path d="M 158,-104 Q 170,-92 164,-76 Q 158,-86 152,-96 Z" fill="#0d0e13"/>
<path d="M 150,-96 q 8,6 8,16" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -82,-118 L -76,-110 L -68,-126 L -60,-108 L -52,-128 L -44,-108 L -36,-128 L -28,-108 L -20,-124 L -10,-108 L -2,-122 L 8,-104 L 18,-120 L 30,-102 L 42,-118 L 54,-100 L 66,-116 L 80,-100" stroke="#0d0e13" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
<path d="M -76,-114 L -70,-104 L -62,-120 M -50,-122 L -42,-104 M -28,-122 L -20,-106 M -2,-116 L 6,-100 M 30,-116 L 38,-100 M 54,-114 L 62,-100" stroke="#3d4a36" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -34,-126 L -30,-110 M 18,-120 L 22,-104 M 66,-116 L 70,-102" stroke="#2a3326" stroke-width="1.3" fill="none" opacity="0.45"/>
<path d="M -82,-118 Q -116,-110 -134,-84 L -128,-78 Q -110,-98 -86,-104 Z" fill="url(#${p}-croupe)"/>
<path d="M -134,-84 Q -144,-72 -138,-58 Q -132,-64 -130,-76 Z" fill="#0d0e13"/>
<path d="M -100,-104 q -16,6 -28,18" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -120,-92 q 6,2 6,8 M -110,-100 q 6,2 6,7" stroke="#2a3326" stroke-width="1.4" fill="none" opacity="0.45"/>
<path d="M -82,-128 Q -112,-126 -128,-150 L -118,-178 Q -110,-200 -90,-206 Q -70,-208 -60,-192 L -54,-168 Q -52,-150 -60,-138 Q -72,-130 -82,-128 Z" fill="url(#${p}-crane)"/>
<path d="M -84,-128 Q -110,-130 -124,-150 L -116,-172 Q -112,-156 -100,-144 Q -92,-136 -82,-134 Z" fill="#0d0e13" opacity="0.55"/>
<path d="M -88,-200 Q -78,-204 -70,-198 L -66,-180 Q -78,-186 -90,-182 Z" fill="#1d1c24" opacity="0.6"/>
<path d="M -100,-160 q 10,5 20,2 M -100,-150 q 9,5 18,2 M -98,-140 q 8,4 16,2" stroke="#1d1c24" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -90,-178 q 8,5 18,3 M -88,-170 q 8,4 16,2" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -90,-206 L -102,-230 L -82,-216 Z" fill="#14151b"/>
<path d="M -90,-206 L -98,-226 L -84,-214 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -68,-202 L -72,-228 L -56,-210 Z" fill="#14151b"/>
<path d="M -68,-202 L -70,-224 L -58,-208 Z" fill="#0d0e13" opacity="0.55"/>
<path d="M -100,-226 L -106,-240 L -94,-230 Z" fill="#0d0e13"/>
<path d="M -72,-224 L -74,-238 L -64,-228 Z" fill="#0d0e13"/>
<path d="M -100,-218 q -4,-8 -1,-15 M -70,-214 q -2,-8 2,-14" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M -86,-128 Q -116,-132 -134,-150 Q -148,-166 -144,-184 L -134,-178 Q -136,-162 -124,-150 Q -108,-136 -82,-134 Z" fill="url(#${p}-gueule)"/>
<path d="M -134,-150 Q -148,-166 -144,-184 L -134,-178 Q -136,-162 -124,-150 Z" fill="#a31621" opacity="0.55"/>
<path d="M -110,-142 Q -126,-152 -138,-150" stroke="#5e0e16" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M -134,-178 L -146,-182 L -137,-172 L -150,-174 L -140,-164 L -152,-164 L -142,-156 L -154,-154 L -144,-148" stroke="#b3ac96" stroke-width="2" fill="none" stroke-linejoin="round"/>
<path d="M -138,-178 L -144,-170 M -132,-172 L -138,-164 M -127,-166 L -133,-158 M -122,-160 L -128,-152" stroke="#8f8876" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path d="M -141,-176 l 4,4 M -136,-170 l 4,3 M -131,-164 l 4,3" stroke="#0d0e13" stroke-width="1" fill="none" opacity="0.5"/>
<path d="M -82,-128 Q -112,-118 -130,-100 Q -142,-86 -138,-72 L -128,-78 Q -126,-92 -114,-104 Q -100,-118 -78,-122 Z" fill="url(#${p}-gueule)"/>
<path d="M -130,-100 Q -142,-86 -138,-72 L -128,-78 Q -126,-92 -114,-104 Z" fill="#a31621" opacity="0.5"/>
<path d="M -108,-110 Q -124,-100 -134,-86" stroke="#5e0e16" stroke-width="3" fill="none" opacity="0.65"/>
<path d="M -138,-72 L -148,-72 L -139,-64 L -150,-62 L -140,-56 L -152,-52 L -142,-46" stroke="#b3ac96" stroke-width="2" fill="none" stroke-linejoin="round"/>
<path d="M -134,-78 L -138,-68 M -128,-82 L -132,-72 M -122,-88 L -126,-78 M -116,-94 L -120,-84" stroke="#8f8876" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path d="M -141,-70 l 3,4 M -136,-64 l 3,4 M -131,-58 l 3,4" stroke="#0d0e13" stroke-width="1" fill="none" opacity="0.5"/>
<path d="M -126,-104 Q -110,-114 -90,-118 Q -106,-108 -120,-98 Z" fill="url(#${p}-bouche)"/>
<path d="M -120,-126 Q -106,-130 -94,-126 Q -108,-120 -118,-120 Z" fill="url(#${p}-bouche)" opacity="0.9"/>
<path d="M -114,-122 q 8,3 16,1" stroke="#3a0a10" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -136,-128 Q -152,-130 -160,-138 Q -154,-126 -142,-124 Z" fill="#a31621"/>
<path d="M -138,-126 Q -150,-118 -148,-106 Q -142,-116 -134,-122 Z" fill="#a31621"/>
<path d="M -148,-126 q -4,4 -3,9" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -126,-150 Q -142,-158 -154,-150 Q -142,-146 -128,-146 Z" fill="#101117"/>
<path d="M -154,-150 q -6,1 -9,5 M -154,-150 q -3,4 -2,9" stroke="#0d0e13" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M -149,-149 q -3,1 -5,3" stroke="#1d1c24" stroke-width="1.3" fill="none" opacity="0.7"/>
<path d="M -134,-188 Q -126,-202 -114,-202 Q -108,-194 -112,-186 Q -122,-182 -134,-188 Z" fill="#101117"/>
<path d="M -130,-194 Q -122,-198 -116,-196" stroke="#1d1c24" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -134,-186 q 8,4 18,1" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -120,-204 q -4,-7 -2,-13" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -150,-136 Q -136,-130 -120,-134 L -108,-140 L -118,-132 Q -134,-126 -150,-130 Z" fill="#a31621" opacity="0.4"/>
<path d="M -132,-128 q 4,16 -2,30 q -2,6 1,8 M -120,-126 q 5,18 0,34" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.85"/>
<path d="M -132,-128 q 4,16 -2,30" stroke="#a31621" stroke-width="1.2" fill="none" opacity="0.6"/>
<ellipse cx="-135" cy="-92" rx="4" ry="6" fill="#5e0e16" opacity="0.8"/>
<ellipse cx="-126" cy="-78" rx="3" ry="5" fill="#5e0e16" opacity="0.7"/>
<circle cx="-118" cy="-186" r="8" fill="url(#${p}-eye)"/>
<circle cx="-118" cy="-186" r="2.5" fill="#d6303e"/>
<circle cx="-119.2" cy="-187.2" r="0.9" fill="#e8868d"/>
<circle cx="-100" cy="-176" r="8" fill="url(#${p}-eye)"/>
<circle cx="-100" cy="-176" r="2.5" fill="#d6303e"/>
<circle cx="-101.2" cy="-177.2" r="0.9" fill="#e8868d"/>
<path d="M -110,-190 q 8,-2 14,2 M -110,-180 q 9,-2 14,2" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.6"/>
</g>`;
}

function zColosse(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.36" cy="0.28" r="0.92"><stop offset="0" stop-color="#1d1f2a"/><stop offset="0.5" stop-color="#101117"/><stop offset="1" stop-color="#08090d"/></radialGradient>
<linearGradient id="${p}-plaq" x1="0.1" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#2e3140"/><stop offset="0.45" stop-color="#191b25"/><stop offset="1" stop-color="#0b0c12"/></linearGradient>
<linearGradient id="${p}-plaqD" x1="0.9" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#272a37"/><stop offset="0.5" stop-color="#15161f"/><stop offset="1" stop-color="#0a0b10"/></linearGradient>
<radialGradient id="${p}-casq" cx="0.38" cy="0.28" r="0.82"><stop offset="0" stop-color="#31343f"/><stop offset="0.55" stop-color="#181a24"/><stop offset="1" stop-color="#0a0b10"/></radialGradient>
<linearGradient id="${p}-visi" x1="0.2" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#1d2029"/><stop offset="0.45" stop-color="#0b0c11"/><stop offset="1" stop-color="#040508"/></linearGradient>
<radialGradient id="${p}-bras" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stop-color="#20222d"/><stop offset="0.55" stop-color="#13141a"/><stop offset="1" stop-color="#090a0e"/></radialGradient>
<radialGradient id="${p}-chair" cx="0.4" cy="0.34" r="0.8"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-poing" cx="0.36" cy="0.3" r="0.9"><stop offset="0" stop-color="#23252f"/><stop offset="0.55" stop-color="#15161d"/><stop offset="1" stop-color="#0a0b10"/></radialGradient>
<linearGradient id="${p}-acier" x1="0.2" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#5a656f"/><stop offset="0.5" stop-color="#3e4750"/><stop offset="1" stop-color="#2a323a"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#a31621"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="124" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-8" cy="4" rx="64" ry="7" fill="#000" opacity="0.35"/>

<path d="M -54,-30 L -74,-10 L -64,-1 L -34,-12 Z" fill="#08090d"/>
<path d="M 56,-30 L 78,-10 L 66,-1 L 34,-12 Z" fill="#08090d"/>
<path d="M -64,-1 l 8,-3 M 66,-1 l -8,-3" stroke="#1a1d27" stroke-width="2" opacity="0.5"/>

<path d="M -58,-122 L -72,-58 L -62,-4 L -22,-4 L -30,-64 L -16,-114 Z" fill="url(#${p}-torse)"/>
<path d="M 56,-122 L 72,-60 L 62,-4 L 24,-4 L 30,-64 L 14,-114 Z" fill="url(#${p}-torse)"/>
<path d="M -64,-110 q -10,52 -2,100" stroke="#08090d" stroke-width="4" fill="none" opacity="0.6"/>
<path d="M 62,-112 q 10,52 2,102" stroke="#08090d" stroke-width="4" fill="none" opacity="0.6"/>

<rect x="-66" y="-58" width="32" height="48" rx="8" fill="url(#${p}-plaq)"/>
<rect x="34" y="-60" width="32" height="48" rx="8" fill="url(#${p}-plaqD)"/>
<path d="M -62,-52 l 24,4 M -64,-40 l 26,3 M -64,-28 l 26,3 M -62,-18 l 24,3" stroke="#040508" stroke-width="1.6" opacity="0.7"/>
<path d="M 38,-54 l 24,4 M 36,-42 l 26,3 M 36,-30 l 26,3 M 38,-20 l 24,3" stroke="#040508" stroke-width="1.6" opacity="0.7"/>
<path d="M -60,-55 l 22,3" stroke="#3a4150" stroke-width="1.2" opacity="0.5"/>
<path d="M 40,-57 l 22,3" stroke="#3a4150" stroke-width="1.2" opacity="0.5"/>
<path d="M -58,-44 l 8,30 l 6,-2 l -7,-30 Z" fill="#040508" opacity="0.6"/>
<path d="M 56,-46 l -8,32 l -6,-2 l 7,-31 Z" fill="#040508" opacity="0.55"/>

<path d="M -34,-58 L -22,-4 L 24,-4 L 34,-60 L 14,-66 L 0,-58 L -16,-66 Z" fill="url(#${p}-chair)"/>
<path d="M -16,-66 q 10,4 18,0 q 8,4 18,-2 q -6,8 -18,8 q -12,0 -18,-6 Z" fill="#0d0e13" opacity="0.8"/>
<path d="M -24,-50 q 14,6 28,2 q 12,4 22,-2" stroke="#08090d" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -20,-38 q 14,6 26,2 q 10,4 18,-2" stroke="#08090d" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M -18,-24 l 36,0" stroke="#08090d" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -10,-58 l 4,52 M 2,-58 l 0,52 M 14,-60 l -4,54" stroke="#08090d" stroke-width="1.6" opacity="0.5"/>
<path d="M -4,-54 q -8,10 -2,24 q -10,2 -14,-8 q -2,-12 6,-18 Z" fill="#0d0e13"/>
<path d="M -16,-46 q -8,4 -10,16 l 8,2 q 0,-10 6,-14 Z" fill="url(#${p}-chair)"/>
<path d="M -22,-44 l 6,2 l -2,8 l -6,-1 Z" fill="url(#${p}-os)" opacity="0.7"/>
<path d="M -20,-32 l 5,1 l -1,7 l -5,-1 Z" fill="url(#${p}-os)" opacity="0.6"/>
<path d="M -10,-40 q 4,14 0,28" stroke="#a31621" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -6,-50 q 6,4 12,2" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.7"/>
<path d="M -14,-44 q -2,12 4,22 q 4,2 4,-4 q -4,-8 -2,-16 Z" fill="url(#${p}-sang)" opacity="0.5"/>

<path d="M -62,-4 L -22,-4 L -20,10 L -66,12 Z" fill="#070809"/>
<path d="M 62,-4 L 22,-4 L 20,10 L 66,12 Z" fill="#070809"/>
<path d="M -22,-4 l 0,14 l 44,0 l 0,-14 Z" fill="#0d0e13"/>
<path d="M -54,-6 l 26,0 M 28,-6 l 26,0" stroke="#1a1d27" stroke-width="2" opacity="0.6"/>
<path d="M -18,0 l 36,0 M -18,6 l 36,0" stroke="#08090d" stroke-width="1.4" opacity="0.6"/>
<rect x="-30" y="-6" width="10" height="16" rx="2" fill="url(#${p}-acier)" opacity="0.8"/>
<rect x="20" y="-6" width="10" height="16" rx="2" fill="url(#${p}-acier)" opacity="0.7"/>

<path d="M -76,-130 Q -92,-200 -58,-250 L 64,-250 Q 92,-198 78,-128 L 46,-138 L 26,-124 L 0,-140 L -26,-124 L -50,-138 Z" fill="url(#${p}-torse)"/>
<path d="M -76,-130 Q -90,-198 -58,-250 L -40,-250 Q -70,-200 -58,-132 Z" fill="#08090d" opacity="0.55"/>
<path d="M 78,-128 Q 90,-198 60,-250 L 50,-250 Q 78,-200 66,-130 Z" fill="#1d1f2a" opacity="0.4"/>

<path d="M -58,-244 L -42,-248 L -38,-200 L -60,-202 Z" fill="#0b0c12" opacity="0.7"/>
<path d="M 62,-244 L 46,-248 L 42,-200 L 62,-202 Z" fill="#0b0c12" opacity="0.7"/>
<path d="M -50,-246 q -16,56 -8,112" stroke="#040508" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M 54,-246 q 16,56 8,114" stroke="#040508" stroke-width="2.4" fill="none" opacity="0.5"/>

<rect x="-50" y="-234" width="98" height="36" rx="9" fill="url(#${p}-plaq)"/>
<rect x="-52" y="-192" width="102" height="32" rx="9" fill="url(#${p}-plaqD)"/>
<rect x="-48" y="-154" width="94" height="28" rx="8" fill="url(#${p}-plaq)"/>
<rect x="-44" y="-122" width="86" height="15" rx="5" fill="#0b0c12"/>
<path d="M -50,-216 l 98,0 M -52,-175 l 102,0 M -48,-139 l 94,0" stroke="#3e4750" stroke-width="2.6" opacity="0.85"/>
<path d="M -50,-213 l 98,0 M -52,-172 l 102,0 M -48,-136 l 94,0" stroke="#040508" stroke-width="1.4" opacity="0.6"/>
<path d="M -46,-228 l 90,0 M -48,-186 l 94,0 M -44,-148 l 86,0" stroke="#5a656f" stroke-width="1.2" opacity="0.4"/>
<path d="M -10,-226 l 6,30 l -8,0 l -4,-28 Z" fill="#040508" opacity="0.6"/>
<path d="M 20,-188 l -5,26 l 7,0 l 4,-24 Z" fill="#040508" opacity="0.55"/>
<path d="M 30,-232 q 2,16 -2,30" stroke="#5a656f" stroke-width="1.6" opacity="0.4" fill="none"/>
<path d="M -34,-200 l 8,4 l -2,-10 Z" fill="#3e4750" opacity="0.6"/>
<rect x="-13" y="-124" width="24" height="17" rx="3" fill="url(#${p}-acier)"/>
<rect x="-8" y="-120" width="14" height="9" rx="1" fill="#0b0c12"/>
<circle cx="-9" cy="-115" r="1.4" fill="#5a656f" opacity="0.7"/>

<path d="M 14,-208 L 42,-150 L 36,-128" stroke="#a31621" stroke-width="3" opacity="0.55" fill="none"/>
<path d="M 18,-200 q 7,18 1,42" stroke="#7a1018" stroke-width="2" opacity="0.5" fill="none"/>
<path d="M -34,-176 q -6,20 2,40" stroke="#5e0e16" stroke-width="2.2" opacity="0.45" fill="none"/>
<path d="M 24,-162 l 4,18 l 3,-2 l -3,-17 Z" fill="url(#${p}-sang)" opacity="0.5"/>

<path d="M -90,-242 Q -72,-262 -48,-252 L -52,-216 Q -80,-210 -94,-224 Z" fill="url(#${p}-plaq)"/>
<path d="M 92,-242 Q 74,-262 50,-252 L 54,-216 Q 82,-210 96,-224 Z" fill="url(#${p}-plaqD)"/>
<path d="M -88,-236 q 14,-13 32,-9 M -90,-229 q 18,-11 34,-7 M -91,-222 q 18,-8 33,-5" stroke="#3e4750" stroke-width="1.6" opacity="0.6" fill="none"/>
<path d="M 90,-236 q -14,-13 -32,-9 M 92,-229 q -18,-11 -34,-7 M 93,-222 q -18,-8 -33,-5" stroke="#3e4750" stroke-width="1.6" opacity="0.6" fill="none"/>
<path d="M -86,-238 q 16,-11 34,-7" stroke="#5a656f" stroke-width="1.2" opacity="0.4" fill="none"/>
<path d="M -74,-250 l 4,10 l 5,-2 l -4,-9 Z" fill="#040508" opacity="0.6"/>

<path d="M -80,-224 L -100,-160 L -90,-92" stroke="url(#${p}-bras)" stroke-width="24" fill="none" stroke-linecap="round"/>
<path d="M 84,-224 L 104,-162 L 94,-94" stroke="url(#${p}-bras)" stroke-width="24" fill="none" stroke-linecap="round"/>
<path d="M -88,-218 L -106,-158 L -97,-98" stroke="#08090d" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.5"/>
<path d="M 92,-218 L 110,-160 L 101,-100" stroke="#1d1f2a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.4"/>
<path d="M -86,-188 q -10,4 -12,20 M -94,-150 q -8,4 -10,18 M -84,-204 q -8,3 -10,14" stroke="#040508" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M 90,-190 q 10,4 12,20 M 96,-152 q 8,4 10,18 M 88,-206 q 8,3 10,14" stroke="#040508" stroke-width="3" opacity="0.5" fill="none"/>
<rect x="-101" y="-178" width="15" height="38" rx="4" fill="url(#${p}-plaq)" transform="rotate(11 -93 -159)"/>
<rect x="86" y="-180" width="15" height="38" rx="4" fill="url(#${p}-plaqD)" transform="rotate(-11 93 -161)"/>
<path d="M -100,-170 l 12,2 M -101,-160 l 13,2 M -100,-150 l 12,2" stroke="#040508" stroke-width="1.4" opacity="0.6" transform="rotate(11 -93 -159)"/>
<path d="M 88,-172 l 12,2 M 89,-162 l 12,2 M 88,-152 l 12,2" stroke="#040508" stroke-width="1.4" opacity="0.6" transform="rotate(-11 93 -161)"/>

<path d="M -98,-148 q 8,-6 16,-4" stroke="#1d1c24" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M -96,-140 q 6,-2 12,0" stroke="#a31621" stroke-width="2" opacity="0.6" fill="none"/>
<path d="M 100,-150 q 12,2 18,14 q 4,8 -2,12 q -10,4 -16,-4" stroke="#1d1c24" stroke-width="7" fill="none"/>
<path d="M 102,-144 l 8,10 M 108,-138 l 6,9" stroke="#a31621" stroke-width="1.8" opacity="0.8"/>
<path d="M 114,-140 q 4,6 0,12" stroke="#5e0e16" stroke-width="2.2" opacity="0.6" fill="none"/>
<path d="M 108,-146 l 6,3 l -1,5 l -6,-2 Z" fill="url(#${p}-os)" opacity="0.65"/>

<ellipse cx="-92" cy="-90" rx="20" ry="23" fill="url(#${p}-poing)"/>
<path d="M -110,-100 q -2,-8 6,-12 q -8,18 0,30 q -8,-6 -6,-18 Z" fill="#08090d" opacity="0.6"/>
<path d="M -108,-98 q 5,-7 14,-7 q 9,0 12,7 M -111,-89 q 7,-5 16,-5 q 9,0 12,5 M -109,-80 q 7,-4 14,-4 q 8,0 10,4 M -106,-71 q 6,-3 12,-3 q 7,0 9,3" stroke="#040508" stroke-width="2.2" fill="none"/>
<path d="M -92,-110 q -7,2 -9,9" stroke="#0a0b10" stroke-width="4" fill="none"/>
<path d="M -102,-101 q 3,9 0,20" stroke="#a31621" stroke-width="2.2" opacity="0.6" fill="none"/>
<path d="M -84,-99 q 5,-2 10,1" stroke="#5e0e16" stroke-width="2.6" opacity="0.6" fill="none"/>
<path d="M -100,-86 l 7,2 l -1,6 l -7,-2 Z" fill="url(#${p}-os)" opacity="0.55"/>
<path d="M -94,-94 q -6,6 -4,18" stroke="#7a1018" stroke-width="1.8" opacity="0.5" fill="none"/>

<ellipse cx="96" cy="-92" rx="20" ry="24" fill="url(#${p}-poing)"/>
<path d="M 114,-102 q 2,-8 -6,-12 q 8,18 0,30 q 8,-6 6,-18 Z" fill="#1d1f2a" opacity="0.4"/>
<path d="M 112,-100 q -5,-7 -14,-7 q -9,0 -12,7 M 115,-91 q -7,-5 -16,-5 q -9,0 -12,5 M 113,-82 q -7,-4 -14,-4 q -8,0 -10,4 M 110,-73 q -6,-3 -12,-3 q -7,0 -9,3" stroke="#040508" stroke-width="2.2" fill="none"/>
<path d="M 96,-112 q 7,2 9,9" stroke="#0a0b10" stroke-width="4" fill="none"/>
<path d="M 88,-96 q -4,8 -2,18" stroke="#8f8876" stroke-width="2.2" opacity="0.5" fill="none"/>
<path d="M 106,-100 q 4,8 1,18" stroke="#a31621" stroke-width="2" opacity="0.55" fill="none"/>
<path d="M 98,-104 l 6,4 l -2,6 l -6,-3 Z" fill="url(#${p}-os)" opacity="0.5"/>

<path d="M -20,-250 L -18,-264 L 20,-264 L 20,-250 Z" fill="#0b0c12"/>
<path d="M -18,-256 l 36,0" stroke="#040508" stroke-width="2" opacity="0.7"/>
<path d="M -16,-262 l 32,0" stroke="#1a1d27" stroke-width="1.2" opacity="0.5"/>
<path d="M -22,-254 q 0,8 4,10 M 22,-254 q 0,8 -4,10" stroke="#08090d" stroke-width="2.4" fill="none" opacity="0.5"/>

<path d="M -32,-266 Q -38,-314 0,-324 Q 38,-314 32,-266 Q 30,-252 18,-250 L -18,-250 Q -30,-252 -32,-266 Z" fill="url(#${p}-casq)"/>
<path d="M -32,-266 Q -38,-314 0,-324 Q 18,-319 24,-304 Q -2,-312 -24,-298 Q -32,-282 -30,-266 Z" fill="#31343f" opacity="0.38"/>
<path d="M 0,-324 Q 32,-314 32,-276" stroke="#3e4750" stroke-width="2" opacity="0.4" fill="none"/>
<path d="M 2,-324 Q 32,-312 30,-272" stroke="#040508" stroke-width="1.6" opacity="0.5" fill="none"/>
<path d="M -2,-324 q 6,32 4,64" stroke="#040508" stroke-width="2.4" opacity="0.45" fill="none"/>
<path d="M -30,-280 Q 0,-288 30,-280 L 28,-274 Q 0,-282 -28,-274 Z" fill="#3e4750" opacity="0.45"/>
<path d="M -30,-296 Q 0,-304 30,-296 L 29,-291 Q 0,-299 -29,-291 Z" fill="#3e4750" opacity="0.35"/>
<path d="M 14,-312 q 8,4 12,14 l -4,2 q -4,-9 -10,-13 Z" fill="#5a656f" opacity="0.4"/>
<path d="M -18,-300 q -6,8 -6,18 l 5,1 q 0,-10 5,-16 Z" fill="#040508" opacity="0.5"/>
<path d="M 20,-270 l 8,6 l -2,4 l -8,-5 Z" fill="#040508" opacity="0.6"/>

<path d="M -26,-286 L 26,-286 L 24,-260 Q 0,-253 -24,-260 Z" fill="url(#${p}-visi)"/>
<path d="M -26,-286 L 0,-283 L -24,-260 Z" fill="#1d2029" opacity="0.5"/>
<path d="M -22,-278 L 24,-274" stroke="#a31621" stroke-width="2.4" opacity="0.85"/>
<path d="M -22,-277 L 24,-273" stroke="#7a1018" stroke-width="1" opacity="0.7"/>
<path d="M -10,-285 L 8,-258" stroke="#040508" stroke-width="2.4" opacity="0.6"/>
<path d="M -8,-285 L 10,-258" stroke="#3e4750" stroke-width="0.8" opacity="0.5"/>
<path d="M -22,-284 l 0,24 M -10,-285 l 0,26 M 4,-285 l 0,26 M 18,-284 l 0,23" stroke="#040508" stroke-width="1.4" opacity="0.5"/>
<path d="M -24,-284 L 24,-284" stroke="#1a1d27" stroke-width="1.8" opacity="0.6"/>
<path d="M -20,-282 l 38,2" stroke="#2e3140" stroke-width="1" opacity="0.4"/>
<path d="M 6,-280 l 6,18 l -3,1 l -6,-17 Z" fill="#040508" opacity="0.55"/>

<rect x="-22" y="-260" width="44" height="10" rx="3" fill="#0a0b10"/>
<path d="M -20,-255 l 40,0" stroke="#1a1d27" stroke-width="1.4" opacity="0.5"/>
<circle cx="-13" cy="-255" r="1.5" fill="#040508"/>
<circle cx="-4" cy="-255" r="1.5" fill="#040508"/>
<circle cx="5" cy="-255" r="1.5" fill="#040508"/>
<circle cx="14" cy="-255" r="1.5" fill="#040508"/>
<path d="M -16,-258 q 0,4 4,4 M 16,-258 q 0,4 -4,4" stroke="#1a1d27" stroke-width="1" opacity="0.5" fill="none"/>

<circle cx="-10" cy="-271" r="8" fill="url(#${p}-eye)"/>
<circle cx="-10" cy="-271" r="2.4" fill="#d6303e"/>
<circle cx="-10.8" cy="-271.8" r="0.9" fill="#e8868d"/>
<circle cx="11" cy="-270" r="8" fill="url(#${p}-eye)"/>
<circle cx="11" cy="-270" r="2.4" fill="#d6303e"/>
<circle cx="10.2" cy="-270.8" r="0.9" fill="#e8868d"/>

<path d="M -38,-294 q -6,4 -6,14 M 38,-292 q 6,4 6,14" stroke="#040508" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M 6,-310 q 4,16 0,30" stroke="#a31621" stroke-width="2.2" opacity="0.6" fill="none"/>
<path d="M 8,-304 l 5,8" stroke="#d6303e" stroke-width="1.4" opacity="0.7"/>
<path d="M -28,-258 q -10,6 -14,18 l 5,2 q 4,-10 12,-15 Z" fill="#0d0e13" opacity="0.8"/>
<path d="M -30,-256 l 6,2 l -2,6 l -6,-2 Z" fill="url(#${p}-os)" opacity="0.5"/>
<path d="M 28,-256 q 8,6 10,16" stroke="#5e0e16" stroke-width="2" opacity="0.6" fill="none"/>
</g>`;
}

function zBrule(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}-torse" x1="0.15" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.45" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-crane" cx="0.38" cy="0.3" r="0.78"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.5" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-jambeG" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#0d0e13"/><stop offset="0.55" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-jambeD" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#0d0e13"/><stop offset="0.5" stop-color="#17161c"/><stop offset="1" stop-color="#1d1c24"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e07a2e" stop-opacity="0.9"/><stop offset="0.4" stop-color="#c9421e" stop-opacity="0.6"/><stop offset="1" stop-color="#7a2410" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-feu" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#f0a84a"/><stop offset="0.35" stop-color="#c9421e"/><stop offset="0.75" stop-color="#7a2410"/><stop offset="1" stop-color="#2a1008"/></radialGradient>
<linearGradient id="${p}-fissure" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a84a"/><stop offset="0.4" stop-color="#c9421e"/><stop offset="1" stop-color="#7a2410"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-fumee" cx="0.5" cy="1" r="0.85"><stop offset="0" stop-color="#525d67" stop-opacity="0.28"/><stop offset="0.6" stop-color="#44505a" stop-opacity="0.12"/><stop offset="1" stop-color="#44505a" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="64" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-22" cy="3" rx="22" ry="6" fill="#000" opacity="0.35"/>
<ellipse cx="0" cy="-70" rx="40" ry="34" fill="url(#${p}-braise)" opacity="0.25"/>

<ellipse cx="-4" cy="-86" rx="62" ry="74" fill="url(#${p}-fumee)"/>
<ellipse cx="8" cy="-150" rx="44" ry="62" fill="url(#${p}-fumee)"/>
<ellipse cx="-2" cy="-214" rx="30" ry="48" fill="url(#${p}-fumee)"/>

<path d="M -24,-94 L -36,-50 L -32,-22 L -36,-4 L -14,-2 L -16,-22 L -12,-50 L -6,-92 Z" fill="url(#${p}-jambeG)"/>
<path d="M 24,-96 L 38,-52 L 34,-22 L 38,-2 L 14,-4 L 16,-24 L 12,-52 L 6,-92 Z" fill="url(#${p}-jambeD)"/>
<path d="M -36,-4 l -16,3 l 1,9 l 22,-2 l 1,-8 Z" fill="#0d0e13"/>
<path d="M 38,-2 l 16,3 l -1,9 l -22,-2 l -1,-8 Z" fill="#0d0e13"/>
<path d="M -50,-1 l 4,4 M -45,-1 l 3,4 M -40,-2 l 3,4" stroke="#14151b" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M 52,-1 l -4,4 M 47,-1 l -3,4 M 42,-2 l -3,4" stroke="#14151b" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -28,-78 q 4,24 -4,44 q -4,10 0,28" stroke="url(#${p}-fissure)" stroke-width="1.7" fill="none" opacity="0.9"/>
<path d="M -27,-78 q 4,24 -4,44 q -4,10 0,28" stroke="#f0a84a" stroke-width="0.6" fill="none" opacity="0.7"/>
<path d="M 24,-80 q 5,22 0,42 q -3,12 2,28" stroke="url(#${p}-fissure)" stroke-width="1.7" fill="none" opacity="0.9"/>
<path d="M -22,-44 l 6,20 M -30,-58 l 4,14 M 18,-46 l 5,22 M 28,-60 l -3,14" stroke="#7a2410" stroke-width="1.2" fill="none" opacity="0.75"/>
<path d="M -20,-86 q -5,16 -3,30 M 12,-88 q 4,18 1,32" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.7"/>
<path d="M -34,-50 q -3,8 -1,16 M 38,-52 q 3,8 1,16" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.65"/>
<ellipse cx="-26" cy="-60" rx="3.2" ry="4.4" fill="url(#${p}-feu)" opacity="0.85"/>
<ellipse cx="24" cy="-66" rx="2.8" ry="4" fill="url(#${p}-feu)" opacity="0.8"/>
<path d="M -10,-44 q 6,3 14,0" stroke="#7a2410" stroke-width="2" fill="none" opacity="0.6"/>

<path d="M -36,-96 Q -50,-150 -32,-188 L 32,-190 Q 52,-150 38,-94 L 24,-104 L 12,-90 L -2,-104 L -16,-90 L -28,-102 Z" fill="url(#${p}-torse)"/>
<path d="M -32,-184 Q 0,-196 32,-186 L 28,-168 Q 0,-178 -28,-168 Z" fill="#0d0e13"/>
<path d="M -34,-150 Q -42,-120 -34,-96 L -28,-102 Q -36,-126 -30,-150 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -22,-160 Q -28,-130 -22,-100 L -10,-104 Q -8,-94 0,-98 Q 8,-94 12,-104 L 22,-100 Q 28,-128 22,-158 Q 0,-150 -22,-160 Z" fill="url(#${p}-feu)" opacity="0.55"/>
<path d="M -16,-156 Q -20,-128 -14,-102 Q 0,-94 14,-102 Q 20,-128 14,-156 Q 0,-148 -16,-156 Z" fill="url(#${p}-braise)"/>
<path d="M -10,-176 Q -14,-130 -6,-98 Q 0,-92 6,-98 Q 14,-132 10,-176 Z" fill="url(#${p}-fissure)" opacity="0.95"/>
<path d="M -7,-170 Q -10,-130 -3,-102 Q 0,-98 3,-102 Q 9,-132 6,-170 Z" fill="#f0a84a" opacity="0.6"/>
<ellipse cx="-12" cy="-138" rx="9" ry="14" fill="url(#${p}-os)" opacity="0.18"/>
<path d="M -22,-148 q 14,5 26,0 M -22,-138 q 14,5 26,0 M -21,-128 q 14,5 25,0 M -19,-118 q 13,5 24,0 M -17,-108 q 12,4 21,0" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.85"/>
<path d="M -20,-152 q 13,5 24,0 M -19,-110 q 12,4 21,0" stroke="#b3ac96" stroke-width="1.1" fill="none" opacity="0.4"/>
<path d="M 14,-110 q 6,4 13,0" stroke="#7a2410" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -30,-176 Q -34,-150 -28,-150 q -10,12 -2,26 q -8,12 0,26" stroke="url(#${p}-fissure)" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -29,-176 q -2,24 -6,52" stroke="#f0a84a" stroke-width="0.6" fill="none" opacity="0.7"/>
<path d="M 26,-178 Q 30,-150 24,-148 q 10,12 2,26 q 8,12 0,26" stroke="url(#${p}-fissure)" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -30,-178 l 7,7 M 28,-180 l -7,7 M -34,-128 l 9,5 M 30,-130 l -9,5 M -32,-108 l 8,4 M 30,-110 l -8,4 M -16,-180 l 6,6 M 18,-182 l -6,6" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M 18,-118 Q 32,-114 30,-98 L 16,-96 Q 10,-108 18,-118 Z" fill="#0d0e13"/>
<path d="M 19,-116 q 9,4 9,15" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.85"/>
<path d="M -34,-118 Q -44,-114 -42,-100 L -30,-98 Q -26,-110 -34,-118 Z" fill="#0d0e13"/>
<path d="M -33,-116 q -8,4 -8,15" stroke="#7a2410" stroke-width="1.4" fill="none" opacity="0.75"/>
<ellipse cx="22" cy="-150" rx="3" ry="4.2" fill="url(#${p}-feu)" opacity="0.85"/>
<ellipse cx="-26" cy="-128" rx="3.4" ry="4.6" fill="url(#${p}-feu)" opacity="0.85"/>
<ellipse cx="28" cy="-126" rx="2.6" ry="3.6" fill="url(#${p}-feu)" opacity="0.8"/>
<path d="M -14,-178 q 7,3 16,0 M -13,-170 q 7,3 15,0" stroke="#2a3326" stroke-width="1.6" fill="none" opacity="0.55"/>

<ellipse cx="-30" cy="-180" rx="11" ry="9" fill="url(#${p}-torse)"/>
<path d="M -30,-178 L -56,-152 L -68,-112 L -62,-78" stroke="url(#${p}-bras)" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -58,-150 q -8,18 -8,38 q 0,16 2,30" stroke="url(#${p}-fissure)" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M -57,-150 q -8,18 -8,38 q 0,16 2,30" stroke="#f0a84a" stroke-width="0.6" fill="none" opacity="0.6"/>
<path d="M -56,-150 l -6,9 M -65,-122 l -7,8 M -64,-100 l -7,7 M -50,-160 l -5,8" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.75"/>
<path d="M -64,-130 l 5,3 M -66,-108 l 5,3" stroke="#7a2410" stroke-width="1.3" fill="none" opacity="0.7"/>
<ellipse cx="-65" cy="-118" rx="2.8" ry="4" fill="url(#${p}-feu)" opacity="0.85"/>
<path d="M -62,-78 Q -76,-76 -78,-62 Q -78,-48 -64,-48 Q -50,-50 -50,-66 Q -52,-78 -62,-78 Z" fill="url(#${p}-bras)"/>
<path d="M -76,-62 Q -78,-50 -66,-48 L -64,-58 Q -72,-58 -76,-62 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -74,-64 q -4,6 -1,14 M -66,-56 q -3,6 0,12 M -57,-60 q -2,6 1,11" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M -76,-60 q 6,4 22,2" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M -68,-72 q 3,-6 10,-6" stroke="#7a2410" stroke-width="1.6" fill="none" opacity="0.7"/>
<ellipse cx="-67" cy="-58" rx="2.6" ry="3.4" fill="url(#${p}-feu)" opacity="0.8"/>

<ellipse cx="32" cy="-182" rx="11" ry="9" fill="url(#${p}-torse)"/>
<path d="M 32,-180 L 58,-154 L 70,-114 L 64,-80" stroke="url(#${p}-bras)" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 58,-152 q 8,18 8,38 q 0,14 -2,28" stroke="url(#${p}-fissure)" stroke-width="1.6" fill="none" opacity="0.85"/>
<path d="M 57,-152 q 8,18 8,38 q 0,14 -2,28" stroke="#f0a84a" stroke-width="0.6" fill="none" opacity="0.6"/>
<path d="M 58,-152 l 6,9 M 67,-124 l 7,8 M 66,-102 l 7,7 M 52,-162 l 5,8" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.75"/>
<path d="M 66,-132 l -5,3 M 68,-110 l -5,3" stroke="#7a2410" stroke-width="1.3" fill="none" opacity="0.7"/>
<ellipse cx="67" cy="-120" rx="2.8" ry="4" fill="url(#${p}-feu)" opacity="0.85"/>
<path d="M 64,-80 Q 78,-78 80,-64 Q 80,-50 66,-50 Q 52,-52 52,-68 Q 54,-80 64,-80 Z" fill="url(#${p}-bras)"/>
<path d="M 78,-64 Q 80,-52 68,-50 L 66,-60 Q 74,-60 78,-64 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 76,-64 q 4,6 1,14 M 68,-58 q 3,6 0,12 M 59,-62 q 2,6 -1,11" stroke="#0d0e13" stroke-width="2.2" fill="none" opacity="0.8"/>
<path d="M 78,-62 q -6,4 -22,2" stroke="url(#${p}-fissure)" stroke-width="1.4" fill="none" opacity="0.8"/>
<path d="M 70,-74 q -3,-6 -10,-6" stroke="#7a2410" stroke-width="1.6" fill="none" opacity="0.7"/>
<ellipse cx="69" cy="-60" rx="2.6" ry="3.4" fill="url(#${p}-feu)" opacity="0.8"/>

<path d="M -12,-188 L -14,-204 L 16,-206 L 16,-188 Z" fill="url(#${p}-bras)"/>
<path d="M -10,-194 q 7,4 20,2" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.85"/>
<path d="M -8,-200 q 8,3 18,0" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>

<g transform="rotate(8 0 -210)">
<path d="M -20,-206 Q -28,-244 -2,-256 Q 26,-246 22,-208 Q 18,-192 0,-190 Q -14,-192 -20,-206 Z" fill="url(#${p}-crane)"/>
<path d="M -16,-210 Q -22,-242 -4,-252 L 0,-250 Q -16,-240 -12,-208 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 2,-252 Q 10,-246 18,-238 Q 12,-218 18,-206 Q 10,-202 2,-206 Q -2,-228 2,-252 Z" fill="#1d1c24" opacity="0.7"/>
<path d="M -2,-250 Q 8,-244 16,-236 Q 12,-222 14,-214 L 6,-216 Q 2,-234 -2,-250 Z" fill="url(#${p}-os)" opacity="0.45"/>
<path d="M 2,-244 q 6,2 11,8 M 4,-234 q 5,2 9,6" stroke="#8f8876" stroke-width="1" fill="none" opacity="0.5"/>
<path d="M -14,-230 Q -2,-246 18,-234 L 16,-226 Q -2,-238 -12,-224 Z" fill="#0d0e13"/>
<path d="M -8,-248 q -3,18 0,34 M 6,-250 q 4,16 1,32 M 14,-240 q 2,14 -2,26" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.9"/>
<path d="M -7,-248 q -3,18 0,34" stroke="#f0a84a" stroke-width="0.6" fill="none" opacity="0.7"/>
<path d="M -18,-224 q 9,3 0,12 q -7,8 2,15 M 20,-222 q -8,4 1,13 q 7,7 -3,14" stroke="url(#${p}-fissure)" stroke-width="1.5" fill="none" opacity="0.85"/>
<path d="M -18,-216 l -4,6 M 20,-214 l 4,6 M -12,-240 l -4,5 M 10,-244 l 4,5 M -20,-206 l -4,4 M 22,-204 l 4,4" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.7"/>
<ellipse cx="-12" cy="-232" rx="2.6" ry="3.6" fill="url(#${p}-feu)" opacity="0.85"/>
<ellipse cx="16" cy="-226" rx="2.4" ry="3.2" fill="url(#${p}-feu)" opacity="0.8"/>
<path d="M -8,-220 Q -10,-212 -3,-209 L -3,-216 Q -6,-216 -8,-220 Z" fill="#0d0e13"/>
<path d="M -10,-200 Q -2,-192 14,-200 L 13,-194 Q 0,-188 -9,-194 Z" fill="#0d0e13"/>
<path d="M -9,-199 l 2,5 l 3,-4 l 3,4 l 3,-4 l 3,4 l 3,-4" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.65"/>
<path d="M -8,-197 q 6,4 18,1" stroke="url(#${p}-braise)" stroke-width="1.8" fill="none" opacity="0.65"/>
<path d="M -6,-191 q 5,3 12,0" stroke="#7a2410" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -10,-210 q 5,3 12,0 M -10,-228 q 6,3 14,0" stroke="#2a3326" stroke-width="1.5" fill="none" opacity="0.5"/>
<path d="M -18,-232 q -3,-5 -1,-10 M 20,-230 q 3,-5 1,-10" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.6"/>
<circle cx="-8" cy="-222" r="7" fill="url(#${p}-eye)"/>
<circle cx="-8" cy="-222" r="2.3" fill="#d6303e"/>
<circle cx="-8.8" cy="-222.8" r="0.9" fill="#e8868d"/>
<circle cx="10" cy="-220" r="7" fill="url(#${p}-eye)"/>
<circle cx="10" cy="-220" r="2.3" fill="#d6303e"/>
<circle cx="9.2" cy="-220.8" r="0.9" fill="#e8868d"/>
</g>

<path d="M -18,-206 q -9,-18 -3,-36 q 5,-12 -2,-24 M 20,-210 q 10,-16 4,-34 q -4,-12 3,-22 M 2,-252 q -5,-16 5,-28" stroke="url(#${p}-fumee)" stroke-width="3.2" fill="none" opacity="0.5"/>
<path d="M -40,-150 q -7,-13 0,-26 M 44,-142 q 7,-13 0,-26 M -66,-118 q -6,-10 0,-20 M 70,-120 q 6,-10 0,-20" stroke="url(#${p}-fumee)" stroke-width="2.4" fill="none" opacity="0.4"/>
</g>`;
}

function zNueeRats(p) {
  // Nuee de rats : VAGUE BASSE ET TRES LARGE deferlant au ras du sol vers le joueur.
  // Masse mouvante (rx~140), tres basse, 3 rangees de profondeur. Dos qui ondulent,
  // queues nues entremelees, multitude d'yeux rouges, coulures de sang.
  // Aucune balise <svg>. Un seul <g> racine, centre x=0, pose sur y=0.
  const corps = `#14151b`, corpsOmbre = `#0d0e13`, dosClair = `#1d1c24`;
  const os = `#8f8876`, osClair = `#b3ac96`, sang = `#7a1018`, sangVif = `#a31621`;

  // --- Fabriques internes (autonomes, tout en dur sauf ${p} pour les ids) ---

  // Oeil rouge luisant : halo + pupille + reflet.
  const eye = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${(r * 3).toFixed(1)}" fill="url(#${p}-eye)"/>` +
    `<circle cx="${x}" cy="${y}" r="${(r).toFixed(1)}" fill="#d6303e"/>` +
    `<circle cx="${(x - r * 0.4).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" r="${(r * 0.38).toFixed(1)}" fill="#e8868d"/>`;

  // Queue nue : longue courbe sinueuse, anneaux suggeres par segments, pointe fine.
  const queue = (x, y, dx, dy, w) => {
    const mx = x + dx * 0.5, my = y + dy * 0.2;
    const ex = x + dx, ey = y + dy;
    return `<path d="M ${x},${y} Q ${(mx).toFixed(0)},${(y + dy - 8).toFixed(0)} ${(mx).toFixed(0)},${(my).toFixed(0)} T ${(ex).toFixed(0)},${(ey).toFixed(0)}" stroke="#0d0e13" stroke-width="${(w + 1).toFixed(1)}" fill="none" stroke-linecap="round" opacity="0.9"/>` +
      `<path d="M ${x},${y} Q ${(mx).toFixed(0)},${(y + dy - 8).toFixed(0)} ${(mx).toFixed(0)},${(my).toFixed(0)} T ${(ex).toFixed(0)},${(ey).toFixed(0)}" stroke="#3a2620" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round" opacity="0.55"/>` +
      `<path d="M ${(x + dx * 0.18).toFixed(0)},${(y + dy * 0.06 - 3).toFixed(0)} l 3,1 M ${(x + dx * 0.42).toFixed(0)},${(y + dy * 0.16 - 2).toFixed(0)} l 2,1 M ${(x + dx * 0.66).toFixed(0)},${(y + dy * 0.5).toFixed(0)} l 2,1" stroke="#0d0e13" stroke-width="0.8" opacity="0.6"/>`;
  };

  // Un rat. s=echelle, f=flip (1/-1) pour orienter le museau, eyeR=rayon oeil,
  // op=opacite (profondeur), v=variante de decomposition (0..3).
  const rat = (x, y, s, f, eyeR, op, v) => {
    const ex1 = x + f * 17 * s, ey = y - 7 * s;       // oeil avant
    const ex2 = x + f * 11 * s, ey2 = y - 10 * s;     // oeil arriere
    // detail de decomposition selon variante
    let rot = ``;
    if (v === 1) {
      // cotes exposees sur le flanc
      rot =
        `<path d="M -14,-12 Q -8,-2 -10,5 M -8,-14 Q -2,-3 -4,5 M -2,-15 Q 4,-4 2,5 M 4,-14 Q 9,-4 8,4" stroke="${os}" stroke-width="1.4" fill="none" opacity="0.75"/>` +
        `<path d="M -16,-10 Q -10,-12 -2,-12 Q 6,-12 12,-9 L 12,-4 Q 0,-7 -14,-5 Z" fill="${corpsOmbre}" opacity="0.55"/>` +
        `<path d="M -14,-12 Q -8,-2 -10,5 M -2,-15 Q 4,-4 2,5" stroke="${osClair}" stroke-width="0.7" fill="none" opacity="0.6"/>`;
    } else if (v === 2) {
      // plaie ouverte rouge + coulure
      rot =
        `<path d="M -4,-15 Q 6,-16 12,-10 Q 8,-6 -2,-7 Q -6,-11 -4,-15 Z" fill="${sang}" opacity="0.9"/>` +
        `<path d="M -2,-13 Q 5,-13 9,-10 Q 5,-9 -1,-9 Z" fill="${sangVif}" opacity="0.8"/>` +
        `<path d="M 4,-7 q 1,8 -1,14" stroke="${sangVif}" stroke-width="1.6" fill="none" opacity="0.7"/>`;
    } else if (v === 3) {
      // dos pele/galeux : touffes manquantes + tache de pourriture
      rot =
        `<path d="M -16,-12 Q -8,-18 4,-15 Q -2,-10 -10,-9 Z" fill="#2a3326" opacity="0.5"/>` +
        `<path d="M -12,-14 l 1,-3 M -8,-15 l 1,-3 M -4,-16 l 1,-3 M 0,-15 l 1,-3" stroke="${corpsOmbre}" stroke-width="0.8" opacity="0.6"/>`;
    }
    return `<g transform="translate(${x},${y}) scale(${(f * s).toFixed(3)},${s})" opacity="${op}">` +
      // ombre propre au rat
      `<ellipse cx="2" cy="4" rx="24" ry="5" fill="#000" opacity="0.4"/>` +
      // corps gras, dos arque (gradient radial pour le volume)
      `<path d="M -26,-2 Q -29,-17 -11,-20 Q 5,-23 17,-17 Q 28,-13 30,-3 Q 28,4 15,5 L -17,5 Q -26,4 -26,-2 Z" fill="url(#${p}-corps)"/>` +
      // hanche/croupe plus volumineuse (deuxieme bosse)
      `<path d="M -26,-3 Q -30,-13 -20,-16 Q -10,-17 -8,-8 Q -10,2 -22,4 Q -28,2 -26,-3 Z" fill="url(#${p}-corps)" opacity="0.92"/>` +
      // arete du dos plus claire (lumiere haut-gauche)
      `<path d="M -20,-14 Q -2,-22 20,-14" stroke="${dosClair}" stroke-width="2.2" fill="none" opacity="0.65"/>` +
      `<path d="M -18,-12 Q -2,-19 17,-12" stroke="#26242d" stroke-width="1" fill="none" opacity="0.5"/>` +
      // fourrure rapeuse (petits poils sur le dos)
      `<path d="M -14,-16 l 1,-3 M -8,-18 l 1,-3 M -2,-19 l 1,-3 M 5,-18 l 1,-3 M 11,-16 l 1,-2" stroke="${corpsOmbre}" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>` +
      // ombre interne sous le ventre
      `<path d="M -20,4 Q 0,7 16,4" stroke="${corpsOmbre}" stroke-width="3.2" fill="none" opacity="0.85"/>` +
      // detail de decomposition
      rot +
      // cou/transition vers le museau
      `<path d="M 18,-12 Q 26,-12 30,-6 Q 27,0 19,0 Z" fill="url(#${p}-corps)"/>` +
      // museau pointu vers l'avant
      `<path d="M 26,-8 Q 39,-7 43,-1 Q 39,4 28,3 Q 23,-3 26,-8 Z" fill="${corps}"/>` +
      `<path d="M 28,-6 Q 37,-6 41,-1" stroke="${dosClair}" stroke-width="0.9" fill="none" opacity="0.55"/>` +
      // truffe
      `<circle cx="42" cy="-1" r="1.8" fill="#0d0e13"/>` +
      `<circle cx="41.4" cy="-1.6" r="0.6" fill="#3a2c2c"/>` +
      // moustaches
      `<path d="M 40,-2 l 9,-3 M 40,0 l 10,0 M 40,1 l 9,3" stroke="#5a564c" stroke-width="0.5" opacity="0.5"/>` +
      // incisives jaunatres (os expose)
      `<path d="M 36,2 l 2,5 l 1,-5 Z" fill="${osClair}" opacity="0.85"/>` +
      `<path d="M 39,2 l 1,4 l 1,-4 Z" fill="${os}" opacity="0.75"/>` +
      // oreille ronde (cartilage interne)
      `<path d="M 11,-22 Q 18,-26 20,-19 Q 18,-13 12,-15 Q 9,-19 11,-22 Z" fill="${corpsOmbre}"/>` +
      `<path d="M 13,-21 Q 17,-23 18,-19 Q 16,-16 13,-17 Z" fill="#231f28" opacity="0.8"/>` +
      // pattes avant griffues
      `<path d="M 20,5 l 1,7 M 23,5 l 0,7 M 26,5 l 1,7" stroke="${corpsOmbre}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M 21,12 l 1,1 M 23,12 l 0,1 M 27,12 l 1,1" stroke="${os}" stroke-width="0.7" stroke-linecap="round" opacity="0.6"/>` +
      // pattes arriere
      `<path d="M -10,5 l -1,6 M -5,5 l 0,7 M 0,5 l 1,6" stroke="${corpsOmbre}" stroke-width="1.6" stroke-linecap="round"/>` +
      // yeux rouges
      eye(ex1, ey, eyeR) + eye(ex2, ey2, eyeR) +
      `</g>`;
  };

  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-corps" cx="0.4" cy="0.26" r="0.9"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.5" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-masse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-masse2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-lueur" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#a31621" stop-opacity="0.22"/><stop offset="1" stop-color="#a31621" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9421e" stop-opacity="0.16"/><stop offset="1" stop-color="#c9421e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="145" ry="9" fill="#000" opacity="0.55"/>
<ellipse cx="0" cy="6" rx="120" ry="6" fill="#000" opacity="0.35"/>
<ellipse cx="0" cy="-30" rx="130" ry="50" fill="url(#${p}-lueur)"/>
<ellipse cx="-40" cy="-20" rx="70" ry="34" fill="url(#${p}-braise)" opacity="0.5"/>
<ellipse cx="55" cy="-18" rx="64" ry="30" fill="url(#${p}-braise)" opacity="0.45"/>

<!-- Masse mouvante de fond : silhouette basse, large, dos qui ondulent (couche brumeuse lointaine) -->
<path d="M -144,4 Q -136,-34 -114,-29 Q -100,-44 -80,-35 Q -64,-50 -42,-39 Q -24,-54 -2,-41 Q 16,-55 38,-42 Q 56,-53 74,-40 Q 92,-51 110,-36 Q 126,-45 140,-28 Q 148,-16 144,4 Z" fill="url(#${p}-masse)"/>
<!-- deuxieme couche de dos, legerement plus avant -->
<path d="M -140,6 Q -124,-22 -104,-18 Q -88,-30 -68,-22 Q -50,-34 -28,-24 Q -8,-36 14,-25 Q 34,-36 54,-25 Q 72,-34 92,-23 Q 110,-31 126,-18 Q 138,-10 138,6 Z" fill="url(#${p}-masse2)" opacity="0.96"/>
<!-- aretes dorsales claires sur les dos de fond -->
<path d="M -124,-24 Q -112,-37 -96,-30 M -76,-32 Q -60,-46 -42,-35 M -18,-37 Q 2,-50 24,-37 M 46,-37 Q 64,-48 82,-35 M 102,-32 Q 116,-41 130,-26" stroke="${dosClair}" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -116,-18 Q -100,-28 -82,-21 M -56,-22 Q -38,-32 -18,-22 M 8,-24 Q 28,-34 48,-22 M 74,-22 Q 92,-30 110,-19" stroke="#26242d" stroke-width="1.4" fill="none" opacity="0.45"/>

<!-- Queues nues entremelees qui sortent de la masse au ras du sol -->
${queue(-132, -2, 42, 7, 2.4)}
${queue(-90, 0, -34, 6, 2.2)}
${queue(-48, 2, 40, 5, 2.6)}
${queue(-4, 0, 36, 6, 2.4)}
${queue(34, 2, -40, 5, 2.2)}
${queue(78, 0, 38, 7, 2.4)}
${queue(118, 1, 26, 5, 2)}
${queue(14, 3, 28, 4, 1.8)}
${queue(-110, 3, 24, 4, 1.8)}

<!-- Coulures de sang seche au ras du sol -->
<path d="M -70,5 q 20,-3 44,-1 l -4,6 q -22,-2 -42,1 Z" fill="${sang}" opacity="0.4"/>
<path d="M -68,7 q 18,-2 38,-1" stroke="${sangVif}" stroke-width="1.4" fill="none" opacity="0.35"/>
<path d="M 36,6 q 16,-2 34,0 l -3,5 q -18,-1 -32,1 Z" fill="${sang}" opacity="0.35"/>
<path d="M -10,8 q 10,-2 22,0 l -2,4 q -12,-1 -20,1 Z" fill="${sangVif}" opacity="0.28"/>

<!-- RANGEE DE FOND (rats lointains, petits, sombres, museaux vers l'avant) -->
${rat(-116, -24, 0.66, 1, 1.3, 0.8, 0)}
${rat(-76, -27, 0.7, 1, 1.4, 0.84, 3)}
${rat(-34, -28, 0.72, 1, 1.4, 0.86, 0)}
${rat(8, -28, 0.72, -1, 1.4, 0.86, 0)}
${rat(50, -27, 0.7, 1, 1.4, 0.84, 1)}
${rat(92, -25, 0.68, -1, 1.3, 0.82, 0)}
${rat(124, -23, 0.64, 1, 1.3, 0.8, 0)}

<!-- RANGEE MEDIANE -->
${rat(-126, -11, 0.88, 1, 1.7, 0.94, 0)}
${rat(-84, -13, 0.94, 1, 1.85, 0.95, 2)}
${rat(-40, -14, 0.98, 1, 1.95, 0.96, 0)}
${rat(4, -15, 1, 1, 2, 0.97, 1)}
${rat(46, -14, 0.97, -1, 1.9, 0.96, 0)}
${rat(90, -12, 0.92, -1, 1.85, 0.95, 3)}
${rat(128, -10, 0.86, -1, 1.7, 0.93, 0)}

<!-- PREMIER PLAN : les plus gros, museaux tournes vers le joueur (vers le bas/avant) -->
${rat(-104, 1, 1.16, 1, 2.3, 1, 1)}
${rat(-58, 2, 1.24, 1, 2.5, 1, 0)}
${rat(-12, 3, 1.34, 1, 2.7, 1, 2)}
${rat(36, 2, 1.28, -1, 2.5, 1, 3)}
${rat(82, 1, 1.22, -1, 2.4, 1, 0)}
${rat(120, 0, 1.14, -1, 2.3, 1, 1)}

<!-- Yeux rouges supplementaires noyes dans la masse de fond (profondeur, multitude) -->
${eye(-96, -32, 1.2)}${eye(-58, -34, 1.3)}${eye(-22, -37, 1.2)}${eye(20, -36, 1.3)}${eye(62, -34, 1.2)}${eye(104, -31, 1.2)}${eye(-118, -28, 1.1)}${eye(132, -27, 1.1)}${eye(0, -40, 1.1)}${eye(-40, -40, 1)}${eye(44, -41, 1)}
</g>`;
}

function zTraqueur(p) {
  return `<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.3" r="0.85"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-croupe" cx="0.55" cy="0.32" r="0.9"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.38" cy="0.3" r="0.88"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-avbras" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-cuisse" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<radialGradient id="${p}-ventre" cx="0.5" cy="0.4" r="0.72"><stop offset="0" stop-color="#14151b"/><stop offset="0.7" stop-color="#101117"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.65"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
</defs>
<g transform="translate(150,346)">
<ellipse cx="0" cy="2" rx="122" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-90" cy="0" rx="22" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="96" cy="-1" rx="24" ry="6" fill="#000" opacity="0.42"/>
<ellipse cx="38" cy="-2" rx="18" ry="5" fill="#000" opacity="0.34"/>
<path d="M 34,-120 Q 62,-112 70,-78 Q 74,-50 58,-26 L 40,-22 Q 52,-50 44,-76 Q 38,-100 22,-112 Z" fill="url(#${p}-cuisse)"/>
<path d="M 36,-114 Q 56,-104 64,-78 Q 67,-58 56,-36" stroke="#1d1c24" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 50,-66 q 5,16 1,32" stroke="#0d0e13" stroke-width="3" fill="none" opacity="0.7"/>
<path d="M 40,-90 q 4,-2 9,0" stroke="#8f8876" stroke-width="1.3" fill="none" opacity="0.4"/>
<path d="M 58,-30 Q 70,-18 90,-10 Q 106,-4 116,-3 L 114,5 L 92,1 Q 64,-6 46,-22 Z" fill="#101117"/>
<path d="M 56,-26 Q 70,-16 88,-9" stroke="#1d1c24" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 114,-2 l 12,0 M 108,2 l 13,2 M 100,4 l 12,4 M 92,5 l 11,6 M 86,5 l 9,7" stroke="#8f8876" stroke-width="2.3" stroke-linecap="round"/>
<path d="M 124,-2 l 4,-2 M 121,4 l 5,0 M 112,8 l 4,2 M 103,11 l 4,2" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round"/>
<path d="M -30,-124 Q -58,-114 -66,-80 Q -70,-52 -54,-28 L -36,-24 Q -48,-52 -40,-78 Q -34,-102 -18,-114 Z" fill="url(#${p}-cuisse)"/>
<path d="M -32,-118 Q -52,-106 -60,-80 Q -63,-58 -52,-38" stroke="#1d1c24" stroke-width="2" fill="none" opacity="0.45"/>
<path d="M -52,-66 q -5,15 -1,30" stroke="#0d0e13" stroke-width="2.8" fill="none" opacity="0.65"/>
<path d="M -42,-96 q 3,12 -1,24" stroke="#a31621" stroke-width="2" fill="none" opacity="0.4"/>
<path d="M -54,-32 Q -66,-20 -86,-12 Q -100,-6 -112,-4 L -110,4 Q -90,-1 -68,-11 Q -52,-18 -44,-26 Z" fill="#0d0e13"/>
<path d="M -56,-28 Q -70,-18 -86,-11" stroke="#17161c" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -110,-3 l -12,1 M -104,2 l -13,3 M -96,5 l -11,5 M -88,6 l -10,6 M -82,6 l -8,7" stroke="#8f8876" stroke-width="2.3" stroke-linecap="round"/>
<path d="M -120,-1 l -4,-2 M -117,5 l -5,0 M -107,10 l -4,2 M -98,12 l -4,3" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round"/>
<path d="M 30,-106 Q 74,-122 110,-142 Q 128,-154 138,-172" stroke="#101117" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M 32,-104 Q 72,-119 104,-138" stroke="#1d1c24" stroke-width="2.4" fill="none" opacity="0.5"/>
<path d="M 138,-172 l 7,-11 M 138,-172 l 12,-2 M 138,-172 l 2,12 M 138,-172 l -8,-8" stroke="#0d0e13" stroke-width="3" stroke-linecap="round"/>
<path d="M 145,-183 l 3,-4 M 150,-174 l 5,1 M 140,-160 l 1,5" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
<path d="M -10,-152 Q 38,-152 50,-118 Q 54,-98 32,-90 Q 0,-84 -24,-92 Q -38,-104 -30,-132 Z" fill="url(#${p}-torse)"/>
<path d="M -30,-132 Q -38,-190 -8,-222 Q 26,-250 48,-232 Q 56,-222 50,-210 Q 30,-224 6,-210 Q -18,-196 -16,-160 Q -16,-142 -8,-128 Z" fill="url(#${p}-torse)"/>
<path d="M -26,-140 q -8,42 4,80" stroke="#0d0e13" stroke-width="3.2" fill="none" opacity="0.6"/>
<path d="M -28,-148 l -8,3 M -25,-162 l -9,2 M -22,-178 l -9,1 M -16,-194 l -9,-1 M -6,-208 l -8,-4 M 8,-218 l -7,-6 M 22,-224 l -5,-8 M 34,-226 l -3,-8" stroke="#8f8876" stroke-width="2.5" stroke-linecap="round" opacity="0.88"/>
<path d="M -29,-146 l -6,2 M -23,-176 l -6,1 M -13,-196 l -6,-2 M 1,-210 l -5,-4" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
<path d="M -8,-218 Q 8,-228 24,-224 Q 30,-218 26,-210 Q 12,-218 -2,-212 Q -10,-216 -8,-218 Z" fill="#1d1c24" opacity="0.7"/>
<path d="M -16,-162 Q 22,-180 44,-156 Q 54,-140 42,-120 Q 18,-100 -8,-112 Q -20,-128 -16,-162 Z" fill="url(#${p}-ventre)"/>
<path d="M 6,-162 q 16,5 26,-2 M 2,-150 q 18,6 30,-1 M 0,-138 q 18,6 28,-1 M 0,-126 q 16,5 24,-1" stroke="#0d0e13" stroke-width="2.3" fill="none" opacity="0.78"/>
<path d="M 8,-160 q 14,4 22,-2 M 4,-148 q 15,5 25,-1" stroke="#17161c" stroke-width="1.2" fill="none" opacity="0.5"/>
<path d="M 38,-152 q 9,-3 13,2 M 40,-140 q 9,-2 13,3 M 38,-128 q 8,-1 12,4 M 34,-116 q 8,0 11,5" stroke="#8f8876" stroke-width="1.7" fill="none" opacity="0.58"/>
<path d="M -4,-142 Q -14,-134 -7,-122 Q 3,-114 9,-126 Q 7,-138 -4,-142 Z" fill="#0d0e13"/>
<path d="M -2,-140 Q -10,-133 -5,-124 Q 3,-118 7,-126 Q 5,-136 -2,-140 Z" fill="#a31621" opacity="0.4"/>
<path d="M -1,-135 l 6,2 l 3,-4 M 0,-128 l 6,1" stroke="#b3ac96" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -5,-122 q 3,11 0,20" stroke="#a31621" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 2,-118 q 2,8 -2,16" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M -22,-104 q 6,8 18,9" stroke="#0d0e13" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -16,-202 Q -44,-204 -60,-186 Q -70,-172 -58,-158 Q -36,-150 -20,-162 Q -10,-178 -16,-202 Z" fill="url(#${p}-torse)"/>
<path d="M -20,-196 Q -44,-198 -58,-182 Q -66,-170 -56,-160" stroke="#1d1c24" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -52,-184 q -8,12 -2,24" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.6"/>
<path d="M -34,-188 q -6,10 -2,22" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -48,-178 Q -82,-156 -100,-108 Q -110,-70 -114,-28 L -100,-24 Q -92,-70 -80,-104 Q -64,-150 -38,-168 Z" fill="url(#${p}-bras)"/>
<path d="M -46,-172 Q -78,-150 -94,-106 Q -103,-72 -106,-34" stroke="#1d1c24" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M -104,-92 q -6,32 -8,62" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.62"/>
<path d="M -88,-114 q 3,-2 6,-1 M -78,-138 q 3,-2 6,0" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
<path d="M -70,-150 q 4,10 -1,20" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.4"/>
<path d="M -114,-28 Q -118,-14 -116,-2 L -102,0 Q -102,-14 -100,-24 Z" fill="url(#${p}-avbras)"/>
<path d="M -110,-18 q -2,8 0,16" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -107,-22 l 6,-1 l 1,5 l -6,2 Z" fill="url(#${p}-os)" opacity="0.6"/>
<path d="M -116,-2 L -142,4 M -114,1 L -140,11 M -110,4 L -134,16 M -104,5 L -126,18 M -100,5 L -114,18" stroke="#0d0e13" stroke-width="3.6" stroke-linecap="round"/>
<path d="M -116,-2 L -138,3 M -110,4 L -130,14 M -104,5 L -122,16" stroke="#17161c" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>
<path d="M -142,4 l -8,-2 M -140,11 l -9,0 M -134,16 l -8,3 M -126,18 l -7,4 M -114,18 l -6,4" stroke="#8f8876" stroke-width="2.1" stroke-linecap="round"/>
<path d="M -150,2 l -3,-3 M -149,11 l -4,2 M -142,19 l -3,3" stroke="#b3ac96" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -20,-190 Q 18,-174 50,-128 Q 66,-98 80,-56 L 66,-50 Q 52,-92 36,-122 Q 12,-162 -24,-180 Z" fill="url(#${p}-bras)"/>
<path d="M -18,-184 Q 16,-168 46,-126 Q 60,-100 72,-62" stroke="#1d1c24" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 52,-120 q 13,32 24,64" stroke="#0d0e13" stroke-width="2.6" fill="none" opacity="0.55"/>
<path d="M 26,-156 q 4,-3 8,-2 M 40,-128 q 4,-2 7,0" stroke="#8f8876" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>
<path d="M 0,-160 q 8,6 -2,14" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.4"/>
<path d="M 80,-56 Q 86,-38 88,-20 L 74,-18 Q 72,-36 66,-50 Z" fill="url(#${p}-avbras)"/>
<path d="M 82,-46 q 3,12 2,24" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M 78,-40 l 6,-1 l 1,5 l -6,1 Z" fill="url(#${p}-os)" opacity="0.55"/>
<path d="M 88,-20 L 110,-12 M 86,-18 L 110,-6 M 82,-16 L 104,0 M 78,-16 L 96,2 M 74,-16 L 86,2" stroke="#0d0e13" stroke-width="3.6" stroke-linecap="round"/>
<path d="M 88,-20 L 108,-13 M 82,-16 L 102,-1 M 76,-16 L 90,1" stroke="#17161c" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>
<path d="M 110,-12 l 8,-2 M 110,-6 l 8,1 M 104,0 l 7,3 M 96,2 l 6,4 M 86,2 l 5,5" stroke="#8f8876" stroke-width="2.1" stroke-linecap="round"/>
<path d="M 118,-14 l 4,-3 M 118,-5 l 4,2 M 111,3 l 3,3" stroke="#b3ac96" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -42,-200 Q -58,-210 -78,-206 Q -90,-202 -88,-192 Q -80,-184 -64,-188 Q -48,-194 -42,-200 Z" fill="url(#${p}-croupe)"/>
<path d="M -60,-202 q 8,4 16,2 M -62,-194 q 8,3 15,1" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -80,-198 q -3,5 0,10" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.5"/>
<g transform="rotate(-8 -96 -208)">
<path d="M -74,-190 Q -100,-202 -118,-196 Q -132,-190 -128,-178 Q -120,-172 -110,-174 L -112,-182 Q -96,-186 -74,-184 Z" fill="url(#${p}-crane)"/>
<path d="M -78,-206 Q -102,-216 -122,-208 Q -136,-200 -130,-186 Q -118,-174 -100,-180 Q -80,-190 -78,-206 Z" fill="url(#${p}-crane)"/>
<path d="M -82,-204 Q -104,-212 -120,-206" stroke="#1d1c24" stroke-width="1.8" fill="none" opacity="0.5"/>
<path d="M -110,-186 Q -98,-196 -82,-198" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -128,-186 Q -136,-182 -132,-174 L -110,-174 Q -119,-180 -128,-186 Z" fill="#0d0e13"/>
<path d="M -126,-180 l -2,6 l 3,-4 Z M -120,-178 l -1,6 l 3,-4 Z M -114,-176 l -1,5 l 2,-4 Z M -109,-175 l -1,5 l 2,-4 Z" fill="#b3ac96"/>
<path d="M -126,-172 l -2,5 l 3,-3 Z M -119,-171 l -1,5 l 2,-3 Z M -113,-170 l -1,4 l 2,-3 Z" fill="#8f8876"/>
<path d="M -122,-190 q 6,3 14,2" stroke="#0d0e13" stroke-width="1.6" fill="none" opacity="0.8"/>
<path d="M -84,-210 L -74,-226 L -68,-206 Z" fill="#101117"/>
<path d="M -102,-212 L -94,-226 L -88,-208 Z" fill="#14151b"/>
<path d="M -84,-222 l 4,-7 M -98,-222 l 3,-7" stroke="#0d0e13" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
<path d="M -110,-202 q 10,-4 20,-1" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -92,-200 l 6,3 l -2,4" stroke="#b3ac96" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -120,-182 q -2,6 0,11" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -106,-196 q 8,4 16,1" stroke="#17161c" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -108,-178 Q -98,-172 -86,-176 Q -94,-168 -106,-170 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -104,-176 l 3,4 l 3,-3 l 3,4 l 3,-3" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.8"/>
<circle cx="-107" cy="-194" r="7" fill="url(#${p}-eye)"/>
<circle cx="-107" cy="-194" r="2.3" fill="#d6303e"/>
<circle cx="-107.8" cy="-194.8" r="0.9" fill="#e8868d"/>
<circle cx="-93" cy="-192" r="7" fill="url(#${p}-eye)"/>
<circle cx="-93" cy="-192" r="2.3" fill="#d6303e"/>
<circle cx="-93.8" cy="-192.8" r="0.9" fill="#e8868d"/>
</g>
<path d="M -118,-170 q -4,18 -2,40 q 1,8 4,7 q 3,-4 1,-14 q 1,-18 -1,-32 Z" fill="#a31621" opacity="0.5"/>
<path d="M -116,-158 q -2,12 -1,24" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.6"/>
<ellipse cx="-120" cy="-2" rx="14" ry="3" fill="#a31621" opacity="0.4"/>
<ellipse cx="40" cy="-2" rx="10" ry="2.5" fill="#7a1018" opacity="0.35"/>
</g>`;
}

function zEcolier(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-milk" cx="0.4" cy="0.38" r="0.62"><stop offset="0" stop-color="#cfc9b8"/><stop offset="0.6" stop-color="#9a9484"/><stop offset="1" stop-color="#5e5b4f"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.32" r="0.8"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#161318"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-peau" cx="0.4" cy="0.34" r="0.78"><stop offset="0" stop-color="#23222a"/><stop offset="0.6" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-blazer" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#363f49"/><stop offset="0.55" stop-color="#2a313a"/><stop offset="1" stop-color="#1c2129"/></linearGradient>
<linearGradient id="${p}-blazerD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e353e"/><stop offset="1" stop-color="#1a1f26"/></linearGradient>
<linearGradient id="${p}-chemise" x1="0.2" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#b3ac96"/><stop offset="0.55" stop-color="#928c79"/><stop offset="1" stop-color="#6f6a5a"/></linearGradient>
<linearGradient id="${p}-short" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#525d67"/><stop offset="0.55" stop-color="#3b434c"/><stop offset="1" stop-color="#252a31"/></linearGradient>
<linearGradient id="${p}-jambe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0e13"/><stop offset="0.55" stop-color="#1a1920"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-bras" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#363f49"/><stop offset="0.55" stop-color="#2a313a"/><stop offset="1" stop-color="#181d23"/></linearGradient>
<linearGradient id="${p}-avbras" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#aaa490"/><stop offset="0.55" stop-color="#8a846f"/><stop offset="1" stop-color="#5e5a4c"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#a31621"/><stop offset="0.55" stop-color="#7a1018"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<linearGradient id="${p}-cheveux" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#8f8154"/><stop offset="0.55" stop-color="#6b6040"/><stop offset="1" stop-color="#3f3925"/></linearGradient>
<linearGradient id="${p}-basket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c333b"/><stop offset="0.7" stop-color="#1b2026"/><stop offset="1" stop-color="#10141a"/></linearGradient>
</defs>
<ellipse cx="0" cy="2" rx="58" ry="10" fill="#000" opacity="0.5"/>
<ellipse cx="22" cy="3" rx="20" ry="5" fill="#000" opacity="0.4"/>
<path d="M -10,-78 L -28,-50 L -34,-18 L -28,-6 L -14,-6 L -16,-22 L -8,-48 L 2,-74 Z" fill="url(#${p}-jambe)"/>
<path d="M -22,-32 q -3,10 -1,18" stroke="#0a0b0f" stroke-width="2.2" fill="none" opacity="0.7"/>
<path d="M -16,-22 q -2,7 -8,11" stroke="#0a0b0f" stroke-width="2" fill="none" opacity="0.5"/>
<path d="M 8,-80 L 26,-52 L 34,-18 L 30,-6 L 16,-6 L 14,-22 L 6,-50 L -2,-76 Z" fill="url(#${p}-jambe)"/>
<path d="M 22,-34 q 4,11 2,20" stroke="#0a0b0f" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M 18,-50 q -1,9 2,16" stroke="#1d1c24" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M -34,-18 q -10,4 -16,2 l -1,9 q 14,6 26,1 Z" fill="url(#${p}-basket)"/>
<path d="M -50,-16 q -6,3 -7,9 l 26,3 l 1,-9 Z" fill="url(#${p}-basket)"/>
<path d="M -57,-7 q 0,5 4,6 l 24,0 l 1,-7 Z" fill="#0d1116"/>
<path d="M -55,-2 l 28,0 l 0,2 l -28,0 Z" fill="#cfc9b8" opacity="0.7"/>
<path d="M -46,-13 l 8,3 M -42,-10 l 7,3 M -38,-7 l 6,3" stroke="#b3ac96" stroke-width="1.1" opacity="0.6" stroke-linecap="round"/>
<path d="M -36,-14 l -3,8 M -30,-15 l -2,9" stroke="#0a0b0f" stroke-width="1.2" opacity="0.6"/>
<path d="M 34,-18 q 11,4 18,3 l 1,9 q -15,6 -28,1 Z" fill="url(#${p}-basket)"/>
<path d="M 52,-15 q 7,3 8,9 l -29,3 l -1,-9 Z" fill="url(#${p}-basket)"/>
<path d="M 60,-6 q 0,5 -5,6 l -26,0 l -1,-7 Z" fill="#0d1116"/>
<path d="M 55,-1 l -30,0 l 0,2 l 30,0 Z" fill="#cfc9b8" opacity="0.7"/>
<path d="M 36,-14 l 9,3 M 41,-11 l 8,3 M 46,-8 l 7,3" stroke="#b3ac96" stroke-width="1.1" opacity="0.6" stroke-linecap="round"/>
<path d="M 38,-15 l -3,9 M 44,-15 l -2,9" stroke="#0a0b0f" stroke-width="1.2" opacity="0.6"/>
<path d="M -30,-78 Q -38,-100 -22,-112 L 24,-114 Q 40,-100 32,-78 L 26,-66 Q 0,-74 -24,-66 Z" fill="url(#${p}-short)"/>
<path d="M -1,-112 L 1,-70" stroke="#1a1f26" stroke-width="3" opacity="0.7"/>
<path d="M -24,-108 q -2,18 0,34 M 22,-108 q 2,16 0,32" stroke="#202730" stroke-width="2" opacity="0.5" fill="none"/>
<path d="M -30,-80 l -6,12 l 10,-2 l -2,10 l 9,-3" stroke="#202730" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
<path d="M 32,-78 l 7,11 l -10,-1 l 3,10 l -9,-2" stroke="#202730" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
<path d="M -28,-74 q 10,6 0,14 q -10,-2 -10,-10 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 26,-72 q 8,7 -2,14 q -9,-3 -8,-11 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -22,-86 q 14,5 22,1" stroke="#202730" stroke-width="2" opacity="0.55" fill="none"/>
<path d="M -16,-72 Q -18,-58 -22,-46 q 8,3 14,-1 Q -6,-58 -6,-72 Z" fill="url(#${p}-sang)" opacity="0.65"/>
<path d="M -16,-66 q -3,12 -6,20" stroke="#a31621" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
<path d="M 12,-70 Q 14,-58 18,-48 q -6,2 -11,-1 Q 6,-58 6,-70 Z" fill="url(#${p}-os)" opacity="0.8"/>
<path d="M 8,-66 q 4,10 8,16" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/>
<path d="M 9,-60 q 3,6 8,9" stroke="#7a1018" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -28,-114 Q -40,-150 -24,-178 L 30,-180 Q 46,-150 34,-114 Q 18,-104 0,-106 Q -16,-104 -28,-114 Z" fill="url(#${p}-chemise)"/>
<path d="M -24,-118 Q -34,-150 -22,-174 L -14,-176 Q -24,-150 -16,-120 Z" fill="#7a7563" opacity="0.6"/>
<path d="M -10,-178 L -8,-112" stroke="#5e5a4c" stroke-width="2.2" opacity="0.6"/>
<path d="M -10,-170 l -6,3 l 0,4 l 6,-3 M -10,-156 l -6,3 l 0,4 l 6,-3 M -10,-142 l -6,3 l 0,4 l 6,-3 M -10,-128 l -6,3 l 0,4 l 6,-3" fill="#5e5a4c" opacity="0.7"/>
<circle cx="-8" cy="-164" r="1.4" fill="#3f3c33"/>
<circle cx="-8" cy="-148" r="1.4" fill="#3f3c33"/>
<circle cx="-8" cy="-132" r="1.4" fill="#3f3c33"/>
<path d="M -22,-118 L -28,-114 Q -40,-150 -24,-178 L -10,-178 Q -22,-150 -16,-122 Z" fill="url(#${p}-blazerD)"/>
<path d="M 8,-178 L 30,-180 Q 46,-150 34,-114 L 22,-112 Q 32,-150 18,-178 Z" fill="url(#${p}-blazer)"/>
<path d="M 8,-178 L 22,-112 L 14,-110 L 4,-176 Z" fill="url(#${p}-blazerD)"/>
<path d="M -24,-178 Q -8,-184 8,-178 L 0,-160 L -6,-176 Z" fill="url(#${p}-blazer)"/>
<path d="M -10,-178 L 0,-160 L -2,-150" stroke="#1a1f26" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 8,-178 L 0,-160 L 2,-150" stroke="#1a1f26" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -22,-176 L -28,-114 L -34,-116 L -29,-172 Z" fill="#1a1f26" opacity="0.8"/>
<path d="M 30,-180 L 34,-114 L 40,-118 L 36,-174 Z" fill="#202730" opacity="0.7"/>
<path d="M 24,-150 l 12,8 l -2,8 l -12,-7 Z" fill="#1a1f26"/>
<path d="M 26,-148 l 8,5" stroke="#0d0e13" stroke-width="1" opacity="0.6"/>
<path d="M -30,-140 l -7,9 l 7,3 l -3,10 l 6,2" stroke="#1a1f26" stroke-width="2.4" fill="none"/>
<path d="M -3,-160 L 7,-160 L 4,-118 L -1,-118 L -5,-148 Z" fill="#1d1418"/>
<path d="M -3,-160 L 7,-160 L 6,-152 L -4,-153 Z" fill="#3a2a2e"/>
<path d="M -4,-150 L 6,-149 L 5,-141 L -5,-142 Z" fill="#5e1118"/>
<path d="M -5,-140 L 5,-139 L 4,-131 L -5,-132 Z" fill="#1d1418"/>
<path d="M -5,-130 L 4,-129 L 3,-121 L -2,-119 L -4,-122 Z" fill="#5e1118"/>
<path d="M -1,-160 L 1,-118" stroke="#0d0e13" stroke-width="0.9" opacity="0.5"/>
<path d="M -3,-162 L 7,-162 L 2,-168 Z" fill="#1d1418"/>
<path d="M -2,-128 q 4,10 1,20 q -3,-2 -3,-8 Z" fill="#5e0e16" opacity="0.85"/>
<path d="M -22,-148 q 14,4 0,9 q -8,-2 -6,-7 Z" fill="url(#${p}-sang)"/>
<path d="M -20,-138 l 14,5 l -2,5 l -13,-5 Z" fill="#7a1018" opacity="0.8"/>
<path d="M -16,-130 q 10,3 18,-1" stroke="#a31621" stroke-width="2.4" fill="none" opacity="0.7" stroke-linecap="round"/>
<path d="M 10,-150 q 10,3 16,9 l -2,5 q -8,-6 -16,-8 Z" fill="url(#${p}-sang)" opacity="0.85"/>
<path d="M -8,-160 q 4,16 0,34" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.45" stroke-linecap="round"/>
<path d="M 6,-156 q 3,14 1,28" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.5" stroke-linecap="round"/>
<path d="M -18,-122 q 6,8 -2,16 q -6,-3 -4,-10 Z" fill="#5e0e16" opacity="0.6"/>
<ellipse cx="-22" cy="-172" rx="11" ry="9" fill="url(#${p}-blazer)"/>
<ellipse cx="28" cy="-174" rx="11" ry="9" fill="url(#${p}-blazer)"/>
<path d="M -24,-172 Q -44,-156 -54,-134 Q -60,-120 -58,-108" stroke="url(#${p}-bras)" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M -48,-140 q -8,-3 -14,2" stroke="#1a1f26" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M -52,-126 Q -56,-118 -58,-110" stroke="url(#${p}-avbras)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M -58,-110 l -7,7 q -2,4 2,5 l 6,-4 Z M -58,-110 l -2,11 q 2,4 6,1 l 0,-9 Z M -58,-110 l 4,9 q 4,1 5,-3 l -3,-7 Z M -58,-110 l 8,3 q 3,-2 1,-6 l -6,-1 Z" fill="url(#${p}-avbras)"/>
<path d="M -65,-104 l -3,2 M -60,-99 l -1,4 M -53,-100 l 1,3" stroke="#5e5a4c" stroke-width="1.3" opacity="0.7" stroke-linecap="round"/>
<path d="M -56,-122 q 3,8 -2,14" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M 30,-174 Q 52,-160 62,-138 Q 68,-124 66,-110" stroke="url(#${p}-bras)" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M 56,-144 q 8,-3 14,2" stroke="#1a1f26" stroke-width="2.4" fill="none" opacity="0.55"/>
<path d="M 60,-128 Q 64,-120 66,-112" stroke="url(#${p}-avbras)" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M 62,-148 l 8,-2 l 1,5 l -7,3 Z" fill="url(#${p}-os)"/>
<path d="M 64,-147 l 5,-1" stroke="#0d0e13" stroke-width="0.9" opacity="0.6"/>
<path d="M 66,-112 l 7,7 q 2,4 -2,5 l -6,-4 Z M 66,-112 l 2,11 q -2,4 -6,1 l 0,-9 Z M 66,-112 l -4,9 q -4,1 -5,-3 l 3,-7 Z M 66,-112 l -8,3 q -3,-2 -1,-6 l 6,-1 Z" fill="url(#${p}-avbras)"/>
<path d="M 73,-106 l 3,2 M 68,-101 l 1,4 M 61,-102 l -1,3" stroke="#5e5a4c" stroke-width="1.3" opacity="0.7" stroke-linecap="round"/>
<path d="M 58,-128 q -3,8 2,14" stroke="#7a1018" stroke-width="1.6" fill="none" opacity="0.65"/>
<path d="M 62,-124 q 4,6 1,12" stroke="#a31621" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -12,-178 L -16,-190 L 14,-192 L 16,-180 Z" fill="url(#${p}-peau)"/>
<path d="M -12,-184 q 12,4 24,-1" stroke="#0d0e13" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -10,-186 q 4,6 0,9 M 8,-187 q 5,5 0,9" stroke="#0d0e13" stroke-width="1.4" fill="none" opacity="0.6"/>
<g transform="rotate(11 0 -196)">
<path d="M -16,-192 Q -23,-220 -2,-228 Q 20,-224 19,-198 Q 18,-188 8,-184 L -6,-186 Q -15,-188 -16,-192 Z" fill="url(#${p}-crane)"/>
<path d="M -13,-196 Q -19,-216 -4,-223 L 0,-221 Q -13,-214 -9,-194 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -7,-186 Q -5,-180 4,-179 L 4,-185 Q -2,-185 -7,-187 Z" fill="#0d0e13"/>
<path d="M -6,-184 l 2,4 l 2,-3 l 2,3" stroke="#9a9484" stroke-width="1.1" fill="none" opacity="0.7"/>
<path d="M -7,-180 Q -10,-166 -3,-157 Q 6,-156 9,-165 Q 9,-174 4,-179 L -2,-180 Q -5,-180 -7,-180 Z" fill="url(#${p}-sang)"/>
<path d="M -6,-178 Q -8,-167 -2,-160 Q 4,-159 7,-166 Q 6,-172 2,-176 Z" fill="#3a0a10"/>
<path d="M -4,-176 l 2,3 l 2,-2 l 2,3 l 2,-2" stroke="#a31621" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M -7,-180 q 11,5 14,1" stroke="#7a1018" stroke-width="1.8" fill="none" opacity="0.85"/>
<path d="M -10,-159 q -2,8 2,14 q 3,-2 2,-8 Z" fill="#5e0e16" opacity="0.8"/>
<path d="M 6,-160 q 4,8 1,15 q -3,-2 -3,-9 Z" fill="#7a1018" opacity="0.8"/>
<path d="M -2,-157 q 1,9 -1,18" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.7" stroke-linecap="round"/>
<path d="M -9,-188 q -4,10 -2,20" stroke="#5e1118" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M 9,-186 q 3,9 1,18" stroke="#5e1118" stroke-width="1.3" fill="none" opacity="0.5"/>
<circle cx="-7" cy="-205" r="5.5" fill="url(#${p}-milk)"/>
<circle cx="-7" cy="-205" r="3.4" fill="#c4bdab"/>
<circle cx="-6.4" cy="-206" r="1" fill="#e7e2d2"/>
<path d="M -12,-205 q 5,-4 10,0" stroke="#0d0e13" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M -10,-200 q 3,3 7,1" stroke="#5e1118" stroke-width="1" fill="none" opacity="0.6"/>
<circle cx="8" cy="-203" r="5.5" fill="url(#${p}-milk)"/>
<circle cx="8" cy="-203" r="3.4" fill="#c4bdab"/>
<circle cx="8.6" cy="-204" r="1" fill="#e7e2d2"/>
<path d="M 3,-203 q 5,-4 10,0" stroke="#0d0e13" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M 4,-198 q 3,3 7,1" stroke="#5e1118" stroke-width="1" fill="none" opacity="0.55"/>
<path d="M -18,-200 Q -24,-228 -4,-238 Q 22,-236 22,-208 Q 22,-200 16,-196 Q 18,-208 8,-214 Q 14,-208 8,-204 Q 4,-214 -4,-212 Q 2,-206 -4,-202 Q -8,-212 -16,-208 Q -10,-202 -16,-198 Q -18,-200 -18,-200 Z" fill="url(#${p}-cheveux)"/>
<path d="M -18,-204 Q -22,-224 -6,-234 Q 0,-236 6,-234 Q -4,-230 -8,-220 Q -2,-226 4,-224 Q -4,-218 -6,-210 Q -12,-214 -16,-208 Z" fill="#3f3925" opacity="0.6"/>
<path d="M -14,-216 q 6,-8 14,-8 M -4,-224 q 8,-4 14,0 M 4,-220 q 8,-2 12,4 M -12,-210 q 6,-6 12,-4" stroke="#8f8154" stroke-width="1.4" fill="none" opacity="0.55" stroke-linecap="round"/>
<path d="M -18,-200 l -4,8 l 4,1 M 16,-196 l 4,7 l -4,2 M -2,-238 l -2,-6 l 4,1 M 12,-234 l 4,-5 l 1,4" stroke="#6b6040" stroke-width="1.6" fill="none" opacity="0.6" stroke-linecap="round"/>
<path d="M -16,-204 q -2,-12 6,-18" stroke="#2a2618" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M -2,-228 q 8,-2 12,4" stroke="#0d0e13" stroke-width="1.2" fill="none" opacity="0.4"/>
<path d="M 4,-216 q -4,8 -10,10" stroke="#5e1118" stroke-width="1.4" fill="none" opacity="0.45"/>
</g>
</g>`;
}

function zPolicier(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.38" cy="0.32" r="0.82"><stop offset="0" stop-color="#3a3a3e"/><stop offset="0.55" stop-color="#26262b"/><stop offset="1" stop-color="#131319"/></radialGradient>
<linearGradient id="${p}-shirt" x1="0.18" y1="0" x2="0.82" y2="1"><stop offset="0" stop-color="#8c7d5f"/><stop offset="0.5" stop-color="#6b5f47"/><stop offset="1" stop-color="#473f30"/></linearGradient>
<linearGradient id="${p}-shirtD" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#6e6149"/><stop offset="0.55" stop-color="#4f4634"/><stop offset="1" stop-color="#332d22"/></linearGradient>
<linearGradient id="${p}-pant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3a2a"/><stop offset="0.5" stop-color="#4a4a36"/><stop offset="1" stop-color="#2c2c20"/></linearGradient>
<linearGradient id="${p}-pantD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c2c20"/><stop offset="0.55" stop-color="#3e3e2c"/><stop offset="1" stop-color="#23231a"/></linearGradient>
<linearGradient id="${p}-skin" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#3d3d42"/><stop offset="0.55" stop-color="#2a2a2f"/><stop offset="1" stop-color="#181820"/></linearGradient>
<linearGradient id="${p}-belt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26241c"/><stop offset="0.5" stop-color="#19180f"/><stop offset="1" stop-color="#0c0b06"/></linearGradient>
<radialGradient id="${p}-brass" cx="0.4" cy="0.34" r="0.75"><stop offset="0" stop-color="#b39a4a"/><stop offset="0.55" stop-color="#8a7430"/><stop offset="1" stop-color="#54461c"/></radialGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-sang" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#7a1018"/><stop offset="0.6" stop-color="#5e0e16"/><stop offset="1" stop-color="#3a0a10"/></radialGradient>
</defs>
<ellipse cx="0" cy="2" rx="80" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-26" cy="3" rx="24" ry="6" fill="#000" opacity="0.4"/>
<ellipse cx="34" cy="3" rx="18" ry="5" fill="#000" opacity="0.38"/>
<path d="M -10,-116 L -40,-70 L -50,-20 L -34,-6 L -18,-8 L -24,-30 L -14,-68 L 4,-110 Z" fill="url(#${p}-pant)"/>
<path d="M -46,-44 q -5,16 -3,26 M -38,-58 q -4,12 -3,22" stroke="#23231a" stroke-width="2.6" fill="none" opacity="0.7"/>
<path d="M -40,-70 q 10,4 22,2" stroke="#23231a" stroke-width="2.2" fill="none" opacity="0.6"/>
<path d="M -50,-20 q -10,5 -20,3 l 1,9 q 14,2 26,-4 Z" fill="#1a1a12"/>
<path d="M -34,-6 q -14,3 -26,2 l 1,8 l 36,-1 Z" fill="#15150d"/>
<path d="M -67,-9 l 8,-2 l 1,6 l -8,2 Z" fill="#0a0a06"/>
<path d="M -44,-52 q 8,-14 14,-2 q -6,8 -14,2 Z" fill="#5e0e16" opacity="0.55"/>
<path d="M 4,-118 L 32,-72 L 44,-22 L 40,-6 L 18,-6 L 16,-28 L 6,-70 L -8,-110 Z" fill="url(#${p}-pantD)"/>
<path d="M 24,-56 q 7,18 5,34 M 16,-72 q 6,14 5,26" stroke="#1f1f16" stroke-width="2.4" fill="none" opacity="0.65"/>
<path d="M 32,-72 q -10,4 -22,2" stroke="#1f1f16" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M 40,-6 l 24,2 l -1,8 l -26,0 Z" fill="#15150d"/>
<path d="M 18,-6 l -10,2 l 0,7 l 14,-1 Z" fill="#1a1a12"/>
<path d="M 63,-9 l 8,-1 l 1,6 l -9,2 Z" fill="#0a0a06"/>
<path d="M 22,-66 l 14,9 l -4,10 l -14,-8 Z" fill="#1a1a12" opacity="0.8"/>
<path d="M 28,-40 q 6,-12 12,-1 q -5,7 -12,1 Z" fill="#5e0e16" opacity="0.45"/>
<path d="M -42,-118 L -46,-92 L 46,-92 L 42,-118 L 0,-126 Z" fill="url(#${p}-belt)"/>
<path d="M -46,-110 l 92,0 M -46,-98 l 92,0" stroke="#0c0b06" stroke-width="1.4" opacity="0.7"/>
<rect x="-14" y="-118" width="28" height="22" rx="3" fill="url(#${p}-brass)"/>
<rect x="-9" y="-113" width="18" height="12" rx="2" fill="#54461c"/>
<path d="M -12,-116 q 12,-3 24,1" stroke="#cdb45e" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -42,-114 q 14,5 14,22 l 22,0 q -2,-16 12,-22 Z" fill="#0c0b06" opacity="0.6"/>
<rect x="-44" y="-112" width="16" height="22" rx="3" fill="url(#${p}-belt)"/>
<path d="M -44,-104 l 16,0 M -44,-96 l 16,0" stroke="#0c0b06" stroke-width="1.2" opacity="0.7"/>
<rect x="28" y="-114" width="18" height="30" rx="4" fill="url(#${p}-belt)"/>
<path d="M 28,-110 q 9,-4 18,0" stroke="#0c0b06" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M 33,-114 l 2,-7 l 6,0 l 2,7 Z" fill="#0c0b06"/>
<ellipse cx="37" cy="-90" rx="6" ry="4" fill="#0a0a06"/>
<path d="M -34,-124 Q -50,-176 -30,-214 L 32,-216 Q 52,-176 38,-122 Q 24,-110 0,-112 Q -20,-110 -34,-124 Z" fill="url(#${p}-shirt)"/>
<path d="M -30,-130 Q -42,-174 -26,-208 L -14,-210 Q -28,-172 -18,-128 Z" fill="url(#${p}-shirtD)" opacity="0.85"/>
<path d="M 26,-210 Q 40,-172 30,-126 L 20,-124 Q 32,-170 18,-208 Z" fill="url(#${p}-shirtD)" opacity="0.6"/>
<path d="M -2,-208 L 2,-208 L 6,-128 L -6,-128 Z" fill="#473f30"/>
<path d="M -2,-206 l 0,76 M 2,-206 l 0,76" stroke="#332d22" stroke-width="1.2" opacity="0.7"/>
<circle cx="0" cy="-194" r="2" fill="#cdb45e" opacity="0.7"/>
<circle cx="0" cy="-176" r="2" fill="#9a8a55" opacity="0.6"/>
<circle cx="0" cy="-158" r="2" fill="#9a8a55" opacity="0.6"/>
<circle cx="0" cy="-140" r="2" fill="#8a7430" opacity="0.6"/>
<path d="M -30,-210 L -2,-204 L -10,-196 L -32,-200 Z" fill="url(#${p}-shirtD)"/>
<path d="M 30,-212 L 2,-204 L 10,-196 L 32,-202 Z" fill="url(#${p}-shirtD)"/>
<path d="M -30,-210 L -2,-204 M 30,-212 L 2,-204" stroke="#332d22" stroke-width="1.4" opacity="0.7"/>
<path d="M -30,-204 q -3,18 0,40 M -34,-188 q -2,20 2,42" stroke="#332d22" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 28,-204 q 4,18 2,40 M 33,-186 q 2,18 -1,40" stroke="#2c2722" stroke-width="1.4" fill="none" opacity="0.55"/>
<path d="M -22,-188 q 12,5 22,2 M -23,-176 q 13,5 23,2 M -24,-164 q 12,5 23,2" stroke="#473f30" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -34,-204 L -8,-208 L -10,-200 L -32,-196 Z" fill="url(#${p}-brass)"/>
<path d="M 34,-206 L 8,-208 L 10,-200 L 32,-198 Z" fill="url(#${p}-brass)"/>
<path d="M -32,-202 l 22,-3 M -30,-199 l 20,-2" stroke="#54461c" stroke-width="1.2" opacity="0.7"/>
<path d="M 32,-204 l -22,-3 M 30,-201 l -20,-2" stroke="#54461c" stroke-width="1.2" opacity="0.7"/>
<path d="M -28,-200 l -6,3 l 2,8 l 6,-2 Z" fill="#b39a4a" opacity="0.7"/>
<path d="M 28,-200 l 6,3 l -2,8 l -6,-2 Z" fill="#b39a4a" opacity="0.7"/>
<path d="M -22,-178 Q -30,-156 -22,-128 L 8,-120 Q 30,-126 36,-150 Q 30,-128 6,-122 Q -16,-122 -22,-140 Q -26,-160 -22,-178 Z" fill="url(#${p}-sang)" opacity="0.92"/>
<path d="M -18,-170 Q -12,-150 -6,-128 Q 4,-150 0,-172 Q -10,-178 -18,-170 Z" fill="#7a1018" opacity="0.75"/>
<path d="M 8,-160 Q 18,-140 14,-122 Q 26,-138 24,-158 Q 16,-164 8,-160 Z" fill="#5e0e16" opacity="0.8"/>
<path d="M -10,-126 q 4,12 1,22 M -2,-124 q 3,12 0,22 M 8,-126 q 3,10 0,20 M 16,-130 q 3,10 0,18" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.8"/>
<path d="M -6,-120 q 0,8 -2,14 M 4,-119 q 1,8 -1,14 M 12,-122 q 1,8 -1,13" stroke="#3a0a10" stroke-width="1.8" fill="none" opacity="0.7"/>
<path d="M -20,-150 q -3,14 0,28" stroke="#a31621" stroke-width="2" fill="none" opacity="0.55"/>
<path d="M -8,-188 Q 0,-200 14,-196 Q 8,-180 -4,-180 Q -10,-184 -8,-188 Z" fill="#332d22"/>
<path d="M -6,-186 Q 0,-180 10,-182" stroke="#1d1a14" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M -8,-184 Q -2,-178 4,-176 Q -2,-168 -10,-172 Q -14,-178 -8,-184 Z" fill="url(#${p}-skin)"/>
<path d="M -7,-181 q 5,4 9,2" stroke="#161620" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -10,-180 q -4,8 -1,16" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M 18,-170 Q 26,-160 24,-148 Q 16,-152 14,-162 Q 14,-168 18,-170 Z" fill="#332d22"/>
<path d="M 17,-168 Q 22,-160 22,-152" stroke="#1d1a14" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M 18,-166 q 5,5 4,12 q -6,-1 -8,-7 Z" fill="url(#${p}-skin)"/>
<path d="M 17,-164 q 3,4 3,8" stroke="#161620" stroke-width="1.2" fill="none" opacity="0.6"/>
<path d="M 14,-198 L 22,-192 L 14,-186 L 24,-180 L 16,-172 L 26,-164" stroke="#473f30" stroke-width="2.6" fill="none"/>
<path d="M 16,-196 q 5,3 5,8" stroke="#332d22" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M 9,-168 q -16,-8 -26,2 q -2,7 -10,12 l 2,9 q 9,-5 11,-13 q 9,-9 23,-3 Z" fill="url(#${p}-brass)"/>
<path d="M -7,-167 q -10,-3 -18,5 q -2,6 -8,10" stroke="#cdb45e" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M 9,-168 l -1,8 M 3,-168 l -2,7 M -3,-166 l -2,6 M -9,-162 l -3,5 M -16,-157 l -3,5" stroke="#54461c" stroke-width="1.6" opacity="0.7"/>
<path d="M -4,-160 q -4,3 -6,8 q 5,-2 8,-6 Z" fill="#5e0e16" opacity="0.6"/>
<ellipse cx="-30" cy="-202" rx="13" ry="11" fill="url(#${p}-shirtD)"/>
<path d="M -32,-198 L -52,-164 L -48,-132 L -56,-102" stroke="url(#${p}-shirtD)" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M -48,-160 q 5,5 4,14 M -52,-130 q 3,6 2,14" stroke="#2c2722" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -38,-176 q -8,6 -10,18" stroke="#473f30" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -52,-138 L -38,-132 L -40,-124 L -54,-130 Z" fill="#473f30"/>
<path d="M -52,-138 l 13,5 M -53,-132 l 13,5" stroke="#332d22" stroke-width="1.2" opacity="0.7"/>
<path d="M -56,-138 q -6,16 0,34" stroke="#5e0e16" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M -56,-130 L -68,-108 Q -72,-96 -66,-90" stroke="url(#${p}-skin)" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M -64,-114 q -4,6 -3,14" stroke="#161620" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -66,-90 l -8,7 M -66,-90 l -2,12 M -66,-90 l 6,11 M -66,-90 l 11,5 M -66,-90 l 11,-3" stroke="url(#${p}-skin)" stroke-width="3.4" stroke-linecap="round"/>
<path d="M -74,-83 l -3,4 M -68,-78 l -1,5 M -60,-78 l 2,4 M -55,-85 l 4,2" stroke="#0e0e16" stroke-width="1.6" stroke-linecap="round"/>
<path d="M -68,-104 l 6,3 l -2,6 l -6,-3 Z" fill="url(#${p}-os)" opacity="0.6"/>
<path d="M -71,-98 q -2,7 0,14" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.6"/>
<ellipse cx="32" cy="-204" rx="14" ry="12" fill="url(#${p}-shirt)"/>
<path d="M 34,-200 Q 56,-192 60,-166 Q 62,-146 48,-138 Q 60,-132 64,-114 Q 66,-98 56,-88" stroke="url(#${p}-shirt)" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 50,-176 q 7,6 6,16 M 56,-138 q 6,5 6,16" stroke="#332d22" stroke-width="2.4" fill="none" opacity="0.6"/>
<path d="M 42,-180 q 9,4 12,16" stroke="#473f30" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M 40,-202 L 60,-196 L 56,-188 L 38,-194 Z" fill="url(#${p}-brass)"/>
<path d="M 41,-199 l 17,5 M 42,-196 l 15,4" stroke="#54461c" stroke-width="1.1" opacity="0.7"/>
<path d="M 44,-200 l 6,2 l -1,8 l -6,-2 Z" fill="#b39a4a" opacity="0.7"/>
<path d="M 48,-150 L 62,-144 L 60,-136 L 46,-142 Z" fill="#473f30"/>
<path d="M 48,-150 l 13,5 M 47,-144 l 13,5" stroke="#332d22" stroke-width="1.2" opacity="0.7"/>
<path d="M 50,-148 q -8,6 -10,18" stroke="#5e0e16" stroke-width="2.2" fill="none" opacity="0.55"/>
<path d="M 56,-138 L 68,-114 Q 72,-100 64,-92" stroke="url(#${p}-skin)" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M 64,-118 q 4,6 3,14" stroke="#161620" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M 64,-92 l -3,12 M 64,-92 l 4,12 M 64,-92 l 10,7 M 64,-92 l 12,1 M 64,-92 l 9,-7" stroke="url(#${p}-skin)" stroke-width="3.4" stroke-linecap="round"/>
<path d="M 61,-80 l -1,5 M 68,-80 l 1,5 M 74,-85 l 3,4 M 76,-91 l 4,1" stroke="#0e0e16" stroke-width="1.6" stroke-linecap="round"/>
<path d="M 68,-108 l 7,3 l -2,7 l -7,-3 Z" fill="url(#${p}-os)" opacity="0.6"/>
<path d="M 66,-100 q 3,7 1,15" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M -16,-212 L -20,-228 L 16,-230 L 18,-212 Z" fill="url(#${p}-skin)"/>
<path d="M -16,-222 q 16,5 30,-1" stroke="#161620" stroke-width="2" fill="none" opacity="0.8"/>
<path d="M -14,-216 q 14,4 28,-1" stroke="#2a2a2f" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -10,-214 q 2,6 -2,12 M 4,-216 q 1,6 -2,12" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.6"/>
<g transform="rotate(12 0 -232)">
<path d="M -18,-230 Q -28,-262 -2,-272 Q 24,-268 22,-236 Q 21,-224 9,-220 L -6,-222 Q -18,-226 -18,-230 Z" fill="url(#${p}-crane)"/>
<path d="M -15,-234 Q -22,-258 -4,-268 L 0,-266 Q -15,-256 -11,-232 Z" fill="#1d1d23" opacity="0.7"/>
<path d="M 14,-238 q 7,3 7,10 q -4,4 -10,1 Z" fill="url(#${p}-skin)" opacity="0.85"/>
<path d="M -14,-256 q 10,-5 22,-2 M -16,-248 q 12,-5 24,-2" stroke="#131319" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -10,-244 Q -2,-236 8,-238 Q 4,-230 -4,-230 Q -10,-234 -10,-244 Z" fill="#1d1d23" opacity="0.7"/>
<path d="M -9,-238 Q -16,-228 -10,-218 Q -2,-216 2,-224 Q 0,-232 -9,-238 Z" fill="#101016" opacity="0.85"/>
<path d="M 6,-238 Q 14,-228 9,-218 Q 1,-216 -2,-224 Q -1,-232 6,-238 Z" fill="#101016" opacity="0.85"/>
<path d="M -8,-208 Q -6,-202 4,-201 L 4,-207 Q -2,-207 -8,-209 Z" fill="#0d0d13"/>
<path d="M -7,-206 l 2,4 l 2,-3 l 2,4 l 2,-3" stroke="#8f8876" stroke-width="1.2" fill="none" opacity="0.7"/>
<path d="M -7,-202 Q -11,-186 -3,-176 Q 7,-174 11,-184 Q 12,-194 6,-200 L -1,-201 Q -4,-201 -7,-202 Z" fill="url(#${p}-crane)"/>
<path d="M -5,-198 Q -8,-186 -2,-179 Q 5,-178 8,-185 Q 8,-192 4,-196 Z" fill="#0d0d13"/>
<path d="M -4,-196 l 2,3 l 2,-2 l 2,3 l 2,-2" stroke="#8f8876" stroke-width="1.1" fill="none" opacity="0.8"/>
<path d="M -7,-203 q -4,9 -2,20 M 8,-201 q 3,8 1,18 M 0,-202 q 0,10 -1,24" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.75"/>
<path d="M 3,-178 q 1,7 -2,12" stroke="#a31621" stroke-width="1.3" fill="none" opacity="0.6"/>
<path d="M -16,-242 q 8,-3 14,1 M 6,-242 q 8,-3 12,2" stroke="#0c0c12" stroke-width="2.6" fill="none" opacity="0.55"/>
<circle cx="-7" cy="-238" r="7" fill="url(#${p}-eye)"/>
<circle cx="-7" cy="-238" r="2.3" fill="#d6303e"/>
<circle cx="-7.8" cy="-238.8" r="0.9" fill="#e8868d"/>
<circle cx="8" cy="-236" r="7" fill="url(#${p}-eye)"/>
<circle cx="8" cy="-236" r="2.3" fill="#d6303e"/>
<circle cx="7.2" cy="-236.8" r="0.9" fill="#e8868d"/>
</g>
</g>`;
}

function zRatGeant(p) {
  return `<g transform="translate(150,346)">
<defs>
<radialGradient id="${p}-eye" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d6303e" stop-opacity="0.55"/><stop offset="1" stop-color="#d6303e" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-torse" cx="0.4" cy="0.3" r="0.85"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.55" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-croupe" cx="0.55" cy="0.32" r="0.9"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.5" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<radialGradient id="${p}-chair" cx="0.45" cy="0.32" r="0.85"><stop offset="0" stop-color="#a31621"/><stop offset="0.5" stop-color="#7a1018"/><stop offset="1" stop-color="#5e0e16"/></radialGradient>
<radialGradient id="${p}-crane" cx="0.4" cy="0.32" r="0.9"><stop offset="0" stop-color="#1d1c24"/><stop offset="0.6" stop-color="#14151b"/><stop offset="1" stop-color="#0d0e13"/></radialGradient>
<linearGradient id="${p}-patte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17161c"/><stop offset="1" stop-color="#0d0e13"/></linearGradient>
<linearGradient id="${p}-gueule" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2410"/><stop offset="0.55" stop-color="#a31621"/><stop offset="1" stop-color="#101117"/></linearGradient>
<linearGradient id="${p}-queue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a1018"/><stop offset="0.5" stop-color="#5e0e16"/><stop offset="1" stop-color="#3a2620"/></linearGradient>
<radialGradient id="${p}-os" cx="0.4" cy="0.4" r="0.6"><stop offset="0" stop-color="#b3ac96"/><stop offset="1" stop-color="#8f8876"/></radialGradient>
<radialGradient id="${p}-braise" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9421e" stop-opacity="0.4"/><stop offset="1" stop-color="#c9421e" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="6" cy="2" rx="128" ry="11" fill="#000" opacity="0.5"/>
<ellipse cx="-70" cy="-1" rx="34" ry="6" fill="#000" opacity="0.4"/>
<ellipse cx="60" cy="-58" rx="56" ry="34" fill="url(#${p}-braise)" opacity="0.5"/>
<path d="M 124,-14 Q 168,-12 198,-26 Q 224,-40 244,-32 Q 226,-22 212,-26 Q 224,-18 240,-22 Q 222,-10 206,-16 Q 184,-6 156,-8 Q 138,-8 124,-14 Z" fill="url(#${p}-queue)"/>
<path d="M 124,-14 Q 168,-12 198,-26 Q 224,-40 244,-32" stroke="#3a2620" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M 132,-13 q 6,3 4,8 M 148,-11 q 6,2 5,8 M 166,-13 q 5,2 4,8 M 184,-18 q 5,1 5,7 M 202,-24 q 4,1 4,6" stroke="#3a2620" stroke-width="1.2" fill="none" opacity="0.65"/>
<path d="M 130,-18 q 8,-3 16,-1 M 150,-16 q 8,-3 15,-3 M 172,-20 q 7,-3 14,-4" stroke="#7a1018" stroke-width="1.3" fill="none" opacity="0.5"/>
<path d="M 60,-94 Q 96,-138 120,-126 Q 138,-116 138,-92 Q 138,-66 116,-50 L 124,-30 Q 128,-16 118,-10 L 104,-10 L 108,-26 L 96,-44 Q 70,-34 44,-38 Q 12,-42 -16,-44 Q -50,-48 -72,-66 L -82,-80 Q -90,-94 -82,-108 Q -64,-128 -34,-128 Q -2,-128 22,-118 Q 46,-110 60,-94 Z" fill="url(#${p}-torse)"/>
<path d="M 110,-122 Q 134,-114 138,-92 Q 138,-66 116,-50 Q 122,-72 120,-94 Q 120,-114 104,-120 Z" fill="url(#${p}-croupe)"/>
<path d="M 92,-110 Q 124,-118 134,-96 Q 122,-104 100,-100 Q 90,-104 92,-110 Z" fill="url(#${p}-chair)" opacity="0.85"/>
<path d="M 100,-104 Q 120,-108 130,-92 M 96,-96 Q 116,-100 126,-84" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.55"/>
<path d="M 104,-118 q 6,10 4,22 M 116,-114 q 6,12 4,24 M 90,-114 q 5,10 4,20" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M 30,-112 Q 64,-126 92,-116 Q 70,-108 44,-110 Q 34,-110 30,-112 Z" fill="url(#${p}-chair)"/>
<path d="M 30,-112 Q 64,-126 92,-116" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M 40,-114 q 2,8 0,16 M 54,-118 q 2,9 0,18 M 68,-118 q 2,8 0,17 M 82,-116 q 1,7 -1,14" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.65"/>
<path d="M 36,-110 q 22,-6 44,-2" stroke="#d6303e" stroke-width="1.2" fill="none" opacity="0.4"/>
<path d="M -10,-118 Q 18,-126 36,-116 Q 16,-112 -2,-114 Q -8,-114 -10,-118 Z" fill="url(#${p}-chair)" opacity="0.9"/>
<path d="M -8,-116 q 2,7 0,14 M 6,-118 q 2,8 0,16 M 22,-118 q 2,7 0,15" stroke="#5e0e16" stroke-width="1.3" fill="none" opacity="0.6"/>
<path d="M 4,-122 Q -14,-118 -26,-96 Q -10,-104 8,-110 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -44,-44 q -4,10 -2,22 M -28,-42 q -4,10 -2,20" stroke="#a31621" stroke-width="2" fill="none" opacity="0.7"/>
<path d="M -34,-52 Q -16,-42 6,-46 Q -4,-34 -24,-36 Q -34,-44 -34,-52 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M 84,-70 Q 100,-58 96,-40 Q 88,-52 84,-66 Z" fill="#0d0e13" opacity="0.55"/>
<g opacity="0.96">
<path d="M -54,-118 Q -50,-92 -44,-58" stroke="#8f8876" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M -54,-118 Q -50,-92 -44,-58" stroke="url(#${p}-os)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M -40,-120 Q -36,-92 -30,-56" stroke="#8f8876" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M -40,-120 Q -36,-92 -30,-56" stroke="url(#${p}-os)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M -25,-121 Q -21,-92 -15,-56" stroke="#8f8876" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M -25,-121 Q -21,-92 -15,-56" stroke="url(#${p}-os)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M -10,-120 Q -6,-92 0,-54" stroke="#8f8876" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M -10,-120 Q -6,-92 0,-54" stroke="url(#${p}-os)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M 5,-118 Q 9,-90 14,-54" stroke="#8f8876" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M 5,-118 Q 9,-90 14,-54" stroke="url(#${p}-os)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M 20,-114 Q 24,-88 28,-54" stroke="#8f8876" stroke-width="5.4" fill="none" stroke-linecap="round"/>
<path d="M 20,-114 Q 24,-88 28,-54" stroke="url(#${p}-os)" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>
<path d="M -58,-122 Q -20,-132 24,-122" stroke="#8f8876" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.95"/>
<path d="M -58,-122 Q -20,-132 24,-122" stroke="url(#${p}-os)" stroke-width="4.4" fill="none" stroke-linecap="round"/>
<ellipse cx="-50" cy="-124" rx="4" ry="3.4" fill="url(#${p}-os)"/>
<ellipse cx="-36" cy="-127" rx="4" ry="3.4" fill="url(#${p}-os)"/>
<ellipse cx="-22" cy="-128" rx="4" ry="3.4" fill="url(#${p}-os)"/>
<ellipse cx="-8" cy="-129" rx="4" ry="3.4" fill="url(#${p}-os)"/>
<ellipse cx="6" cy="-128" rx="4" ry="3.4" fill="url(#${p}-os)"/>
<ellipse cx="20" cy="-126" rx="3.6" ry="3.2" fill="url(#${p}-os)"/>
<path d="M -52,-58 q 4,8 0,16 M -38,-56 q 4,8 0,15 M -23,-55 q 4,7 0,14 M -8,-54 q 4,7 0,14 M 6,-54 q 4,7 0,13" stroke="#0d0e13" stroke-width="2" fill="none" opacity="0.6"/>
<path d="M -56,-110 Q -50,-100 -54,-90 M 22,-108 Q 28,-98 24,-88" stroke="#5e0e16" stroke-width="1.6" fill="none" opacity="0.5"/>
<path d="M 96,-44 Q 90,-22 86,-6 L 78,-2 L 86,-2 L 98,-14 Q 104,-30 102,-46 Z" fill="url(#${p}-patte)"/>
<path d="M 78,-2 l -3,2 M 84,-2 l -2,2 M 90,-2 l -2,2 M 96,-2 l -2,2" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M 100,-2 q 4,-2 6,0 M 76,-3 q -4,-2 -6,0" stroke="#8f8876" stroke-width="1.1" stroke-linecap="round"/>
<path d="M 64,-46 Q 60,-24 58,-8 L 50,-2 L 60,-2 L 70,-14 Q 74,-32 72,-48 Z" fill="url(#${p}-patte)"/>
<path d="M 50,-2 l -3,2 M 56,-2 l -2,2 M 62,-2 l -2,2 M 68,-2 l -2,2" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M 70,-30 q -4,8 -2,16" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.6"/>
<path d="M -50,-58 Q -58,-34 -56,-12 L -64,-2 L -54,-2 L -46,-14 Q -42,-34 -40,-54 Z" fill="url(#${p}-patte)"/>
<path d="M -64,-2 l -3,2 M -58,-2 l -2,3 M -53,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -68,-3 q -4,-1 -7,1 M -50,-2 q 3,-1 6,1" stroke="#8f8876" stroke-width="1.1" stroke-linecap="round"/>
<path d="M -26,-50 Q -32,-26 -32,-8 L -40,-2 L -30,-2 L -22,-14 L -16,-46 Z" fill="url(#${p}-patte)"/>
<path d="M -40,-2 l -3,2 M -34,-2 l -2,3 M -29,-2 l -2,3" stroke="#8f8876" stroke-width="1.3" stroke-linecap="round"/>
<path d="M -42,-44 q -4,8 -2,16" stroke="#a31621" stroke-width="1.8" fill="none" opacity="0.65"/>
<path d="M -28,-40 q -3,7 -1,14" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -72,-66 Q -104,-58 -120,-78 L -116,-96 Q -108,-116 -86,-122 Q -64,-126 -52,-110 L -48,-90 Q -50,-74 -62,-68 Q -68,-66 -72,-66 Z" fill="url(#${p}-crane)"/>
<path d="M -52,-110 Q -60,-100 -56,-86 Q -50,-94 -48,-104 Z" fill="#1d1c24" opacity="0.7"/>
<path d="M -86,-118 Q -100,-138 -86,-150 Q -72,-146 -72,-130 Q -78,-122 -86,-118 Z" fill="url(#${p}-crane)"/>
<path d="M -86,-118 Q -98,-136 -86,-148 L -84,-132 Q -82,-124 -86,-118 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -88,-150 L -84,-160 L -78,-150 Z" fill="#1d1c24"/>
<path d="M -84,-160 Q -80,-150 -86,-148" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.7"/>
<path d="M -64,-120 Q -82,-140 -66,-152 Q -50,-148 -52,-132 Q -58,-122 -64,-120 Z" fill="url(#${p}-crane)"/>
<path d="M -64,-120 Q -78,-138 -66,-150 L -62,-134 Q -60,-126 -64,-120 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -66,-152 L -58,-164 L -54,-150 Z" fill="#1d1c24"/>
<path d="M -60,-164 L -56,-156 L -52,-162 Z" fill="#0d0e13"/>
<path d="M -58,-164 Q -54,-152 -58,-150" stroke="#5e0e16" stroke-width="1.2" fill="none" opacity="0.6"/>
<path d="M -120,-78 Q -150,-74 -168,-86 Q -158,-66 -146,-66 Q -150,-58 -158,-54 Q -144,-52 -134,-62 Q -126,-70 -120,-78 Z" fill="url(#${p}-crane)"/>
<path d="M -120,-78 Q -150,-74 -168,-86 Q -158,-72 -146,-70 Z" fill="#0d0e13" opacity="0.6"/>
<path d="M -168,-86 L -180,-92 L -170,-82 Q -162,-78 -158,-80 Z" fill="#1d1c24"/>
<path d="M -158,-54 Q -168,-50 -174,-56 L -166,-58 Z" fill="#101117"/>
<path d="M -134,-86 Q -158,-90 -176,-82 L -176,-70 Q -160,-66 -140,-68 Q -130,-72 -134,-86 Z" fill="url(#${p}-gueule)"/>
<path d="M -176,-82 L -176,-70 Q -168,-68 -160,-68 Q -170,-76 -176,-82 Z" fill="#a31621" opacity="0.5"/>
<path d="M -158,-72 Q -150,-66 -140,-68 Q -148,-62 -158,-66 Z" fill="#3d4a36" opacity="0.6"/>
<path d="M -170,-82 L -176,-92 L -170,-76 Z" fill="#b3ac96"/>
<path d="M -170,-92 L -176,-96 L -172,-88 Z" fill="#b3ac96"/>
<path d="M -170,-92 Q -172,-100 -176,-104 L -178,-94 Z" fill="url(#${p}-os)"/>
<path d="M -178,-94 L -184,-104 L -178,-90 Z" fill="url(#${p}-os)"/>
<path d="M -160,-84 L -164,-94 L -158,-82 Z" fill="#b3ac96"/>
<path d="M -150,-82 L -152,-90 L -146,-80 Z" fill="#8f8876"/>
<path d="M -176,-70 L -180,-62 L -174,-66 Z" fill="#b3ac96"/>
<path d="M -174,-66 L -176,-58 L -170,-66 Z" fill="#8f8876"/>
<path d="M -164,-68 L -166,-60 L -160,-68 Z" fill="#b3ac96"/>
<path d="M -154,-68 L -154,-60 L -148,-68 Z" fill="#8f8876"/>
<path d="M -176,-90 q -3,2 -3,6 M -178,-72 q -4,1 -5,5" stroke="#0d0e13" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M -176,-88 q -8,-6 -16,-4 Q -184,-80 -176,-78 Z" fill="#a31621"/>
<path d="M -178,-74 q -8,4 -10,12 Q -180,-64 -176,-70 Z" fill="#a31621"/>
<path d="M -178,-90 Q -192,-92 -200,-86 Q -190,-84 -180,-86 Z" fill="#7a1018" opacity="0.8"/>
<path d="M -156,-96 Q -150,-108 -140,-108 Q -136,-100 -142,-94 Q -150,-92 -156,-96 Z" fill="#1d1c24"/>
<path d="M -156,-96 Q -150,-106 -142,-106 L -144,-98 Q -150,-94 -156,-96 Z" fill="#0d0e13" opacity="0.7"/>
<path d="M -150,-108 q 4,-8 0,-14" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -144,-78 q 8,3 16,0 M -142,-72 q 7,3 14,0" stroke="#101117" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M -130,-100 q 6,8 2,18" stroke="#a31621" stroke-width="1.6" fill="none" opacity="0.6"/>
<path d="M -120,-90 Q -100,-92 -84,-86" stroke="#5e0e16" stroke-width="1.4" fill="none" opacity="0.5"/>
<path d="M -148,-86 q -10,-2 -18,2 M -148,-84 q -8,1 -14,5" stroke="#8f8876" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.7"/>
<circle cx="-146" cy="-90" r="6.5" fill="url(#${p}-eye)"/>
<circle cx="-146" cy="-90" r="2.1" fill="#d6303e"/>
<circle cx="-146.8" cy="-90.8" r="0.85" fill="#e8868d"/>
<circle cx="-134" cy="-100" r="6" fill="url(#${p}-eye)"/>
<circle cx="-134" cy="-100" r="2" fill="#d6303e"/>
<circle cx="-134.8" cy="-100.8" r="0.8" fill="#e8868d"/>
</g>`;
}
