// ============ Couche transport co-op (WebSocket) ============
// Agnostique du lieu : par défaut on parle au serveur qui sert le jeu (même Wi-Fi),
// mais une URL explicite permet de viser un hôte EN LIGNE plus tard, sans rien changer
// au-dessus. Le serveur n'est qu'un relais : on s'annonce avec un { code, role }, puis
// tout message envoyé part vers le pair, et tout message reçu remonte via on('message').

let ws = null;
let etat = 'ferme'; // 'ferme' | 'connexion' | 'ouvert'
let infos = { role: null, code: null, pair: false, nomPair: null };
const handlers = { message: [], etat: [], pair: [] };

// L'URL par défaut = le serveur d'où vient la page (LAN). En ligne : passe une URL.
export function urlDefaut() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

// Se connecte et s'annonce. Résout { ok, infos } ou { ok:false, raison }.
export function connecter({ url, code, role, nom }) {
  deconnecter();
  url = url || urlDefaut();
  return new Promise((resolve) => {
    let regle = false;
    const finir = (v) => { if (!regle) { regle = true; resolve(v); } };
    try { ws = new WebSocket(url); } catch (e) { finir({ ok: false, raison: 'Adresse de serveur invalide.' }); return; }
    etat = 'connexion';
    ws.onopen = () => { try { ws.send(JSON.stringify({ t: 'hello', salon: code, role, nom })); } catch (e) {} };
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === 'bienvenue') {
        etat = 'ouvert';
        infos = { role: m.role, code: m.code, pair: !!m.pair, nomPair: m.nomPair || null };
        emit('etat', 'ouvert');
        emit('pair', infos.pair);
        finir({ ok: true, infos: { ...infos } });
        return;
      }
      if (m.t === 'erreur') { finir({ ok: false, raison: m.raison || 'Refusé.' }); try { ws.close(); } catch (e) {} return; }
      if (m.t === 'pair-arrive') { infos.pair = true; infos.nomPair = m.nom || null; emit('pair', true, m); return; }
      if (m.t === 'pair-parti') { infos.pair = false; emit('pair', false, m); return; }
      emit('message', m);
    };
    ws.onclose = () => { const etaitOuvert = etat === 'ouvert'; etat = 'ferme'; emit('etat', 'ferme'); finir({ ok: false, raison: etaitOuvert ? 'Connexion fermée.' : 'Impossible de joindre le serveur.' }); };
    ws.onerror = () => { /* onclose suivra et tranchera */ };
    setTimeout(() => finir({ ok: false, raison: 'Pas de réponse du serveur (vérifie l\'adresse et le Wi-Fi).' }), 6000);
  });
}

export function envoyer(obj) {
  if (ws && etat === 'ouvert') { try { ws.send(JSON.stringify(obj)); } catch (e) {} }
}
export function deconnecter() {
  if (ws) { try { ws.onclose = null; ws.close(); } catch (e) {} ws = null; }
  etat = 'ferme';
  infos = { role: null, code: null, pair: false, nomPair: null };
  // On vide les abonnés : une session suivante (multi.demarrer) réenregistrera les siens,
  // sans empiler de doublons d'une partie à l'autre dans le même onglet.
  handlers.message = []; handlers.etat = []; handlers.pair = [];
}
export function connecte() { return etat === 'ouvert'; }
export function code() { return infos.code; }
export function role() { return infos.role; }
export function pairPresent() { return infos.pair; }
export function nomPair() { return infos.nomPair; }
export function on(type, fn) { if (handlers[type]) handlers[type].push(fn); }
function emit(type, ...args) { (handlers[type] || []).forEach(fn => { try { fn(...args); } catch (e) { console.warn('net handler', e); } }); }
