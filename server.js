// ============ Mini serveur statique (Node, sans dépendance) ============
// Sert le jeu sur le PC et sur le réseau local (pour Android).
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = process.env.PORT || 8420;
const RACINE = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
};

// Adresses IPv4 locales (pour afficher l'adresse à taper sur le téléphone)
function adressesLan() {
  const res = [];
  const ifaces = os.networkInterfaces();
  for (const nom of Object.keys(ifaces)) {
    for (const inf of ifaces[nom]) {
      if (inf.family === 'IPv4' && !inf.internal) res.push(inf.address);
    }
  }
  return res;
}

const serveur = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  if (url === '/api/lan') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ port: PORT, ips: adressesLan() }));
    return;
  }
  const fichier = path.normalize(path.join(RACINE, url));
  if (!fichier.startsWith(RACINE)) { res.writeHead(403); res.end('Interdit'); return; }
  fs.readFile(fichier, (err, data) => {
    if (err) { res.writeHead(404); res.end('Introuvable : ' + url); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(fichier).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

// ============ Relais WebSocket co-op (sans dépendance) ============
// Le serveur ne fait QUE du rendez-vous + relais : deux navigateurs rejoignent
// un même « salon » (par un code) et tout message de l'un est transmis à l'autre.
// Toute la logique de jeu reste côté navigateur de l'hôte (autoritaire). Demain,
// pour jouer en ligne, il suffira d'héberger CE serveur quelque part.
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const salons = new Map(); // code -> [sockets]

function wsAccept(key) {
  return crypto.createHash('sha1').update(key + WS_GUID).digest('base64');
}
function encoderFrame(payload, opcode = 0x1) {
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[1] = len; }
  else if (len < 65536) { header = Buffer.alloc(4); header[1] = 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[1] = 127; header.writeUInt32BE(Math.floor(len / 4294967296), 2); header.writeUInt32BE(len >>> 0, 6); }
  header[0] = 0x80 | opcode; // FIN + opcode
  return Buffer.concat([header, payload]);
}
function envoyerWs(socket, obj) {
  try { socket.write(encoderFrame(Buffer.from(JSON.stringify(obj), 'utf8'), 0x1)); } catch (e) {}
}
function relayer(socket, txt) {
  const code = socket.wsState && socket.wsState.salon;
  if (!code) return;
  const salon = salons.get(code);
  if (!salon) return;
  for (const s of salon) if (s !== socket) { try { s.write(encoderFrame(Buffer.from(txt, 'utf8'), 0x1)); } catch (e) {} }
}
// Lit une trame complète depuis le tampon, ou null s'il en manque encore.
function lireFrame(buf) {
  if (buf.length < 2) return null;
  const b0 = buf[0], b1 = buf[1];
  const fin = (b0 & 0x80) !== 0;
  const opcode = b0 & 0x0f;
  const masked = (b1 & 0x80) !== 0;
  let len = b1 & 0x7f;
  let off = 2;
  if (len === 126) { if (buf.length < off + 2) return null; len = buf.readUInt16BE(off); off += 2; }
  else if (len === 127) { if (buf.length < off + 8) return null; len = buf.readUInt32BE(off) * 4294967296 + buf.readUInt32BE(off + 4); off += 8; }
  let mask = null;
  if (masked) { if (buf.length < off + 4) return null; mask = buf.slice(off, off + 4); off += 4; }
  if (buf.length < off + len) return null;
  let payload = buf.slice(off, off + len);
  if (masked) { const out = Buffer.alloc(len); for (let i = 0; i < len; i++) out[i] = payload[i] ^ mask[i & 3]; payload = out; }
  return { fin, opcode, payload, taille: off + len };
}
function onWsData(socket, data) {
  const st = socket.wsState;
  st.buf = Buffer.concat([st.buf, data]);
  let frame;
  while ((frame = lireFrame(st.buf))) {
    st.buf = st.buf.slice(frame.taille);
    if (frame.opcode === 0x8) { quitterSalon(socket); try { socket.end(); } catch (e) {} return; } // close
    if (frame.opcode === 0x9) { try { socket.write(encoderFrame(frame.payload, 0xA)); } catch (e) {} continue; } // ping→pong
    if (frame.opcode === 0xA) continue; // pong
    if (frame.opcode === 0x1 || frame.opcode === 0x0) { // texte (+ continuations)
      if (frame.opcode === 0x1 || !st.frag) st.frag = [];
      st.frag.push(frame.payload);
      if (frame.fin) { const txt = Buffer.concat(st.frag).toString('utf8'); st.frag = null; traiterWs(socket, txt); }
    }
  }
}
function traiterWs(socket, txt) {
  let msg; try { msg = JSON.parse(txt); } catch (e) { return; }
  const st = socket.wsState;
  if (msg.t === 'hello') {
    let code = String(msg.salon || '').toUpperCase().slice(0, 8);
    let salon;
    if (msg.role === 'host') {
      if (!code) { envoyerWs(socket, { t: 'erreur', raison: 'Code de salon vide.' }); return; }
      salon = salons.get(code);
      if (salon && salon.some(s => s.wsState.role === 'host')) { envoyerWs(socket, { t: 'erreur', raison: 'Ce code est déjà hébergé.' }); return; }
      if (!salon) { salon = []; salons.set(code, salon); }
      st.role = 'host';
    } else {
      // Invité : sans code, on rejoint DIRECTEMENT la (seule) partie ouverte sur ce
      // serveur — plus besoin de code en LAN. Avec un code, on vise ce salon précis
      // (utile si plusieurs hôtes tournaient sur le même serveur).
      if (!code) {
        for (const [c, s] of salons) { if (s.some(x => x.wsState.role === 'host') && s.length < 2) { code = c; break; } }
        if (!code) { envoyerWs(socket, { t: 'erreur', raison: 'Aucune partie ouverte. Demande à l\'autre joueur d\'héberger d\'abord.' }); return; }
      }
      salon = salons.get(code);
      if (!salon || !salon.some(s => s.wsState.role === 'host')) { envoyerWs(socket, { t: 'erreur', raison: 'Aucune partie à rejoindre.' }); return; }
      if (salon.length >= 2) { envoyerWs(socket, { t: 'erreur', raison: 'La partie est déjà complète.' }); return; }
      st.role = 'guest';
    }
    salon.push(socket);
    st.salon = code;
    st.nom = String(msg.nom || '').slice(0, 16);
    if (socket._joinTimer) { clearTimeout(socket._joinTimer); socket._joinTimer = null; }
    const autres = salon.filter(s => s !== socket);
    envoyerWs(socket, { t: 'bienvenue', role: st.role, code, pair: autres.length > 0, nomPair: autres[0] ? autres[0].wsState.nom : null });
    autres.forEach(s => envoyerWs(s, { t: 'pair-arrive', role: st.role, nom: st.nom }));
    return;
  }
  relayer(socket, txt); // tout le reste : transmis tel quel au pair
}
function quitterSalon(socket) {
  const st = socket.wsState;
  if (!st) return;
  if (socket._joinTimer) { clearTimeout(socket._joinTimer); socket._joinTimer = null; }
  const code = st.salon;
  if (!code) return;
  st.salon = null;
  const salon = salons.get(code);
  if (!salon) return;
  const i = salon.indexOf(socket);
  if (i >= 0) salon.splice(i, 1);
  for (const s of salon) envoyerWs(s, { t: 'pair-parti', role: st.role });
  if (!salon.length || st.role === 'host') { // l'hôte part : le salon ferme
    for (const s of salon) { try { s.end(); } catch (e) {} }
    salons.delete(code);
  }
}
serveur.on('upgrade', (req, socket) => {
  if ((req.url.split('?')[0]) !== '/ws') { socket.destroy(); return; }
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  socket.write([
    'HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade',
    'Sec-WebSocket-Accept: ' + wsAccept(key), '\r\n',
  ].join('\r\n'));
  socket.setNoDelay(true);
  socket.wsState = { buf: Buffer.alloc(0), salon: null, role: null, nom: null, frag: null };
  socket.on('data', (d) => { try { onWsData(socket, d); } catch (e) { try { socket.destroy(); } catch (e2) {} } });
  socket.on('close', () => quitterSalon(socket));
  socket.on('error', () => quitterSalon(socket));
  socket._joinTimer = setTimeout(() => { if (!socket.wsState.salon) { try { socket.destroy(); } catch (e) {} } }, 30000);
});
// Battement régulier : garde les connexions ouvertes (NAT/proxies, utile en ligne).
setInterval(() => {
  for (const salon of salons.values()) for (const s of salon) { try { s.write(encoderFrame(Buffer.alloc(0), 0x9)); } catch (e) {} }
}, 25000);

serveur.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('');
    console.log(`  Le jeu tourne déjà sur ce PC (port ${PORT} occupé).`);
    console.log(`  Ouvre simplement http://localhost:${PORT} dans ton navigateur.`);
    console.log('');
    process.exit(0);
  }
  throw err;
});

serveur.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║            ONE MORE DAY — serveur            ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Sur ce PC      : http://localhost:${PORT}`);
  const ifaces = os.networkInterfaces();
  for (const nom of Object.keys(ifaces)) {
    for (const inf of ifaces[nom]) {
      if (inf.family === 'IPv4' && !inf.internal) {
        console.log(`  Sur Android    : http://${inf.address}:${PORT}   (même Wi-Fi)`);
      }
    }
  }
  console.log('');
  console.log('  Android : ouvre l\'adresse dans Chrome, puis menu ⋮ → « Ajouter à l\'écran d\'accueil »');
  console.log('  pour installer le jeu comme une application (PWA).');
  console.log('');
  console.log('  Co-op (2 joueurs, même Wi-Fi) : l\'hôte crée la partie et donne son');
  console.log('  adresse + le code de salon ; l\'autre choisit « Rejoindre une partie ».');
  console.log('');
  console.log('  Ctrl+C pour arrêter.');
});
