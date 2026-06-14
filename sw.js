// ============ Service worker — jeu jouable hors-ligne (PWA) ============
const CACHE = 'onemoreday-v12';
const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './js/main.js',
  './js/version.js',
  './js/version_build.js',
  './js/data/serveur.js',
  './js/state.js',
  './js/ui.js',
  './js/net.js',
  './js/multi.js',
  './js/icons.js',
  './js/world.js',
  './js/inventory.js',
  './js/survival.js',
  './js/crafting.js',
  './js/combat.js',
  './js/map.js',
  './js/scenes.js',
  './js/effects.js',
  './js/audio.js',
  './js/illustrations.js',
  './js/zombies_map.js',
  './js/ambiance.js',
  './js/cinema.js',
  './js/art/scenes_art.js',
  './js/art/combat_art.js',
  './js/art/ambiance_lib.js',
  './js/art/ambiances/index.js',
  './js/art/ambiances/int_hotel.js',
  './js/art/ambiances/q_centre.js',
  './js/art/ambiances/int_casino.js',
  './js/art/ambiances/int_eglise.js',
  './js/art/ambiances/int_nostradamus.js',
  './js/art/ambiances/int_emperi.js',
  './js/art/ambiances/q_cours.js',
  './js/art/ambiances/q_gare.js',
  './js/art/ambiances/int_gare.js',
  './js/art/ambiances/ville_salon.js',
  './js/art/ambiances/int_pharmacie.js',
  './js/art/ambiances/int_decathlon.js',
  './js/art/ambiances/int_mediatheque.js',
  './js/art/ambiances/int_cineplanet.js',
  './js/art/ambiances/int_hopital.js',
  './js/art/ambiances/int_commissariat.js',
  './js/art/ambiances/int_leclerc.js',
  './js/art/ambiances/int_weldom.js',
  './js/art/ambiances/int_garage.js',
  './js/art/ambiances/int_caserne.js',
  './js/art/ambiances/region.js',
  './js/art/ambiances/q_miramas_vieux.js',
  './js/art/ambiances/q_triage.js',
  './js/art/ambiances/int_refuge.js',
  './js/art/panoramas/index.js',
  './js/art/panoramas/sortie_hotel.js',
  './js/art/panoramas/gare.js',
  './js/art/panoramas/miramas.js',
  './js/art/panoramas/salon_avant.js',
  './js/art/panoramas/salon_chaos.js',
  './js/art/panoramas/clocher.js',
  './js/art/panoramas/premiere_nuit.js',
  './js/art/panoramas/hopital.js',
  './js/art/panoramas/emperi.js',
  './js/art/panoramas/depart_train.js',
  './js/art/panoramas/refuge_miramas.js',
  './js/data/items.js',
  './js/data/clothing.js',
  './js/data/recipes.js',
  './js/data/zombies.js',
  './js/data/world.js',
  './js/data/cartes_salon_centre.js',
  './js/data/cartes_salon_quartiers.js',
  './js/data/cartes_salon_ville.js',
  './js/data/cartes_salon_interieurs.js',
  './js/data/cartes_region.js',
  './js/data/events.js',
  './js/data/events_rue.js',
  './js/data/events_interieur.js',
  './js/data/events_parc.js',
  './js/data/story.js',
  './js/data/story_train.js',
  './js/data/story_ch2.js',
  './js/data/cartes_miramas.js',
  './js/data/soundscapes.js',
  './js/data/cinematiques.js',
  './js/data/musiques.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour récupérer les mises à jour), cache en secours (hors-ligne)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(rep => {
        const copie = rep.clone();
        caches.open(CACHE).then(c => c.put(e.request, copie)).catch(() => {});
        return rep;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
