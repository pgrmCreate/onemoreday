// Silhouettes SVG de repli (copiées de js/art/combat_creatures.js, lecture seule) pour les morts
// sans image détourée dans /zombies/. Chaque fonction(p) rend un <g> centré x=0 posé au sol, viewBox 300×360.
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

export const SILHOUETTES = { putrefie: zPutrefie, chien_infecte: zChien, colosse: zColosse, militaire: zPolicier, fauve: zChien, sanglier: zChien, _defaut: zErrant };
