# Déploiement — *One More Day* en ligne + app Android

Ce guide explique comment **publier le jeu**, **faire tourner le serveur co-op permanent**,
et **construire l'application Android**. La partie « code » est déjà en place (voir la fin) ;
il reste les étapes **manuelles** ci-dessous, dans l'ordre.

> Vue d'ensemble
> - Le **jeu** est hébergé sur **GitHub Pages**, redéployé **automatiquement à chaque push sur `master`**.
> - L'**app Android** est une coquille (**TWA**) qui ouvre cette URL → mises à jour automatiques.
> - Le **co-op en ligne** passe par le **serveur de ton frère** (`server.js`), joignable en `wss://`.
> - Avant une partie **en ligne**, le jeu **vérifie la version** et **force la mise à jour** si besoin.

---

## 1. Activer GitHub Pages (une seule fois)

1. Sur GitHub : dépôt **`onemoreday`** → **Settings** → **Pages**.
2. **Build and deployment → Source** : choisir **GitHub Actions**.
3. C'est tout. Au prochain push sur `master`, le workflow `.github/workflows/pages.yml`
   publie le jeu. L'URL sera :

   ```
   https://pgrmcreate.github.io/onemoreday/
   ```

> Chaque déploiement grave le hash du commit dans `version.json` et `js/version_build.js` :
> c'est ce qui permet au jeu de **détecter** qu'une mise à jour est dispo.

---

## 2. Le serveur permanent (sur le PC de ton frère)

Le serveur (`server.js`) ne fait que le **relais** co-op (rendez-vous + transmission).
Il faut : (a) le **lancer**, (b) le rendre **joignable depuis Internet en `wss://`** (chiffré —
un jeu servi en `https` refuse un `ws://` nu).

### a) Lancer le serveur
Sur son PC (Node installé) :
```
node server.js
```
Il écoute sur le port **8420**.

### b) L'exposer en `wss://`

La **seule exigence** : le serveur doit être joignable depuis Internet en **`wss://…/ws`**
(WebSocket + TLS), car le jeu est servi en `https` (une page `https` refuse un `ws://` nu).
`server.js` ne fait pas le TLS lui-même : une couche devant lui s'en charge (tunnel,
reverse-proxy, ou hébergeur).

La **méthode est libre** — tunnel (Cloudflare, ngrok…), redirection de port + reverse-proxy
TLS (Caddy), ou hébergeur cloud (Fly.io, VPS). Les options, leurs compromis et les commandes
sont détaillés dans **`hosting-readmy.txt`** (écrit pour la personne qui héberge), qui est la
référence d'hébergement.

> Quelle que soit la méthode, le résultat à récupérer est une adresse **`wss://…/ws`** stable.

---

## 3. Brancher l'URL du serveur dans le jeu

Dans **`js/data/serveur.js`**, renseigner l'adresse `wss://…/ws` obtenue à l'étape 2 :
```js
export const SERVEUR_EN_LIGNE = 'wss://onemoreday.mon-domaine.net/ws';
```
Puis **commit + push sur `master`** : Pages redéploie, et le menu « Jouer à deux » affiche
désormais **« Héberger — en ligne »** et **« Rejoindre — en ligne »**.

> Tant que ce champ est **vide**, seul le co-op « même Wi-Fi » est proposé (rien ne change).

---

## 4. Construire l'application Android (TWA)

L'app est une coquille qui ouvre l'URL Pages. Comme le contenu vient du web, **toute mise à
jour poussée sur `master` arrive automatiquement** dans l'app au prochain lancement.

### Le plus simple : PWABuilder (pas d'outils à installer)
1. Aller sur <https://www.pwabuilder.com/> et entrer l'URL :
   `https://pgrmcreate.github.io/onemoreday/`
2. PWABuilder analyse le manifeste (déjà présent) → **Package For Stores** → **Android**.
3. Télécharger le paquet. Il contient :
   - un **APK de test** (`*-signed.apk`) à installer directement sur le téléphone ;
   - un **AAB** (`*.aab`) si un jour tu veux publier sur le Play Store.
4. Sur le téléphone : autoriser « installer des applications inconnues » pour le navigateur/
   gestionnaire de fichiers, puis ouvrir l'APK pour l'installer. L'icône **One More Day** apparaît.

> **Détail TWA** : pour supprimer la mini-barre d'adresse en haut, PWABuilder génère un fichier
> `assetlinks.json` (Digital Asset Links). Comme le site est sur `github.io` (domaine partagé),
> ce fichier n'est pas plaçable à la racine du domaine ; l'app marchera quand même, juste avec
> une fine barre. Pour un plein écran parfait, il faut héberger le jeu sur **ton propre domaine**
> (ex. celui du tunnel) et y déposer `assetlinks.json`. Optionnel.

### Alternative en ligne de commande : Bubblewrap
`npm i -g @bubblewrap/cli` puis `bubblewrap init --manifest https://pgrmcreate.github.io/onemoreday/manifest.webmanifest`
→ `bubblewrap build`. Même résultat, plus de contrôle.

---

## 5. Comment fonctionne la « porte de version » (le launcher intégré)

Pas besoin d'une 2ᵉ app : la vérification est **dans le jeu**, juste avant une partie en ligne.

- Chaque déploiement grave le hash du commit dans `version.json` (live) **et** dans
  `js/version_build.js` (= la version **du code qui tourne**, figée dans le cache).
- Quand on clique **« Héberger — en ligne »** ou **« Rejoindre — en ligne »**, le jeu compare
  les deux (`js/version.js → majDisponible()`).
- Si elles diffèrent → écran **« Mise à jour requise »** + bouton qui recharge la dernière
  version (le service worker, réseau d'abord, re-télécharge tout le bundle).
- **Le solo et le co-op « même Wi-Fi » ne sont jamais bloqués.** Hors-ligne non plus
  (impossible de jouer en ligne de toute façon).

Résultat : **dès que du code est poussé sur `master`**, un joueur qui veut jouer en ligne
avec une vieille version est obligé de se mettre à jour d'abord.

---

## Récap des fichiers ajoutés/modifiés (côté code, déjà fait)

| Fichier | Rôle |
| --- | --- |
| `.github/workflows/pages.yml` | déploie le jeu sur Pages à chaque push sur `master` + grave la version |
| `version.json`, `js/version_build.js` | tampon de version (réécrits au déploiement ; `dev` en local) |
| `js/version.js` | la porte de version (`majDisponible`, `appliquerMaj`) |
| `js/data/serveur.js` | **l'URL du serveur en ligne à renseigner** (vide par défaut) |
| `js/main.js` | choix « en ligne » dans le menu co-op + écran « Mise à jour requise » |
| `sw.js` | nouveaux modules ajoutés au cache hors-ligne (cache `v11`) |
