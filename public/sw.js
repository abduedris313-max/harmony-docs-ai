/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Harmony DocAI Service Worker
 */

const CACHE_NAME = 'harmony-docai-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Always fetch fresh from network for API, Vite scripts, and development assets
  if (
    event.request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('/@') ||
    url.includes('.tsx') ||
    url.includes('.ts') ||
    url.includes('hot-update') ||
    url.includes('vite')
  ) {
    return;
  }

  // Network first strategy with offline fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

