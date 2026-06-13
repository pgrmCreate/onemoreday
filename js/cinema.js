// ============ Lecteur de cinématiques — la caméra bouge, le monde se montre ============
// Deux familles de plans :
//   - plans automatiques : un travelling, puis la suite s'enchaîne toute seule ;
//   - plans « attendre » : la caméra finit sa course et le bouton Continuer apparaît.
// Toujours un bouton Passer. Le panorama est dessiné À L'HEURE DU JEU (ciel dynamique).
import { G, getFlag, setFlag, save } from './state.js';
import { CINEMATIQUES } from './data/cinematiques.js';
import { svgPano } from './ambiance.js';
import { PANO_W, PANO_H } from './art/panoramas/index.js';
import { playAmbiance, sfx } from './audio.js';
import * as multi from './multi.js';

let etat = null; // { el, timer, fin }

function heureJeu() { return G ? G.world.heure + G.world.minute / 60 : 14; }

function nettoyer() {
  if (!etat) return;
  if (etat.timer) clearTimeout(etat.timer);
  etat.el.remove();
  etat = null;
}

export function cineEnCours() { return !!etat; }

// Joue une cinématique. onFin est appelé une seule fois, cinématique passée ou finie.
// distant=true : c'est une scène RELAYÉE par le coéquipier — on ne la re-diffuse pas.
export function jouerCine(id, onFin = () => {}, distant = false) {
  const def = CINEMATIQUES[id];
  if (!def || etat) { onFin(); return; }
  const svg = svgPano(def.plans[0].pano, heureJeu());
  if (!svg) { onFin(); return; } // panorama indisponible : on ne bloque jamais le jeu
  // Co-op : ma cinématique, le coéquipier doit la voir aussi (no-op en solo).
  if (!distant) multi.diffuserCine(id);

  const el = document.createElement('div');
  el.className = 'cine';
  el.innerHTML = `
    <button class="cine-passer">Passer ▸</button>
    <div class="cine-cadre"><div class="cine-pellicule">${svg}</div></div>
    <div class="cine-texte"></div>
    <div class="cine-actions"><button class="act primary cine-cont hidden">Continuer</button></div>`;
  document.body.appendChild(el);
  etat = { el, timer: null, fin: false };
  if (def.musique) playAmbiance(def.musique);

  const pellicule = el.querySelector('.cine-pellicule');
  const cadre = el.querySelector('.cine-cadre');
  const texte = el.querySelector('.cine-texte');
  const cont = el.querySelector('.cine-cont');

  const finir = () => {
    if (!etat || etat.fin) return;
    etat.fin = true;
    nettoyer();
    onFin();
  };
  el.querySelector('.cine-passer').onclick = () => { sfx('clic'); finir(); };

  // Position caméra → transform. x balaie le panorama, zoom resserre le cadre.
  let panoCourant = def.plans[0].pano;
  const poser = (pos, dureeMs) => {
    const r = cadre.getBoundingClientRect();
    const baseW = r.height * (PANO_W / PANO_H);
    const z = pos.zoom || 1;
    const tx = -pos.x * Math.max(0, baseW * z - r.width);
    const ty = -(r.height * (z - 1)) / 2;
    pellicule.style.width = baseW + 'px';
    pellicule.style.transition = dureeMs ? `transform ${dureeMs}ms cubic-bezier(.35,0,.65,1)` : 'none';
    pellicule.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;
  };

  const jouerPlan = (i) => {
    if (!etat || etat.fin) return;
    if (i >= def.plans.length) { finir(); return; }
    const p = def.plans[i];
    if (p.pano !== panoCourant) {
      panoCourant = p.pano;
      pellicule.innerHTML = svgPano(p.pano, heureJeu());
    }
    texte.textContent = p.texte || '';
    texte.classList.remove('visible'); void texte.offsetWidth; texte.classList.add('visible');
    cont.classList.add('hidden');
    poser(p.de, 0);
    void pellicule.offsetWidth; // force le point de départ avant le travelling
    poser(p.vers, p.duree);
    if (p.attendre) {
      // le bouton apparaît quand la caméra a presque fini sa course
      etat.timer = setTimeout(() => {
        if (!etat || etat.fin) return;
        cont.classList.remove('hidden');
        cont.onclick = () => { sfx('clic'); jouerPlan(i + 1); };
      }, Math.max(800, p.duree * 0.75));
    } else {
      etat.timer = setTimeout(() => jouerPlan(i + 1), p.duree + 350);
    }
  };
  jouerPlan(0);
}

// Joue une cinématique UNE SEULE FOIS par partie (drapeau cine_<id>).
export function jouerCineUneFois(id, onFin = () => {}) {
  if (!G || getFlag('cine_' + id)) { onFin(); return; }
  setFlag('cine_' + id);
  save();
  jouerCine(id, onFin);
}

// Poignée de débogage console : omdCine('sortie_hotel')
if (typeof window !== 'undefined') window.omdCine = jouerCine;
