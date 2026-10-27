// Cache only this repository's known static runtime; never unrelated origin data.
const PREFIX = 'lbl-arcade-' + self.registration.scope + '-';
const CACHE = PREFIX + '2';
const FILES = ['./','./index.html','./style.css','./src/game/app.mjs','./src/game/content.mjs',
  './src/game/simulation.mjs','./src/game/render.mjs','./src/game/timing.mjs','./src/game/cpu.mjs'];
const URLS = FILES.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);url.search='';
  if(event.request.method!=='GET'||!URLS.includes(url.href))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(url.href);return cached||fetch(event.request);
  }));
});
