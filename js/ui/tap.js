// ============ Tap fiable sur écran tactile ============
// Sur certains téléphones, le « click » qui suit un toucher se perd : l'interface se
// redessine entre le moment où le doigt se pose et celui où il se lève (fouille qui
// révèle un objet, panneau qui se rafraîchit…), ou le navigateur l'annule.
// Ici, on déclenche l'action DÈS que le doigt se lève sur un bouton des fenêtres de jeu
// (panneaux, butin, dialogues), puis on ignore le click natif qui arriverait ensuite.
const ZONES = '.ui-panneau, .ex-butin, .dlg';
const SEUIL = 14; // px de glissement toléré (au-delà, c'est un défilement)
let depart = null;
let synthetique = null; // { el, t } : dernier bouton activé par nous
// Où le doigt (ou la souris) s'est posé : un clic natif dans une fenêtre de jeu n'est accepté que s'il a COMMENCÉ
// dans cette fenêtre. Sinon c'est un clic fantôme : le doigt a appuyé sur un bouton du jeu (objets au sol, sac…),
// la fenêtre s'est ouverte sous lui, et le relâcher « cliquait » sur ce qui s'y trouvait (Fermer, Prendre…).
let posePointeur = null; // { zone: Element|null, t }

function boutonSous(x, y) {
  const n = document.elementFromPoint(x, y);
  const b = n && n.closest && n.closest('button, [data-tap]');
  if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return null;
  return b.closest(ZONES) ? b : null;
}

export function installerTapFiable() {
  if (installerTapFiable.fait) return; installerTapFiable.fait = true;
  document.addEventListener('pointerdown', (e) => {
    if (e.isPrimary) posePointeur = { zone: e.target && e.target.closest ? e.target.closest(ZONES) : null, t: performance.now() };
    if (e.pointerType !== 'touch' || !e.isPrimary) { depart = null; return; }
    const b = boutonSous(e.clientX, e.clientY);
    depart = b ? { x: e.clientX, y: e.clientY, id: e.pointerId, t: performance.now() } : null;
  }, true);
  document.addEventListener('pointercancel', () => { depart = null; }, true);
  document.addEventListener('pointerup', (e) => {
    const d = depart; depart = null;
    if (!d || e.pointerId !== d.id) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > SEUIL || performance.now() - d.t > 3000) return;   // un appui long compte aussi
    // Le bouton SOUS LE DOIGT maintenant (même s'il a été recréé entre-temps).
    const b = boutonSous(e.clientX, e.clientY);
    if (!b) return;
    synthetique = { el: b, t: performance.now(), x: e.clientX, y: e.clientY };
    b.click();
  }, true);
  // Pas de menu du navigateur sur un appui long dans une fenêtre de jeu.
  document.addEventListener('contextmenu', (e) => { if (e.target && e.target.closest && e.target.closest(ZONES)) e.preventDefault(); }, true);
  // Le click natif qui suit notre déclenchement est ignoré (pas de double action).
  document.addEventListener('click', (e) => {
    if (e.isTrusted && e.detail > 0 && posePointeur && !posePointeur.zone && e.target && e.target.closest && e.target.closest(ZONES)) {
      e.stopImmediatePropagation(); e.preventDefault(); return;   // clic fantôme (voir posePointeur)
    }
    const s = synthetique;
    if (!s || !e.isTrusted) return;
    if (performance.now() - s.t > 700) { synthetique = null; return; }
    if (Math.hypot((e.clientX || s.x) - s.x, (e.clientY || s.y) - s.y) > 30) return;
    synthetique = null;
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);
}
