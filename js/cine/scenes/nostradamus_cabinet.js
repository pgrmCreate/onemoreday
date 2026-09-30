// Vignette — le cabinet reconstitué du musée Nostradamus : bureau de bois, sphère armillaire, crâne en plâtre,
// mannequin de cire en robe noire de médecin du XVIe, scanner radio sur batterie de voiture, cendrier plein.
import { r1, halo, degrade, uid, humain, voile } from '../lib.js';
import { scintiller } from '../anim.js';

export default {
  largeur: 1.1,
  fond: '#140e0a',
  couches: [
    { profondeur: 0, svg: (L) => {
      const c = L / 2, id = uid('cab');
      let s = `<defs>${degrade(id, [[0, '#2a1e16'], [1, '#140e0a']])}</defs><rect x="-5" y="-5" width="${L + 10}" height="1010" fill="url(#${id})"/>`;
      // Poutres, étagères de grimoires, fenêtre à meneaux.
      s += `<path d="M-5 90H${L + 5}M-5 170H${L + 5}" stroke="#0c0806" stroke-width="30"/>`;
      for (let k = 0; k < 4; k++) { const y = 300 + k * 110; s += `<rect x="${c - 1000}" y="${y}" width="420" height="10" fill="#3a2616"/>`; for (let b = 0; b < 16; b++) s += `<rect x="${c - 996 + b * 26}" y="${y - 70 - (b % 3) * 8}" width="22" height="${70 + (b % 3) * 8}" fill="${['#5a2a1a', '#3a3a24', '#6a4a2a', '#2a2a3a'][b % 4]}"/>`; }
      s += `<rect x="${c + 560}" y="260" width="260" height="380" fill="#2a3448"/><path d="M${c + 690} 260v380M${c + 560} 450h260" stroke="#140e0a" stroke-width="16"/>${halo(c + 690, 450, 260, 300, '#6a7a9a', 0.2)}`;
      return s;
    } },
    { profondeur: 0.5, svg: (L) => {
      const c = L / 2;
      let s = `<rect x="-5" y="820" width="${L + 10}" height="190" fill="#1a120c"/>`;
      // Mannequin de cire en robe noire, chapeau carré.
      s += humain(c - 520, 880, 520, 'debout', { corps: '#0c0908', manteau: '#0c0908', tete: '#c8b49a', chapeau: '#0c0908' });
      // Bureau et objets.
      s += `<rect x="${c - 330}" y="690" width="700" height="30" fill="#5a3a22"/><path d="M${c - 300} 720v160M${c + 340} 720v160" stroke="#3a2616" stroke-width="26"/>`;
      s += `<g class="sphere" data-x="${c - 150}" data-y="560"><circle cx="${c - 150}" cy="580" r="90" fill="none" stroke="#b8923a" stroke-width="6"/><ellipse cx="${c - 150}" cy="580" rx="90" ry="30" fill="none" stroke="#b8923a" stroke-width="5"/><ellipse cx="${c - 150}" cy="580" rx="30" ry="90" fill="none" stroke="#b8923a" stroke-width="5" transform="rotate(30 ${c - 150} 580)"/></g><path d="M${c - 150} 670v20" stroke="#b8923a" stroke-width="10"/>`;
      s += `<path d="M${c + 10} 690q-6 -70 50 -76q56 6 50 76z" fill="#d8d0bc"/><circle cx="${c + 42}" cy="652" r="10" fill="#1a1410"/><circle cx="${c + 78}" cy="652" r="10" fill="#1a1410"/>`;
      // Scanner radio sur batterie.
      s += `<rect x="${c + 150}" y="640" width="120" height="50" fill="#2a2a2c"/><rect x="${c + 160}" y="650" width="60" height="18" fill="#3a8a4a" class="scanner"/><path d="M${c + 250} 640v-120" stroke="#1a1a1a" stroke-width="5"/><rect x="${c + 160}" y="610" width="90" height="30" fill="#1c1c1e"/>`;
      s += `<ellipse cx="${c + 310}" cy="686" rx="40" ry="8" fill="#6a6a6a"/><path d="M${c + 290} 680l20 -6M${c + 310} 682l24 -8M${c + 296} 684l30 -2" stroke="#e8e0d0" stroke-width="5"/>`;
      s += `<g class="bougie">${halo(c - 260, 620, 200, 170, '#f0c26a', 0.45)}<rect x="${c - 268}" y="630" width="14" height="60" fill="#e8e0cc"/><path d="M${c - 261} 630q-5 -12 0 -22q5 10 0 22z" fill="#ffd070"/></g>`;
      return s;
    } },
    { profondeur: 1, svg: (L) => voile(L, '#000', 0.2) },
  ],
  ambiance: ['vie'],
  anims: { vie(t, S) { scintiller(t, S, '.bougie', 0.75, 1, 11); scintiller(t, S, '.scanner', 0.4, 1, 20); } },
};
