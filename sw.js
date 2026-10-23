// Funciona offline: guarda os arquivos do app e sempre busca a versão nova quando tiver internet.
const CACHE = "meu-ponto-v6";
const FILES = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  // cache: "reload" ignora o cache do navegador, pra não guardar uma versão velha
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => c.put(f, r)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const mesmoSite = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request, mesmoSite ? { cache: "no-cache" } : undefined).then(r => {
      if (r.ok && mesmoSite) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
