/* eslint-disable no-undef */
// This service worker handles push notifications that arrive while the
// owner's browser tab is in the background or closed. It must be served
// from the site root (not /src) so its scope covers the whole origin.
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// Service workers can't read Vite's import.meta.env, so these values are
// injected at build time by scripts/injectSwEnv.mjs (see package.json "build"
// step in the README) — or you can hardcode your project's public config
// here directly, since these are non-secret client identifiers.
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || "__VITE_FIREBASE_API_KEY__",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "__VITE_FIREBASE_AUTH_DOMAIN__",
  projectId: self.FIREBASE_PROJECT_ID || "__VITE_FIREBASE_PROJECT_ID__",
  storageBucket: self.FIREBASE_STORAGE_BUCKET || "__VITE_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
  appId: self.FIREBASE_APP_ID || "__VITE_FIREBASE_APP_ID__",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "New order received", {
    body: body || "Open the dashboard to view it.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const orderId = event.notification.data?.orderId;
  const url = orderId ? `/admin/orders?highlight=${orderId}` : "/admin/orders";
  event.waitUntil(clients.openWindow(url));
});
