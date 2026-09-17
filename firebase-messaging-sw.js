// Firebase Cloud Messaging service worker for the VMC Biomedical app.
// Must live at the ROOT of this site (not a subfolder) so its default
// scope covers the whole origin — this is what lets it receive push
// events and show OS-level notifications even when the app itself
// isn't open in any tab. Uses the "compat" SDK build (not the modular
// one the main app uses) since service workers can't easily use
// dynamic ES module imports in the same way a normal page can, and
// Firebase's compat build is specifically designed to work via plain
// importScripts() here.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLHHgmqM_8c3q_a6__Zq-l7lfpvjLiaB4",
  authDomain: "vmc-biomed-chat.firebaseapp.com",
  databaseURL: "https://vmc-biomed-chat-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "vmc-biomed-chat",
  storageBucket: "vmc-biomed-chat.firebasestorage.app",
  messagingSenderId: "662980281608",
  appId: "1:662980281608:web:83cb3f2968f97cd40ed8bd"
});

var messaging = firebase.messaging();

// Fires when a push arrives while the app is NOT the focused tab (or
// isn't open at all) — this is the actual "phone lock screen"
// notification case. When the app IS focused/open, Chrome/the OS
// suppresses this in favor of the page's own in-app UI, which is the
// correct, standard behavior (no double notification for something
// you're already looking at).
messaging.onBackgroundMessage(function(payload){
  var title = (payload.notification && payload.notification.title) || 'VMC Biomedical';
  var body = (payload.notification && payload.notification.body) || '';
  var link = (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.link) || '/';
  self.registration.showNotification(title, {
    body: body,
    icon: 'https://lh3.googleusercontent.com/d/1MZ5Ox1X0VJegn0tnkV5roNNgoHxWDfuh',
    badge: 'https://lh3.googleusercontent.com/d/1MZ5Ox1X0VJegn0tnkV5roNNgoHxWDfuh',
    data: { link: link }
  });
});

// Tapping the notification focuses an already-open tab if one exists,
// or opens a new one otherwise — standard, expected notification-click
// behavior.
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList){
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
