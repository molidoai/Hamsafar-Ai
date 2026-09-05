const CACHE = "hamsafar-032";
const FILES = ["./index.html","./styles.css","./map.html","./trip.html","./sos.html","./speed.html","./family.html","./plans.html","./security.html","./offline-vault.js","./more.html","./checklist.html","./journal.html"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); });
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match("./index.html"))));
});
