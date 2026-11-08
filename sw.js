// 예전 블로그(Chirpy PWA)의 서비스 워커를 대신하는 정리용 워커.
// 이미 블로그를 방문했던 브라우저가 옛 캐시를 계속 보여 주지 않도록, 캐시를 지우고 스스로 등록을 해제한다.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (clients) { clients.forEach(function (c) { c.navigate(c.url); }); })
  );
});
