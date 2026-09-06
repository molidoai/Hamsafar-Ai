const CACHE="hamsafar-040";
const FILES=["./index.html","./styles.css","./access.js","./more.html","./plans.html","./seasons.html","./android.html","./update.html","./help.html","./about.html","./backup.html","./security.html","./offline-vault.js","./trip.html","./map.html","./sos.html","./family.html"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return res;}).catch(()=>caches.match("./index.html"))));});
