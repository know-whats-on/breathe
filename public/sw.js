const CACHE_NAME = "breathe-shell-v2";
const CACHE_PREFIX = "breathe-shell-";
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icons/app-icon.svg"];

function isIgnoredRequest(request, url) {
  return (
    request.cache === "only-if-cached" && request.mode !== "same-origin"
  ) || (
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/@vite/") ||
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.endsWith(".map") ||
    url.pathname === "/sw.js" ||
    url.searchParams.has("import")
  );
}

function isStaticAssetRequest(url) {
  return (
    CORE_ASSETS.includes(url.pathname) ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/recovery-") ||
    url.pathname.startsWith("/do-your-five")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isIgnoredRequest(request, url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("/index.html") || caches.match("/"))
    );
    return;
  }

  if (!isStaticAssetRequest(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
