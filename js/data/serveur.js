// ============ Serveur co-op EN LIGNE ============
// Adresse du relais permanent, exposé en ws:// ou wss:// (méthode au choix de l'hébergeur :
// voir hosting-readmy.txt). Tant que c'est VIDE, seul le co-op « même Wi-Fi » est proposé.
//
// Une fois le tunnel en place, colle ici l'adresse WebSocket, suffixe « /ws » inclus :
//   export const SERVEUR_EN_LIGNE = 'wss://onemoreday.ton-domaine.net/ws';
//
// Le site Satigny est servi en HTTP, donc le relais permanent utilise ws://.
// Si le site passe en HTTPS, remplacer par wss://Satigny.giize.com/ws.
export const SERVEUR_EN_LIGNE = 'ws://Satigny.giize.com/ws';