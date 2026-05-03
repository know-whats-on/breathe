import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import { AppStateProvider } from "./app/state/AppState";
import "./styles/index.css";

const SW_CACHE_PREFIX = "breathe-shell-";
const SW_CLEANUP_VERSION = "breathe-sw-cleanup-v2";

function isLocalDevelopmentHost() {
  return ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
}

async function clearBreatheCaches() {
  if (!("caches" in window)) return;

  const keys = await window.caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(SW_CACHE_PREFIX))
      .map((key) => window.caches.delete(key))
  );
}

async function cleanupCachesOnce() {
  try {
    if (window.localStorage.getItem(SW_CLEANUP_VERSION) === "done") return;

    await clearBreatheCaches();
    window.localStorage.setItem(SW_CLEANUP_VERSION, "done");
  } catch {
    // Ignore storage cleanup failures so app boot is never blocked.
  }
}

async function unregisterServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

createRoot(document.getElementById("root")!).render(
  <AppStateProvider>
    <RouterProvider router={router} />
  </AppStateProvider>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void (async () => {
      await cleanupCachesOnce();

      if (!import.meta.env.PROD || isLocalDevelopmentHost()) {
        await unregisterServiceWorkers();
        await clearBreatheCaches();
        return;
      }

      await navigator.serviceWorker.register("/sw.js");
    })();
  });
}
