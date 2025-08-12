self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data && event.data.command === 'showNotification') {
    self.registration.showNotification('Timer', {
      body: event.data.message,
      icon: 'icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'timer-notification'
    });
  }
});
