// ============ Mini serveur statique (Node, sans dépendance) ============
// Sert le jeu sur le PC et sur le réseau local (pour Android).
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
  console.log('  Ctrl+C pour arrêter.');
});
