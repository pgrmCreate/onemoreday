// ============ Préférences du joueur (hors partie) ============
const CLE = 'omd_prefs_v3';
const DEFAUT = { volume: 0.6, muet: false, zoom: 1, vibrations: true, sousTitres: true, difficulte: 'normal', joystickGauche: true };
let prefs = { ...DEFAUT };
try { prefs = { ...DEFAUT, ...(JSON.parse(localStorage.getItem(CLE) || '{}')) }; } catch (e) {}
export function pref(k) { return prefs[k]; }
export function setPref(k, v) { prefs[k] = v; try { localStorage.setItem(CLE, JSON.stringify(prefs)); } catch (e) {} }
