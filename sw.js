const CACHE = 'busan-lanka-v3-2-mobile-20261116';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./data.js','./content-store.js','./supabase-config.js','./theme-v2.css','./responsive-v3-2.css','./admin.html','./admin.js','./admin.css','./ai-service.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/logo-mark.jpg','./assets/sigiriya.jpg','./assets/hero-hills.jpg','./assets/ella.jpg','./assets/kandy.jpg','./assets/mirissa.jpg','./assets/yala.jpg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin||event.request.url.includes('/.netlify/'))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone));}return response;}).catch(()=>caches.match(event.request)));
});
