export const dynamic = 'force-static';

const serviceWorker = `
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
`;

export function GET() {
  return new Response(serviceWorker, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Service-Worker-Allowed': '/',
    },
  });
}
