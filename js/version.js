// ============ Porte de version (mise à jour forcée pour le jeu EN LIGNE) ============
// Le jeu est hébergé sur GitHub Pages, redéployé à chaque push sur master ; chaque
// déploiement écrit le hash du commit dans version.json ET dans version_build.js.
//
//   BUILD_SHA          = la version DU CODE qui tourne (gelée dans le bundle en cache).
//   version.json (web) = la dernière version déployée.
//
// Si les deux diffèrent, une mise à jour est disponible. On l'IMPOSE seulement avant de
// jouer EN LIGNE : le solo et le co-op « même Wi-Fi » ne sont jamais bloqués.
import { BUILD_SHA } from './version_build.js';

export function versionLocale() { return BUILD_SHA; }

// Lit la dernière version publiée (réseau d'abord, jamais le cache du navigateur).
export async function versionEnLigne() {
  const r = await fetch('./version.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('version.json indisponible');
  const j = await r.json();
  return String(j.sha || '');
}

// true s'il faut mettre à jour avant de jouer en ligne. En cas de doute (hors-ligne,
// build local 'dev', version.json injoignable) on NE bloque PAS : renvoie false.
export async function majDisponible() {
  const locale = versionLocale();
  if (!locale || locale === 'dev') return false; // build local non déployé : jamais bloquer
  try {
    const enligne = await versionEnLigne();
    return !!enligne && enligne !== 'dev' && enligne !== locale;
  } catch (e) { return false; }
}

// Recharge sur la dernière version. Le service worker (réseau d'abord) re-télécharge
// tout le bundle au rechargement ; on force d'abord une vérification du worker.
export async function appliquerMaj() {
  try {
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) await reg.update();
  } catch (e) {}
  location.reload();
}
