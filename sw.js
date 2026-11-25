const V = 'agentic-sdlc-lab-v12';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const isPage = r.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(r.url).pathname);
  if (isPage) {
    // network-first so updates show up as soon as you are online; cache only as offline fallback
    e.respondWith(fetch(r, {cache: 'no-cache'}).then(res => {
      const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res;
    }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res;
  })));
});
