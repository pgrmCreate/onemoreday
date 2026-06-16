// ============ Journal de session écrit dans un fichier (dossier log/) ============
// Pour CHAQUE partie (solo OU multijoueur), le serveur local crée un fichier texte
// DATÉ dans log/ et y ajoute les lignes au fil du jeu. Le navigateur les envoie par
// paquets (POST /api/log) à la même origine. EN LIGNE (GitHub Pages, pas de serveur
// Node), l'envoi échoue en silence : le jeu n'est jamais bloqué ni ralenti par les logs.
import { G, heureTxt, setJournalSink } from './state.js';

let session = null;     // { id, buffer:[], timer }
let beaconPose = false; // écouteur de fermeture d'onglet posé une seule fois

function d2(n) { return String(n).padStart(2, '0'); }
function horodatage() {
  const d = new Date();
  return `${d.getFullYear()}-${d2(d.getMonth() + 1)}-${d2(d.getDate())}_${d2(d.getHours())}-${d2(d.getMinutes())}-${d2(d.getSeconds())}`;
}
function heureReelle() {
  const d = new Date();
  return `${d2(d.getHours())}:${d2(d.getMinutes())}:${d2(d.getSeconds())}`;
}
function sain(s) { return String(s || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 60); }

// Démarre une nouvelle session de log. meta = { mode:'solo'|'multi', role, code, nom }
export function demarrerLog(meta = {}) {
  finirLog('nouvelle partie'); // clôt proprement une éventuelle session précédente
  const mode = meta.mode === 'multi' ? 'multi' : 'solo';
  let suffixe = mode;
  if (mode === 'multi') suffixe += '-' + (meta.role === 'guest' ? 'invite' : 'hote') + (meta.code ? '-' + sain(meta.code) : '');
  // L'id de session DEVIENT le nom du fichier : <date>_<heure>_<mode>.txt
  session = { id: `${horodatage()}_${sain(suffixe)}`, buffer: [], timer: null };
  logLigne(`===== ONE MORE DAY — session ${mode}${meta.code ? ' (salon ' + meta.code + ')' : ''} =====`);
  if (meta.nom) logLigne(`Joueur : ${meta.nom}` + (G && G.world ? ` · graine ${G.world.seed}` : ''));
  // Battement d'envoi régulier (4 s) : les lignes en attente partent vers le serveur local.
  session.timer = setInterval(envoyer, 4000);
  poserBeacon();
}

// Ajoute une ligne au journal de session (préfixée de l'heure réelle + de l'heure de jeu).
export function logLigne(texte) {
  if (!session || texte == null) return;
  const enJeu = (G && G.world) ? heureTxt() : '';
  session.buffer.push(`[${heureReelle()}${enJeu ? ' · ' + enJeu : ''}] ${texte}`);
  if (session.buffer.length >= 20) envoyer();
}

function envoyer() {
  if (!session || !session.buffer.length) return;
  const lignes = session.buffer;
  session.buffer = [];
  try {
    fetch('/api/log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ session: session.id, lines: lignes }),
    }).catch(() => {}); // pas de serveur Node (en ligne) : on abandonne ces lignes sans bruit
  } catch (e) {}
}

// Clôt la session : dernière ligne + envoi de dernière chance (sendBeacon à la fermeture).
export function finirLog(raison) {
  if (!session) return;
  logLigne(`===== fin de session${raison ? ' — ' + raison : ''} =====`);
  if (session.timer) { clearInterval(session.timer); session.timer = null; }
  const lignes = session.buffer;
  session.buffer = [];
  if (lignes.length) {
    const corps = JSON.stringify({ session: session.id, lines: lignes });
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) navigator.sendBeacon('/api/log', new Blob([corps], { type: 'application/json' }));
      else fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corps, keepalive: true }).catch(() => {});
    } catch (e) {}
  }
  session = null;
}

export function logActif() { return !!session; }

function poserBeacon() {
  if (beaconPose || typeof window === 'undefined') return;
  beaconPose = true;
  // À la fermeture de l'onglet / passage en arrière-plan : on pousse ce qui reste.
  window.addEventListener('pagehide', () => finirLog('fermeture'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') envoyer(); });
}

// Le journal NARRATIF (noteJournal) alimente aussi le fichier de session, sans couplage :
// state.js appelle ce puits quand il existe. logLigne ne fait rien tant qu'aucune session
// n'est ouverte, donc l'enregistrer ici au chargement est sans risque.
setJournalSink((texte) => logLigne('» ' + texte));
