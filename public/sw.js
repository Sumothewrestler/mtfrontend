// public/sw.js
self.addEventListener('push', function (event) {
    const data = event.data.json();
    const title = data.title || "Reminder";
    const options = {
      body: data.body || "Check your daily report!",
      icon: '/icon-192x192.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  