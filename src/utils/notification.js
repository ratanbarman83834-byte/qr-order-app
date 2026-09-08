// Browser se Notification Permission lene ke liye

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
}


// Local Instant Notification dikhane ke liye
// Mobile/PWA compatible version

export async function showNotification(title, body) {
  try {
    if (!("Notification" in window)) {
      console.log("Notifications are not supported");
      return false;
    }

    if (Notification.permission !== "granted") {
      console.log("Notification permission is not granted");
      return false;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker is not supported");
      return false;
    }

    // Existing service worker registration check karo
    let registration = await navigator.serviceWorker.getRegistration();

    // Agar registration nahi hai to Firebase messaging service worker register karo
    if (!registration) {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
    }

    // Service worker active hone ka wait
    await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      body: body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    });

    return true;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return false;
  }
}