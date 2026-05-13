// Service Worker Mínimo para PWA
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Apenas repassa as requisições (pode ser usado para cache no futuro)
  e.respondWith(fetch(e.request));
});
