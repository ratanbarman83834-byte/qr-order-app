import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { app, db } from "./config";

/**
 * Registers the current browser for push notifications and stores the FCM
 * device token on the owner's user document so the "onOrderCreated" Cloud
 * Function can look it up and send a push when a new order comes in.
 *
 * Returns "granted" | "denied" | "unsupported" | "error" so the UI can show
 * the right fallback message (see NOTIFICATION FALLBACK in the README).
 */
export async function registerOwnerForPush(ownerUid) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return "unsupported";

  if (!("Notification" in window)) return "unsupported";

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return "denied";

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return "error";

    await setDoc(
      doc(db, "ownerDevices", ownerUid),
      { tokens: arrayUnion(token), updatedAt: new Date().toISOString() },
      { merge: true }
    );

    return "granted";
  } catch (err) {
    console.error("Push registration failed:", err);
    return "error";
  }
}

/** Listens for pushes that arrive while the admin tab is focused. */
export async function listenForForegroundOrders(callback) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return () => {};
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => callback(payload));
}
