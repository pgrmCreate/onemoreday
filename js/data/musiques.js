// ============ Partitions des thèmes composés ============
// Jouées par le mini-séquenceur de js/audio.js. Tout reste synthétisé :
// une partition est une liste de voix, chaque voix une liste de notes
// [demi-ton relatif à la fondamentale, durée en temps]. demi-ton null = silence.
//
// Format d'un thème :
//   tempo        : battements par minute (la noire)
//   fondamentale : fréquence de la tonique en Hz
//   transpose    : demi-tons ajoutés à toutes les notes (optionnel)
//   etire        : multiplicateur des durées, >1 = plus lent (optionnel)
//   respiration  : [min, max] secondes de SILENCE entre deux reprises —
//                  le jeu reste un survival : la musique doit savoir se taire
//   nuit         : id d'un thème de remplacement quand il fait nuit (optionnel)
//   voix         : jouées en parallèle, chacune :
//     timbre   : 'sine' | 'triangle' | 'sawtooth' | 'square'
//     gain     : volume de la voix (rester bas : 0.02 à 0.06)
//     octave   : décalage d'octave par rapport à la fondamentale
//     attaque  : montée de l'enveloppe en secondes
//     relache  : queue de l'enveloppe en secondes
//     echo     : true → la voix est envoyée vers l'écho du monde vide
//     detune   : ajoute un 2e oscillateur sinus désaccordé de N cents (chaleur)
//     filtre   : fréquence d'un passe-bas posé sur la voix (optionnel)
//     notes    : [[demi-ton | null, durée en temps], ...]

export const THEMES = {

  // --- TITRE : le générique du jeu. La mineur, lent, mélancolique. ---
  titre: {
    tempo: 56,
    fondamentale: 220,
    respiration: [9, 16],
    voix: [
      { // mélodie : une phrase qui monte, hésite, redescend et se pose
        timbre: 'triangle', gain: 0.05, octave: 0, attaque: 0.08, relache: 0.6, echo: true, detune: 6,
        notes: [
          [0, 1.5], [3, 0.5], [5, 1], [7, 2], [null, 1],
          [8, 1.5], [7, 0.5], [5, 1], [3, 2], [null, 1],
          [5, 1.5], [3, 0.5], [0, 1], [-2, 2], [0, 3], [null, 1],
        ],
      },
      { // basse : la — fa — sol — mi — la, le sol de la marche funèbre douce
        timbre: 'sine', gain: 0.045, octave: -2, attaque: 0.3, relache: 0.8,
        notes: [[0, 5], [null, 1], [-4, 5], [null, 1], [-2, 4], [-5, 2], [0, 3]],
      },
      { // nappe : deux tenues, à peine audibles, qui colorent l'air
        timbre: 'sine', gain: 0.02, octave: -1, attaque: 1.8, relache: 1.5, echo: true,
        notes: [[7, 10], [3, 11]],
      },
    ],
  },

  // --- REFUGE : le seul endroit chaleureux du monde. Sol majeur, simple. ---
  refuge: {
    tempo: 66,
    fondamentale: 196,
    respiration: [7, 13],
    voix: [
      { // mélodie : une berceuse de trois fois rien
        timbre: 'triangle', gain: 0.05, octave: 0, attaque: 0.06, relache: 0.5, echo: true, detune: 5,
        notes: [
          [4, 1], [2, 1], [0, 2], [7, 1], [9, 1], [7, 2],
          [4, 1], [2, 1], [4, 1], [2, 1], [0, 4],
        ],
      },
      { // basse : sol — do — ré — sol, la cadence du foyer
        timbre: 'sine', gain: 0.04, octave: -1, attaque: 0.25, relache: 0.7,
        notes: [[0, 4], [-7, 4], [-5, 4], [0, 4]],
      },
      { // nappe tiède
        timbre: 'sine', gain: 0.016, octave: 0, attaque: 2, relache: 1.5,
        notes: [[4, 8], [2, 4], [0, 4]],
      },
    ],
  },

  // --- EXPLORATION (jour) : discret, des notes posées loin les unes des autres. ---
  exploration: {
    tempo: 50,
    fondamentale: 146.83,
    respiration: [12, 22],
    nuit: 'exploration_nuit',
    voix: [
      { // mélodie clairsemée, beaucoup de silences
        timbre: 'sine', gain: 0.042, octave: 0, attaque: 0.1, relache: 0.8, echo: true, detune: 5,
        notes: [
          [0, 2], [null, 1], [3, 1], [5, 2], [null, 2],
          [7, 1.5], [5, 0.5], [3, 2], [null, 2], [0, 3], [null, 3],
        ],
      },
      { // bourdon grave qui glisse d'un ton
        timbre: 'sine', gain: 0.03, octave: -1, attaque: 1.2, relache: 1.5,
        notes: [[0, 9], [null, 1], [-2, 9], [null, 1]],
      },
    ],
  },
  // exploration_nuit est dérivé d'exploration plus bas : transposé, ralenti, plus feutré.

  // --- TENSION : frottements de seconde mineure et triton. Jamais fort. ---
  tension: {
    tempo: 72,
    fondamentale: 110,
    respiration: [6, 12],
    voix: [
      {
        timbre: 'sawtooth', gain: 0.032, octave: 0, attaque: 0.15, relache: 0.5, filtre: 520,
        notes: [[0, 1], [1, 1], [0, 1], [6, 1.5], [null, 1.5], [1, 2], [0, 1], [null, 3]],
      },
      { // basse qui frotte la seconde mineure contre la mélodie
        timbre: 'sine', gain: 0.035, octave: -1, attaque: 0.5, relache: 1,
        notes: [[0, 5], [null, 1], [1, 5], [null, 1]],
      },
    ],
  },

  // --- MORT : court et funèbre. Un glas qui descend, puis plus rien. ---
  mort: {
    tempo: 40,
    fondamentale: 98,
    respiration: [18, 30],
    voix: [
      { // le glas, une octave au-dessus, qui s'enfonce demi-ton par demi-ton
        timbre: 'sine', gain: 0.045, octave: 1, attaque: 0.02, relache: 2, echo: true,
        notes: [[0, 2], [-1, 2], [-3, 2], [-5, 4], [null, 2]],
      },
      { // un sol grave, puis le ré en dessous : la terre se referme
        timbre: 'sine', gain: 0.05, octave: -1, attaque: 1, relache: 2,
        notes: [[0, 6], [-5, 6]],
      },
    ],
  },

  // --- TRAIN : le voyage. Une basse qui roule, une mélodie qui regarde dehors. ---
  train: {
    tempo: 92,
    fondamentale: 110,
    respiration: [8, 15],
    voix: [
      {
        timbre: 'triangle', gain: 0.045, octave: 0, attaque: 0.04, relache: 0.4, echo: true, detune: 4,
        notes: [
          [0, 0.5], [0, 0.5], [3, 1], [5, 1], [7, 1], [5, 0.5], [3, 0.5], [0, 2], [null, 1],
          [10, 1], [7, 1], [5, 1], [3, 1], [0, 2], [null, 2],
        ],
      },
      { // basse pulsée : le rythme des rails transposé en notes
        timbre: 'triangle', gain: 0.038, octave: -1, attaque: 0.02, relache: 0.15,
        notes: [
          [0, 1], [0, 1], [-2, 1], [-2, 1], [-4, 1], [-4, 1], [-2, 1], [-2, 1],
          [0, 1], [0, 1], [-2, 1], [-2, 1], [0, 1], [0, 1], [null, 2],
        ],
      },
    ],
  },
};

// Variante : mêmes notes, transposées / ralenties / atténuées. Sert à dériver
// les thèmes de nuit sans dupliquer les partitions.
function variante(theme, { transpose = 0, etire = 1, attenuation = 1 } = {}) {
  const v = {
    ...theme,
    transpose: (theme.transpose || 0) + transpose,
    etire: (theme.etire || 1) * etire,
    voix: theme.voix.map(vx => ({ ...vx, gain: vx.gain * attenuation, timbre: 'sine' })),
  };
  delete v.nuit;
  return v;
}

// La nuit, l'exploration descend de trois demi-tons, ralentit et se feutre.
THEMES.exploration_nuit = variante(THEMES.exploration, { transpose: -3, etire: 1.3, attenuation: 0.85 });
