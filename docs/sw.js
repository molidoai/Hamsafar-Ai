const CACHE="hamsafar-041";
const FILES=["./index.html","./styles.css","./access.js","./more.html"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("fetch",e=>{
  const u=e.request.url;
  if(u.includes("update.json")){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
});
